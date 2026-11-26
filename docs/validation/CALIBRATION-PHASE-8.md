# Calibration du moteur et apprentissage du journal (phase 8)

Phase 8 V3, 27 nov. 2026. Indicateurs K-01 à K-03, pare-feu PF-34, décision V3-030 et exigence JRN-06.

- Outil : `scripts/calibration/verification.mjs`.
- Jeux synthétiques : `scripts/calibration/journal-synthetique.mjs`, qui écrit `data/moteur-bord/calibration-synthetique.json`.
- Contrôle : `tests/calibration.mjs`, avec deux essais de sabotage.

## 1. L'écart, dit simplement

Pour mesurer si les notes de SPUMY annoncent bien les prises, il faut des sorties notées :
- la note de SPUMY doit être figée **avant** la sortie ;
- le résultat doit être déclaré, bredouille comprise.

L'étude de la phase 6 en demande de 40 à 120. **Trois sont connues.** Aucun score de Brier, aucune fiabilité, aucune discrimination ne peut donc être mesuré honnêtement aujourd'hui. Rien n'est présenté comme une preuve d'une chance de prise.

Ce qui est fait à la place :
1. l'outil de mesure ;
2. ses garde-fous ;
3. des jeux synthétiques, à vérité connue, qui montrent que l'outil retrouve ce qu'on y a mis et ce que coûtent les défauts d'un vrai journal.

K-01 à K-03 restent « à mesurer », reportés à la phase 13 (journal confirmé, épreuves V-07 et V-08). Leur raison est écrite (`tests/pare-feux/kpis.mjs`).

## 2. L'outil

**Trois scores, trois épreuves séparées.** Aucune ne sert de preuve pour une autre.

| Score | Ce qui est mesuré | Ce qui est interdit |
| --- | --- | --- |
| Chance de prise P(Y ≥ 1) | Brier, Brier skill score contre la fréquence observée, pente de fiabilité (régression logistique sur le logit), aire ROC | la déduire de la Favorabilité ; SPUMY ne la publie pas (D6-12), donc elle n'est mesurée que si une chance a été annoncée |
| Favorabilité /100 | discrimination (aire ROC) ; accord de rang avec les prises par heure | un Brier : ce n'est pas une probabilité |
| Confiance | écart entre chance annoncée et résultat, Confiance haute contre basse | qu'elle change le rang |

**Garde-fous** (testés) :
- note non figée : écartée ;
- résultat inconnu : écarté et compté à part, **jamais** compté comme une bredouille ;
- aucune mesure sous 40 sorties, 10 avec prise et 10 bredouilles déclarées ;
- aucune bredouille déclarée : biais de sélection, aucune mesure ;
- export du journal placé dans le dépôt : refusé (PF-17). L'outil n'imprime que des agrégats et n'écrit rien.

## 3. Jeux synthétiques : ce qu'ils montrent

**Prévisionnistes connus** (200 répétitions) :

| Sorties | Calibré : BSS positif | Calibré : pente entre 0,8 et 1,2 | Trop tranché : pente médiane | Sans compétence : AUC |
| --- | --- | --- | --- | --- |
| 40 | 88 % des cas | **40 %** | 0,52 | 0,5 |
| 120 | 99,5 % | 55 % | 0,52 | 0,5 |
| 400 | 100 % | 86,5 % | 0,50 | 0,5 |

**Proposition pour la phase 9 : réviser l'usage du seuil de K-02.** À 40 sorties, un prévisionniste **parfaitement** calibré échoue 6 fois sur 10 à la barre « pente entre 0,8 et 1,2 ». À l'échelle d'un journal, cette barre punirait le hasard. Deux options :
- (a) exiger que l'intervalle à 90 % de la pente contienne 1. Mais à 40 sorties, cet intervalle va de 0,36 à 2,02 : un prévisionniste deux fois trop tranché (pente de 0,27 à 1,01) passerait souvent. Cette option est presque sans puissance ;
- (b) publier la pente avec son intervalle dès 40 sorties, sans verdict, et ne juger la barre de 0,8 à 1,2 qu'à partir de 400 sorties (86,5 % de réussite pour un prévisionniste calibré, 0 % pour un trop tranché). D'ici là, juger sur le BSS et l'AUC.

Recommandée : (b), corrigée après la revue indépendante, qui a montré le manque de puissance de (a). C'est un changement d'un seuil fixé par délégation : il est présenté, pas appliqué.

**Biais de sélection** (journal où 70 % des bredouilles ne sont pas notées) :
- la fréquence de prise apparente passe de 0,45 à 0,73 ;
- l'ordonnée de fiabilité passe de 0 à 1,21 : des chances justes paraissent toutes trop basses.

