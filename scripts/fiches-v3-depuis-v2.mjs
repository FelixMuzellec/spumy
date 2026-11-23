// Phase 5 V3, sous-tâche 5.3 : première version des fiches V3 (référentiel § 7.4) à partir de la sauvegarde V2.
//
// Pour chaque spot de data/spots/v2/sauvegarde.json SANS fiche, écrit data/spots/fiches/<id>.json :
//   - origine `v2_preserved`, identifiant gardé (V3-018), empreinte de la fiche V2 ;
//   - chaque champ V2 repris avec son statut (confiance V2 traduite) et `origine: "v2"`, jamais revérifié ici
//     (`verifie_le` nul) ;
//   - ce que la V2 ne dit pas reste INCONNU, avec sa raison (stationnement, marche, quatre phases de marée, fenêtres
//     habituelles, photos…) ;
//   - la fiche est « à vérifier » : la qualification vient en 5.9, après la vérification de 5.7.
// Une fiche existante n'est JAMAIS réécrite : elle peut avoir été enrichie. Puis régénère data/spots/registre.json.
//
//   node scripts/fiches-v3-depuis-v2.mjs
import fs from "node:fs";
import path from "node:path";
import { registre, ecrireRegistre } from "./registre-spots.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(root, "data/spots/fiches");
const sauv = JSON.parse(fs.readFileSync(path.join(root, "data/spots/v2/sauvegarde.json"), "utf8"));
const inv = JSON.parse(fs.readFileSync(path.join(root, "data/spots/v2/inventaire.json"), "utf8"));
const empreinte = Object.fromEntries(inv.spots.map((s) => [s.id, s.empreinte]));

const STATUT_V2 = { verified: "VÉRIFIÉ", local_knowledge: "OBSERVATION LOCALE", inference: "INFÉRÉ" };
const v2 = (texte, statut = "INFÉRÉ", extra = {}) => ({ statut, origine: "v2", ...(texte != null ? { texte } : {}), verifie_le: null, ...extra });
const val = (valeur, texte, statut = "INFÉRÉ") => ({ statut, origine: "v2", valeur, ...(texte ? { texte } : {}), verifie_le: null });
const inconnu = (raison) => ({ statut: "INCONNU", origine: "v2", raison });
const topo = (t) => (t && t.text ? v2(t.text, STATUT_V2[t.confidence] || "INFÉRÉ") : inconnu("Absent de la fiche V2."));

/** « 49°01'N 1°35'W » → degrés décimaux. */
function dms(s) {
  const m = /^(\d+)°(\d+)'([NS])\s+(\d+)°(\d+)'([EW])$/.exec(String(s || "").trim());
  if (!m) return null;
  const lat = (+m[1] + +m[2] / 60) * (m[3] === "S" ? -1 : 1), lon = (+m[4] + +m[5] / 60) * (m[6] === "W" ? -1 : 1);
  return { lat: +lat.toFixed(4), lon: +lon.toFixed(4) };
}

const PERSO = /Tes sessions|tes sessions|Ta session|tes prises|Tes prises/;

