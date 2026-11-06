# SPUMY v9.2 — refonte UX d'après la maquette (8 écrans)

## Ce qui est fait, écran par écran

| Écran de la maquette | Dans SPUMY v9.2 | Écart volontaire |
|---|---|---|
| **Décision** (photo, « Excellentes conditions aujourd'hui », spot recommandé, actions rapides) | Bandeau en tête : « Très bonnes conditions ce matin », meilleure fenêtre, spot, temps restant, bouton « Voir le spot », interrupteur Mode terrain. Carte du meilleur choix avec anneau de note, « Pourquoi ce spot ? », « À surveiller », sécurité, confiance. | Pas de photo : le ciel est **dessiné d'après la lumière réelle du créneau** (aube, jour, crépuscule, nuit, couvert). Une photo d'illustration ferait croire à un lieu ou à une météo qui ne sont pas ceux du jour. |
| **Carte interactive** (filtres, marqueurs, carte du bas) | Carte en premier, filtres **Tous · Au vert · Tes spots** avec leur nombre, disques colorés par note, fiche du spot sous le classement. | « À explorer » non repris : le guide ne sait pas encore quels spots tu n'as jamais pêchés au-delà du journal ; à ajouter quand le journal aura assez de sessions. |
| **Fiche du spot** (3 jauges /100, « Pourquoi ce spot ? », « À surveiller », meilleure fenêtre, « Voir la stratégie ») | Anneau de note /10 et son libellé, « Meilleure fenêtre », « Pourquoi ce spot ? » / « À surveiller » tirés des termes réels de la note, bouton **Voir la stratégie**, puis Créneaux, Terrain, Leurres, Accès. | **Une seule note sur 10.** Favorabilité, Pertinence et Confiance « sur 100 » auraient affiché une précision que le modèle n'a pas ; la sécurité et la confiance restent des indicateurs à part, en mots, jamais en chiffre ni en feu vert. |
| **Comparaison de spots** (3 colonnes, barres Vent/Marée/Eau/Poissons, « Notre conseil ») | « Comparer les meilleurs spots » : les trois premiers côte à côte, barres **Marée, Vent, Lumière, Saison et eau** = somme exacte des termes du moteur (`engine/factors.js`), phrase « Ce qui fait la différence ». | Pas de barre « Poissons » : aucune donnée de présence mesurée spot par spot ; la saison et l'eau la remplacent honnêtement. |
| **Ma stratégie** (technique, paramètres clés, astuce) | « Voir la stratégie » ouvre Matériel sur le spot et le créneau : leurre de ta boîte, **tuiles Poids / Nage / Couleur**, animation, plan B, situation, sources. | — |
| **Matériel & Leurres** (cartes, étoiles) | Conseil leurre détaillé et éditeur de ta boîte. | **Pas d'étoiles** : aucune note de leurre n'est mesurée ; inventer des ★ serait trompeur. Le journal (leurre + prises) alimente déjà le conseil. |
| **Journal de pêche** (liste, vignettes, humeur) | En tête : sessions, bars pris, spots pêchés, le spot qui a le plus donné, bouton « Noter une session » ; l'historique ensuite, avec un badge du nombre de bars ; le formulaire après (on y descend seul en fin de session). | Pas de vignettes photo ni d'émoticônes : le journal n'enregistre pas de photo aujourd'hui (à ajouter, stockage local). |
| **Mode terrain** (grand anneau, Vent/Marée/Eau, spot à 600 m, « Voir sur la carte ») | Grand anneau, libellé, spot, fenêtre, compte à rebours ; tuiles Marée (montante/descendante, prochaine PM/BM), Vent, Houle, Eau ; leurre ; sécurité ; « Fiche du spot », « Je pêche ici ». | Pas de distance « à 600 m » : il faudrait la géolocalisation, refusée par défaut pour respecter la vie privée ; à proposer en option. |
| **Barre du bas** (Décision · Carte · Journal · Matériel · Plus) | Identique, fixée en bas, à portée du pouce, pictogrammes au trait, clavier (flèches, début, fin). « Plus » : Marée, Météo, Saison, Règles, Photos, sauvegarde et réglages, changement de guide. | — |

## Vérifications

Construction des 7 guides, tests unitaires (7 guides + fuseau Auckland), tests de bout en bout (navigation du bas, sommaire Plus, clavier, mode terrain, carte, journal, sauvegarde), contrat Open-Meteo, accessibilité (axe), lint ; captures à 390 et 320 px.

## Ce qui sépare encore SPUMY du « top niveau mondial », et comment y arriver

1. **Images réelles** : des photos des spots prises sur place (ou achetées sous licence), une par spot, à la bonne marée. C'est ce qui donne l'émotion des écrans de la maquette ; elles ne s'inventent pas.
2. **Un passage de designer produit** (2 à 3 semaines) : système de design complet (typographie dédiée, grille, tokens, états, mouvements), maquettes haute fidélité de chaque écran, puis intégration. L'application a aujourd'hui une base propre, pas encore une signature visuelle.
3. **Tests d'usage sur l'eau** : 5 à 8 pêcheurs, au bord, avec des gants, au soleil et de nuit ; mesurer le temps pour décider « j'y vais / j'y vais pas ». C'est ce qui sépare une bonne interface d'une interface de référence.
4. **Données qui manquent pour les écrans de la maquette** : photos dans le journal, géolocalisation en option (distance au spot), présence du poisson mesurée (journal partagé, à terme), évaluation des leurres par tes prises.
5. **Mouvement et retours** : transitions entre écrans, retour haptique (Android), état hors ligne visible en permanence.
