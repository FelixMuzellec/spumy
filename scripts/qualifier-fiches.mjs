// Phase 5 V3, sous-tâche 5.9 : qualification de chaque fiche selon des critères explicites (référentiel § 7.2 et
// livrable « qualifier chaque fiche : candidate, à vérifier, corroborée, TOP_TIER, inaccessible, réglementée »).
// Les critères sont décrits dans docs/halieutique/QUALIFICATION.md ; ce script les applique et écrit, pour chaque
// fiche, quality.statut, quality.criteres (vrai ou faux, avec le détail) et quality.raisons. Il ne touche à aucune
// autre donnée. Le test tests/spots-v3.mjs recalcule chaque statut avec la même fonction.
//   node scripts/qualifier-fiches.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { texteNommeLeSpot } from "./noms.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const JOUR = "2026-11-23";
/** Domaines d'éditeur qui peuvent porter l'intérêt halieutique d'un spot (data/sources/editeurs.json). */
const HALIEUTIQUE = /halieutique|spots|technique|conditions locales|présence d'espèces/;
/** Une source ne corrobore un spot que si sa citation le nomme : un article général (« les plateaux rocheux ») ne prouve
 *  rien d'un lieu précis. */
/** Citation qui parle de pêche en bateau, de navigation, ou dit ne pas parler du bar : n'atteste pas un poste du bord. */
const PAS_BORD = /en bateau|pêche en bateau|navigation|voilier|ne parle ni/i;
const ANOMALIE_POSITION = /^Position V2 |^Coordonnées V2 seulement en texte|^Aucun toponyme|^Position d'un lieu habité|^Position d'un équipement de loisirs/;
const ANOMALIE_ZONE = /48ᵉ parallèle/;

export function sourcesParSpot(registre) {
  const m = new Map();
  for (const s of registre.sources) for (const u of s.utilise_par || []) if (u.startsWith("spot:")) (m.get(u.slice(5)) || m.set(u.slice(5), []).get(u.slice(5))).push(s);
  return m;
}
const connu = (i) => i && i.statut !== "INCONNU";

