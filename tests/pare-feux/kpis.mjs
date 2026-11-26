// Indicateurs (KPI) des standards internationaux, section par section (Félix, 25 nov. 2026, 9 h 37 : « Pour t'assurer
// de la qualité de tes tests et ne pas être biaisé, il y a des standards internationaux top tier. Ces standards sont
// assurés par des KPIs auxquels tu dois te confronter pour chaque section de l'application. »)
//
// Chaque indicateur cite sa norme (nom et version), son seuil, et dit d'où vient sa valeur :
//   auto   : mesurée par scripts/kpi/mesurer.mjs (clé `cle`) ; valeur, date et cliquet dans data/kpi/ ;
//   garde  : tenue par un contrôle bloquant de la CI [fichier, marque] : un écart fait échouer les tests ;
//   prevu  : pas encore mesurable ; mesure posée avant la clôture de la phase `phase`.
// Un indicateur mesuré qui n'atteint pas son seuil porte son écart : raison et phase où il doit être atteint.
// `seuilSource` : « norme » quand la norme fixe le seuil ; « fixé » quand la norme définit la mesure sans fixer de seuil :
// le seuil est alors fixé par Claude, par délégation de Félix (25 nov. 2026, 10 h 31 : « je te laisse le soin de
// déterminer de façon top tier les barres d'admissibilité »), avec sa justification (`justification`).
// `objectif` : indicateur de données des spots suivi sans jamais nuire aux spots (Félix, 10 h 31 : « Il ne faut pas que
// ces tests soient au détriment des spots ») : il n'écarte, ne cache ni ne bloque aucun spot ; un spot peu documenté reste
// proposé, « à vérifier » ; son cliquet porte sur le nombre de fiches qui remplissent le critère, jamais sur un taux.
// Le cliquet (scripts/kpi/mesurer.mjs --verifier, CI) : une valeur mesurée ne recule jamais sans raison enregistrée.

const N = {
  wmo: { nom: "Vérification des prévisions, OMM (groupe WWRP/WGNE de recherche sur la vérification des prévisions)", version: "méthodes de référence (score de Brier, fiabilité, ROC)" },
  google: { nom: "Google Testing Blog, « Code Coverage Best Practices » (60 % acceptable, 75 % louable, 90 % exemplaire)", version: "2020", url: "https://testing.googleblog.com/2020/08/code-coverage-best-practices.html" },
  stryker: { nom: "Test de mutation, seuils de Stryker Mutator (élevé 80 %, bas 60 %)", version: "seuils par défaut" },
  iso25012: { nom: "ISO/IEC 25012, modèle de qualité des données", version: "2008" },
  iso9241: { nom: "ISO 9241-11, utilisabilité (efficacité, efficience, satisfaction)", version: "2018" },
  sus: { nom: "System Usability Scale (Brooke) ; moyenne de référence 68, 80 et plus = premier quartile", version: "1996" },
  wcag: { nom: "WCAG, W3C", version: "2.2 niveau AA" },
  rgaa: { nom: "RGAA, référentiel général d'amélioration de l'accessibilité (France)", version: "4.1.2 (RGAA 5 attendu fin 2026)" },
  cwv: { nom: "Core Web Vitals, web.dev (Google) : seuils « bons » au 75e centile", version: "mise à jour du 7 mai 2025", url: "https://web.dev/articles/defining-core-web-vitals-thresholds" },
  asvs: { nom: "OWASP ASVS, Application Security Verification Standard", version: "5.0.0 (mai 2025)", url: "https://owasp.org/www-project-application-security-verification-standard/" },
  scorecard: { nom: "OpenSSF Scorecard, santé de la chaîne d'approvisionnement d'un dépôt", version: "en vigueur à la mesure" },
  iso25010: { nom: "ISO/IEC 25010, modèle de qualité du produit logiciel", version: "2023" },
  nist: { nom: "NIST SP 500-235 (McCabe) : complexité cyclomatique 10 par fonction, 15 au plus avec justification", version: "1996" },
  iso29119: { nom: "ISO/IEC/IEEE 29119, essais logiciels (traçabilité exigences et tests)", version: "2022" },
  rgpd: { nom: "RGPD, article 5 (minimisation des données)", version: "règlement (UE) 2016/679" },
};

