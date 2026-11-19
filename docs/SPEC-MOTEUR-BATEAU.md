# Moteur BATEAU — spécification (phase 9)

Statut : **À VALIDER par Félix.** Code (phase 13, v10.1) : `src/bateau/engine/` (sécurité, espèces, pertinence, confiance), paramètres dans `data/bateau/moteur.json`, interface « Sortir aujourd'hui ? » dans l'onglet Offshore ; les 16 scénarios du § 10 sont des tests (`npm run test:bateau`). Reste l'épreuve sur journées archivées (§ 11).

Espèces, dans l'ordre de priorité fixé par Félix : lieu jaune, lieu noir là où il est pertinent, maquereau, bar, vieille, saint-pierre.

Mode : pêche en bateau, à la ligne. Le mode BORD n'est pas concerné : il garde son moteur, sa sécurité et ses connaissances. C'est la cible décidée en phase 2 (`docs/ARCHITECTURE.md`) : marée, astres, météo, stockage et moteur de règles sont partagés ; moteurs, filtres de sécurité, connaissances, profils et apprentissage restent séparés.

Sources : `data/knowledge/bateau.json`. Chaque connaissance y porte son niveau de preuve (1 à 5, même échelle que le BORD), ses sources et ses limites.

Chaque valeur chiffrée qui n'est pas dans une source (poids, marge, seuil de prudence) est une **HYPOTHÈSE de départ (niveau 4)**, notée comme telle. Elle sera gardée, corrigée ou retirée à l'épreuve.

## 0. État actuel et décisions

### Ce que fait aujourd'hui l'onglet Offshore (audit de la phase 9)

| Partie | État | Écart au cahier des charges |
| --- | --- | --- |
| Spots bateau | Ajoutés par toi seulement (nom, position, type : épave, roche, banc, tombant, chenal ; profondeur), synchronisés avec GitHub | Pas de port d'attache, pas de distance d'un abri |
| Sorties | Date, heures, prises par espèce (31 espèces), taille, gardé ou relâché, techniques, notes | — |
| Conditions | Recherchées seules pour chaque sortie : vent, rafales, direction, vagues, période, houle, eau, pression et sa variation, nuages ; marée du port de guide le plus proche à moins de 40 km | Pas de visibilité, pas d'orage, pas de courant, pas de marée au-delà de 40 km d'un guide |
| Note | Régression de Poisson des prises sur les conditions, après 8 sorties avec prise ; 5 sur 10 = ta moyenne | **Aucune logique par espèce** : rien n'est conseillé avant 8 sorties |
| Sécurité | **Aucune** : un coup de vent peut recevoir une bonne note si tes sorties passées l'ont « appris » | Contraire à la règle n° 1 (sécurité non compensable) |
| Réglementation | Aucune pour les espèces du bateau (seul le bar du bord est couvert) | Lieu jaune fermé de janvier à avril, tailles, quotas, déclaration |
| Tests | 20 contrôles unitaires (fiches, fusion, conditions, modèle), 26 de parcours | Rien sur la sécurité ni les espèces : il n'y en a pas |

### Décisions intégrées

| Décision | Origine | Effet |
| --- | --- | --- |
| BORD et BATEAU séparés pour tout ce qui décide | Phase 2 | Ce document ne modifie rien du BORD |
| La sécurité passe en premier et ne se compense jamais ; une donnée de sécurité inconnue est « à vérifier », jamais au vert | Cahier des charges | Section 3 |
| Trois scores sur 100, jamais fusionnés | Phase 2, appliqué au BORD en phase 7 | Sections 4 à 6 |
| Espèces prioritaires | Félix | Section 4 |
| Aucun spot fourni d'avance : tes marques restent les tiennes | v8.15, gardé | Section 2 |
| Le modèle empirique actuel (tes sorties) est gardé, comme apprentissage personnel | v8.15, gardé | Section 7 |

## 1. Le circuit

```
données qualifiées ─► sécurité de la sortie (départ → zone → retour, tout le créneau)
                            │   non recommandé : pas de sortie, avec la raison
                            │   à vérifier : sortie possible, jamais au vert
                            ▼
                     sécurité de la zone (distance d'un abri, armement, raz, nuit)
                            ▼
      par zone et par espèce ouverte à la pêche :
          favorabilité (conditions × présence)       0 à 100
          pertinence (ton bateau, ton matériel, la route)  0 à 100
          confiance (données, modèles, preuves, sorties)   0 à 100
                            ▼
      réponse : sortir ou non ; où ; quelle espèce ; quelle technique ; jusqu'à quelle heure
```

