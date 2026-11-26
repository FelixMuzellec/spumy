# Épreuve du moteur BORD sur les journées archivées (phase 8)

Phase 8 V3, 27 nov. 2026. Plan de validation de la phase 6 (`docs/moteur-bord/06-PLAN-VALIDATION.md` § 3) : les critères de réussite étaient écrits **avant** l'épreuve.
- Script : `scripts/epreuve-v3/epreuve.mjs`.
- Résultats : `data/moteur-bord/epreuve-phase-8.json`, déterministe.
- Contrôle : `tests/calibration.mjs`.

## 1. Ce qui est éprouvé, et ce qui ne l'est pas

- **Données.** 234 journées-guides réelles (le 6, le 16 et le 26 de chaque mois, de fin novembre 2025 à mi-novembre 2026, sept guides, choisies sans regarder la météo), avec la météo telle que l'application l'aurait téléchargée. Cela donne 6 105 créneaux notés.
- **Journal écarté.** Les journées de l'archive qui portent une session du journal sont écartées : rien du journal n'entre dans les résultats (PF-17).
- **Méthode.** Le vrai moteur V2 note chaque créneau. Les architectures de l'étude (B-V2, B-simple, A1), le contrat de sécurité et la règle de classement proposés à la phase 6 sont rejoués sur ces notes.
- **Ce que l'épreuve ne mesure pas.** Elle ne mesure **aucune** précision de prise : il n'y a pas de vérité terrain dans ces journées. Elle éprouve la structure, la publication, la stabilité et la sécurité, rien de plus.

## 2. Résultats contre les critères fixés d'avance

| Épreuve | Critère fixé d'avance | Résultat | Tenu |
| --- | --- | --- | --- |
| V-01 Propriétés | aucune carte publiée en nombre avec un critère manquant | 0 sur 6 105 créneaux ; 0 en nombre avec une eau inconnue. B-V2 sort de l'intervalle A1 sur 6 créneaux (0,1 %), d'un point au plus : un effet d'arrondi | oui |
| V-02 Publication | aucun « — » sans raison écrite | de mai à octobre : 72,4 % en nombre, 27,6 % en qualitatif, aucun « — ». De novembre à avril : 63,3 % en nombre, 8,5 % en fourchette, 28,2 % en qualitatif. Le qualitatif vient de l'eau inconnue : la présence va alors de 0,3 à la saison, soit plus de 20 points d'écart | oui |
| V-03 Stabilité | Top 3 à 10 points près dans 80 % des tirages au moins | perturbation modérée (points de 0,8 à 1,2 fois, présence de 0,5 à 1,5 fois) : 234 journées sur 234. Perturbation large (de 0,5 à 1,5, et de 0 à 2) : 99,6 %. Mais le **même** Top 3 exact ne revient dans 80 % des tirages que pour 63,2 % des journées (perturbation modérée) et 44 % (perturbation large) | oui, avec réserve |
| V-04 Sécurité du classement | aucun créneau DANGER ou BLOCKED dans un Top ; aucun INSUFFICIENT_DATA parmi les documentés | 0 exception, avec les données de fiche actuelles comme avec les fiches supposées documentées | oui |
| Sécurité, V2 contre V3 | aucun créneau « non recommandé » en V2 ne devient SAFE | 0. Aucun créneau « sans doute » en V2 ne devient « non recommandé » en V3, même fiche documentée | oui |
| V-05 Invariance (Confiance, boîte, Pertinence) | ordre identique | tenu par `tests/etude-moteur-bord.mjs` (« ne lit jamais la Confiance, la Pertinence ni la boîte ») | oui |
| V-09 Données de sécurité des fiches | part des fiches qui peuvent être SAFE | 0 sur 98 (étude E9). Raisons : accès selon la marée inconnu (75), réglementation à vérifier (35), engagement (32), houle maximale (32), fenêtre de sécurité (22) | mesuré |
| V-06 Revue indépendante du dossier 00 à 06 | aucun constat MAJEUR ouvert | voir le rapport de phase, § 10 (passe 2) | rapport |

## 3. Ce que l'épreuve révèle

