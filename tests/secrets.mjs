// Phase 4 V3 — aucun secret dans le dépôt (référentiel § 0.2, § 10.2, § 11 ; CLAUDE.md).
// Parcourt les fichiers suivis par Git (texte seulement) à la recherche de jetons et de clés, et refuse tout fichier
// d'environnement réel (.env, .env.local…) ; seul .env.example est admis. Option --historique : tout l'historique Git.
// Usage : node tests/secrets.mjs [--historique]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOTIFS = [
  ["jeton GitHub classique", /\bgh[pousr]_[A-Za-z0-9]{36}\b/],
  ["jeton GitHub à grain fin", /\bgithub_pat_[A-Za-z0-9_]{22,}\b/],
  ["clé d'accès AWS", /\bAKIA[0-9A-Z]{16}\b/],
  ["clé privée", /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY( BLOCK)?-----/],
  ["jeton Slack", /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ["clé Google", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["clé d'API de type sk-", /\bsk-(proj-|ant-)?[A-Za-z0-9_-]{32,}\b/],
  ["secret en clair", /\b(api[_-]?key|secret|password|mot_de_passe)\b\s*[:=]\s*["'][^"'\s]{16,}["']/i],
];
const BINAIRE = /\.(png|jpe?g|webp|gif|ico|woff2?|ttf|otf|pdf|zip|gz|mp4|mov|bin)$/i;
let trouve = 0;
const signaler = (ou, nom) => { trouve++; console.log(`   ✗ ${ou} : ${nom}`); };

const fichiers = execFileSync("git", ["ls-files", "-z"], { cwd: root }).toString().split("\0").filter(Boolean);
for (const f of fichiers) {
  if (/(^|\/)\.env(\..+)?$/.test(f) && !f.endsWith(".env.example")) signaler(f, "fichier d'environnement suivi par Git");
  if (BINAIRE.test(f)) continue;
  let txt;
  try { txt = fs.readFileSync(path.join(root, f), "utf8"); } catch { continue; } // fichier supprimé de l'arbre de travail
  for (const [nom, re] of MOTIFS) if (re.test(txt)) signaler(f, nom);
}
let commits = 0;
if (process.argv.includes("--historique")) {
  for (const [nom, re] of MOTIFS) {
    const out = execFileSync("git", ["log", "--all", "--format=%h", "-P", "-G", re.source], { cwd: root, maxBuffer: 64 << 20 }).toString().trim();
    if (out) out.split("\n").forEach((h) => signaler(`commit ${h}`, nom));
  }
  commits = Number(execFileSync("git", ["rev-list", "--all", "--count"], { cwd: root }).toString().trim());
}
console.log(`[secrets] ${fichiers.length} fichiers${commits ? ` et ${commits} commits` : ""} : ${trouve ? `${trouve} alerte(s)` : "aucun secret"}`);
process.exit(trouve ? 1 : 0);
