# Rapport de phase 6 — SPUMY V3 : conception et validation du moteur BORD

24 nov. 2026. Branche `claude/v3-phase-6`, proposition n° 20 en brouillon (base `claude/v3-phase-5`).

Ouverte par le jeton conditionnel de Félix (23 nov. 2026, 23 h 15, `docs/DECISIONS_LOG.md`) : « APPROVED — PROCEED TO PHASE 6 », valable quand la phase 5 serait close avec tous ses gates PASS (ce fut le cas le 24 nov. à 5 h 05).

## 1. Objectif et périmètre

Le référentiel, « PHASE 6 — Conception et validation du moteur BORD », demande :
- **d'abord l'audit** scientifique et mathématique du moteur existant ;
- **puis la conception provisoire** :
  - contrat de Favorabilité, de Confiance et de sécurité (§ 9.1 à § 9.5) ;
  - règle de classement sans score composite ;
  - facteurs retenus, écartés ou non vérifiables ;
  - données manquantes et explicabilité ;
  - trajet d'une heure au plus ;
  - scénarios et fixtures ;
  - sensibilité et robustesse ;
  - baseline simple ;
  - ZINB et GAMM contre Poisson, ZIP et NB ;
  - moteur 2 du journal ;
  - limites du ratio Gamma–Poisson ;
  - décision sur l'affichage de la probabilité de capture.

Limites :
- **choix PROVISOIRES** ;
- **aucun changement de moteur dans `src/`** avant l'approbation explicite qui suit la phase 9 ;
- les questions structurantes vont au registre, pour arbitrage après les phases 8 et 9.

## 2. Synthèse exécutive

Statut : **VALIDATED (par délégation de Félix, 23 nov., 23 h 15 ; à confirmer par Félix)**. Voir § 11 pour les dix critères du § 13.4.

- **Dossier.** Le dossier de conception est dans `docs/moteur-bord/` : 7 documents et un index.
- **Étude reproductible.** Elle fait tourner le vrai moteur V2 (sept guides, 66 spots, 47 520 créneaux) et ses résultats sont versionnés.
- **Prototypes.** Ils sont hors application, avec 93 tests.
- **`src/`** est inchangé.

Ce que la phase établit :

1. **L'audit du moteur V2** relève 18 constats, dont 13 MAJEURS, tous prouvés par le code ou l'étude (document 00). Les plus graves :
   - la Pertinence agit encore sur le rang ;
   - un critère manquant est imputé en silence par la renormalisation (erreur de plus de 10 points sur 21 % des créneaux sans vent) ;
   - une eau inconnue remonte la note (de 75 à 95 au retour de mai) ;
   - la Confiance n'encadre rien ;
   - le journal donne un bonus direct ;
   - la sécurité lit un engagement inconnu comme « non engagé » ;
   - la note entière sur 100 suggère une précision que la stabilité ne permet pas.
2. **Le contrat provisoire** (document 01) :
   - deux indicateurs ;
   - une note **seulement quand tout est connu** ; sinon un intervalle publié et le spot « à vérifier » ;
   - une Confiance par six dimensions, au maillon le plus faible, qui ne fait que baisser la publication ;
   - une sécurité en cinq états, sans aucun chemin « inconnu → SAFE » ;
   - une règle de classement verrouillée dans son ordre (§ 9.1.6).
3. **Le constat qui compte le plus pour la suite.** Avec les données de sécurité actuelles des fiches, **aucune des 98 fiches ne peut être SAFE**, quelle que soit la météo :
   - l'accès selon la marée est inconnu sur 75 fiches ;
   - sur les 23 autres, une contrainte de marée est connue (isolement au flot, poste submersible, praticable à basse mer seulement), mais aucune fenêtre de sécurité documentée ne situe le créneau par rapport à elle ;
   - la réglementation locale n'est pas lue sur 35 fiches, dont la Manche ;
   - l'engagement et la houle maximale sont inconnus sur 32.

   C'est un changement du comportement V2, où une contrainte connue n'était qu'une consigne de prudence. Il est inscrit au registre avec son impact (D6-15, D6-21). La phase 7 doit combler ces données en priorité.
