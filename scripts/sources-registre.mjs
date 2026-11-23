// Registre des sources (phase 5, 5.4 ; référentiel § 7.1). Construit data/sources/registre.json à partir :
//   - des sources V2 citées par chaque fiche de spot (provenance.sources_v2, texte exact) ;
//   - des sources des connaissances (data/knowledge/bar-bord.json et bateau.json : ref, url, niveau).
// Chaque source reçoit un identifiant stable (src-<éditeur>-<empreinte>) ; les fiches reçoivent ces identifiants dans
// provenance.sources. L'évaluation du § 7.1 (auteur, date, méthode, précision, indépendance, limites, droits) est
// gardée d'un passage à l'autre : ce script ne réécrit jamais un champ déjà évalué.
//
//   node scripts/sources-registre.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const F_SOURCES = path.join(root, "data/sources/registre.json");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32).replace(/-+$/g, "");
const court = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 6);

/** Éditeur : la partie avant « — » (domaine ou nom), sinon le domaine de l'URL, sinon le début du texte. */
function editeur(texte, url) {
  const avant = texte.split(/\s+—\s+/)[0].trim();
  if (avant && avant !== texte.trim() && avant.length <= 60) return avant;
  if (url) try { return new URL(url).hostname.replace(/^www\./, ""); } catch { /* adresse illisible */ }
  return texte.split(/[.(:]/)[0].trim().slice(0, 60);
}

/** Type de source d'après l'éditeur ; la famille du § 7.1 n'est fixée que lorsqu'elle est sans ambiguïté. */
function typer(ed, texte) {
  const e = `${ed} ${texte}`.toLowerCase();
  if (/^ton journal|tes sessions|ton journal :/.test(texte.toLowerCase())) return { type: "journal personnel (Félix)", famille: 4, prive: true };
  if (/^fiche du spot|^fiche$/.test(texte.toLowerCase())) return { type: "fiche V2 elle-même (pas une source externe)", famille: null };
  if (/ifremer|shom|legifrance|\.gouv\.fr|cerema|ofb\.|ices|doi\.org|cnrs|ird\.fr|m[ée]t[ée]o-?france|data\.gouv|ddtm|dreal|pr[ée]fecture|service-public|conservatoire du littoral|parc naturel|fishbase/.test(e)) return { type: "institutionnel ou scientifique", famille: /doi\.org|ices journal|journal of|et al\./.test(e) ? 1 : 2 };
  if (/wiki?p[ée]dia/.test(e)) return { type: "encyclopédie collaborative", famille: null };
  if (/google maps|geoportail|openstreetmap|cartographie/.test(e)) return { type: "cartographie", famille: null };
  if (/forum|facebook|groupe/.test(e)) return { type: "forum ou communauté", famille: null };
  if (/youtube|vid[ée]o/.test(e)) return { type: "vidéo", famille: null };
  if (/tourisme|office de tourisme|mairie|commune|conseil départemental|cirkwi|randonn/.test(e)) return { type: "collectivité ou tourisme", famille: null };
  return { type: "site, guide ou presse spécialisée", famille: null };
}

export function construire() {
  const avant = fs.existsSync(F_SOURCES) ? JSON.parse(fs.readFileSync(F_SOURCES, "utf8")) : { sources: [] };
  const garde = new Map(avant.sources.map((s) => [s.id, s]));
  const sources = new Map();
  const ajouter = (texte, url, niveau, usage) => {
    const ed = editeur(texte, url);
    const id = `src-${slug(ed) || "source"}-${court(texte)}`;
    const ty = typer(ed, texte);
    const s = sources.get(id) || {
      id, texte, editeur: ed, url: url || null, type: ty.type, famille: ty.famille, ...(ty.prive ? { prive: true } : {}),
      niveau_v2: niveau ?? null, utilise_par: [],
      evaluation: { statut: "à évaluer", auteur: null, date: null, methode: null, precision: null, independance: null, limites: null, droits: null, consulte_le: null },
    };
    if (!s.utilise_par.includes(usage)) s.utilise_par.push(usage);
    sources.set(id, s);
    return id;
  };
  const parFiche = new Map();
  for (const { fiche: f } of lireFiches()) parFiche.set(f.id, (f.provenance.sources_v2 || []).map((x) => ajouter(x, null, null, `spot:${f.id}`)));
  for (const [fichier, mode] of [["data/knowledge/bar-bord.json", "bord"], ["data/knowledge/bateau.json", "bateau"]]) {
    for (const c of read(fichier).connaissances) for (const s of c.sources || []) ajouter(s.ref, s.url, s.niveau, `connaissance:${mode}:${c.id}`);
  }
  // Sources ajoutées à la main (data/sources/manuelles.json) : gardées telles quelles ; leurs usages sont relevés
  // dans les fiches qui les citent.
  const F_MAN = path.join(root, "data/sources/manuelles.json");
  if (fs.existsSync(F_MAN)) {
    const fiches = lireFiches();
    for (const m of JSON.parse(fs.readFileSync(F_MAN, "utf8")).sources) {
      const usages = fiches.filter(({ fiche }) => JSON.stringify(fiche).includes(`"${m.id}"`)).map(({ fiche }) => `spot:${fiche.id}`);
      sources.set(m.id, { ...m, manuelle: true, utilise_par: usages });
    }
  }
  // Une évaluation déjà faite n'est jamais écrasée.
  const liste = [...sources.values()].map((s) => (!s.manuelle && garde.get(s.id)?.evaluation?.statut && garde.get(s.id).evaluation.statut !== "à évaluer" ? { ...s, evaluation: garde.get(s.id).evaluation, famille: garde.get(s.id).famille } : s))
    .sort((a, b) => a.id.localeCompare(b.id));
  const parEditeur = {};
  for (const s of liste) (parEditeur[s.editeur] ||= []).push(s.id);
  return {
    registre: {
      "//": "Registre des sources (phase 5, 5.4 ; § 7.1). Généré par scripts/sources-registre.mjs ; les champs « evaluation » se complètent à la main et ne sont jamais écrasés.",
      totaux: {
        sources: liste.length, aEvaluer: liste.filter((s) => s.evaluation.statut === "à évaluer").length,
        avecUrl: liste.filter((s) => s.url).length, editeurs: Object.keys(parEditeur).length,
        parType: liste.reduce((m, s) => ((m[s.type] = (m[s.type] || 0) + 1), m), {}),
      },
      sources: liste,
    },
    parFiche,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { registre, parFiche } = construire();
  fs.mkdirSync(path.dirname(F_SOURCES), { recursive: true });
  fs.writeFileSync(F_SOURCES, JSON.stringify(registre, null, 1) + "\n");
  let maj = 0;
  for (const { fichier, fiche: f } of lireFiches()) {
    const citees = [...JSON.stringify({ ...f, provenance: {} }).matchAll(/"(src-[a-z0-9-]+)"/g)].map((m) => m[1]);
    const ids = [...new Set([...(f.provenance.sources || []), ...(parFiche.get(f.id) || []), ...citees])].sort();
    if (JSON.stringify(ids) !== JSON.stringify(f.provenance.sources)) {
      f.provenance.sources = ids;
      fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
      maj++;
    }
  }
  ecrireRegistre();
  console.log(`[sources] ${registre.totaux.sources} sources (${registre.totaux.editeurs} éditeurs, ${registre.totaux.avecUrl} avec adresse) ; ${maj} fiches reliées`);
}
