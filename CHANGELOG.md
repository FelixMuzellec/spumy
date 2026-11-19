# Journal des versions

## Non publié — phase 9, BATEAU : conception (sans code)

Branche `claude/phase-9-bateau`. Aucun fichier de l'application n'est modifié.

- **Audit du mode BATEAU** (onglet Offshore) : un carnet de spots et de sorties, et une note apprise de tes prises après 8 sorties ; ni sécurité en mer, ni logique par espèce, ni réglementation des espèces du bateau.
- **Spécification du moteur BATEAU**, à valider (`docs/SPEC-MOTEUR-BATEAU.md`) :
    - profil du bateau ;
    - 12 règles de sécurité en mer (`SEC_*`), séparées du bord, jugées sur tout le créneau et au pire moment : armement et distance d'un abri, catégorie de conception, vent, mer, BMS, visibilité, orage, nuit, raz, âge des données, seul à bord, rappels ;
    - trois scores par zone et par espèce (`ESP_*`) : lieu jaune, lieu noir, maquereau, bar, vieille, saint-pierre ;
    - apprentissage personnel gardé (±10 au plus, jamais sur la sécurité) ;
    - 16 scénarios et un plan d'épreuve.
- **Connaissances du mode BATEAU** (`data/knowledge/bateau.json`, schéma `data/schema/knowledge-bateau.schema.json`) : 35 connaissances (21 de niveau 1), 22 sources. Elles couvrent la réglementation 2026 (fermeture du lieu jaune du 1er janvier au 30 avril, tailles, quotas, marquage, RecFishing, hameçons) ; la vieille et le saint-pierre y sont marqués inconnus.
- **Tests** : `test:knowledge` 27/27 contrôle aussi le fichier BATEAU et son lien avec la spécification (chaque règle `SEC_*` et `ESP_*` portée par une connaissance), avec six cas d'erreur refusés.

## Non publié — revue de qualité avant la phase 9 (19 novembre)

Branche `claude/qualite-avant-phase-9`. Demandée par Félix : « tout est-il optimisé, précis et propre ? ».

- **Fiabilité du conseil** (onglet Météo) mesurée sur la v2 : pour la journée affichée, la favorabilité des spots est refaite sur l'ensemble de météos plausibles de la v1 (±1 Beaufort, ±1 secteur, élargi à l'écart AROME / ECMWF) ; la carte donne la plage de favorabilité des trois premiers et la part des météos où le premier reste premier (et à égalité près). Avant, elle ne montrait que la note sur 10 de la v1. Le rappel de l'épreuve ne contredit plus la règle d'égalité à 3 points.
- **Épreuve rejouable depuis le dépôt** : `scripts/epreuve-analyse.mjs` et `scripts/epreuve-mc.mjs` lisent directement les archives compressées de `data/epreuve/archives/` (nouveau `scripts/epreuve-journees.mjs`) ; même résultat que sur les journées décompressées. `epreuve.yml` se lance à la main seulement.
- **Contrat Open-Meteo** : une coupure réseau entre GitHub et Open-Meteo est refaite deux fois (après 1 puis 3 minutes) au lieu d'une ; une réponse incomplète n'est jamais refaite.
- **Code mort retiré** (jamais appelé) : `compareEngines`, `conditionLabel`, `isMine`, `parseHHMM`, `PASTILLE_TEXT`, `MAX_OFF_SPOTS`. Lint sans avertissement.
- **Documentation remise à jour** : `README` (état des fonctionnalités au 19 novembre, commandes, arborescence), `docs/ARCHITECTURE.md` (deux moteurs, une sécurité, fichiers des phases 5 à 8, poids publié), `CONTRIBUTING.md`, `docs/FONCTIONNALITES.md` (égalité : le plus proche est signalé, l'ordre reste celui des notes), spécification v2 (paliers recalés et écart S12 notés à leur place), rapport de la phase 8 (trous d'archive datés : décembre 2025 à août 2026).
- **Tests** : moteur v2 56/56 (5 contrôles de la fiabilité v2) ; parcours 850/850 (la carte de fiabilité v2 contrôlée dans chacun des sept guides) ; unitaires 3 390 ; mise à jour 12/12 ; accessibilité 0 violation ; lint 0 problème.

## Non publié — phase 8, épreuve du moteur (Monte Carlo sur de vraies journées)

