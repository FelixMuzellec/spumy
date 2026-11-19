// Phase 13 — Moteur BATEAU : les 16 scénarios de référence de la spécification (docs/SPEC-MOTEUR-BATEAU.md, § 10)
// et les règles des trois scores. Usage : node tests/bateau.mjs
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, "..");
fs.mkdirSync(path.join(here, ".build"), { recursive: true });
const out = path.join(here, ".build", "bateau_engine.mjs");
await build({ entryPoints: [path.join(root, "src/bateau/engine/index.js")], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "warning" });
const E = await import(out + `?t=${Date.now()}`);

let pass = 0, fail = 0;
const t = (n, c, info = "") => { c ? pass++ : (fail++, console.log(`   ÉCHEC · ${n}${info ? " — " + info : ""}`)); };

// Un créneau de 7 h à 12 h (heure de Paris, été : UTC+2) le 15 juillet 2026, une heure par heure.
const day = "2026-07-15";
const at = (h) => Date.parse(`${day}T${String(h - 2).padStart(2, "0")}:00:00Z`);
const SUN = { rise: at(6) + 30 * 6e4, set: at(22) };
const calm = (h, x = {}) => ({ t: at(h), wind: 12, gust: 20, wave: 0.4, period: 7, visibility: 20000, code: 1, cape: 50, ...x });
const hours = (fn = (h) => calm(h)) => [7, 8, 9, 10, 11, 12].map(fn);
const PORT = { name: "Moulin Blanc", lat: 48.3903, lon: -4.4318 };
const ZONE = { id: "z1", name: "Tombant", lat: 48.35, lon: -4.52, type: "tombant", depth: 32 };   // ≈ 4,3 milles du port
const PROFILE = { categorie: "C", armement: "cotier", abris: [PORT], vitesseNds: 15, seul: false, canne: { min: 90, max: 210 } };
const base = { profile: PROFILE, zone: ZONE, hours: hours(), start: at(7), end: at(12), sun: SUN, ageH: 2, date: day };
const safety = (x = {}) => E.tripSafety({ ...base, ...x });
const rule = (r, id) => r.rules.find((x) => x.id === id);

