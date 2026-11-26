// Exigences du cahier des charges (docs/REQUIREMENTS.md, 98 exigences) reliées aux pare-feux (Félix, 25 nov. 2026,
// 7 h 25). Chaque exigence a une phase (colonne « Phase ») ; tests/pare-feux.mjs échoue si une phase se clôt
// (rapport docs/rapports/v3/PHASE-N.md) sans que ses exigences aient leur preuve, ou leur écart écrit.
//
// États :
//   accepte   : critère d'acceptation tenu, contrôles [fichier, marque] lancés par la CI (ou preuve écrite pour une
//               vérification par revue) ;
//   prototype : critère tenu sur le prototype V3 ; acceptation finale sur l'application intégrée à la phase `phase` ;
//   specifie  : spécifié et éprouvé sur l'étude (phase 6), sans code dans src/ ; acceptation finale à la phase `phase` ;
//   ecart     : la phase prévue est passée sans la preuve : l'écart, sa raison et la phase où il se résout sont écrits ;
//   (absente) : à faire ; l'échéance est la dernière phase de la colonne « Phase ».
// Une exigence absente de cette liste dont la phase est déjà close fait échouer les tests : il faut dire où en est sa
// preuve. Une exigence « toutes » doit être acceptée.

const P3 = "tests/prototype-v3.mjs", ET = "tests/etude-moteur-bord.mjs";

