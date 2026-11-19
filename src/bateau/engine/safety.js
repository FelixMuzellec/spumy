// Phase 13 — Sécurité de la sortie BATEAU (docs/SPEC-MOTEUR-BATEAU.md, § 3) : non compensable.
//
// Un seul « non recommandé » empêche la sortie ou la zone ; un seul « à vérifier » interdit le vert. La règle retenue
// est la plus stricte entre la loi, la catégorie du bateau et tes limites. Toute la sortie compte, du départ au retour,
// et c'est le pire moment du créneau qui décide, jamais la moyenne. Une donnée de sécurité inconnue : « à vérifier ».
import P from "../../../data/bateau/moteur.json";

const S = P.securite;
export const ST = { OK: "ok", VERIFY: "verify", NR: "nr" };
const rank = { ok: 0, verify: 1, nr: 2 };
export const worse = (a, b) => (rank[b] > rank[a] ? b : a);

/** Échelle de Beaufort d'après le vent moyen en km/h (bornes de l'OMM). */
export function beaufort(kmh) {
  if (kmh == null || !Number.isFinite(kmh)) return null;
  const B = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  const i = B.findIndex((b) => kmh < b);
  return i < 0 ? 12 : i;
}
/** Distance en milles nautiques entre deux points { lat, lon }. */
export function milles(a, b) {
  if (!a || !b || ![a.lat, a.lon, b.lat, b.lon].every(Number.isFinite)) return null;
  const R = 3440.065, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
const fr = (x, d = 1) => (x == null ? "?" : (+x).toFixed(d).replace(".", ","));
const hh = (t) => (t == null ? "" : new Date(t).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).replace(":", " h "));
const maxOf = (hours, k) => {
  let best = null;
  for (const h of hours) if (h[k] != null && Number.isFinite(h[k]) && (best == null || h[k] > best.v)) best = { v: h[k], t: h.t };
  return best;
};
const minOf = (hours, k) => {
  let best = null;
  for (const h of hours) if (h[k] != null && Number.isFinite(h[k]) && (best == null || h[k] < best.v)) best = { v: h[k], t: h.t };
  return best;
};
const unknown = (hours, k) => hours.some((h) => h[k] == null || !Number.isFinite(h[k]));

/** Un profil de bateau est complet quand il dit sa catégorie, son armement et au moins un abri. */
export function profileProblems(p) {
  const out = [];
  if (!p || !S.categorie[p.categorie]) out.push("catégorie de conception (A, B, C ou D, sur la plaque du constructeur)");
  if (!p || !(p.armement in S.armement_milles)) out.push("armement embarqué (basique, côtier, semi-hauturier, hauturier)");
  if (!p || !(p.abris || []).some((a) => Number.isFinite(a?.lat) && Number.isFinite(a?.lon))) out.push("au moins un abri (port d'attache)");
  return out;
}

/** Seuils de vent et de mer retenus : les proposés, tes limites si plus strictes, un cran plus bas si seul à bord. */
export function thresholds(p = {}) {
  const v = S.vent_propose, m = S.mer_proposee, cat = S.categorie[p.categorie] || {};
  const seul = p.seul ? 1 : 0;
  let verBf = v.verifier_bf - seul, nonBf = v.non_bf - seul;
  if (Number.isFinite(p.limites?.ventBf)) { nonBf = Math.min(nonBf, p.limites.ventBf + 1); verBf = Math.min(verBf, p.limites.ventBf); }
  if (cat.bf != null) { nonBf = Math.min(nonBf, cat.bf + 1); verBf = Math.min(verBf, cat.bf); }
  let merNon = Number.isFinite(p.limites?.merM) ? p.limites.merM : null;
  if (cat.vagues != null) merNon = merNon == null ? cat.vagues : Math.min(merNon, cat.vagues);
  const merVer = Math.min(m.verifier_m - (seul ? 0.25 : 0), merNon ?? Infinity);
  return { verBf, nonBf, verGust: v.verifier_rafales_kmh - seul * 10, nonGust: v.non_rafales_kmh - seul * 10, merVer, merNon, seul: !!seul };
}

/**
 * Sécurité d'une sortie vers une zone.
 * args = { profile, zone: { lat, lon, raz }, hours: [{ t, wind, gust, wave, period, visibility, code, cape }] (km/h, m, s, m),
 *          start, end (ms : départ et retour), sun: { rise, set } (ms), ageH (âge de la prévision, h) }
 * Renvoie { status, rules: [{ id, label, status, reason }], worst: { wind, wave } }.
 */
