# Épreuve du moteur BORD sur les journées archivées (phase 8)

Phase 8 V3, 27 nov. 2026. Plan de validation de la phase 6 (`docs/moteur-bord/06-PLAN-VALIDATION.md` § 3) : les critères de réussite étaient écrits **avant** l'épreuve.
- Script : `scripts/epreuve-v3/epreuve.mjs`.
- Résultats : `data/moteur-bord/epreuve-phase-8.json`, déterministe.
- Contrôle : `tests/calibration.mjs`.

## 1. Ce qui est éprouvé, et ce qui ne l'est pas

- **Données.** 252 journées-guides réelles (le 6, le 16 et le 26 de chaque mois, de fin novembre 2025 à mi-novembre 2026, sept guides, choisies sans regarder la météo), avec la météo telle que l'application l'aurait téléchargée. Cela donne 6 105 créneaux notés et 1 741 créneaux « non recommandés » en V2. Les épreuves de classement (V-03, V-04) portent sur 234 de ces journées (§ 2).
- **Journal écarté.** Les journées de l'archive qui portent une session du journal sont écartées : rien du journal n'entre dans les résultats (PF-17).
- **Méthode.** Le vrai moteur V2 note chaque créneau. Les architectures de l'étude (B-V2, B-simple, A1), le contrat de sécurité et la règle de classement proposés à la phase 6 sont rejoués sur ces notes.
- **Ce que l'épreuve ne mesure pas.** Elle ne mesure **aucune** précision de prise : il n'y a pas de vérité terrain dans ces journées. Elle éprouve la structure, la publication, la stabilité et la sécurité, rien de plus.

## 2. Résultats contre les critères fixés d'avance

Version corrigée après la revue indépendante (passe 2, § 6 ci-dessous).

| Épreuve | Critère fixé d'avance | Résultat | Tenu |
| --- | --- | --- | --- |
| V-01 Propriétés | les 24 propriétés tiennent ; aucune carte en nombre avec un critère manquant | **En partie.** Les 24 propriétés se jouent sur les fixtures de la phase 6 (`tests/etude-moteur-bord.mjs`, vert), pas sur ces journées. Sur les journées : 0 carte en nombre avec un critère manquant ou une eau inconnue, sur 6 105 créneaux. B-V2 sort de l'intervalle A1 sur 6 créneaux (0,1 %), d'un point au plus | seconde moitié : oui |
| V-02 Publication | aucun « — » sans raison écrite | De mai à octobre : 72,4 % en nombre, 27,6 % en qualitatif, aucun « — ». De novembre à avril : 63,3 % en nombre, 8,5 % en fourchette, 28,2 % en qualitatif. Le qualitatif vient de l'eau inconnue : la présence va alors de 0,3 à la saison, soit plus de 20 points d'écart | oui |
| V-03 Stabilité | Top 3 à 10 points près dans 80 % des tirages, météo et paramètres perturbés ; A1, B-V2 et B-simple comparés | **Météo** (vent ±1 force, houle de ×0,8 à ×1,2, notes recalculées par le vrai moteur, qui reproduit les 1 936 notes non perturbées) : 100 % des journées pour B-V2, A1 et B-simple. **Paramètres** (B-V2) : 100 % en perturbation modérée comme en large. Mais le **même** Top 3 exact ne revient dans 80 % des tirages que pour 65,4 % des journées (perturbation modérée) et 42,7 % (large). L'ensemble météo n'est pas archivé : la perturbation remplace cet ensemble | oui, avec réserve |
| V-04 Sécurité du classement | aucun créneau DANGER ou BLOCKED dans un Top ; aucun INSUFFICIENT_DATA parmi les documentés | 0 exception. Avec les fiches actuelles, c'est un test de non-régression : le Top est vide. Avec les fiches supposées documentées, il classe 2,8 spots par journée en moyenne, et le critère peut échouer | oui |
| Sécurité, V2 contre V3 | aucun créneau « non recommandé » en V2 ne devient SAFE | 0 sur les 1 741 créneaux non recommandés en V2, avec les fiches actuelles comme avec les fiches supposées documentées. Et aucun créneau « sans doute » en V2 ne devient « non recommandé » | oui |
| V-05 Invariance (Confiance, boîte, Pertinence) | ordre identique | tenu par `tests/etude-moteur-bord.mjs` (« ne lit jamais la Confiance, la Pertinence ni la boîte ») | oui |
| V-09 Données de sécurité des fiches | part des fiches qui peuvent être SAFE | 0 sur 98 (étude E9). Raisons : accès selon la marée inconnu (75), réglementation à vérifier (35), engagement (32), houle maximale (32), fenêtre de sécurité (22) | mesuré |
| V-06 Revue indépendante du dossier 00 à 06 | aucun constat MAJEUR ouvert | **En partie.** Le dossier a été relu par le relecteur indépendant à travers l'épreuve : point C7 de sa grille, accord entre contrat, sécurité, classement et résultats. Ses constats MAJEUR (§ 6) sont fermés. Il n'y a pas eu de relecture ligne à ligne des documents 02 à 05 | en partie ; aucun MAJEUR ouvert |

