# Architecture de SPUMY

> **V3** : l'architecture cible de la V3 (une application, deux modes, catalogue unique, position de référence, routage IGN) est proposée dans `docs/ARCHITECTURE-V3.md` (phase 2 V3, 20 nov. 2026). Ce document-ci décrit le code réellement en place ; sa section « architecture cible » date de la phase 2 V2.

État au 19 novembre 2026 : fin de la phase 8 (moteur BORD v2 en place et éprouvé). La première partie décrit le code tel qu'il est ; la seconde, l'architecture cible décidée en phase 2, atteinte lot par lot. Ce document est mis à jour à chaque lot qui change l'organisation.

## Aujourd'hui

- **Une application, sept guides (lot 3.5).** `scripts/build.mjs` compile avec esbuild **un seul** `app.js`, chargé par l'accueil et par chaque guide. Chaque guide n'a que sa fiche (`data/sites/<site>.config.js`), publiée en `<site>.json`. La page d'un guide (`<site>.html`, 14 Ko, aucun script en ligne) dit quel guide elle est (`<html data-page="guide" data-site="logonna">`) ; `src/app/entry.jsx` télécharge sa fiche, puis démarre le moteur et l'interface du bord, qui lisent la fiche par l'alias `SITE_CONFIG` (`src/app/site-config.js`). Le code du bord n'est évalué que sur la page d'un guide (import dynamique).
- **Accueil.** `index.html` charge le même `app.js` : il télécharge les sept fiches et crée une instance du moteur de chaque guide (`src/app/site-api.js`, compilé une fois, la fiche en paramètre) pour la carte de tous les spots, les notes de la recherche, l'ajout de spot et l'onglet Offshore (pêche en bateau, `src/bateau/`).
- **Poids publié** : 7,0 Mo en v9.2 (sept paquets de 790 Ko et `home.js` de 1,2 Mo, avec sept copies du moteur), 1,7 Mo après le lot 3.5 (icônes comprises). Au 19 novembre : `app.js` 991 Ko (328 Ko compressé), dont l'application (828 Ko : interface du bord 224 Ko, moteur 159 Ko, Leaflet 147 Ko, React 139 Ko) et le moteur de l'accueil, compilé à part avec la fiche en paramètre ; chaque guide ajoute sa page (14 Ko) et sa fiche (`<guide>.json`, 38 à 66 Ko). Le tout est en cache dès la première visite.
- **Deux moteurs du bord, une seule sécurité.** `src/bord/engine/model.js` (v1, note sur 10) note les créneaux ; `src/bord/engine/v2.js` (v2, phase 7) en tire les trois scores sur 100 (favorabilité, pertinence, confiance) avec la même sécurité (`windowSafety`, `safety.js`). `rankDay` classe une journée avec le moteur choisi (*Réglages → Moteur de notes*, clé `bar:moteur`, v2 par défaut) ; les valeurs de départ, paliers et poids sont dans `v2-params.js`, sans fiche, pour que l'accueil et les réglages les lisent.
- **Pas de serveur.** Météo : Open-Meteo, appelé depuis le téléphone ; marée calculée sur place ; stockage dans le navigateur (`localStorage`, clés `bar:*` séparées par site ; IndexedDB pour les photos) ; hors ligne par service worker (`sw.js`).
- **Services optionnels.** Sauvegarde du journal sur un dépôt GitHub de l'utilisateur (`src/core/ghsync.js`), analyse photo par l'API Anthropic avec la clé de l'utilisateur ou par la page studio.

### Organisation du dépôt