Trois différences avec le BORD :
- la sécurité porte sur **toute la sortie**, du départ au retour, et retient le pire moment du créneau, pas la moyenne ;
- elle dépend **du bateau** (catégorie de conception, armement embarqué) autant que de la météo ;
- la réglementation peut **fermer une espèce** : le lieu jaune ne se pêche pas du 1er janvier au 30 avril, même relâché.

## 2. Profil du bateau et données qualifiées

### Profil (nouveau, saisi une fois, modifiable)

| Champ | Exemple | Sert à |
| --- | --- | --- |
| Catégorie de conception CE (A, B, C, D), sur la plaque du constructeur | C | SEC_CATEGORIE |
| Armement embarqué (basique, côtier, semi-hauturier, hauturier) | côtier | SEC_ARMEMENT |
| Port d'attache, ou abris choisis (point, nom) | Le Moulin Blanc | SEC_ARMEMENT, distance |
| Vitesse de route | 15 nœuds | temps de route, heure de retour |
| Tes limites, plus strictes que celles du bateau (vent, mer) | force 4, 1 m | SEC_VENT, SEC_MER |
| Seul à bord : oui ou non | oui | SEC_SEUL |
| Matériel : cannes (plage de poids), poids de tête ou de jig le plus lourd, techniques | 90 à 210 g | pertinence |

Sans profil, le moteur ne note pas : il demande le profil. Il ne suppose ni catégorie ni armement.

### Données

| Donnée | Source prévue | Nature | Ce que la sécurité en fait |
| --- | --- | --- | --- |
| Vent moyen et rafales à 10 m, direction | Open-Meteo : AROME, puis ECMWF (déjà dans `wx.js`) | prévision | SEC_VENT, SEC_CATEGORIE |
| Hauteur des vagues, période, houle et sa période, mer du vent | Open-Meteo Marine : MFWAM, ECMWF WAM (déjà dans `wx.js`) | prévision | SEC_MER, SEC_CATEGORIE |
| Visibilité | Open-Meteo, variable `visibility`, si le modèle la fournit | prévision | SEC_VISIBILITE ; inconnue : à vérifier |
| Orage | Open-Meteo : `cape`, code temps | prévision | SEC_ORAGE |
| Marée (heures, coefficient) | `src/core/tide.js` (prédiction harmonique locale), port d'un guide à moins de 40 km aujourd'hui ; ports à ajouter pour le large | calcul | SEC_RAZ, favorabilité ; marée inconnue : SEC_RAZ à vérifier |
| Courant | Open-Meteo Marine (SMOC) : « pas adapté à la navigation côtière » selon Open-Meteo | prévision, faible | **jamais** pour dire « sûr » ; information seulement |
| Lever et coucher du soleil | `src/core/core.js` | calcul | SEC_NUIT |
| Bulletin météorologique spécial (BMS côte) | Météo-France ; pas de source lisible par l'application aujourd'hui | — | SEC_BMS : dit à l'écran tant qu'il n'est pas lu |
| Température de l'eau | Open-Meteo Marine | prévision | présence |
| Tes zones | tes spots bateau (type, profondeur, position) | saisie | tout |

Chaque valeur porte, comme au BORD : sa valeur et son unité, sa nature, sa source, son âge, sa maille.

## 3. Sécurité en mer (non compensable)

Un seul « non recommandé » empêche la sortie ou la zone. Un seul « à vérifier » interdit le vert. La règle retenue est toujours la plus stricte entre la loi, la catégorie du bateau et tes limites.

### SEC_ARMEMENT — distance d'un abri et armement embarqué
- Les zones de navigation de la Division 240 se lisent à la distance d'un abri : basique jusqu'à 2 milles, côtier de 2 à 6 milles, semi-hauturier de 6 à 60 milles, hauturier au-delà (VÉRIFIÉ, mer.gouv.fr).
- Une zone plus loin d'un abri que ce que permet l'armement déclaré : **non recommandé**, raison réglementaire.
- Distance inconnue, ou aucun abri choisi : **à vérifier**.
- « Abri » au sens du texte : un lieu où l'on peut s'abriter et repartir sans aide, compte tenu de la météo du moment et du bateau. La distance se mesure donc aux abris choisis par toi, jamais à un port supposé.

