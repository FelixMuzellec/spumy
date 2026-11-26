// Registre des pare-feux : chaque consigne de Félix (CLAUDE.md, docs/DECISIONS_LOG.md) et le contrôle automatique qui
// la fait respecter, version par version. Demande de Félix (25 nov. 2026, 6 h 32) : « mettre en place les pare-feux
// nécessaires pour que mes indications soient respectées ; à chaque version de l'application les règles sont
// différentes et donc les pare-feux devront s'adapter ».
//
// Contrôlé par tests/pare-feux.mjs, qui échoue :
//   - si une décision validée, une ligne datée de Félix, une règle de CLAUDE.md ou une décision V2 en vigueur n'a ni règle
//     ici, ni raison écrite dans SANS_REGLE ;
//   - si une règle de produit ne dit pas ce qu'elle devient dans chaque version de VERSIONS (ajouter une version oblige à
//     revoir toutes les règles) ;
//   - si un contrôle cité n'existe plus, ne contient plus sa marque, ou n'est plus lancé par la CI ou par Git ;
//   - si une phase se clôt (rapport docs/rapports/v3/PHASE-N.md) alors qu'un pare-feu prévu pour elle n'est pas posé.
//
// États d'une règle dans une version :
//   controle   : contrôles automatiques [fichier, marque] ; `aCompleter: { phase, quoi }` si le contrôle est partiel ;
//   prevu      : pas encore de code à contrôler ; le pare-feu doit être posé avant la clôture de la phase indiquée ;
//   sansObjet  : la règle ne s'applique pas à cette version (raison) ;
//   manuel     : non contrôlable par un programme (raison) ; reste une consigne de CLAUDE.md.
// Une règle de dépôt (portee « depot ») vaut pour toutes les versions : clé `toutes`.

export const VERSIONS = {
  v3: {
    titre: "V3 (en vigueur)",
    nom: "V3, en vigueur depuis le 20 nov. 2026 (V3-001, référentiel V4.1.13) : toutes les règles de ce registre sont les siennes",
    chemins: ["src/prototype-v3", "src/design/v3", "data/spots/fiches", "data/moteur-bord", "scripts/etude-moteur-bord"],
  },
  v2: {
    titre: "Ancien code V2 encore publié",
    nom: "ancien code V2 que le site sert encore (main, point de retour v2-final), gelé jusqu'à son remplacement par la V3 aux phases 10 à 12. Il n'a pas de règles propres : on y contrôle ce que les règles de la V3 permettent déjà d'y contrôler ; le reste disparaît avec lui",
    chemins: ["pages *.html à la racine", "src/app", "src/bord", "src/bateau", "src/core", "src/prototype", "data/sites"],
  },
};

// Chemins de l'interface V3 visés par les contrôles de texte à l'écran (à étendre quand l'interface V3 entre dans src/,
// phase 12 : PF-11 et PF-09 le rappellent par leur `aCompleter`).
export const INTERFACE_V3 = ["src/prototype-v3"];

const PF = "tests/pare-feux.mjs";
const fige = "s'appliquera quand la V3 remplacera ce code (phases 10 à 12) ; d'ici là, ce code est gelé";