function fiche(guide, sp) {
  const anomalies = [];
  let coordinates;
  if (typeof sp.lat === "number" && typeof sp.lon === "number") {
    coordinates = { lat: sp.lat, lon: sp.lon, precision_m: null, info: v2(`Coordonnées de la fiche V2 (${sp.coords || "sans texte"}) ; précision non documentée.`) };
  } else {
    const d = dms(sp.coords);
    if (!d) throw new Error(`${sp.id} : coordonnées illisibles (${sp.coords})`);
    coordinates = { ...d, precision_m: 1850, info: v2(`Coordonnées V2 en texte à la minute près (${sp.coords}), converties en degrés décimaux : jusqu'à 1,85 km d'écart.`, "INFÉRÉ") };
    anomalies.push("Coordonnées V2 seulement en texte, à la minute près (jusqu'à 1,85 km d'écart) : à vérifier en priorité.");
  }
  if (PERSO.test(JSON.stringify(sp))) anomalies.push("La fiche V2 cite le journal personnel de Félix (sessions, prises) : à revoir avant publication d'une fiche V3.");
  const t = sp.terrain || {};
  const tconf = STATUT_V2[t.confidence] || "INFÉRÉ";
  const { description, lifeHack, montantOuDescendant, typeHeure, windows } = sp.tidalRules || {};
  return {
    id: sp.id,
    name: sp.name,
    origin: "v2_preserved",
    legacy: {
      guide, empreinte_v2: empreinte[sp.id],
      champs_non_repris: {
        zone: "secteur météo du guide V2 : aucun découpage géographique en V3 (CLAUDE.md)",
        isLocal: "rattachement au guide V2",
        distance: "distance fixe depuis le centre du guide ; remplacée par le temps de route IGN depuis la position",
        distMin: "idem",
        color: "couleur d'affichage V2",
        ...(sp.riviere !== undefined ? { riviere: "indicateur V2 repris dans environment.milieu si utile ; valeur gardée dans la sauvegarde" } : {}),
      },
    },
    coordinates,
    access: {
      stationnement: inconnu("La fiche V2 ne donne pas de point de stationnement géolocalisé (RTE-04) : à vérifier en 5.7."),
      approche: sp.access ? v2(sp.access) : inconnu("Absent de la fiche V2."),
      marche_min: inconnu("Temps de marche non documenté en V2."),
      difficulte: inconnu("Difficulté d'accès non documentée séparément en V2 (l'engagement est dans safety)."),
      restrictions: inconnu("Restrictions d'accès non documentées en V2 : à vérifier (arrêtés, propriétés, zones protégées)."),
    },
    environment: {
      milieu: v2([sp.type, sp.subtitle].filter(Boolean).join(" — ")),
      fond: t.fond ? v2(t.fond, tconf, { valeur: { encombrement: t.encombrement, gratter: t.gratter, couches: t.couches } }) : topo(sp.topology?.fond),
      exposition: topo(sp.topology?.exposition),
      profondeur: t.prof ? v2(t.prof.why, tconf, { valeur: { classe: t.prof.cls } }) : inconnu("Absente de la fiche V2."),
      structures: topo(sp.topology?.structure),
      courant: (() => {
        const i = topo(sp.topology?.courant);
        const extra = Object.fromEntries(["raz", "courantFort", "courantSurface"].filter((k) => sp[k] !== undefined).map((k) => [k, sp[k]]));
        return Object.keys(extra).length && i.statut !== "INCONNU" ? { ...i, valeur: extra } : i;
      })(),
    },
    tide_approaches: {
      basse: inconnu("V2 : règles de marée non séparées par phase (voir v2) ; à documenter séparément (§ 7.5)."),
      montante: inconnu("V2 : règles de marée non séparées par phase (voir v2) ; à documenter séparément (§ 7.5)."),
      haute: inconnu("V2 : règles de marée non séparées par phase (voir v2) ; à documenter séparément (§ 7.5)."),
      descendante: inconnu("V2 : règles de marée non séparées par phase (voir v2) ; à documenter séparément (§ 7.5)."),
      coefficients: Array.isArray(sp.coefBand) ? val(sp.coefBand, "Bande de coefficients utile de la fiche V2 [minimum, début optimal, fin optimale, maximum] ; aucun seuil universel (§ 7.5).") : inconnu("Absente de la fiche V2."),
      ...(sp.tidePort ? { port_maree: val(sp.tidePort, "Port de marée de référence de la fiche V2.") } : {}),
      v2: { description, lifeHack, montantOuDescendant, typeHeure, windows },
    },
    conditions: {
      favorables: Array.isArray(sp.shelteredAngles) ? val({ abri_deg: sp.shelteredAngles }, "Directions d'abri de la fiche V2 (degrés).") : inconnu("Absent de la fiche V2."),
      defavorables: Array.isArray(sp.exposedAngles) ? val({ exposition_deg: sp.exposedAngles }, sp.weatherNote || "Directions exposées de la fiche V2 (degrés).") : inconnu("Absent de la fiche V2."),
      dangereuses: typeof sp.houleMax === "number" ? val({ houle_max_m: sp.houleMax }, "Au-delà de cette houle, la V2 ne recommande plus le spot.") : inconnu("Absent de la fiche V2."),
    },
    species: [{ espece: "bar", priorite: 1, presence: topo(sp.topology?.bars) }],
    strategies: [
      ...(t.montage ? [v2(t.montage, tconf)] : []),
      ...(t.conseils || []).map((c) => v2(c, tconf)),
      ...(lifeHack ? [v2(lifeHack)] : []),
    ],
    lure_guidance: (sp.lures || []).map((l) => val(l, "Leurre conseillé par la fiche V2 ; à reformuler en conseil générique (§ 7.4.1).")),
    safety: {
      engagement: typeof sp.dangerLevel === "number" ? val(sp.dangerLevel, "Niveau d'engagement V2 : 1 facile, 2 modéré, 3 engagé.") : inconnu("Absent de la fiche V2."),
      consignes: (sp.securite || []).map((c) => v2(c.t, "INFÉRÉ", { ...(c.s ? { source_texte: c.s } : {}), ...(c.when ? { quand: c.when } : {}) })),
      houle_max_m: typeof sp.houleMax === "number" ? val(sp.houleMax, "Houle maximale de la fiche V2 (mètres).") : inconnu("Absente de la fiche V2."),
      coef_max: typeof sp.coefHardMax === "number" ? val(sp.coefHardMax, sp.coefHardMaxWhy || "Coefficient au-delà duquel la V2 ne propose plus le spot.") : inconnu("Aucun coefficient maximal dans la fiche V2."),
    },
    regulations: [v2("Règle V2 : réglementation du bar appliquée selon le 48ᵉ parallèle (arrêté du 1er avril 2026) ; à vérifier sur la source officielle, avec sa date (5.7).")],
    windows: {
      habituelles: inconnu("Aucune fenêtre de fonctionnement habituelle documentée en V2 (§ 7.6) ; les créneaux V2 sont calculés."),
      securite: inconnu("Fenêtre d'accessibilité non documentée en V2 ; voir les consignes de sécurité."),
    },
    photos: inconnu("Photos réelles du spot non inventoriées ; les photos V2 sont des illustrations, jamais le lieu."),
    provenance: { sources: [], sources_v2: sp.sources || [], ...(t.faits ? { faits_v2: t.faits } : {}) },
    quality: { statut: "a_verifier", derniere_verification: null, completude: 0, inconnus: [], anomalies },
  };
}

