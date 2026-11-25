// Pare-feu des messages de commit de Claude (PF-15 du registre tests/pare-feux/regles.mjs ; CLAUDE.md « Commits
// atomiques. Messages terminés par les deux lignes d'attribution de la session »).
// Un commit dont l'auteur est Claude (noreply@anthropic.com) se termine par :
//   Co-Authored-By: Claude <modèle> <noreply@anthropic.com>
//   Claude-Session: https://claude.ai/code/session_<identifiant>
// Usage : node scripts/pare-feux/commits.mjs <plage git, ex. origin/main..HEAD, ou « <sha> --not --remotes »>   (code 1 si un message manque ses lignes)
//         node scripts/pare-feux/commits.mjs --message <fichier>                  (crochet commit-msg)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export const AUTEUR_CLAUDE = "noreply@anthropic.com";

export function verifierMessage(message) {
  const lignes = message.split("\n").map((l) => l.trimEnd()).filter((l) => l && !l.startsWith("#"));
  const [avant, derniere] = lignes.slice(-2);
  const erreurs = [];
  if (!/^Co-Authored-By: Claude [^<>]+ <noreply@anthropic\.com>$/.test(avant || "")) erreurs.push("avant-dernière ligne : « Co-Authored-By: Claude … <noreply@anthropic.com> » attendue");
  if (!/^Claude-Session: https:\/\/claude\.ai\/code\/session_[A-Za-z0-9]+$/.test(derniere || "")) erreurs.push("dernière ligne : « Claude-Session: https://claude.ai/code/session_… » attendue");
  return erreurs;
}

export function verifierPlage(plage, cwd = process.cwd()) {
  const args = Array.isArray(plage) ? plage : [plage];
  const sortie = execFileSync("git", ["log", "--format=%H%x00%ae%x00%B%x1e", ...args], { cwd, maxBuffer: 64e6 }).toString();
  const fautes = [];
  for (const bloc of sortie.split("\x1e").map((b) => b.replace(/^\n/, "")).filter(Boolean)) {
    const [h, auteur, message] = bloc.split("\x00");
    if (auteur !== AUTEUR_CLAUDE) continue;
    const e = verifierMessage(message);
    if (e.length) fautes.push(`${h.slice(0, 7)} ${message.split("\n")[0].slice(0, 70)} — ${e.join(" ; ")}`);
  }
  return fautes;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--message") {
    const e = verifierMessage(fs.readFileSync(process.argv[3], "utf8"));
    for (const x of e) console.error(`✗ lignes d'attribution : ${x}`);
    process.exit(e.length ? 1 : 0);
  }
  const plage = process.argv.slice(2);
  if (!plage.length) { console.error("usage : node scripts/pare-feux/commits.mjs <plage> | --message <fichier>"); process.exit(2); }
  const fautes = verifierPlage(plage);
  for (const f of fautes) console.log(`✗ lignes d'attribution manquantes : ${f}`);
  console.log(`[commits] ${plage.join(" ")} : ${fautes.length ? fautes.length + " message(s) de Claude sans ses deux lignes" : "messages de Claude complets"}`);
  process.exit(fautes.length ? 1 : 0);
}