1. **Avec les fiches actuelles, le Top documenté est vide 234 jours sur 234.** Les 6 105 créneaux sont INSUFFICIENT_DATA. C'est l'effet attendu et mesuré de D6-15 et D6-21 : une donnée de sécurité inconnue n'est jamais « au vert ». En pratique, la règle stricte met tous les spots BORD dans « à vérifier ». C'est le premier arbitrage de la phase 9.
2. **Si les fiches étaient documentées** (engagement et houle maximale de la V2 tenus pour connus, réglementation lue, accès situé), 82 % des créneaux seraient SAFE. Les documentés seraient alors 5 par journée en moyenne. Il resterait 71 journées sur 234 (30 %) sans aucun spot documenté, à cause du vent, de la houle ou d'une donnée météo manquante.
3. **Stabilité.** Le Top 3 tient « à 10 points près » quoi qu'on fasse aux tables de points. En revanche, son **ordre exact** dépend des tables une fois sur trois à une fois sur deux. Lecture : afficher trois spots proches comme « équivalents » est plus honnête que de les ordonner (D6-02).
4. **Baselines.**
    - B-V2 et B-simple (saison × fenêtre et lumière) ne donnent le même premier spot que 42,3 % des journées. Leur corrélation de rang moyenne est de 0,585.
    - B-V2 et la borne basse de A1 sont très proches : corrélation de 0,903.
    - Sans vérité terrain, rien ne dit laquelle classe le mieux. B-simple reste la baseline à battre à la phase 13.
5. **Saison proposée en phase 7.**
    - À composantes égales, elle garde le même premier spot 97,4 % des journées, et en moyenne 97,9 % du Top 3.
    - Les changements se concentrent en avril (78,9 % de même premier spot), en mars (94,4 %) et en décembre (94,7 %).
    - C'est un effet faible et localisé, pas une preuve qu'elle classe mieux. L'épreuve demandée par la phase 7 (« contre le journal ») est impossible avec 3 sorties notées.

## 4. Exemples de recommandations complètes

Ce sont les journées choisies d'avance : le 6 janvier, le 6 avril, le 6 juillet et le 6 octobre 2026, pour deux guides. Le détail est dans `exemples` du fichier de résultats. Deux exemples :

**Rade de Brest, 6 juillet 2026.**
- **Rang selon B-V2.** Rostiviec 63, puis Le Camfrout 62, puis L'Auberlach 62, puis les Espagnols et Pen-Hir 60.
- **Pourquoi Rostiviec est premier.** Fenêtre 25 sur 25, coefficient 20 sur 20, lumière 25 sur 25 (aube), vent 17 sur 30. La présence est de 0,72 : la saison est pleine, mais l'eau abaisse la présence.
- **Pourquoi Le Camfrout et L'Auberlach suivent.** Ils sont à un point : vent 16.
- **Publication A1.** En nombre, puisque tout est connu.
- **Sécurité V3.** INSUFFICIENT_DATA partout. Il manque l'accès selon la marée ; au Camfrout, il manque aussi la réglementation locale.
- **Sécurité si les fiches étaient documentées.** SAFE.
- **Données manquantes.** Accès selon la marée, réglementation locale.

**Côte ouest du Cotentin, 6 juillet 2026.**
- **Rang.** La pointe d'Agon, Gouville et Pirou à 58 ; Sciotot 57 ; Surtainville 55.
- **Pourquoi ces notes.** Fenêtre 25, lumière 25 (crépuscule), mais coefficient 11 sur 20. L'égalité à 58 se départage par le temps de route.
- **Sécurité V3.** INSUFFICIENT_DATA. Il manque la réglementation de la Manche (projet lu, arrêté signé illisible) et la fenêtre de sécurité de ces fiches à contrainte de marée.

## 5. Limites

- Aucune vérité terrain : ni le rang, ni la note ne sont jugés sur des prises.
- L'eau manque sur une part des journées de l'archive. L'application, elle, a presque toujours la prévision du jour : la part de « qualitatif » est donc surestimée ici.
- Le temps de route est la distance fixe du guide V2, pas le temps IGN depuis la position (phase 10).
- Le second modèle n'est lu que pour la force du vent (`alt`). Les rafales du second modèle ne sont pas archivées.
