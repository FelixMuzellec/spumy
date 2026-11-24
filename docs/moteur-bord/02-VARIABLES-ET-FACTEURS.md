# Variables environnementales et facteurs complémentaires

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**.

Ce document passe en revue chaque variable du § 9.1.3 et chaque facteur complémentaire du § 9.1.4. Pour chacun : ce qu'on en sait sur le bar, ce qu'on peut réellement mesurer ou prévoir, et la décision provisoire.

Les identifiants de connaissance renvoient à `data/knowledge/bar-bord.json`, où chaque fiche porte ses sources, sa zone, ses limites et son niveau (N1 scientifique à N5 heuristique).

Décisions possibles :
- **RETENU** : variable utilisée par le contrat provisoire ;
- **RETENU (sécurité)** : utilisée seulement par le contrat de sécurité ;
- **CANDIDAT** : à rechercher ou à tester en phase 7 ou 8, sans effet aujourd'hui ;
- **ÉCARTÉ** : ni preuve ni donnée ;
- **NON VÉRIFIABLE** : la question est légitime, mais aucune donnée ne permet d'y répondre.

## 1. Données réellement disponibles dans l'application (VÉRIFIÉ, `src/core/wxcore.js`)

| Fournisseur | Variables | Résolution et limite connue |
| --- | --- | --- |
| Open-Meteo, prévision (AROME `meteofrance_seamless`, ECMWF `ecmwf_ifs`) | pression, nébulosité, précipitations, vent moyen, direction et rafales à 10 m, température de l'air | maille du modèle, pas le poste ; deux modèles pour l'accord |
| Open-Meteo, API marine | hauteur, direction et période des vagues et de la houle ; température de surface de l'eau | maille marine utilisée à 15 km au plus du spot pour la houle, 30 km pour l'eau ; surface seulement |
| Calcul de marée du guide | heures et hauteurs de pleine et basse mer, coefficient, au port de référence du guide | port de référence, pas le poste ; pas de courant |
| Éphémérides (calcul) | lever, coucher, crépuscules | exact |
| Fiches des spots (V2 et V3) | régime, exposition, fenêtres de marée, plage de coefficient, maximum de houle, engagement, accès | niveaux de preuve par rubrique ; 75 fiches sur 98 ont un accès selon la marée INCONNU |

- **Non disponibles aujourd'hui** :
  - courant au poste ;
  - turbidité instrumentale ;
  - salinité, oxygène ;
  - débit des rivières ;
  - proies ;
  - fréquentation.
- **Licences et quotas** : Open-Meteo et la marée sont décrits dans `docs/DATA_SOURCES.md`. Toute nouvelle source exige le même relevé (§ 9.1.8 : fournisseur, licence, coût, quota, couverture, résolution, fraîcheur, repli).

## 2. Variables du § 9.1.3

