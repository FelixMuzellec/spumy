# SPUMY — où et quand pêcher le bar aux leurres

SPUMY est une application web pour la pêche du bar aux leurres du bord, avec un accueil, sept guides (66 spots) et la pêche en bateau toutes espèces. Elle répond à une question : **où et quand aller pêcher, et avec quoi**, en disant ce qu'elle sait, ce qu'elle ne sait pas, et ce qui relève de la sécurité.

**Finistère (29)**, du nord au sud :
- **Carantec** (baie de Morlaix et Haut-Léon) : 7 spots, de la baie du Kernic à Locquirec → `carantec.html`
- **Plouguerneau** (Pays des Abers) : 10 spots, des abers au Conquet → `plouguerneau.html`
- **Logonna-Daoulas** (rade de Brest) : 11 spots, du fond de rade au goulet → `logonna.html`
- **Crozon** (presqu'île de Crozon et baie de Douarnenez) : 7 spots, de la pointe de Dinan à la pointe de Trénaouret → `crozon.html`
- **Audierne** (Cap Sizun et baie d'Audierne) : 11 spots, de la pointe du Raz à la pointe de Penmarc'h → `audierne.html`
- **Concarneau** (Cornouaille) : 10 spots, de l'Odet à la Laïta → `concarneau.html`

**Manche (50)** :
- **Pirou Plage** (côte ouest du Cotentin) : 10 spots, de Granville à Goury → `pirou.html`

Les sept guides n'ont aucun spot en commun (Logonna garde la rade, le goulet et Crozon) et utilisent exactement le même moteur ; seul le fichier de configuration du lieu change.

Version 9.2 (le numéro et l'identifiant de construction sont affichés en bas de l'accueil : c'est la façon de vérifier qu'un dépôt est bien en ligne).

Elle s'ouvre dans le navigateur du téléphone et s'installe sur l'écran d'accueil comme **une seule application** : l'accueil et les sept guides partagent le même manifeste (`manifest.json`). Installée depuis n'importe laquelle des huit pages, c'est la même application ; elle s'ouvre sur l'accueil, et le titre de chaque guide (« ‹ SPUMY · … ») y ramène. Sur Android, un appui long sur l'icône propose des raccourcis vers les trois premiers guides : Chrome pour Android n'en affiche pas plus de trois ([web.dev](https://web.dev/articles/app-shortcuts)). L'accueil affiche un bouton « Installer l'application » quand Chrome le permet, et l'aide pas à pas (Android, iPhone) sinon.

Une fois ouverte, elle fonctionne hors ligne : l'accueil et les sept guides sont mis en cache dès la première visite (recherche comprise), la marée est calculée sur l'appareil, et la dernière météo téléchargée reste affichée.

Adresse de publication prévue : GitHub Pages de ce dépôt (*Settings → Pages*). Au 13 novembre 2026, Pages n'y est pas activé (API GitHub) : fusionner dans `main` ne met donc rien en ligne tant qu'il ne l'est pas. L'ancienne adresse du projet était <https://felixmuzellec.github.io/guide-peche-bar/>.

## État des fonctionnalités

État réel au 6 novembre 2026, d'après l'audit de la phase 1 (application exécutée et testée).

| Fonction | État | Limites connues |
| --- | --- | --- |
| BORD : décision, carte, fiches, matériel, journal, marée, météo, saison, règles, photos, mode terrain | Fonctionne ; 3 182 vérifications unitaires et 775 de parcours au vert | Note sur 10 (trois scores sur 100 prévus) ; la sécurité ne retire un spot que pour la houle ; une houle inconnue compte comme 0 m ; une prise non saisie est enregistrée « 0 » |
| BATEAU (onglet Offshore de l'accueil) | Carnet de spots et de sorties ; note empirique après 8 sorties | Pas encore de logique par espèce ni de sécurité bateau |
| Hors ligne | Fonctionne ; la dernière météo s'affiche avec son âge | Pas de fond de carte hors ligne (interdit par OpenStreetMap) |
| Sauvegarde GitHub, analyse photo | Testées contre des services simulés | Pas d'essai automatique contre les vrais services |

Ces limites sont traitées dans les phases suivantes (voir la feuille de route).

## Démarrer

```bash
npm ci                    # Node 20 ou plus (.nvmrc : 22)
npm run build             # construit le site à la racine depuis src/ et data/
npm test                  # contrôle du code, règles de couches, fiches des sites, connaissances halieutiques, tests unitaires, parcours Chromium, contrat Open-Meteo simulé
npm run test:a11y         # accessibilité (axe-core) sur toutes les pages
npm run test:studio       # page d'analyse photo par l'abonnement Claude, avec un Claude simulé
npm run test:upgrade      # mise à jour d'un téléphone : version publiée (main) → cette version, données et hors ligne
npm run test:knowledge    # connaissances halieutiques : niveaux de preuve, sources, rubriques des 66 spots
npm run test:contract     # contrat avec le vrai Open-Meteo (réseau)
```

Sur une machine neuve, installer Chromium pour Playwright une fois : `npx playwright install chromium`.

## Arborescence

```
src/       code source : coquille (app/), socle commun (core/), pêche du bord (bord/), pêche en bateau (bateau/),
           style commun (design/), studio photo (studio/)
data/      fiches des 7 sites (sites/), connaissances halieutiques et niveaux de preuve (knowledge/), schémas (schema/)
scripts/   construction du site, icônes, studio
tests/     tests unitaires, parcours, contrat Open-Meteo, accessibilité, studio
assets/    images sources (logos, icônes)
audit/     audit de la v9.1, note UX de la v9.2
docs/      architecture, fonctionnalités détaillées
racine     site compilé (*.html, app.js, fiches *.json, sw.js, manifest.json, icônes), publié tel quel par GitHub Pages
```

Le détail est dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Publication sur GitHub Pages

Settings → Pages → *Deploy from a branch* → Branch `main`, dossier `/ (root)` → Save.

Mettre le site à jour depuis le téléphone : *Add file → Upload files* à la racine du dépôt, avec les 29 fichiers du site
(`index.html`, `app.js`, `logonna.html`, `pirou.html`, `plouguerneau.html`, `audierne.html`, `carantec.html`, `concarneau.html`, `crozon.html`, `logonna.json`, `pirou.json`, `plouguerneau.json`, `audierne.json`, `carantec.json`, `concarneau.json`, `crozon.json`, `manifest.json`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`, `apple-touch-icon.png`, `logonna.png`, `pirou.png`, `plouguerneau.png`, `audierne.png`, `carantec.png`, `concarneau.png`, `crozon.png`, `sw.js`).
L'identifiant de construction est l'empreinte de tous les fichiers servis : le moindre changement change le cache hors ligne, et la copie hors ligne est toujours relue sur le serveur (jamais dans le cache HTTP du navigateur).
Ne jamais déposer un fichier de `src/` à la racine. Après un dépôt, vérifier qu'aucun doublon « (1) », « (2) » n'a été créé, puis que le bas de l'accueil affiche la nouvelle version.
Depuis la v8.4, `logonna-manifest.json` et `pirou-manifest.json` ne servent plus ; depuis le lot 3.5, `home.js` non plus (remplacé par `app.js`) : ils peuvent être supprimés du dépôt (les laisser ne gêne rien).

## Sécurité et confidentialité

- **Politique de sécurité du contenu (CSP)** dans chaque page : seul `app.js`, fichier du site lui-même (`'self'`), s'exécute ; les pages des guides n'ont aucun script en ligne, l'accueil n'en a qu'un, autorisé par son empreinte SHA-256 (calculée à la construction). Un script injecté ne s'exécute pas. L'accueil ne se connecte qu'à Open-Meteo et (v8.15, sauvegarde des sorties en bateau) à l'API GitHub. Les connexions sont limitées à Open-Meteo, à l'API GitHub (journal) et à l'API d'Anthropic (photos) ; les images aux tuiles OpenStreetMap. Un test de bout en bout vérifie qu'une injection est bloquée, qu'un envoi vers un domaine inconnu l'est aussi, et qu'aucun parcours normal ne déclenche de violation.
- La clé API Anthropic et le jeton GitHub restent sur l'appareil et ne partent que vers leur service. Depuis le lot 3.8, la clé API n'est gardée que le temps de la session (oubliée à la fermeture de l'application), sauf si tu coches « Garder la clé sur ce téléphone ». La sauvegarde GitHub refuse d'écrire dans un dépôt public. Le jeton GitHub conseillé est limité au seul dépôt du journal ; ne mets qu'un petit crédit sur la clé API.
- **Origine partagée** : le stockage du navigateur appartient à l'origine `felixmuzellec.github.io`, commune à **tous** les sites GitHub Pages du compte. Une autre page publiée sur ce compte pourrait lire la clé et le jeton. Ne publie sur ce compte que des pages de confiance (ou garde le jeton à portée minimale, comme indiqué plus bas).
- Une entrée de journal reçue de GitHub ou importée est nettoyée champ par champ avant usage (types, identifiants, heure) ; si l'affichage plante malgré tout, un écran de secours permet d'exporter le journal brut, de couper la sauvegarde GitHub et de recharger.
- Les fiches des spots et le catalogue des leurres ne sont jamais modifiés en place : les corrections faites sur le terrain produisent de nouvelles données (les tests gèlent les originaux pour le garantir).
- Construction : esbuild 0.28 (correctif GHSA-67mh-4wv8-2f99) ; cible minimale Safari 15 (iOS 15), esbuild ne produisant plus de code sûr pour Safari 13 et 14.
- **Services contactés** : Open-Meteo (coordonnées des spots, y compris ceux que tu ajoutes), OpenStreetMap (tuiles de la carte affichée), GitHub (seulement si tu actives la sauvegarde du journal), Anthropic (seulement si tu analyses une photo avec ta clé). SPUMY n'a pas de serveur et ne collecte rien.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : organisation du code, architecture actuelle et cible.
- [docs/FONCTIONNALITES.md](docs/FONCTIONNALITES.md) : ce que fait chaque écran, l'analyse photo, la sauvegarde du journal.
- [CHANGELOG.md](CHANGELOG.md) : ce qui change à chaque version.
- [CONTRIBUTING.md](CONTRIBUTING.md) : comment proposer une modification.
- [SPUMY_AUDIT_CONTINUITY.md](SPUMY_AUDIT_CONTINUITY.md) : état du chantier en cours (audit et refonte).
- [audit/](audit/) : audits et notes de conception.

## Feuille de route

1. Phases 1 et 2 (faites) : audit de l'existant, architecture cible.
2. Phase 3 (en cours) : socle technique — code dans le dépôt, tests automatiques, réorganisation, application unique, données des sites, jetons de design, sécurité rapide.
3. Phases 4 à 8 : BORD — audit approfondi, audit halieutique, moteur à trois scores sur 100 avec sécurité bloquante, mise en œuvre, stabilisation.
4. Phases 9, 10 et 13 : BATEAU — conception, moteur par espèce, développement.
5. Phase 11 : direction artistique et écrans ; phase 12 : spécifications.
6. Phases 14 à 17 : journal et hors ligne, sécurité et réglementation, recette complète, audit final.

## Données, sources et licences

- Météo : [Open-Meteo.com](https://open-meteo.com/), CC BY 4.0. Modèles Météo-France (AROME) et ECMWF.
- Marée : constantes harmoniques TICON-4 (CC BY 4.0, via @neaps/tide-database). Algorithme porté de Neaps (@neaps/tide-predictor, MIT).
- Carte : [Leaflet](https://leafletjs.com/) (BSD-2-Clause), fond © [contributeurs OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL).
- Biologie du bar : Ifremer, [synthèse des marquages d'adultes (Bargip)](https://bar.ifremer.fr/content/download/116111/file/4PagesMarquageAdultes_Final-3.pdf).
- Réglementation : [arrêté du 1er avril 2026 réglementant la pêche de loisir du bar européen](https://www.locquirec.bzh/wp-content/uploads/2026/04/Arrete-du-1er-avril-2026-Bar-loisir.pdf) (JO du 9/04/2026) ; [peche.com, quotas 2026](https://www.peche.com/article/50915/les-quotas-bars-et-lieus-2026-pour-les-pecheurs-de-loisir) ; [Boatcible, règles 2026](https://boatcible.com/2026/07/02/peche-de-loisir-2026-regles-essentielles/) ; [ministère de la Mer](https://www.mer.gouv.fr/peche-de-loisir-en-mer).
- Remise à l'eau : [peche.com, « Comment relâcher un poisson ? »](https://www.peche.com/article/32998/comment-relacher-un-poisson-pratiquez-le-no-kill-correctement).
- Conseil leurres : peche.com ([couleurs selon l'eau et la météo](https://www.peche.com/article/52017/peche-aux-leurres-quelle-couleur-choisir-selon-l-eau-et-la-meteo), [coloris favoris](https://www.peche.com/article/47815/mes-coloris-favoris-de-leurres-souples-pour-la-peche-du-bar-en-mer), [début de saison](https://www.peche.com/article/48479/peche-au-bar-en-debut-de-saison-choisir-la-bonne-couleur-de-leurre-souple), [nuit](https://www.peche.com/article/49585/5-leurres-souples-pour-pecher-le-bar-de-nuit-en-ete), [stickbait](https://www.peche.com/article/47337/stickbait-le-leurre-qui-fait-fondre-les-bars-en-surface), [vagues](https://www.peche.com/article/37249/la-peche-du-bar-dans-les-vagues-des-conditions-difficiles-souvent-payantes), [conseils en mer](https://www.peche.com/article/52087/peche-aux-leurres-en-mer-les-conseils-essentiels-pour-bien-debuter), [automne](https://www.peche.com/article/46921/comment-cibler-les-bars-du-bord-en-automne), [saisons](https://www.peche.com/article/32987/la-peche-du-bar-en-fonction-des-saisons)) ; [Le Figaro Nautisme, ouverture](https://figaronautisme.meteoconsult.fr/actus-nautisme-loisirs/2026-02-23/85977-peche-au-bar-a-louverture-bien-choisir-ses-leurres-souples-pour-demarrer-la-saison) ; tes propres notes de coloris. Grammage : [peche.com, T. Cendrier (2024)](https://www.peche.com/article/34833/quel-grammage-de-tete-plombee-faut-il-utiliser-pour-la-peche-du-bar), [Les Bredouilleurs](https://lesbredouilleurs.com/blogs/infos/comment-choisir-le-grammage-de-sa-tete-plombee-pour-la-peche-en-mer). Courant : [règle des douzièmes (peche.com)](https://peche.com/article/43574/comprendre-et-calculer-les-niveaux-des-marees-avec-la-regle-des-douziemes), [atlas des courants du SHOM (bateaux.com)](https://www.bateaux.com/article/34870/decouvrir-la-carte-des-courants-de-maree). Fiches techniques : [Fiiish](https://fiiish.com/produits/leurres-souples/black-minnow/), Nootica, Leurre de la pêche, Spécialiste Leurres, Rokmax (liens dans l'onglet Leurres).
- Landévennec et Térénez : [peche-poissons.com, « Escapade en rade de Brest, autour de Landévennec »](https://peche-poissons.com/mer/mer-coins-de-peche-en-france-escapade-en-rade-de-brest-autour-de-landevennec-693207-php/) (julien, 30/03/2022 ; photos Thierry Sauvin).
- Finistère (Plouguerneau, Audierne) : mieuxpecher.com (Norbert, « Top 10 » Bretagne 2018-2020 et coins de pêche du Finistère nord) ; peche-poissons.com (J.-B. Vidal, « Bar en Bretagne », 19/10/2026 ; « Au leurre, à la pointe du Raz » avec le guide Yves Pennanen, 17/12/2021) ; Pêche-Rando Bar (guide du Cap Sizun, bilans 2016-2020) ; cannes-peche.blog4ever.com (2016) ; lechasseursousmarin.com (Brézellec, 2025) ; [Le Figaro Nautisme, spots de Bretagne (28/03/2026)](https://figaronautisme.meteoconsult.fr/actus-nautisme-loisirs/2026-03-28/86935-les-spots-de-peche-en-mer-les-plus-reputes-de-bretagne) ; [bateaux.com, Raz de Sein (2025)](https://www.bateaux.com/article/32097/le-raz-de-sein-les-bons-conseils-pour-ce-passage-delicat) ; inventaire du patrimoine (patrimoine.bzh, ports-abris de Feunteun Aod et Brézellec) ; office de tourisme du Pays bigouden (lame de fond de 1870 à Saint-Guénolé) ; Wikipédia (positions des pointes) ; visorando, surf-report (accès, fonds de sable, baïnes). Tables de marée de contrôle : SHOM, via les tables mensuelles publiées par Météo Consult.
- Baie de Morlaix (Carantec) : [office de tourisme de la baie de Morlaix, « La pêche du bord de mer »](https://www.baiedemorlaix.bzh/fr/s-inspirer/spots-peche-bord-de-mer/) (conseils d'un pêcheur de Plougasnou) et [« La pêche au bar avec un guide pêche »](https://www.baiedemorlaix.bzh/fr/s-inspirer/la-peche-au-bar-avec-un-guide-peche/) ; [Pesketa, guide de pêche à Morlaix](https://pesketa.com/index.php/peche-du-bar-au-leurre/) ; [sport-decouverte, pêche du bar à Carantec](https://www.sport-decouverte.com/peche-sportive-carantec.html) ; [mieuxpecher, Finistère nord](https://mieuxpecher.com/finistere-nord-coins-de-peche/) ; [J.-B. Vidal, peche-poissons.com (19/10/2026)](https://peche-poissons.com/mer/peche-bar-bretagne/) ; inventaire du patrimoine (patrimoine.bzh), visorando, tourismebretagne, oblyk, sea-seek, mondo.surf (terrain, accès, coordonnées). Tables de marée de contrôle : SHOM, via Météo Consult.
- Cornouaille (Concarneau) : [mieuxpecher, Finistère sud](https://mieuxpecher.com/finistere-sud-coins-de-peche/) (Cap Coz, Beg Meil, Mousterlin, l'Odet, Kerjean, Rospico, Aven et Bélon, Laïta) ; cannes-peche.blog4ever.com (Sables Blancs, Cap Coz, Trévignon, Kerjean) ; chtipecheur.com (Cap Coz, Beg Meil, Mousterlin) ; carnet-de-peche.com (Cap Coz, Mousterlin) ; atout-pecheur.fr (Trévignon) ; ultimate-fishing.net (N. Cadiou, « Pêche du bar sur l'estuaire de l'Odet, un challenge », 2023) ; apppcc.jimdofree.com (embouchure de la Laïta) ; office de tourisme de Concarneau à Pont-Aven (deconcarneauapontaven.com, « Les trois univers pêche ») ; Lorient Bretagne Sud Tourisme (courants du chenal du Bas Pouldu) ; [J.-B. Vidal, peche-poissons.com (19/10/2026)](https://peche-poissons.com/mer/peche-bar-bretagne/) ; tourismebretagne, coastalwiki, fishipedia, visorando, plages.tv, navship (terrain, accès, positions). Non retenus faute de deux sources ou d'une position : pointe de la Jument, Cabellou, Loctudy, Île-Tudy, Lesconil, Guilvinec, Raguénez, baie de Kerogan.
- Presqu'île de Crozon et baie de Douarnenez (Crozon, v8.10) : [mieuxpecher, Finistère nord](https://mieuxpecher.com/finistere-nord-coins-de-peche/) (Norbert, 2018 : château de Dinan, Lostmarc'h, pointe et port de Morgat, port de Douarnenez, pointe de Leydé, pointe de Trénaouret « en début de montante ») ; [carnet-de-peche.com, pointe de Dinan](https://www.carnet-de-peche.com/spots/pointe-de-dinan) ; [carnalor.com, forum « crozon rade de brest »](https://www.carnalor.com/t10050-crozon-rade-de-brest) (Guy535, 2012) ; [lechasseursousmarin.com](https://www.lechasseursousmarin.com/departements/finistere/) (pointes de Dinan, de Morgat et de Luguénez, 2025) ; [pecheaubar.com, « La Pêche au bar en Bretagne : Douarnenez »](https://pecheaubar.com/peche-au-bar-en-bretagne-douarnenez/) ; [chtipecheur.com, « Spots de pêche de Bretagne »](https://www.chtipecheur.com/post/Bretagne-spots-de-peche-balades-1298) ; [Breizh pêche 29, « Coup du soir en baie de Douarnenez »](https://guidedepechemeretriviere.over-blog.com/article-30888929.html) (G. Rognant, 2009) ; [J.-B. Vidal, peche-poissons.com (19/10/2026)](https://peche-poissons.com/mer/peche-bar-bretagne/) ; réserve naturelle de la presqu'île de Crozon (fiche Lostmarc'h : pêche autorisée) ; CNCM, « Les sentiers de Morgat » ; visorando ; plages.tv ; surf-forecast ; Google Maps (positions). Trois fiches n'ont qu'une source de pêche et le disent (Lostmarc'h, Leydé, Trénaouret). Non retenus : cap de la Chèvre (« pas très accessible et pas de fond », carnalor), pointe de Saint-Hernot (fermée aux piétons, visorando), port du Rosmeur (pêche à l'appât dans les sources), île de l'Aber, plages du Ris et de Trezmalaouen (une seule source). Tables de marée de contrôle : SHOM, via Météo Consult.
- Baie du Kernic (Carantec, Haut-Léon) : cannes-peche.blog4ever.com (baie du Kernic et grande plage de Ker Emma), atout-pecheur.fr (plage de Plounévez-Lochrist), office de tourisme de Roscoff (« Plouescat grandeur nature ») ; une seule source parle du bar : la fiche le signale.
- Règles générales de marée (« 3 premières heures de montante, 3 dernières de descendante », coefficients 50 à 80) : J.-B. Vidal les donne comme des règles générales (« les phases de marée […] vont dépendre de chaque coin ») ; chaque fiche les signale comme telles quand aucune source locale ne les précise.
- Pointe de Penmarc'h (Audierne) : [Le Figaro Nautisme, Top 10 (01/03/2026)](https://figaronautisme.meteoconsult.fr/actus-nautisme-loisirs/2026-03-01/78013-top-10-des-spots-de-peche-en-mer-en-france-metropolitaine), [mieuxpecher, Finistère sud](https://mieuxpecher.com/finistere-sud-coins-de-peche/), [carnet-de-peche.com](https://www.carnet-de-peche.com/spots/pointe-de-penmarch). Kermorvan et Blancs-Sablons (Plouguerneau) : mieuxpecher, [patrimoine-iroise.fr (phare de Kermorvan)](https://www.patrimoine-iroise.fr/culturel/maritime/Phare-Kermorvan), atout-pecheur, office de tourisme Iroise Bretagne, fishipedia.
- Sources propres à chaque spot : dans sa fiche (onglet Spots → fiche → Sources). Ce qu'aucune source ne dit (orientation, profondeur, une partie des postes) est marqué « déduit » dans la fiche.
