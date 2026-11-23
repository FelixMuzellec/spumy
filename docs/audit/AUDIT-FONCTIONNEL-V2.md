# Audit fonctionnel V2 — BORD (Inshore) et BATEAU (Offshore)

Phase 5 V3, livrable 1, sous-tâche 5.2. 23 novembre 2026.

**Version auditée** : la version publiée, étiquette `v2-final` (bb4f940, version 10.0). Les guides et les fiches de spots n'ont pas changé depuis : l'inventaire de la sous-tâche 5.1 le vérifie à chaque `npm test`.

**Statuts** :
- **VÉRIFIÉ** : constaté dans le code, les données ou une mesure de cette session ;
- **INFÉRÉ** : déduit des documents V2 (`docs/FONCTIONNALITES.md`, `docs/SPEC-MOTEUR-BORD-V2.md`, `docs/SPEC-MOTEUR-BATEAU.md`), sans nouvelle mesure.

Ce document complète l'audit de la phase 1 (`docs/rapports/v3/PHASE-1.md`, § 5) sans le répéter. Il se concentre sur ce dont dépend le référentiel des spots : espèces, spots, données, sécurité, matériel, localisation.

## 1. Parcours

| Parcours | V2 | Statut |
| --- | --- | --- |
| Accueil | deux onglets, **Inshore** (du bord) et **Offshore** (bateau) ; recherche d'un spot ; carte des sept guides ; guides regroupés par département | VÉRIFIÉ (`src/app/home.jsx`, test de mise à jour) ; département : PHASE-1 § 5.2 |
| Guide BORD | une page par guide (7) ; onglets Synthèse, Spots, Photos, Leurres, Marée, Météo, Saison, Journal, Règles ; verdict du jour (n° 1, 2 et 3) | INFÉRÉ (`FONCTIONNALITES.md`) ; écrans : PHASE-1 § 5.3 |
| Spots personnels | ajoutés depuis l'accueil, rangés dans le guide de la fiche la plus proche | INFÉRÉ |
| Offshore | spots bateau ajoutés par la personne seulement ; sorties ; conditions ; note apprise sur les sorties | VÉRIFIÉ (`src/bateau/offshore.js`) |

## 2. Moteurs et scores

| Élément | BORD (moteur v2 par défaut) | BATEAU | Écart à la V3 |
| --- | --- | --- | --- |
| Scores | Favorabilité, **Pertinence** (boîte de leurres et distance), Confiance ; note v1 sur 10 encore disponible | note apprise : régression de Poisson des prises sur les conditions, après 8 sorties avec prise | V3 : deux scores seulement ; Pertinence et note sur 10 supprimées (`CLAUDE.md`) |
| Favorabilité | conditions (fenêtre de marée 25, coefficient 20, lumière 25, vent et mer 30) × présence du bar (saison, température) | aucune par espèce | refaite en phases 6 à 9 à partir du référentiel biologique (5.5) |
| Sécurité | filtre avant la note : force 8, rafales de 90 km/h, houle au-delà du maximum du spot, coefficient maximal propre à 6 spots, consignes datées | **aucune** | V3 : sécurité indépendante, jamais compensée, en BORD comme en BATEAU |
| Classement | spots sûrs, puis « à vérifier » ; Favorabilité ; à égalité, le plus proche (`distMin` de la fiche) | — | V3 : la Confiance ne change jamais le rang (déjà vrai) ; la distance devient un temps de route réel depuis la position |

Les détails de chaque point sont VÉRIFIÉS dans `src/bord/engine/v2.js` (`pertinence`, départage par `distMin`) et `src/bord/engine/safety.js`. Les poids sont INFÉRÉS de `SPEC-MOTEUR-BORD-V2.md`.

## 3. Espèces réellement prises en charge (§ 9.1.2 : « auditer d'abord la liste réelle »)

| Mode | Espèces | Statut |
| --- | --- | --- |
| BORD | **bar seulement** (`data/knowledge/bar-bord.json` : `espece`) | VÉRIFIÉ |
| BATEAU, connaissances | lieu jaune, lieu noir, maquereau, bar, vieille, saint-pierre (`data/knowledge/bateau.json` : `especes`) | VÉRIFIÉ |
| BATEAU, journal des sorties | liste plus large pour noter les prises (31 espèces selon la spécification) | INFÉRÉ ; liste dans `src/bateau/offshore.js` (`SPECIES`) |

**Conséquence pour la phase 5** : le référentiel biologique (5.5) couvre le bar en priorité (BORD) et les six espèces BATEAU. Le périmètre produit n'est pas élargi (§ 9.1.2).

## 4. Spots V2

Mesures de l'inventaire 5.1 (`data/spots/v2/inventaire.json`, VÉRIFIÉ) :