**Journées écartées.**
- 3 journées portent une session du journal : elles sont écartées.
- 18 autres n'ont pas trois spots notés dans les heures de pêche. Elles comptent pour V-01, V-02 et la sécurité, mais pas pour V-03 et V-04, qui portent sur 234 journées.
- Cet écart dépend des données, pas d'un choix : il est dit ici.

## 3. Ce que l'épreuve révèle

1. **Avec les fiches actuelles, le Top documenté est vide 234 jours sur 234.**
    - Les 6 105 créneaux sont INSUFFICIENT_DATA. C'est l'effet attendu et mesuré de D6-15 et D6-21 : une donnée de sécurité inconnue n'est jamais « au vert ».
    - En pratique, la règle stricte met tous les spots BORD dans « à vérifier ». C'est le premier arbitrage de la phase 9.
    - Ce résultat vient en partie du script : il ne lit pas la fenêtre de sécurité des fiches, mais aucune fiche des sept guides n'en a.
2. **Si les fiches étaient documentées**, l'hypothèse est la suivante :
    - l'engagement et la houle maximale de la V2 tenus pour connus ;
    - la réglementation lue ;
    - le créneau situé hors de toute contrainte de marée, sauf la règle d'isolement de la V2. Cette dernière condition est optimiste.

   Dans ce cas, 82 % des créneaux seraient SAFE. Les fiches à lacune critique (position non contrôlée ou accès inconnu) resteraient « à vérifier ». Il resterait 2,8 spots documentés par journée en moyenne, et 81 journées sur 234 (35 %) sans aucun spot documenté.
3. **Stabilité.**
    - Le Top 3 tient « à 10 points près », que l'on perturbe la météo ou les tables de points.
    - En revanche, son **ordre exact** dépend des tables une fois sur trois à plus d'une fois sur deux.
    - Lecture : afficher trois spots proches comme « équivalents » est plus honnête que de les ordonner (D6-02).
4. **Baselines.**
    - B-V2 et B-simple (saison × fenêtre et lumière) ne donnent le même premier spot que 41,9 % des journées. Leur corrélation de rang moyenne est de 0,585.
    - B-V2 et la borne basse de A1 sont très proches : corrélation de 0,903.
    - Sans vérité terrain, rien ne dit laquelle classe le mieux. B-simple reste la baseline à battre à la phase 13.
5. **Saison proposée en phase 7.**
    - À composantes égales, elle garde le même premier spot 96,2 % des journées, et en moyenne 97,2 % du Top 3.
    - Les changements se concentrent en avril (73,7 % de même premier spot), en mars (88,9 %), en février (93,3 %) et en décembre (94,7 %).
    - C'est un effet faible et localisé, pas une preuve qu'elle classe mieux. L'épreuve demandée par la phase 7 (« contre le journal ») est impossible avec 3 sorties notées.

## 4. Exemples de recommandations complètes

Ce sont les journées choisies d'avance : le 6 janvier, le 6 avril, le 6 juillet et le 6 octobre 2026, pour deux guides. Le détail est dans `exemples` du fichier de résultats. Le départage des ex æquo est celui du contrat : note, puis temps de route, puis identifiant.

