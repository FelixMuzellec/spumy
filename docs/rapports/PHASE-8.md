# SPUMY — Phase 8 : épreuve du moteur

18 novembre 2026 · Félix · version de référence : document Claude « SPUMY — Phase 8 : épreuve du moteur » (§LIEN§) · proposition de fusion n° 7 (brouillon)

Le moteur v2 a été éprouvé sur 252 vraies journées (36 par guide, choisies d'avance, toutes saisons), avec 1 000 tirages par journée. Le classement ne tient pas le critère de la spécification : les trois premiers ne restent les mêmes dans 80 % des tirages que sur 20 journées sur 241. Ce n'est pas une erreur de calcul. Les spots d'un guide sont souvent trop proches pour que l'incertitude des prévisions et des hypothèses les départage : sur 241 journées, le premier et le deuxième sont à 3 points ou moins 152 fois. Aucune hypothèse de niveau 4 ou 5 ne décide seule (la plus forte explique 21,4 % de la variance, sous le seuil de 30 %). Tes seuils de vent coûtent peu : 1 % des spots praticables passent « à vérifier » à cause d'eux seuls. Une correction est appliquée (les paliers de couleur) ; une autre a été essayée puis retirée, comme la règle fixée d'avance le demandait. Tu poses les questions à la fin, comme tu l'as demandé : je ne t'en pose aucune ici.

## 1. Objectif

Faire l'épreuve prévue par la spécification (§10) :
- journées de référence réelles, au moins 30 par guide, réparties sur l'année ;
- 1 000 tirages par journée et par guide, entrées perturbées selon leur incertitude, hypothèses selon leur niveau de preuve ;
- mesures : premier et trois premiers inchangés, palier de chaque spot, corrélation de rang, part de la variance de chaque hypothèse ;
- critères : trois premiers inchangés dans au moins 80 % des tirages ; une hypothèse de niveau 4 ou 5 qui explique plus de 30 % de la variance est signalée ;
- coût de la prudence (fréquence réelle des « à vérifier ») ;
- vérité terrain (ton journal) ;
- puis dire, pour chaque hypothèse, si elle est gardée, corrigée ou retirée.

## 2. Travail réalisé

| Lot | Ce qui a été fait | Statut |
| --- | --- | --- |
| 8.1 | 36 dates fixées d'avance (le 6, le 16 et le 26 de chaque mois, de fin novembre 2025 à mi-novembre 2026) et les trois jours de ton journal. Prévisions archivées d'Open-Meteo téléchargées par l'intégration continue (le réseau d'ici n'y accède pas), puis déposées dans la branche par une seconde tâche. Aucune journée en échec | TESTED |
| 8.2 | Monte Carlo : 1 000 tirages par journée et par guide ; deux passages de contrôle, entrées seules et hypothèses seules (300 tirages) | TESTED |
| 8.3 | Analyse des journées telles quelles : coût de la prudence, paliers, v1 et v2 sur de vraies journées, journal, qualité des données | TESTED |
| 8.4 | Paliers recalés (gardés). Lumière en rampe essayée : second passage de 1 000 tirages, retirée selon la règle fixée avant ce passage. Passage de contrôle du moteur livré | TESTED |
| 8.5 | Ce rapport, la liste des questions gardées, arrêt | IMPLEMENTED |

## 3. Livrables

| Livrable | Où |
| --- | --- |
| Dates des journées de référence | `data/epreuve/journees.json` |
| Journées archivées (prévisions AROME et ECMWF, vagues, eau) | `data/epreuve/archives/*.json.gz`, `RESUME.txt` ; passage d'intégration continue n° 44330704552 |
| Téléchargement par l'intégration continue | `.github/workflows/epreuve.yml`, `scripts/epreuve-fetch.mjs` (la tâche de dépôt dans la branche, à usage unique, a été retirée une fois les journées déposées) |
| Monte Carlo et synthèse | `scripts/epreuve-mc.mjs`, `scripts/epreuve-params.mjs`, `scripts/epreuve-synthese.mjs` |
| Analyse telle quelle | `scripts/epreuve-analyse.mjs` |
| Résultats bruts | `data/epreuve/resultats/` |
| Correction du moteur | `src/bord/engine/v2-params.js` (paliers) ; la rampe de lumière essayée dans `v2.js` et `core.js` est retirée |
| Verdicts des hypothèses | `data/knowledge/bar-bord.json` |
| Fiabilité du conseil (onglet Météo) | `src/bord/ui/tabs/Meteo.jsx` : dit ce que l'épreuve a mesuré pour la v2 |
| Suivi | `SPUMY_AUDIT_CONTINUITY.md`, `CHANGELOG.md`, `docs/FONCTIONNALITES.md` |

## 4. Preuves

Tous les chiffres viennent de fichiers du dépôt, recalculables sans réseau.

| Preuve | Commande ou passage | Résultat |
| --- | --- | --- |
| Journées archivées | intégration continue, « Épreuve du moteur », passage 44330704552 (1 h 12) | 7 guides × 39 journées ; `data/epreuve/archives/RESUME.txt` |
| Monte Carlo, moteur livré | `node scripts/epreuve-mc.mjs <journées> 1000 tout …` puis `scripts/epreuve-synthese.mjs` | `resultats/mc-v2-livre-1000-*.json` : identique au premier passage (`mc-v2-tout-1000-*`) pour les 252 journées-guides, 0 écart sur le premier, les trois premiers, les égalités, Spearman et l'écart au deuxième |
| Entrées seules, hypothèses seules | même script, modes `entrees` et `hypotheses`, 300 tirages | `resultats/mc-v2-entrees-300.json`, `mc-v2-hypotheses-300.json` |
| Rampe de lumière | même script, 1 000 tirages, moteur avec la rampe | `resultats/mc-v2-rampe-1000-*.json` |
| Journées telles quelles | `node scripts/epreuve-analyse.mjs <journées>` | `resultats/analyse-v2-livre.json` (moteur livré), `analyse-v2.json` (avant), `analyse-v2-rampe.json` |
| Moteur v2 : 16 scénarios et règles des trois scores | `npm run test:v2` | 51/51 (test des paliers mis aux nouvelles bornes) |
| Unitaires, 7 guides et fuseau d'Auckland | `npm run test:unit` | 2 953 contrôles pour les 7 guides, plus 437 à Auckland : tous verts |
| Parcours complets dans Chromium, servis sous `/spumy/` | `npm run test:e2e` | 843/843 |
| Mise à jour d'un téléphone depuis `main`, sous `/spumy/` | `npm run test:upgrade` | 12/12, dont : la copie hors ligne de `/guide-peche-bar/` n'est pas touchée |
| Accessibilité (axe-core) | `npm run test:a11y` | 0 violation |
| Données, connaissances, contrat Open-Meteo simulé, studio photo | `test:data`, `test:knowledge`, `test:contract`, `test:studio` | 69/69, 16/16, 28/28, 34/34 |
| Lint ; couches ; couleurs écrites en dur | `npm run lint`, `test:layers` | 0 erreur (1 avertissement, déjà là avant) ; 0 écart ; 291, comme avant |
| Intégration continue (proposition n° 7) | « Tests » et « Contrat Open-Meteo » (réel) | §CI§ |

Les tirages sont déterministes : même graine par guide et par journée. Le passage de contrôle refait le classement du premier passage au tirage près, ce qui vérifie que la rampe est bien retirée et que les paliers ne touchent pas au classement.

## 5. Résultats

### 5.1 Les données

| | Journées-guides | Part |
| --- | --- | --- |
| En tout (36 dates + 3 sessions du journal, 7 guides) | 252 | — |
| AROME (1,3 km) présent ; sinon ECMWF seul | 179 | 71,0 % |
| Vagues connues | 225 | 89,3 % |
| Température de l'eau connue | 178 | 70,6 % |
| Notées dans le Monte Carlo (au moins deux spots notés, hors sessions du journal) | 241 | — |

Les trous viennent des archives d'Open-Meteo (vagues et eau archivées moins longtemps que le vent), pas de l'application : au quotidien, la prévision du jour a ces données.

### 5.2 Le classement tient-il ?

Part des tirages où le classement ne bouge pas, moyenne sur 241 journées-guides. « À égalité près » : un spot à 3 points ou moins du premier compte comme premier, c'est la règle d'égalité de l'application.

| Mesure | Tout (moteur livré) | Entrées seules | Hypothèses seules |
| --- | --- | --- | --- |
| Premier spot inchangé | 54,3 % | 67,4 % | 66,1 % |
| … à égalité près | 75,9 % | 85,1 % | 85,2 % |
| Trois premiers inchangés | 35,9 % | 50,7 % | 53,3 % |
| … à égalité près | 66,8 % | 77,6 % | 81,6 % |
| Journées où les trois premiers tiennent dans 80 % des tirages | 20 sur 241 (84 à égalité près) | 49 (134) | 63 (157) |
| Corrélation de rang (Spearman) | 0,67 | 0,77 | 0,79 |

Les prévisions (entrées) et les hypothèses pèsent autant, et leurs effets s'ajoutent.

**L'écart au deuxième** décide de tout. Le premier ne tient dans 80 % des tirages que quand il a 10 points d'avance ou plus, et cela n'arrive que 23 journées sur 241.

| Écart entre le premier et le deuxième | Journées | Premier inchangé |
| --- | --- | --- |
| 0 point (à égalité parfaite) | 62 | 48 % |
| 1 à 2 points | 60 | 42 % |
| 3 à 4 points | 41 | 54 % |
| 5 à 6 points | 25 | 55 % |
| 7 à 9 points | 21 | 68 % |
| 10 à 14 points | 15 | 82 % |
| 15 points et plus | 8 | 87 % |

Les trois premiers ne tiennent jamais bien (41 % au mieux), même avec un premier très net : le troisième et le quatrième sont presque toujours proches.

Par guide (premier inchangé · trois premiers inchangés · Spearman) :

| Guide | Journées | Premier | Trois premiers | Spearman |
| --- | --- | --- | --- | --- |
| Rade de Brest (Logonna) | 36 | 47,9 % | 30,9 % | 0,72 |
| Cotentin ouest (Pirou) | 36 | 41,7 % | 27,0 % | 0,70 |
| Pays des Abers (Plouguerneau) | 29 | 54,4 % | 30,0 % | 0,55 |
| Cap Sizun (Audierne) | 32 | 59,4 % | 26,2 % | 0,57 |
| Baie de Morlaix (Carantec) | 36 | 63,0 % | 52,2 % | 0,77 |
| Cornouaille (Concarneau) | 36 | 48,0 % | 30,4 % | 0,64 |
| Crozon et Douarnenez | 36 | 66,5 % | 52,5 % | 0,70 |

### 5.3 Ce qui fait bouger la note

Part de la variance de la favorabilité (moyenne par spot et par journée). Aucune hypothèse de niveau 4 ou 5 ne dépasse le seuil de 30 %.

| Hypothèse ou entrée | Niveau | Part |
| --- | --- | --- |
| Facteurs de saison (dont l'abri d'hiver) | 4 | 21,4 % |
| Plage utile du coefficient (±10 points) | 4 | 21,0 % |
| Heures des fenêtres de marée (±30 min) | 4 | 11,0 % |
| Température de l'eau (±1 °C) | entrée | 6,5 % |
| Force du vent (±1 Beaufort, ou écart des modèles) | entrée | 5,3 % |
| Paliers de température de l'eau | 4 | 4,8 % |
| Poids de la fenêtre de marée (25 / 15) | 4 | 4,3 % |
| Poids de la lumière (25) | 4 | 3,9 % |
| Valeur de la nuit (15 sur 25) | 4 | 3,8 % |
| Valeur du plein jour (5 à 11 sur 25) | 4 | 3,6 % |
| Poids du vent et de la mer (30) | 4 | 3,5 % |
| Direction du vent (±1 secteur) | entrée | 3,2 % |
| Poids du coefficient (20) | 4 | 3,0 % |
| Amplitude du tableau vent et mer | 4 | 2,6 % |
| Heures de marée (±10 min) | entrée | 1,2 % |
| Houle (±25 %) | entrée | 0,9 % |

Ce qui change le plus souvent le premier spot n'est pas ce qui fait le plus varier la note : ce sont les heures des fenêtres de marée (corrélation 0,20 avec « premier changé »), puis la force du vent (0,14), sa direction (0,10), la plage du coefficient (0,09) et la houle (0,08). Une demi-heure de décalage fait entrer ou sortir un créneau de l'aube ou du crépuscule, et la lumière saute alors de 5 à 25 points.

### 5.4 Ce que coûte la prudence

Sur 2 376 spots-journées : 1 960 praticables (82,5 %), 416 non recommandés (17,5 %).

- **Tes seuils de vent** (à vérifier dès la force 6 ou 60 km/h de rafales) : 20 spots-journées sur 1 960 passent « à vérifier » à cause d'eux seuls, soit **1,0 %**. Ils comptent surtout en février (13 % des spots praticables ce mois-là).
- **« À vérifier »** en tout : 14,8 % des spots praticables. Raisons : houle inconnue (166, surtout les trous d'archive), houle au-dessus du maximum du spot (103), rafales de 60 à 74 km/h (45), force 6 (36), force 7 (3).
- **« Non recommandé »** : houle au-delà du maximum (298), houle inconnue sur un spot engagé (64), hors de tes heures (33), courant (15), nuit sur un spot engagé (6). Sur les 178 journées où les vagues sont connues partout : 16,8 % de non recommandés, 8,6 % d'« à vérifier ».
- Journées où le premier spot est « à vérifier » : 7,5 % ; sans aucun spot praticable : 1 journée sur 252.

### 5.5 Les paliers de couleur

Avec les paliers de la spécification (80, 65, 50, 35), le palier du bas n'apparaissait pas en saison (0,2 % des spots de mai à octobre). Recalés sur ces journées réelles à **75, 65, 55 et 45**, les cinq paliers apparaissent ; « favorable » reste à 65.

| Palier | Mai à octobre, tous spots praticables | Mai à octobre, premier du jour | Novembre à avril, tous |
| --- | --- | --- | --- |
| 75 et plus | 29,2 % | 67,5 % | 5,5 % |
| 65 à 74 | 36,2 % | 18,3 % | 12,1 % |
| 55 à 64 | 21,7 % | 9,5 % | 19,3 % |
| 45 à 54 | 10,1 % | 4,0 % | 25,1 % |
| moins de 45 | 2,9 % | 0,8 % | 38,0 % |

Favorabilité de mai à octobre : 10e centile 52, médiane 69, 90e centile 83. De novembre à avril : 34, 49, 70. Le palier d'un spot reste le même dans 56,1 % des tirages (60,9 % avec les anciens paliers, plus larges : des paliers plus fins changent plus souvent) des tirages.

### 5.6 La v1 et la v2 sur de vraies journées

Même premier spot 137 fois sur 251 (54,6 %) ; trois premiers en commun 72,1 %. Les deux moteurs ne disent pas la même chose une journée sur deux ; les 2 016 journées d'essai de la phase 7 donnaient le même ordre de grandeur (52,9 % et 71,2 %).

### 5.7 La vérité terrain : ton journal

Trois sessions, toutes à Moulin Mer (rade de Brest) :

| Date | Prises | Ressenti | Favorabilité (rang sur 11) | Confiance |
| --- | --- | --- | --- | --- |
| 27 déc. 2025, crépuscule 16 h 06 – 18 h 36 | 2 bars | 7/10 | 68 (1er) | 63 |
| 7 août 2026, crépuscule 21 h 36 – 23 h 00 | 0 | 1/10 | 84 (3e) | 48 |
| 8 août 2026, crépuscule 19 h 59 – 22 h 29 | 1 bar | 5/10 | 77 (2e) | 63 |

Les trois sessions vont à l'inverse de la favorabilité : la mieux notée n'a rien donné. Trois sessions ne permettent pas de conclure : un ordre exactement inversé arrive une fois sur six par hasard. Il en faut au moins 5 sur un spot, dont 2 avec prise, pour que le journal ajuste ce spot (spécification §8). Pour départager un critère (par exemple crépuscule contre plein jour), il faudrait de l'ordre de 40 sessions dans chaque situation, si le taux de sessions avec prise passe de 20 à 50 % (taux supposés, HYPOTHÈSE ; test à deux proportions, risque 5 %, puissance 80 %).

### 5.8 Hypothèses gardées, corrigées ou retirées

Le Monte Carlo dit ce qui fait bouger le classement, pas si c'est vrai. Aucune hypothèse ne change donc de niveau de preuve. Les verdicts sont écrits dans `data/knowledge/bar-bord.json`.

| Hypothèse | Verdict |
| --- | --- |
| Facteurs de saison, abri d'hiver (niveau 4) | Gardés : 21,4 %, la première source de variance, sous le seuil. À confronter au journal |
| Plage utile du coefficient (niveau 4) | Gardée : 21,0 %, sous le seuil. À confronter au journal |
| Fenêtres de marée, poids et heures | Gardées. Leurs heures font le plus souvent changer le premier spot : c'est une propriété de la lumière et de la marée, pas un défaut de calcul |
| Lumière basse, nuit, plein jour, ciel couvert | Gardés. **Rampe essayée puis retirée** : pour un créneau de plein jour qui mord sur l'aube ou le crépuscule, la note de lumière montait en rampe au lieu de sauter de 5 à 25 points. Règle fixée avant le passage : gardée si les trois premiers inchangés gagnaient au moins 2 points. Mesuré : +1,8 point (35,9 → 37,7 %), premier +1,4 point, à égalité près +3,5 points. Retirée |
| Paliers de température de l'eau | Gardés : 4,8 % |
| Vent et mer (poids, tableau) | Gardés : 3,5 % et 2,6 % |
| Paliers de favorabilité (80/65/50/35) | **Corrigés** : 75/65/55/45 |
| Tes seuils de vent | Gardés (ta décision) ; coût mesuré : 1,0 % |
| Houle maximale de chaque spot (niveau 4) | Gardée (sécurité). Première cause de « non recommandé » : valeurs à revoir avec toi |
| Égalité à 3 points | Gardée pour l'instant. L'épreuve montre qu'elle est trop étroite : sous 10 points d'écart, le premier change dans plus d'un tirage sur trois. À décider avec toi |

Dans l'onglet *Météo*, la carte « Fiabilité du conseil » le dit : avec la v2, le premier spot reste le même une fois sur deux environ, et à moins de 10 points d'écart, l'un vaut l'autre.

## 6. Problèmes et risques

1. **Critère de stabilité non tenu (FAILED).** Les trois premiers tiennent dans 80 % des tirages sur 20 journées sur 241 (84 à égalité près). Aucune correction de poids ne peut le faire passer sans vérité terrain : les spots sont proches, et l'incertitude est réelle. Il faut le dire à l'écran, ou élargir l'égalité (question 13).
2. **Sensibilité n'est pas preuve.** Une hypothèse qui pèse peu peut être fausse ; une qui pèse beaucoup peut être juste. Seul le journal tranchera, et trois sessions ne suffisent pas.
3. **Houle maximale.** Première cause de « non recommandé » (298 spots-journées) ; valeurs estimées par le guide, aucune mesurée.
4. **Trous d'archive.** La houle inconnue (166 « à vérifier ») vient surtout des archives, pas du quotidien. Les chiffres « à vérifier » sont donc un peu plus hauts qu'à l'usage.
5. **Les pastilles changent de couleur.** Avec les paliers recalés, un 76 passe au plus clair, un 52 au deuxième plus sombre.
6. **La v1 et la v2 diffèrent** une journée sur deux (54,6 % de même premier).
7. **Calcul long.** Un passage complet prend environ 25 minutes sur deux cœurs ; les tirages sont rejouables à l'identique (graines fixes).
8. **Mise en ligne.** Pages n'est pas activé sur `FelixMuzellec/spumy`, et l'API Pages m'est refusée : l'activation est à faire par toi (une seule case).

## 7. Critères d'acceptation

| Critère (spécification §10) | Résultat | Statut |
| --- | --- | --- |
| Au moins 30 journées réelles par guide, toutes saisons, choisies d'avance | 36 par guide (+ 3 du journal) | TESTED |
| 1 000 tirages par journée et par guide | 241 journées-guides notées × 1 000 | TESTED |
| Mesures : premier, trois premiers, palier, Spearman, part de variance | produites, par guide et en tout | TESTED |
| Trois premiers inchangés dans au moins 80 % des tirages | 20 journées sur 241 | FAILED |
| Aucune hypothèse de niveau 4 ou 5 au-dessus de 30 % de la variance | maximum 21,4 % | TESTED |
| Coût de la prudence mesuré | 1,0 % dû à tes seuils seuls | TESTED |
| Vérité terrain | 3 sessions : trop peu pour conclure | INCONNU |
| Hypothèses gardées, corrigées ou retirées | tableau 5.8, verdicts dans la base | TESTED |
| Tests de l'application | toutes les suites vertes ici ; sur GitHub : §CI§ | §CIS§ |

## 8. Décisions attendues

Tu as demandé de garder toutes les questions pour les traiter ensemble quand toutes les étapes seront faites. Elles sont tenues dans `SPUMY_AUDIT_CONTINUITY.md` ; je ne t'en pose aucune maintenant.

Questions gardées, à traiter ensemble :

1. Fusion des phases 5 à 8 dans `main`. Lue comme accordée par ta consigne du 18 nov. au soir (« Transfert tous les fichiers sur https://github.com/FelixMuzellec/spumy ») : faite après ce rapport, tests verts.
2. Activation de GitHub Pages : *Settings → Pages → Deploy from a branch → `main` / (root)*.
3. Inventaire de ta boîte (la boîte actuelle reste provisoire).
4. Trajet maximal (45 min par défaut).
5. Vigilance Météo-France : source à brancher ou non.
6. Isolement de Mousterlin, Agon et Sciotot.
7. Écart S12 (abri à 0,6 entre 7,5 et 9,5 °C).
8. Filtre de sécurité commun aux deux moteurs.
9. Historique de sorties réelles pour la référence.
10. Restes de la phase 5.
11. Houle maximale de chaque spot : la revoir spot par spot.
12. Paliers 75/65/55/45 : les garder.
13. Égalité à 3 points : la garder, ou annoncer l'égalité jusqu'à 10 points.
14. Rampe de lumière : retirée selon la règle ; la reprendre si tu préfères le gain « à égalité près ».
15. Dépôt de sauvegarde par défaut du journal : `FelixMuzellec/spumy-journal`.

## 9. Prochaine phase proposée, et arrêt

**Phase 9 : BATEAU — conception** (feuille de route : phases 9, 10 et 13 pour le mode BATEAU).
- Audit du mode BATEAU tel qu'il est (spots, conditions, sorties, modèle empirique).
- Sécurité en mer, séparée de celle du bord.
- Spécification du moteur par espèce, sans code, à valider comme celle du BORD.

**STOP.** J'attends ta réponse « `APPROVED — PROCEED TO PHASE 9` ». D'ici là, rien n'est fusionné dans `main` sans ton accord, et la v1 reste disponible dans les réglages.