4. **Le probabiliste** (document 04) :
   - les formules du référentiel sont justes ;
   - le ratio Gamma–Poisson n'est exact que sans excès de zéros ;
   - le ratio naïf sous-estime θ de 34 à 36 % sur 400 jeux simulés ;
   - ψ n'est pas identifiable sous plusieurs dizaines de sessions comparables, et il se confond avec l'effet de poste.

   Le journal compte 3 sessions : **rien n'est estimable**. La probabilité de capture n'est ni calculée en production ni affichée (D6-12).
5. **Le registre V3-031** porte 21 questions (D6-01 à D6-21), à arbitrer après les phases 8 et 9. Aucune ne bloque la phase 7.

## 3. Travail réalisé

| Sous-tâche | Statut |
| --- | --- |
| 6.1 Entrée : branche, proposition n° 20 en brouillon, registre | Fait |
| 6.2 Audit du moteur V2 (00) | Fait |
| 6.3 Contrat Favorabilité, Confiance, sécurité, classement, publication (01) | Fait |
| 6.4 Variables du § 9.1.3 et facteurs du § 9.1.4 (02) | Fait |
| 6.5 Architectures contre baselines (03), avec calcul | Fait |
| 6.6 Probabiliste et moteur 2 (04), avec preuves mathématiques | Fait |
| 6.7 Scénarios, fixtures, sensibilité, robustesse, monotonie (05) | Fait |
| 6.8 Hypothèses, inconnues, plan de validation, registre (06, V3-031) | Fait |
| 6.9 Trois passes de challenge, gate sur clone neuf, rapport | Fait (§ 7, § 10) |

Rien n'est partiel dans le périmètre. Rien n'a été commencé hors périmètre : aucune donnée de fiche n'a été recherchée, puisque c'est la phase 7, et rien n'a été implémenté dans l'application.

## 4. Justification des changements

| Changement | Problème | Justification et bénéfice | Alternatives | Impacts, risques | Vérification |
| --- | --- | --- | --- | --- | --- |
| Étude du moteur BORD (`scripts/etude-moteur-bord/`, `data/moteur-bord/`) | Aucun moyen de mesurer le moteur en ligne ni de comparer des architectures | Le vrai moteur est assemblé tel quel, et ses composantes sont recombinées (égalité vérifiée sur 47 520 créneaux). Graines fixes : le fichier se recalcule à l'identique | Réécrire un modèle simplifié : rejeté, il n'aurait pas audité le vrai moteur | Plans d'essai, pas de vraies journées (déclaré) ; 23 s de plus dans `npm test` | `tests/etude-moteur-bord.mjs`, 93/93, en CI |
| Prototypes du contrat (A1, Confiance, sécurité, classement) | Un contrat écrit sans code ne se teste pas | Chaque règle du contrat est exécutable et testée, hors application | Spécifier en prose seulement : rejeté | Aucun : jamais importés par `src/` | 93 tests ; garde-fou sur le code du classement |
| `docs/moteur-bord/` (00 à 06) | Livrables exigés par la phase | Dossier provisoire complet, chiffres tirés du fichier de résultats | — | Les choix restent ouverts (registre) | Trois passes de challenge |
| `docs/REQUIREMENTS.md` : REC-08 en V2 « Partiel » | L'état « Conforme » était faux (imputation cachée, A2) | Le registre dit vrai | Laisser : rejeté (§ 13.4, documentation conforme) | Aucun | Audit A2 |
| `docs/DECISIONS_LOG.md` : V3-031 | Questions structurantes à inscrire | 21 questions avec options, choix provisoire, preuve et impact | Les poser maintenant : rejeté, le référentiel les veut après les phases 8 et 9 | Aucun sur l'application | Document 06 § 4 |
| `.github/workflows/tests.yml` et `tests/actions-epinglees.mjs` | Un nom d'étape contenant « : » rendait le flux invalide : le passage Tests échouait sans rien lancer | Nom corrigé ; le contrôle refuse désormais tout nom non entre guillemets contenant « : » | — | Aucun | Contrôle prouvé sur le défaut, puis CI verte |

## 5. Livrables

- **Dossier** `docs/moteur-bord/` :
  - `README.md` ;
  - `00-AUDIT-MOTEUR-V2.md` ;
  - `01-CONTRAT.md` ;
  - `02-VARIABLES-ET-FACTEURS.md` ;
  - `03-ARCHITECTURES.md` ;
  - `04-PROBABILISTE.md` ;
  - `05-SCENARIOS-SENSIBILITE.md` ;
  - `06-PLAN-VALIDATION.md`.
