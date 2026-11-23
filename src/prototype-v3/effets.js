// Prototype V6 — effets sur la pêche du bar (V3-029), du général au spécifique.
// Terrain : les rubriques réelles des fiches (data/sites/pirou.config.js) croisées avec les conditions du jour.
// Météo : chaque élément, son effet et son poids dans la note, d'après les connaissances sourcées (data/knowledge).
// Les conditions du jour et les poids sont des DONNÉES DE DÉMONSTRATION : les vrais poids viendront du calcul de la note.
import { KNOW } from "./connaissances.js";
import { TIDE, SUN, NOW, windows, windAt, compass, hhmm } from "./data.js";

const fr = (n, d = 1) => String(Math.round(n * 10 ** d) / 10 ** d).replace(".", ",");
const angleGap = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
export const KN = (kmh) => Math.round(kmh / 1.852);

/** Conditions du jour au spot (démonstration). */
export function conditions(s) {
  const w = windAt(s.x, s.y, NOW);
  return {
    sky: "Partiellement nuageux", rain: 15, air: 11, water: 13, pressure: 1021, trend: "stable",
    windFrom: w.fromDeg, windKn: KN(w.kmh), gustKmh: w.gust, swell: s.swell, coef: TIDE.coef,
    tide: NOW > TIDE.bm && NOW < TIDE.pm ? "montante" : "descendante", pm: TIDE.pm, bm: TIDE.bm,
    source: "Météo-France AROME via Open-Meteo, 06:00 · démonstration", sea: "Open-Meteo Marine, 06:00 · démonstration",
  };
}

const rule = (id) => ({ id, ...KNOW[id] });

/** Le terrain du spot aujourd'hui : chaque ligne croise une rubrique de la fiche avec les conditions du jour. */
export function terrain(s) {
  const c = conditions(s), v2 = s.v2, ev = s.evidence, rows = [];
  // 1. Marée : les fenêtres de la fiche, posées sur la marée du jour.
  const win = windows(v2).map((w) => ({ ...w, now: NOW >= w.from && NOW <= w.to, soon: w.from > NOW && w.from - NOW <= 2 }));
  const live = win.find((w) => w.now && w.priority === "prime") || win.find((w) => w.soon && w.priority === "prime");
  rows.push({
    key: "maree", title: "Marée et fenêtres du spot", effect: live ? "fav" : "neutre",
    today: live ? `${live.now ? "En ce moment" : "Bientôt"} : « ${live.label} », ${hhmm(live.from)}–${hhmm(live.to)} (coefficient ${c.coef})`
      : `Aucune fenêtre « prime » en cours ; prochaine : ${win.filter((w) => w.from > NOW).sort((a, b) => a.from - b.from).map((w) => `${w.label}, ${hhmm(w.from)}`)[0] || "demain"}`,
    fiche: v2.tidalRules?.description || v2.tidalRules?.typeHeure || "", level: ev.bars ?? null, rule: rule("maree-flot"), windows: win,
  });
  // 2. Exposition au vent du jour.
  const exposed = (v2.exposedAngles || []).some((a) => angleGap(a, c.windFrom) <= 22.5);
  const sheltered = (v2.shelteredAngles || []).some((a) => angleGap(a, c.windFrom) <= 22.5);
  rows.push({
    key: "exposition", title: "Exposition au vent du jour",
    effect: exposed ? (c.windKn <= 20 ? "fav" : c.windKn > 25 ? "defav" : "neutre") : sheltered ? "defav" : "neutre",
    today: `Vent de ${compass(c.windFrom)}, ${c.windKn} nds : ${exposed ? "il entre sur le spot, lève du clapot et teinte l'eau" : sheltered ? "vent de terre ici, l'eau reste claire et le poisson méfiant" : "il longe la côte, effet faible"}`,
    fiche: v2.topology?.exposition?.text || "", level: ev.exposition ?? null, rule: rule("vent-exposition"),
  });
  // 3. Courant et coefficient : plage utile de la fiche.
  const [lo, a, b, hi] = v2.coefBand || [];
  const inBand = c.coef >= a && c.coef <= b, usable = c.coef >= lo && c.coef <= hi;
  rows.push({
    key: "courant", title: "Courant et coefficient", effect: inBand ? "fav" : usable ? "neutre" : "defav",
    today: `Coefficient ${c.coef} : ${inBand ? `dans la plage idéale du spot (${a} à ${b})` : usable ? `utilisable (${lo} à ${hi}), hors de la plage idéale` : `hors de la plage utile (${lo} à ${hi})`}`,
    fiche: v2.topology?.courant?.text || "", level: ev.courant ?? null, rule: rule("coefficient-plage-utile"), rule2: rule("courant-coefficient"),
  });
  // 4. Houle et limite du spot (sécurité, jamais compensée).
  rows.push({
    key: "houle", title: "Houle et limite du spot",
    effect: c.swell == null ? "inconnu" : c.swell > v2.houleMax ? "defav" : c.swell >= 1.5 ? "fav" : "neutre",
    today: c.swell == null ? "Houle non documentée : la sécurité reste à vérifier" : c.swell > v2.houleMax
      ? `Houle ${fr(c.swell)} m, au-delà de la limite de ${fr(v2.houleMax)} m du spot : non recommandé`
      : `Houle ${fr(c.swell)} m pour une limite de ${fr(v2.houleMax)} m${c.swell >= 1.5 ? " : elle charge l'eau sur la côte ouverte" : " : trop faible pour teinter l'eau"}`,
    fiche: "", level: null, rule: rule("houle-turbidite"),
  });
  // Ce que dit la fiche (contexte, sans effet annoncé).
  const ctx = ["fond", "structure", "bars"].filter((k) => v2.topology?.[k]).map((k) => ({
    key: k, title: { fond: "Fond", structure: "Structure", bars: "Les bars sur ce spot" }[k], text: v2.topology[k].text, level: ev[k] ?? null,
  }));
  // Formes contractées du français : « grâce à la marée et au coefficient », « à cause du vent », « malgré la houle ».
  const W = { maree: ["à la marée", "de la marée", "la marée"], exposition: exposed ? ["au vent de mer", "du vent de mer", "le vent de mer"] : ["au vent", "du vent", "le vent"],
    courant: ["au coefficient", "du coefficient", "le coefficient"], houle: ["à la houle", "de la houle", "la houle"] };
  const list = (rs, i) => { const w = rs.map((r) => W[r.key][i]); return w.length > 1 ? `${w.slice(0, -1).join(", ")} et ${w.at(-1)}` : w[0]; };
  const fav = rows.filter((r) => r.effect === "fav"), defav = rows.filter((r) => r.effect === "defav");
  const verdict = s.status === "nr" ? `Non recommandé aujourd'hui : ${rows.find((r) => r.key === "houle").today.split(" : ")[0].toLowerCase()}.`
    : s.status === "verify" ? "À vérifier avant d'y aller : la houle n'est pas documentée sur ce spot."
      : fav.length > defav.length ? `Favorable aujourd'hui grâce ${list(fav, 0)}${defav.length ? `, malgré ${list(defav, 2)}` : ""}.`
        : defav.length ? `Moins favorable aujourd'hui à cause ${list(defav, 1)}.` : "Terrain neutre aujourd'hui.";
  return { rows, ctx, verdict, sources: v2.sources || [], securite: v2.securite || [], cond: c };
}

