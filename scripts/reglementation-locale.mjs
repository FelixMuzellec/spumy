// Phase 5 V3, sous-tâche 5.7 : règles locales de pêche relevées dans les textes officiels ou leurs reprises, par spot.
// Lu par scripts/reglementation-fiches.mjs, qui les ajoute après les règles nationales du bar. Chaque règle cite son
// texte exact ; son application au poste précis est marquée « à vérifier » tant que le périmètre n'est pas connu.
const JOUR = "2026-11-23";
const S29 = "src-ddtm29-synthese-peche-loisir-2026";
const PORT = { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "Finistère", application_au_poste: "à vérifier" },
  texte: "Finistère : il est interdit « de pêcher à l'intérieur des limites administratives des ports » (synthèse de la DDTM du Finistère, avril 2026, p. 4). Le poste décrit touche un port, une digue ou une cale : avant toute recommandation, vérifier qu'il est hors de ces limites." };
const ZOSTERES = { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "Finistère", application_au_poste: "à vérifier" },
  texte: "Finistère : « La pêche dans les herbiers de zostères est interdite » (synthèse de la DDTM du Finistère, avril 2026, p. 4 ; le barème des sanctions vise la « pêche à pied »). La fiche décrit des herbiers : ne pas pêcher ni marcher dedans ; les conseils qui visent les herbiers sont à revoir." };
export const LOCALES = {
  // Postes à un port, une digue ou une cale (type d'environnement de la fiche), dans le Finistère.
  ...Object.fromEntries(["aberbenoit", "aberildut", "capcoz", "feunteunaod", "goyen", "laita", "landevennec", "locquirec", "morgat", "paluden", "pennenez", "penze", "portmanech", "trevignon"].map((id) => [id, [PORT]])),
  bendy: [ZOSTERES],
  camfrout: [ZOSTERES],
  portmanech: [PORT, { statut: "VÉRIFIÉ", origine: "v3", sources: [S29], verifie_le: JOUR, niveau: 2, valeur: { portee: "cantonnement « Le Cochon »", application_au_poste: "à vérifier" },
    texte: "Cantonnement de Port-Manec'h dit « Le Cochon » : « Toute pêche » interdite (synthèse de la DDTM du Finistère, avril 2026, p. 6). Le périmètre n'est pas dans le texte lu : vérifier que le poste est hors du cantonnement." }],
  sciotot: [{ statut: "INFÉRÉ", origine: "v3", sources: ["src-attitude-manche-sciotot"], verifie_le: JOUR, niveau: 4, valeur: { portee: "plage de Sciotot (Les Pieux)", reference: "arrêté municipal A2022-06-13-001", application_au_poste: "à vérifier" },
    texte: "Plage de Sciotot, d'après l'arrêté municipal A2022-06-13-001 cité par Attitude Manche : « Dans la zone de baignade surveillée, la pêche en surface et la pêche sous-marine sont interdites » ; « Le mode de pêche à l'hameçon (paillots…), lors de la période autorisée (16/09 au 14/06) est strictement interdite au droit de la Cale jusqu'à la barre rocheuse au niveau de la Roquette ». L'arrêté n'a pas été lu : sa portée pour la pêche au leurre à la canne est à confirmer auprès de la mairie des Pieux." }],
};
