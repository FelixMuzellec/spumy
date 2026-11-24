# Scénarios, fixtures, sensibilité et robustesse

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**.

- **Fixtures** : `data/moteur-bord/scenarios.json`.
- **Résultats** : `data/moteur-bord/resultats-etude.json` (E5, E6, E8).
- **Tests** : `tests/etude-moteur-bord.mjs`, branché sur `npm test` et sur la CI.
- **Rappel du § 13.3** : un Monte Carlo évalue la cohérence interne, jamais l'exactitude terrain.

## 1. Scénarios et fixtures (E8)

Vingt et un scénarios joués sur des spots réels des guides, sur le vrai moteur V2, sur l'architecture A1 et sur le contrat de sécurité proposé.

- **Spots** :
  - Dinan, à Crozon : côte rocheuse ouverte, poste engagé, plage utile du coefficient de 60 à 95 ;
  - Mousterlin : fiche assez documentée pour être SAFE ;
  - Pentrez : plage ;
  - Portbail : havre hors rade ;
  - Moulin Mer : rade.
- **Données de sécurité** : celles de la fiche V3 de chaque spot (engagement, houle maximale, accès selon la marée, réglementation locale lue) et les consignes V2 du guide.
- **Valeurs d'essai par défaut** :
  - août, eau à 17 °C ;
  - fenêtre « prime », coefficient 70, aube ;
  - vent de mer force 3, houle 0,6 m ;
  - rafales 40 km/h.

Les vingt et une propriétés sont tenues.

