// Phase 5 V3, sous-tâche 5.7 : règles locales de pêche relevées dans les textes officiels ou leurs reprises, par spot.
// Lu par scripts/reglementation-fiches.mjs, qui les ajoute après les règles nationales du bar. Chaque règle cite son
// texte exact ; son application au poste précis est marquée « à vérifier » tant que le périmètre n'est pas connu.
const JOUR = "2026-11-23";
const S29 = "src-ddtm29-synthese-peche-loisir-2026";
const SDIRM = "src-dirm-namo-synthese-peche-loisir-2024";
/**
 * Départements dont les règles locales ont été recherchées dans un texte officiel lu (QUAL-6) : sans recherche,
 * l'absence de règle locale n'est jamais prise pour une absence de règle. La Manche (50) est recherchée depuis la phase 7
 * (26 nov. 2026) dans le projet officiel lu ; le texte signé (arrêté n° 116/2026) n'est pas lu : ses règles restent
 * « à vérifier ».
 */
const S50 = "src-dirm-memn-projet-peche-pied-manche-2026";
const S50_SIGNE = "src-littorea-manche-arrete-116-2026";
export const REGLES_LOCALES_LUES = { 29: S29, 22: SDIRM, 35: SDIRM, 56: SDIRM, 50: S50 };
const PORT = { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "Finistère", application_au_poste: "à vérifier" },
  texte: "Finistère : il est interdit « de pêcher à l'intérieur des limites administratives des ports » (synthèse de la DDTM du Finistère, avril 2026, p. 4). Le poste décrit touche un port, une digue ou une cale : avant toute recommandation, vérifier qu'il est hors de ces limites." };
const ZOSTERES = { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "Finistère", application_au_poste: "à vérifier" },
  texte: "Finistère : « La pêche dans les herbiers de zostères est interdite » (synthèse de la DDTM du Finistère, avril 2026, p. 4 ; le barème des sanctions vise la « pêche à pied »). La fiche décrit des herbiers : ne pas pêcher ni marcher dedans ; les conseils qui visent les herbiers sont à revoir." };
const JOUR7 = "2026-11-26";
/** Manche : règle départementale de la pêche à pied de loisir (la ligne tenue à la main ou fixée à une canne en fait partie). */
const MANCHE = { statut: "INFÉRÉ", origine: "v3", sources: [S50, S50_SIGNE], verifie_le: JOUR7, niveau: 2, valeur: { portee: "Manche, texte signé non lu", reference: "arrêté n° 116/2026 (préfet de la région Normandie)", application_au_poste: "à vérifier" },
  texte: "Manche : la pêche à pied de loisir, y compris à la ligne « tenue à la main ou fixée à une canne », est régie par l'arrêté n° 116/2026, signé selon le réseau Littorea (3 juillet 2026) ; le projet de la DIRM lu en entier abroge l'arrêté n° 34/2021. D'après ce projet : bar pêché à l'épuisette, à la ligne, à la palangre ou au paillot, tailles et quantités selon les règles européennes et nationales ; « des hameçons triples ne peuvent être utilisés que sur le leurre ou le plomb terminal de la ligne » ; paillots interdits du 15 juin au 15 septembre sur tout le littoral du département, palangres aux mêmes dates dans la zone de balancement des marées. Le texte signé n'a pas été lu : confirmer ces règles avant toute recommandation." };
/** Cantonnements de la Manche cités à l'art. 7 du projet (non signé : INFÉRÉ) : leur objet et leur périmètre ne sont pas dans le
 *  texte lu. Six sont cités : Chausey (1964), Cosqueville (1965), Blainville-sur-Mer (1977), Pirou (1978), Quinéville (1980),
 *  Saint-Germain-sur-Ay (1982). Chausey et Quinéville n'ont aucune fiche voisine ; Saint-Germain-sur-Ay est à environ 7 km de
 *  la fiche de Pirou, trop loin pour être rattaché sans son périmètre. */