- **Code de l'étude** `scripts/etude-moteur-bord/` :
  - `zinb.mjs` : ZINB, posterior exact sur grille, ratio de travail, tirages ;
  - `architectures.mjs` : B-simple, B-V2, A1, A2, A3 ;
  - `confiance.mjs` ;
  - `securite.mjs` ;
  - `classement.mjs` ;
  - `etude.mjs` : expériences E1 à E9.
- **Données** :
  - `data/moteur-bord/resultats-etude.json` : déterministe, régénérer avec `node scripts/etude-moteur-bord/etude.mjs`, contrôler avec `--verifier` ;
  - `data/moteur-bord/scenarios.json` : 24 fixtures.
- **Tests** : `tests/etude-moteur-bord.mjs`, script `npm run test:etude-moteur`, ajouté à `npm test` et à la CI.

## 6. Git et état du dépôt

- **Commits** : `main` est inchangée ; aucune fusion. 22 commits atomiques sur `claude/v3-phase-6` avant ce rapport, poussés.
- **Proposition** : n° 20, en brouillon vers `claude/v3-phase-5`.
- **Fichiers** : 23 touchés avant ce rapport, dont 17 créés (dossier, étude, données, tests) et 6 modifiés :
  - le flux de CI ;
  - `package.json` ;
  - `SPUMY_AUDIT_CONTINUITY.md` ;
  - `docs/DECISIONS_LOG.md` ;
  - `docs/REQUIREMENTS.md` ;
  - `tests/actions-epinglees.mjs`.
- **Ce qui n'a pas bougé** :
  - aucun fichier de `src/` (`git diff --stat claude/v3-phase-5...HEAD -- src` est vide) ;
  - aucune fiche de spot ;
  - aucun spot V2 ;
  - aucun secret.
- **Opération non réalisée** : aucune.

## 7. Preuves

Toutes les commandes ont été lancées depuis un **clone neuf** de 841ee06, le dernier commit de code et de dossier, le 24 nov. 2026. Le même gate était déjà PASS sur f17bd3b, avant les corrections de la passe 3 : il a été rejoué en entier.

| Commande | Code | Résultat |
| --- | --- | --- |
| `npm ci` | 0 | — |
| `npm run build`, puis `git status --porcelain` | 0 | aucun écart |
| `npm test` | 0 | <ul><li>lint, actions épinglées, types, secrets, couches</li><li>données 69/69, spots V3 1261/1261</li><li>**étude du moteur BORD 93/93**</li><li>connaissances 27/27, design 41/41, design V3 186/186</li><li>moteur v2 56/56, unitaires des guides</li><li>e2e 848/848, contrat simulé 28/28</li></ul> |
| `npm run test:a11y` | 0 | 0 violation |
| `npm run test:upgrade` | 0 | 12/12 |
| `npm run test:prototype` | 0 | 244/244 |
| `npm run test:prototype-v3` | 0 | 224/224 |
| `python3 tests/brand.py` | 0 | 35/35 |
| CI « Tests », « Contrat IGN », « Contrat Open-Meteo » sur 841ee06 | success | passages 45360924779, 45360924848, 45360924840 ; l'état sur le commit du rapport figure dans la proposition n° 20 |
| `node scripts/etude-moteur-bord/etude.mjs --verifier` | 0 | résultats identiques ; aussi sous d'autres fuseaux et locales (relecteur indépendant) |

Interruption : vers 6 h 20, l'environnement s'est arrêté pendant un gate, puis la limite d'usage a suspendu le travail jusqu'à 9 h 30. Aucun fichier n'a été perdu (tout était commité), et la reprise s'est faite à 9 h 33 sur demande de Félix.

Limites :
- **Aucune vérité terrain** : l'étude mesure la structure et la robustesse, jamais une précision.
- **Plans d'essai** : les grilles ne sont pas de vraies journées.
- **Amplitudes conventionnelles** : les ±40 % sont une convention pour les hypothèses de niveau 4.

## 8. Résultats fonctionnels et qualité