### SEC_CATEGORIE — limites de conception du bateau
- Directive 2013/53/UE (VÉRIFIÉ) :
  - A : plus de force 8 et plus de 4 m de vagues ;
  - B : force 8 et 4 m au plus ;
  - C : force 6 et 2 m au plus ;
  - D : force 4 et 0,3 m au plus, vagues occasionnelles de 0,5 m.
- Pire moment du créneau au-delà de la catégorie : **non recommandé**.
- Moins de 1 Beaufort ou moins de 20 % de vagues sous la limite : **à vérifier** (marge HYPOTHÈSE).

### SEC_VENT et SEC_MER — tes limites
- Valeurs de départ proposées, **À DÉCIDER par Félix** :
  - à vérifier dès la force 5 ou 50 km/h de rafales ;
  - non recommandé dès la force 6 ou 60 km/h de rafales ;
  - jamais au-delà de la catégorie du bateau.
- Mer :
  - à vérifier dès « agitée » (1,25 m et plus, échelle de Météo-France) ;
  - à vérifier aussi pour une mer courte : période de moins de 5 s avec 0,8 m et plus (HYPOTHÈSE) ;
  - non recommandé au-delà de ta limite ou de celle du bateau.
- Vent ou vagues inconnus sur le créneau : **à vérifier**.

### SEC_BMS — bulletin météorologique spécial
- Météo-France émet un BMS côte dès que le vent observé ou prévu atteint la force 7, jusqu'à 20 milles des côtes (VÉRIFIÉ).
- BMS en cours sur la zone : **non recommandé**.
- Tant que l'application ne lit pas les BMS, l'écran de sortie le dit, avec le lien et le canal 16 (comme la vigilance du BORD) ; une prévision de force 7 sur le créneau vaut BMS.

### SEC_VISIBILITE
- Termes de Météo-France (VÉRIFIÉ) : bonne à 5 milles et plus, moyenne de 2 à 5, mauvaise de 0,5 à 2 ; brume sous 0,5 mille.
- Mauvaise : **à vérifier**. Brume : **non recommandé**. Inconnue (modèle sans visibilité) : **à vérifier**.

