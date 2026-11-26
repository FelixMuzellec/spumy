// Phase 5 V3, sous-tâche 5.7 (sécurité) : contrainte d'accès liée à la marée, classée à la main spot par spot depuis
// les consignes de sécurité de la fiche (§ 7.6, fenêtre de sécurité/accessibilité, et § 0.2 : la sécurité ne se
// compense jamais). Chaque classement cite la consigne qui le fonde ; rien n'est déduit d'un mot-clé seul.
// Codes :
//   praticable_a_basse_mer_seulement : l'accès (gué, île, îlette, platier, traversée) n'existe qu'autour de la basse mer ;
//   isolement_au_flot : le flot peut couper le retour (bancs, platiers, estran plat, pointe, îlots) ;
//   submersible_a_pleine_mer : le poste (quai, roches basses, estran rocheux) est recouvert à marée haute ;
//   acces_selon_maree : accès dépendant de la marée, sans plus de précision dans la source.
// Aucune durée praticable n'est sourcée : la fenêtre de sécurité reste INCONNU, avec la contrainte dans sa raison.
// Les spots sans consigne de marée reçoivent acces_maree INCONNU (« aucune contrainte documentée », jamais « sans risque »).
//   node scripts/securite-maree.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";

/** Classement relu à la main (23 nov. 2026) : spot → [codes, extrait exact de la consigne qui le fonde]. */
export const CLASSEMENT = {
  aberbenoit: [["isolement_au_flot"], "la mer remonte vite sur les bancs"],
  agon: [["isolement_au_flot"], "La pointe s'isole vite"],
  barnenez: [["isolement_au_flot"], "Gardez un œil sur la marée montante"],
  capcoz: [["submersible_a_pleine_mer"], "estran rocheux submergé à marée montante"],
  carantec: [["isolement_au_flot"], "pour ne pas être coupé du bord"],
  gouville: [["isolement_au_flot"], "Le flot remonte entre les tables"],
  granville: [["submersible_a_pleine_mer"], "un poste accessible à basse mer peut disparaître vite"],
  kermorvan: [["praticable_a_basse_mer_seulement", "isolement_au_flot"], "L'Îlette n'est accessible qu'à marée basse"],
  kernic: [["isolement_au_flot"], "garder le chemin du retour"],
  locquirec: [["acces_selon_maree"], "accessibles en fonction des marées"],
  mousterlin: [["isolement_au_flot"], "la mer qui monte coupe le retour"],
  paluden: [["praticable_a_basse_mer_seulement"], "n'est praticable qu'à marée basse"],
  penmarch: [["submersible_a_pleine_mer"], "submersion à marée montante"],
  pennenez: [["isolement_au_flot"], "ne pas se laisser couper le retour"],
  penze: [["submersible_a_pleine_mer"], "submersibles à pleine mer"],
  pirou: [["isolement_au_flot"], "le flot gagne vite"],
  portbail: [["praticable_a_basse_mer_seulement", "isolement_au_flot"], "Platier accessible à basse mer seulement"],
  regneville: [["praticable_a_basse_mer_seulement", "isolement_au_flot"], "le flot reprend par l'arrière"],
  saintemarguerite: [["praticable_a_basse_mer_seulement", "isolement_au_flot"], "repartir avant que la mer ne coupe le passage"],
  sciotot: [["isolement_au_flot"], "le flot peut couper le retour"],
  surtainville: [["isolement_au_flot"], "le flot gagne vite"],
  terenez: [["praticable_a_basse_mer_seulement", "isolement_au_flot"], "retour obligatoire avant le flot"],
};
/**
 * Fiches V3 : contrainte de marée tirée de sources lues (§ 7.1), jamais d'une consigne V2. Chaque consigne cite ses sources ;
 * la fenêtre reste INCONNU tant qu'aucune durée n'est lue sans ambiguïté.
 */