Branche `claude/phase-8-epreuve` (partie de la phase 7).

- **Journées de référence** : 36 dates par guide fixées d'avance (le 6, le 16 et le 26 de chaque mois, de fin novembre 2025 à mi-novembre 2026) et les trois jours du journal ; prévisions archivées d'Open-Meteo téléchargées et déposées dans la branche par l'intégration continue (`data/epreuve/`).
- **Monte Carlo** : 1 000 tirages par journée et par guide (`scripts/epreuve-mc.mjs`), entrées perturbées selon leur incertitude, hypothèses selon leur niveau de preuve ; synthèse (`scripts/epreuve-synthese.mjs`) ; analyse des journées telles quelles (`scripts/epreuve-analyse.mjs`).
- **Paliers de favorabilité recalés** sur les journées réelles : 75, 65, 55 et 45 (au lieu de 80, 65, 50 et 35) ; les cinq paliers apparaissent en saison.
- **Lumière en rampe** (créneau de plein jour qui mord sur l'aube ou le crépuscule) : essayée, puis retirée selon la règle fixée avant l'essai (gain de 1,8 point sur les trois premiers inchangés, 2 demandés).
- **Épreuve** : critère « trois premiers inchangés dans 80 % des tirages » non tenu (20 journées sur 241) ; aucune hypothèse de niveau 4 ou 5 au-dessus de 30 % de la variance (21,4 % au plus) ; tes seuils de vent coûtent 1,0 % des spots praticables.
- **Fiabilité du conseil** (onglet Météo) : dit ce que l'épreuve a mesuré pour la v2.
- **Connaissances** : verdicts de la phase 8 dans `data/knowledge/bar-bord.json`.
- **Adresse** (décision de Félix, 18 novembre) : une seule, <https://felixmuzellec.github.io/spumy/> (GitHub Pages sur `FelixMuzellec/spumy`, branche `main`). Les tests servent le site sous `/spumy/` ; la mise à jour d'un téléphone vérifie que la copie hors ligne de l'ancien guide (`/guide-peche-bar/`, même origine) n'est pas touchée. Dépôt de sauvegarde du journal par défaut : `FelixMuzellec/spumy-journal` (un réglage déjà enregistré est gardé).
- **Fichiers retirés** : `scripts/sourced_facts_2026-10-10.py` (correctif ponctuel de la v6, ses faits sont dans les fiches) ; `.github/workflows/epreuve-depot.yml` et `data/epreuve/depot.json` (dépôt unique des journées de la phase 8, fait).

## Non publié — phase 7, moteur BORD v2 (trois scores sur 100, sécurité de la spécification)

Branche `claude/phase-7-moteur-v2` (phases 5 et 6, et `main`). Spécification validée par Félix le 18 novembre.

- **Sécurité** (commune aux deux moteurs) : à vérifier dès la force 6 ou 60 km/h de rafales (choix de Félix) ; non recommandé : nuit sur un spot engagé, retour coupé par la marée (Térénez au-delà de 85), houle de plus de 0,5 m au-dessus du maximum (spot engagé : dès le maximum) ; houle légèrement au-dessus du maximum : à vérifier au lieu d'une pénalité cachée. La vigilance Météo-France n'est pas lue : l'écran le dit.
- **Moteur v2, par défaut** : favorabilité (conditions × présence), pertinence (ta boîte, la distance), confiance, sur 100, jamais fusionnés ; chaque score se décompose ; un critère sans donnée sort du calcul. Les trois meilleurs leurres de ta boîte pour le créneau et ce qui y manque.
- **Pastilles** : cinq bleus pour la favorabilité ; « à vérifier » en pointillé avec « ? » ; non recommandé gris barré ; pas de note vide (cartes, listes, anneaux, accueil).
- **Niveaux de preuve** (phase 5) affichés dans la fiche du spot.
- **Réglages → Moteur de notes** : revenir à la note sur 10 (v1), boîte complète ou non, temps de trajet maximal.
- **Tests** : `npm run test:v2` (16 scénarios de la spécification, règles des trois scores) ; comparaison des deux moteurs sur 2 016 journées d'essai (`tests/compare-v1v2.mjs`).

## Non publié — toutes mes données (changer de téléphone), fusionné dans `main` le 13 novembre (1f5c740)

- **Toutes mes données** (*Réglages*) : « Enregistrer toutes mes données » télécharge un fichier qui contient :
    - le journal de chaque guide, tes spots, ta boîte, tes réglages ;
    - tes sorties en bateau et tes analyses photo.

  « Importer un fichier de données » l'ajoute à l'appareil sans rien écraser : union par identifiant, réglages déjà présents gardés. Le jeton GitHub, la clé Claude et la météo en cache ne voyagent jamais. Un journal d'un seul guide est reconnu et renvoyé vers l'onglet *Journal*.
- **Noms internes gardés** : clés `bar:…` (le poisson), cache « guide-bar-… », base « guide-bar ». Ils permettent de lire directement, à la même origine, ce que l'ancien guide a enregistré sur le téléphone.
- **Tests** : parcours, 11 contrôles du transfert entre deux téléphones simulés ; accessibilité, réglages ouverts, 0 violation.

## Non publié — phase 6, conception du moteur BORD v2 (spécification, sans code)

Branche `claude/phase-6-conception`. L'application ne change pas.

- **`docs/SPEC-MOTEUR-BORD-V2.md`** : circuit, données qualifiées, filtre de sécurité (seuils plus prudents choisis par Félix : à vérifier dès la force 6 ou des rafales de 60 km/h), favorabilité sur 100 (conditions × présence, fiche par critère), pertinence sur 100 tirée de l'inventaire de la boîte, confiance sur 100, données manquantes, pastilles (la sécurité ne passe plus par la couleur de la note), 16 scénarios de référence, plan Monte Carlo de la phase 8.
- **Mesures de départ** : la note sur 10 est tassée (médiane 5,6 et maximum 8,8 sur 1 746 meilleurs créneaux du jour ; 9 et 10 jamais atteints) ; les seuils plus prudents mettent « à vérifier » 11 712 des 73 986 cas de la grille.

## Non publié — phase 5, connaissances halieutiques (BORD, bar)

Branche `claude/phase-5-halieutique`. L'application ne change pas : la phase classe et source ce que le moteur sait du bar.

- **Échelle de preuve à cinq niveaux** (scientifique ou institutionnel, observation documentée, retour local identifiable, hypothèse, heuristique) : `data/knowledge/bar-bord.json` et son schéma.
- **27 connaissances du moteur BORD** classées, avec sources, limites et code qui les utilise : 4 de niveau 1 (migration saisonnière, frai, réglementation, seuils de vent de Météo-France), 7 de niveau 2, 9 hypothèses, 7 heuristiques ; les 82 règles du moteur de leurres classées par source.
- **396 rubriques des 66 spots reclassées** (`data/knowledge/preuves-spots.json`) : les 192 « vérifiées » relues une à une (8 de niveau 1, 145 de niveau 2, 31 de niveau 3, 3 hypothèses, 5 heuristiques).
- **Réglementation** revue le 13 novembre : inchangée ; l'article annonçant la fin de la déclaration RecFishing (1er avril 2026) était un poisson d'avril.
- **Tests** `npm run test:knowledge` : schéma, aucune connaissance plus sûre que sa source, code utilisé présent, nombre de règles de leurres égal au code, chaque rubrique de spot classée une fois avec son étiquette actuelle, et 9 erreurs de saisie refusées.

## Non publié — revue finale des phases 3 et 4, fusionnée dans `main` le 13 novembre (e743b10), pas en ligne

Faite à la demande de Félix (« tu peux fusionner si, après la revue finale, la version remplit parfaitement le cahier des charges »).

- **Vent inconnu** Sans aucune météo (Open-Meteo injoignable, rien en cache), le vent était compté calme : les 11 spots de rade passaient au vert (8,5 sur 10, « Très bonnes conditions »). Le vent est désormais marqué inconnu et le créneau « à vérifier », rade comprise ; plus aucun spot au vert sans météo.
- **Rafales inconnues** Quand le modèle ne donne pas de rafales, on ne peut pas savoir si elles dépassent 75 ou 90 km/h : « à vérifier » (avant : comptées absentes). **Direction du vent inconnue** à partir de la force 2 : « à vérifier » (l'exposition du spot n'est pas jugée). L'indicateur de sécurité le dit aussi.
- **Raison du doute** affichée sous la note de chaque créneau (« ⚠ À vérifier : houle inconnue »), là où la note est lue.
- **Hors ligne** Le service worker ne supprime plus que les copies en cache situées sous sa propre adresse : la copie hors ligne de l'ancienne adresse (/guide-peche-bar/, même origine felixmuzellec.github.io et même nom de cache) n'est plus effacée.
- **Tests** Grille de scénarios : rafales « aucune » remplacées par des rafales faibles connues (45 km/h) et des rafales inconnues, plus un cas « aucune météo » par spot (73 986 cas). Mise à jour d'un téléphone : site servi sous /spumy/ comme sur GitHub Pages, contrôle du cache d'une autre adresse, et nouveau passage depuis la v8.15 de l'ancienne adresse (CI).
- **Constat** GitHub Pages n'est pas activé sur ce dépôt (API GitHub, 13 nov.) : fusionner dans `main` ne met rien en ligne. Mettre en ligne demande d'activer Pages (*Settings → Pages*) ou de copier les fichiers vers l'ancienne adresse.

## Non publié — phase 4, audit BORD et corrections météo et sécurité

Branche `claude/phase-4-bord` (à partir de la phase 3). Demandé par Félix le 13 novembre : résoudre les défauts bloquants liés à la météo.

- **4.2** Le vent et les rafales peuvent retirer un spot : coup de vent (force 8, 62 km/h et plus) ou rafales de 90 km/h et plus → « non recommandé ». Grand frais (force 7) ou rafales de 75 km/h et plus → « à vérifier » : proposé, jamais au vert, classé après les spots sans doute ; le bandeau dit « Conditions à vérifier ». L'indicateur de sécurité signale aussi les rafales. Cas relevé en phase 1 (Moulin Mer, NE force 9, rafales 85 km/h, encore proposé avec 5,0) : non recommandé.
- **4.1** Houle inconnue sur la côte ouverte : « à vérifier », plus jamais au vert (624 cas au vert sur la grille avant la correction, 0 après). En rade, la mer du vent calculée sur place reste utilisée.
- **4.3** Source météo affichée : « AROME · vent comparé à ECMWF » quand ECMWF ne sert qu'au vent de comparaison (avant : « AROME » seul). Écran clair si la fiche d'un guide ne peut pas être lue au premier lancement sans réseau.
- **Tests** Grille de scénarios du moteur (`tests/scenarios.mjs`, 59 136 cas : 66 spots × 896 météos) et audit des données des spots (`tests/audit-spots.mjs`). Unitaires : 15 contrôles de sécurité ajoutés par guide.

## Non publié — phase 3, socle technique

Branche `claude/phase-3-socle`. Le site publié ne change pas tant que la branche n'est pas fusionnée.

- **3.1** Le code source (src/, scripts/, tests/, assets/, audit/) revient dans le dépôt ; `npm ci && npm run build` redonne exactement les fichiers publiés.
- **3.2** ESLint et axe-core dans le projet (`npm run lint`, `npm run test:a11y`), version de Node fixée (`.nvmrc`), README raccourci, ce journal des versions, CONTRIBUTING, `docs/ARCHITECTURE.md`, `docs/FONCTIONNALITES.md`, document de continuité. La construction ne supprime plus le dossier `docs/`.
- **3.3** Intégration continue sur GitHub : à chaque proposition de modification, construction, vérification que les fichiers publiés correspondent aux sources, contrôle du code, tests unitaires, parcours Chromium, contrat Open-Meteo simulé et réel, studio, accessibilité. Machines Ubuntu 24.04 (Playwright 1.56 ne prend pas en charge Ubuntu 26.04). Le contrat Open-Meteo vérifie ce qu'ECMWF fournit vraiment (le vent de comparaison). Premier passage entièrement vert le 6 novembre (commit 3c72fde).
- **3.4** Code rangé par couche : `src/app/` (coquille), `src/core/` (commun au bord et au bateau), `src/bord/`, `src/bateau/`, `src/design/`, et les fiches des sites dans `data/sites/`. Nouveau test `npm run test:layers` : le bord et le bateau ne s'importent jamais l'un l'autre. Composant inutilisé `ScoreArc` retiré. Fichiers publiés identiques octet pour octet (construction `b930d9512616`). Les chemins cités dans les versions ci-dessous sont les anciens.
- **3.5** **Une seule application.** Un seul `app.js` sert l'accueil et les sept guides ; la fiche de chaque guide est publiée à part (`<guide>.json`) et téléchargée à l'ouverture du guide. Les pages des guides gardent leur adresse (`logonna.html`…, liens, favoris et raccourcis inchangés), ne contiennent plus aucun script (CSP : seul `app.js` s'exécute). L'accueil crée le moteur de chaque guide à partir d'une seule copie du code (sept copies dans l'ancien `home.js`, supprimé). Poids publié : 7,0 Mo → 1,7 Mo, icônes comprises ; premier guide ouvert : 928 Ko au lieu de 788 Ko, chaque guide suivant : 75 Ko au lieu de 780 Ko. Service hors ligne : il ne supprime plus que ses propres caches (l'origine est partagée avec les autres sites GitHub Pages du compte) et finit le ménage à l'ouverture de page suivante si l'ancienne version a recréé son cache pendant la mise à jour. Nouveau test `npm run test:upgrade` : une session notée avec la version publiée est toujours là après la mise à jour, puis tout marche hors ligne.
- **3.8** Sécurité. La sauvegarde GitHub (journal, tes spots, sorties en bateau) vérifie que le dépôt est **privé** avant d'y écrire : un dépôt public, ou une vérification impossible, bloque l'envoi avec un message clair, et la session reste sur le téléphone. La clé API Claude (analyse photo) n'est plus gardée que **le temps de la session** (oubliée à la fermeture de l'application), sauf si tu coches « Garder la clé sur ce téléphone » ; une clé déjà enregistrée reste gardée. Nouveaux tests de bout en bout : dépôt public refusé, clé de session, case « garder », export du journal puis import sur un téléphone neuf. Adresse dédiée : en attente de ta décision.
- **3.7** Jetons de design (`src/design/tokens.js`) : couleurs, typographie, rayons, cibles tactiles, durées, seuils de note, avec les valeurs actuelles. Le kit les utilise ; jauge de note, pastille et chargement passent dans `src/design/components.jsx`, avec le style de bouton dont l'accueil, l'onglet Offshore et l'ajout de spot avaient trois copies identiques. Aucun changement visible : 22 vues capturées avant et après, identiques pixel pour pixel (`tests/visual.mjs`). Couleurs en dur hors de `src/design/` : 298 → 291, compte qui ne peut plus monter.
- **3.6** Fiches des sites validées par un schéma (`data/schema/site.schema.json`, JSON Schema 2020-12, vérifié avec ajv 8.20.0) : chaque champ documenté (type, unité, valeurs permises), champs inconnus refusés (une faute de frappe ne passe plus en silence), règles croisées (zone et port de marée connus, créneaux, sessions initiales). La construction refuse une fiche invalide. `npm run test:data` : 16 erreurs de saisie types bien refusées, fiches exportables en JSON sans perte, empreinte de chacun des 66 spots identique à celle de la v9.2. Les fiches restent écrites en JavaScript commenté (données pures) pour garder la provenance écrite en commentaire.
- **3.3 (suite)** Le contrat Open-Meteo réel distingue un service injoignable d'un contrat rompu : cause réseau exacte, un second essai après une minute, signalé.
- **Tests** Accueil, recherche autour de soi : le test attend aussi la note de demain, qui arrive après celles du jour (il lisait trop tôt quand le chargement est un peu plus long).
- **Tests** Le simulateur d'Open-Meteo faisait baisser la pression sans fin depuis le 9 octobre : à partir du 7 novembre, elle sortait de la plage réaliste et le contrat simulé échouait (24/26 le 13 novembre). Pression désormais en dents de scie sur 25 jours (970 à 1 030 hPa), toujours −2,4 hPa en 24 h ; valeurs des tests unitaires inchangées.

## 9.2 — 6 novembre 2026 (refonte UX)

- **Navigation à portée du pouce** (`src/ui/TabBar.jsx`) : une barre fixe en bas de l'écran, cinq entrées avec pictogramme et libellé — **Décision**, **Carte**, **Journal**, **Matériel**, **Plus**. « Plus » ouvre un sommaire : Marée, Météo, Saison, Règles, Photos, l'état de la sauvegarde et les réglages, le changement de guide. Chaque écran reste dans l'adresse (`#maree`…) : le bouton retour du téléphone fonctionne et les liens des versions précédentes marchent toujours. Clavier : flèches, début, fin (motif « onglets » WAI-ARIA).
- **Écran Décision** (`src/ui/Decision.jsx`) : un bandeau qui répond d'abord à « j'y vais ? » — « Très bonnes conditions ce matin », la meilleure fenêtre, le spot, le temps qu'il reste, un bouton vers la fiche. Le ciel du bandeau est **dessiné d'après la vraie lumière du créneau** (aube, jour, crépuscule, nuit, ciel couvert) : aucune photo d'illustration qui ferait croire à un lieu ou à une météo. La note passe dans un anneau ; « Pourquoi ce spot ? » liste en clair les termes qui portent la note, « À surveiller » ceux qui la freinent.
- **Comparer les meilleurs spots** : les trois premiers côte à côte, et ce qui fait leur note famille par famille (Marée, Vent, Lumière, Saison et eau — `src/engine/factors.js`, somme exacte des termes du moteur, rien de recalculé), avec la famille qui fait la différence.
- **Fiche du spot** : anneau de note, « Meilleure fenêtre », « Pourquoi ce spot ? », bouton **Voir la stratégie** (leurre, poids, nage, animation pour ce créneau).
- **Carte** en premier dans son écran, avec des filtres (Tous, Au vert, Tes spots) ; les heures de pêche passent en bas.
- **Mode terrain** : interrupteur dans le bandeau ; grand anneau de note, marée, vent, houle, eau, leurre, en gros caractères.
- **Journal** : en tête, sessions, bars pris, spots pêchés et le spot qui a le plus donné ; l'historique ensuite ; « Noter une session » descend au formulaire (et y va seul à la fin d'une session).
- **Matériel** : poids, nage et couleur du leurre conseillé en tuiles lisibles d'un coup d'œil.
- Toujours **une seule note sur 10** : la sécurité et la confiance restent à part, sans chiffre ni feu vert (pas de « Favorabilité / Pertinence / Confiance sur 100 »).