// Référence : une belle journée est verte.
{
  const r = safety();
  t("journée calme : sortie au vert", r.status === "ok", JSON.stringify(r.rules.filter((x) => x.status !== "ok")));
  t("distance d'un abri calculée (≈ 4 milles)", r.distanceMilles > 3.5 && r.distanceMilles < 5, String(r.distanceMilles));
}
// B1 — force 7 à 10 h sur un créneau de 7 h à 12 h : non recommandé (BMS, pire moment).
{
  const r = safety({ hours: hours((h) => calm(h, h === 10 ? { wind: 55, gust: 75 } : {})) });
  t("B1 : force 7 à 10 h → non recommandé", r.status === "nr" && rule(r, "SEC_BMS").status === "nr" && /10 h/.test(rule(r, "SEC_BMS").reason), rule(r, "SEC_BMS").reason);
}
// B2 — catégorie D, vagues de 0,6 m : non recommandé (catégorie).
{
  const r = safety({ profile: { ...PROFILE, categorie: "D" }, hours: hours((h) => calm(h, { wave: 0.6 })) });
  t("B2 : catégorie D, 0,6 m → non recommandé (catégorie)", r.status === "nr" && rule(r, "SEC_CATEGORIE").status === "nr");
}
// B3 — zone à 7 milles d'un abri, armement côtier : non recommandé (Division 240).
{
  const loin = { ...ZONE, lat: 48.30, lon: -4.62 };
  const d = E.milles(PORT, loin);
  const r = safety({ zone: loin });
  t("B3 : zone au-delà de 6 milles, armement côtier → non recommandé", d > 6 && r.status === "nr" && rule(r, "SEC_ARMEMENT").status === "nr", `${d}`);
}
// B4 — vent inconnu : à vérifier, jamais au vert.
{
  const r = safety({ hours: hours((h) => calm(h, h === 9 ? { wind: null } : {})) });
  t("B4 : vent inconnu → à vérifier", r.status === "verify" && rule(r, "SEC_VENT").status === "verify");
}
// B5 — visibilité 0,3 mille : non recommandé ; inconnue : à vérifier.
{
  const r1 = safety({ hours: hours((h) => calm(h, h === 8 ? { visibility: 0.3 * 1852 } : {})) });
  const r2 = safety({ hours: hours((h) => calm(h, { visibility: null })) });
  t("B5 : brume (0,3 mille) → non recommandé", r1.status === "nr" && rule(r1, "SEC_VISIBILITE").status === "nr");
  t("B5 : visibilité inconnue → à vérifier", r2.status === "verify" && rule(r2, "SEC_VISIBILITE").status === "verify");
}
// B6 — raz : sans courant fiable, jamais au vert (non recommandé quand vent contre courant sera lisible).
{
  const r = safety({ zone: { ...ZONE, raz: true } });
  t("B6 : zone de raz → à vérifier au moins, jamais au vert", r.status !== "ok" && rule(r, "SEC_RAZ").status !== "ok");
}
// B7 — retour après le coucher du soleil : à vérifier.
{
  const r = safety({ start: at(19), end: at(23), hours: [19, 20, 21, 22, 23].map((h) => calm(h)) });
  t("B7 : retour après le coucher du soleil → à vérifier", rule(r, "SEC_NUIT").status === "verify" && r.status !== "ok");
}
// B8 — lieu jaune le 15 mars : non proposé, raison réglementaire.
{
  const z = E.evaluateZone({ ...base, date: "2026-03-15", start: at(7), end: at(12) });
  const lj = z.species.nonProposees.find((x) => x.id === "lieu-jaune");
  t("B8 : lieu jaune le 15 mars → non proposé (réglementation)", !!lj && /réglementation/.test(lj.reason) && !z.species.especes.some((x) => x.id === "lieu-jaune"));
  t("B8 : le 15 juillet, le lieu jaune est proposé", E.evaluateZone(base).species.especes.some((x) => x.id === "lieu-jaune"));
}
// B9 — maquereau en janvier, puis en juillet avec une eau à 16 °C.
{
  const jan = E.presence("maquereau", { date: "2026-01-15", sst: 10 }), jul = E.presence("maquereau", { date: "2026-07-15", sst: 16 });
  t("B9 : maquereau, présence faible en janvier, forte en juillet", jan.f <= 0.3 && jul.f === 1);
}
// B10 — vieille de nuit : favorabilité basse (lumière).
{
  const ctx = { zone: { type: "roche", depth: 12 }, date: day, bf: 2, wave: 0.4, tide: { coef: 70 } };
  const jour = E.favorability("vieille", { ...ctx, light: "jour" }), nuit = E.favorability("vieille", { ...ctx, light: "nuit" });
  t("B10 : vieille de nuit plus basse que de jour", nuit.fav < jour.fav - 15, `${nuit.fav} / ${jour.fav}`);
}
// B11 — conditions de pêche parfaites et force 7 : non recommandé, la sécurité ne se compense pas.
{
  const z = E.evaluateZone({ ...base, hours: hours((h) => calm(h, h === 11 ? { wind: 52, gust: 70 } : {})), tide: { phase: "etabli", coef: 80 } });
  t("B11 : force 7 → non recommandé malgré la favorabilité", z.safety.status === "nr" && z.species.especes[0].fav > 50);
}
// B12 — deux zones qui ne diffèrent que par la confiance : même rang (la confiance ne classe pas).
{
  const A = E.evaluateZone({ ...base, ageH: 1 }), B = E.evaluateZone({ ...base, ageH: 11 });
  t("B12 : la confiance change, le classement des espèces non", JSON.stringify(A.species.especes.map((x) => x.id)) === JSON.stringify(B.species.especes.map((x) => x.id)) && A.species.especes[0].conf.score > B.species.especes[0].conf.score);
}
// B13 — lieu noir sans sortie qui en a pris : non proposé ; avec des prises : proposé, confiance faible.
{
  const sans = E.evaluateZone(base), avec = E.evaluateZone({ ...base, caught: { "lieu-noir": 2 } });
  t("B13 : lieu noir non proposé sans prise", sans.species.nonProposees.some((x) => x.id === "lieu-noir"));
  const ln = avec.species.especes.find((x) => x.id === "lieu-noir");
  t("B13 : lieu noir proposé avec des prises, confiance faible ou moyenne", !!ln && ln.conf.label !== "haute");
}
// B14 — 5 sorties seulement : pas d'ajustement personnel.
{
  t("B14 : 5 sorties → aucun ajustement ; 8 → ±10 au plus", E.personalAdjust(8, 5) === 0 && E.personalAdjust(25, 8) === 10 && E.personalAdjust(-25, 9) === -10);
}
// B15 — vent qui forcit pendant le créneau : le maximum compte.
{
  const r = safety({ hours: hours((h) => calm(h, { wind: 8 + (h - 7) * 8, gust: 12 + (h - 7) * 10 })) });   // 8 → 48 km/h (force 6 à midi)
  t("B15 : le vent maximal du créneau décide (force 6 à 12 h)", r.worst.bf === 6 && r.status === "nr" && /12 h/.test(rule(r, "SEC_VENT").reason), rule(r, "SEC_VENT").reason);
}
// B16 — seul à bord, force 4 : à vérifier (le seuil descend d'un cran).
{
  const f4 = hours((h) => calm(h, { wind: 22, gust: 30 }));
  const accompagne = safety({ hours: f4 }), seul = safety({ hours: f4, profile: { ...PROFILE, seul: true } });
  t("B16 : force 4 accompagné → vent au vert ; seul à bord → à vérifier", rule(accompagne, "SEC_VENT").status === "ok" && rule(seul, "SEC_VENT").status === "verify");
}