export const CLASSEMENT_V3 = {
  grandbe: {
    codes: ["praticable_a_basse_mer_seulement", "isolement_au_flot"],
    consignes: [
      { texte: "Office de tourisme de Saint-Malo (page anglaise) : le Grand Bé, « You can only get there for a few hours a day, at low tide, by crossing Bon Secours beach » ; le Petit Bé, à pied ou en bateau selon la marée, après avoir vérifié l'heure de basse mer du jour.", sources: ["src-saint-malo-tourisme-bes"] },
      { texte: "Un pêcheur du site : « vous pouvez devenir prisonnier de ces deux îlots », « Désagréable et dangereux » ; sessions de trois heures au plus.", sources: ["src-oupecher-saint-malo-bar"] },
      { texte: "« une remontée rapide de l'eau peut isoler l'îlot, et les indications locales priment toujours ».", sources: ["src-figaro-nautisme-forts-saint-malo"] },
    ],
    fenetre: "L'office de tourisme rapporte l'accès à l'heure de basse mer du jour (« 1? hours before and 1? hours after » : chiffre mal affiché sur la page lue) ; un pêcheur du site parle de « deux ou trois heures de pêche max ». Tant que la durée n'est pas relue sans ambiguïté, aucun intervalle HH:MM n'est calculé (§ 7.6) et le spot n'est jamais présenté comme praticable.",
  },
};
/**
 * Phase 7 (26 nov. 2026, après la réponse de Félix à Q7-03 : il ne connaît pas ces spots) : consignes sourcées trouvées
 * dans des pages publiques, ajoutées aux fiches. Une règle générale (commune, département) est dite telle ; aucune n'est
 * propre au poste sauf mention.
 */