/** Critères QUAL-1 à QUAL-7 et statut d'une fiche. Fonction pure : même résultat dans le script et dans le test. */
export function qualifier(f, sources) {
  const hal = sources.filter((s) => !s.prive && s.famille != null && s.famille <= 4 && HALIEUTIQUE.test((s.editeur_classe?.domaines || []).join(" ")) && !PAS_BORD.test(s.texte) && texteNommeLeSpot(f.name, `${s.texte} ${s.evaluation?.affirmation || ""}`));
  const groupes = [...new Set(hal.map((s) => s.groupe))].sort();
  const nonClasses = sources.filter((s) => !s.prive && s.famille == null).length;
  const lues = hal.filter((s) => s.evaluation?.statut === "évaluée");
  const groupesLus = [...new Set(lues.map((s) => s.groupe))];
  const barLu = lues.some((s) => s.evaluation?.bar_au_poste === true);
  const posAnom = f.quality.anomalies.filter((a) => ANOMALIE_POSITION.test(a));
  const posOk = (f.coordinates.info.origine === "v3" && f.coordinates.info.statut === "VÉRIFIÉ") || (f.coordinates.controle?.statut === "VÉRIFIÉ" && (f.coordinates.controle.valeur?.ecart_m ?? 9e9) <= 1500);
  const aVerifier = f.regulations.filter((r) => r.valeur?.application_au_poste === "à vérifier");
  const zone = f.quality.anomalies.some((a) => ANOMALIE_ZONE.test(a));
  const s = f.safety;
  const c = {
    "QUAL-1": { ok: groupes.length >= 2, detail: `${groupes.length} groupe${groupes.length > 1 ? "s" : ""} d'indépendance halieutique (famille 1 à 4)${groupes.length ? ` : ${groupes.join(", ")}` : ""}${nonClasses ? ` ; ${nonClasses} source${nonClasses > 1 ? "s" : ""} d'éditeur non classé, non comptée${nonClasses > 1 ? "s" : ""}` : ""}` },
    "QUAL-2": { ok: groupesLus.length >= 2 && barLu, detail: `${groupesLus.length} groupe${groupesLus.length > 1 ? "s" : ""} d'indépendance parmi les sources lues page par page (${lues.length} sur ${hal.length}) ; ${barLu ? "au moins une attache le bar au poste" : "aucune n'attache le bar au poste"}` },
    "QUAL-3": { ok: posOk && !posAnom.length, detail: posAnom.length ? posAnom.join(" ") : posOk ? "position contrôlée par l'IGN (toponyme officiel à 1,5 km au plus) ou corrigée" : "position non contrôlée" },
    "QUAL-4": { ok: connu(f.access.stationnement) && connu(f.access.marche_min), detail: connu(f.access.stationnement) && connu(f.access.marche_min) ? `stationnement et marche documentés (${f.access.marche_min.valeur} min)` : "stationnement ou temps de marche inconnu" },
    "QUAL-5": { ok: connu(s.engagement) && s.consignes.length > 0 && !!s.acces_maree && !!s.mouvements_terrain, detail: `engagement ${connu(s.engagement) ? s.engagement.valeur : "inconnu"}, ${s.consignes.length} consigne${s.consignes.length > 1 ? "s" : ""}, contrainte de marée ${s.acces_maree?.valeur?.join(", ") || "non documentée"}, mouvements de terrain ${s.mouvements_terrain?.valeur?.total ?? 0}` },
    "QUAL-6": { ok: !aVerifier.length && !zone, detail: [...aVerifier.map((r) => `règle locale à vérifier au poste (${r.valeur.portee})`), ...(zone ? ["zone CIEM 7 ou 8 incertaine (48ᵉ parallèle)"] : [])].join(" ; ") || "réglementation nationale seule, sans règle locale à vérifier" },
    "QUAL-7": { ok: !sources.some((s) => s.prive), detail: sources.some((s) => s.prive) ? "cite le journal personnel de Félix : à retirer de la fiche publique" : "aucune source privée" },
  };
  const ok = (...k) => k.every((x) => c[x].ok);
  let statut;
  if (f.regulations.some((r) => r.valeur?.interdit_au_poste === true)) statut = "reglementee";
  else if (f.access.ferme?.statut === "VÉRIFIÉ") statut = "inaccessible";
  else if (ok("QUAL-1", "QUAL-2", "QUAL-3", "QUAL-4", "QUAL-5", "QUAL-6", "QUAL-7")) statut = "TOP_TIER";
  else if (ok("QUAL-1", "QUAL-3", "QUAL-4", "QUAL-5", "QUAL-6", "QUAL-7")) statut = "corroboree";
  else statut = f.origin === "v3_researched" ? "candidate" : "a_verifier";
  const vise = statut === "corroboree" ? ["QUAL-2"] : ["QUAL-1", "QUAL-3", "QUAL-4", "QUAL-5", "QUAL-6", "QUAL-7"];
  const raisons = ["reglementee", "inaccessible", "TOP_TIER"].includes(statut) ? [] : vise.filter((k) => !c[k].ok).map((k) => `${k} : ${c[k].detail}`);
  return { statut, criteres: c, raisons };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const registre = JSON.parse(fs.readFileSync(path.join(root, "data/sources/registre.json"), "utf8"));
  const parSpot = sourcesParSpot(registre);
  const bilan = {}, manque = {};
  for (const { fichier, fiche: f } of lireFiches()) {
    const q = qualifier(f, parSpot.get(f.id) || []);
    f.quality.statut = q.statut; f.quality.criteres = q.criteres; f.quality.raisons = q.raisons; f.quality.derniere_verification = JOUR;
    fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
    bilan[q.statut] = (bilan[q.statut] || 0) + 1;
    for (const [k, v] of Object.entries(q.criteres)) if (!v.ok) manque[k] = (manque[k] || 0) + 1;
  }
  ecrireRegistre();
  console.log("[qualification] statuts :", bilan, "; critères non remplis :", manque);
}
