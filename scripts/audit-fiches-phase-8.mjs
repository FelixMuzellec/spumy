// Phase 8 V3 — contrôle par échantillonnage stratifié et par risque des fiches de spots (référentiel, phase 8).
// Strates, du plus au moins risqué : TOP_TIER et corroborées (toutes) ; postes engagés (toutes) ; contrainte de marée
// connue (toutes) ; position douteuse, QUAL-3 en échec (toutes) ; candidats V3 et fiches V2 restantes (une sur trois, tirage
// à graine fixe). Chaque fiche tirée passe les mêmes contrôles automatiques :
//   P position (boîte Bretagne-Cotentin, contrôle IGN, écart au toponyme) ; S sources (nombre, groupes indépendants, sources
//   absentes du registre, sources non évaluées) ; D dates (vérification datée) ; M marée (phases documentées, phases non
//   documentées nommées) ; G dangers (engagement, consignes sourcées, accès selon la marée, fenêtre de sécurité) ;
//   C contradictions (texte qui parle de marée ou d'isolement sans contrainte connue, poste « facile » décrit comme engagé,
//   TOP_TIER avec un critère en échec, statut sans preuve) ; I site isolé ; T critères TOP_TIER (les sept, sans note ni popularité).
// Ce contrôle relit les fiches ; il ne remplace pas une visite : la réalité du lieu est contrôlée à part, sur les pages
// publiques, pour un sous-échantillon (docs/validation/AUDIT-FICHES-PHASE-8.md).
// Sortie déterministe : data/spots/audit-phase-8.json.   --verifier : code 1 si le fichier n'est pas à jour.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { alea } from "./etude-moteur-bord/zinb.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SORTIE = path.join(RACINE, "data/spots/audit-phase-8.json");
const DOSSIER = path.join(RACINE, "data/spots/fiches");
const REGISTRE = new Map(JSON.parse(fs.readFileSync(path.join(RACINE, "data/sources/registre.json"), "utf8")).sources.map((s) => [s.id, s]));
const PHASES = ["haute", "basse", "montante", "descendante"];
const CRITERES = ["QUAL-1", "QUAL-2", "QUAL-3", "QUAL-4", "QUAL-5", "QUAL-6", "QUAL-7"];
const inconnu = (x) => !x || x.statut === "INCONNU";
const texteDe = (f) => JSON.stringify([f.safety?.consignes, f.access, f.environment, f.tide_approaches]).toLowerCase();

export function strate(f) {
  const st = f.quality?.statut, eng = f.safety?.engagement;
  if (st === "TOP_TIER" || st === "corroboree") return "1-top-tier-corroboree";
  if (!inconnu(eng) && eng.valeur >= 3) return "2-poste-engage";
  if (!inconnu(f.safety?.acces_maree) && (f.safety.acces_maree.valeur || []).length) return "3-contrainte-maree";
  if (!f.quality?.criteres?.["QUAL-3"]?.ok) return "4-position-douteuse";
  return f.origin === "v2_preserved" ? "6-v2-autres" : "5-candidat-v3";
}