const ET = "tests/etude-moteur-bord.mjs", P3 = "tests/prototype-v3.mjs", PF = "tests/pare-feux.mjs";

export const KPIS = [
  // ——— Moteur BORD ———
  { id: "K-01", section: "Moteur BORD", kpi: "Score de Brier des chances de prise, rapporté à une référence naïve (Brier skill score)", norme: N.wmo, seuil: [">", 0], seuilSource: "norme", unite: "",
    mesure: "prevu", phase: 13, raison: "outil posé et éprouvé en phase 8 (scripts/calibration/verification.mjs, tests/calibration.mjs) ; il faut au moins 40 sorties notées, dont 10 avec prise et 10 bredouilles déclarées, à note figée avant la sortie : 3 sont connues ; mesure sur le journal confirmé (phase 13, V-07 et V-08)" },
  { id: "K-02", section: "Moteur BORD", kpi: "Fiabilité des chances annoncées (pente de la courbe de fiabilité)", norme: N.wmo, seuil: ["entre", [0.8, 1.2]], seuilSource: "fixé", justification: "une prévision probabiliste bien calibrée a une pente de fiabilité de 1 ; ±0,2 tolère les petits échantillons de sorties de pêche", unite: "",
    mesure: "prevu", phase: 13, raison: "même besoin de sorties notées (outil posé en phase 8) ; jeux synthétiques de la phase 8 : à 40 sorties, un prévisionniste parfaitement calibré n'a sa pente entre 0,8 et 1,2 que 4 fois sur 10 (seuil à revoir en phase 9)" },
  { id: "K-03", section: "Moteur BORD", kpi: "Discrimination entre sorties avec et sans prise (aire sous la courbe ROC)", norme: N.wmo, seuil: [">=", 0.7], seuilSource: "fixé", justification: "Hosmer et Lemeshow : de 0,7 à 0,8 la discrimination est acceptable, de 0,8 à 0,9 excellente ; 0,70 est la barre d'admissibilité, 0,80 l'objectif", unite: "",
    mesure: "prevu", phase: 13, raison: "même besoin de sorties notées (outil posé en phase 8)" },
  { id: "K-04", section: "Moteur BORD", kpi: "Couverture des branches du moteur (étude V3) par ses tests", norme: N.google, seuil: [">=", 90], seuilSource: "norme", unite: "%",
    mesure: "auto", cle: "couverture.moteur.branches", ecart: { phase: 11, raison: "branches d'erreur et cas limites de l'étude non éprouvés ; à compléter à la stabilisation du moteur" } },
  { id: "K-05", section: "Moteur BORD", kpi: "Couverture des instructions du moteur (étude V3) par ses tests", norme: N.google, seuil: [">=", 90], seuilSource: "norme", unite: "%",
    mesure: "auto", cle: "couverture.moteur.instructions" },
  { id: "K-06", section: "Moteur BORD", kpi: "Score de mutation du moteur (part des règles cassées exprès que les tests repèrent)", norme: N.stryker, seuil: [">=", 80], seuilSource: "norme", unite: "%",
    mesure: "prevu", phase: 11, raison: "le moteur entre dans src/ en phase 10 ; essais de mutation à la stabilisation (PF-45)" },
  // ——— Sécurité des avis ———
  { id: "K-07", section: "Sécurité des avis", kpi: "Avis « au vert » à tort sur les scénarios de référence (donnée de sécurité inconnue, vent, houle, nuit, marée)", norme: N.iso25010, seuil: ["==", 0], seuilSource: "fixé", justification: "la sécurité ne se compense jamais (§ 0.2) : aucune tolérance", unite: "",
    mesure: "garde", gardes: [[ET, "INSUFFICIENT_DATA ne vaut jamais SAFE"], ["tests/v2.mjs", "à vérifier (vent), jamais au vert"]] },
  { id: "K-08", section: "Sécurité des avis", kpi: "Fiches dont la sécurité est documentée (engagement, consigne sourcée, accès à marée, terrain : QUAL-5)", norme: N.iso25012, seuil: [">=", 80], seuilSource: "fixé", justification: "objectif : 8 fiches sur 10 à sécurité documentée ; une fiche sans sécurité documentée reste proposée, toujours « à vérifier », jamais « au vert »", unite: "%",
    mesure: "auto", cle: "donnees.securite_documentee", objectif: true },
  // ——— Données des spots ———
  { id: "K-09", section: "Données des spots", kpi: "Crédibilité : fiches nommées par au moins deux groupes de sources indépendants (QUAL-1)", norme: N.iso25012, seuil: [">=", 90], seuilSource: "fixé", justification: "objectif : 9 fiches sur 10 recoupées par deux groupes de sources indépendants ; l'expérience de pêche (journal) complète, à défaut de sources", unite: "%",
    mesure: "auto", cle: "donnees.credibilite", objectif: true },
  { id: "K-10", section: "Données des spots", kpi: "Exactitude : position contrôlée par l'IGN ou corrigée, sans anomalie (QUAL-3)", norme: N.iso25012, seuil: [">=", 100], seuilSource: "fixé", justification: "objectif : toutes les positions contrôlées ; une position non contrôlée reste affichée, avec sa précision", unite: "%",
    mesure: "auto", cle: "donnees.exactitude", objectif: true },
  { id: "K-11", section: "Données des spots", kpi: "Complétude moyenne des fiches", norme: N.iso25012, seuil: [">=", 90], seuilSource: "fixé", justification: "objectif : 9 champs sur 10 renseignés en moyenne ; un champ inconnu est dit inconnu, jamais remplacé", unite: "%",
    mesure: "auto", cle: "donnees.completude", objectif: true },
  { id: "K-12", section: "Données des spots", kpi: "Conformité : règles locales recherchées et sans réserve (QUAL-6)", norme: N.iso25012, seuil: [">=", 100], seuilSource: "fixé", justification: "objectif : toutes les règles locales recherchées ; une règle incertaine reste « à vérifier au poste »", unite: "%",
    mesure: "auto", cle: "donnees.reglementation", objectif: true },
  { id: "K-13", section: "Données des spots", kpi: "Confidentialité : aucune fiche publique ne cite une source privée (QUAL-7)", norme: N.iso25012, seuil: [">=", 100], seuilSource: "fixé", justification: "décision de Félix du 23 nov. 2026, 22 h 25 : aucun texte privé dans une fiche publique, sans exception", unite: "%",
    mesure: "auto", cle: "donnees.confidentialite" },
  { id: "K-14", section: "Données des spots", kpi: "Actualité : fiches vérifiées depuis moins de 12 mois", norme: N.iso25012, seuil: [">=", 100], seuilSource: "fixé", justification: "une vérification par an au moins : les accès et les règles changent d'une saison à l'autre", unite: "%",
    mesure: "auto", cle: "donnees.actualite" },
  { id: "K-37", section: "Données des spots", kpi: "Spots gardés : aucun spot retiré pour améliorer un indicateur (nombre de fiches)", norme: N.iso25012, seuil: [">=", 98], seuilSource: "fixé", unite: "fiches",
    justification: "Félix (25 nov. 2026, 10 h 31) : « Il ne faut pas que ces tests soient au détriment des spots » ; CLAUDE.md : ne jamais supprimer un spot V2. Le nombre de fiches ne baisse jamais (cliquet)", mesure: "auto", cle: "donnees.spots" },
  // ——— Interface et ergonomie ———
  { id: "K-15", section: "Interface et ergonomie", kpi: "Satisfaction (SUS), cinq personnes au moins", norme: N.sus, seuil: [">=", 80], seuilSource: "norme", unite: "/100",
    mesure: "prevu", phase: 12, raison: "questionnaire auprès de Félix et de ses proches sur l'application intégrée" },
  { id: "K-16", section: "Interface et ergonomie", kpi: "Efficacité : tâches réussies sans aide (choisir un spot, lire la sécurité, noter une sortie)", norme: N.iso9241, seuil: [">=", 80], seuilSource: "fixé", justification: "taux moyen de réussite des tâches dans les études d'utilisabilité : 78 % environ (MeasuringU, Sauro) ; barre 80 %, et 100 % pour la tâche critique « lire la sécurité d'un spot »", unite: "%",
    mesure: "prevu", phase: 12, raison: "test de tâches auprès de cinq personnes" },
  { id: "K-17", section: "Interface et ergonomie", kpi: "Compréhension des deux indicateurs (« 53/100, à vérifier » et « 69/100, moyenne ») : UX-04", norme: N.iso9241, seuil: [">=", 80], seuilSource: "fixé", justification: "exigence UX-04 validée : 4 personnes sur 5", unite: "%",
    mesure: "prevu", phase: 12, raison: "4 personnes sur 5 au moins ; test jamais mené (écart UX-04)" },
  // ——— Accessibilité ———
  { id: "K-18", section: "Accessibilité", kpi: "Violations automatiques graves ou critiques (axe-core) sur chaque écran", norme: N.wcag, seuil: ["==", 0], seuilSource: "norme", unite: "",
    mesure: "garde", gardes: [[P3, "--axe"], ["tests/a11y.mjs", "Code de sortie 1 s'il reste une violation"]] },
  { id: "K-19", section: "Accessibilité", kpi: "Contraste minimal du texte courant, dans les deux thèmes (critère 1.4.3)", norme: N.wcag, seuil: [">=", 4.5], seuilSource: "norme", unite: ":1",
    mesure: "auto", cle: "accessibilite.contraste_texte_min" },
  { id: "K-20", section: "Accessibilité", kpi: "Taux de conformité RGAA (audit manuel des critères applicables)", norme: N.rgaa, seuil: [">=", 100], seuilSource: "norme", unite: "%",
    mesure: "prevu", phase: 14, raison: "l'outil automatique ne couvre qu'une partie des critères : audit manuel à la QA globale" },
  // ——— Performance et qualité graphique ———
  { id: "K-21", section: "Performance et qualité graphique", kpi: "Plus grand affichage (LCP), en laboratoire, téléphone moyen en 4G lente, écrans V3", norme: N.cwv, seuil: ["<=", 2500], seuilSource: "norme", unite: "ms",
    mesure: "auto", cle: "performance.lcp_v3_max", ecart: { phase: 12, raison: "Home du prototype à 2,8 s (mesure du 23 nov. 2026) : photo d'en-tête et polices à charger plus tôt, sans perte de qualité (PF-43)" } },
  { id: "K-22", section: "Performance et qualité graphique", kpi: "Réactivité (INP) au 75e centile", norme: N.cwv, seuil: ["<=", 200], seuilSource: "norme", unite: "ms",
    mesure: "prevu", phase: 12, raison: "mesure sur l'application intégrée, interactions réelles" },
  { id: "K-23", section: "Performance et qualité graphique", kpi: "Stabilité de l'affichage (CLS) au 75e centile", norme: N.cwv, seuil: ["<=", 0.1], seuilSource: "norme", unite: "",
    mesure: "prevu", phase: 12, raison: "mesure sur l'application intégrée" },
  { id: "K-24", section: "Performance et qualité graphique", kpi: "Planchers de qualité graphique tenus (photos, logos, rééchantillonnage) : la vitesse ne se gagne pas aux dépens de l'image", norme: N.iso25010, seuil: ["==", 0], seuilSource: "fixé", justification: "contrainte de Félix du 25 nov. 2026, 7 h 25 : la vitesse ne se gagne jamais aux dépens de l'image", unite: "écart",
    mesure: "garde", gardes: [[PF, "qualité graphique abaissée"]] },
  // ——— Sécurité de l'application ———
  { id: "K-25", section: "Sécurité de l'application", kpi: "Exigences applicables de l'ASVS niveau 2 vérifiées", norme: N.asvs, seuil: [">=", 100], seuilSource: "norme", unite: "%",
    mesure: "prevu", phase: 14, raison: "vérification exigence par exigence à la QA globale et sécurité" },
  { id: "K-26", section: "Sécurité de l'application", kpi: "Score OpenSSF Scorecard du dépôt", norme: N.scorecard, seuil: [">=", 7], seuilSource: "fixé", justification: "le score pénalise un dépôt tenu par une seule personne (revue de code par un tiers impossible) : 7 sur 10 est la barre d'admissibilité, 8 l'objectif", unite: "/10",
    mesure: "prevu", phase: 14, raison: "l'outil lit les réglages GitHub du dépôt publié : mesure à la fusion de la V3 dans main" },
  { id: "K-27", section: "Sécurité de l'application", kpi: "Failles graves ou critiques connues dans les bibliothèques", norme: N.asvs, seuil: ["==", 0], seuilSource: "norme", unite: "",
    mesure: "garde", gardes: [[".github/workflows/tests.yml", "scripts/pare-feux/bibliotheques.mjs"]] },
  { id: "K-28", section: "Sécurité de l'application", kpi: "Actions épinglées, verrou npm intègre, installation sans scripts, politique de sécurité stricte des pages", norme: N.asvs, seuil: ["==", 0], seuilSource: "norme", unite: "écart",
    mesure: "garde", gardes: [["tests/actions-epinglees.mjs", "épinglée par l'empreinte complète de son commit"], [PF, "chaîne d'approvisionnement"], [PF, "page publiée sans politique de sécurité stricte"]] },
  // ——— Qualité du code et des tests ———
  { id: "K-29", section: "Qualité du code et des tests", kpi: "Fonctions du code V3 au-delà de 15 en complexité cyclomatique sans jugement écrit (nécessaire, hors produit, prototype, ou à simplifier avant une phase : tests/pare-feux/complexite.mjs)", norme: N.nist, seuil: ["==", 0], seuilSource: "norme", unite: "",
    mesure: "auto", cle: "code.v3_complexite_non_justifiee" },
  { id: "K-30", section: "Qualité du code et des tests", kpi: "Erreurs de lint et de types", norme: N.iso25010, seuil: ["==", 0], seuilSource: "fixé", justification: "outils bloquants : aucune tolérance", unite: "",
    mesure: "garde", gardes: [[".github/workflows/tests.yml", "npm run -s lint"], [".github/workflows/tests.yml", "npm run -s typecheck"]] },
  { id: "K-31", section: "Qualité du code et des tests", kpi: "Exigences des phases closes reliées à leur preuve, ou à leur écart écrit", norme: N.iso29119, seuil: ["==", 0], seuilSource: "norme", unite: "manque",
    mesure: "garde", gardes: [[PF, "a sa preuve, ou son écart écrit"]] },
  { id: "K-32", section: "Qualité du code et des tests", kpi: "Violations simulées des consignes arrêtées par les pare-feux", norme: N.iso29119, seuil: [">=", 100], seuilSource: "fixé", justification: "un pare-feu qui laisse passer une violation simulée est un trou", unite: "%",
    mesure: "garde", gardes: [["tests/pare-feux-sabotage.mjs", "violations arrêtées"]] },
  // ——— Compatibilité et fiabilité ———
  { id: "K-33", section: "Compatibilité et fiabilité", kpi: "Moteurs de navigateur éprouvés (Chromium, WebKit, Firefox)", norme: N.iso25010, seuil: [">=", 3], seuilSource: "fixé", justification: "les trois moteurs de rendu du marché : Chromium, WebKit (Safari, iPhone), Gecko (Firefox)", unite: "/3",
    mesure: "auto", cle: "compatibilite.navigateurs", ecart: { phase: 12, raison: "Chromium seul aujourd'hui (PF-44)" } },
  { id: "K-34", section: "Compatibilité et fiabilité", kpi: "Données de l'utilisateur perdues à la mise à jour ; fonctionnement hors ligne", norme: N.iso25010, seuil: ["==", 0], seuilSource: "fixé", justification: "aucune perte des saisies de l'utilisateur, sans exception", unite: "perte",
    mesure: "garde", gardes: [["tests/upgrade.mjs", "ce qui a été saisi avec la version publiée est toujours là"]] },
  // ——— Confidentialité ———
  { id: "K-35", section: "Confidentialité", kpi: "Traceurs, publicité ou mesure d'audience tiers ; localisation par l'adresse IP", norme: N.rgpd, seuil: ["==", 0], seuilSource: "norme", unite: "",
    mesure: "garde", gardes: [[PF, "publicité, mesure d'audience ou paiement"], [PF, "localisation par l'adresse IP"]] },
  { id: "K-36", section: "Confidentialité", kpi: "Position gardée en cache arrondie à 100 m au plus", norme: N.rgpd, seuil: ["<=", 100], seuilSource: "fixé", justification: "exigence PRV-01 validée : cache arrondi à 100 m", unite: "m",
    mesure: "garde", gardes: [["tests/socle.mjs", "cle100m"]] },
];

export const SECTIONS = [...new Set(KPIS.map((k) => k.section))];