export const REGLES = [
  { id: "PF-01", titre: "Aucune fabrication ; statut VÉRIFIÉ, INFÉRÉ, HYPOTHÈSE, INCONNU ou À DÉCIDER ; une déclaration n'est pas une preuve",
    sources: ["CLAUDE.md « Aucune fabrication. »"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/knowledge.mjs", "cite au moins une source"]] },
      v3: { etat: "controle", gardes: [["tests/spots-v3.mjs", "schéma du § 7.4"], ["tests/knowledge.mjs", "cite au moins une source"]] },
    } },
  { id: "PF-02", titre: "À l'écran, chaque chiffre a sa source et son heure ; sans source sûre, rien n'est affiché ; pas de courbes de profondeur sans données réelles",
    sources: ["CLAUDE.md « À l'écran, chaque chiffre »", "V3-028"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/prototype-v3.mjs", "Météo : vent en nœuds, source et heure écrites"], [PF, "courbe de profondeur dans l'interface V3"]],
        aCompleter: { phase: 12, quoi: "chaque chiffre de l'application intégrée porte sa source et son heure" } },
    } },
  { id: "PF-03", titre: "Du général au spécifique : la carte au premier écran, puis le spot et sa note, puis la justification, puis le détail sourcé",
    sources: ["CLAUDE.md « L'information va toujours du général au spécifique »", "V3-029"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/prototype-v3.mjs", "Carte : vue d'ensemble en colonne le long de la côte"]],
        aCompleter: { phase: 12, quoi: "ordre carte → spot → justification → détail sourcé dans chaque onglet intégré" } },
    } },
  { id: "PF-04", titre: "Ne jamais revenir sur ce qui a été validé : une décision validée n'est ni retirée ni rétrogradée",
    sources: ["CLAUDE.md « Ne pas revenir sur ce qui a été validé »"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "décision validée retirée ou rétrogradée"]] } } },
  { id: "PF-05", titre: "Ne jamais supprimer un spot V2",
    sources: ["CLAUDE.md « Ne jamais supprimer un spot V2. »", "V3-018"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["scripts/inventaire-spots-v2.mjs", "--verifier"]] },
      v3: { etat: "controle", gardes: [["tests/spots-v3.mjs", "aucune perte V2"]] },
    } },
  { id: "PF-06", titre: "Aucun fichier inutile : supprimé après audit des dépendances, ou gardé avec sa raison au registre de nettoyage ; jamais de nettoyage destructif",
    sources: ["CLAUDE.md « Ne jamais supprimer un spot V2. »", "24 nov. 2026, 22 h 26"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "fichier sans usage"], ["scripts/pare-feux/inutiles.mjs", "sans raison inscrite"]] } } },
  { id: "PF-07", titre: "La sécurité ne se compense jamais ; une donnée de sécurité inconnue n'est jamais « au vert »",
    sources: ["CLAUDE.md « La sécurité ne se compense jamais. »", "V2 « La sécurité passe en premier »"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/v2.mjs", "à vérifier (vent), jamais au vert"]] },
      v3: { etat: "controle", gardes: [["tests/etude-moteur-bord.mjs", "INSUFFICIENT_DATA ne vaut jamais SAFE"], ["tests/spots-v3.mjs", "jamais « sans risque »"]] },
    } },
  { id: "PF-08", titre: "Deux scores seulement, Favorabilité et Confiance ; la Pertinence est supprimée ; la Confiance ne change jamais le rang",
    sources: ["CLAUDE.md « Deux scores seulement »", "V3-006", "V2 « La Confiance ne change jamais le rang »", "V2 « Pertinence (trois scores) »"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/v2.mjs", "le rang ne change pas avec la confiance"]],
        note: "ce code affiche encore la Pertinence ; elle disparaît avec lui (V3-006)" },
      v3: { etat: "controle", gardes: [["tests/etude-moteur-bord.mjs", "ne lit jamais la Confiance, la Pertinence ni la boîte"], ["tests/prototype-v3.mjs", "ni Pertinence, ni note sur 10"], ["tests/prototype-v3.mjs", "Fiche : Confiance ne change pas le rang"]] },
    } },
  { id: "PF-09", titre: "Aucun découpage géographique (secteurs, régions, départements) ; position de référence dynamique ; 60 min de route au plus en BORD",
    sources: ["CLAUDE.md « Aucun découpage géographique »", "V3-007", "V2 « Temps de trajet maximal 45 min »"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: "ce code est encore découpé en sept guides par ville ; ils disparaissent avec lui (V3-007)" },
      v3: { etat: "controle", gardes: [[PF, "découpage géographique dans l'interface V3"], ["tests/etude-moteur-bord.mjs", "min ou accès fermé : exclus, avec la raison"]],
        aCompleter: { phase: 12, quoi: "étendre INTERFACE_V3 à l'interface intégrée dans src/" } },
    } },
  { id: "PF-10", titre: "Logo BRAND : le dessin du poisson et l'orange #C76A31 ne changent jamais (ni recoloration, ni filtre, ni transparence)",
    sources: ["CLAUDE.md « Logo BRAND »", "V3-002"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/brand.py", "orange de l'aplat"], [PF, "icône de guide différente de l'icône SPUMY"]] },
      v3: { etat: "controle", gardes: [["tests/brand.py", "orange de l'aplat"], ["tests/design-v3.mjs", "brand-logo-orange = #C76A31"], ["tests/prototype-v3.mjs", "logo complet sur le fond crème d'origine"]] },
    } },
  { id: "PF-11", titre: "Un seul slogan, « Read the sea. Fish the moment. », en tête de Home ; « V2 » n'apparaît pas à l'écran",
    sources: ["CLAUDE.md « Un seul slogan »", "V3-028"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/prototype-v3.mjs", "slogan de V3-028, et aucun autre"], [PF, "slogan écrit ailleurs qu'en tête de Home"], ["tests/prototype-v3.mjs", "ni « V2 » ni « phase » à l'écran"]],
        aCompleter: { phase: 12, quoi: "étendre INTERFACE_V3 à l'interface intégrée dans src/" } },
    } },
  { id: "PF-12", titre: "Poser tout de suite une question qui bloque, une à la fois",
    sources: ["CLAUDE.md « Poser tout de suite une question »"], portee: "depot",
    versions: { toutes: { etat: "manuel", raison: "conduite de la conversation avec Félix : aucun programme ne peut la contrôler" } } },
  { id: "PF-13", titre: "Jamais de commit ni de push sur main ; une branche par phase au modèle claude/v3-phase-NN-sujet, « v » minuscule ; fusion seulement avec l'accord de Félix ; branches gardées",
    sources: ["CLAUDE.md « Jamais de commit ni de push sur `main`. »", "24 nov. 2026, 21 h 45", "24 nov. 2026, 22 h 52", "V3-019", "23 nov. 2026, 14 h 54"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "nom de branche hors modèle"], [".githooks/pre-push", "refusé : push sur main"], [".github/workflows/tests.yml", "scripts/pare-feux/branche.mjs"]],
      note: "la protection de main sur GitHub est posée par Félix (23 nov. 2026, 19 h 47) ; garder les branches et n'en fusionner aucune sans son accord restent des consignes" } } },
  { id: "PF-14", titre: "Aucune phase sans son jeton ; jetons conditionnels des phases 6 et 7 ; jamais de phase 8 sans son propre jeton",
    sources: ["23 nov. 2026, 23 h 15", "23 nov. 2026, 13 h 50", "23 nov. 2026, 20 h 02", "23 nov. 2026, 22 h 33", "25 nov. 2026, 21 h 23", "26 nov. 2026, 23 h 48", "V3-001"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "phase non autorisée"], [".github/workflows/tests.yml", "scripts/pare-feux/branche.mjs"]],
      note: "les gates de chaque phase (tests sur clone neuf, passes de challenge) sont vérifiés par le rapport de phase en 14 parties" } } },
  { id: "PF-15", titre: "Commits atomiques ; chaque message de Claude se termine par les deux lignes d'attribution de la session",
    sources: ["CLAUDE.md « Commits atomiques. »"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "lignes d'attribution"], [".githooks/commit-msg", "lignes d'attribution"], [".github/workflows/tests.yml", "scripts/pare-feux/commits.mjs"]],
      note: "l'atomicité de chaque commit reste une consigne (revue)" } } },
  { id: "PF-16", titre: "Aucun secret dans le dépôt, ni coordonnée de spot personnel ; jeton donné en clair jamais utilisé ni stocké ; pas de lien Drive dans le référentiel public",
    sources: ["CLAUDE.md « Aucun secret dans le dépôt »", "V3-004"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [["tests/secrets.mjs", "fichier d'environnement suivi par Git"], ["tests/spots-v3.mjs", "refuse un spot personnel (origine user_manual) dans le dépôt"], [PF, "lien Drive dans le référentiel public"]] } } },
  { id: "PF-17", titre: "Le journal et les sessions de Félix restent hors des fiches publiques et du dépôt",
    sources: ["23 nov. 2026, 22 h 25"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: "texte de ces guides gelé, gardé intégralement dans la sauvegarde V2 ; il disparaît avec eux (décision du 23 nov. 2026, 22 h 25)" },
      v3: { etat: "controle", gardes: [["tests/spots-v3.mjs", "Texte privé (décision de Félix"]] },
    } },
  { id: "PF-18", titre: "Sources : pages publiques seulement (ni page de membre, ni connexion), deux éditeurs indépendants ; coordonnées de carnet-de-peche.com jamais reprises ; données OpenStreetMap jamais stockées",
    sources: ["23 nov. 2026, 23 h 10"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/spots-v3.mjs", "une source privée bloque"], [PF, "coordonnées tirées de carnet-de-peche.com ou d'OpenStreetMap"]] },
    } },
  { id: "PF-19", titre: "Aucun changement du moteur dans src/ avant l'approbation qui suit la phase 9",
    sources: ["24 nov. 2026, 5 h 15", "V3-031"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "moteur modifié avant l'approbation"]],
      note: "le pare-feu se lève de lui-même quand le journal des décisions porte le jeton de la phase 10" } } },
  { id: "PF-20", titre: "Une seule application à deux modes ; le bord et le bateau ne s'importent jamais",
    sources: ["V3-008"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/layers.mjs", "Le bord et le bateau ne s'importent jamais"]] },
      v3: { etat: "controle", gardes: [["tests/layers.mjs", "prototype-v3 → prototype-v3, design, data"]] },
    } },
  { id: "PF-21", titre: "Temps de route BORD par la Géoplateforme IGN, avec politique de résilience et contrat validé",
    sources: ["V3-009", "23 nov. 2026, 19 h 07"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: "ce code n'a pas de temps de route" },
      v3: { etat: "prevu", phase: 10, raison: "l'adaptateur IGN entre dans le code en phase 10 ; tests/contrat-ign.mjs (réseau) reste hors CI jusque-là" },
    } },
  { id: "PF-22", titre: "Position : « Me géolocaliser » ou « Saisir une position » ; jamais de localisation par l'adresse IP",
    sources: ["V3-010"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "localisation par l'adresse IP"]] } } },
  { id: "PF-23", titre: "Vigilance Météo-France lue par un petit relais gratuit qui garde la clé",
    sources: ["V3-011"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: "ce code ne lit pas la vigilance" },
      v3: { etat: "prevu", phase: 10, raison: "le relais et sa lecture entrent dans le code en phase 10 (D6-20)" },
    } },
  { id: "PF-24", titre: "Fond de carte : Plan IGN, OpenStreetMap en secours ; aucun préchargement hors ligne",
    sources: ["V3-012"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: "ce code a son propre fond de carte (OpenStreetMap), remplacé avec lui" },
      v3: { etat: "prevu", phase: 12, raison: "le fond de carte réel entre dans le code à l'intégration (phase 12)" },
    } },
  { id: "PF-25", titre: "Données de l'utilisateur sur l'appareil, sans compte ; sauvegarde GitHub et export gardés, export aux deux endroits",
    sources: ["V3-013", "23 nov. 2026, 19 h 07"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/e2e.mjs", "état de la sauvegarde (local)"]] },
      v3: { etat: "prevu", phase: 13, raison: "Journal, Profil et synchronisation V3 : phase 13" },
    } },
  { id: "PF-26", titre: "BATEAU repris en V3 : Pertinence retirée, ancienne note sur 10 retirée, modèle présenté « d'après tes sorties »",
    sources: ["V3-014", "V3-015"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/prototype-v3.mjs", "ni Pertinence, ni note sur 10"]] },
    } },
  { id: "PF-27", titre: "Une place du Top 3 réservée à un spot admissible à 15 min ou moins, jamais un spot « à vérifier »",
    sources: ["V3-016"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/etude-moteur-bord.mjs", "place réservée à un spot à"], ["tests/prototype-v3.mjs", "place réservée « Le plus proche » (V3-016)"]] },
    } },
  { id: "PF-28", titre: "Navigation du jalon 1 : Home, Météo, barre de 4 onglets modifiable, glissement, position automatique ou manuelle",
    sources: ["V3-017", "V3-023"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/prototype-v3.mjs", "barre : 4 onglets visibles, Journal hors champ"]] },
    } },
  { id: "PF-29", titre: "Seuil du filtre « Favorables » : 75 ; paliers V2 75 / 65 / 55 / 45 gardés jusqu'à la phase 8 V3",
    sources: ["V3-021", "V2 « Paliers de Favorabilité »"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/v2.mjs", "paliers (recalés en phase 8) : 75 / 65 / 55 / 45"]] },
      v3: { etat: "controle", gardes: [["tests/prototype-v3.mjs", "Favorables : 75 ou plus"], ["tests/design-v3.mjs", "Paliers des jauges"]] },
    } },
  { id: "PF-30", titre: "Design System et direction visuelle V3 validés : jetons, refonte, prototype version 6, Shore et Offshore",
    sources: ["V3-022", "V3-025", "V3-027", "V3-028"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/design-v3.mjs", "Palette approuvée"], ["tests/prototype-v3.mjs", "cartes Shore et Offshore avec les logos d'origine"]] },
    } },
  { id: "PF-31", titre: "Pas de vraies photos de spots : photos d'illustration seulement, marquées « Illustration » ; photos transmises par Félix utilisables",
    sources: ["V3-026", "V3-002"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "prevu", phase: 12, raison: "le prototype affiche « Illustration » sur ses photos d'en-tête et de fiche, sans test dédié ; contrôle à l'écran de chaque photo de l'application intégrée" },
    } },
  { id: "PF-32", titre: "Contrats typés par JSDoc et contrôle tsc --checkJs, sans migration TypeScript",
    sources: ["V3-020"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [["tsconfig.typecheck.json", "\"checkJs\": true"]] } } },
  { id: "PF-33", titre: "Moteur : anticiper le comportement alimentaire du bar (moment, saison, marée, météo), documentation scientifique de premier rang et expérience de pêche, Bretagne et Cotentin jusqu'à Cherbourg, migration partielle",
    sources: ["24 nov. 2026, 10 h 53"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "controle", gardes: [["tests/knowledge.mjs", "PF-33 : chaque règle du moteur sur le comportement du bar porte la zone de ses sources"], ["tests/pare-feux-sabotage.mjs", "règle du moteur sans zone de validité"], ["tests/pare-feux-sabotage.mjs", "règle du moteur sortie du contrôle par son domaine"], ["tests/pare-feux-sabotage.mjs", "règle de la Favorabilité déclarée de sécurité"]],
        note: "posé en phase 7 (25 nov. 2026), durci le 26 nov. après la revue indépendante : chaque connaissance de biologie, de comportement, d'alimentation ou de milieu porte la zone de ses sources (RÉGIONALE : Bretagne nord, Iroise, Bretagne sud, rades et rias, Cotentin ; VOISINE : Manche, golfe de Gascogne ; AUCUNE), recalculée à partir des étiquettes de zone des sources, avec un texte ; un domaine inconnu est refusé, et une règle de model.js ne peut pas être déclarée de réglementation, de sécurité ou de leurres. Le contrôle porte sur l'étiquetage, pas sur la lecture des sources ; les règles AUCUNE (13) sont des lacunes déclarées, pas des règles citées par des sources régionales ; revue régionale : docs/halieutique/REVUE-REGIONALE-BAR.md" },
    } },
  { id: "PF-34", titre: "Les notes de SPUMY jugées sur le journal de sorties ; le modèle s'affine par la boucle contrôlée",
    sources: ["V3-030"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "prevu", phase: 8, raison: "calibration du moteur sur le journal : phase 8" },
    } },
  { id: "PF-35", titre: "Espèce BORD : le bar seul",
    sources: ["V2 « Espèce BORD »"], portee: "produit",
    versions: {
      v2: { etat: "manuel", raison: "aucun test dédié ; ce code est gelé jusqu'à son remplacement" },
      v3: { etat: "prevu", phase: 10, raison: "le moteur BORD V3 entre dans le code en phase 10" },
    } },
  { id: "PF-36", titre: "Vent BORD : « à vérifier » dès force 6 ou rafales de 60 km/h ; « non recommandé » dès force 8 ou 90 km/h",
    sources: ["V2 « Vent BORD »"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [["tests/v2.mjs", "NE force 9, rafales 90 km/h → non recommandé"]] },
      v3: { etat: "controle", gardes: [["tests/etude-moteur-bord.mjs", "force 8 ou rafales 90 km/h : DANGER ; force 6 ou rafales 60 km/h : CAUTION"]] },
    } },
  { id: "PF-37", titre: "Seuils BATEAU (vent, mer, marges) : à valider par Félix",
    sources: ["V2 « Seuils BATEAU »"], portee: "produit",
    versions: {
      v2: { etat: "manuel", raison: "valeurs proposées « à valider » : aucune règle tant que Félix n'a pas tranché" },
      v3: { etat: "manuel", raison: "liées à V3-014, toujours à valider" },
    } },
  { id: "PF-38", titre: "Outillage : ESLint 10, actions GitHub épinglées, Dependabot pour les actions seulement (mensuel, groupé, 7 jours)",
    sources: ["23 nov. 2026, 14 h 54", "23 nov. 2026, 19 h 07"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [["tests/lint-regles.mjs", "Contrôle de la configuration ESLint 10"], ["tests/actions-epinglees.mjs", "épinglée par l'empreinte complète de son commit"], [PF, "Dependabot hors des actions GitHub"]],
      note: "les failles des bibliothèques npm sont surveillées par un contrôle, sans mise à jour automatique (PF-47, Félix, 25 nov. 2026, 8 h 13)" } } },
  { id: "PF-39", titre: "Zones tactiles invisibles de 48 px au moins (D-11) à l'intégration",
    sources: ["23 nov. 2026, 19 h 07"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "prevu", phase: 12, raison: "appliqué à l'intégration ; le prototype 6.2 reste à 44 px" },
    } },
  { id: "PF-40", titre: "Critères de recette CR-01 à CR-16 du prototype pris comme critères de l'intégration",
    sources: ["23 nov. 2026, 13 h 50"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "prevu", phase: 12, raison: "critères de l'intégration des phases 10 à 12" },
    } },
  { id: "PF-41", titre: "Usage : Félix et quelques proches, gratuit, non commercial (ni publicité, ni mesure d'audience, ni paiement)",
    sources: ["V3-005"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "publicité, mesure d'audience ou paiement"]] } } },
  { id: "PF-43", titre: "La vitesse d'affichage ne se gagne jamais aux dépens de la qualité du graphisme et de l'affichage : les deux cohabitent",
    sources: ["25 nov. 2026, 7 h 25"], portee: "produit",
    versions: {
      v2: { etat: "controle", gardes: [[PF, "qualité graphique abaissée"]] },
      v3: { etat: "controle", gardes: [[PF, "qualité graphique abaissée"], ["tests/brand.py", "orange de l'aplat"]],
        aCompleter: { phase: 12, quoi: "budgets de performance (QA-01) et qualité graphique mesurés ensemble sur les mêmes écrans : poids et vitesse d'un côté ; netteté des photos (au moins deux fois leur taille affichée), logo intact, polices chargées, aucune régression visuelle de l'autre ; un budget n'est jamais tenu en dégradant l'image" } },
    } },
  { id: "PF-44", titre: "L'application est éprouvée dans les navigateurs de ses utilisateurs : Chromium, WebKit (Safari, iPhone) et Firefox",
    sources: ["25 nov. 2026, 7 h 25"], portee: "produit",
    versions: {
      v2: { etat: "manuel", raison: "ce code, gelé, n'est éprouvé que dans Chromium ; Safari et Firefox arrivent avec la V3" },
      v3: { etat: "prevu", phase: 12, raison: "parcours de bout en bout et prototype rejoués dans WebKit et Firefox, en plus de Chromium, à l'intégration" },
    } },
  { id: "PF-45", titre: "Moteur éprouvé en profondeur : part du code exercée par les tests mesurée, essais de sabotage (chaque règle cassée volontairement fait échouer un test)",
    sources: ["25 nov. 2026, 7 h 25"], portee: "produit",
    versions: {
      v2: { etat: "sansObjet", raison: fige },
      v3: { etat: "prevu", phase: 11, raison: "stabilisation et validation du moteur BORD : couverture mesurée (seuil validé par Félix) et essais de sabotage du moteur" },
    } },
  { id: "PF-46", titre: "Chaque exigence du cahier des charges (docs/REQUIREMENTS.md) a sa preuve, ou son écart écrit, avant la clôture de sa phase",
    sources: ["25 nov. 2026, 7 h 25"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "a sa preuve, ou son écart écrit"]] } } },
  { id: "PF-47", titre: "Se prémunir contre les attaques les plus modernes : chaîne d'approvisionnement npm (vers de 2026), GitHub Actions (étiquettes détournées, workflows plantés, injection de script), pages publiées (XSS) ; veille des menaces à chaque phase",
    sources: ["25 nov. 2026, 8 h 13"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "chaîne d'approvisionnement"], [PF, "page publiée sans politique de sécurité stricte"], [".github/workflows/tests.yml", "scripts/pare-feux/bibliotheques.mjs"], ["docs/security/THREAT_MODEL.md", "## Menaces actuelles"]],
      note: "failles connues et délai de 7 jours des bibliothèques en CI ; verrou npm intègre ; installation sans scripts ; actions épinglées ; workflows inscrits, en lecture seule, sans injection ; politique de sécurité des pages" } } },
  { id: "PF-48", titre: "Proposer les meilleures solutions (architecture, UX, fonctionnalités, sécurité), comparées, et les détailler pour qu'une personne qui n'y connaît rien puisse les mettre en œuvre",
    sources: ["25 nov. 2026, 8 h 13"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "rapport de phase sans solutions comparées"]],
      note: "chaque rapport de phase à partir de la phase 7 : partie 4, « Solutions comparées » (recommandée et pourquoi) et « Mise en œuvre pas à pas » ; partie 10, « Menaces actuelles et parades » ; la qualité des propositions reste jugée par Félix" } } },
  { id: "PF-49", titre: "Chaque section de l'application se confronte aux indicateurs (KPI) des standards internationaux, mesurés par un programme et jamais estimés ; une valeur ne recule jamais sans raison écrite",
    sources: ["25 nov. 2026, 9 h 37", "25 nov. 2026, 10 h 31"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "indicateur"], [".github/workflows/tests.yml", "scripts/kpi/mesurer.mjs --verifier"]],
      note: "registre tests/pare-feux/kpis.mjs ; mesures data/kpi/ ; tableau docs/regles/KPI.md ; seuils hors norme fixés par Claude avec leur justification (délégation de Félix, 25 nov. 2026, 10 h 31) ; indicateurs des spots : objectifs qui n'écartent, ne cachent ni ne bloquent aucun spot ; complexité jugée fonction par fonction (tests/pare-feux/complexite.mjs)" } } },
  { id: "PF-50", titre: "Mêmes exigences, mêmes contrôles, moins de jetons : la session part d'un paquet de contexte complet (npm run -s contexte -- <phase>), d'un état courant court et d'une vérification en une commande (npm run -s verifier)",
    sources: ["25 nov. 2026, 20 h 36"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "paquet de contexte incomplet"]],
      note: "le paquet contient, pour chaque phase de 7 à 15, chaque exigence, pare-feu, indicateur et décision qui la concernent ; l'historique de la continuité est gardé tel quel dans docs/continuite/HISTORIQUE-V3.md" } } },
  { id: "PF-42", titre: "Chaque consigne a son pare-feu, et les pare-feux s'adaptent à chaque version de l'application (ce registre)",
    sources: ["25 nov. 2026, 6 h 32"], portee: "depot",
    versions: { toutes: { etat: "controle", gardes: [[PF, "situé pour"], [PF, "une règle la fait respecter, ou SANS_REGLE dit pourquoi"], ["tests/pare-feux-sabotage.mjs", "violations arrêtées"]] } } },
];

