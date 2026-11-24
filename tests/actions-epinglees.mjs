// Phase 4 V3, sous-tâche 4.13 : chaque action GitHub est épinglée par l'empreinte complète de son commit,
// avec la version en commentaire, et chaque passage tourne sur une image de runner fixée.
// Une étiquette (@v4) peut être déplacée vers un autre code ; une empreinte, non (guide de sécurité de GitHub Actions).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dir = path.join(root, ".github", "workflows");
const EPINGLE = /^(?:-\s+)?uses:\s+[\w.-]+\/[\w./-]+@[0-9a-f]{40}\s+#\s+v\d+\.\d+\.\d+\s*$/;
const LOCAL = /^(?:-\s+)?uses:\s+\.\//;

const ecarts = [];
let actions = 0;
let passages = 0;
for (const f of fs.readdirSync(dir).filter((n) => /\.ya?ml$/.test(n)).sort()) {
  fs.readFileSync(path.join(dir, f), "utf8").split("\n").forEach((ligne, i) => {
    const l = ligne.trim();
    if (/^(?:-\s+)?uses:/.test(l)) {
      actions += 1;
      if (!EPINGLE.test(l) && !LOCAL.test(l)) ecarts.push(`${f}:${i + 1} action non épinglée par empreinte : ${l}`);
    }
    // Une valeur YAML non entre guillemets ne peut pas contenir « : » suivi d'une espace : le fichier entier devient
    // invalide et le passage échoue sans rien lancer (phase 6, nom d'étape « phase 6 V3 : … »).
    const nom = l.match(/^(?:-\s+)?name:\s+(.*)$/);
    if (nom && !/^["']/.test(nom[1]) && /:\s/.test(nom[1].split(" #")[0])) ecarts.push(`${f}:${i + 1} nom non entre guillemets contenant « : » : ${l}`);
    if (/^runs-on:/.test(l)) {
      passages += 1;
      if (/-latest\b/.test(l.split("#")[0])) ecarts.push(`${f}:${i + 1} image de runner non fixée : ${l}`);
    }
  });
}
for (const e of ecarts) console.error(`✗ ${e}`);
console.log(`[ci] ${actions} actions et ${passages} images de runner contrôlées (empreinte, image fixée) : ${ecarts.length ? `${ecarts.length} écart(s)` : "OK"}`);
if (ecarts.length || !actions) process.exit(1);