| Mesure | Valeur | Source |
| --- | --- | --- |
| Recombinaison des composantes = moteur V2 | 47 520 créneaux sur 47 520 | E4 |
| Vent inconnu : erreur de la renormalisation V2 | 6,6 points en moyenne, 26 au plus ; plus de 10 points sur 21 % | E4 |
| Eau inconnue, retour de mai | 95 au lieu de 75 | S11 |
| Houle inconnue : critère vent retiré en V2 | 55 spots sur 66, jusqu'à 20 points | E7 |
| Créneaux à 65 ou plus avec un coefficient hors plage | 609 sur 10 366 | E4 |
| Top 3 inchangé sous les seuls paramètres (étude ; phase 8 V2) | 85,0 % ; 53,3 % | E6 ; PHASE-8 |
| Intervalle à 90 % de la note d'un spot, tout connu | 12 points en médiane (optimiste) | E6 |
| Ratio naïf contre θ vrai = 1 | 0,66 (8 sessions) ; 0,64 (40) | E2b |
| ψ à ±0,15 huit fois sur dix | environ 40 à 120 sessions selon le taux de captures, θ connu ; davantage avec θ | E3 |
| Fiches qui peuvent être SAFE avec les données actuelles | 0 sur 98 | E9 |
| Scénarios tenus | 24 sur 24 | E8 |

- **Ce qui fonctionne** : les prototypes tiennent toutes leurs propriétés, et l'étude se recalcule à l'identique.
- **Ce qui ne fonctionne pas encore** :
  - l'application ne suit pas ce contrat (V2 en ligne, inchangée) ;
  - tous les spots BORD resteraient « à vérifier » tant que la phase 7 n'a pas comblé leurs données de sécurité.
- **Ce qui reste incertain** :
  - toutes les valeurs N4 (présence, tables de points) ;
  - les seuils de publication ;
  - l'agrégation de la Confiance.

## 9. Matrice des exigences

| Exigence | Statut en fin de phase 6 | Critère | Test | Preuve |
| --- | --- | --- | --- | --- |
| REC-01 | SPÉCIFIÉ (provisoire) | Deux indicateurs | invariance, garde-fou | 01 § 1 |
| REC-02, REC-10 | SPÉCIFIÉ | Pertinence et boîte sans effet | garde-fou sur le code ; S18 | 01 § 2 |
| REC-03 | SPÉCIFIÉ | Confiance hors du rang, encadre la publication | 5 tests | 01 § 4, § 5 |
| REC-04, REC-05, REC-06 | SPÉCIFIÉ | Ordre, égalité stricte, place réservée sur route vérifiée, entrées strictes | 13 tests | 01 § 7 |
| REC-07 | SPÉCIFIÉ | Paliers et classes d'affichage | E5 | 01 § 3 ; 00 A14 |
| REC-08 | SPÉCIFIÉ ; V2 corrigée à « Partiel » | Aucune imputation | A1, tests | 00 A2 ; 01 § 3, § 8 |
| REC-09 | SPÉCIFIÉ | Fenêtre ou « non déterminable » | — | 01 § 7, § 9 |
| REC-11 | SPÉCIFIÉ | Favorabilité sur la biologie, paramètres tracés | E4, E5 | 02, 03 |
| REC-12 | SPÉCIFIÉ | Pas de note sur 10 en BORD | — | 01 § 2 |
| SEC-01, SEC-02, SEC-04 | SPÉCIFIÉ ; écart déclaré à SEC-02 pour la visibilité (D6-16) | Sécurité indépendante, inconnu jamais SAFE, poste engagé visible (« Prudence ») | 17 tests ; S10 à S15, S19 à S24 | 01 § 6 |
| SEC-05 | SPÉCIFIÉ | Seuils de vent revus | — | D6-10 |
| RTE-01, RTE-02 | SPÉCIFIÉ | 60 min ; estimation marquée | tests 60/61, estimation | 01 § 7 |
| JRN-05 | SPÉCIFIÉ | Pas de conclusion sur trop peu de sorties | E3 | 04 § 5, § 6.4 |

Toutes ces exigences restent à implémenter (phases 9 et 10). « Spécifié » n'est pas « Testé » au sens de l'application.

## 10. Red-team et risques

**Passe 1 (auteur, checklist du périmètre et du § 14.1).** Corrigé :
- classes d'affichage V3 (§ 6.7.5.1) distinguées des paliers V2 ;
- fourchette et jauge ;
- « guides » déclarés comme conteneurs de données, pas comme découpage du produit ;
- échéance J+1 ;
- REC-08 ;
- alternatives dans « Pourquoi ? » ;
- nom d'étape de CI invalide, avec un contrôle ajouté.