**Rade de Brest, 6 juillet 2026.**
- **Rang selon B-V2.** Rostiviec 63 ; Le Camfrout et L'Auberlach 62 ; les Espagnols et Pen-Hir 60.
- **Pourquoi Rostiviec est premier.** Fenêtre 25 sur 25, coefficient 20 sur 20, lumière 25 sur 25 (aube), vent 17 sur 30. La présence est de 0,72 : la saison est pleine, mais l'eau abaisse la présence.
- **Pourquoi les deux suivants.** Ils sont à un point (vent 16).
- **Publication A1.** En nombre, puisque tout est connu.
- **Sécurité V3.** INSUFFICIENT_DATA. Il manque l'accès selon la marée ; au Camfrout, il manque aussi la réglementation locale.
- **Sécurité si les fiches étaient documentées.** SAFE.

**Côte ouest du Cotentin, 6 juillet 2026.**
- **Rang.** Pirou, Gouville et la pointe d'Agon sont à 58, départagés par le temps de route (0, 20 et 25 min du centre du guide V2). Suivent Sciotot (57) et Surtainville (55).
- **Pourquoi ces notes.** Fenêtre 25 et lumière 25 (crépuscule), mais coefficient 11 sur 20.
- **Sécurité V3.** INSUFFICIENT_DATA. Il manque la réglementation de la Manche (projet lu, arrêté signé illisible) et la fenêtre de sécurité de ces fiches à contrainte de marée.

## 5. Limites

- **Aucune vérité terrain.** Ni le rang, ni la note ne sont jugés sur des prises.
- **Eau manquante.** L'eau manque sur une part des journées de l'archive, alors que l'application a presque toujours la prévision du jour. La part de « qualitatif » est donc surestimée ici.
- **Temps de route.** C'est la distance fixe du guide V2, pas le temps IGN depuis la position (phase 10).
- **Second modèle.** Il n'est lu que pour la force du vent. Les rafales du second modèle ne sont pas archivées.
- **Nuit.** Elle est lue sur la lumière dominante du créneau. Un créneau d'aube ou de crépuscule qui mord sur la nuit est compté « pas la nuit ». Une lumière non calculée est inconnue.
- **Météo perturbée.** Elle n'est recalculée que sur le meilleur créneau B-V2 de chaque spot. V-03, les baselines et la saison se lisent tous sur ce créneau ; le classement proposé (V-04) se lit, lui, sur la meilleure fenêtre SAFE du contrat. La perturbation est modérée (±1 force, houle ±20 %) : les trois architectures y restent stables à 100 %, donc cette comparaison ne les départage pas.
- **Lacunes critiques.** Seules deux sur quatre sont codées : la position non contrôlée et l'accès inconnu. La « fenêtre non déterminable » et la « contradiction » ne le sont pas. Les fenêtres des sept guides viennent des fiches V2 (`tide_approaches`), et l'audit ne trouve aucune contradiction.
- **V-04.** Le Top n'admet que des spots SAFE par construction (`classement.mjs`) : V-04 garde contre une régression de cette règle, il ne mesure pas un risque nouveau.

## 6. Revue indépendante de cette épreuve (passe 2) et suites

Un relecteur séparé, en lecture seule, a relevé 4 constats MAJEUR sur la première version. Tous sont repris dans la version ci-dessus :

| Constat | Correction |
| --- | --- |
| Le critère « non recommandé en V2 → SAFE » ne pouvait pas échouer : aucun créneau n'est SAFE avec les fiches actuelles, et les créneaux non recommandés n'étaient pas lus | critère compté aussi en hypothèse documentée, sur les 1 741 créneaux non recommandés en V2 ; test ajouté (épreuve non vide) |
| Le créneau qui sert au rang n'était pas celui du contrat (meilleure fenêtre SAFE) | rang sur la meilleure fenêtre SAFE à note complète ; sinon « à vérifier » sur la borne basse ; lacunes critiques et temps de route inconnu traités comme au contrat |
| Direction du vent « ? » et lumière « inconnu » lues comme connues | corrigées (aucun effet mesuré sur ces archives) |
| Critères appliqués en partie mais déclarés tenus (V-01, V-03) | V-01 dit « en partie » ; V-03 perturbe aussi la météo et compare A1, B-V2 et B-simple |

Les constats mineurs repris :
- journées écartées dites ;
- départage par le temps de route ;
- optimisme de l'hypothèse « isolement situé » dit ;
- V-04 qualifié de non-régression avec les fiches actuelles.