| Famille | Variable | Ce qu'on sait sur le bar (preuve) | Donnée disponible | V2 | Décision provisoire | Double compte à surveiller |
| --- | --- | --- | --- | --- | --- | --- |
| Pression | valeur brute | `pression` N5 : blogs, aucune étude sur le bar | oui (prévision) | non (moteur v1 seulement) | **ÉCARTÉ** comme prédicteur (§ 9.1.3) | fronts, vent, houle |
| Pression | tendance sur 3 à 12 h | aucune preuve | calculable | non | **CANDIDAT** de recherche seulement : gain hors échantillon exigé, après contrôle du vent et de la houle | idem |
| Vent | force et exposition au poste | `vent-exposition` N2 (principe de pêcheurs : vent de mer modéré favorable, vent de terre défavorable de jour) ; valeurs N4 | oui, deux modèles | C4, table sur 30 | **RETENU** (C4) ; table à challenger (N4) | houle et « mer formée » (audit A5) |
| Vent | rafales | `rafales-penalite` N5 pour la pêche ; `filtre-vent` N1 pour la sécurité | oui | sécurité | **RETENU (sécurité)** ; aucun effet halieutique sans preuve | — |
| Vent | évolution, fetch | aucune preuve sur le bar | évolution : oui ; fetch : non | non | **CANDIDAT** (fetch : exposition de la fiche, déjà dans C4) | exposition |
| Eau | température T | `migration-saisonniere` N1, `frai-temperature` N1 (frai ≥ 9 °C environ) ; `seuils-thermiques` N4 (paliers sans source ; bars suivis jusqu'à 6,5 °C) | oui, surface, maille marine | facteur thermique | **RETENU** (disponibilité biologique), valeurs à challenger (audit A6) | saison (minimum des deux, pas de produit) |
| Eau | variation ΔT sur 24 à 48 h | aucune preuve trouvée sur le bar côtier | calculable | non | **CANDIDAT** (phase 7 : recherche ; phase 8 : test) | T, saison |
| Eau | anomalie saisonnière, stratification | aucune preuve ; pas de donnée de stratification | anomalie : calculable avec un historique | non | **NON VÉRIFIABLE** aujourd'hui | — |
| Marée | phase (flot, jusant) et fenêtres du poste | `maree-flot` N2 (Edwards 2025, de Pontual 2023 : signal de marée sur environ 35 % des marques) | heures de marée du port ; fenêtres des fiches V2 | C1 (porte et 25 ou 15) | **RETENU** ; fenêtre absente : « non déterminable » (audit A3) | coefficient |
| Marée | coefficient | `coefficient-plage-utile` N4 ; `courant-coefficient` N2 (SHOM : vitesse croissante avec le coefficient) | oui (port du guide) | C2 | **RETENU**, plage utile par poste ; sans plage : INCONNUE (audit A16) | courant, turbidité (`gros-coefficient-turbidite` N4) |
| Marée | hauteur d'eau au poste | dépend du poste ; règle des douzièmes N2 | calculable au port | non | **CANDIDAT** : seuil `h_seuil` par poste à documenter (fiches V3 `tide_approaches`) | phase |
| Courants | vitesse et direction au poste | `courant-coefficient` N2 (atlas du SHOM) ; aucun courant « optimal » sourcé | non (atlas SHOM : licence à vérifier) | coefficient comme substitut | **CANDIDAT** : source et licence à vérifier en phase 7 | coefficient |
| Houle et mer | hauteur, période, direction | `houle-turbidite` N4 (eau chargée dès 1,5 m) ; `houle-max-spot` N4 (sécurité) | oui | C3 « mer formée » (+0 à 3) ; sécurité | **RETENU (sécurité)** ; effet halieutique : hypothèse, à séparer du vent (audit A5) | vent |
| Lumière | phase solaire | `lumiere-basse` N2 (Millot et Bégout 2009, Chen 2023 : en bassin et en cage ; aucune étude en milieu naturel) | oui (calcul) | C3 | **RETENU** ; marche de l'aube à revoir (audit A4) | ciel |
| Lumière | nébulosité | `ciel-couvert` N5 | oui | C3 (+3) | **RETENU** avec son niveau N5, sans poids plus fort | lumière |
| Lumière | phase lunaire | aucune preuve | calculable | non | **ÉCARTÉ** (§ 9.1.8 : aucun poids sans gain démontré) | marée |
| Eau | turbidité | `pluie-turbidite` N4, `houle-turbidite` N4 ; pas de mesure | non (proxys pluie et houle) | conseils de leurres seulement | **CANDIDAT** par proxys, en conseils seulement ; pas dans la Favorabilité | houle, pluie, coefficient |
| Eau | salinité, oxygène | aucune donnée locale | non | non | **NON VÉRIFIABLE** (§ 9.1.8 : exclu sans sonde) | — |
| Habitat | profondeur, substrat, relief, structures, exposition | fiches V2 et V3 (rubriques à niveaux de preuve) | fiches | régime et exposition (C4, saison) | **RETENU** comme description du poste et paramètres (régime, exposition, plage utile) ; pas de score d'habitat autonome | régime et saison (abri) |
| Ressources | proies | `proies-calendrier` N5 ; Spitz 2013 : bars du large en automne et en hiver seulement | non | conseils de leurres | **ÉCARTÉ** de la Favorabilité ; gardé pour le conseil de leurres | saison |
| Temps | saison, période biologique | `migration-saisonniere` N1 ; valeurs mensuelles N4 | oui | facteur de saison | **RETENU** (disponibilité biologique) | température |
| Temps | heure et durée de fenêtre | fenêtres de fiche | oui | C1 | **RETENU** ; spots comparés sur des fenêtres cohérentes (REC-09) | — |

### 2.1 Interactions à garder explicites

| Interaction | Où | Statut |
| --- | --- | --- |
| Saison × température de l'eau | minimum des deux (aucun produit, aucun double compte) | structure gardée ; eau inconnue : intervalle (D6-03) |
| Saison × régime « abri » | écart d'hiver réduit de moitié ; plancher thermique 0,5 à 0,6 | hypothèse N4 (`abri-hiver`), contredite en partie par l'absence d'observation locale ; à challenger en phase 7 |
| Vent × exposition × régime | table `VENT_MER` | N4 ; la règle (vent de mer modéré favorable) est N2 |
| Lumière × ciel × mer | jour : 5 + 3 si couvert + 0 à 3 selon la houle | N4 et N5 ; « mer formée » double le vent (A5) |
| Coefficient × plage utile du poste | trapèze par poste | N4, compensation additive (A15) |
| Eau chaude × heure | `eau-chaude` N5 (activité décalée vers la nuit au-delà de 19 °C) | V2 : facteur 0,9 seulement, sans décalage horaire ; **CANDIDAT** |

### 2.2 Effet sur le poisson ou effet sur le pêcheur

| Variable | Effet sur le poisson (Favorabilité) | Effet sur le pêcheur (exploitabilité, sécurité) |
| --- | --- | --- |
| Vent | clapot, eau moins claire, bar moins méfiant (N2) | lancer, tenue de ligne (N5) ; sécurité (N1) |
| Houle | turbidité (N4) | sécurité, accès (N4) |
| Coefficient | eau qui « travaille » (N4) | courant praticable du bord (N4) ; sécurité au-delà de la limite documentée |
| Nuit | activité (N4) | sécurité sur un poste engagé (validée) |

Le contrat provisoire garde ces deux effets à part : l'effet sur le pêcheur va dans la sécurité ou dans un plafond d'exploitabilité (D6-04), jamais dans un bonus.

## 3. Les six composantes du § 9.1.4

| Composante | Mesurable ? | Où dans le contrat provisoire |
| --- | --- | --- |
| Disponibilité biologique | en partie : saison (N1 pour le cycle, N4 pour les valeurs) et eau de surface | P, multiplicateur (structure V2) |
| Comportement et activité | en partie : lumière (N2), marée (N2) | C1, C3 |
| Adéquation habitat et poste | descriptif : régime, exposition, fenêtres, plage utile | paramètres des critères, pas de sous-score |
| Conditions environnementales | vent (N2 pour la règle) | C4 |
| Exploitabilité halieutique | coefficient praticable, houle | C2, plafond (D6-04) ; jamais le matériel personnel |
| Fenêtre temporelle | fenêtres de fiche et créneaux | C1 et comparaison de fenêtres cohérentes |

Aucune composante n'est affichée comme sous-score. Elles servent à expliquer la note (§ 9.4).

## 4. Facteurs complémentaires du § 9.1.4

| Facteur | Preuve trouvée | Donnée disponible | Décision provisoire | Raison |
| --- | --- | --- | --- | --- |
| Pression de pêche locale, fréquentation, dérangement (bateaux, éclairage, bruit) | aucune étude reliant la fréquentation d'un poste au comportement du bar côtier n'a été trouvée dans les sources de la phase 5 | aucune (pas de comptage) | **NON VÉRIFIABLE** | Ni preuve ni donnée. Le tag « dérangement manifeste » du journal (§ 9.1.9) reste descriptif ; il exclut la session des mises à jour structurelles, il ne pénalise pas le poste |
| Disponibilité locale des proies | `proies-calendrier` N5 ; Spitz et al. 2013 (régime des bars du large en automne et en hiver) | aucune donnée locale ni proxy validé | **ÉCARTÉ** de la Favorabilité | Le § 9.1.4 interdit d'inférer une abondance de proies sans source ; le calendrier reste un conseil de leurres |
| Apports d'eau douce, salinité, oxygène, qualité de l'eau | aucune preuve locale ; la proximité d'un estuaire ne prouve pas un front de salinité (§ 9.1.8) | débit des rivières : possible (hydrométrie publique), source et licence non vérifiées | **CANDIDAT** de recherche (débit) ; salinité et oxygène **NON VÉRIFIABLES** | Le régime « abri » (ria, havre, estuaire) porte déjà l'hypothèse d'hivernage (N4) : un débit ajouté doublerait le compte sans preuve |
| Observations locales de présence et de captures (journaux, sources identifiables) | sources de la phase 5 : présence du bar au poste (QUAL-2) ; journal de Félix : 3 sessions (phase 8 V2) | journal de l'application | **RETENU** par le moteur 2 seulement (document 04), avec l'effort et les bredouilles confirmées ; sans effet sur la note avant validation | Le § 9.1.4 interdit la popularité, les avis ou le volume brut de prises comme substituts d'une preuve de présence |
| Évolution ou perturbation de l'habitat (travaux, dragage, ensablement) | aucune donnée datée et localisée | aucune | **NON VÉRIFIABLE** | Une fiche peut porter un changement daté (rubrique descriptive) ; il réduirait la transférabilité des sessions anciennes du moteur 2 (§ 9.1.9), pas la note |

## 5. Ce qui reste à trouver (pour la phase 7)

- **Sources sur les seuils thermiques du bar côtier** en Manche et en Bretagne (télémétrie, marquage) : pour remplacer ou confirmer les paliers N4.
- **Sources sur l'effet de la lumière en milieu naturel** : seules des études en bassin et en cage existent dans le référentiel.
- **Courant au poste** : atlas du SHOM ou modèle public, avec licence et résolution vérifiées.
- **Débit des rivières** près des postes « abri » : source, licence, résolution.
- **Plage utile du coefficient** des postes sans bornes sourcées.