/** Le poids de chaque élément du jour dans la note (démonstration). Le reste vient du terrain et de la saison. */
export function meteo(s) {
  const c = conditions(s), v2 = s.v2, t = terrain(s);
  const exp = t.rows.find((r) => r.key === "exposition"), mar = t.rows.find((r) => r.key === "maree"), cou = t.rows.find((r) => r.key === "courant");
  const sunrise = s.win && s.win[0] <= SUN.rise + 1 && s.win[1] >= SUN.rise - 1;
  const items = [
    { key: "maree", label: "Marée", value: `${c.tide === "montante" ? "Montante" : "Descendante"} · PM ${hhmm(c.pm)} · coef ${c.coef}`,
      pts: mar.effect === "fav" ? 6 : -3, why: mar.today, rule: rule("maree-flot") },
    { key: "coef", label: "Coefficient", value: String(c.coef), pts: cou.effect === "fav" ? 3 : cou.effect === "neutre" ? 0 : -3, why: cou.today, rule: rule("coefficient-plage-utile") },
    { key: "vent", label: "Vent", value: `${c.windKn} nds ${compass(c.windFrom)}`, pts: exp.effect === "fav" ? 4 : exp.effect === "defav" ? -3 : 0, why: exp.today, rule: rule("vent-exposition") },
    { key: "rafales", label: "Rafales", value: `${KN(c.gustKmh)} nds`, pts: c.gustKmh > 50 ? -2 : 0,
      why: c.gustKmh > 50 ? "Rafales au-delà de 50 km/h : lancer et tenue de ligne se dégradent" : "Rafales sous 50 km/h : sans effet", rule: rule("rafales-penalite") },
    { key: "houle", label: "Houle", value: c.swell == null ? "non documentée" : `${fr(c.swell)} m`, pts: c.swell == null ? 0 : c.swell >= 1.5 && c.swell <= v2.houleMax ? 3 : 0,
      why: t.rows.find((r) => r.key === "houle").today, rule: rule("houle-turbidite"), unknown: c.swell == null },
    { key: "lumiere", label: "Lumière", value: `Lever ${hhmm(SUN.rise)}`, pts: sunrise ? 2 : 0,
      why: sunrise ? "La fenêtre du spot encadre le lever du jour" : "La fenêtre du spot est en plein jour", rule: rule("lumiere-basse") },
    { key: "ciel", label: "Ciel", value: c.sky, pts: 1, why: "Ciel en partie couvert : moins de méfiance de jour", rule: rule("ciel-couvert") },
    { key: "eau", label: "Eau", value: `${c.water} °C`, pts: c.water >= 13.5 && c.water <= 19 ? 3 : c.water >= 11.5 ? 1 : -3,
      why: c.water >= 13.5 ? "Eau dans la plage de pleine présence (13,5 à 19 °C)" : c.water >= 11.5 ? "Eau entre 11,5 et 13,5 °C : les bars sont en retour sur la côte" : "Eau froide : présence résiduelle", rule: rule("seuils-thermiques") },
    { key: "pression", label: "Pression", value: `${c.pressure} hPa, ${c.trend}`, pts: 1, why: "Pression haute et stable", rule: rule("pression") },
    { key: "pluie", label: "Pluie", value: `${c.rain} %`, pts: null, why: "Cumul des 36 dernières heures inconnu : aucun effet annoncé", rule: rule("pluie-turbidite") },
  ];
  const sum = items.reduce((m, i) => m + (i.pts || 0), 0);
  return { items, sum, base: s.fav == null ? null : s.fav - sum, cond: c };
}

/** Signe d'un effet : un mot et une forme, jamais la couleur seule. */
export const EFFECT = {
  fav: { word: "Favorable", glyph: "+" }, defav: { word: "Défavorable", glyph: "−" }, neutre: { word: "Neutre", glyph: "=" }, inconnu: { word: "Inconnu", glyph: "?" },
};
export const ptsEffect = (p) => (p == null ? "inconnu" : p > 0 ? "fav" : p < 0 ? "defav" : "neutre");
