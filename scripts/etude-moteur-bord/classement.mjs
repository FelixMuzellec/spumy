// Phase 6 V3 — règle de classement PROPOSÉE (référentiel § 9.1.6 et § 9.1.7), sans score composite. Hors application :
// elle sert à écrire le contrat et à le tester. Les choix marqués « provisoire » restent À DÉCIDER après la phase 8.

export const TRAJET_MAX_MIN = 60;        // V3-007, VALIDÉE : 60 min de route au plus, en BORD seulement
export const PROCHE_MIN = 15;            // V3-016, VALIDÉE : une place du Top 3 pour un spot à 15 min ou moins de route vérifiée
export const AFFICHES = 3, AFFICHES_MAX = 5;   // § 9.1.7 : trois, étendus à quatre ou cinq en cas d'égalité stricte

const NON_RECOMMANDE = new Set(["DANGER", "BLOCKED"]);

/**
 * spots : [{ id, securite: "SAFE"|"CAUTION"|"DANGER"|"BLOCKED"|"INSUFFICIENT_DATA", aVerifier, accesFerme, interdit,
 *            trajetMin, trajetVerifie, fav (valeur de rang, entier ou null), confiance }]
 * `fav` est la valeur qui sert au rang : la borne basse de l'intervalle de Favorabilité (provisoire, 01-CONTRAT § 4),
 * égale à la note quand tous les critères sont connus. Un temps estimé (hors ligne) sert au filtre des 60 min, marqué
 * « estimation » à l'écran (RTE-02) ; la place réservée exige un temps vérifié (V3-016).
 * Renvoie { documentes, aVerifier, nonRecommandes, exclus, top, autresAEgalite, deplacesParLaPlaceReservee }.
 * La Confiance n'est jamais lue pour l'éligibilité ni pour l'ordre (§ 9.1 ; V3-006).
 */
export function classer(spots, { trajetMax = TRAJET_MAX_MIN } = {}) {
  const nonRecommandes = [], exclus = [], documentes = [], aVerifier = [];
  for (const s of spots) {
    if (NON_RECOMMANDE.has(s.securite)) { nonRecommandes.push({ id: s.id, raison: `sécurité ${s.securite}` }); continue; }
    if (s.accesFerme) { exclus.push({ id: s.id, raison: "accès fermé" }); continue; }
    if (s.interdit) { exclus.push({ id: s.id, raison: "pêche interdite au poste à cette date" }); continue; }
    if (!(s.trajetMin <= trajetMax)) { exclus.push({ id: s.id, raison: s.trajetMin == null ? "temps de route inconnu" : `${s.trajetMin} min de route > ${trajetMax}` }); continue; }
    // INSUFFICIENT_DATA ne vaut jamais SAFE ; CAUTION reprend le « à vérifier » validé en V2 (Félix, 13 nov. 2026).
    (s.securite === "SAFE" && !s.aVerifier ? documentes : aVerifier).push(s);
  }
  const ordre = (a, b) => ((b.fav ?? -1) - (a.fav ?? -1)) || ((a.trajetMin ?? 999) - (b.trajetMin ?? 999)) || String(a.id).localeCompare(String(b.id));
  documentes.sort(ordre); aVerifier.sort(ordre);
  // Top : parmi les spots documentés et notés ; égalité stricte au dernier rang retenu : jusqu'à cinq.
  const notes = documentes.filter((s) => s.fav != null);
  let top = notes.slice(0, AFFICHES);
  if (top.length === AFFICHES) {
    const dernier = top[AFFICHES - 1].fav;
    top = [...top, ...notes.slice(AFFICHES).filter((s) => s.fav === dernier).slice(0, AFFICHES_MAX - AFFICHES)];
  }
  const dernierFav = top.length ? top[top.length - 1].fav : null;
  let autresAEgalite = top.length === AFFICHES_MAX ? notes.filter((s) => !top.includes(s) && s.fav === dernierFav).map((s) => s.id) : [];
  // Place réservée (V3-016) : si aucun spot affiché n'est à 15 min ou moins de route vérifiée, le meilleur spot documenté
  // proche prend la 3ᵉ place, sans bonus de Favorabilité ; les spots qu'il déplace restent nommés (provisoire).
  let deplacesParLaPlaceReservee = [];
  const proche = (s) => s.trajetVerifie === true && s.trajetMin <= PROCHE_MIN;
  if (top.length >= AFFICHES && !top.some(proche)) {
    const p = notes.find((s) => proche(s) && !top.includes(s));
    if (p) {
      deplacesParLaPlaceReservee = top.slice(AFFICHES - 1).map((s) => s.id);
      top = [...top.slice(0, AFFICHES - 1), { ...p, placeReservee: true }];
      autresAEgalite = [];
    }
  }
  return { documentes, aVerifier, nonRecommandes, exclus, top, autresAEgalite, deplacesParLaPlaceReservee };
}
