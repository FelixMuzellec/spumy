// Formats et petites règles d'affichage du prototype (aucune règle de pêche ici : le moteur les a déjà appliquées).
import { favBand } from "../design/ds/ui.jsx";
import { lieuOfSpotType, lumiereOf, merOf, cielOf } from "../design/ds/ambiance.js";

export const fr = (x, d = 0) => (x == null ? "–" : Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }));
export const dateLong = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
export const dateShort = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Titre du verdict, d'après le palier de favorabilité (paliers recalés en phase 8). */
export function headline(fav) {
  return ["Pas de note aujourd'hui", "Conditions difficiles", "Conditions moyennes", "Conditions correctes", "Bonnes conditions", "Excellentes conditions"][favBand(fav)];
}
export const momentOf = (light) => ({ aube: "à l'aube", crepuscule: "au crépuscule", nuit: "de nuit", jour: "en journée" }[lumiereOf(light)] || "");

export const STATUS = {
  ok: { tone: "good", label: "Recommandé", icon: "circle-check" },
  verify: { tone: "warn", label: "À vérifier", icon: "triangle-alert" },
  nr: { tone: "nr", label: "Non recommandé", icon: "ban" },
};

/** Contexte d'ambiance d'un spot pour un créneau : lumière du créneau, ciel et mer de l'heure. */
export function ambianceOf(spot, usage = "hero", { nomme = false } = {}) {
  const light = spot?.best?.light;
  const hh = spot?.best?.start ? +spot.best.start.slice(0, 2) : 12;
  const hr = spot?.hourly?.find((x) => x.h === hh) || spot?.hourly?.[0] || {};
  return { usage, mode: "bord", lumiere: lumiereOf(light), ciel: cielOf({ cloud: hr.cloud, rainMm: hr.rain }), mer: merOf(hr.wave, null),
           lieu: lieuOfSpotType(spot?.type), spotNomme: nomme, cle: spot?.id || "" };
}

/** Raisons positives (« Pourquoi ce spot ? ») : les critères à au moins 80 % de leur maximum, du plus fort au plus faible. */
export function reasonsOf(spot, n = 3) {
  const crit = (spot.crit || []).filter((c) => c.max && c.pts / c.max >= 0.8).sort((a, b) => b.pts / b.max - a.pts / a.max);
  const out = crit.map((c) => ({ t: critPhrase(c), s: `${c.label} : ${fr(c.pts, c.pts % 1 ? 1 : 0)}/${c.max}` }));
  if (spot.presence?.factor >= 0.95) out.push({ t: cap(spot.presence.label.replace(/^saison : /, "saison : ")), s: `Présence × ${fr(spot.presence.factor, 2)}` });
  return out.slice(0, n);
}
/** Ce qui retient la note (« À surveiller ») : les doutes de sécurité d'abord, puis le critère le plus faible et la distance. */
export function watchOf(spot) {
  const out = (spot.verify || []).map((t) => ({ t: cap(t), tone: "warn" }));
  const weak = (spot.crit || []).filter((c) => c.max && c.pts / c.max < 0.8).sort((a, b) => a.pts / a.max - b.pts / b.max)[0];
  if (weak) out.push({ t: critPhrase(weak), s: `${weak.label} : ${fr(weak.pts, weak.pts % 1 ? 1 : 0)}/${weak.max}` });
  const dist = spot.pert?.parts?.find((p) => /Distance/.test(p.label) && p.pts < p.max);
  if (dist) out.push({ t: cap(dist.why) });
  return out;
}
function critPhrase(c) {
  const w = c.why || "";
  if (c.k === "fenetre") return /prime/.test(w) ? "Fenêtre de marée « prime » de la fiche" : cap(w);
  if (c.k === "lumiere") return { aube: "Lumière de l'aube", "crépuscule": "Lumière du crépuscule", nuit: "Pêche de nuit" }[w] || cap(w);
  return cap(w);
}

/** Quatre familles de facteurs pour la comparaison, en part de leur maximum. */
export function factorsOf(spot) {
  const g = (k) => (spot.crit || []).filter((c) => k.includes(c.k));
  const part = (cs) => { const p = cs.reduce((a, c) => a + c.pts, 0), m = cs.reduce((a, c) => a + c.max, 0); return m ? p / m : null; };
  return [
    { k: "Marée", icon: "maree-montante", v: part(g(["fenetre", "coef"])) },
    { k: "Lumière", icon: "sunrise", v: part(g(["lumiere"])) },
    { k: "Vent et mer", icon: "wind", v: part(g(["vent"])) },
    { k: "Saison", icon: "fish", v: spot.presence?.factor ?? null },
  ];
}

export const lieuLabel = (type) => ({ plage: "Plage", estuaire: "Estuaire", falaise: "Falaise", port: "Port", rochers: "Pointe rocheuse" }[lieuOfSpotType(type)]);