const J7 = "2026-11-26";
const R_LANDEDA = { texte: "Règle générale de la commune de Landéda pour la pêche à pied : « Commencez à remonter à l'heure de marée basse » (pas propre au poste).", sources: ["src-landeda-guide-peche-a-pied-2017"] };
const R_MANCHE = { texte: "Règle générale de la Manche pour la pêche à pied (dépliant 50-14, DDTM et CPIE) : « remontez dès l'heure de la basse mer » (pas propre au poste).", sources: ["src-flyer-peche-pied-50-14"] };
export const CONSIGNES_PHASE7 = {
  aberbenoit: [R_LANDEDA],
  saintemarguerite: [R_LANDEDA],
  paluden: [R_LANDEDA, { texte: "Le passage de Pont Krac'h, dit pont du Diable, est un « pont submersible » qui « disparaît avec la montée des eaux » (fiche et avis de randonneurs).", sources: ["src-visorando-pont-du-diable"] }],
  kernic: [{ texte: "Baie du Kernic : « marnage très important » ; baignade « déconseillée dans la baie en raison des courants » (Tourisme Bretagne).", sources: ["src-tourisme-bretagne-kernic"] }],
  agon: [R_MANCHE], gouville: [R_MANCHE], sciotot: [R_MANCHE], surtainville: [R_MANCHE],
  regneville: [R_MANCHE, { texte: "Havre de la Sienne : « Passage qui inonde particulièrement vite du fait de la proximité avec la Sienne » ; en grande marée, la mer inonde presque tout le sentier du sud du havre (diagnostic des sentiers, Attitude Manche).", sources: ["src-attitude-manche-diag-coutances"] }],
  portbail: [R_MANCHE, { texte: "Havre de Portbail : la passerelle du sentier est « submersible par grande marée (coefficient de marée de 95 à 100) » ; le havre nord est « inondé par grande marée » (diagnostic des sentiers, Attitude Manche ; porte sur le sentier, pas sur le platier).", sources: ["src-attitude-manche-diag-cotentin"] }],
  pirou: [R_MANCHE, { texte: "Pirou : un groupe a été isolé par la marée « à 600m de la plage » le 17 août 2012 (presse) : un fait, pas une règle.", sources: ["src-tendanceouest-pirou-2012"] }],
  granville: [R_MANCHE, { texte: "Pointe du Roc : quatre personnes piégées par la marée montante dans une grotte « au pied de la falaise » le 17 févr. 2019, hélitreuillées (presse) : un fait, pas une règle.", sources: ["src-tendanceouest-granville-2019"] }],
};
/** Fenêtres de sécurité lues sans ambiguïté dans une source publique (§ 7.6). */
export const FENETRES_PHASE7 = {
  grandbe: { statut: "INFÉRÉ", origine: "v3", sources: ["src-ot-saint-malo-acces-forts", "src-ville-saint-malo-vigilance-grand-be"], verifie_le: J7, niveau: 4,
    valeur: { reference: "BM", avant_h: 1.5, apres_h: 1.5 },
    texte: "Accès à pied de 1 h 30 avant à 1 h 30 après la basse mer du jour (office de tourisme de Saint-Malo : « une fenêtre d'accès de 3 heures ») ; la ville publie aussi des horaires d'accès sécurisés et rappelle que des visiteurs sont « piégés par la marée montante ». Aux très petits coefficients, le passage ne découvre pas (aucun seuil publié). Règle de visite, pas de pêche : pour pêcher, repartir avant la fin de la fenêtre." },
};
const ajouterConsignes = (f) => {
  for (const c of CONSIGNES_PHASE7[f.id] || []) {
    if (f.safety.consignes.some((x) => x.texte === c.texte)) continue;
    f.safety.consignes.push({ statut: "INFÉRÉ", origine: "v3", texte: c.texte, sources: c.sources, verifie_le: J7 });
  }
  if (FENETRES_PHASE7[f.id]) f.windows.securite = FENETRES_PHASE7[f.id];
};
const JOUR = "2026-11-23";
const LIBELLE = {
  praticable_a_basse_mer_seulement: "accès praticable seulement autour de la basse mer",
  isolement_au_flot: "le flot peut couper le retour",
  submersible_a_pleine_mer: "poste recouvert à marée haute",
  acces_selon_maree: "accès dépendant de la marée",
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const bilan = {};
  for (const { fichier, fiche: f } of lireFiches()) {
    const c = CLASSEMENT[f.id];
    const s = f.safety;
    if (s.acces_maree?.origine === "v3" && s.acces_maree.statut === "VÉRIFIÉ") continue; // vérification de terrain : jamais écrasée
    const v3 = CLASSEMENT_V3[f.id];
    if (v3) {
      const textes = new Set(v3.consignes.map((x) => x.texte));
      s.consignes = [...s.consignes.filter((x) => !textes.has(x.texte)), ...v3.consignes.map((x) => ({ statut: "INFÉRÉ", origine: "v3", texte: x.texte, sources: x.sources, verifie_le: JOUR }))];
      s.acces_maree = { statut: "INFÉRÉ", origine: "v3", valeur: v3.codes, sources: [...new Set(v3.consignes.flatMap((x) => x.sources))], verifie_le: JOUR,
        texte: `${(([t]) => t[0].toUpperCase() + t.slice(1))([v3.codes.map((k) => LIBELLE[k]).join(" ; ")])}. Classement relu à la main depuis les consignes sourcées de la fiche.` };
      f.windows.securite = { statut: "INCONNU", origine: "v3", raison: v3.fenetre };
      ajouterConsignes(f);
      for (const k of v3.codes) bilan[k] = (bilan[k] || 0) + 1;
      const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
      fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
      continue;
    }
    if (f.origin !== "v2_preserved" && !c) continue; // fiche V3 sans consigne : sa contrainte reste celle de la fiche
    if (c) {
      const [codes, extrait] = c;
      const consigne = s.consignes.find((x) => x.texte.includes(extrait));
      if (!consigne) throw new Error(`${f.id} : consigne introuvable (« ${extrait} »)`);
      s.acces_maree = { statut: "INFÉRÉ", origine: "v2", valeur: codes, verifie_le: null,
        texte: `${(([t]) => t[0].toUpperCase() + t.slice(1))([codes.map((k) => LIBELLE[k]).join(" ; ")])}. Classement relu à la main depuis la consigne de la fiche : « ${consigne.texte} »`,
        ...(consigne.source_texte ? { source_texte: consigne.source_texte } : {}) };
      f.windows.securite = { statut: "INCONNU", origine: "v2",
        raison: `Contrainte de marée documentée (${codes.map((k) => LIBELLE[k]).join(" ; ")}), mais aucune durée praticable n'est sourcée : aucun intervalle HH:MM ne peut être calculé (§ 7.6). Le spot ne peut pas être présenté comme praticable sans fenêtre documentée.` };
      for (const k of codes) bilan[k] = (bilan[k] || 0) + 1;
    } else {
      s.acces_maree = { statut: "INCONNU", origine: "v2", raison: "Aucune contrainte d'accès liée à la marée dans les consignes de la fiche : non documentée, ce qui ne veut pas dire sans risque." };
      bilan.non_documente = (bilan.non_documente || 0) + 1;
    }
    ajouterConsignes(f);
    const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
    fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
  }
  ecrireRegistre();
  console.log(`[sécurité marée] ${Object.keys(CLASSEMENT).length + Object.keys(CLASSEMENT_V3).length} spots classés :`, bilan);
}