```
index.html            accueil (point d'entrée de l'application) ┐
app.js                l'application (accueil, guides, bateau)   │
logonna.html, pirou.html, plouguerneau.html, audierne.html,     │ le site publié par GitHub Pages :
carantec.html, concarneau.html, crozon.html                     │
logonna.json … crozon.json  la fiche de chaque guide            │
manifest.json         une seule application installable         │ fichiers construits, à la racine,
icon-192.png, icon-512.png, icon-maskable.png                   │ à ne pas modifier à la main
logonna.png, pirou.png, plouguerneau.png, audierne.png,         │
carantec.png, concarneau.png, crozon.png                        │
sw.js                 fonctionnement hors ligne                 │
.nojekyll             fichiers servis tels quels                ┘
src/                  les sources (lot 3.4 : une couche par dossier, règles vérifiées par tests/layers.mjs)
  app/                  la coquille : points d'entrée et ce qui assemble les couches
    main.jsx              démarrage d'un guide, et écran de secours si l'affichage plante (export du journal brut)
    home.jsx              accueil : carte de tous les spots, recherche, ajout de spot, onglet Offshore
    entry.jsx             point d'entrée unique (app.js) : guide ou accueil, selon la page ; télécharge les fiches
    site-config.js        la fiche du guide ouvert, lue par le moteur (alias SITE_CONFIG)
    site-api.js           moteur d'un guide sans interface, compilé une fois ; l'accueil en crée une instance par guide
    sync.jsx              sauvegarde du journal et de tes spots sur GitHub (bandeau et fusion)
    EnginePanel.jsx       Réglages → Moteur de notes (v1 / v2, boîte complète, trajet maximal)
    transfer.js, TransferPanel.jsx  Réglages → Toutes mes données : un fichier pour changer de téléphone, importé sans rien écraser
    index.html            modèle de l'accueil : la construction y écrit les guides par département et l'index des spots
    sw.template.js        modèle du sw.js (nommé ainsi pour ne jamais écraser le sw.js construit)
  core/                 le socle commun au bord et au bateau
    core.js               soleil, lumière, directions du vent ; effet du vent selon le type de spot (à ranger dans bord/)
    tide.js               marée (prédiction harmonique, heure de Paris)
    wxcore.js             Open-Meteo sans guide (adresses, variables, requête), partagé par les guides et l'accueil
    rules.js              réglementation 2026 (nord et sud du 48e parallèle), remise à l'eau, sécurité par spot
    scale.js              échelles des deux moteurs (sur 10, sur 100 : égalité, « favorable »), moteur choisi, tendance vers demain
    myspots-core.js       tes spots, partie sans guide : choix du formulaire, coordonnées collées, guide d'un point
    MySpotForm.jsx        formulaire « Ajouter un spot » (GPS, carte, coordonnées collées), commun aux deux pêches
    storage.js            stockage de l'appareil (API window.storage sur localStorage) ; signale chaque écriture du journal
    persist.js            sonde réelle du stockage et écriture non destructive
    idb.js                IndexedDB (photos)
    ghsync.js             accès au dépôt GitHub du journal, partagé par les guides et l'accueil (offshore.json) ;
                          refuse d'écrire si le dépôt n'est pas privé (lot 3.8)
  bord/                 la pêche du bord
    engine/
      model.js              moteur v1 : fenêtres, note sur 10, ensemble de météos plausibles, saison, terrain, proies, pression, orientation
      v2.js                 moteur v2 (phase 7) : favorabilité, pertinence, confiance, classement, fiabilité sur les météos plausibles
      v2-params.js          valeurs de départ de la v2 (poids, paliers recalés en phase 8, seuils), réglages de l'appareil
      weather.js            météo des spots du guide, incertitude entre modèles, cache
      safety.js             sécurité commune aux deux moteurs (vent, rafales, houle, nuit, isolement ; vigilance non lue, dite) ;
                            confidence.js : confiance de la v1 ; factors.js : familles de facteurs de la note
      journal.js            journal de session, recalibrage, prises par heure
      lures.js              conseil leurres : courant du créneau, vent de face, profondeur, leurre de ta boîte, taille, tête, couleur
      tackle.js             fiches techniques des leurres de ta boîte (poids, nage, têtes), relevées chez les fabricants
      myspots.js            tes spots : fiche construite à partir de tes choix, registre commun au moteur, fusion téléphone / GitHub
      terrain.js            corrections de terrain appliquées aux fiches (aussi utilisées par l'accueil)
      photo.js              analyse photo : EXIF, marée et lumière de la prise de vue, trois passes, contrôle des preuves
    ui/
      App.jsx               données du jour et navigation par onglets
      TabBar.jsx, Decision.jsx, Indicators.jsx, MapView.jsx, Orientation.jsx, components.jsx
      ambiance.js, AmbiancePhoto.jsx  phase 12 : photo d'ambiance du créneau (Décision, fiche), marque « Illustration »
      tabs/                 un fichier par onglet : Synthese, Spots (+ SpotDetail), Photos, Leurres, Maree, Meteo,
                            Saison, JournalTab, Regles
      photoPrep.js, photoJob.js, myspotCtx.js
  bateau/               la pêche en bateau
    offshore.js           espèces, fiches, conditions d'une sortie, régression de Poisson, note, courbes
    wx.js                 météo et mer des spots bateau (Open-Meteo)
    Offshore.jsx          l'onglet Offshore de l'accueil
  design/               le style commun, sans métier
    tokens.js             jetons (lot 3.7) : couleurs, typographie, rayons, cibles tactiles, durées, seuils de note
    kit.jsx               carte, tuile, puce, bloc repliable, sous-onglets, ligne, source, bandeau (valeurs tirées des jetons)
    components.jsx        jauge de note, pastille, chargement, style de bouton
    icons.jsx             pictogrammes
    theme.js              affichage « plein soleil » (Réglages), commun aux guides et à l'accueil
    ds/                   phase 11 : le système de design de la direction artistique (docs/DIRECTION-ARTISTIQUE.md),
                          utilisé par le prototype ; l'application ne l'emploie pas encore (phase 13)
      tokens.css            jetons des thèmes Nuit marine et Plein soleil, polices Roboto Condensed et Roboto auto-hébergées
      components.css, ui.jsx  22 composants (préfixe s-) : boutons, cartes, anneaux de score, pastilles, barre du bas…
      lucide.js, glyphs.js  96 icônes Lucide (licence ISC) et 8 pictogrammes SPUMY (modes BORD et BATEAU, marée…)
      ambiance.js           choix déterministe de la photo d'ambiance (lumière, ciel, mer, lieu ; règles d'honnêteté)
      illustrations.js      couleurs des dessins (robes des leurres, fond de carte)
  prototype/            phase 11 : la maquette interactive (23 écrans BORD et BATEAU, planches), construite dans prototype/ ;
                        n'importe que design/ et data/ (données figées : data/bord.json par scripts/prototype-data.mjs,
                        data/bateau.js d'exemple, cartes OSM par scripts/carte-prototype.py)
  engine.js             tout le moteur sans interface, pour les tests
  studio/               la page « Analyse photo du bar » publiée sur claude.ai (abonnement, sans clé API)
data/
  sites/                ce qui est propre à chaque lieu (spots, fiches terrain, sécurité, zones, ports de marée, proies)
    logonna.config.js, pirou.config.js, plouguerneau.config.js, audierne.config.js, carantec.config.js,
    concarneau.config.js, crozon.config.js
                        données pures écrites en JavaScript commenté : les commentaires portent la provenance
                        (source, date, à confirmer sur place) et JSON n'en admet pas ; exportables en JSON sans perte
  schema/site.schema.json  le schéma d'une fiche (JSON Schema 2020-12) : chaque champ, son type, son unité, ses valeurs
  knowledge/            phase 5 : connaissances halieutiques, avec leur niveau de preuve et, depuis la phase 8, leur verdict
    bar-bord.json       chaque connaissance du moteur BORD sur le bar : énoncé, niveau de preuve (1 à 5), sources,
                        limites, code qui l'utilise ; et le niveau des 82 règles du moteur de leurres
    preuves-spots.json  le niveau de preuve (1 à 5) de chacune des 396 rubriques des 66 spots, avec son motif
    preuves-niveaux.json  extrait lu par le moteur v2 (niveau des rubriques de chaque spot), contrôlé par test:knowledge
    bateau.json         phase 9 : connaissances du mode BATEAU (six espèces, réglementation 2026, sécurité en mer),
                        chacune avec son espèce, son niveau de preuve, ses sources, ses limites et la règle de
                        docs/SPEC-MOTEUR-BATEAU.md qui l'utilise (SEC_*, ESP_*)
  photos/catalogue.json  phase 11 : les 32 photos d'ambiance fournies par Félix (images générées), décrites (lumière, ciel,
                        mer, lieu, « reconnaissable ») ; les fichiers WebP sont dans assets/photos/ (scripts/photos.py)
  epreuve/              phase 8 : dates des journées de référence (journees.json), journées archivées d'Open-Meteo
                        (archives/<guide>.json.gz), résultats des tirages et de l'analyse (resultats/)
  schema/knowledge.schema.json, knowledge-bateau.schema.json  les schémas des fichiers de connaissances BORD et BATEAU
tests/
  unit.mjs              moteur + schéma des fiches + contrôle de la marée (Pirou, ports du Finistère)
  v2.mjs                moteur v2 : les 16 scénarios de la spécification et les règles des trois scores
  compare-v1v2.mjs      les deux moteurs sur 2 016 journées d'essai, avec la cause de chaque écart de premier spot
  scenarios.mjs, audit-spots.mjs  grille de sécurité (73 986 cas) et audit des fiches, outils d'audit hors suite
  e2e.mjs               parcours complet dans Chromium (téléphone simulé), servi sous /spumy/ comme sur GitHub Pages
  studio.mjs            page d'analyse par l'abonnement, avec un Claude simulé
  contract.mjs          contrat avec le vrai service Open-Meteo
  knowledge.mjs         connaissances BORD et BATEAU : schéma, niveaux, sources, code ou règle utilisés, rubriques des spots
  om_mock.mjs           simulateur d'Open-Meteo
  a11y.mjs              accessibilité (axe-core) sur toutes les pages et tous les onglets
  layers.mjs            règles de couches : qui a le droit d'importer quoi ; couleurs en dur hors de src/design/ (compte qui ne peut que baisser)
  data.mjs              fiches des sites : schéma, données pures, règles croisées, empreinte de chaque spot (ref/sites.json)
  upgrade.mjs           mise à jour d'un téléphone : données saisies avec la version publiée conservées, hors ligne ensuite
  visual.mjs            captures de 22 vues, figées (date, météo simulée, carte), et comparaison pixel par pixel
  design.mjs            phase 11 : contrastes WCAG des jetons dans les deux thèmes
  prototype.mjs         phase 11 : les 23 écrans du prototype à 390 et 320 px, deux thèmes, interactions, axe-core
  ref/                  tables de référence (marée de Pirou, octobre 2026 ; Aber Wrac'h, Brignogan, Lanildut,
                        Le Conquet, Audierne, Saint-Guénolé, Roscoff, château du Taureau, Primel, Locquirec, Concarneau,
                        Bénodet, Port-Manec'h, Le Pouldu, Morgat, Douarnenez, novembre 2026)
scripts/sites.mjs     la liste des guides (avec leur description d'accueil) et des 22 fichiers du site (construction et tests)
scripts/build.mjs     construit les 22 fichiers du site, à la racine, depuis src/ et data/ (refuse une fiche invalide)
scripts/site-data.mjs contrôle d'une fiche (schéma, données pures, règles croisées), export JSON, empreintes
scripts/build-studio.mjs  construit la page d'analyse (studio-build/analyse-photo.html, non publiée par GitHub Pages)
scripts/brand.mjs     la marque SPUMY (dessin vectoriel du bar et de l'écume, couleurs des guides)
scripts/build-prototype.mjs  phase 11 : construit le prototype dans prototype/ (index.html, app.js, app.css, polices)
scripts/prototype-data.mjs, carte-prototype.py, photos.py, avant-prototype.mjs  données, cartes, photos et captures « avant » du prototype
scripts/epreuve-*.mjs épreuve du moteur (phase 8) : téléchargement des journées (fetch, dans l'intégration continue),
                      lecture des archives (journees), tirages Monte Carlo (mc, params), synthèse, analyse telle quelle
scripts/icons.mjs     dessine les icônes vectorielles des guides depuis brand.mjs (assets/brand/*.svg)
scripts/logos.py      phase 12 : déclinaisons des logos de Félix et icônes de l'application (192, 512, masquable, Apple, guides)
assets/               icônes : sources vectorielles (brand/) et rendus PNG (application, iOS, guides)
  brand/sources/        phase 12 : les logos de Félix (SPUMY, Inshore, Offshore) ; brand/*.png et brand/web/*.webp en sont tirés
                        par scripts/logos.py (fond crème transparent, version pour fond sombre, icônes du téléphone)
  photos/               photos d'ambiance WebP (1600 et 720 px), hors du cache hors ligne
audit/                AUDIT-SPUMY-v9.1.md : audit de la V2 et liste complète des corrections ;
                      UX-SPUMY-v9.2.md : refonte UX d'après la maquette, écarts assumés, suite
.github/workflows/    tests à chaque proposition de fusion et sur main, contrat Open-Meteo chaque matin, épreuve du moteur (à la main)
```