// Règles générales
{
  t("profil incomplet : le moteur dit ce qui manque", E.profileProblems({}).length === 3 && E.profileProblems(PROFILE).length === 0);
  t("Beaufort : 28 km/h → force 4, 62 km/h → force 8", E.beaufort(28) === 4 && E.beaufort(62) === 8);
  const z = E.evaluateZone(base);
  t("trois scores sur 100, jamais fusionnés", z.species.especes.every((x) => (x.fav == null || (x.fav >= 0 && x.fav <= 100)) && x.pert.score >= 0 && x.pert.score <= 100 && x.conf.score >= 0 && x.conf.score <= 100 && !("note" in x)));
  const sp = z.species.especes.find((x) => x.id === "saint-pierre");
  t("saint-pierre : pas de note (moins de la moitié des critères connus), confiance faible", sp && sp.fav == null && sp.conf.label === "faible");
  t("espèces classées par favorabilité, sans note à la fin", z.species.especes.every((x, i, a) => i === 0 || (a[i - 1].fav == null ? x.fav == null : x.fav == null || a[i - 1].fav >= x.fav)));
  t("rappels de sécurité toujours présents (aide à la flottabilité, canal 16, BMS)", E.RAPPELS.length >= 4 && E.RAPPELS.some((r) => /canal 16/.test(r)) && E.RAPPELS.some((r) => /BMS/.test(r)));
  const trip = E.evaluateTrip({ ...base, zones: [ZONE, { ...ZONE, id: "z2", lat: 48.30, lon: -4.62 }] });
  t("plusieurs zones : la zone sûre passe devant la zone non recommandée", trip.zones[0].zone.id === "z1" && trip.zones[1].safety.status === "nr" && trip.status === "ok");
  t("route : temps depuis le port à ta vitesse", Math.round(E.routeMinutes(PROFILE, ZONE)) > 10 && Math.round(E.routeMinutes(PROFILE, ZONE)) < 25);
}

console.log(`[moteur BATEAU] 16 scénarios de la spécification et règles : ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
