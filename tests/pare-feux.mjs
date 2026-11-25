// Pare-feux des consignes de Félix (demande du 25 nov. 2026, 6 h 32) : le registre tests/pare-feux/regles.mjs dit, pour
// chaque consigne et chaque version de l'application, quel contrôle la fait respecter. Ce test vérifie le registre
// lui-même (couverture, versions, contrôles présents et lancés, échéances), puis exécute les contrôles directs qui n'ont
// pas leur place dans un autre test. Écrit docs/regles/PARE-FEUX.md (tableau lisible, généré depuis le registre).
// Usage : node tests/pare-feux.mjs [--ecrire]        (--ecrire : régénère docs/regles/PARE-FEUX.md)
//         node tests/pare-feux.mjs --instantane      (ajoute les nouvelles décisions validées à l'instantané ; n'en retire aucune)
//         node tests/pare-feux.mjs --instantane-moteur "<raison approuvée par Félix>"   (enregistre une modification du moteur)
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VERSIONS, REGLES, SANS_REGLE, INTERFACE_V3 } from "./pare-feux/regles.mjs";
import { fichiersSansUsage, gardesAuRegistre } from "../scripts/pare-feux/inutiles.mjs";
import { verifierBranche, phaseAutorisee } from "../scripts/pare-feux/branche.mjs";
import { verifierMessage, verifierPlage } from "../scripts/pare-feux/commits.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => fs.readFileSync(path.join(RACINE, f), "utf8");
const existe = (f) => fs.existsSync(path.join(RACINE, f));
const git = (...a) => execFileSync("git", a, { cwd: RACINE }).toString().trim();
let ok = 0, ko = 0;
const t = (nom, cond, detail = "") => { if (cond) ok++; else { ko++; console.log(`   ✗ ${nom}${detail ? " — " + detail : ""}`); } };
const arg = process.argv[2];

const JOURNAL = lire("docs/DECISIONS_LOG.md");
const CLAUDE = lire("CLAUDE.md");
const ETATS = new Set(["controle", "prevu", "sansObjet", "manuel"]);

