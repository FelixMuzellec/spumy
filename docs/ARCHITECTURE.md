# Architecture de SPUMY

État au 13 novembre 2026 : v9.2, lot 3.6 de la phase 3. La première partie décrit le code tel qu'il est ; la seconde, l'architecture cible décidée en phase 2, atteinte lot par lot. Ce document est mis à jour à chaque lot qui change l'organisation.

## Aujourd'hui (v9.2)

- **Un moteur, sept guides.** Le socle (`src/core/`), le moteur et l'interface du bord (`src/bord/`) sont communs aux guides. Chaque guide n'a que sa fiche de site (`data/sites/<site>.config.js`). `scripts/build.mjs` compile avec esbuild un paquet par guide (l'alias `SITE_CONFIG` pointe vers la fiche du site) et l'intègre dans `<site>.html`, avec une politique CSP par empreinte.
- **Accueil.** `index.html` charge `home.js`, qui embarque les sept moteurs pour la carte de tous les spots, la recherche, l'ajout de spot et l'onglet Offshore (pêche en bateau, `src/bateau/`).
- **Pas de serveur.** Météo : Open-Meteo, appelé depuis le téléphone ; marée calculée sur place ; stockage dans le navigateur (`localStorage`, clés `bar:*` séparées par site ; IndexedDB pour les photos) ; hors ligne par service worker (`sw.js`).
- **Services optionnels.** Sauvegarde du journal sur un dépôt GitHub de l'utilisateur (`src/core/ghsync.js`), analyse photo par l'API Anthropic avec la clé de l'utilisateur ou par la page studio.

### Organisation du dépôt

```
index.html            accueil (point d'entrée de l'application) ┐
home.js               accueil : carte de tous les spots, ajout  │
logonna.html, pirou.html, plouguerneau.html, audierne.html,     │ le site publié par GitHub Pages :
carantec.html, concarneau.html, crozon.html                     │
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
    site-api.js           moteur de chaque guide sans interface, embarqué dans home.js
    sync.jsx              sauvegarde du journal et de tes spots sur GitHub (bandeau et fusion)
    index.html            modèle de l'accueil : la construction y écrit les guides par département et l'index des spots
    sw.template.js        modèle du sw.js (nommé ainsi pour ne jamais écraser le sw.js construit)
  core/                 le socle commun au bord et au bateau
    core.js               soleil, lumière, directions du vent ; effet du vent selon le type de spot (à ranger dans bord/)
    tide.js               marée (prédiction harmonique, heure de Paris)
    wxcore.js             Open-Meteo sans guide (adresses, variables, requête), partagé par les guides et l'accueil
    rules.js              réglementation 2026 (nord et sud du 48e parallèle), remise à l'eau, sécurité par spot
    scale.js              repères de l'échelle des notes (égalité, « au vert ») et tendance vers demain
    myspots-core.js       tes spots, partie sans guide : choix du formulaire, coordonnées collées, guide d'un point
    MySpotForm.jsx        formulaire « Ajouter un spot » (GPS, carte, coordonnées collées), commun aux deux pêches
    storage.js            stockage de l'appareil (API window.storage sur localStorage) ; signale chaque écriture du journal
    persist.js            sonde réelle du stockage et écriture non destructive
    idb.js                IndexedDB (photos)
    ghsync.js             accès au dépôt GitHub du journal, partagé par les guides et l'accueil (offshore.json)
  bord/                 la pêche du bord
    engine/
      model.js              fenêtres, note, saison, terrain, proies, pression, orientation
      weather.js            météo des spots du guide, incertitude entre modèles, cache
      safety.js             sécurité ; confidence.js : confiance ; factors.js : familles de facteurs de la note
      journal.js            journal de session, recalibrage, prises par heure
      lures.js              conseil leurres : courant du créneau, vent de face, profondeur, leurre de ta boîte, taille, tête, couleur
      tackle.js             fiches techniques des leurres de ta boîte (poids, nage, têtes), relevées chez les fabricants
      myspots.js            tes spots : fiche construite à partir de tes choix, registre commun au moteur, fusion téléphone / GitHub
      terrain.js            corrections de terrain appliquées aux fiches (aussi utilisées par l'accueil)
      photo.js              analyse photo : EXIF, marée et lumière de la prise de vue, trois passes, contrôle des preuves
    ui/
      App.jsx               données du jour et navigation par onglets
      TabBar.jsx, Decision.jsx, Indicators.jsx, MapView.jsx, Orientation.jsx, components.jsx
      tabs/                 un fichier par onglet : Synthese, Spots (+ SpotDetail), Photos, Leurres, Maree, Meteo,
                            Saison, JournalTab, Regles
      photoPrep.js, photoJob.js, myspotCtx.js
  bateau/               la pêche en bateau
    offshore.js           espèces, fiches, conditions d'une sortie, régression de Poisson, note, courbes
    wx.js                 météo et mer des spots bateau (Open-Meteo)
    Offshore.jsx          l'onglet Offshore de l'accueil
  design/               le style commun, sans métier
    kit.jsx               cartes, tuiles, puces, sources, couleurs
    icons.jsx             pictogrammes
    theme.js              affichage « plein soleil » (Réglages), commun aux guides et à l'accueil
  engine.js             tout le moteur sans interface, pour les tests
  studio/               la page « Analyse photo du bar » publiée sur claude.ai (abonnement, sans clé API)
data/
  sites/                ce qui est propre à chaque lieu (spots, fiches terrain, sécurité, zones, ports de marée, proies)
    logonna.config.js, pirou.config.js, plouguerneau.config.js, audierne.config.js, carantec.config.js,
    concarneau.config.js, crozon.config.js
                        données pures écrites en JavaScript commenté : les commentaires portent la provenance
                        (source, date, à confirmer sur place) et JSON n'en admet pas ; exportables en JSON sans perte
  schema/site.schema.json  le schéma d'une fiche (JSON Schema 2020-12) : chaque champ, son type, son unité, ses valeurs
tests/
  unit.mjs              moteur + schéma des fiches + contrôle de la marée (Pirou, ports du Finistère)
  e2e.mjs               parcours complet dans Chromium (téléphone simulé)
  studio.mjs            page d'analyse par l'abonnement, avec un Claude simulé
  contract.mjs          contrat avec le vrai service Open-Meteo
  om_mock.mjs           simulateur d'Open-Meteo
  a11y.mjs              accessibilité (axe-core) sur toutes les pages et tous les onglets
  layers.mjs            règles de couches : qui a le droit d'importer quoi
  data.mjs              fiches des sites : schéma, données pures, règles croisées, empreinte de chaque spot (ref/sites.json)
  ref/                  tables de référence (marée de Pirou, octobre 2026 ; Aber Wrac'h, Brignogan, Lanildut,
                        Le Conquet, Audierne, Saint-Guénolé, Roscoff, château du Taureau, Primel, Locquirec, Concarneau,
                        Bénodet, Port-Manec'h, Le Pouldu, Morgat, Douarnenez, novembre 2026)
scripts/sites.mjs     la liste des guides (avec leur description d'accueil) et des 22 fichiers du site (construction et tests)
scripts/build.mjs     construit les 22 fichiers du site, à la racine, depuis src/ et data/ (refuse une fiche invalide)
scripts/site-data.mjs contrôle d'une fiche (schéma, données pures, règles croisées), export JSON, empreintes
scripts/build-studio.mjs  construit la page d'analyse (studio-build/analyse-photo.html, non publiée par GitHub Pages)
scripts/brand.mjs     la marque SPUMY (dessin vectoriel du bar et de l'écume, couleurs des guides)
scripts/icons.mjs     dessine toutes les icônes depuis brand.mjs (assets/brand/*.svg → assets/*.png)
assets/               icônes : sources vectorielles (brand/) et rendus PNG (application, iOS, guides)
audit/                AUDIT-SPUMY-v9.1.md : audit de la V2 et liste complète des corrections ;
                      UX-SPUMY-v9.2.md : refonte UX d'après la maquette, écarts assumés, suite
.github/workflows/    tests à chaque dépôt, contrat Open-Meteo chaque matin
```

Pour corriger la description d'un spot, le seul fichier à modifier est `data/sites/<site>.config.js` ; la construction et `npm run test:data` la vérifient contre le schéma `data/schema/site.schema.json` et les règles croisées (zone et port de marée connus, créneaux, sessions initiales), puis les tests unitaires sa cohérence (coordonnées, secteurs de vent, bande de coefficient, terrain, sécurité). Toute modification d'un spot change son empreinte : `npm run test:data` la signale et nomme le spot ; si elle est voulue, `node tests/data.mjs --update-ref` met à jour `tests/ref/sites.json` dans le même commit.

## Cible (décidée en phase 2)

1. **Couches.** Une application unique ; deux moteurs séparés, BORD et BATEAU ; un socle commun (marée et astres, météo qualifiée, stockage et sauvegarde, règles) ; des données hors du code (spots, zones, connaissances avec niveau de preuve, réglementation datée, journal et profil).
2. **Ce qui est partagé** : interface et système de design, marée, astres, client météo, stockage, sauvegarde, carte (couches séparées), infrastructure du journal, moteur de règles.
3. **Ce qui reste séparé** : moteurs de recommandation, filtres de sécurité, connaissances halieutiques, profils, apprentissage personnel, écrans de décision.
4. **Circuit d'un moteur** : données qualifiées (valeur, nature, source, âge, fiabilité), puis filtre de sécurité non compensable (un danger bloquant retire le spot, une donnée de sécurité inconnue n'est jamais « verte »), puis trois scores sur 100 jamais fusionnés (favorabilité, pertinence, confiance), puis classement et explication.
5. **Arborescence visée** : `src/core/`, `src/bord/`, `src/bateau/`, `src/design/`, `data/` — en place depuis le lot 3.4, avec `src/app/` pour la coquille. Règles de couches, vérifiées à chaque test (`tests/layers.mjs`) : `design` n'importe que `design` ; `core` importe `core` et `design` ; `bord` et `bateau` importent leur propre dossier, `core` et `design`, jamais l'un l'autre ; `app` assemble le tout.

### Lots de la phase 3

| Lot | Contenu |
| --- | --- |
| 3.1 | Code source dans le dépôt, construction reproductible |
| 3.2 | Outils (ESLint, axe-core, Node fixé) et documentation |
| 3.3 | Intégration continue sur GitHub |
| 3.4 | Réorganisation `core` / `bord` / `bateau` / `design` / `data`, sans changement de comportement |
| 3.6 | Fiches de sites en données, validées par un schéma |
| 3.5 | Application unique, anciennes adresses redirigées |
| 3.7 | Jetons de design et composants neutres |
| 3.8 | Sécurité rapide : dépôt de sauvegarde vérifié privé, clé Claude gardée le temps de la session, adresse dédiée selon décision |