export function controler(f) {
  const c = [], k = f.quality?.criteres || {};
  const add = (code, grave, texte) => c.push({ code, grave, texte });
  // P — position.
  const { lat, lon } = f.coordinates || {};
  if (!(lat >= 47.2 && lat <= 49.8 && lon >= -5.2 && lon <= -1.0)) add("P", true, `position hors de la Bretagne et du Cotentin (${lat}, ${lon})`);
  const ctl = f.coordinates?.controle;
  if (inconnu(ctl)) add("P", false, "position jamais contrôlée par l'IGN");
  else if ((ctl.valeur?.ecart_m ?? 0) > 1500) add("P", false, `toponyme IGN à ${ctl.valeur.ecart_m} m`);
  // S — sources.
  const src = f.provenance?.sources || [];
  const absentes = src.filter((s) => !REGISTRE.has(s));
  if (absentes.length) add("S", true, `sources absentes du registre : ${absentes.join(", ")}`);
  const halieutiques = src.map((s) => REGISTRE.get(s)).filter((s) => s && s.famille >= 1 && s.famille <= 4);
  const groupes = new Set(halieutiques.map((s) => s.groupe));
  if (groupes.size < 2) add("S", false, `${groupes.size} groupe indépendant de sources halieutiques`);
  const nonEvaluees = halieutiques.filter((s) => s.evaluation?.statut === "à évaluer").length;
  // D — dates.
  if (!f.quality?.derniere_verification) add("D", false, "aucune date de dernière vérification");
  // M — marée : phases documentées et non documentées.
  const docs = PHASES.filter((p) => !inconnu(f.tide_approaches?.[p])), nonDocs = PHASES.filter((p) => !docs.includes(p));
  if (!docs.length) add("M", false, "aucune phase de marée documentée");
  // G — dangers.
  const consignes = f.safety?.consignes || [], sourcees = consignes.filter((x) => x.source_texte || (x.sources || []).length).length;
  const contrainte = !inconnu(f.safety?.acces_maree) && (f.safety.acces_maree.valeur || []).length > 0;
  if (inconnu(f.safety?.engagement)) add("G", false, "engagement inconnu");
  if (inconnu(f.safety?.acces_maree)) add("G", false, "accès selon la marée inconnu");
  if (contrainte && inconnu(f.windows?.securite)) add("G", true, "contrainte de marée connue sans fenêtre de sécurité : jamais présenté comme praticable");
  // C — contradictions.
  const t = texteDe(f);
  // « isolé » seul désigne souvent un site reculé (zone isolée), pas un isolement par la marée : compté à part (I).
  if (!contrainte && /isolé(?:e|s)? par la (?:marée|mer)|isolement au flot|piégé|coupe(?:r|nt)? le retour|retour coupé|submersible|encercl/.test(t)) add("C", true, "le texte parle d'isolement par la marée ou de retour coupé, sans contrainte de marée connue");
  if (/site isolé|zone isolée|isolée?s?\b(?! par)/.test(t)) add("I", false, "site isolé (secours plus lents) : attention accrue");
  if (!inconnu(f.safety?.engagement) && f.safety.engagement.valeur === 1 && /\bengagé|dangereu|à pic/.test(JSON.stringify(f.safety?.consignes || []).toLowerCase())) add("C", true, "poste « facile » (1) décrit comme engagé ou dangereux par ses consignes");
  if (f.quality?.statut === "TOP_TIER" && CRITERES.some((q) => !k[q]?.ok)) add("C", true, "TOP_TIER avec un critère en échec");
  // T — TOP_TIER : les sept critères, rien d'autre (ni note, ni popularité).
  const tousOk = CRITERES.every((q) => k[q]?.ok === true);
  if (tousOk !== (f.quality?.statut === "TOP_TIER" || f.quality?.statut === "reglementee" || f.quality?.statut === "inaccessible")) add("T", true, `statut ${f.quality?.statut} incohérent avec ses critères`);
  return { id: f.id, nom: f.name, origine: f.origin, statut: f.quality?.statut, strate: strate(f),
    phasesDocumentees: docs, phasesNonDocumentees: nonDocs, sources: src.length, groupesIndependants: groupes.size, sourcesNonEvaluees: nonEvaluees,
    engagement: inconnu(f.safety?.engagement) ? null : f.safety.engagement.valeur, consignes: consignes.length, consignesSourcees: sourcees,
    contrainteMaree: contrainte, fenetreSecurite: !inconnu(f.windows?.securite), constats: c };
}

export function auditer() {
  const fiches = fs.readdirSync(DOSSIER).filter((x) => x.endsWith(".json")).sort().map((x) => JSON.parse(fs.readFileSync(path.join(DOSSIER, x), "utf8")));
  const u = alea(20261127), parStrate = {}, tirees = [];
  for (const f of fiches) (parStrate[strate(f)] ||= []).push(f);
  for (const [s, l] of Object.entries(parStrate).sort()) {
    const toutes = !s.startsWith("5") && !s.startsWith("6");
    const choisies = toutes ? l : l.map((f) => [u(), f]).sort((a, b) => a[0] - b[0]).slice(0, Math.ceil(l.length / 3)).map((x) => x[1]);
    for (const f of choisies) tirees.push(controler(f));
  }
  const graves = tirees.filter((x) => x.constats.some((c) => c.grave));
  const compte = (code) => tirees.filter((x) => x.constats.some((c) => c.code === code)).length;
  // Toutes les fiches (pas seulement l'échantillon) pour les contrôles graves qu'une relecture ne doit jamais laisser passer.
  const toutesGraves = fiches.map(controler).filter((x) => x.constats.some((c) => c.grave && c.code !== "G"));
  return { "//": "Audit stratifié de la phase 8 V3. Régénérer : node scripts/audit-fiches-phase-8.mjs. Lecture : docs/validation/AUDIT-FICHES-PHASE-8.md",
    fiches: fiches.length, tirees: tirees.length,
    strates: Object.fromEntries(Object.entries(parStrate).sort().map(([s, l]) => [s, { fiches: l.length, tirees: tirees.filter((x) => x.strate === s).length }])),
    constatsParCode: Object.fromEntries(["P", "S", "D", "M", "G", "C", "I", "T"].map((c) => [c, compte(c)])),
    phasesNonDocumentees: Object.fromEntries(PHASES.map((p) => [p, tirees.filter((x) => x.phasesNonDocumentees.includes(p)).length])),
    fichesAvecConstatGrave: graves.map((x) => ({ id: x.id, constats: x.constats.filter((c) => c.grave).map((c) => `${c.code} : ${c.texte}`) })),
    graveHorsSecuriteSurToutesLesFiches: toutesGraves.map((x) => ({ id: x.id, constats: x.constats.filter((c) => c.grave && c.code !== "G").map((c) => `${c.code} : ${c.texte}`) })),
    echantillon: tirees };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const r = JSON.stringify(auditer(), null, 1) + "\n";
  if (process.argv.includes("--verifier")) {
    const ok = fs.existsSync(SORTIE) && fs.readFileSync(SORTIE, "utf8") === r;
    console.log(ok ? "audit des fiches de la phase 8 à jour" : "audit des fiches périmé : node scripts/audit-fiches-phase-8.mjs");
    process.exit(ok ? 0 : 1);
  }
  fs.writeFileSync(SORTIE, r);
  console.log(`écrit ${path.relative(RACINE, SORTIE)}`);
}