export const EXIGENCES = {
  "REC-03": { etat: "specifie", phase: 11, gardes: [[ET, "ne lit jamais la Confiance, la Pertinence ni la boîte"], [P3, "Fiche : Confiance ne change pas le rang"]] },
  "REC-06": { etat: "specifie", phase: 11, gardes: [[ET, "place réservée à un spot à"]] },
  "REC-08": { etat: "specifie", phase: 11, gardes: [[ET, "un vent inconnu ne publie jamais un nombre"]] },
  "SEC-02": { etat: "specifie", phase: 11, gardes: [[ET, "INSUFFICIENT_DATA ne vaut jamais SAFE"]],
    note: "écart déclaré pour la visibilité (D6-16, rapport de phase 6)" },
  "SEC-04": { etat: "prototype", phase: 12, gardes: [[P3, "Fiche : danger (fiche du spot) avant la marée"]] },
  "MAP-02": { etat: "prototype", phase: 12, gardes: [[P3, "Carte : compteur égal aux pastilles affichées (groupes comptés)"]] },
  "MAP-07": { etat: "prototype", phase: 12, gardes: [[P3, "Chaque écran s'ouvre sans erreur à 320, 375, 390 px et sur bureau"]] },
  "SPOT-01": { etat: "accepte", gardes: [["tests/spots-v3.mjs", "aucune perte V2"], ["scripts/inventaire-spots-v2.mjs", "--verifier"]] },
  "SPOT-02": { etat: "accepte", gardes: [["tests/spots-v3.mjs", "SPOT-02 : le schéma refuse une rubrique sans statut"], ["tests/spots-v3.mjs", "schéma : refuse une information V3 sans source ni date de vérification"]] },
  "SPOT-03": { etat: "accepte", gardes: [["tests/spots-v3.mjs", "SPOT-03 : le schéma refuse une fiche sans l'une des quatre phases de marée"]],
    note: "phase 7 : présentes ou marquées inconnues sur les 98 fiches ; 32 fiches n'ont encore aucune phase documentée (docs/halieutique/REGISTRE-INCONNUES-PHASE-7.md)" },
  "MAP-06": { etat: "accepte", gardes: [["tests/spots-v3.mjs", "MAP-06 : chaque fiche a une position en décimales"]],
    note: "phase 7 : 98 positions en décimales ; 29 non contrôlées ou douteuses, signalées par QUAL-3 et jamais corroborées" },
  "RTE-04": { etat: "ecart", phase: 10, raison: "le point d'accès (stationnement) est une rubrique distincte du poste, connue pour 91 fiches sur 98 ; la mention « jusqu'au poste » quand il manque arrive avec l'intégration de l'écran (phase 10)",
    gardes: [["tests/spots-v3.mjs", "RTE-04 : le point d'accès est une rubrique distincte du poste"]] },
  "SPOT-09": { etat: "prototype", phase: 12, gardes: [[P3, "Fiche : courbe de marée et horaires favorables coloriés"]],
    note: "courbe juste contre le calcul de marée et horaires identiques à Home : à éprouver sur l'application intégrée" },
  "SPOT-08": { etat: "ecart", phase: 12, raison: "le prototype affiche « Illustration » sur ses photos, mais aucun test ne le vérifie (PF-31)" },
  "BAT-01": { etat: "accepte", gardes: [["tests/e2e.mjs", "accueil : l'onglet Offshore affiche la pêche en bateau"]] },
  "BAT-02": { etat: "accepte", gardes: [["tests/upgrade.mjs", "ce qui a été saisi avec la version publiée est toujours là"]] },
  "BAT-08": { etat: "ecart", phase: 12, raison: "aucune donnée BORD dans BATEAU : tenu par les couches (tests/layers.mjs) ; le test de tâche 6 auprès d'utilisateurs n'a pas été mené (hypothèse H6 « À VALIDER », docs/design/DISCOVERY.md)",
    gardes: [["tests/layers.mjs", "Le bord et le bateau ne s'importent jamais"]] },
  "MET-01": { etat: "prototype", phase: 12, gardes: [[P3, "Météo : vent animé en couleurs (nappe et traînées)"]] },
  "MET-03": { etat: "ecart", phase: 12, raison: "aucune couleur de palier ni nom de zone dans la couche de vent : respecté par le prototype, sans test dédié" },
  "MET-04": { etat: "prototype", phase: 12, gardes: [[P3, "Météo : vent en nœuds, source et heure écrites"]],
    note: "« dans tous les états » (hors ligne, obsolète) reste à éprouver sur l'application intégrée" },
  "MET-05": { etat: "prototype", phase: 12, gardes: [[P3, "Carte : niveaux de preuve et sources affichés"], ["tests/knowledge.mjs", "cite au moins une source"]] },
  "UX-01": { etat: "accepte", gardes: [["tests/brand.py", "orange de l'aplat"]] },
  "UX-02": { etat: "accepte", gardes: [["tests/design-v3.mjs", "Palette approuvée"]] },
  "UX-03": { etat: "prototype", phase: 12, gardes: [[P3, "ni « V2 » ni « phase » à l'écran"], ["tests/pare-feux.mjs", "slogan écrit ailleurs qu'en tête de Home"]] },
  "UX-04": { etat: "ecart", phase: 12, raison: "le test de compréhension (4 personnes sur 5 expliquent « 53/100, à vérifier » et « 69/100, moyenne ») n'a pas été mené : hypothèses H4 et H5 « À VALIDER » (docs/design/DISCOVERY.md)" },
  "UX-07": { etat: "ecart", phase: 12, raison: "aucune capture au chargement ne vérifie l'absence de « à vérifier » provisoire" },
  "OFF-01": { etat: "accepte", gardes: [["tests/upgrade.mjs", "la nouvelle version marche hors ligne"]] },
  "OFF-04": { etat: "ecart", phase: 13, raison: "`test:upgrade` couvre la V2 ; la V3 n'a pas encore de stockage à migrer (Journal, Profil et synchronisation : phase 13)",
    gardes: [["tests/upgrade.mjs", "ce qui a été saisi avec la version publiée est toujours là"]] },
  "DAT-01": { etat: "specifie", phase: 10, gardes: [["tsconfig.typecheck.json", "\"checkJs\": true"], ["tests/socle.mjs", "validation des entrées"]] },
  "DAT-02": { etat: "specifie", phase: 10, gardes: [["tests/socle.mjs", "../src/core/ign/reponses.js"]],
    note: "adaptateur IGN et validation de ses réponses posés en phase 4 ; le changement de fournisseur avec un simulateur s'éprouve à l'implémentation" },
  "QA-01": { etat: "accepte", revue: true, gardes: [["docs/socle/perf-avant.json", "lcpMs"], ["docs/regles/KPI.md", "K-21"]],
    note: "mesure AVANT consignée (phase 4) ; seuils : ceux des Core Web Vitals, fixés par la norme, et planchers de qualité graphique (PF-43), par délégation de Félix (25 nov. 2026, 10 h 31) ; tenue des seuils : K-21 à K-24, phase 12" },
  "QA-03": { etat: "accepte", gardes: [[".github/workflows/tests.yml", "pull_request:"]] },
  "OPS-01": { etat: "accepte", gardes: [[".githooks/pre-push", "refusé : push sur main"], ["scripts/pare-feux/branche.mjs", "refusé : push sur main"]] },
  "OPS-02": { etat: "accepte", gardes: [["docs/DECISIONS_LOG.md", "étiquette `v2-final` sur bb4f940"]], revue: true },
};
