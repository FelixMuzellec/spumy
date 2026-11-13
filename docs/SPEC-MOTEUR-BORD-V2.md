# Moteur BORD v2 — spécification (phase 6)

Statut : **À VALIDER par Félix.** Aucun code ici : l'implémentation est la phase 7, l'épreuve des poids et des seuils (Monte Carlo, journal) la phase 8.
Espèce : le bar (décision de Félix, 13 nov. 2026). Mode : pêche du bord.
Sources des connaissances : `data/knowledge/bar-bord.json` (niveau de preuve 1 à 5) et `data/knowledge/preuves-spots.json` (rubriques des 66 spots).

Chaque valeur chiffrée ci-dessous (poids, seuil, palier) est une **HYPOTHÈSE de départ**, sauf mention d'une source. Elle sera éprouvée en phase 8, puis gardée, corrigée ou retirée.

## 0. Décisions intégrées

| Décision | Origine | Effet dans cette spécification |
| --- | --- | --- |
| Trois scores sur 100, jamais fusionnés : favorabilité, pertinence, confiance | Félix, phase 2 | Sections 4, 5, 6 |
| La sécurité passe en premier et ne se compense jamais ; une donnée de sécurité inconnue est « à vérifier », jamais au vert | Cahier des charges | Section 3 |
| Seuils de vent plus prudents : « à vérifier » dès la force 6 ou des rafales de 60 km/h ; « non recommandé » dès la force 8 ou des rafales de 90 km/h | Félix, 13 nov. 2026 | Section 3 |
| Bar seul pour l'instant | Félix, 13 nov. 2026 | Tout le document |
| Profil = inventaire complet de la boîte ; SPUMY conseille les meilleurs leurres et montages de cette boîte | Félix, 13 nov. 2026 | Section 5 |
| Nouvelle échelle de couleurs des pastilles avec le moteur v2 (phase 7), pas avant | Félix, 13 nov. 2026 | Section 8 |

## 1. Le circuit

```
données qualifiées ──► filtre de sécurité ──► non recommandé : retiré, avec sa raison et un autre choix
                              │
                              ├─► à vérifier : proposé, jamais au vert, classé après les spots sans doute
                              ▼
                 favorabilité (conditions × présence)        0 à 100
                 pertinence (spot × ta boîte × distance)      0 à 100
                 confiance (données, modèles, preuves, journal) 0 à 100
                              ▼
     classement : par favorabilité, parmi les spots assez pertinents ; la confiance s'affiche à côté et ne change pas le rang
                              ▼
     affichage : chaque score se décompose (« 72 = conditions 80 × présence 0,9 »)
```

## 2. Données qualifiées

Toute valeur qui pèse sur un score porte : sa valeur et son unité ; sa nature (mesure, prévision, calcul, saisie, estimation, inconnue) ; sa source ; son horodatage et son âge ; sa résolution (point du spot, maille du modèle).

| Donnée | Source dans l'application aujourd'hui | Nature | Sert à |
| --- | --- | --- | --- |
| Vent moyen, direction, rafales | Open-Meteo, AROME (ECMWF au-delà et en comparaison), au point du spot | prévision | sécurité, favorabilité (vent et mer), confiance (écart entre modèles) |
| Houle | Open-Meteo, modèle de vagues ; en rade, mer du vent calculée sur place | prévision ou calcul | sécurité, favorabilité |
| Température de l'eau | Open-Meteo, modèle marin ; à défaut moyenne de saison | prévision ou estimation | présence |
| Marée (heures, hauteurs, coefficient) | calcul harmonique sur l'appareil, ports du SHOM | calcul | favorabilité (marée), sécurité (isolement) |
| Lumière (aube, jour, crépuscule, nuit) | calcul solaire sur l'appareil | calcul | favorabilité (lumière) |
| Pression, nébulosité, pluie sur 36 h | Open-Meteo | prévision | information ; clarté de l'eau pour les leurres |
| Fiche du spot (fenêtres, bande de coefficient, exposition, houle maximale, terrain, sécurité) | `data/sites/*.config.js` | saisie, avec niveau de preuve | tous les scores |
| Ta boîte, ta canne | inventaire que tu fournis | saisie | pertinence, conseil de leurres |
| Ton journal | tes sessions | saisie | apprentissage personnel, confiance |