| Mesure | Valeur |
| --- | --- |
| Spots | **66**, dans 7 guides : Logonna 11, Pirou 10, Plouguerneau 10, Audierne 11, Carantec 7, Concarneau 10, Crozon 7 |
| Identifiants | 66 uniques ; gardés comme identifiants V3 (V3-018) |
| Coordonnées numériques | 59 sur 66. **7 spots du guide Pirou** n'ont qu'un texte à la minute près, soit environ 1,8 km sur 1,2 km d'incertitude : Pirou, Régnéville, Gouville, Agon, Portbail, Carteret, Surtainville |
| Point d'accès ou stationnement | **absent** de toutes les fiches : la coordonnée est celle du lieu, pas de l'accès (RTE-04) |
| Distance | `distMin` : minutes fixes depuis le centre du guide, et non depuis la position de la personne |
| Zones | `zone` (local, inter, far, sud, aber, riviere, ouest) : ancrages météo propres à chaque guide, donc des **secteurs**, à retirer du produit (PHASE-1 § 5.2) |
| Port de marée | `tidePort` sur 55 spots ; les 11 autres suivent le port du guide |
| Engagement | `dangerLevel` 1 : 22 spots, 2 : 28, 3 : 16 |
| Sécurité | `securite`, `houleMax`, angles exposés et abrités sur les 66 ; `coefHardMax` sur 6 |
| Sources | 4,0 sources par spot en moyenne (`sources`) ; indépendance et date **non évaluées** (§ 7.1) |
| Marée | `tidalRules` sur les 66 ; les quatre phases (basse, montante, haute, descendante) ne sont **pas documentées séparément** (§ 7.5) |
| Fenêtres horaires | aucune fenêtre habituelle documentée par spot (§ 7.6) ; les créneaux sont calculés (phases de marée × lumière) |
| Leurres | `lures` sur les 66 ; à transformer en conseil générique (§ 7.4.1) |
| Photos | photos d'ambiance V2, jamais présentées comme le lieu (règle V2 gardée) ; photos réelles de chaque spot **non inventoriées** |

## 5. Données et sources

| Donnée | V2 | Statut |
| --- | --- | --- |
| Connaissances | 27 connaissances BORD, 35 BATEAU, 396 rubriques de spot, chacune avec un niveau de preuve de 1 (scientifique) à 5 (heuristique) | VÉRIFIÉ (`npm run test:knowledge`) |
| Marée | calculée sur l'appareil (constantes harmoniques TICON-4) ; écarts contrôlés contre les tables du SHOM de 3 à 6 min, jusqu'à 40 min pour les ports interpolés du Cotentin en morte-eau | INFÉRÉ (`FONCTIONNALITES.md`) |
| Météo et mer | Open-Meteo (AROME, ECMWF, Marine) ; en rade de Brest, mer estimée par le vent et le fetch | VÉRIFIÉ (contrat Open-Meteo 28/28) |
| Réglementation du bar | arrêté du 1er avril 2026, appliqué spot par spot selon le 48ᵉ parallèle | INFÉRÉ ; à revérifier en 5.7 (date et source officielles) |
| BATEAU, réglementation | aucune pour les espèces du bateau | INFÉRÉ (`SPEC-MOTEUR-BATEAU.md` § 0) |

## 6. Matériel

- BORD : la boîte de leurres est gardée sur l'appareil (`bar:boite`, `src/bord/engine/tackle.js`) et **entre dans la note** par la Pertinence (VÉRIFIÉ, `pertinence` dans `v2.js`).
- La V3 l'interdit : l'inventaire ne touche jamais Favorabilité, Confiance, sécurité ni classement (§ 7.4.1). En V3, le conseil de leurres est générique, calculé à partir du spot et des conditions ; la sélection dans la boîte est différée.

## 7. Localisation

- **Aucune position dynamique** : chaque guide a un centre fixe (`SITE.lat`, `SITE.lon`), et la distance d'un spot est une constante de sa fiche (VÉRIFIÉ, `distMin`).
- La V3 remplace ce modèle par une position de référence (appareil ou saisie), le temps de route de l'IGN et la limite de 60 min en BORD (ARCHITECTURE-V3 § 4). C'est pourquoi la phase 5 doit vérifier le **point d'accès** de chaque spot.

## 8. Écarts à traiter par la phase 5

1. Coordonnées vérifiées et précision, pour les 66 spots ; priorité aux 7 spots sans coordonnées numériques.
2. Point d'accès ou stationnement, et temps de marche, pour chaque spot : condition du filtre des 60 min et de son étalonnage.
3. Approches par phase de marée, documentées séparément (§ 7.5), et fenêtres habituelles seulement si elles sont documentées (§ 7.6).
4. Sources : évaluation (§ 7.1), indépendance, date, affirmation soutenue ; registre central (5.4).
5. Réglementation : source officielle et date de vérification par spot.
6. Qualification explicite de chaque fiche (5.9).
7. Photos réelles de chaque spot et leur provenance.
8. Recherche de nouveaux spots, Bretagne → Cherbourg (5.6 et 5.8). Aujourd'hui, la couverture suit les sept guides ; elle est mesurée en 5.10.

Hors de la phase 5 :
- moteur (phases 6 à 9) ;
- sécurité BATEAU (V3-014) ;
- interface (phases 10 à 12).
