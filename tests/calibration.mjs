// Phase 8 V3 — calibration et épreuve du moteur BORD (PF-34 ; indicateurs K-01 à K-03 ; plan de validation V-01 à V-04).
//   1. L'outil de vérification (scripts/calibration/verification.mjs) calcule juste sur des cas connus à la main.
//   2. Ses garde-fous tiennent : note non figée écartée, résultat inconnu jamais compté comme un zéro, aucune mesure sous
//      le seuil de sorties ni sans bredouille déclarée, aucun Brier sur la Favorabilité, export du journal refusé dans le dépôt.
//   3. Les jeux synthétiques et l'épreuve sur les journées archivées sont à jour, et leurs critères fixés d'avance tiennent.
//   4. L'audit stratifié des fiches est à jour et ne trouve aucune contradiction grave hors sécurité.
// Usage : node tests/calibration.mjs
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { brier, brierSkill, auc, penteFiabilite, verifier, trier, dansLeDepot, SEUILS } from "../scripts/calibration/verification.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
let pass = 0, fail = 0;
const t = (name, ok, detail = "") => { if (ok) pass++; else { fail++; console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`); } };
const proche = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

// ——— 1. Calculs sur des cas connus ———
t("Brier : (0,5 − 1)² = 0,25", proche(brier([0.5], [1]), 0.25));
t("Brier : prévision parfaite = 0", brier([1, 0, 1], [1, 0, 1]) === 0);
t("Brier skill : la fréquence observée elle-même vaut 0", proche(brierSkill([0.5, 0.5], [1, 0]), 0));
t("Brier skill : prévision parfaite = 1", proche(brierSkill([1, 0], [1, 0]), 1));
t("AUC : séparation parfaite = 1", auc([0.9, 0.8, 0.2, 0.1], [1, 1, 0, 0]) === 1);
t("AUC : inversée = 0", auc([0.1, 0.2, 0.8, 0.9], [1, 1, 0, 0]) === 0);
t("AUC : ex æquo comptés pour moitié", auc([0.5, 0.5], [1, 0]) === 0.5);
t("AUC : sans bredouille, pas de valeur", auc([0.5, 0.6], [1, 1]) === null);
{ // Pente de fiabilité : données construites pour une pente 1 et une ordonnée 0 (fréquences égales aux chances).
  const p = [], y = [];
  for (const [q, n] of [[0.2, 50], [0.5, 50], [0.8, 50]]) for (let i = 0; i < n; i++) { p.push(q); y.push(i < q * n ? 1 : 0); }
  const f = penteFiabilite(p, y);
  t("pente de fiabilité : fréquences égales aux chances → pente 1, ordonnée 0", !!f && proche(f.pente, 1, 1e-6) && proche(f.intercept, 0, 1e-6), JSON.stringify(f));
  const tr = penteFiabilite(p.map((q) => 1 / (1 + Math.exp(-2 * Math.log(q / (1 - q))))), y);
  t("pente de fiabilité : chances deux fois trop tranchées → pente 0,5", !!tr && proche(tr.pente, 0.5, 1e-6), JSON.stringify(tr));
  t("pente de fiabilité : séparation parfaite → pas de valeur", penteFiabilite([0.9, 0.9, 0.1, 0.1], [1, 1, 0, 0]) === null);
}

// ——— 2. Garde-fous ———
const s = (o) => ({ noteFigee: true, favorabilite: 60, resultat: "prise", prises: 1, heures: 2, ...o });
{ const { gardees, ecartees } = trier([s({ noteFigee: false }), s({ resultat: "inconnu", prises: undefined }), s({ resultat: undefined }), s({}), s({ resultat: "bredouille", prises: 0 }), s({ resultat: "prise", prises: 0 }), s({ heures: 0 })]);
  t("tri : note non figée écartée", ecartees.nonFigee === 1);
  t("tri : résultat inconnu ou absent écarté, jamais compté comme un zéro", ecartees.resultatInconnu === 2 && gardees.filter((x) => x.y === 0).length === 1);
  t("tri : sortie incohérente écartée (prise sans poisson, durée nulle)", ecartees.incoherente === 2 && gardees.length === 2); }
{ const v = verifier([s({}), s({}), s({ resultat: "bredouille", prises: 0 })]);
  t("aucune conclusion sous le seuil de sorties : trois sorties → insuffisant, sans aucun score", v.statut === "insuffisant" && !("favorabilite" in v) && !("chance" in v), JSON.stringify(v)); }
{ const v = verifier(Array.from({ length: 80 }, () => s({})));
  t("aucune bredouille déclarée : biais de sélection, aucune mesure", v.statut === "insuffisant" && v.manque.some((m) => /biais de sélection/.test(m))); }
{ const L = Array.from({ length: SEUILS.sorties + 20 }, (_, i) => s(i % 2 ? { favorabilite: 80 } : { favorabilite: 30, resultat: "bredouille", prises: 0 }));
  const v = verifier(L);
  t("assez de sorties : mesuré ; Favorabilité jugée par discrimination seulement (aucun Brier)", v.statut === "mesuré" && v.favorabilite.auc === 1 && !("brier" in v.favorabilite));
  t("chance de prise non publiée (D6-12) : jamais déduite de la Favorabilité", /non mesurée/.test(v.chance.statut) && !("brier" in v.chance));
  t("Confiance non mesurée sans chance annoncée", /non mesurée/.test(v.confiance.statut));
  const v2 = verifier(L.map((x, i) => ({ ...x, chance: i % 2 ? 0.7 : 0.3, confiance: i % 4 < 2 ? 40 : 80 })));
  t("chance annoncée : Brier, BSS, AUC mesurés à part", v2.chance.statut === "mesurée" && v2.chance.brier === 0.09 && v2.chance.auc === 1, JSON.stringify(v2.chance));
  t("Confiance mesurée à part, sans toucher au rang", v2.confiance.statut === "mesurée" && typeof v2.confiance.coherente === "boolean"); }
t("PF-17 : un export du journal placé dans le dépôt est refusé", dansLeDepot(path.join(root, "journal.json"), root) && dansLeDepot("data/x.json", root) && dansLeDepot(path.join(root, "..x.json"), root) && !dansLeDepot("/tmp/journal.json", root));
{ const lien = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "spumy-lien-")), "export.json"); fs.symlinkSync(path.join(root, "package.json"), lien);
  t("PF-17 : un lien hors du dépôt vers un fichier du dépôt est refusé", dansLeDepot(lien, root)); }
{ let code = 0; try { execFileSync("node", [path.join(root, "scripts/calibration/verification.mjs"), path.join(root, "package.json")], { stdio: "pipe" }); } catch (e) { code = e.status; }
  t("PF-17 : l'outil refuse de lire un fichier du dépôt (code 2)", code === 2); }

// ——— 3. Jeux synthétiques et épreuve à jour ; critères fixés d'avance ———
for (const [f, nom] of [["scripts/calibration/journal-synthetique.mjs", "calibration synthétique"], ["scripts/epreuve-v3/epreuve.mjs", "épreuve de la phase 8"]]) {
  let ok = true; try { execFileSync("node", [path.join(root, f), "--verifier"], { stdio: "pipe" }); } catch { ok = false; }
  t(`${nom} à jour (${f} --verifier)`, ok);
}
const C = JSON.parse(fs.readFileSync(path.join(root, "data/moteur-bord/calibration-synthetique.json"), "utf8"));
const c400 = C.c1_previsionnistesConnus.find((x) => x.sorties === 400);
t("synthétique : un prévisionniste calibré a un BSS positif et une pente proche de 1 à 400 sorties", c400.calibre.partBssPositif === 1 && Math.abs(c400.calibre.pente.mediane - 1) < 0.05);
t("synthétique : des chances trop tranchées sont repérées (pente ≈ 0,5)", Math.abs(c400.tranche.pente.mediane - 0.5) < 0.05);
t("synthétique : sans compétence, AUC 0,5 et BSS jamais positif", c400.sansCompetence.auc.mediane === 0.5 && c400.sansCompetence.partBssPositif === 0);
t("synthétique : bredouilles non notées → fréquence de prise gonflée (biais mesuré)", C.c2_biaisDeSelection.frequenceSelection > C.c2_biaisDeSelection.frequenceComplet + 0.2);
t("synthétique : θ appris sans les zéros surestime le poste", C.c3_apprentissageTheta.a_zerosEtInconnus.sansZeros > 1.3 && Math.abs(C.c3_apprentissageTheta.a_zerosEtInconnus.complet - 1) < 0.1);
t("synthétique : garde-fous de l'outil (trois sorties, sans bredouille, assez de sorties)", C.c4_gardeFous.troisSorties === "insuffisant" && C.c4_gardeFous.soixanteSansBredouille === "insuffisant" && C.c4_gardeFous.soixanteMelangees === "mesuré");
const B = C.c5_bateau, b200 = B.parTaille.find((x) => x.sorties === 200), b7 = B.parTaille[0];
t("BATEAU : pas de modèle sous le minimum de sorties, ni sans aucune prise", b7.ok === false && /nécessaires/.test(b7.raison) && /aucune prise/.test(B.sansAucunePrise));
t("BATEAU : à 200 sorties, le modèle retrouve le sens des vrais effets (vent négatif, coefficient positif) et classe bien hors échantillon", b200.effetVent < 0 && b200.effetCoef > 0 && b200.spearmanHorsEchantillon > 0.85);
const R = JSON.parse(fs.readFileSync(path.join(root, "data/moteur-bord/epreuve-phase-8.json"), "utf8"));
t("V-01 : aucune carte publiée en nombre avec un critère manquant ou une eau inconnue (journées archivées)", R.v01_proprietes.tenu && R.v01_proprietes.nombreAvecManque === 0 && R.v01_proprietes.nombreEauInconnue === 0);
t("V-02 : aucun « — » sans raison écrite", R.v02_publication.tenu);
t("V-04 : aucun créneau non SAFE dans un Top, données de fiche actuelles ou supposées documentées", R.v04_classementSecurite.tenu && R.v04_classementSecurite.topAvecNonSafe === 0);
t("sécurité : aucun des créneaux « non recommandés » en V2 ne devient SAFE, même fiche supposée documentée (épreuve non vide)", R.securite.tenu && R.securite.v2NonRecommandes > 100 && R.securite.v2NonRecommandeMaisV3Safe === 0 && R.securite.v2NonRecommandeMaisV3SafeSiDocumente === 0);
t("V-03 : la météo perturbée passe par le vrai moteur, qui reproduit exactement chaque note non perturbée", R.ecartees.meteoComparee > 0 && R.ecartees.meteoReproduite === R.ecartees.meteoComparee);
t("V-04 : avec les fiches supposées documentées, des spots sont réellement classés (le critère peut échouer)", R.v04_classementSecurite.spotsDocumentesParJourneeSiDocumente > 1);
t("épreuve : aucune session du journal dans les résultats (PF-17)", !/journal|seedJournal|fish/.test(JSON.stringify(R.exemples)));

// ——— 4. Audit stratifié des fiches (phase 8) ———
{ let ok = true; try { execFileSync("node", [path.join(root, "scripts/audit-fiches-phase-8.mjs"), "--verifier"], { stdio: "pipe" }); } catch { ok = false; }
  t("audit stratifié des fiches à jour (scripts/audit-fiches-phase-8.mjs --verifier)", ok);
  const A = JSON.parse(fs.readFileSync(path.join(root, "data/spots/audit-phase-8.json"), "utf8"));
  t("audit : toutes les fiches TOP_TIER, corroborées, engagées, d'engagement inconnu, à contrainte de marée et à position douteuse sont tirées", ["1", "2", "2b", "3", "4"].every((k) => Object.entries(A.strates).filter(([s]) => s.startsWith(k)).every(([, v]) => v.fiches === v.tirees)));
  t("audit : aucune contradiction, position hors zone, source hors registre ni statut incohérent, sur les 98 fiches", A.graveHorsSecuriteSurToutesLesFiches.length === 0, JSON.stringify(A.graveHorsSecuriteSurToutesLesFiches)); }

console.log(`[calibration et épreuve] ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