Règles : une valeur inconnue sort du calcul et fait baisser la confiance (section 7) ; une valeur ancienne s'affiche avec son âge, jamais comme actuelle ; une valeur en cache n'est jamais présentée comme « en direct ».

## 3. Filtre de sécurité

Il passe avant toute note. Il donne un des trois états : **non recommandé** (retiré du classement, raison affichée, autre choix proposé), **à vérifier** (proposé, jamais au vert, classé après les spots sans doute), **sans alerte connue** (ce qui ne veut pas dire « sûr » : « vérifie sur place » reste affiché).

| Condition sur le créneau | État | Source | Niveau | Aujourd'hui (v1) |
| --- | --- | --- | --- | --- |
| Vent moyen de force 8 et plus (62 km/h et plus) | non recommandé | Météo-France : avis de coup de vent dès 62 km/h | 1 | idem |
| Rafales de 90 km/h et plus | non recommandé | Météo-France : tempête au-delà de 90 km/h | 1 | idem |
| Vent moyen de force 6 ou 7 (39 à 61 km/h) | à vérifier | décision de Félix (Météo-France : BMS côte dès la force 7) | 1 pour la force 7, choix de prudence pour la force 6 | à vérifier dès la force 7 seulement |
| Rafales de 60 à 89 km/h | à vérifier | décision de Félix | choix de prudence | à vérifier dès 75 km/h |
| Vent, rafales ou direction (force 2 et plus) inconnus | à vérifier | cahier des charges | — | idem (revue finale) |
| Houle au-dessus du maximum du spot | spot engagé : non recommandé ; autre spot : à vérifier jusqu'à +0,5 m, non recommandé au-delà | fiche du spot | 4 | pénalité cachée dans la note jusqu'à +0,5 m |
| Houle inconnue en côte ouverte | spot engagé : non recommandé ; autre spot : à vérifier | cahier des charges | — | idem |
| Nuit sur un spot engagé (niveau 3) | non recommandé | cahier des charges (phase 2, lot 7.2) | — | pénalité de −0,4 seulement |
| Isolement par la marée : le retour est coupé pendant le créneau (seuil écrit dans la fiche, ex. Térénez au-delà du coefficient 85) | non recommandé | fiche du spot (peche-poissons.com, 2022, pour Térénez) | 2 | consigne affichée, spot toujours proposé |
| Coefficient au-delà de la limite de courant documentée (`coefHardMax`) | non recommandé | fiche du spot | 2 à 4 | idem |
| Vigilance Météo-France orange ou rouge (vent, vagues-submersion) sur le département | non recommandé | Météo-France | 1 | **INCONNU** : l'application ne lit pas la vigilance ; source de données à trouver en phase 7 |

Effet mesuré des seuils plus prudents sur la grille de 73 986 cas (66 spots, 1 120 météos) : 11 712 cas passent « à vérifier », dont 5 760 des 13 376 cas qui n'avaient aucun doute (force 6, ou rafales de 60 km/h avec un vent plus faible). Leur fréquence sur de vraies journées bretonnes et normandes sera mesurée en phase 8 (prévisions archivées d'Open-Meteo, dans l'intégration continue).

## 4. Favorabilité (0 à 100)

**Favorabilité = Conditions × Présence**, arrondie à l'unité.

- **Conditions** (0 à 100) = somme des points des critères connus ÷ somme de leurs maximums × 100.
- **Présence** (0,3 à 1) = la plus restrictive de la saison et de la température de l'eau : le bar absent, les conditions n'y changent rien.

Aujourd'hui, la note sur 10 part de 5 et additionne des termes : elle est tassée. Sur 1 746 meilleurs créneaux du jour (66 spots, 3 coefficients, 3 vents, 3 mois ; journées praticables), la médiane est 5,6, le maximum 8,8, et 9 et 10 ne sont jamais atteints ; en saison, le gris (note sous 5) n'apparaît que dans 5 à 12 % des cas. L'échelle sur 100 part de zéro et chaque critère a son maximum.

### Fiches par critère

