# SPUMY — Phase 7 : moteur BORD v2

18 novembre 2026 · Félix · version de référence : document Claude « SPUMY — Phase 7 : moteur BORD v2 » (https://claude.ai/artifact/5VVWp9Z3HfSvn72Uy3Ztwo) · proposition de fusion n° 6 (brouillon)

Le moteur v2 de la spécification que tu as validée le 18 novembre est en place, à côté de la v1. Il donne trois scores sur 100, jamais fusionnés : favorabilité, pertinence et confiance. Le filtre de sécurité de la spécification est commun aux deux moteurs. La v2 est le moteur par défaut. Tant que la phase 8 ne l'a pas validée, *Réglages → Moteur de notes* ramène la note sur 10.

## 1. Objectif

Implémenter `docs/SPEC-MOTEUR-BORD-V2.md` :
- le filtre de sécurité (lot 7.2) ;
- les trois scores, comparés à la v1 sur les mêmes journées, avec un réglage pour revenir à la v1 (lot 7.1) ;
- les pastilles et l'affichage des niveaux de preuve ;
- le conseil tiré de ta boîte ;
- les 16 scénarios en tests.

## 2. Travail réalisé

| Lot | Ce qui a été fait | Statut |
| --- | --- | --- |
| 7.0 | Branche `claude/phase-7-moteur-v2`, partie de la phase 6 avec `main` fusionnée. L'ancien test de migration v8.15, remplacé par le transfert de toutes les données, est retiré comme dans `main` | TESTED |
| 7.2 | Filtre de sécurité de la spécification, commun aux deux moteurs | TESTED |
| 7.1 | Moteur v2 : trois scores, classement, réglage v1/v2, comparaison sur les mêmes journées | TESTED |
| 7.3 | Pastilles, trois scores décomposés à l'écran, niveaux de preuve dans la fiche, meilleurs leurres de ta boîte | TESTED |
| 7.4 | 16 scénarios en tests, parcours, accessibilité, captures relues | TESTED |
| 7.5 | Ce rapport, tes questions une par une, arrêt | IMPLEMENTED |

## 3. Livrables

| Livrable | Où |
| --- | --- |
| Filtre de sécurité (`windowSafety`, vigilance) | `src/bord/engine/safety.js` |
| Moteur v2 | `src/bord/engine/v2.js`, valeurs de départ dans `src/bord/engine/v2-params.js` |
| Échelles v1 et v2, réglage du moteur | `src/core/scale.js` |
| Écran : notes, pastilles, trois scores | `src/bord/ui/note.jsx`, `src/bord/ui/Scores.jsx`, `Pastille` et `ScoreRing` dans `src/design/components.jsx`, cinq bleus dans `src/design/tokens.js` |
| Réglages → Moteur de notes | `src/app/EnginePanel.jsx` |
| Niveaux de preuve lus par le moteur | `data/knowledge/preuves-niveaux.json`, extrait de `preuves-spots.json` et contrôlé par `test:knowledge` |
| Isolement par la marée | consigne `isolement` dans le schéma des fiches ; Térénez marqué |
| Tests | `tests/v2.mjs`, `tests/compare-v1v2.mjs`, `tests/e2e.mjs`, `tests/unit.mjs`, `tests/scenarios.mjs` |
| Suivi | `SPUMY_AUDIT_CONTINUITY.md`, `CHANGELOG.md`, `docs/FONCTIONNALITES.md` |

## 4. Preuves

| Mesure | Résultat |
| --- | --- |
| Les 16 scénarios de la spécification et les règles des trois scores (`npm run test:v2`) | 51/51 |
| Unitaires (7 guides et fuseau d'Auckland) | tous verts (2 953 contrôles pour les 7 guides, plus Auckland) |
| Parcours complets dans Chromium | 843/843, dont le nouveau parcours « Moteur de notes » : v2 → v1 → v2, boîte complète, niveaux de preuve |
| Grille de sécurité : 66 spots × 1 120 météos, plus « sans météo », soit 73 986 cas, avant et après le lot 7.2 | danger annoncé : 0 cas proposé ; 12 672 cas passent « à vérifier » (seuils de Félix, houle juste au-dessus du maximum) ; 0 cas au vert sans météo |
| Comparaison v1 / v2 : 2 016 journées d'essai (7 guides × 12 mois × 24 météos) | même premier spot 52,9 % ; trois premiers en commun 71,2 % ; corrélation de rang 0,67 |
| Accessibilité (axe-core, guides, accueil, réglages ouverts, plein soleil) | 0 violation |
| Mise à jour d'un téléphone depuis `main` | 11/11 |
| Données, connaissances, contrat Open-Meteo simulé, studio photo | 69/69 · 16/16 · 28/28 · 34/34 |
| Captures relues, v1 et v2 | décision, carte du guide, fiche (terrain), accueil, réglages |

> Lint : 0 erreur. Couches : 0 écart ; couleurs écrites en dur hors du design : 291, comme avant (le compte ne peut que baisser).

## 5. Résultats

### Sécurité

Ce filtre est commun aux deux moteurs : revenir à la note sur 10 ne ramène pas les anciens seuils.

**À vérifier** :
- vent de force 6 ou 7 ;
- rafales de 60 km/h et plus (tes seuils) ;
- houle jusqu'à 0,5 m au-dessus du maximum du spot. La v1 cachait ce dépassement dans une pénalité de la note.

**Non recommandé** :
- nuit sur un spot engagé ;
- retour coupé par la marée. Le mécanisme se règle dans la fiche ; seul Térénez au-delà de 85 est marqué ;
- houle au-delà du maximum plus 0,5 m (dès le maximum sur un spot engagé).

La **vigilance Météo-France** n'est pas lue (INCONNU). L'écran de sécurité le dit à part des consignes de la fiche, avec le lien.

### Trois scores sur 100

Chacun se décompose à l'écran. Exemple réel des captures : « Favorabilité 80 = conditions 80 (marée 35/45, lumière 15/25, vent et mer 30/30) × présence 1 ».

- **Favorabilité** :
    - un critère dont la donnée manque sort du calcul ; la note dit sur quelle part elle est calculée ;
    - sous la moitié des critères, pas de note ;
    - sans météo : marée et lumière seules, 70 % des critères, confiance faible.
- **Pertinence** :
    - calculée sur la boîte enregistrée dans SPUMY ;
    - elle donne les trois meilleurs leurres de ta boîte pour le créneau et ce qui y manque, par exemple « il te manque une tête d'au moins 20 g pour ce courant » ;
    - elle reste **provisoire**, sans changer le classement, tant que tu n'as pas coché « Ma boîte est l'inventaire complet ».
- **Confiance** : haute, moyenne ou faible ; elle ne change jamais le rang (scénario S15).

### Pastilles

- Cinq bleus d'une seule teinte, le plus clair à 80 et plus. La rampe a été contrôlée : luminosité croissante, écarts visibles, palier le plus sombre à 2,2:1 sur le fond.
- « À vérifier » : contour pointillé orange et « ? ».
- Non recommandé : gris barré.
- Pas de note : disque vide.
- Plus aucun vert, ni sur la carte du guide, ni sur l'accueil, ni dans les listes.

### Ce qui change entre la v1 et la v2

Sur 2 016 journées d'essai, le premier spot change dans 47 % des cas :
- dans 58 % de ces cas, les deux spots sont à égalité dans la v2 (3 points ou moins) ;
- première cause, 49 % : le vent et la mer pèsent bien plus dans la v2. Ils valent 30 points, et il y a 15 points d'écart entre le calme plat et un vent de mer de force 3 sur un spot exposé ; dans la v1, ce terme valait au plus +0,5 sur 10 ;
- deuxième cause, 26 % : l'ensemble de météos plausibles de la v1 (±1 Beaufort, ±1 secteur), qui n'existe pas dans la v2 ;
- autres causes : le meilleur créneau n'est pas le même (13 %), la marée (11 %), la lumière, la pression retirée (moins de 1 %).

## 6. Problèmes et risques

1. **Le poids du vent et de la mer** décide de la moitié des changements de premier spot. Les valeurs du tableau sont des hypothèses (niveau 4). La phase 8 doit les éprouver en premier.
2. **Journées d'essai, pas de vraies journées.** La comparaison utilise une météo fixe sur la journée et une température d'eau de saison estimée. Les journées archivées d'Open-Meteo viendront en phase 8.
3. **Un écart à la spécification**, pour tenir le scénario S12. En abri, la présence est portée à 0,6 entre 7,5 et 9,5 °C, et pas seulement à 0,5 sous 7,5 °C : avec le plancher seul, rade et côte ouverte étaient à égalité à 8 °C. C'est une question pour toi.
4. **Ta boîte.** L'inventaire complet n'est pas encore reçu : la pertinence est provisoire. Le temps de trajet maximal est réglé à 45 minutes par défaut ; à Logonna, des spots sont à 75 minutes.
5. **Vigilance Météo-France.**
    - La source officielle, l'API « Données publiques Vigilance », est gratuite mais demande un compte sur portail-api.meteofrance.fr.
    - Une clé ne peut pas vivre dans une page publique. Il faudrait une tâche GitHub qui la lit avec un secret et publie le résultat, ou laisser INCONNU.
6. **Isolement par la marée.** Trois consignes de fiche décrivent un retour qui peut être coupé, sans seuil ferme :
    - Mousterlin au-delà du coefficient 75 ;
    - Agon et Sciotot par marée montante.

   Elles restent des consignes affichées, pas des « non recommandé ».
7. **Sécurité commune aux deux moteurs** : c'est ma lecture de ta décision sur les seuils de vent ; à confirmer.
8. **Stabilité de la v2 non mesurée.** La carte « Fiabilité du conseil » parle encore de la v1, et le dit. Le Monte Carlo, c'est la phase 8.
9. **Carte OpenStreetMap.** Le bleu le plus clair se distingue mal de la mer claire du fond ; le contour sombre le sauve. À revoir avec la conformité visuelle (phases 11 et 13).
10. **Mise en ligne.**
    - Le dépôt est toujours `FelixMuzellec/spumy`, sans Pages.
    - L'organisation `spumy` n'est pas visible d'ici.
    - Rien de SPUMY n'est donc en ligne à la nouvelle adresse.

## 7. Critères d'acceptation

| Critère | Résultat | Statut |
| --- | --- | --- |
| Filtre de sécurité de la spécification, non compensable, inconnu → à vérifier | S1 à S9 ; grille 73 986 cas | TESTED |
| Trois scores sur 100, jamais fusionnés, décomposés ; la confiance ne change pas le rang | S10 à S15 et règles ; affichage vu en capture | TESTED |
| Données manquantes : critère exclu, jamais neutre, part des critères dite | `test:v2`, S6 | TESTED |
| Comparés à la v1 sur les mêmes journées, chaque écart de premier spot expliqué | 949 écarts classés par cause | TESTED (journées d'essai) |
| Réglage pour revenir à la v1 | parcours v2 → v1 → v2 | TESTED |
| Pastilles : couleur = favorabilité, sans orange ni rouge ; à vérifier, non recommandé, pas de note | carte du guide et de l'accueil, listes, anneaux | TESTED |
| Niveaux de preuve affichés | fiche du spot, onglet Terrain | TESTED |
| Conseil tiré de ta boîte, trois meilleurs et ce qui manque | S13 ; détail des trois scores | TESTED (boîte enregistrée, inventaire complet attendu) |
| Vigilance Météo-France | non lue, dite à l'écran | INCONNU |
| Suite complète verte sur GitHub | « Tests » et contrat Open-Meteo réel verts (commit 9337732, proposition n° 6) | TESTED |

Statut de la phase : **TESTED, en attente de ta validation.**

## 8. Décisions attendues

Je te les pose une par une à la suite de ce rapport :
1. Le passage à `spumy.github.io`.
2. La fusion des phases 5, 6 et 7 dans `main`.
3. L'inventaire complet de ta boîte.
4. Ton temps de trajet maximal.
5. La vigilance Météo-France.
6. L'isolement par la marée : Mousterlin, Agon, Sciotot.
7. L'écart à la spécification pour le scénario S12.
8. La sécurité commune aux deux moteurs.
9. L'historique de tes sorties.
10. Les restes de la phase 5 : rubriques « connaissance locale », positions GPS de Pirou.

## 9. Prochaine phase proposée, et arrêt

**Phase 8 : épreuve du moteur.**
- Journées archivées d'Open-Meteo (au moins 30 par guide), 1 000 tirages par journée.
- Stabilité des trois premiers, poids de chaque hypothèse, en commençant par le vent et la mer.
- Coût réel de la prudence (fréquence des « à vérifier »).
- Confrontation avec ton journal.

**STOP.** J'attends ta réponse « `APPROVED — PROCEED TO PHASE 8` ». D'ici là, la v1 reste disponible dans les réglages, et rien n'est fusionné dans `main` sans ton accord.