**Passe 2 (relecteur indépendant, sans part au travail).** Quatre MAJEURS, tous corrigés et testés :
- **M1** : des chemins « inconnu → SAFE » dans la sécurité, des prudences V2 oubliées, une « côte ouverte » différente de la V2, des facteurs du § 9.5 non déclarés ;
- **M2** : des fixtures qui ne lisaient pas les fiches, et un impact non mesuré (D6-15) ;
- **M3** : D6-01 était une imputation à zéro présentée comme conforme. Désormais, aucune note sans données complètes ;
- **M4** : ψ tiré de la présence, ce qui ramenait le biais du ratio naïf.

Treize MINEURS, corrigés ou consignés :
- test de convention tautologique ;
- `q ?? 1` ;
- propriétés faibles ;
- nombre publié avec P bas ;
- identifiabilité surestimée ;
- comparaison de stabilité trompeuse ;
- chiffres inexacts ;
- Confiance non prototypée ;
- règles nouvelles non inscrites ;
- réglementation et BLOCKED ;
- troncature du posterior ;
- monotonie ;
- paramètres du moteur 2.

**Passe 3 (second relecteur, indépendant du travail et de la première revue).** M3 et M4 confirmés résolus ; M1 et M2 seulement en partie. Trois MAJEURS nouveaux, tous corrigés et testés :
- **N1** : l'isolement par la marée était ignoré. Les 23 fiches dont l'accès est connu décrivent toutes une contrainte, et aucune règle ne situait le créneau par rapport à elle. Ces fiches sortaient pourtant SAFE : les « 8 fiches SAFE possibles » reposaient sur ce défaut. Désormais, une contrainte connue mais non située est INSUFFICIENT_DATA (D6-21), et aucune fiche ne peut être SAFE aujourd'hui ;
- **N2** : D6-19 disait « comme en V2 », mais le libellé « Prudence » de la V2 avait disparu. Il est rendu (`niveauAffiche`, scénario S22) ;
- **N3** : un tableau d'heures ou de modèles contenant une valeur manquante sortait SAFE. Désormais, une heure sans valeur rend la mesure inconnue, et le second modèle est distinct.

Sept MINEURS, corrigés et testés :
- **N4** : valeurs négatives ou limites illisibles ;
- **N5** : facteurs non évalués complétés, et écart déclaré à SEC-02 ;
- **N6** : entrées strictes du classement ;
- **N7** : A1 ne déduit plus « tout connu » d'une largeur nulle ;
- **N8** : défauts permissifs de la Confiance ;
- **N9** : propriété tautologique de S21 ;
- **N10** : ψ et k exigés, troncature contrôlée sur les jeux simulés.

Les deux remarques INFO sont corrigées : la formulation des paliers et la moyenne de Beta(2, 2).

**Contre-vérification de la passe 3 (même second relecteur, sur e66c742).** Verdict : « la phase 6 peut être close ». N1 à N6 et N8 à N10 sont résolus ; N7 l'est en partie.
- **Sur les créneaux réels** : 0 sort SAFE.
- **Sous l'hypothèse d'essai** : 152 créneaux sortent « SAFE, Prudence » là où la V2 dit « Prudence », sans aucun écart avec la V2.
- **Constat mineur, régression de N7** : A1 publiait un nombre sur un point ou une présence illisibles. Corrigé dans 841ee06, avec les remarques INFO :
  - fourchette d'au moins 1 point ;
  - accès non confirmé ouvert ;
  - entrée absente ;
  - consignes en texte ;
  - hypothèse d'essai toujours déclarée ;
  - quatrième code de contrainte ;
  - risques communaux.
- **Tests** : 93/93.

**Risques ouverts**

| Risque | Gravité | Dépendance |
| --- | --- | --- |
| Avec la règle D6-15, presque tous les spots restent « à vérifier » tant que les données de sécurité des fiches manquent | élevée pour le produit, nulle pour la sécurité | phase 7 (recherche), puis arbitrage de Félix après la phase 9 |
| Les valeurs de présence et les tables de points restent N4 | moyenne | phases 7 et 8 |
| L'instabilité réelle du Top 3 est plus forte que celle mesurée ici | moyenne | phase 8 (D6-02) |
| `npm test` est plus long de 23 s | faible | — |
| Lenteur ponctuelle connue de l'e2e (phase 5) | faible | phase 9 |

