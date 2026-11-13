# Journal des versions

## Non publié — phase 3, socle technique

Branche `claude/phase-3-socle`. Le site publié ne change pas tant que la branche n'est pas fusionnée.

- **3.1** Le code source (src/, scripts/, tests/, assets/, audit/) revient dans le dépôt ; `npm ci && npm run build` redonne exactement les fichiers publiés.
- **3.2** ESLint et axe-core dans le projet (`npm run lint`, `npm run test:a11y`), version de Node fixée (`.nvmrc`), README raccourci, ce journal des versions, CONTRIBUTING, `docs/ARCHITECTURE.md`, `docs/FONCTIONNALITES.md`, document de continuité. La construction ne supprime plus le dossier `docs/`.
- **3.3** Intégration continue sur GitHub : à chaque proposition de modification, construction, vérification que les fichiers publiés correspondent aux sources, contrôle du code, tests unitaires, parcours Chromium, contrat Open-Meteo simulé et réel, studio, accessibilité. Machines Ubuntu 24.04 (Playwright 1.56 ne prend pas en charge Ubuntu 26.04). Le contrat Open-Meteo vérifie ce qu'ECMWF fournit vraiment (le vent de comparaison). Premier passage entièrement vert le 6 novembre (commit 3c72fde).
- **3.4** Code rangé par couche : `src/app/` (coquille), `src/core/` (commun au bord et au bateau), `src/bord/`, `src/bateau/`, `src/design/`, et les fiches des sites dans `data/sites/`. Nouveau test `npm run test:layers` : le bord et le bateau ne s'importent jamais l'un l'autre. Composant inutilisé `ScoreArc` retiré. Fichiers publiés identiques octet pour octet (construction `b930d9512616`). Les chemins cités dans les versions ci-dessous sont les anciens.
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
