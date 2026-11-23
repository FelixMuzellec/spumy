// Contrôle de la configuration ESLint 10 (phase 4 V3, sous-tâche 4.12).
// Chaque cas reprend une règle de l'ancienne configuration ESLint 8 et vérifie qu'elle se déclenche toujours,
// ou qu'elle reste silencieuse là où ESLint 8 l'était. Sans ce test, une règle perdue passerait inaperçue :
// le lint du dépôt est déjà à 0 et le resterait.
import { ESLint } from "eslint";

/** @type {{ nom: string, fichier: string, code: string, attendu: string[] }[]} */
export const CAS = [
  { nom: "composant JSX inconnu", fichier: "src/__cas__.jsx", code: "export const A = () => <Inconnu />;\n", attendu: ["no-undef"] },
  { nom: "import utilisé seulement en JSX", fichier: "src/__cas__.jsx", code: "import { B } from \"./b.js\";\nexport const A = () => <B />;\n", attendu: [] },
  { nom: "import inutilisé", fichier: "src/__cas__.js", code: "import { C } from \"./c.js\";\nexport const A = 1;\n", attendu: ["no-unused-vars"] },
  { nom: "variable préfixée _ inutilisée", fichier: "src/__cas__.js", code: "const _x = 1;\nexport const A = 1;\n", attendu: [] },
  { nom: "argument inutilisé", fichier: "src/__cas__.js", code: "export function f(a, b) { return a; }\n", attendu: [] },
  { nom: "erreur capturée inutilisée", fichier: "src/__cas__.js", code: "export function f() { try { return 1; } catch (e) { return 0; } }\n", attendu: [] },
  { nom: ".map() sans clé (fonction fléchée)", fichier: "src/__cas__.jsx", code: "export const L = (xs) => xs.map((x) => <li>{x}</li>);\n", attendu: ["no-restricted-syntax"] },
  { nom: ".map() sans clé (return)", fichier: "src/__cas__.jsx", code: "export const L = (xs) => xs.map(function (x) { return <li>{x}</li>; });\n", attendu: ["no-restricted-syntax"] },
  { nom: ".map() avec clé", fichier: "src/__cas__.jsx", code: "export const L = (xs) => xs.map((x) => <li key={x}>{x}</li>);\n", attendu: [] },
  { nom: "hook dans une condition", fichier: "src/__cas__.jsx", code: "import { useState } from \"react\";\nexport function F(p) { if (p) { useState(0); } return null; }\n", attendu: ["react-hooks/rules-of-hooks"] },
  { nom: "hook au bon endroit", fichier: "src/__cas__.jsx", code: "import { useState } from \"react\";\nexport function F() { const [v] = useState(0); return v; }\n", attendu: [] },
  { nom: "redéclaration", fichier: "src/__cas__.js", code: "var a = 1;\nvar a = 2;\nexport { a };\n", attendu: ["no-redeclare"] },
  { nom: "clé d'objet en double", fichier: "src/__cas__.js", code: "export const o = { a: 1, a: 2 };\n", attendu: ["no-dupe-keys"] },
  { nom: "constante réaffectée", fichier: "src/__cas__.js", code: "const k = 1;\nk = 2;\nexport { k };\n", attendu: ["no-const-assign"] },
  { nom: "classe utilisée avant sa définition", fichier: "src/__cas__.js", code: "export const x = new K();\nclass K {}\n", attendu: ["no-use-before-define"] },
  { nom: "fonction utilisée avant sa définition", fichier: "src/__cas__.js", code: "export const x = f();\nfunction f() { return 1; }\n", attendu: [] },
  { nom: "globales du navigateur", fichier: "src/__cas__.js", code: "export const w = window.innerWidth + document.title.length;\n", attendu: [] },
  { nom: "globales de Node interdites dans src", fichier: "src/__cas__.js", code: "export const e = process.env;\n", attendu: ["no-undef"] },
  { nom: "globales de Node permises dans tests", fichier: "tests/__cas__.mjs", code: "process.exitCode = 0;\n", attendu: [] },
];

export async function verifier(eslint = new ESLint()) {
  const resultats = [];
  for (const c of CAS) {
    const [r] = await eslint.lintText(c.code, { filePath: c.fichier });
    const regles = [...new Set(r.messages.map((m) => m.ruleId || `analyse : ${m.message}`))].sort();
    const ok = JSON.stringify(regles) === JSON.stringify([...c.attendu].sort());
    resultats.push({ ...c, regles, ok });
  }
  return resultats;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const resultats = await verifier();
  const ko = resultats.filter((r) => !r.ok);
  for (const r of ko) console.error(`✗ ${r.nom} : attendu [${r.attendu.join(", ")}], obtenu [${r.regles.join(", ")}]`);
  console.log(`[lint] règles de la configuration ESLint ${ESLint.version} : ${resultats.length - ko.length}/${resultats.length}`);
  if (ko.length) process.exit(1);
}