### SEC_ORAGE
- Orage prévu sur le créneau (code temps d'orage, ou énergie convective forte) : **à vérifier** ; orage avec rafales au-delà de tes limites : non recommandé (HYPOTHÈSE, à éprouver).

### SEC_NUIT
- Retour prévu après le coucher du soleil : **à vérifier** (feux réglementaires, retour plus risqué) ; HYPOTHÈSE de prudence, à décider.

### SEC_RAZ — raz et veines de courant
- Une zone marquée « raz » (par toi, ou d'après une liste sourcée) devient **non recommandé** avec un vent contre le courant, ou une houle contre le courant, qui forme une barre de déferlement (niveau 2, bateaux.com).
- Plein courant à la mi-marée : **à vérifier**, même avec un courant favorable.
- Courant inconnu, ou heures de renverse du raz inconnues : **à vérifier**, avec la consigne de passer à l'étale.

### SEC_DONNEES — âge et couverture
- Prévision de plus de 12 h, ou qui ne couvre pas tout le créneau : **à vérifier** (HYPOTHÈSE).

### SEC_SEUL — seul à bord
- Seul à bord : les marges de SEC_VENT et SEC_MER sont serrées d'un cran (HYPOTHÈSE, **À DÉCIDER**).

### SEC_RAPPELS — toujours affiché, jamais noté
- Une aide à la flottabilité par personne, adaptée à son poids et à sa taille (obligatoire).
- VHF canal 16 pour appeler le CROSS et entendre ses bulletins ; 196 depuis la terre.
- Informer un proche de son itinéraire (ministère de la Mer) et de l'heure de retour (ajout de prudence, HYPOTHÈSE).

## 4. Favorabilité par espèce (0 à 100)

Favorabilité = conditions (0 à 100) × présence (0,3 à 1), comme au BORD. Chaque espèce a ses critères. Un critère dont la donnée manque sort du calcul ; sous la moitié des critères, il n'y a pas de note. Les poids sont des HYPOTHÈSES de départ (niveau 4) ; la colonne « Preuve » donne le niveau de ce qui fonde le critère.

### ESP_LIEU_JAUNE — lieu jaune (Pollachius pollachius)

| Critère | Points | Fondement | Preuve |
| --- | --- | --- | --- |
| Structure dure : épave, roche, tombant | 30 | Adultes près des fonds durs et des épaves (FishBase, MarLIN) ; épaves par plus de 25 m, têtes de roche par plus de 15 m (peche.com) | 1 et 2 |
| Profondeur de la zone | 20 | Habituellement 40 à 100 m, jusqu'à 200 m ; juvéniles côtiers 2 à 3 ans (FishBase) | 1 |
| Marée : courant établi, pas au plus fort | 20 | Pratique de pêcheur, source à trouver | 5 |
| Lumière : aube et crépuscule | 15 | Pratique de pêcheur, source à trouver | 5 |
| Dérive praticable (vent modéré) | 15 | Lieu pêché près du fond, remontée lente (peche.com, 2023) ; le seuil est une HYPOTHÈSE | 2 et 4 |

- Présence :
  - **fermé du 1er janvier au 30 avril** (réglementation : l'espèce n'est pas proposée, raison dite) ;
  - frai de février à mai, en bancs sur les frayères, les gros géniteurs au large (MarLIN ; peche.com).

### ESP_LIEU_NOIR — lieu noir (Pollachius virens)

| Critère | Points | Fondement | Preuve |
| --- | --- | --- | --- |
| Profondeur | 35 | 37 à 364 m, côtier et du large (FishBase) | 1 |
| Saison : printemps en côte, hiver au large | 25 | Entre en eaux côtières au printemps et regagne le large en hiver (FishBase) | 1 |
| Structure | 20 | Pratique de pêcheur, source à trouver | 5 |
| Marée et lumière | 20 | Pratique de pêcheur, source à trouver | 5 |

- Présence : le golfe de Gascogne est à la limite sud de son aire, où il est rare (FishBase).
  - En Finistère, la présence est faible et la confiance basse (INFÉRÉ).
  - Le lieu noir n'est proposé que si tes sorties en ont déjà pris, ou si tu l'ajoutes (**À DÉCIDER**).

### ESP_MAQUEREAU — maquereau (Scomber scombrus)

| Critère | Points | Fondement | Preuve |
| --- | --- | --- | --- |
| Saison et température de l'eau | 35 | Hiverne plus profond, vient en côte au printemps quand l'eau est entre 11 et 14 °C (FishBase) ; en côte du printemps à octobre (peche.com) | 1 et 2 |
| Lumière : le jour | 20 | Se nourrit surtout de jour (FishBase) | 1 |
| Profondeur de pêche : souvent 15 à 30 m | 20 | « se pêche fréquemment entre 15 et 30 m » (peche.com) | 2 |
| Mer praticable | 15 | Chasses en surface repérées aux piqués d'oiseaux (peche.com) ; le seuil de mer est une HYPOTHÈSE | 2 et 4 |
| Marée | 10 | Source à trouver | 5 |

- Présence : du printemps à octobre, forte quand l'eau dépasse 11 °C ; faible en hiver (HYPOTHÈSE bâtie sur les sources ci-dessus).
- Frai de mars à juillet (peche.com). Taille de première maturité 28,7 cm (FishBase), au-dessus de la taille légale de 20 cm.

### ESP_BAR_BATEAU — bar en bateau (Dicentrarchus labrax)
- Biologie commune avec le BORD : migration, fidélité aux zones d'été, frai en hiver au large, seuils thermiques (`data/knowledge/bar-bord.json`, niveau 1 pour la migration).
- Critères propres au bateau, tous à sourcer (niveau 5) :

| Critère | Points |
| --- | --- |
| Plateaux et roches dans le courant, raz | 30 |
| Courant établi | 25 |
| Lumière basse | 20 |
| Mer formée sur les hauts-fonds, sans danger | 15 |
| Profondeur de moins de 20 m | 10 |

- Réglementation : celle du BORD (`src/core/rules.js`). Au nord du 48e parallèle, 3 bars par jour et relâcher seul du 1er février au 31 mars ; au sud, 2 par jour ; 42 cm.

### ESP_VIEILLE — vieille (Labrus bergylta)

| Critère | Points | Fondement | Preuve |
| --- | --- | --- | --- |
| Roche et laminaires, 2 à 30 m | 35 | FishBase ; revue Devon and Severn IFCA (2016) | 1 |
| Le jour | 25 | Plus active de jour (Morel et al. 2013, cité par la revue) | 1 |
| Saison | 20 | Plus active au printemps et en été (Morel et al. 2013) ; les labres « hibernent » dans les failles en hiver (revue, labres en général) | 1 |
| Vives-eaux | 10 | Plus détectée aux phases de lune des vives-eaux, davantage à la nouvelle lune qu'à la pleine (Morel et al. 2013, Jersey, une seule étude) | 1 |
| Mer praticable sur la roche | 10 | HYPOTHÈSE | 4 |

- Présence : résidente toute l'année sur un petit territoire (fidélité forte).
- Hermaphrodite (naît femelle, une partie devient mâle) ; le mâle garde un nid d'algues dans une faille ; frai d'avril à août.
  - Vulnérable à un prélèvement répété sur une même roche (INFÉRÉ).
  - Le moteur rappelle la remise à l'eau des gros sujets ; c'est un conseil, **À DÉCIDER**, pas une règle.

### ESP_SAINT_PIERRE — saint-pierre (Zeus faber)

| Critère | Points | Fondement | Preuve |
| --- | --- | --- | --- |
| Près du fond, 50 à 150 m (de 5 à 400 m) | 35 | FishBase | 1 |
| Présence de petits poissons en bancs (sa proie) | 25 | Se nourrit surtout de poissons en bancs (FishBase) ; non mesurable par l'application | 1 |
| Saison en côte | 20 | Inconnue : source à trouver | 5 |
| Marée et lumière | 20 | Source à trouver | 5 |

- Présence : solitaire ; frai en fin d'hiver et au début du printemps (FishBase).
- La confiance reste faible tant que la saison en côte n'est pas sourcée.

## 5. Pertinence (0 à 100) : ton bateau, ton matériel, la route

| Part | Points | Règle |
| --- | --- | --- |
| Technique possible pour l'espèce, à cette profondeur et dans ce courant | 50 | Poids de tête ou de jig nécessaire estimé d'après la profondeur et la dérive (HYPOTHÈSE à sourcer), comparé à ta canne et à ton matériel |
| Route | 30 | Temps de route depuis ton port à ta vitesse ; plein au-delà d'un temps maximal choisi par toi |
| Réglementation | 20 | Espèce ouverte, taille et quota connus, rappel du marquage et de la déclaration RecFishing ; 12 hameçons au plus en tout sur les lignes à main et de traîne (un train de plumes compte) |

Une espèce fermée n'a pas de pertinence : elle n'est pas proposée. C'est le cas du lieu jaune de janvier à avril : la pêche avec relâcher y est aussi interdite.

## 6. Confiance (0 à 100)

| Part | Points | Ce qui la fait baisser |
| --- | --- | --- |
| Données | 40 | Âge et échéance de la prévision ; part des critères calculés ; visibilité ou courant inconnus |
| Modèles | 20 | AROME et ECMWF en désaccord sur le vent ; MFWAM et ECMWF WAM en désaccord sur les vagues |
| Preuves | 25 | Niveau de preuve des critères de l'espèce (le saint-pierre et le lieu noir partent bas) et des informations de ta zone |
| Tes sorties | 15 | Nombre de sorties sur cette zone et cette espèce |

La confiance ne change jamais le rang ; elle s'affiche à côté.

## 7. Apprentissage personnel : tes sorties

Le modèle actuel est gardé (`src/bateau/offshore.js`, `fitModel` : régression de Poisson des prises sur les conditions, pénalisée, avec la durée de la sortie) :
- à partir de 8 sorties avec conditions et au moins une prise de l'espèce, il ajuste la favorabilité de ±10 au plus ;
- l'ajustement est affiché à part, avec la fiabilité dite en clair ;
- il ne touche jamais à la sécurité, et une prise par mauvais temps n'apprend pas au moteur que le mauvais temps est sûr.

## 8. Données manquantes

Aucune valeur n'est remplacée en silence par une valeur neutre :
- un critère de favorabilité manquant sort du calcul, et la note dit sur quelle part elle repose ;
- une donnée de sécurité manquante rend la sortie « à vérifier » ;
- une espèce sans source de saison (le saint-pierre) garde une confiance faible et le dit.

## 9. Réponse et affichage (phase 13)

1. **Sortir ?**
   - « Oui, de 7 h à 11 h 30 », « à vérifier : visibilité inconnue », ou « non : force 6 prévue à 10 h, au-delà de ta limite (force 5) ».
   - La raison est écrite, avec l'heure du pire moment.
2. **Où et quoi** : tes zones, puis les espèces ouvertes, triées par favorabilité.
   - Chaque score se décompose.
   - Pastilles : la même famille de bleus que le BORD.
3. **Comment** : technique et poids conseillés d'après ton matériel ; taille, quota, marquage et déclaration de l'espèce.
4. **Toujours** (SEC_RAPPELS) : BMS non lu (lien), aide à la flottabilité, canal 16, 196, itinéraire donné à un proche.

## 10. Scénarios de référence (à coder en tests, phase 10)

| # | Situation | Attendu |
| --- | --- | --- |
| B1 | Force 7 prévue à 10 h sur un créneau de 7 h à 12 h | Non recommandé (BMS, pire moment du créneau) |
| B2 | Bateau de catégorie D, vagues de 0,6 m | Non recommandé (catégorie) |
| B3 | Zone à 7 milles d'un abri, armement côtier | Non recommandé (Division 240) |
| B4 | Vent inconnu sur le créneau | À vérifier, jamais au vert |
| B5 | Visibilité 0,3 mille ; puis visibilité inconnue | Non recommandé ; puis à vérifier |
| B6 | Raz, vent contre le courant, mi-marée | Non recommandé |
| B7 | Retour prévu après le coucher du soleil | À vérifier |
| B8 | Lieu jaune le 15 mars | Espèce non proposée, raison réglementaire ; jamais en relâcher |
| B9 | Maquereau en janvier, puis en juillet (eau à 16 °C) | Présence faible, puis forte |
| B10 | Vieille de nuit | Favorabilité basse (lumière) |
| B11 | Conditions de pêche parfaites et force 7 | Non recommandé : la sécurité ne se compense pas |
| B12 | Deux zones qui ne diffèrent que par la confiance | Même rang |
| B13 | Lieu noir au sud de Brest, sans sortie qui en a pris | Non proposé, ou proposé avec une confiance faible (selon la décision) |
| B14 | 5 sorties seulement | Pas d'ajustement personnel |
| B15 | Vent qui forcit pendant le créneau | Le maximum compte, pas la moyenne |
| B16 | Seul à bord, force 4 prévue, seuils de départ (à vérifier dès la force 5) | À vérifier : seul à bord, le seuil descend d'un cran, à la force 4 |

## 11. Plan d'épreuve

Le plan reprend celui du BORD (phase 8) :
- journées archivées d'Open-Meteo pour tes zones, au moins 30 réparties sur l'année ;
- 1 000 tirages ; entrées perturbées selon leur incertitude, hypothèses selon leur niveau de preuve ;
- règle de décision écrite avant chaque passage.

Une différence : la sécurité est mesurée à part. Le coût de chaque seuil se mesure en sorties « non recommandé » par mois, pour ton bateau.

## 12. Hypothèses à éprouver

- Tous les poids des sections 4 à 6.
- Les marges de SEC_CATEGORIE, SEC_SEUL et SEC_DONNEES.
- Les seuils de SEC_VENT et SEC_MER proposés à Félix.
- La règle de nuit.
- Le poids de tête nécessaire selon la profondeur et la dérive.
- La saison du saint-pierre.
- La présence du lieu noir en Finistère.

Chacune garde son niveau de preuve dans `data/knowledge/bateau.json`.

## 13. Ce qui reste du code actuel

Gardé tel quel, et testé :
- `sanitizeBoatSpot` et `sanitizeTrip` ;
- `mergeById` (fusion avec GitHub) ;
- `conditionsOf` (conditions d'une sortie) ;
- `fitModel`, `predictRate` et `curveOf` (apprentissage personnel) ;
- `fetchPoints` (`wx.js`).

À ajouter en phase 10 : `src/bateau/engine/` (sécurité, favorabilité par espèce, pertinence, confiance, réglementation des espèces) ; dans `wx.js`, la visibilité, l'orage et le courant ; le profil du bateau.

Les données de chaque espèce et de sa réglementation vont dans `data/` ; le code n'en contient aucune.
