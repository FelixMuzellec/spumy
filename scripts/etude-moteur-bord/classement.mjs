// Phase 6 V3 — règle de classement PROPOSÉE (référentiel § 9.1.6 et § 9.1.7), sans score composite. Hors application :
// elle sert à écrire le contrat et à le tester. Les seuils marqués « provisoire » restent À DÉCIDER après la phase 8.

export const TRAJET_MAX_MIN = 60;        // V3-007, VALIDÉE : 60 min de route réelle au plus, en BORD seulement
export const PROCHE_MIN = 15;            // Q5, VALIDÉE : une place du Top 3 réservée à un spot à 15 min ou moins
export const AFFICHES = 3, AFFICHES_MAX = 5;   // § 9.1.7 : trois, étendus à quatre ou cinq en cas d'égalité stricte

const NON_RECOMMANDE = new Set(["DANGER", "BLOCKED"]);

/**
 * spots : [{ id, securite: "SAFE"|"CAUTION"|"DANGER"|"BLOCKED"|"INSUFFICIENT_DATA", aVerifier, accesFerme, interdit,
 *            trajetMin, fav (entier ou null), confiance }]
 * Renvoie { documentes, aVerifier, nonRecommandes, exclus, top, autresAEgalite }.
 * La Confiance n'est jamais lue pour l'éligibilité ni pour l'ordre (§ 9.1 ; V3-006).
 */
export function classer(spots, { trajetMax = TRAJET_MAX_MIN } = {}) {
  const nonRecommandes = [], exclus = [], documentes = [], aVerifier = [];
  for (const s of spots) {
    if (NON_RECOMMANDE.has(s.securite)) { nonRecommandes.push({ id: s.id, raison: `sécurité ${s.securite}` }); continue; }
    if (s.accesFerme) { exclus.push({ id: s.id, raison: "accès fermé" }); continue; }
    if (s.interdit) { exclus.push({ id: s.id, raison: "pêche interdite au poste" }); continue; }
    if (!(s.trajetMin <= trajetMax)) { exclus.push({ id: s.id, raison: s.trajetMin == null ? "trajet inconnu" : `trajet ${s.trajetMin} min > ${trajetMax}` }); continue; }
    // INSUFFICIENT_DATA ne vaut jamais SAFE ; CAUTION est rangé avec « à vérifier » (provisoire, À DÉCIDER).
    (s.securite === "SAFE" && !s.aVerifier ? documentes : aVerifier).push(s);
  }
  const ordre = (a, b) => ((b.fav ?? -1) - (a.fav ?? -1)) || ((a.trajetMin ?? 999) - (b.trajetMin ?? 999)) || String(a.id).localeCompare(String(b.id));
  documentes.sort(ordre); aVerifier.sort(ordre);
  // Top : parmi les spots documentés et notés ; égalité stricte au dernier rang retenu : jusqu'à cinq.
  const notes = documentes.filter((s) => s.fav != null);
  let top = notes.slice(0, AFFICHES);
  if (top.length === AFFICHES) {
    const dernier = top[AFFICHES - 1].fav;
    const egaux = notes.slice(AFFICHES).filter((s) => s.fav === dernier);
    top = [...top, ...egaux.slice(0, AFFICHES_MAX - AFFICHES)];
  }
  // Place réservée (Q5) : si aucun spot du Top 3 n'est à 15 min ou moins, le meilleur spot documenté proche prend la
  // troisième place, sans bonus de Favorabilité et sans changer sa note.
  if (top.length >= AFFICHES && !top.slice(0, AFFICHES).some((s) => s.trajetMin <= PROCHE_MIN)) {
    const proche = notes.find((s) => s.trajetMin <= PROCHE_MIN && !top.includes(s));
    if (proche) top = [...top.slice(0, AFFICHES - 1), { ...proche, placeReservee: true }];
  }
  const dernierFav = top.length ? top[top.length - 1].fav : null;
  const autresAEgalite = notes.filter((s) => !top.some((t) => t.id === s.id) && s.fav === dernierFav && top.length === AFFICHES_MAX).map((s) => s.id);
  return { documentes, aVerifier, nonRecommandes, exclus, top, autresAEgalite };
}