| N° | Famille | Scénario | Résultat (V2 ; A1 ; sécurité) | Propriété vérifiée |
| --- | --- | --- | --- | --- |
| S01 | saison | Février, eau à 8 °C, conditions au maximum | 50 ; 50 ; INSUFFICIENT_DATA (accès selon la marée inconnu) | la biologie limite : ≤ 50 malgré des conditions à 100 |
| S02 | habitat | Même hiver, rade abritée (Moulin Mer) | 49, présence 0,575 contre 0,5 | l'abri garde une présence plus haute (hypothèse N4 visible) |
| S03 | saison | Plein été, aube, vent de mer force 3 | 100 | ≥ 75 |
| S04 | transition | Avril, eau à 10,5 °C | 75 | entre l'hiver et l'été |
| S05 | température atypique | Eau à 22 °C en août | 72, présence 0,72 | présence plus basse qu'à 17 °C |
| S06 | température atypique | Eau à 7 °C en mai | 30, présence 0,3 | présence au plancher |
| S07 | seuil | Même créneau en plein jour, ciel clair | 82 contre 100 | saut de 18 points à l'aube (A4) |
| S08 | compensation | Coefficient 112, au-delà de la plage utile | 80, 0 point de coefficient | une note « Très bon » avec un coefficient hors plage (A15) |
| S09 | données manquantes | Vent inconnu | V2 100 (renormalisé) ; A1 de 70 à 100, qualitatif ; INSUFFICIENT_DATA | V2 dans l'intervalle A1, qui n'est pas publié en nombre |
| S10 | données manquantes | Houle inconnue en côte ouverte | V2 100, vent retiré ; A1 de 70 à 100 (hérite de A5) ; DANGER (poste engagé) | A5 ; la sécurité ne passe pas au vert |
| S11 | données manquantes | Eau inconnue en mai, réellement à 10,5 °C | V2 95 contre 75 avec l'eau réelle ; A1 de 30 à 95, qualitatif | une eau inconnue remonte la note V2 de 20 points (A6) ; A1 ne note pas |
| S12 | données contradictoires | AROME force 3, ECMWF force 6 (Mousterlin) | CAUTION ; le même spot sans désaccord est SAFE (S21) | la sécurité lit le plus fort des deux modèles (D6-14) |
| S13 | météo changeante | Le vent forcit à 7 pendant la fenêtre (Mousterlin) | CAUTION | la sécurité lit la pire heure du créneau |
| S14 | sécurité | Nuit, engagement inconnu (cas d'une fiche V3 candidate) | V2 90 ; INSUFFICIENT_DATA (engagement, nuit, accès) | jamais SAFE (A12) |
| S15 | sécurité | Houle 2,2 m pour un maximum de 1,6 m (Mousterlin) | V2 100 ; DANGER | absent du Top quelle que soit la note |
| S16 | même conditions, saisons différentes | Le même créneau en février, mai, août, novembre | 50, 92, 100, 92 | la note suit la présence ; propriété structurelle du produit |
| S17 | même saison, conditions différentes | Vent de terre force 3 au lieu du vent de mer | 80 contre 100 | vent de mer au-dessus du vent de terre (règle N2) |
| S18 | classement | Champs de Pertinence et de boîte ajoutés | ordre inchangé | REC-02, REC-10 ; doublé d'un garde-fou sur le code |
| S19 | données de la fiche | Plage de Pentrez par beau temps, accès selon la marée INCONNU | V2 98 ; INSUFFICIENT_DATA | jamais SAFE par beau temps quand la fiche ignore l'accès selon la marée (D6-15) |
| S20 | habitat | Havre de Portbail, hors rade, houle inconnue | INSUFFICIENT_DATA (houle, réglementation non lue) | un havre hors rade est en côte ouverte (définition V2) |
| S21 | témoin | Mousterlin, conditions connues sous les seuils | 100 ; SAFE | un poste documenté peut être SAFE |

- **Le constat principal** :
  - sur Dinan, tous les scénarios sont INSUFFICIENT_DATA ou DANGER, parce que la fiche ignore l'accès selon la marée ;
  - c'est le cas de 90 fiches sur 98 (`e9`, D6-15) ;
  - les règles de vent et de houle se vérifient sur Mousterlin, l'une des 8 fiches assez documentées.
- **Périmètre.** Les quatre saisons, les transitions, quatre habitats (côte rocheuse ouverte, plage, rade, havre hors rade), les températures atypiques, la compensation, les données manquantes et contradictoires, la météo qui change et la sécurité sont couverts.
- **À ajouter en phase 8.** Les phases de marée réelles (fenêtres reconstruites sur de vraies journées) et les fronts observés demandent des journées archivées. La phase 8 V2 en a téléchargé 252 : elles serviront à rejouer ces scénarios.

## 2. Sensibilité, un facteur à la fois (E5)

Sur les 47 520 créneaux, le poids de chaque critère est changé de ±40 %, l'amplitude d'une hypothèse de niveau 4. Le facteur de présence est rapproché de 1 (×0,6) ou éloigné (×1,4).

| Essai | Écart moyen (points) | Écart au 95ᵉ centile | Créneaux qui changent de palier V2 | … de classe d'affichage V3 (§ 6.7.5.1) | Spearman avec la base |
| --- | --- | --- | --- | --- | --- |
| Fenêtre −40 % / +40 % | 2,1 / 1,7 | 5 / 4 | 15 % / 14 % | 12 % / 8 % | 0,99 / 1,00 |
| Coefficient −40 % / +40 % | 2,4 / 2,1 | 5 / 4 | 18 % / 17 % | 12 % / 12 % | 0,99 / 0,99 |
| Lumière −40 % / +40 % | 2,0 / 1,7 | 5 / 4 | 16 % / 15 % | 10 % / 10 % | 0,99 / 0,99 |
| Vent −40 % / +40 % | 2,0 / 1,6 | 5 / 4 | 15 % / 12 % | 11 % / 10 % | 0,99 / 0,99 |
| Présence ×0,6 / ×1,4 | 3,9 / 3,9 | 14 / 14 | 22 % / 8 % | 19 % / 21 % | 0,96 / 0,99 |

**Lecture**
- **Ordre.** L'ordre des créneaux résiste : Spearman ≥ 0,96.
- **Paliers.** Les paliers ne résistent pas : un seul poids de critère à ±40 % fait changer de palier V2 un créneau sur six ou sept, et de classe V3 un sur dix environ. Des classes de 10 à 20 points sur une note entière sont plus fines que ce que les hypothèses soutiennent (A13).
- **Présence.** La présence est l'hypothèse la plus sensible, ce qui confirme la phase 8 V2 (première source de variance, 21,4 %).

## 3. Stabilité du classement entre spots (E6)

- **Grille** : 672 situations (7 guides × 4 mois × 3 coefficients × aube ou jour × vent d'ouest ou de nord-est × force 2 ou 4), le même vent pour tous les spots d'un guide.
- **Guides** : de simples conteneurs de données V2, pour comparer des spots proches ; pas un découpage du produit (V3-007).
- **Tirages** : 300 jeux de paramètres par situation, graine 424242 : chaque poids de critère entre ×0,6 et ×1,4, et la présence entre k 0,6 et 1,4. La météo n'est pas perturbée.

| Mesure | Valeur |
| --- | --- |
| Le premier reste premier | 91,9 % des tirages |
| Le premier reste à 3 points ou moins du premier tiré | 99,3 % |
| Le Top 3 reste le même | 85,0 % des tirages |
| Situations où le Top 3 tient dans au moins 80 % des tirages | 478 sur 672 (71 %) |
| Les mêmes, en tolérant 10 points d'écart | 672 sur 672 |
| Largeur de l'intervalle à 90 % de la note d'un spot | 12 points en médiane, 28 au 95ᵉ centile ; plus de 10 points dans 81 % des cas |

**Comparaison avec la phase 8 V2** (241 vraies journées, `docs/rapports/PHASE-8.md` § 5.2)

| Mesure | Phase 8 V2 : tout (météo et hypothèses) | Phase 8 V2 : hypothèses seules | Cette étude : hypothèses seules |
| --- | --- | --- | --- |
| Trois premiers inchangés | 35,9 % | 53,3 % | 85,0 % |
| Situations où le Top 3 tient dans 80 % des tirages | 20 sur 241 (8 %) | 63 sur 241 (26 %) | 478 sur 672 (71 %) |

- **Cette étude sous-estime l'instabilité.** Elle ne perturbe que les poids globaux des quatre critères et la présence. La phase 8 V2 perturbait en plus les paramètres N4 propres à chaque spot (plages de coefficient, heures de fenêtre, facteurs de saison) et la météo.
- **Les chiffres de D6-02 sont donc optimistes.**
- **Conclusion commune** : l'ordre exact du Top 3 n'est pas assez sûr pour être présenté comme tranché ; un écart de 10 points l'est. C'est la base de la règle de publication (01 § 5) et de la question D6-02.

## 4. Effets de seuil repérés

| Seuil | Effet | Où |
| --- | --- | --- |
| Lever et coucher du soleil | 15 points en moyenne d'un créneau à l'autre (9 à 18) | A4, S07 |
| Bornes de la plage utile du coefficient | rampe linéaire, puis 0 point sans plafond | A15, S08 |
| Couverture 0,5 | de « — » à une note complète renormalisée | A2 |
| Paliers 75, 65, 55, 45 | un point fait changer la couleur | A13, A14 |
| Paliers thermiques 7,5 / 9,5 / 11,5 / 13,5 / 19 / 21,5 °C | marches de 0,08 à 0,25 sur la présence | A6, S04 à S06 |
| Vent force 6 et 8, rafales 60 et 90 km/h | CAUTION et DANGER | sécurité, validés |

## 5. Monotonie (§ 9.3)

| Facteur | Sens dans le moteur V2 | Justification |
| --- | --- | --- |
| Présence P | croissante, multiplicative | structure (biologie d'abord, § 9.1.1) |
| Saison | non monotone sur l'année (creux de février) | cycle du frai au large (`migration-saisonniere` N1) ; valeurs N4 |
| Température de l'eau | croissante jusqu'à 19 °C, puis décroissante (0,9 puis 0,72) | `seuils-thermiques` N4, `eau-chaude` N5 : forme plausible, valeurs sans source |
| Coefficient | trapèze : nul sous la plage, plateau, nul au-delà | `coefficient-plage-utile` N4 : forme voulue (l'eau qui travaille, puis le courant trop fort) ; bornes N4 |
| Vent de mer | croissant jusqu'à la force 3, puis décroissant | `vent-exposition` N2 pour le sens ; table N4 |
| Vent de terre | décroissant | idem |
| Lumière | marches (aube et crépuscule 25, nuit 15, jour 5 à 11) | `lumiere-basse` N2 pour l'ordre aube > jour ; marches et nuit N4 (A4) |

Aucune non-monotonie n'est accidentelle. Toutes reposent sur des formes plausibles, mais aucune de leurs valeurs n'a de source (N4). La phase 8 doit vérifier qu'aucune n'inverse un ordre que les sources donnent.

## 6. Ce que ces essais ne prouvent pas

- **Pas une précision terrain.** Aucun essai ne dit si une note est juste.
- **Pas de vraies journées.** Les grilles ne sont pas de vraies journées.
- **Des amplitudes conventionnelles.** Les ±40 % sont une convention pour le niveau 4, pas une mesure de l'incertitude réelle.
- **La suite.** La phase 8 V3 doit rejouer ces scénarios sur les journées archivées et les confronter au journal, quand il aura assez de sessions confirmées (document 04).
