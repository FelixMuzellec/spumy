// Prototype V6 — effets sur la pêche du bar (V3-029), du général au spécifique.
// Terrain : les rubriques réelles des fiches (data/sites/pirou.config.js) croisées avec les conditions du jour.
// Météo : la note expliquée par le calcul du moteur v2 (modele.js) : chaque critère, son poids, ses points du jour et
// la règle générale sourcée (data/knowledge). Les conditions du jour sont des DONNÉES DE DÉMONSTRATION.
import { KNOW } from "./connaissances.js";
import { TIDE, SUN, NOW, WATER, windows, windAt, compass, hhmm } from "./data.js";
import { PTS, VENT_MER, EXPO_LABEL, REGIME_LABEL, exposureOf, regimeOf } from "./modele.js";

const fr = (n, d = 1) => String(Math.round(n * 10 ** d) / 10 ** d).replace(".", ",");
export const KN = (kmh) => Math.round(kmh / 1.852);

/** Conditions du jour au spot (démonstration). */
export function conditions(s) {
  const w = windAt(s.x, s.y, NOW);
  return {
    sky: "Partiellement nuageux", rain: 15, air: 11, water: WATER, pressure: 1021, trend: "stable",
    windFrom: w.fromDeg, windKn: KN(w.kmh), windBft: w.bft, gustKmh: w.gust, swell: s.swell, coef: TIDE.coef,
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
  // Même règle que le calcul de la note : vent de mer à moins de 45° d'un angle exposé de la fiche, vent de terre côté abrité.
  const ex = exposureOf(v2, c.windFrom), exposed = ex === "face", sheltered = ex === "dos";
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

/**
 * Pourquoi cette note : le calcul du moteur v2 sur le meilleur créneau du jour, critère par critère.
 * Chaque critère dit son poids (et pourquoi il pèse autant), ses points du jour (et pourquoi), sa courbe et la règle sourcée.
 */
const WEIGHT_WHY = {
  fenetre: "Le bar chasse quand le courant de marée met la nourriture en mouvement, et chaque spot a ses moments, écrits dans sa fiche. C'est la base de toute sortie : 25 points.",
  coef: "Le coefficient règle la force du courant et la part d'estran couverte : trop faible, l'eau ne travaille pas ; trop fort, le courant devient impraticable du bord. 20 points, pleins dans la plage utile du spot.",
  lumiere: "En lumière basse, le bar perd sa méfiance et vient chasser près du bord ; en plein jour par eau claire, il se tient plus loin. 25 points.",
  vent: "Un vent de mer modéré lève du clapot, teinte l'eau et met le bar en chasse sur un spot exposé ; vent de terre et mer plate : eau claire, poisson méfiant. Le plus gros critère : 30 points. Au-delà de la force 5, c'est la sécurité qui décide.",
};
export function meteo(s) {
  const c = conditions(s), M = s.model, v2 = s.v2;
  if (!M) return null;
  const regime = regimeOf(v2), expo = exposureOf(v2, c.windFrom), [lo, o1, o2, hi] = v2.coefBand || [30, 45, 75, 105];
  const tab = VENT_MER[regime][expo], best = Math.max(...tab), bestF = tab.indexOf(best);
  const span2 = `${hhmm(M.win.from)}–${hhmm(M.win.to)}`;
  const today = {
    fenetre: `« ${M.win.label} », ${span2} : ${M.win.priority === "prime" ? "une fenêtre « prime » de la fiche" : "une « bonne » fenêtre de la fiche (une « prime » vaudrait 25)"}.`,
    coef: `Coefficient ${c.coef} : ${c.coef < o1 ? `sous la plage utile du spot (${o1} à ${o2})` : c.coef <= o2 ? `dans la plage utile du spot (${o1} à ${o2})` : `au-dessus de la plage utile du spot (${o1} à ${o2})`}.`,
    lumiere: `Le créneau ${span2} se passe surtout ${{ aube: `à l'aube (lever à ${hhmm(SUN.rise)})`, crepuscule: `au crépuscule (coucher à ${hhmm(SUN.set)})`, nuit: "de nuit", jour: "en plein jour" }[M.band]}.`,
    vent: `Vent de ${compass(c.windFrom)}, ${c.windKn} nds (force ${c.windBft}) : ${EXPO_LABEL[expo]} sur un ${REGIME_LABEL[regime]}. Le maximum, ${best} points, est à force ${bestF}.`,
  };
  const curve = {
    fenetre: `« prime » ${PTS.fenetre.prime} · « bonne » ${PTS.fenetre.bon} · hors fenêtre : pas de créneau`,
    coef: `${PTS.coef} de ${o1} à ${o2} ; baisse jusqu'à 0 à ${lo} et à ${hi}`,
    lumiere: `aube ou crépuscule ${PTS.lumiere.aube} · nuit ${PTS.lumiere.nuit} · plein jour ${PTS.lumiere.jour}, + ${PTS.lumiere.couvert} ciel couvert, + ${PTS.lumiere.merFormee} mer formée`,
    vent: `${EXPO_LABEL[expo]}, ${REGIME_LABEL[regime]}, force 0 à 7 : ${tab.join(" · ")}`,
  };
  const rules = { fenetre: rule("maree-flot"), coef: rule("coefficient-plage-utile"), lumiere: rule("lumiere-basse"), vent: rule("vent-exposition") };
  const crit = M.crit.map((x) => ({ ...x, short: { fenetre: "Marée", coef: "Coef.", lumiere: "Lumière", vent: "Vent et mer" }[x.k], long: { fenetre: "Marée", coef: "Coefficient", lumiere: "Lumière", vent: "Vent et mer" }[x.k], weightWhy: WEIGHT_WHY[x.k], today: today[x.k], curve: curve[x.k], rule: rules[x.k] }));
  const excluded = M.excluded.map((x) => ({ ...x, short: "Vent et mer", weightWhy: WEIGHT_WHY[x.k], rule: rules[x.k] }));
  const P = M.pres;
  const pres = {
    factor: P.factor, rule: rule("seuils-thermiques"),
    weightWhy: "Le bar quitte la côte l'hiver pour frayer au large (marquages Ifremer) et l'eau froide le rend moins actif : quand il n'est pas là, les conditions n'y changent rien. La note est multipliée par la plus restrictive des deux.",
    today: `${P.season.month[0].toUpperCase()}${P.season.month.slice(1)} : ${String(P.season.factor).replace(".", ",")} (${P.season.label}) ; eau à ${P.thermal.sst} °C : ${String(P.thermal.factor).replace(".", ",")} (${P.thermal.label}) ; on retient ${String(P.factor).replace(".", ",")}.`,
  };
  const info = [
    { key: "pression", label: "Pression", value: `${c.pressure} hPa, ${c.trend}`, why: "Son effet sur le bar n'est pas démontré : elle est affichée, elle ne compte pas.", rule: rule("pression") },
    { key: "rafales", label: "Rafales", value: `${KN(c.gustKmh)} nds`, why: "Sous 60 km/h, elles gênent le lancer sans changer la note ; au-delà, la sécurité met « à vérifier ».", rule: rule("rafales-penalite") },
    { key: "pluie", label: "Pluie et clarté de l'eau", value: `${c.rain} %`, why: "Une eau teintée change le choix des leurres (couleur, taille), pas la note.", rule: rule("pluie-turbidite") },
  ];
  return { M, c, crit, excluded, pres, info, formula: { got: M.got, max: M.max, cond: M.cond, pres: P.factor, fav: M.fav } };
}

/** Signe d'un effet : un mot et une forme, jamais la couleur seule. */
export const EFFECT = {
  fav: { word: "Favorable", glyph: "+" }, defav: { word: "Défavorable", glyph: "−" }, neutre: { word: "Neutre", glyph: "=" }, inconnu: { word: "Inconnu", glyph: "?" },
};
export const ptsEffect = (p) => (p == null ? "inconnu" : p > 0 ? "fav" : p < 0 ? "defav" : "neutre");
