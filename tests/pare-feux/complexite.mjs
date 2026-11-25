// Complexité jugée fonction par fonction (Félix, 25 nov. 2026, 10 h 31 : « Pour la complexité, il faut juger si elle
// est nécessaire pour répondre aux contraintes demandées ou non. »). Une fonction du code V3 au-delà de 15 en complexité
// cyclomatique (NIST SP 500-235 : 10 par fonction, 15 au plus avec justification) n'est admise qu'inscrite ici, avec :
//   plafond : sa complexité mesurée ; une hausse fait échouer la mesure (scripts/kpi/mesurer.mjs) ;
//   verdict : « nécessaire » (la complexité vient des contraintes elles-mêmes), « hors produit » (script d'étude qui ne
//             passe jamais dans l'application), « prototype » (réécrit à l'intégration), « à simplifier » (la
//             complexité ne vient pas des contraintes : à découper avant la clôture de `phase`) ;
//   raison : le jugement, en clair.
// Une fonction simplifiée sous 16 sort de ce registre (la mesure le signale). Clé : fichier#nom de la fonction.

export const COMPLEXITE = {
  "scripts/etude-moteur-bord/securite.mjs#etatSecurite": { plafond: 54, verdict: "à simplifier", phase: 10,
    raison: "La logique est nécessaire : chaque donnée de sécurité (vent, rafales, deux modèles, houle, engagement, marée, isolement, nuit, consignes, fermeture) a son cas « inconnu », et la sécurité ne se compense jamais. Sa concentration dans une seule fonction ne l'est pas : à l'implémentation, une règle par fonction (chacune rend un état et sa raison), combinées par « le pire l'emporte ». Chaque règle devient lisible et testable seule." },
  "scripts/etude-moteur-bord/classement.mjs#classer": { plafond: 19, verdict: "à simplifier", phase: 10,
    raison: "Les étapes du classement sont imposées (§ 9.1.6 : contrôles d'entrée, exclusions, sécurité, « à vérifier » séparé, tri, égalités, place réservée), mais rien n'oblige à les écrire dans une seule fonction : une fonction par étape à l'implémentation." },
  "scripts/etude-moteur-bord/architectures.mjs#a1": { plafond: 18, verdict: "à simplifier", phase: 10,
    raison: "Le calcul de la fourchette et le choix du niveau de publication (nombre, fourchette, qualitatif, aucun) sont deux décisions distinctes, à séparer à l'implémentation." },
  "scripts/etude-moteur-bord/zinb.mjs#thetaPosterieur": { plafond: 16, verdict: "nécessaire",
    raison: "Un point au-dessus de la limite. Il vient des contrôles d'entrée exigés (ψ dans ]0 ; 1], k > 0, q présent pour chaque bredouille) et du contrôle de troncature de la grille : les retirer affaiblirait le calcul." },
  "scripts/etude-moteur-bord/etude.mjs#grille": { plafond: 23, verdict: "hors produit",
    raison: "Expérience de l'étude de la phase 6 (grille de situations) : elle ne passe jamais dans l'application et ne touche aucun utilisateur ; sa lisibilité suffit à rejouer l'étude." },
  "scripts/etude-moteur-bord/etude.mjs#e8": { plafond: 24, verdict: "hors produit",
    raison: "Expérience E8 de l'étude (lecture des données de sécurité des fiches) : hors de l'application." },
  "scripts/etude-moteur-bord/etude.mjs#(fléchée 1)": { plafond: 18, verdict: "hors produit",
    raison: "Fonction interne de l'expérience E8 : hors de l'application." },
  "scripts/etude-moteur-bord/etude.mjs#e9": { plafond: 32, verdict: "hors produit",
    raison: "Expérience E9 de l'étude (fiches qui pourraient être « au vert ») : hors de l'application." },
  "src/prototype-v3/effets.js#terrain": { plafond: 46, verdict: "prototype", phase: 12,
    raison: "Prototype : chaque type de terrain a son explication, écrite en conditions enchaînées. La diversité des terrains est nécessaire, pas la forme : à l'intégration, une table de connaissances (une ligne par terrain et par effet, sourcée) lue par une fonction simple." },
  "src/prototype-v3/app.jsx#App": { plafond: 24, verdict: "prototype", phase: 12,
    raison: "Prototype : la coquille gère à la fois les onglets, le mode, la position et les écrans. À l'intégration, un composant par responsabilité." },
  "src/prototype-v3/geomap.jsx#GeoMap": { plafond: 26, verdict: "prototype", phase: 12,
    raison: "Prototype : la carte gère dessin, gestes, sélection et légende. À l'intégration, ces rôles sont séparés." },
  "src/prototype-v3/geomap.jsx#Ring": { plafond: 20, verdict: "prototype", phase: 12,
    raison: "Prototype : la pastille de score cumule ses variantes (score, « à vérifier », groupe, sélection). À l'intégration, une variante par composant du Design System." },
  "src/prototype-v3/modele.js#favorability": { plafond: 19, verdict: "prototype", phase: 12,
    raison: "Copie de démonstration du modèle V2 dans le prototype : remplacée par le vrai moteur V3 (phases 10 à 12)." },
};