const cantonnement = (lieu, arrete) => ({ statut: "INFÉRÉ", origine: "v3", sources: [S50], verifie_le: JOUR7, niveau: 2, valeur: { portee: `cantonnement de ${lieu}`, reference: `arrêté du ${arrete}`, application_au_poste: "à vérifier" },
  texte: `Manche : « les interdictions de pêche dans les réserves et cantonnements » créés notamment par l'arrêté du ${arrete} (${lieu}) « demeurent applicables » (projet d'arrêté de la DIRM, art. 7 ; projet non signé). L'arrêté de ${arrete.slice(-4)} n'a pas été lu : vérifier ce qu'il interdit et que le poste est hors de son périmètre.` });
const MANCHE_IDS = ["agon", "caplevi", "carteret", "gattemare", "gatteville", "goury", "gouville", "granville", "loge", "pirou", "portbail", "querqueville", "regneville", "saire", "surtainville", "tatihou"];
export const LOCALES = {
  ...Object.fromEntries(MANCHE_IDS.map((id) => [id, [MANCHE]])),
  gouville: [MANCHE, cantonnement("Blainville-sur-Mer", "1er février 1977")],
  loge: [MANCHE, cantonnement("Cosqueville", "18 mai 1965")],
  pirou: [MANCHE, cantonnement("Pirou", "13 juin 1978")],
  // Postes à un port, une digue ou une cale (type d'environnement de la fiche), dans le Finistère.
  ...Object.fromEntries(["aberbenoit", "aberildut", "capcoz", "feunteunaod", "goyen", "laita", "landevennec", "locquirec", "morgat", "paluden", "pennenez", "penze", "portmanech", "trevignon"].map((id) => [id, [PORT]])),
  bendy: [ZOSTERES],
  camfrout: [ZOSTERES],
  capfrehel: [{ statut: "VÉRIFIÉ", origine: "v3", sources: [SDIRM], verifie_le: JOUR, niveau: 2, valeur: { portee: "cap Fréhel, du 1er mars au 31 mai", reference: "arrêté n° 116/2005 du 3 mai 2005", application_au_poste: "à vérifier" },
    texte: "Cap Fréhel : « Interdiction de toute forme de pêche du bar chaque année du 1er mars au 31 mai » au large, entre 48°40' et 48°42' N et entre 02°17'50 et 02°20' W (arrêté n° 116/2005, synthèse de la DIRM Nord Atlantique – Manche Ouest, avril 2024, p. 3). Le point de la fiche est dans ce rectangle : vérifier que l'arrêté est toujours en vigueur et s'il vise la pêche depuis la côte." }],
  portmanech: [PORT, { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "cantonnement « Le Cochon »", application_au_poste: "à vérifier" },
    texte: "Cantonnement de Port-Manec'h dit « Le Cochon » : « Toute pêche » interdite (synthèse de la DDTM du Finistère, avril 2026, p. 6). Le périmètre n'est pas dans le texte lu : vérifier que le poste est hors du cantonnement." }],
  sciotot: [MANCHE, { statut: "INFÉRÉ", origine: "v3", sources: ["src-attitude-manche-sciotot"], verifie_le: JOUR, niveau: 4, valeur: { portee: "plage de Sciotot (Les Pieux)", reference: "arrêté municipal A2022-06-13-001", application_au_poste: "à vérifier" },
    texte: "Plage de Sciotot, d'après l'arrêté municipal A2022-06-13-001 cité par Attitude Manche : « Dans la zone de baignade surveillée, la pêche en surface et la pêche sous-marine sont interdites » ; « Le mode de pêche à l'hameçon (paillots…), lors de la période autorisée (16/09 au 14/06) est strictement interdite au droit de la Cale jusqu'à la barre rocheuse au niveau de la Roquette ». L'arrêté n'a pas été lu : sa portée pour la pêche au leurre à la canne est à confirmer auprès de la mairie des Pieux." }],
};
