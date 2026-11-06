// Réglementation de la pêche de loisir du bar, bonnes pratiques de remise à
// l'eau et consignes de sécurité propres à chaque spot.
//
// Rien ici n'est déduit : chaque règle porte sa source et sa date de lecture.
// La réglementation change chaque année (règlement UE de janvier, arrêtés
// français ensuite) : l'application le dit dès que la date consultée sort de
// l'année vérifiée.

export const REGLEMENTATION = {
  annee: 2026,
  verifieLe: "29/10/2026",
  // Deux régimes, séparés par le 48e parallèle (limite des zones CIEM 7 et 8, reprise par la DDTM du Finistère).
  zones: {
    nord: {
      label: "Au nord du 48e parallèle : zones CIEM 7 et 4 (Manche, mer du Nord, Iroise)",
      quota: 3,
      noKill: { from: [2, 1], to: [3, 31] },   // 1er février → 31 mars
      regles: [
        { t: "3 bars maximum par pêcheur et par jour, en janvier et du 1er avril au 31 décembre.",
          s: "Arrêté du 1er avril 2026 (JO du 9/04/2026), art. 2, 2° · règlement (UE) 2026/249 du Conseil" },
        { t: "Du 1er février au 31 mars : pêche à la canne ou à la ligne à main en capture suivie d'un relâcher uniquement ; aucun bar ne peut être conservé.",
          s: "Arrêté du 1er avril 2026 (JO du 9/04/2026), art. 2, 1°" },
      ],
    },
    sud: {
      label: "Au sud du 48e parallèle : zone CIEM 8 (golfe de Gascogne)",
      quota: 2,
      noKill: null,
      regles: [
        { t: "2 bars maximum par pêcheur et par jour, toute l'année 2026 ; pas de période de pêche avec relâcher obligatoire.",
          s: "Arrêté du 1er avril 2026 (JO du 9/04/2026), art. 3 · DDTM du Finistère, synthèse d'avril 2026" },
      ],
    },
  },
  latMin: 48,        // limite nord / sud
  maille: 42,        // cm, de la pointe du museau à l'extrémité de la nageoire caudale
  regles: [
    { t: "Taille minimale : 42 cm, de la pointe du museau à l'extrémité de la nageoire caudale.",
      s: "peche.com, 08/01/2026 · Boatcible (arrêté du 26/10/2012 modifié) · DDTM du Finistère (avril 2026)" },
    { t: "Bar conservé : marquage obligatoire par ablation de la partie inférieure de la nageoire caudale, dès la capture pour la pêche du bord.",
      s: "Boatcible (arrêté du 17/05/2011 modifié) · DDTM du Finistère (avril 2026)" },
    { t: "Déclaration des captures de bar sur l'application RecFishing (pêcheurs de 16 ans et plus) : enregistrement annuel, déclaration dans les 24 h suivant la capture, « y compris pour le no kill ». Toujours obligatoire selon la page du ministère de la Mer mise à jour le 30/09/2026 ; le Conseil d'État a refusé de la suspendre le 18/06/2026. Quelques articles de presse annoncent un retrait de l'obligation, que ni le ministère ni la FNPP ne confirment au 29/10/2026 : à revérifier avant de pêcher.",
      s: "Ministère de la Mer, « Pêche de loisir en mer » (mis à jour le 30/09/2026) · FFPSA, 27/04/2026 (arrêté du 1er avril 2026 modifiant celui du 7/11/2025 : délai de 24 h) · L'Officiel des métiers, 19/06/2026 (Conseil d'État, 18/06/2026) · FNPP, actualités réglementaires (13/10/2026) · DDTM du Finistère (avril 2026)" },
  ],
  sources: [
    { label: "Arrêté du 1er avril 2026 réglementant la pêche de loisir du bar européen (NOR TECM2608397A, JO du 9/04/2026) — copie publiée par la mairie de Locquirec",
      url: "https://www.locquirec.bzh/wp-content/uploads/2026/04/Arrete-du-1er-avril-2026-Bar-loisir.pdf" },
    { label: "DDTM du Finistère — Synthèse de la réglementation de la pêche maritime de loisir (actualisation avril 2026)",
      url: "https://www.locquirec.bzh/wp-content/uploads/2026/04/2026-SYNTHESE-peche-loisir-en-mer.pdf" },
    { label: "peche.com — Les quotas bars et lieus 2026 pour les pêcheurs de loisir (08/01/2026)",
      url: "https://www.peche.com/article/50915/les-quotas-bars-et-lieus-2026-pour-les-pecheurs-de-loisir" },
    { label: "Boatcible — Pêche de loisir 2026, règles essentielles (02/07/2026)",
      url: "https://boatcible.com/2026/07/02/peche-de-loisir-2026-regles-essentielles/" },
    { label: "Ministère de la Mer — Pêche de loisir en mer (textes officiels ; page mise à jour le 30/09/2026)",
      url: "https://www.mer.gouv.fr/peche-de-loisir-en-mer" },
    { label: "FFPSA — Les règles de déclaration de pêche sur l'appli mobile RecFishing évoluent (27/04/2026)",
      url: "https://www.ffpsa.net/les-regles-de-declaration-de-peche-sur-lappli-mobile-recfishing-evoluent/" },
    { label: "L'Officiel des métiers — RecFishing : rejet du recours des moniteurs guides de pêche (19/06/2026)",
      url: "https://www.lofficieldesmetiers.fr/recfishing-rejet-du-recours-des-moniteurs-guides-de-peche/" },
    { label: "FNPP — Actualités réglementaires (consultées le 29/10/2026)",
      url: "https://www.fnpp.fr/toute-l-actualite/reglementation/" },
  ],
};
// Compatibilité : anciens champs du régime nord (zone, quota, noKill), lus par l'interface.
REGLEMENTATION.zone = REGLEMENTATION.zones.nord.label;
REGLEMENTATION.quota = REGLEMENTATION.zones.nord.quota;
REGLEMENTATION.noKill = REGLEMENTATION.zones.nord.noKill;