// Planchers de qualité graphique (PF-43) : une optimisation de vitesse ne les franchit jamais. Chaque motif capture les
// valeurs du fichier ; chacune doit rester au moins égale au minimum (valeurs du 25 nov. 2026).
export const PLANCHERS_GRAPHIQUES = [
  { fichier: "scripts/photos.py", motif: /for size, q in \(\(1600, (\d+)\), \(720, (\d+)\)\)/g, minimum: [74, 70], quoi: "qualité WebP des photos (1 600 px et 720 px)" },
  { fichier: "scripts/photos.py", motif: /for size, q in \(\((\d+), \d+\), \((\d+), \d+\)\)/g, minimum: [1600, 720], quoi: "tailles des photos (grand côté)" },
  { fichier: "scripts/logos.py", motif: /"WEBP", quality=(\d+)/g, minimum: [88], quoi: "qualité WebP des logos V2" },
  { fichier: "scripts/logos-v3.py", motif: /quality=(\d+)/g, minimum: [92], quoi: "qualité WebP des logos V3" },
  { fichier: "src/prototype-v3/ui.jsx", motif: /photoSrc = \(id, size = (\d+)\)/g, minimum: [1600], quoi: "photo d'en-tête servie en 1 600 px (au moins deux fois sa largeur affichée sur un téléphone de 390 px)" },
];
// Rééchantillonnage : jamais de filtre grossier dans les générateurs d'images.
export const FILTRES_INTERDITS = { fichiers: ["scripts/photos.py", "scripts/logos.py", "scripts/logos-v3.py", "scripts/logos-symbole-v6.py"], motif: /Image\.(NEAREST|BOX|BILINEAR|HAMMING)\b/ };

// Workflows GitHub inscrits (PF-47) : un workflow ajouté sans être inscrit ici fait échouer les tests (campagne
// GhostAction d'octobre et novembre 2026 : workflows « security-audit.yml » plantés avec des jetons volés).
export const WORKFLOWS_INSCRITS = {
  "tests.yml": "tests de chaque proposition et de main",
  "contrat-ign.yml": "contrat de la Géoplateforme IGN (réseau réel, chaque jour)",
  "contrat-open-meteo.yml": "contrat d'Open-Meteo (réseau réel, chaque jour)",
  "epreuve.yml": "épreuve du moteur V2 (lancée à la main)",
  "collecte-spots.yml": "collecte des données libres des spots (IGN, Géorisques), phase 5",
};
// Rapports de phase : sous-parties obligatoires à partir de cette phase (PF-48).
export const RAPPORTS_DEPUIS = 7;

// Sources sans règle propre, avec la raison.
export const SANS_REGLE = {
  "V3-003": "acceptation ponctuelle de la réserve P1-14 de la phase 1 : rien à faire respecter ensuite",
};