/** Champs inconnus et complétude (part des informations connues). */
export function qualite(f) {
  const inconnus = [];
  let total = 0;
  const visite = (o, chemin) => {
    if (Array.isArray(o)) { o.forEach((x, i) => visite(x, `${chemin}[${i}]`)); return; }
    if (!o || typeof o !== "object") return;
    if (typeof o.statut === "string" && typeof o.origine === "string") { total++; if (o.statut === "INCONNU") inconnus.push(chemin); return; }
    for (const [k, v] of Object.entries(o)) if (!["legacy", "provenance", "quality", "v2"].includes(k)) visite(v, chemin ? `${chemin}.${k}` : k);
  };
  visite(f, "");
  return { inconnus, completude: total ? +((total - inconnus.length) / total).toFixed(2) : 0 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fs.mkdirSync(DIR, { recursive: true });
  let crees = 0, gardees = 0;
  for (const [guide, g] of Object.entries(sauv.guides)) {
    for (const sp of g.spots) {
      const f = path.join(DIR, `${sp.id}.json`);
      if (fs.existsSync(f)) { gardees++; continue; }
      const fi = fiche(guide, sp);
      const q = qualite(fi);
      fi.quality.inconnus = q.inconnus; fi.quality.completude = q.completude;
      fs.writeFileSync(f, JSON.stringify(fi, null, 1) + "\n");
      crees++;
    }
  }
  ecrireRegistre();
  console.log(`[fiches V3] ${crees} créées, ${gardees} gardées telles quelles ; registre : ${registre().spots.length} spots`);
}