## 9.1 — 6 novembre 2026 (SPUMY)

- **Marque SPUMY** : un bar de profil qui bondit hors de l'écume (première dorsale épineuse, seconde dorsale, queue fourchue, opercule), lisible jusqu'à 29 px. **Aucune écriture dans les icônes** : le nom de l'application et celui du guide s'affichent toujours à côté, en vrai texte, donc nets à toutes les tailles et lus par les lecteurs d'écran. Chaque guide garde la même marque, seule la couleur de l'eau change (des teintes marines, jamais le vert, l'orange ou le rouge réservés aux notes). Icônes : `icon-192.png` et `icon-512.png` (« any »), `icon-maskable.png` (marque dans le cercle de 80 % qu'Android ne rogne pas), `apple-touch-icon.png` (180 px, iPhone), une icône par guide. Nom sous l'icône : « SPUMY » (5 caractères, jamais tronqué).
- **Sécurité du bord** (`src/engine/safety.js`) : un indicateur à part de la note, construit seulement à partir des données du moteur — consignes de la fiche actives selon le coefficient et la phase, houle prévue face au maximum écrit dans la fiche, vent moyen sur l'échelle de Beaufort (force 7 « grand frais » : Météo-France émet un BMS côte ; force 8 « coup de vent »), nuit sur un spot modéré ou engagé, houle ou météo inconnues. Trois états : « Alerte sécurité », « Prudence », « Aucune alerte connue ». **Jamais de feu vert** : sans alerte connue, le guide le dit et ajoute toujours « vérifie sur place ». Affiché dans le verdict et dans l'onglet Accès de chaque fiche.
- **Confiance dans le conseil** (`src/engine/confidence.js`) : un indicateur qui ne fait pas semblant d'être une note — ni pourcentage, ni « /100 ». La liste de ce que le conseil avait et de ce qui lui manquait (fraîcheur de la météo, modèle AROME ou ECMWF seul, désaccord des modèles, houle, température de l'eau, stabilité du classement, fiche sourcée ou spot ajouté, marée, journal), résumée en trois mots : élevée, moyenne, faible. Des points, pas de couleur d'état.
- **Une seule échelle de couleurs** : vert, orange et gris ne servent qu'à la note (7 et plus, 5 et plus, en dessous). La robustesse du classement n'a plus sa propre pastille colorée : elle fait partie de la confiance.
- **Accueil** : en-tête SPUMY (marque, nom, promesse en texte), onglets Inshore et Offshore avec leur pictogramme.

## 8.x et avant

Versions du projet « guide-peche-bar », avant le nom SPUMY ; leur historique n'est pas repris ici.
