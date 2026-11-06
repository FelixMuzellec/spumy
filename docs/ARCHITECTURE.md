# Architecture de SPUMY

État au 6 novembre 2026 : v9.2, lot 3.2 de la phase 3. La première partie décrit le code tel qu'il est ; la seconde, l'architecture cible décidée en phase 2, atteinte lot par lot. Ce document est mis à jour à chaque lot qui change l'organisation.

## Aujourd'hui (v9.2)

- **Un moteur, sept guides.** Le moteur (`src/engine/`) et l'interface (`src/ui/`) sont communs. Chaque guide n'a que sa fiche de site (`src/sites/<site>.config.js`). `scripts/build.mjs` compile avec esbuild un paquet par guide (l'alias `SITE_CONFIG` pointe vers la fiche du site) et l'intègre dans `<site>.html`, avec une politique CSP par empreinte.
- **Accueil.** `index.html` charge `home.js`, qui embarque les sept moteurs pour la carte de tous les spots, la recherche, l'ajout de spot et l'onglet Offshore (pêche en bateau, `src/home/offshore.jsx`, `src/engine/offshore.js`).
- **Pas de serveur.** Météo : Open-Meteo, appelé depuis le téléphone ; marée calculée sur place ; stockage dans le navigateur (`localStorage`, clés `bar:*` séparées par site ; IndexedDB pour les photos) ; hors ligne par service worker (`sw.js`).
- **Services optionnels.** Sauvegarde du journal sur un dépôt GitHub de l'utilisateur (`src/ghsync.js`), analyse photo par l'API Anthropic avec la clé de l'utilisateur ou par la page studio.

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
src/                  les sources
  engine/               le moteur, commun à tous les guides
    core.js               soleil, lumière, effet du vent selon le type de spot
    tide.js               marée (prédiction harmonique, heure de Paris)
    weather.js            météo Open-Meteo, incertitude entre modèles, cache
    model.js              fenêtres, note, saison, terrain, proies, pression, orientation
    journal.js            journal de session, recalibrage, prises par heure
    rules.js              réglementation 2026 (nord et sud du 48e parallèle), remise à l'eau, sécurité par spot
    lures.js              conseil leurres : courant du créneau, vent de face, profondeur, choix du leurre de ta boîte, de sa taille, de sa tête et de sa couleur
    tackle.js             fiches techniques des leurres de ta boîte (poids, nage, têtes), relevées chez les fabricants, et ta boîte
    myspots.js            tes spots : fiche construite à partir de tes choix, registre commun au moteur, fusion téléphone / GitHub
    myspots-core.js       tes spots, partie sans guide : choix du formulaire, coordonnées collées, guide d'un point (accueil)
    offshore.js           pêche en bateau : espèces, fiches, conditions d'une sortie, régression de Poisson, note, courbes
    wxcore.js             Open-Meteo sans guide (adresses, variables, requête), partagé par les guides et l'accueil
    scale.js              repères de l'échelle des notes (égalité, « au vert ») et tendance vers demain
    terrain.js            corrections de terrain appliquées aux fiches (aussi utilisées par l'accueil)
    photo.js              analyse photo : EXIF, marée et lumière de la prise de vue, trois passes, contrôle des preuves,
                          export et import d'une analyse faite par l'abonnement Claude
    persist.js            stockage
  sites/                ce qui est propre à chaque lieu
    logonna.config.js     spots, fiches terrain, sécurité, zones, ports de marée, proies
    pirou.config.js, plouguerneau.config.js, audierne.config.js, carantec.config.js, concarneau.config.js, crozon.config.js
  ui/                   l'interface
    App.jsx               données du jour et navigation par onglets
    kit.jsx               cartes, tuiles, puces, sources : le style commun
    TabBar.jsx, MapView.jsx, Orientation.jsx, components.jsx
    MySpotForm.jsx        formulaire « Ajouter un spot » (GPS, carte, coordonnées collées)
    theme.js              affichage « plein soleil » (Réglages), commun aux guides et à l'accueil
    tabs/                 un fichier par onglet : Synthese, Spots (+ SpotDetail), Photos, Leurres,
                          Maree, Meteo, Saison, JournalTab, Regles
    photoPrep.js          réduction et ré-encodage des photos (partagé avec la page d'analyse)
  main.jsx              démarrage, et écran de secours si l'affichage plante (export du journal brut)
  storage.js, sync.jsx
  ghsync.js             accès au dépôt GitHub du journal, partagé par les guides et l'accueil (offshore.json)
  index.html            modèle de l'accueil : la construction y écrit les guides par département et l'index des spots
  home/                 home.js : moteur de chaque guide sans interface (site-api.js), carte et ajout de spot (main.jsx),
                          pêche en bateau (offshore.jsx)
  offshore/wx.js        météo et mer des spots bateau (Open-Meteo)
  studio/               la page « Analyse photo du bar » publiée sur claude.ai (abonnement, sans clé API)
  sw.template.js        modèle du sw.js (nommé ainsi pour ne jamais écraser le sw.js construit)
tests/
  unit.mjs              moteur + schéma des fiches + contrôle de la marée (Pirou, ports du Finistère)
  e2e.mjs               parcours complet dans Chromium (téléphone simulé)
  studio.mjs            page d'analyse par l'abonnement, avec un Claude simulé
  contract.mjs          contrat avec le vrai service Open-Meteo
  om_mock.mjs           simulateur d'Open-Meteo
  ref/                  tables de référence (marée de Pirou, octobre 2026 ; Aber Wrac'h, Brignogan, Lanildut,
                        Le Conquet, Audierne, Saint-Guénolé, Roscoff, château du Taureau, Primel, Locquirec, Concarneau,
                        Bénodet, Port-Manec'h, Le Pouldu, Morgat, Douarnenez, novembre 2026)
scripts/sites.mjs     la liste des guides (avec leur description d'accueil) et des 22 fichiers du site (construction et tests)
scripts/build.mjs     construit les 22 fichiers du site, à la racine, depuis src/
scripts/build-studio.mjs  construit la page d'analyse (studio-build/analyse-photo.html, non publiée par GitHub Pages)
scripts/brand.mjs     la marque SPUMY (dessin vectoriel du bar et de l'écume, couleurs des guides)
scripts/icons.mjs     dessine toutes les icônes depuis brand.mjs (assets/brand/*.svg → assets/*.png)
assets/               icônes : sources vectorielles (brand/) et rendus PNG (application, iOS, guides)
audit/                AUDIT-SPUMY-v9.1.md : audit de la V2 et liste complète des corrections ;
                      UX-SPUMY-v9.2.md : refonte UX d'après la maquette, écarts assumés, suite
.github/workflows/    tests à chaque dépôt, contrat Open-Meteo chaque matin
```

Pour corriger la description d'un spot, le seul fichier à modifier est `src/sites/<site>.config.js` ; les tests vérifient ensuite la cohérence de la fiche (coordonnées, secteurs de vent, bande de coefficient, port de marée, terrain, sécurité).

## Cible (décidée en phase 2)

1. **Couches.** Une application unique ; deux moteurs séparés, BORD et BATEAU ; un socle commun (marée et astres, météo qualifiée, stockage et sauvegarde, règles) ; des données hors du code (spots, zones, connaissances avec niveau de preuve, réglementation datée, journal et profil).
2. **Ce qui est partagé** : interface et système de design, marée, astres, client météo, stockage, sauvegarde, carte (couches séparées), infrastructure du journal, moteur de règles.
3. **Ce qui reste séparé** : moteurs de recommandation, filtres de sécurité, connaissances halieutiques, profils, apprentissage personnel, écrans de décision.
4. **Circuit d'un moteur** : données qualifiées (valeur, nature, source, âge, fiabilité), puis filtre de sécurité non compensable (un danger bloquant retire le spot, une donnée de sécurité inconnue n'est jamais « verte »), puis trois scores sur 100 jamais fusionnés (favorabilité, pertinence, confiance), puis classement et explication.
5. **Arborescence visée** : `src/core/`, `src/bord/`, `src/bateau/`, `src/design/`, `data/`.

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