export function tripSafety({ profile, zone, hours = [], start, end, sun, ageH }) {
  const rules = [];
  const add = (id, label, status, reason) => rules.push({ id, label, status, reason });
  const T = thresholds(profile);
  const win = hours.filter((h) => h.t >= start - 36e5 / 2 && h.t <= end);

  // SEC_ARMEMENT : distance au plus proche de tes abris.
  const abris = (profile?.abris || []).filter((a) => Number.isFinite(a?.lat) && Number.isFinite(a?.lon));
  const d = abris.length ? Math.min(...abris.map((a) => milles(a, zone))) : null;
  const lim = S.armement_milles[profile?.armement];
  if (d == null || !Number.isFinite(d)) add("SEC_ARMEMENT", "Distance d'un abri", ST.VERIFY, "Aucun abri choisi ou zone sans position : distance inconnue.");
  else if (lim != null && d > lim) add("SEC_ARMEMENT", "Distance d'un abri", ST.NR, `Zone à ${fr(d)} milles de l'abri le plus proche : au-delà de ${lim} milles, ton armement (${profile.armement}) ne suffit pas (Division 240).`);
  else add("SEC_ARMEMENT", "Distance d'un abri", ST.OK, `${fr(d)} milles de l'abri le plus proche${lim != null ? ` (armement : ${lim} milles au plus)` : ""}.`);

  // Vent et mer : le pire moment du créneau.
  const wMax = maxOf(win, "wind"), gMax = maxOf(win, "gust"), vMax = maxOf(win, "wave");
  const bf = wMax ? beaufort(wMax.v) : null;
  const ventInconnu = !win.length || unknown(win, "wind");
  const merInconnue = !win.length || unknown(win, "wave");

  // SEC_CATEGORIE
  const cat = S.categorie[profile?.categorie];
  if (!cat) add("SEC_CATEGORIE", "Catégorie du bateau", ST.VERIFY, "Catégorie de conception inconnue.");
  else if (cat.bf == null) add("SEC_CATEGORIE", "Catégorie du bateau", ST.OK, `Catégorie ${profile.categorie} : au-delà de la force 8 et de 4 m.`);
  else if ((bf != null && bf > cat.bf) || (vMax && vMax.v > cat.vagues)) {
    add("SEC_CATEGORIE", "Catégorie du bateau", ST.NR, `Catégorie ${profile.categorie} (force ${cat.bf}, ${fr(cat.vagues)} m au plus) : ${bf != null && bf > cat.bf ? `force ${bf} à ${hh(wMax.t)}` : `${fr(vMax.v)} m de vagues à ${hh(vMax.t)}`}.`);
  } else if (ventInconnu || merInconnue) add("SEC_CATEGORIE", "Catégorie du bateau", ST.VERIFY, "Vent ou vagues inconnus sur une partie du créneau.");
  else if ((bf != null && bf >= cat.bf - S.marge_categorie.bf) || (vMax && vMax.v >= cat.vagues * (1 - S.marge_categorie.vagues_part))) {
    add("SEC_CATEGORIE", "Catégorie du bateau", ST.VERIFY, `Près de la limite de la catégorie ${profile.categorie} (force ${cat.bf}, ${fr(cat.vagues)} m) : force ${bf}, ${fr(vMax?.v)} m au pire.`);
  } else add("SEC_CATEGORIE", "Catégorie du bateau", ST.OK, `Dans les limites de la catégorie ${profile.categorie}.`);

  // SEC_BMS : une prévision de force 7 sur le créneau vaut BMS.
  if (bf != null && bf >= S.bms_bf) add("SEC_BMS", "Avis de grand frais (BMS)", ST.NR, `Force ${bf} prévue à ${hh(wMax.t)} : vaut un BMS côte.`);
  else add("SEC_BMS", "Avis de grand frais (BMS)", ST.OK, "Pas de force 7 prévue ; l'application ne lit pas les BMS : les consulter avant de partir.");

  // SEC_VENT
  if (ventInconnu) add("SEC_VENT", "Vent", ST.VERIFY, "Vent inconnu sur une partie du créneau.");
  else if (bf >= T.nonBf || (gMax && gMax.v >= T.nonGust)) add("SEC_VENT", "Vent", ST.NR, `Force ${bf}${gMax ? `, rafales ${Math.round(gMax.v)} km/h` : ""} au pire (${hh(wMax.t)}) : au-delà de ${T.seul ? "tes seuils, seul à bord" : "tes seuils"} (non recommandé dès la force ${T.nonBf} ou ${T.nonGust} km/h de rafales).`);
  else if (bf >= T.verBf || (gMax && gMax.v >= T.verGust)) add("SEC_VENT", "Vent", ST.VERIFY, `Force ${bf}${gMax ? `, rafales ${Math.round(gMax.v)} km/h` : ""} au pire (${hh(wMax.t)}) : à vérifier dès la force ${T.verBf}${T.seul ? " (seul à bord : un cran plus bas)" : ""}.`);
  else add("SEC_VENT", "Vent", ST.OK, `Force ${bf} au plus${gMax ? `, rafales ${Math.round(gMax.v)} km/h` : ""}.`);

  // SEC_MER
  const courte = win.find((h) => Number.isFinite(h.wave) && Number.isFinite(h.period) && h.period < S.mer_proposee.courte_periode_s && h.wave >= S.mer_proposee.courte_m);
  if (merInconnue) add("SEC_MER", "Mer", ST.VERIFY, "Vagues inconnues sur une partie du créneau.");
  else if (T.merNon != null && vMax.v > T.merNon) add("SEC_MER", "Mer", ST.NR, `${fr(vMax.v)} m de vagues à ${hh(vMax.t)} : au-delà de ta limite ou de celle du bateau (${fr(T.merNon)} m).`);
  else if (vMax.v >= T.merVer) add("SEC_MER", "Mer", ST.VERIFY, `Mer agitée : ${fr(vMax.v)} m à ${hh(vMax.t)}.`);
  else if (courte) add("SEC_MER", "Mer", ST.VERIFY, `Mer courte : ${fr(courte.wave)} m toutes les ${fr(courte.period, 0)} s à ${hh(courte.t)}.`);
  else add("SEC_MER", "Mer", ST.OK, `${fr(vMax.v)} m au plus.`);

  // SEC_VISIBILITE
  const vis = minOf(win, "visibility");
  if (!win.length || unknown(win, "visibility")) add("SEC_VISIBILITE", "Visibilité", ST.VERIFY, "Visibilité inconnue (le modèle ne la donne pas sur tout le créneau).");
  else if (vis.v < S.visibilite_m.brume) add("SEC_VISIBILITE", "Visibilité", ST.NR, `Brume : ${fr(vis.v / 1852)} mille à ${hh(vis.t)}.`);
  else if (vis.v < S.visibilite_m.mauvaise) add("SEC_VISIBILITE", "Visibilité", ST.VERIFY, `Visibilité mauvaise : ${fr(vis.v / 1852)} milles à ${hh(vis.t)}.`);
  else add("SEC_VISIBILITE", "Visibilité", ST.OK, `${fr(vis.v / 1852)} milles au moins.`);

  // SEC_ORAGE
  const orage = win.find((h) => S.orage.codes.includes(h.code) || (Number.isFinite(h.cape) && h.cape >= S.orage.cape));
  if (!win.length || win.every((h) => h.code == null && h.cape == null)) add("SEC_ORAGE", "Orage", ST.VERIFY, "Risque d'orage inconnu.");
  else if (orage) add("SEC_ORAGE", "Orage", ST.VERIFY, `Orage possible à ${hh(orage.t)}.`);
  else add("SEC_ORAGE", "Orage", ST.OK, "Pas d'orage prévu.");

  // SEC_NUIT
  if (!sun?.set || !Number.isFinite(end)) add("SEC_NUIT", "Retour de jour", ST.VERIFY, "Heure de retour ou coucher du soleil inconnus.");
  else if (end > sun.set) add("SEC_NUIT", "Retour de jour", ST.VERIFY, `Retour prévu après le coucher du soleil (${hh(sun.set)}).`);
  else add("SEC_NUIT", "Retour de jour", ST.OK, `Retour avant le coucher du soleil (${hh(sun.set)}).`);

  // SEC_RAZ : sans courant fiable, une zone de raz reste à vérifier.
  if (zone?.raz) add("SEC_RAZ", "Raz et veines de courant", ST.VERIFY, "Zone de raz : courant et heures de renverse non lus par l'application ; passer à l'étale, jamais vent contre courant.");

  // SEC_DONNEES
  const couvre = win.length >= Math.max(1, Math.floor((end - start) / 36e5));
  if (!Number.isFinite(ageH)) add("SEC_DONNEES", "Âge des données", ST.VERIFY, "Âge de la prévision inconnu.");
  else if (ageH > S.donnees_age_h) add("SEC_DONNEES", "Âge des données", ST.VERIFY, `Prévision vieille de ${Math.round(ageH)} h : à actualiser.`);
  else if (!couvre) add("SEC_DONNEES", "Âge des données", ST.VERIFY, "La prévision ne couvre pas tout le créneau.");
  else add("SEC_DONNEES", "Âge des données", ST.OK, `Prévision de moins de ${Math.max(1, Math.ceil(ageH))} h, sur tout le créneau.`);

  if (T.seul) add("SEC_SEUL", "Seul à bord", ST.OK, "Seuils de vent et de mer serrés d'un cran.");

  const status = rules.reduce((s, r) => worse(s, r.status), ST.OK);
  return { status, rules, worst: { wind: wMax, gust: gMax, wave: vMax, bf }, thresholds: T, distanceMilles: d };
}

export const RAPPELS = P.rappels;