// ——— 1. Sources de consignes : chacune a sa règle, ou sa raison d'en être dépourvue ———
const index = [...JOURNAL.matchAll(/^\| (V3-\d{3}) \| ([^|]*) \| ([^|\n]*) \|$/gm)].map((m) => ({ id: m[1], statut: m[3] }));
const valide = (s) => /VALIDÉE|APPLIQUÉE|EXÉCUTÉE|exécutée/.test(s);
const lignesDatees = [...JOURNAL.matchAll(/^\| — \| (.*)$/gm)].map((m) => {
  const d = /(\d{1,2} nov\. 2026)[^0-9]{1,4}(\d{1,2}) h (\d{2})/.exec(m[1]);
  return d ? `${d[1]}, ${d[2]} h ${d[3]}` : null;
});
const section = (txt, titre) => (txt.split(/^## /m).find((s) => s.startsWith(titre)) || "");
const pucesClaude = ["Règles absolues", "Dépôt"].flatMap((s) => [...section(CLAUDE, s).matchAll(/^- (.+)$/gm)].map((m) => m[1]));
const decisionsV2 = [...section(JOURNAL, "Décisions V2 encore en vigueur").matchAll(/^\| (?!Décision V2|---)([^|]+) \|/gm)].map((m) => m[1].trim());
const sourcesRegles = REGLES.flatMap((r) => r.sources);
const couvert = (cle) => sourcesRegles.includes(cle) || cle in SANS_REGLE;

t("journal : index des décisions lu (V3-001 au moins)", index.some((d) => d.id === "V3-001"), String(index.length));
for (const d of index.filter((x) => valide(x.statut))) t(`décision validée ${d.id} : une règle la fait respecter, ou SANS_REGLE dit pourquoi`, couvert(d.id));
t("journal : chaque ligne datée porte sa date et son heure", lignesDatees.every(Boolean), String(lignesDatees.filter((x) => !x).length));
for (const cle of lignesDatees.filter(Boolean)) t(`consigne datée de Félix « ${cle} » : une règle la fait respecter, ou SANS_REGLE dit pourquoi`, couvert(cle));
t("CLAUDE.md : règles absolues et règles du dépôt lues", pucesClaude.length >= 12, String(pucesClaude.length));
for (const p of pucesClaude) {
  const r = sourcesRegles.filter((s) => s.startsWith("CLAUDE.md « ")).map((s) => s.slice(12, -2));
  t(`CLAUDE.md « ${p.slice(0, 50)}… » : une règle la fait respecter`, r.some((x) => p.startsWith(x)));
}
for (const d of decisionsV2) t(`décision V2 en vigueur « ${d.slice(0, 50)} » : une règle la fait respecter`, sourcesRegles.some((s) => s.startsWith("V2 « ") && d.startsWith(s.slice(5, -2))));
for (const s of sourcesRegles) {
  if (/^V3-\d{3}$/.test(s)) t(`source ${s} citée par une règle : elle existe au journal`, index.some((d) => d.id === s));
  else if (/nov\. 2026/.test(s)) t(`source datée « ${s} » citée par une règle : elle existe au journal`, lignesDatees.includes(s));
}

// ——— 2. Chaque règle dit ce qu'elle devient dans chaque version ; ses contrôles existent et sont lancés ———
const pkg = JSON.parse(lire("package.json"));
const ci = fs.readdirSync(path.join(RACINE, ".github/workflows")).map((w) => lire(`.github/workflows/${w}`)).join("\n");
const developper = (texte, vus = new Set()) => texte.replace(/npm run (?:-s )?([\w:-]+)/g, (m, n) => {
  if (vus.has(n) || !pkg.scripts[n]) return m; vus.add(n); return `${m} [${developper(pkg.scripts[n], vus)}]`;
});
const commandesCI = developper(ci);
const lancesCI = (f) => commandesCI.includes(f);
const lanceParUnTest = (f) => [...commandesCI.matchAll(/(tests\/[\w./-]+\.(?:mjs|py))/g)].map((m) => m[1]).filter(existe)
  .some((g) => g !== f && lire(g).includes(path.basename(f)));
const crochetsActives = /git config core\.hooksPath \.githooks/.test(CLAUDE);
const rapportsClos = new Set(fs.readdirSync(path.join(RACINE, "docs/rapports/v3")).map((f) => /^PHASE-(\d+)\.md$/.exec(f)).filter(Boolean).map((m) => Number(m[1])));
const ids = new Set();
for (const r of REGLES) {
  t(`${r.id} : identifiant unique`, !ids.has(r.id)); ids.add(r.id);
  t(`${r.id} : titre et au moins une source`, !!r.titre && r.sources.length > 0);
  t(`${r.id} : portée « produit » ou « depot »`, ["produit", "depot"].includes(r.portee), r.portee);
  const cles = r.portee === "depot" ? ["toutes"] : Object.keys(VERSIONS);
  t(`${r.id} : situé pour ${r.portee === "depot" ? "toutes les versions" : "chaque version (" + cles.join(", ") + ")"}`,
    JSON.stringify(Object.keys(r.versions).sort()) === JSON.stringify([...cles].sort()), Object.keys(r.versions).join(", "));
  for (const [v, e] of Object.entries(r.versions)) {
    t(`${r.id} ${v} : état connu`, ETATS.has(e.etat), e.etat);
    if (e.etat === "sansObjet" || e.etat === "manuel") t(`${r.id} ${v} : raison écrite`, !!e.raison);
    if (e.etat === "prevu") {
      t(`${r.id} ${v} : phase d'échéance et raison`, Number.isInteger(e.phase) && !!e.raison);
      t(`${r.id} ${v} : la phase ${e.phase} n'est pas close sans ce pare-feu (prévu : ${e.raison.slice(0, 60)}…)`, !rapportsClos.has(e.phase));
    }
    if (e.etat === "controle") {
      t(`${r.id} ${v} : au moins un contrôle`, e.gardes?.length > 0);
      if (e.aCompleter) t(`${r.id} ${v} : la phase ${e.aCompleter.phase} n'est pas close sans le complément (${e.aCompleter.quoi})`, !rapportsClos.has(e.aCompleter.phase));
      for (const [f, marque] of e.gardes || []) {
        t(`${r.id} ${v} : contrôle ${f} présent`, existe(f));
        if (!existe(f)) continue;
        t(`${r.id} ${v} : ${f} contient toujours « ${marque.slice(0, 60)} »`, lire(f).includes(marque));
        if (f.startsWith(".githooks/")) t(`${r.id} ${v} : crochet ${f} exécutable et activé par l'entrée de session de CLAUDE.md`, (fs.statSync(path.join(RACINE, f)).mode & 0o111) !== 0 && crochetsActives);
        else if (!f.startsWith(".github/")) t(`${r.id} ${v} : ${f} lancé par la CI`, lancesCI(f) || lanceParUnTest(f));
      }
    }
  }
}

// ——— 3. Non-retour : une décision validée n'est jamais retirée ni rétrogradée (PF-04) ———
const INSTANTANE = "tests/pare-feux/decisions-validees.json";
const snap = existe(INSTANTANE) ? JSON.parse(lire(INSTANTANE)) : { decisions: [] };
if (arg === "--instantane") {
  const nouv = index.filter((d) => valide(d.statut) && !snap.decisions.includes(d.id)).map((d) => d.id);
  snap.decisions = [...snap.decisions, ...nouv];
  fs.writeFileSync(path.join(RACINE, INSTANTANE), JSON.stringify({ "//": "Décisions validées (PF-04) : la liste ne fait que grandir ; node tests/pare-feux.mjs --instantane", decisions: snap.decisions }, null, 2) + "\n");
  console.log(`[pare-feux] instantané : ${nouv.length} décision(s) ajoutée(s)`);
}
for (const id of snap.decisions) {
  const d = index.find((x) => x.id === id);
  t(`décision validée retirée ou rétrogradée : ${id}`, !!d && (valide(d.statut) || /remplacée|REMPLACÉE/.test(d.statut)), d ? d.statut : "absente du journal");
}
for (const d of index.filter((x) => valide(x.statut))) t(`décision validée ${d.id} inscrite à l'instantané (node tests/pare-feux.mjs --instantane)`, snap.decisions.includes(d.id));

// ——— 4. Contrôles directs ———
// PF-06 : aucun fichier sans usage ni raison inscrite au registre de nettoyage.
{ const garde = gardesAuRegistre();
  for (const f of fichiersSansUsage()) t(`fichier sans usage : ${f} (le supprimer, ou l'inscrire avec sa raison à docs/socle/NETTOYAGE.md)`, garde.includes(f) || garde.includes(path.basename(f))); }

// PF-13, PF-14 : modèle des branches et phases autorisées.
{ const max = phaseAutorisee();
  const cas = [["claude/v3-phase-07-enrichissement-halieutique", max >= 7], ["claude/v3-suivi-pare-feux", true], [`claude/v3-phase-${String(max + 1).padStart(2, "0")}-suite`, false],
    ["claude/V3-phase-7-x", false], ["claude/v3-phase-7-x", false], ["claude/v3-phase-07-Sujet", false], ["main", false], ["claude/v9-suivi-x", false], ["claude/v2-phase-14-x", false]];
  for (const [nom, attendu] of cas) t(`nom de branche hors modèle ou phase non autorisée : « ${nom} » ${attendu ? "admis" : "refusé"}`, (verifierBranche(nom).erreurs.length === 0) === attendu, verifierBranche(nom).erreurs.join(" ; "));
  t("phase non autorisée : jamais de phase 8 sans son propre jeton", !/PROCEED TO PHASE 8/.test(JOURNAL) ? verifierBranche("claude/v3-phase-08-calibration").erreurs.length > 0 : true);
  const courante = (() => { try { return git("symbolic-ref", "--short", "-q", "HEAD"); } catch { return ""; } })();
  if (courante && courante !== "main") t(`nom de branche hors modèle : branche courante « ${courante} »`, verifierBranche(courante).erreurs.length === 0, verifierBranche(courante).erreurs.join(" ; ")); }

// PF-15 : lignes d'attribution.
{ const fin = "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_012YoZxq9fP3Y2tP8J77hw9T\n";
  t("lignes d'attribution : un message complet est admis", verifierMessage("Titre" + fin).length === 0);
  t("lignes d'attribution : sans la ligne de session, refusé", verifierMessage("Titre\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n").length > 0);
  t("lignes d'attribution : lignes ailleurs qu'à la fin, refusé", verifierMessage("Titre" + fin + "\nsuite").length > 0);
  let base = ""; try { base = git("rev-parse", "--verify", "-q", "origin/main"); } catch { /* clone sans origin/main */ }
  if (base) { const f = verifierPlage(`${base}..HEAD`, RACINE); t("lignes d'attribution : chaque commit de Claude depuis main", f.length === 0, f.slice(0, 3).join(" | ")); } }

// Textes de l'interface V3.
const fichiersV3 = INTERFACE_V3.flatMap((d) => git("ls-files", d).split("\n")).filter((f) => /\.(jsx?|css|html)$/.test(f));
const texteV3 = fichiersV3.map((f) => [f, lire(f)]);
t("interface V3 : fichiers trouvés", fichiersV3.length > 5, String(fichiersV3.length));
// PF-02 : pas de courbe de profondeur sans données réelles.
for (const [f, x] of texteV3) t(`courbe de profondeur dans l'interface V3 : ${f}`, !/isobath|bathym|courbes? (de|des) (niveau|profondeur)|depth[-_ ]?(curve|contour|line)/i.test(x));
// PF-09 : aucun découpage géographique. Exceptions : noms d'institutions, pas des découpages.
const EXCEPTIONS_GEO = [/Région \(inventaire du patrimoine/g];
for (const [f, x] of texteV3) { const y = EXCEPTIONS_GEO.reduce((s, re) => s.replace(re, ""), x);
  t(`découpage géographique dans l'interface V3 : ${f}`, !/\b(secteurs?|régions?|départements?)\b/i.test(y), (/\b(secteurs?|régions?|départements?)\b.{0,40}/i.exec(y) || [""])[0]); }
// PF-11 : le slogan, une seule fois, en tête de Home.
{ const occ = texteV3.filter(([, x]) => x.includes("Read the sea")).map(([f]) => f);
  t("slogan écrit ailleurs qu'en tête de Home : une seule occurrence, dans home.jsx", occ.length === 1 && occ[0].endsWith("home.jsx"), occ.join(", ")); }

// PF-10 : chaque icône de guide V2 est l'icône SPUMY (logo de Félix), à l'octet près.
{ const ref = fs.readFileSync(path.join(RACINE, "icon-192.png"));
  const guides = git("ls-files", "assets").split("\n").map((f) => /^assets\/([a-z]+)-192\.png$/.exec(f)).filter(Boolean).map((m) => m[1]).filter((g) => g !== "icon");
  t("icônes de guide trouvées", guides.length === 7, guides.join(","));
  for (const g of guides) for (const f of [`assets/${g}-192.png`, `${g}.png`]) t(`icône de guide différente de l'icône SPUMY : ${f}`, existe(f) && fs.readFileSync(path.join(RACINE, f)).equals(ref)); }

// PF-16 : pas de lien Drive dans le référentiel public (V3-004).
t("lien Drive dans le référentiel public (V3-004)", !/https?:\/\/(drive|docs)\.google\.com/.test(lire("docs/SPUMY_MASTER_PROMPT.md")));

// PF-18 : la position d'une fiche ne vient jamais de carnet-de-peche.com ni d'OpenStreetMap.
{ const reg = [lire("data/sources/registre.json"), lire("data/sources/manuelles.json")].map(JSON.parse).flatMap((r) => (Array.isArray(r) ? r : r.sources || Object.values(r)));
  const parId = new Map(reg.filter((s) => s && s.id).map((s) => [s.id, s]));
  const interdit = (s) => /carnet-de-peche|openstreetmap|overpass/i.test(`${s?.url || ""} ${s?.editeur || ""}`);
  const fiches = fs.readdirSync(path.join(RACINE, "data/spots/fiches")).filter((f) => f.endsWith(".json"));
  let n = 0;
  for (const f of fiches) { const c = JSON.parse(lire(`data/spots/fiches/${f}`)).coordinates || {};
    const srcs = JSON.stringify(c).match(/"sources":\[[^\]]*\]/g)?.flatMap((x) => JSON.parse(x.slice(10))) || [];
    for (const id of srcs) { n++; t(`coordonnées tirées de carnet-de-peche.com ou d'OpenStreetMap : ${f} (${id})`, !interdit(parId.get(id))); } }
  t("position des fiches : sources lues", fiches.length > 50 && n > 0, `${fiches.length} fiches, ${n} sources`); }

// PF-19 : moteur gelé dans src/ jusqu'au jeton de la phase 10.
{ const GELE = "tests/pare-feux/moteur-gele.json";
  const fichiers = git("ls-files", "src/engine.js", "src/bord/engine", "src/bateau/offshore.js", "src/bateau/wx.js").split("\n").filter(Boolean);
  const empreintes = Object.fromEntries(fichiers.map((f) => [f, crypto.createHash("sha256").update(fs.readFileSync(path.join(RACINE, f))).digest("hex")]));
  const g = existe(GELE) ? JSON.parse(lire(GELE)) : { empreintes: {}, historique: [] };
  if (arg === "--instantane-moteur") {
    const raison = process.argv[3];
    if (!raison) { console.error("raison obligatoire (modification approuvée par Félix)"); process.exit(2); }
    g.historique = [...(g.historique || []), { date: new Date().toISOString().slice(0, 10), raison }];
    g.empreintes = empreintes;
    fs.writeFileSync(path.join(RACINE, GELE), JSON.stringify({ "//": "Moteur gelé dans src/ jusqu'au jeton de la phase 10 (PF-19). Une modification s'enregistre avec sa raison : node tests/pare-feux.mjs --instantane-moteur \"<raison>\"", ...g }, null, 2) + "\n");
  }
  const leve = phaseAutorisee() >= 10;
  t("moteur gelé : fichiers du moteur trouvés", fichiers.length >= 10, String(fichiers.length));
  if (!leve) for (const f of new Set([...fichiers, ...Object.keys(g.empreintes)]))
    t(`moteur modifié avant l'approbation qui suit la phase 9 : ${f}`, empreintes[f] && empreintes[f] === g.empreintes[f]); }

// PF-22 : jamais de localisation par l'adresse IP ; PF-41 : ni publicité, ni mesure d'audience, ni paiement.
{ const publies = git("ls-files", "src", "*.html", "sw.js").split("\n").filter((f) => /\.(jsx?|html)$/.test(f));
  for (const f of publies) { const x = lire(f);
    t(`localisation par l'adresse IP : ${f}`, !/ipapi|ipinfo|ip-api\.com|geoip|ipgeolocation|freegeoip|ipify|ipdata\.co/i.test(x));
    t(`publicité, mesure d'audience ou paiement : ${f}`, !/googletagmanager|google-analytics|gtag\(|doubleclick\.net|adsbygoogle|stripe\.com|paypal\.com|matomo|plausible\.io|hotjar|connect\.facebook\.net/i.test(x)); } }

// PF-38 : Dependabot pour les actions GitHub seulement, mensuel, groupé, 7 jours.
{ const d = lire(".github/dependabot.yml");
  const eco = [...d.matchAll(/package-ecosystem:\s*"?([\w-]+)"?/g)].map((m) => m[1]);
  t("Dependabot hors des actions GitHub : seulement github-actions, mensuel, groupé, attente de 7 jours",
    eco.length === 1 && eco[0] === "github-actions" && /interval:\s*"?monthly"?/.test(d) && /groups:/.test(d) && /default-days:\s*7\b/.test(d), eco.join(",")); }

// ——— 5. Tableau lisible, généré depuis le registre ———
const ETIQ = { controle: "contrôlé", prevu: "prévu", sansObjet: "sans objet", manuel: "consigne (non automatisable)" };
const cellule = (e) => {
  if (!e) return "—";
  if (e.etat === "controle") return `**contrôlé** : ${e.gardes.map(([f]) => `\`${f}\``).filter((x, i, a) => a.indexOf(x) === i).join(", ")}${e.aCompleter ? ` ; à compléter avant la fin de la phase ${e.aCompleter.phase} (${e.aCompleter.quoi})` : ""}${e.note ? ` ; ${e.note}` : ""}`;
  if (e.etat === "prevu") return `**prévu, phase ${e.phase}** : ${e.raison}`;
  return `**${ETIQ[e.etat]}** : ${e.raison}`;
};
const vs = Object.keys(VERSIONS);
const doc = `# Pare-feux des consignes de Félix

Généré par \`node tests/pare-feux.mjs --ecrire\` depuis \`tests/pare-feux/regles.mjs\`. Ne pas modifier à la main.

Demande de Félix (25 nov. 2026, 6 h 32) : « Sois sûr de mettre en place les pare-feux nécessaires pour que mes indications soient respectées. Bien entendu, à chaque version de l'application les règles sont différentes et donc les pare-feux devront s'adapter. »

## Comment les pare-feux s'adaptent

- **Nouvelle consigne.** Toute décision validée, ligne datée du journal, règle de \`CLAUDE.md\` ou décision V2 en vigueur sans règle ici fait échouer les tests.
- **Nouvelle version.** Ajouter une version à \`VERSIONS\` fait échouer les tests tant que chaque règle de produit n'a pas dit ce qu'elle y devient : contrôlée, prévue, sans objet ou consigne. Une branche d'un programme absent de \`VERSIONS\` est refusée.
- **Nouvelle phase.** Un pare-feu « prévu » pour une phase fait échouer les tests dès que le rapport de cette phase existe sans lui.
- **Contrôle perdu.** Un contrôle supprimé, qui ne contient plus sa marque ou que la CI ne lance plus fait échouer les tests.
- **Retour en arrière.** Une décision validée retirée ou rétrogradée au journal fait échouer les tests.

## Versions

${vs.map((v) => `- **${v}** : ${VERSIONS[v].nom}. Chemins : ${VERSIONS[v].chemins.join(", ")}.`).join("\n")}

## Où les pare-feux s'appliquent

- \`npm test\` et la CI de chaque proposition : \`tests/pare-feux.mjs\`, avec les tests qu'il cite.
- La CI de chaque proposition : nom de branche, phase autorisée et lignes d'attribution des commits (\`scripts/pare-feux/branche.mjs\`, \`scripts/pare-feux/commits.mjs\`).
- Les crochets Git locaux de Claude (\`.githooks/\`, activés à l'entrée de session) : refus du push sur \`main\`, refus de supprimer une branche, nom et phase, lignes d'attribution. Les pushs de Félix n'y passent pas.

## Règles

| Règle | Consigne | Sources | ${vs.join(" | ")} |
| --- | --- | --- | ${vs.map(() => "---").join(" | ")} |
${REGLES.map((r) => `| ${r.id} | ${r.titre} | ${r.sources.join(" ; ")} | ${vs.map((v) => cellule(r.versions[v] || r.versions.toutes)).join(" | ")} |`).join("\n")}

## Sources sans règle propre

${Object.entries(SANS_REGLE).map(([k, v]) => `- ${k} : ${v}`).join("\n")}

## Bilan

${["controle", "prevu", "manuel", "sansObjet"].map((e) => `- ${ETIQ[e]} : ${REGLES.flatMap((r) => Object.values(r.versions)).filter((x) => x.etat === e).length}`).join("\n")}
`;
const DOC = "docs/regles/PARE-FEUX.md";
if (arg === "--ecrire") { fs.mkdirSync(path.join(RACINE, "docs/regles"), { recursive: true }); fs.writeFileSync(path.join(RACINE, DOC), doc); }
t(`${DOC} à jour (node tests/pare-feux.mjs --ecrire)`, existe(DOC) && lire(DOC) === doc);

console.log(`[pare-feux] ${REGLES.length} règles, ${vs.length} versions : ${ok}/${ok + ko}`);
process.exit(ko ? 1 : 0);