/** Régime réglementaire d'une latitude : "nord" (≥ 48°) ou "sud" ; nord si la latitude est inconnue. */
export const regZoneKey = (lat) => (Number.isFinite(lat) && lat < REGLEMENTATION.latMin ? "sud" : "nord");
/** Zones réglementaires couvertes par une liste de latitudes (spots d'un site). */
export function regZonesOf(lats) {
  const keys = new Set(lats.filter(Number.isFinite).map(regZoneKey));
  return ["nord", "sud"].filter((k) => keys.has(k));
}

// peche.com, « Comment relâcher un poisson ? » (J. Del Arco Aguirre, 24/06/2022).
export const REMISE_A_L_EAU = {
  source: { label: "peche.com — Comment relâcher un poisson ? Pratiquez le no-kill correctement (24/06/2022)",
            url: "https://www.peche.com/article/32998/comment-relacher-un-poisson-pratiquez-le-no-kill-correctement" },
  gestes: [
    "Hameçons simples sans ardillon, ou ardillons écrasés : le décrochage est plus facile, « sans augmenter significativement le taux de perte ».",
    "Sur les poissons-nageurs, remplacer les deux triples par un hameçon simple en queue.",
    "Écourter le combat : bas de ligne assez solide pour ne pas épuiser le poisson.",
    "Épuisette en caoutchouc sans nœud ; décrocher le poisson sans le sortir de l'eau.",
    "Mains mouillées, jamais de chiffon : le mucus protège ses écailles.",
    "Le tenir dans l'eau sans va-et-vient : « il repartira de lui-même » une fois récupéré.",
  ],
};

const md = (m, d) => m * 100 + d;
/** Statut réglementaire d'une date à une latitude (celle du spot, ou du site à défaut). */
export function regulationFor(dateISO, lat) { return regulationForZone(dateISO, regZoneKey(lat)); }
/** Statut réglementaire d'une date dans une zone ("nord" ou "sud" du 48e parallèle). */
export function regulationForZone(dateISO, zoneKey) {
  const R = REGLEMENTATION;
  const [y, m, d] = String(dateISO).split("-").map(Number);
  const Z = R.zones[zoneKey] || R.zones.nord;
  const v = md(m, d);
  const noKill = !!Z.noKill && v >= md(...Z.noKill.from) && v <= md(...Z.noKill.to);
  return {
    // inZone : la zone est renseignée (toujours vrai désormais : nord et sud du 48e parallèle).
    inZone: true, zoneKey, zoneLabel: Z.label, noKill, quota: Z.quota, maille: R.maille,
    year: y, yearChecked: R.annee, stale: y !== R.annee,
    headline: noKill ? "No-kill obligatoire : tout bar est relâché (février-mars)"
      : `${Z.quota} bars / pêcheur / jour · taille minimale ${R.maille} cm`,
  };
}

// ═══════════════════════════════════════════════════════════════════
// SÉCURITÉ PAR SPOT
// Chaque spot porte une liste `securite` : { t, s, when? }. `when` rend une
// consigne ACTIVE selon les conditions de la journée (coefficient, phase de la
// marée du créneau proposé). Seuls les seuils écrits dans une source sont
// utilisés (Térénez : coefficient 85, peche-poissons.com, 2022).
// ═══════════════════════════════════════════════════════════════════
export function securityFor(spot, { coeff, window } = {}) {
  return (spot?.securite || []).map((r) => {
    const w = r.when || null;
    let active = false;
    if (w) {
      const c = window?.coeff ?? coeff;
      const okCoef = w.coefAbove == null || (c != null && c > w.coefAbove);
      const okPhase = w.phase == null || window?.tidePhaseType === w.phase;
      active = okCoef && okPhase;
    }
    return { ...r, active, conditional: !!w };
  });
}