| Critère | Ce qu'il mesure | Points (hypothèse) | Courbe | Niveau de preuve | Si la donnée manque | Éprouvé en phase 8 par |
| --- | --- | --- | --- | --- | --- | --- |
| C1 Marée : fenêtre | Le créneau tombe dans une fenêtre de la fiche (phase et heures autour de la pleine ou basse mer) | 25 | fenêtre « prime » : 25 ; « bonne » : 15 ; hors fenêtre : pas de créneau | 2 (flot, sources de pêche) à 4 (fenêtres déduites), selon le spot | port de marée inconnu : critère exclu, confiance en baisse | journal ; sensibilité des fenêtres ±30 min |
| C2 Marée : coefficient | Le coefficient du cycle est dans la plage utile du spot | 20 | plateau 20 ; rampes linéaires jusqu'à 0 au seuil bas et à la limite haute (bande `coefBand` de la fiche) | 4 sauf quelques bornes sourcées | — (toujours calculé) | sensibilité des bornes ±10 points de coefficient |
| C3 Lumière | Aube et crépuscule, nuit, plein jour | 25 | aube ou crépuscule : 25 ; nuit : 15 ; plein jour : 5, jusqu'à 11 si ciel couvert ou mer formée | 2 (pêcheurs ; pics à l'aube et au crépuscule en captivité) ; valeurs 4 | heure de lever ou de coucher inconnue : critère exclu | journal (heure des prises) ; sensibilité ±50 % |
| C4 Vent et mer | Vent de mer modéré qui lève du clapot sur un spot exposé ; vent de terre et mer plate, eau claire et poisson méfiant de jour | 30 | tableau par exposition (face, travers, dos) et force (0 à 5) ; au-delà, c'est la sécurité qui décide | 2 (principe) ; valeurs 4 | vent ou houle inconnus : critère exclu (et « à vérifier ») | sensibilité ±50 % |
| — Pression | Pression et tendance | 0 | retirée de la note ; affichée en information | 5 (blogs) | — | — |
| — Rafales sous 60 km/h | Gêne au lancer | 0 | retirée : au-delà, la sécurité met « à vérifier » | 5 | — | — |
| — Clarté de l'eau (pluie, houle, gros coefficient) | Eau teintée ou chargée | 0 | sert seulement au conseil de leurres (couleur, taille) | 4 | — | — |

Total des maximums : 100.

### Présence

| Facteur | Valeurs de départ | Niveau | À revoir |
| --- | --- | --- | --- |
| Saison (mois, par régime : roche, plage, abri) | celles de la v1 (de 0,5 en février à 1 de juin à octobre) | calendrier 1 ; valeurs 4 | phase 8, sur le journal et les marquages publiés |
| Température de l'eau | paliers de la v1 (7,5 / 9,5 / 11,5 / 13,5 / 19 / 21,5 °C), **mais** plancher porté à 0,5 en abri (rade, ria, havre) l'hiver | 4 | les paliers sont en partie contredits : des bars ont été suivis jusqu'à 6,5 °C et ont hiverné à 6,9 °C |
| Température inconnue | facteur de saison seul ; confiance en baisse | — | — |

### Apprentissage personnel (journal)

À part de la favorabilité et affiché à part : « ton journal sur ce spot : +6 ». Il ne joue qu'à partir de **5 sessions** sur le spot, dont au moins **2 avec prise** (exigence 10.5 : jamais de conclusion sur trop peu de sorties), borné à **±10 points**. Aujourd'hui, ton journal compte 3 sessions, toutes à Moulin Mer : il ne jouerait pas encore.

## 5. Pertinence (0 à 100) : ta boîte

Ton profil, c'est l'inventaire complet de ta boîte (leurres, têtes, montages) et ta canne (14 à 42 g). SPUMY s'en sert pour deux choses : noter la pertinence de chaque spot, et te conseiller les meilleurs leurres et montages **de ta boîte** pour le créneau.

| Sous-critère | Points (hypothèse) | Calcul |
| --- | --- | --- |
| P1 Couverture technique | 50 | ta boîte contient au moins un leurre ou montage praticable sur ce fond (couches possibles, pêche à gratter ou non, encombrement) et adapté au créneau (famille conseillée par le moteur de leurres) ; 50 si le meilleur conseil est dans ta boîte, 30 si seul un remplaçant y est, 10 sinon |
| P2 Poids et lancer | 25 | le poids nécessaire (profondeur, courant, vent) tient dans ta boîte et dans la plage de ta canne (14 à 42 g) |
| P3 Distance | 25 | 25 jusqu'à ton temps de trajet maximal, puis décroissance linéaire jusqu'à 0 au double |

