// Phase 5 V3, sous-tâche 5.7 : règles locales de pêche relevées dans les textes officiels ou leurs reprises, par spot.
// Lu par scripts/reglementation-fiches.mjs, qui les ajoute après les règles nationales du bar. Chaque règle cite son
// texte exact ; son application au poste précis est marquée « à vérifier » tant que le périmètre n'est pas connu.
const JOUR = "2026-11-23";
const S29 = "src-ddtm29-synthese-peche-loisir-2026";
const SDIRM = "src-dirm-namo-synthese-peche-loisir-2024";
/**
 * Départements dont les règles locales ont été recherchées dans un texte officiel lu (QUAL-6) : sans recherche,
 * l'absence de règle locale n'est jamais prise pour une absence de règle. La Manche (50) n'est pas encore couverte.
 */
export const REGLES_LOCALES_LUES = { 29: S29, 22: SDIRM, 35: SDIRM, 56: SDIRM };
const PORT = { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "Finistère", application_au_poste: "à vérifier" },
  texte: "Finistère : il est interdit « de pêcher à l'intérieur des limites administratives des ports » (synthèse de la DDTM du Finistère, avril 2026, p. 4). Le poste décrit touche un port, une digue ou une cale : avant toute recommandation, vérifier qu'il est hors de ces limites." };
const ZOSTERES = { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "Finistère", application_au_poste: "à vérifier" },
  texte: "Finistère : « La pêche dans les herbiers de zostères est interdite » (synthèse de la DDTM du Finistère, avril 2026, p. 4 ; le barème des sanctions vise la « pêche à pied »). La fiche décrit des herbiers : ne pas pêcher ni marcher dedans ; les conseils qui visent les herbiers sont à revoir." };
export const LOCALES = {
  // Postes à un port, une digue ou une cale (type d'environnement de la fiche), dans le Finistère.
  ...Object.fromEntries(["aberbenoit", "aberildut", "capcoz", "feunteunaod", "goyen", "laita", "landevennec", "locquirec", "morgat", "paluden", "pennenez", "penze", "portmanech", "trevignon"].map((id) => [id, [PORT]])),
  bendy: [ZOSTERES],
  camfrout: [ZOSTERES],
  capfrehel: [{ statut: "VÉRIFIÉ", origine: "v3", sources: [SDIRM], verifie_le: JOUR, niveau: 2, valeur: { portee: "cap Fréhel, du 1er mars au 31 mai", reference: "arrêté n° 116/2005 du 3 mai 2005", application_au_poste: "à vérifier" },
    texte: "Cap Fréhel : « Interdiction de toute forme de pêche du bar chaque année du 1er mars au 31 mai » au large, entre 48°40' et 48°42' N et entre 02°17'50 et 02°20' W (arrêté n° 116/2005, synthèse de la DIRM Nord Atlantique – Manche Ouest, avril 2024, p. 3). Le point de la fiche est dans ce rectangle : vérifier que l'arrêté est toujours en vigueur et s'il vise la pêche depuis la côte." }],
  portmanech: [PORT, { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "cantonnement « Le Cochon »", application_au_poste: "à vérifier" },
    texte: "Cantonnement de Port-Manec'h dit « Le Cochon » : « Toute pêche » interdite (synthèse de la DDTM du Finistère, avril 2026, p. 6). Le périmètre n'est pas dans le texte lu : vérifier que le poste est hors du cantonnement." }],
  sciotot: [{ statut: "INFÉRÉ", origine: "v3", sources: ["src-attitude-manche-sciotot"], verifie_le: JOUR, niveau: 4, valeur: { portee: "plage de Sciotot (Les Pieux)", reference: "arrêté municipal A2022-06-13-001", application_au_poste: "à vérifier" },
    texte: "Plage de Sciotot, d'après l'arrêté municipal A2022-06-13-001 cité par Attitude Manche : « Dans la zone de baignade surveillée, la pêche en surface et la pêche sous-marine sont interdites » ; « Le mode de pêche à l'hameçon (paillots…), lors de la période autorisée (16/09 au 14/06) est strictement interdite au droit de la Cale jusqu'à la barre rocheuse au niveau de la Roquette ». L'arrêté n'a pas été lu : sa portée pour la pêche au leurre à la canne est à confirmer auprès de la mairie des Pieux." }],
};
