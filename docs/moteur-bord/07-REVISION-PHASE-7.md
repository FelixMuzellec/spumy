# Proposition de révision du moteur BORD (phase 7)

Phase 7 V3, livrable du cadrage : une proposition chiffrée de révision des paramètres du moteur, tirée de la revue régionale (`docs/halieutique/REVUE-REGIONALE-BAR.md`).

C'est un **changement à valider**. Il n'est pas appliqué dans `src/` (PF-19 : aucun changement du moteur avant l'approbation qui suit la phase 9). Le moteur V2 garde ses coefficients. Il touche la décision V3-031 (D6-13, saison dans le moteur 2) : il est présenté comme un changement, à arbitrer après les phases 8 et 9.

Calcul reproductible :
- programme : `scripts/revision-saison.mjs` ;
- résultat : `data/moteur-bord/revision-saison-phase-7.json` ;
- contrôle : `npm run test:revision-saison`, lancé par `npm test`.

## 1. Ce qui change : la saison, par zone de validité

La zone de validité est lue sur la position du spot. Elle n'est jamais affichée comme un secteur (PF-09).

| Zone (position) | Spots | Proposition | Appui | Statut |
| --- | --- | --- | --- | --- |
| Bretagne nord et Iroise (au nord du 48ᵉ parallèle, hors Cotentin) | 42 | creux déplacé de février à mars ; avril abaissé | migrants majoritaires (67 à 71 %) ; ponte de janvier à avril-mai, pic de mi-février à fin mars (bars débarqués à Roscoff) ; débarquements de la ligne de traîne au plus bas en mars-avril | HYPOTHÈSE de niveau 4, sur des sources de niveau 1. **Extrapolation** : les 42 spots comprennent les 8 spots abrités de la rade de Brest (guide de Logonna) et des spots de la baie de Douarnenez (Morgat, Pentrez), où aucun bar n'a été marqué : la table y est INFÉRÉE des marquages d'Iroise et de Bretagne nord |
| Bretagne sud (au sud du 48ᵉ parallèle) | 14 | **inchangée** | aucune source régionale pour la côte ; résidents surtout au centre du golfe | INFÉRÉ |
| Cotentin (à l'est de 2° O et au nord de 48° 45' N) | 10 | **inchangée** | Saint-Vaast : la plupart des bars restent dans l'aire nord ; côte ouest (Pirou) sans marquage | INFÉRÉ ; Confiance à baisser au printemps (§ 3) |

Coefficients mensuels de présence, de janvier à décembre :

| Table | J | F | M | A | M | J | J | A | S | O | N | D |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V2, roche et plage | 0,6 | 0,5 | 0,55 | 0,75 | 0,95 | 1 | 1 | 1 | 1 | 1 | 0,95 | 0,75 |
| Proposée, Bretagne nord et Iroise, roche et plage | 0,6 | **0,55** | **0,5** | **0,6** | **0,9** | 1 | 1 | 1 | 1 | 1 | 0,95 | 0,75 |
| V2, abri | 0,675 | 0,575 | 0,625 | 0,8 | 0,975 | 1 | 1 | 1 | 1 | 1 | 0,975 | 0,825 |
| Proposée, Bretagne nord et Iroise, abri | 0,675 | **0,6** | **0,6** | **0,725** | **0,95** | 1 | 1 | 1 | 1 | 1 | 0,975 | 0,825 |

L'abri reçoit la moitié du changement de la côte ouverte, comme en V2. L'hypothèse `abri-hiver` reste au niveau 4 : le seul indice régional porte sur cinq poissons à Audierne.

Aucune source ne donne ces valeurs. Seuls le sens et le mois du creux sont sourcés. Ce sont des hypothèses à éprouver sur le journal (PF-34), jamais des faits.

## 2. Impact sur les 66 spots

Les chiffres viennent de `data/moteur-bord/revision-saison-phase-7.json`.

- **Spots touchés** : 42 sur 66, tous en Bretagne nord et en Iroise, de février à mai seulement. De juin à janvier, rien ne change.
- **Écart du facteur de saison** :
    - février : + 0,05 sur la côte ouverte, + 0,025 en abri ;
    - mars : − 0,05 sur la côte ouverte, − 0,025 en abri ;
    - avril : − 0,15 sur la côte ouverte, − 0,075 en abri ;
    - mai : − 0,05 sur la côte ouverte, − 0,025 en abri.
- **Ordre relatif** : dans un même guide, l'écart de facteur entre deux spots change d'au moins 0,1 pour **24 paires**, toutes en avril et toutes dans le guide d'Audierne. Ce sont les spots au nord du 48ᵉ parallèle face à ceux du sud (Penhors, la Torche). En avril, les spots du sud gagnent donc du terrain sur ceux du cap Sizun.
- **Ce qui n'est pas mesuré ici** : le rang réel. Il dépend de toute la Favorabilité (marée, lumière, vent, eau). La part de la saison dans la variance était de 21,4 % à l'épreuve V2 (`saison-coefficients`). L'effet sur le classement se mesure à l'épreuve de la phase 8, contre le journal.

## 3. Autres propositions, sans valeur chiffrée

| Paramètre | Proposition | Raison | Effet |
| --- | --- | --- | --- |
| Paliers de température (`seuils-thermiques`) | garder tant que l'épreuve n'a pas tranché ; corriger le texte « l'essentiel des adultes a rejoint le large sous 7,5 °C », mis en doute par des marques archives qui ont enregistré 6,5 °C en Manche ouest (Goossens 2024). De Pontual 2023 donne aussi un minimum vers 6,5 °C, mais sans zone, et le dit plus proche des eaux continentales ou estuariennes que du large | Goossens 2024 ; de Pontual 2023 | texte du moteur 2 (phase 10), pas de valeur |
| Confiance au printemps au Cotentin ouest | dimension « connaissance de la saison » plus basse de mars à mai pour les spots du Cotentin (aucun marquage ; zone de transition entre les deux sous-populations) | `structure-stock-saisonniere`, `printemps-cotentin` | la Confiance ne change jamais le rang (PF-08) |
| Proies du mois (`proies-calendrier`) | rien ne change : aucun calendrier côtier publié ; les havres et les estuaires gardent les petits crustacés comme indice (`regime-juveniles-crustaces`) | lacune maintenue | — |
| Abri | gardé au niveau 4 ; à confronter au journal de Félix (voie empirique), jamais copié dans le dépôt | `abri-hiver` | — |
| Activité selon l'heure et la météo | rien ne change ; règles sans zone de validité (AUCUNE), à éprouver | PF-33 le montre | — |

## 4. Pour décider (après les phases 8 et 9)

1. Garder la table V2 partout (statu quo).
2. Adopter la table proposée pour la Bretagne nord et l'Iroise seulement (**recommandée**). C'est le seul changement que soutiennent des sources régionales, et il ne touche que quatre mois.
3. Aller plus loin (creux plus profond, saison propre au Cotentin) : non recommandé sans données. Ce serait forcer une granularité que les études ne donnent pas (référentiel, § 9.1.2).