Pour corriger la description d'un spot, le seul fichier à modifier est `data/sites/<site>.config.js` ; la construction et `npm run test:data` la vérifient contre le schéma `data/schema/site.schema.json` et les règles croisées (zone et port de marée connus, créneaux, sessions initiales), puis les tests unitaires sa cohérence (coordonnées, secteurs de vent, bande de coefficient, terrain, sécurité). Toute modification d'un spot change son empreinte : `npm run test:data` la signale et nomme le spot ; si elle est voulue, `node tests/data.mjs --update-ref` met à jour `tests/ref/sites.json` dans le même commit.

## Cible (décidée en phase 2)

1. **Couches.** Une application unique ; deux moteurs séparés, BORD et BATEAU ; un socle commun (marée et astres, météo qualifiée, stockage et sauvegarde, règles) ; des données hors du code (spots, zones, connaissances avec niveau de preuve, réglementation datée, journal et profil).
2. **Ce qui est partagé** : interface et système de design, marée, astres, client météo, stockage, sauvegarde, carte (couches séparées), infrastructure du journal, moteur de règles.
3. **Ce qui reste séparé** : moteurs de recommandation, filtres de sécurité, connaissances halieutiques, profils, apprentissage personnel, écrans de décision.
4. **Circuit d'un moteur** (en place pour le BORD depuis la phase 7 : `windowSafety` dans `src/bord/engine/safety.js`, appelée par `scoreWindow` avant toute note, puis les trois scores de `v2.js`) : données qualifiées (valeur, nature, source, âge, fiabilité), puis filtre de sécurité non compensable (un danger bloquant retire le spot, une donnée de sécurité inconnue n'est jamais « verte »), puis trois scores sur 100 jamais fusionnés (favorabilité, pertinence, confiance), puis classement et explication.
5. **Arborescence visée** : `src/core/`, `src/bord/`, `src/bateau/`, `src/design/`, `data/` — en place depuis le lot 3.4, avec `src/app/` pour la coquille. Règles de couches, vérifiées à chaque test (`tests/layers.mjs`) : `design` n'importe que `design` ; `core` importe `core` et `design` ; `bord` et `bateau` importent leur propre dossier, `core` et `design`, jamais l'un l'autre ; `app` assemble le tout.

### Lots de la phase 3

| Lot | Contenu |
| --- | --- |
| 3.1 | Code source dans le dépôt, construction reproductible |
| 3.2 | Outils (ESLint, axe-core, Node fixé) et documentation |
| 3.3 | Intégration continue sur GitHub |
| 3.4 | Réorganisation `core` / `bord` / `bateau` / `design` / `data`, sans changement de comportement |
| 3.6 | Fiches de sites en données, validées par un schéma |
| 3.5 | Application unique ; les anciennes adresses (`logonna.html`…) restent les portes d'entrée des guides, sans redirection |
| 3.7 | Jetons de design et composants neutres |
| 3.8 | Sécurité rapide : dépôt de sauvegarde vérifié privé, clé Claude gardée le temps de la session, adresse dédiée selon décision |