Seuil de pertinence pour le classement : **50** (hypothèse). Un spot sous ce seuil reste visible, avec sa raison (« il te manque une tête de 25 g pour ce courant »).

Conseil de leurres : les trois meilleurs leurres ou montages de ta boîte pour le créneau, chacun avec sa raison et sa source (règles classées dans `bar-bord.json`), et ce qui manque à ta boîte quand le meilleur choix n'y est pas.

Sans inventaire, la pertinence est **inconnue** : elle ne filtre pas le classement, et l'écran invite à renseigner la boîte.

## 6. Confiance (0 à 100)

Elle dit à quel point on peut croire la favorabilité. Elle s'affiche à côté et **ne change jamais le rang**.

| Composante | Points (hypothèse) | Calcul |
| --- | --- | --- |
| Données | 40 | âge de la prévision (moins de 6 h : plein ; 6 à 24 h : moitié ; plus : rien) ; échéance (aujourd'hui : plein ; J+3 et au-delà : moitié) ; part des critères de favorabilité réellement calculés |
| Accord entre modèles | 20 | écart AROME / ECMWF sur la force et la direction du vent (0 Beaufort : plein ; 2 et plus : rien) |
| Preuves | 25 | niveau de preuve des rubriques du spot utilisées (exposition, courant, bars) et des critères : niveau 1 = 1 ; 2 = 0,8 ; 3 = 0,6 ; 4 = 0,4 ; 5 = 0,2 |
| Journal | 15 | sessions sur ce spot : 0 → 0 ; 10 et plus → plein |

Paliers affichés : haute (70 et plus), moyenne (40 à 69), faible (sous 40).

## 7. Données manquantes

| Donnée manquante | Sécurité | Favorabilité | Confiance | Affichage |
| --- | --- | --- | --- | --- |
| Toute la météo | à vérifier (vent inconnu) | marée et lumière seules (C4 exclu) | composante « Données » réduite | « Sans météo : marée et lumière seules » |
| Rafales | à vérifier | inchangée | réduite | « rafales inconnues » |
| Houle, côte ouverte | à vérifier (non recommandé si spot engagé) | C4 exclu | réduite | « houle inconnue » |
| Température de l'eau | — | présence = saison seule | réduite | « eau : température inconnue » |
| Port de marée | — | C1 et C2 exclus | réduite | « marée inconnue » |
| Inventaire de la boîte | — | — | — | pertinence « inconnue », invitation à renseigner la boîte |

Un critère exclu ne vaut jamais « neutre » : il sort du calcul, et l'écran dit sur quelle part des critères la note est calculée (« calculée sur 70 % des critères »).

## 8. Classement et affichage

- Les spots **non recommandés** sortent du classement ; ils restent consultables, avec leur raison et un autre choix.
- Ordre : spots sans doute avant spots « à vérifier » ; puis favorabilité, parmi les spots dont la pertinence atteint le seuil (ou tous si la boîte n'est pas renseignée) ; à égalité, le plus proche.
- Chaque score se décompose. Exemple : « Favorabilité 72 = conditions 80 (marée 38/45, lumière 25/25, vent et mer 17/30) × présence 0,9 ».

**Pastilles** (réponse à ta question du 13 nov. : aujourd'hui l'orange veut dire « moyen » ou « à vérifier », et le gris de la note faible ressemble à celui du spot non praticable) :

| Ce que la pastille dit | Comment |
| --- | --- |
| Favorabilité | couleur de remplissage, cinq paliers d'une même famille de couleurs (pas d'orange ni de rouge, réservés à la sécurité) |
| À vérifier | contour pointillé et « ? », quelle que soit la favorabilité |
| Non recommandé | pastille grise barrée |
| Pas de note (données insuffisantes) | pastille vide |

Paliers de favorabilité de départ : 80 et plus, 65 à 79, 50 à 64, 35 à 49, moins de 35. Ils seront recalés en phase 8 pour que chacun apparaisse réellement en saison (aujourd'hui, 9 et 10 sur 10 n'arrivent jamais).

## 9. Scénarios de référence

Ils deviennent des tests en phase 7 et servent de repères en phase 8.

| # | Situation | Attendu |
| --- | --- | --- |
| S1 | Moulin Mer, vent de nord-est force 9, rafales de 90 km/h | non recommandé (coup de vent) |
| S2 | Côte ouverte, vent d'ouest force 6, rafales de 55 km/h | à vérifier (vent), jamais au vert |
| S3 | Vent de force 4, rafales de 62 km/h | à vérifier (rafales) |
| S4 | Vent de force 3, rafales de 45 km/h, houle connue sous le maximum | sans alerte connue |
| S5 | Houle inconnue, côte ouverte : spot ordinaire puis spot engagé | à vérifier ; puis non recommandé |
| S6 | Aucune météo (Open-Meteo injoignable, rien en cache) | à vérifier partout ; favorabilité sur marée et lumière seules ; confiance faible |
| S7 | Nuit sur un spot engagé (niveau 3) | non recommandé |
| S8 | Térénez, coefficient 90 | non recommandé (retour coupé au-delà de 85) |
| S9 | Houle de 0,3 m au-dessus du maximum d'un spot ordinaire | à vérifier (et non plus une pénalité cachée) |
| S10 | Aube, coefficient dans la plage, vent de mer de force 3 sur un spot exposé, juin | favorabilité dans le palier le plus haut |
| S11 | Plein jour, ciel clair, coefficient 35, vent de terre | favorabilité dans l'un des deux paliers les plus bas |
| S12 | Février, eau à 8 °C, même créneau en rade et en côte ouverte | présence plus haute en rade (hypothèse à éprouver) |
| S13 | Spot de fort courant (Goury, Raz) et boîte sans tête de 25 g ou plus | pertinence sous le seuil, avec « il te manque… » |
| S14 | Spot au-delà de ton temps de trajet maximal | pertinence réduite (P3) |
| S15 | Prévision vieille de 30 h, échéance J+3 | confiance faible ; rang inchangé |
| S16 | Tes sessions de Moulin Mer (27/12/2025 : 2 bars ; 07/08/2026 : 0 ; 08/08/2026 : 1, au coucher du soleil) | contrôle de vraisemblance seulement : 3 sessions ne calibrent rien |

## 10. Plan Monte Carlo (phase 8)

But : mesurer si le classement et les paliers tiennent quand les entrées et les hypothèses bougent, et trouver les hypothèses qui décident trop.

1. **Journées de référence** : au moins 30 journées réelles par guide, réparties sur l'année, à partir des prévisions archivées d'Open-Meteo (téléchargées dans l'intégration continue, où le réseau le permet).
2. **Tirages** : 1 000 par journée et par guide.
    - Entrées perturbées selon leur incertitude : vent ±1 Beaufort ou l'écart entre modèles s'il est plus grand ; direction ±1 secteur ; houle ±25 % ; eau ±1 °C ; heures de marée ±10 min.
    - Paramètres perturbés selon leur niveau de preuve : niveau 1 fixe ; niveau 2 ±20 % ; niveau 4 ±40 % ; niveau 5 ±60 %.
3. **Mesures** : probabilité que le premier et les trois premiers restent les mêmes ; stabilité du palier de chaque spot ; corrélation de rang (Spearman) ; part de la variance expliquée par chaque paramètre.
4. **Critères** : trois premiers inchangés dans au moins 80 % des tirages sur les journées de référence (hypothèse) ; un paramètre de niveau 4 ou 5 qui explique plus de 30 % de la variance est signalé, et son poids est réduit ou une source est cherchée.
5. **Coût de la prudence** : fréquence réelle des journées « à vérifier » avec les nouveaux seuils de vent, par guide et par mois.
6. **Vérité terrain** : ton journal. Trois sessions aujourd'hui ; le plan dit combien il en faudrait pour conclure sur un spot (au moins 5, dont 2 avec prise).

## 11. Passage de la v1 à la v2 (phase 7)

- Les deux moteurs tournent sur les mêmes journées ; chaque écart de classement est expliqué.
- Un réglage permet de revenir à la v1 tant que la v2 n'est pas validée.
- L'affichage des niveaux de preuve (phase 5) arrive avec la v2.

## 12. Hypothèses à éprouver

Toutes les valeurs des sections 4 à 6 (points, courbes, paliers, seuil de pertinence, bornes de confiance), la présence en abri l'hiver, les paliers de température, et le seuil de 5 sessions du journal. Chacune garde son niveau de preuve dans `bar-bord.json` ; la phase 8 dit lesquelles tiennent.