## 11. Qualité et conformité

Critères du § 13.4 :

| N° | Critère | État |
| --- | --- | --- |
| 1 | Périmètre de la phase respecté | oui (§ 1, § 3) |
| 2 | Livrables produits | oui (§ 5) |
| 3 | Exigences du périmètre couvertes | oui, au niveau de la spécification (§ 9) |
| 4 | Tests exécutés, codes consignés | oui (§ 7) |
| 5 | Preuves vérifiables | oui : fichier de résultats recalculé par les tests |
| 6 | Risques documentés | oui (§ 10) |
| 7 | Red-team réalisée | trois passes, dont deux par des relecteurs indépendants, et la contre-vérification des corrections |
| 8 | Aucun défaut bloquant ouvert | oui : verdict « peut être close » du second relecteur, et sa dernière remarque mineure corrigée et testée |
| 9 | Validations utilisateur requises | aucune pendant cette phase : les choix sont provisoires et le référentiel renvoie leur arbitrage après les phases 8 et 9 ; statut par délégation, à confirmer par Félix |
| 10 | Documentation conforme à la réalité | oui (REC-08 corrigé, chiffres tirés du fichier de résultats) |

- **UX et UI** : NON ÉVALUABLE dans cette phase. Aucun écran n'a été produit ; la jauge en fourchette est à dessiner (phases 9 et 12).
- **Domaines évalués** :
  - mathématique : identités, démonstration, simulations ;
  - sécurité : contrat et tests ;
  - données : impact mesuré sur les fiches ;
  - reproductibilité : déterministe.

## 12. Questions utilisateur et décisions attendues

- **Questions posées pendant la phase** : aucune. Aucune question bloquante n'est apparue.
- **Décisions attendues après les phases 8 et 9** : D6-01 à D6-21 (document 06 § 4, V3-031). Deux méritent l'attention de Félix dès maintenant, sans rien bloquer :
  - **D6-15 et D6-21**. Faut-il appliquer à la lettre « une donnée de sécurité inconnue n'est jamais au vert » aux données des fiches, l'accès selon la marée surtout ? C'est le choix provisoire, et il veut dire qu'aucune fiche ne peut être SAFE tant que la phase 7 n'a pas documenté l'accès selon la marée et la fenêtre de sécurité des postes. L'autre option est de garder le comportement V2 : l'absence de règle vaut « pas d'alerte », et une contrainte connue n'est qu'une consigne. Recommandation : appliquer la règle et combler les données en phase 7.
  - **D6-02**. Faut-il publier l'incertitude des paramètres eux-mêmes ? Cela ferait des fourchettes sur la plupart des cartes. Recommandation : non pour l'instant, à revoir avec la phase 8.

## 13. Prochaine phase proposée

**Phase 7 du référentiel**, planifiée pour la nuit du 24 au 25 nov. 2026 (1 h 30, relances à 4 h 30 et 7 h 30). Félix l'a autorisée par délégation, à condition que la phase 6 soit validée après trois passes.

- **Priorités venues de cette phase** :
  - combler les données de sécurité des fiches : accès selon la marée (75), fenêtre de sécurité des 23 fiches dont la contrainte de marée est connue, réglementation locale, dont l'arrêté de la Manche (35), engagement (32), houle maximale (32), mouvements de terrain (54) ;
  - fenêtres de marée des fiches au format V3 ;
  - recherches demandées au document 02 § 5 : seuils thermiques, lumière en milieu naturel, courant au poste, débit, plages utiles ;
  - restes de la phase 5 : 242 pages V2 à lire, politique de la chasse sous-marine, règle des 15 m des concessions du Morbihan, 89 postes sans second éditeur.
- **Prérequis** : aucun, hors le jeton conditionnel.
- **Bénéfice** : rendre documentables les spots que la règle de sécurité V3 laisse tous « à vérifier » aujourd'hui.

## 14. Arrêt

Phase 6 close. Aucune phase 8 sans jeton explicite de Félix. Aucun changement de moteur avant l'approbation qui suit la phase 9.

En attente de la confirmation de Félix (`APPROVED — PROCEED TO PHASE 7`), que son jeton conditionnel du 23 nov. 2026 tient déjà pour la phase 7 seulement.