**Apprentissage du multiplicateur de poste θ_x** (ZINB, ψ = 0,6, k = 2, θ vrai = 1) :

| Cas | θ appris |
| --- | --- |
| journal complet, zéros explicites | 1,01 |
| bredouilles absentes | **1,58** : le poste paraît 60 % meilleur qu'il n'est |
| 10 résultats inconnus comptés comme des bredouilles | 0,87 |
| 10 bredouilles | 0,36 (intervalle à 90 % de 0,06 à 0,93) |
| 9 bredouilles et une sortie à 6 prises | 1,38 (de 0,58 à 2,58) : une prise isolée ne prouve rien |

- **Intervalle de θ_x selon le nombre de sorties d'un poste.** Sa largeur (intervalle à 90 %, médiane) vaut 1,72 à 3 sorties, 1,55 à 5, 1,38 à 10, 0,87 à 40 et 0,62 à 80.
- **Surapprentissage par poste.** Prenons dix postes identiques. À 10 sorties par poste, leurs θ appris s'écartent de 1,0 en médiane ; à 80, de 0,5. Classer des postes sur moins de quelques dizaines de sorties chacun, c'est classer du bruit. La règle V-07 tient : aucune conclusion sous 5 sorties dont 2 avec prise, et un intervalle affiché seulement s'il est informatif.
- **ψ.** Estimé à 0,56 en moyenne à 10 sorties (de 0,41 à 0,69), 0,59 à 80 et 0,595 à 400. À peu de sorties, il est tiré vers 0,5 par l'a priori Beta(2, 2) ; ce biais s'efface avec le nombre de sorties.
- **Saison** (50 répétitions de 80 sorties d'été). θ appris vaut 1,01 quand Λ_base porte la saison. Il vaut 1,77 si l'écart de saison (un facteur 1,8) est oublié dans Λ_base : θ l'apprend et l'appliquerait l'hiver. Cela confirme D6-13 : la saison ne doit jamais être comptée deux fois.

**Perturbations temporaires et tags subjectifs.** Le moteur 2 de la phase 6 sépare λ_env (conditions du jour) de θ_x (poste). Les essais ci-dessus montrent l'effet d'une variable mal rangée (la saison). Pour le reste :
- il n'existe pas encore de code du journal V3 où vérifier que les perturbations restent hors de θ_x ;
- de même pour les tags subjectifs (« eau sale », « monde »), qui ne doivent jamais créer de pénalité automatique.

C'est **non testable aujourd'hui**, et reporté à la phase 13. Le moteur V2 gelé n'a aucun tag qui pénalise, et son bonus du journal (±10) doit être retiré (D6-11).

## 4. Modèle BATEAU, éprouvé seul

Le modèle « d'après tes sorties » de la V2 (`src/bateau/offshore.js`) est une régression de Poisson pénalisée. Il est éprouvé sans lui appliquer le moteur BORD. La vérité est connue : le vent a un effet négatif, le coefficient un effet positif, dix autres variables n'ont aucun effet. Les mesures sont faites hors échantillon.

| Sorties | Modèle | Vent | Coefficient | Plus grand faux effet | Rang hors échantillon (Spearman) | Notes produites |
| --- | --- | --- | --- | --- | --- | --- |
| 7 | refusé (« 8 nécessaires ») | — | — | — | — | — |
| 8 | oui | −0,17 | +0,07 | **0,22** | 0,34 | de 0,1 à 9,9 |
| 20 | oui | −0,51 | +0,33 | 0,31 | 0,68 | de 0,1 à 9,9 |
| 60 | oui | −0,27 | +0,25 | 0,28 | 0,61 | de 0,1 à 9,6 |
| 200 | oui | −0,36 | +0,45 | 0,13 | 0,93 | de 0,1 à 9,3 |

**Lecture.**
- À 8 sorties, le modèle donne des notes sur toute l'échelle, alors qu'un faux effet y pèse plus que les vrais. La mention « fiabilité faible » est la seule protection.
- Ce code est gelé, et la note sur 10 est retirée en V3 (V3-015, PF-26).
- **Proposé pour la phase 9** : en V3, ne montrer les effets « d'après tes sorties » que lorsque leur intervalle exclut zéro.
- Capots non notés : la moyenne de référence monte de 0,67 à 0,82 prise par heure, et l'effet du vent s'affaiblit.

## 5. Ce qu'il faut pour mesurer pour de vrai

- **40 sorties au moins**, chacune avec la note de SPUMY figée avant de partir (Favorabilité, Confiance, version du modèle), et le résultat déclaré, bredouille comprise. Les résultats inconnus sont gardés à part.
- **Lancement**, sur un export **hors du dépôt** : `node scripts/calibration/verification.mjs <export.json>`. Seuls les agrégats peuvent entrer dans le dépôt.
