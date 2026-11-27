# Rapport de phase 8 — SPUMY V3 : validation indépendante du référentiel spots et calibration du moteur

27 nov. 2026. Branche `claude/v3-phase-08-validation-calibration`, proposition n° 29 en brouillon (base : branche de la phase 7).

Ouverte le 26 nov. 2026 à 23 h 57 par la tâche planifiée, sur le jeton de Félix « APPROVED — PROCEED TO PHASE 8 » (26 nov., 23 h 48). Statut final soumis à la validation de Félix : il n'y a pas de délégation pour cette phase.

## 1. Objectif et périmètre

Référentiel, « PHASE 8 — Validation indépendante du référentiel spots et calibration du moteur » (lignes 2697 et suivantes) :
- revue critique séparée des phases 5 et 7 ;
- contrôle stratifié et par risque des fiches ;
- épreuve et calibration du moteur BORD : baseline, jeux déterministes, cas limites ; P(Y ≥ 1), Favorabilité et Confiance évaluées séparément ;
- apprentissage du journal : zéros explicites, prises isolées, résultats inconnus, biais de sélection, stabilité de θ_x, ψ et k ;
- BATEAU validé à part ;
- sécurité testée indépendamment des scores ;
- exemples de recommandations ;
- limites de la validation terrain.

Reports écrits par la phase 7 (§ 13) : saison proposée contre le journal, arrêté de la Manche, pages V2, second éditeur, fenêtres de marée, règle des 15 m.

Limites tenues :
- aucun changement dans `src/` (PF-19) ;
- rien du journal de Félix dans le dépôt (PF-17) ;
- aucun spot retiré ni rétrogradé (PF-04, PF-05).

## 2. Synthèse exécutive

- **Calibration : l'écart, dit honnêtement.** Il faut au moins 40 sorties notées, la note de SPUMY figée avant la sortie et la bredouille déclarée. Trois sont connues. Aucun Brier, aucune fiabilité, aucune discrimination n'est donc mesuré.
    - Ce qui est posé : l'outil, ses garde-fous, et des jeux synthétiques à vérité connue.
    - K-01 à K-03 sont reportés en phase 13, avec leur raison écrite.
    - Une question est posée à Félix (§ 12).
- **Ce que les jeux synthétiques apprennent.**
    - À 40 sorties, un prévisionniste parfaitement calibré échoue 6 fois sur 10 au seuil actuel de K-02 : une révision est proposée.
    - Des bredouilles non notées font paraître un poste 60 % meilleur qu'il n'est.
    - Une prise isolée ne prouve rien.
    - Sous quelques dizaines de sorties par poste, classer des postes, c'est classer du bruit.
- **Épreuve sur 252 vraies journées** (234 pour le classement).
    - Les critères fixés d'avance tiennent ; V-01 et V-06 ne sont tenus qu'en partie, ce qui est dit.
    - Aucun créneau « non recommandé » en V2 ne devient SAFE, sur 1 741.
    - Le Top 3 est stable à 10 points près, mais son ordre exact ne l'est pas.
    - Avec les fiches actuelles, le Top documenté est **vide tous les jours** : la règle stricte D6-15 met tous les spots dans « à vérifier ». C'est l'arbitrage n° 1 de la phase 9.
- **Saison proposée en phase 7.** Effet faible et localisé : même premier spot 96 % des journées, avril le plus touché. Ce n'est pas une preuve qu'elle classe mieux : le journal manque.
- **Revue indépendante des phases 5 et 7.**
    - Le relecteur a relevé 19 constats. Ses 2 MAJEUR sont réduits à MINEUR après contre-vérification dans les fichiers.
    - Il reste des faiblesses de libellé et de force des critères (QUAL-5, QUAL-2). Aucune ne rend un spot praticable à tort.
- **Fiches.** 85 fiches sur 98 sont auditées, dont toutes les fiches à risque. Il n'y a aucune contradiction grave.
    - Sur le web, 10 fiches sont contrôlées : les 10 lieux existent.
    - La **Pointe du Raz** propose un poste en falaise que le Grand Site déconseille.
    - La position de **Sainte-Marguerite** est celle d'un parking.
- **BATEAU.** Le modèle « d'après tes sorties » est éprouvé seul : à 8 sorties, il note de 0,1 à 9,9 sur du bruit. Le code est gelé, et la note sur 10 est retirée en V3 (V3-015).

## 3. Travail réalisé

| Étape | Produit |
| --- | --- |
| Épreuve du moteur (V-01 à V-05, V-09) | `scripts/epreuve-v3/epreuve.mjs`, `data/moteur-bord/epreuve-phase-8.json`, `docs/validation/EPREUVE-MOTEUR-PHASE-8.md` |
| Outil de calibration K-01 à K-03 | `scripts/calibration/verification.mjs` |
| Jeux synthétiques (calibration, journal, BATEAU) | `scripts/calibration/journal-synthetique.mjs`, `data/moteur-bord/calibration-synthetique.json`, `docs/validation/CALIBRATION-PHASE-8.md` |
| Audit stratifié des fiches | `scripts/audit-fiches-phase-8.mjs`, `data/spots/audit-phase-8.json`, `docs/validation/AUDIT-FICHES-PHASE-8.md` |
| Revue indépendante des phases 5 et 7 | `docs/validation/REVUE-INDEPENDANTE-PHASES-5-7.md` |
| Contrôles | `tests/calibration.mjs` (CI) ; 2 essais de sabotage ; PF-34 posé ; REC-11 et SPOT-07 reliés à leurs preuves |
| Correction de données | registre : l'office de tourisme de Saint-Malo n'est plus compté comme deux éditeurs |

## 4. Justification des changements

Rien ne change dans l'application. Les outils et les épreuves recalculent tout depuis les fichiers du dépôt. Les corrections qui touchent un critère validé, ou une donnée de sécurité d'une fiche V2, sont proposées et non faites (PF-04).

### Solutions comparées

**Comment juger les notes de SPUMY sans assez de sorties ?**

| Solution | Avantage | Inconvénient |
| --- | --- | --- |
| A. Calculer K-01 à K-03 sur les 3 sorties | un chiffre tout de suite | sans valeur statistique, et il trahit le journal (3 sorties, donc chaque prise se lit) |
| B. Rejouer les sorties passées que Félix retrouve (date, spot, résultat), sur la météo archivée | vrai hors échantillon : le modèle n'a jamais été ajusté sur elles ; possible avant la phase 13 | note recalculée et non figée ; dépend de la mémoire de Félix ; bredouilles oubliées (biais mesuré : × 1,6) |
| C. Outil et jeux synthétiques maintenant, mesure sur le journal confirmé (phase 13) | rien de forcé ; la mesure sera juste quand les données existeront | aucune mesure réelle avant la phase 13 |

**Recommandée : C maintenant, puis B si Félix retrouve au moins 40 sorties, bredouilles comprises.** C'est l'objet de la question unique (§ 12).

**Seuil de K-02.**
- (a) Intervalle de la pente contenant 1 : presque sans puissance à 40 sorties.
- (b) Pente publiée avec son intervalle, barre jugée à partir de 400 sorties, BSS et AUC d'ici là.

**Recommandée : (b)**, à arbitrer en phase 9.

**Règle de sécurité stricte (D6-15, D6-21) face à l'épreuve.**
- (a) La garder : tous les spots sont « à vérifier » tant que les fiches ne sont pas documentées.
- (b) Revenir au comportement V2 : la lacune est écrite et la Confiance baissée.

L'épreuve chiffre l'effet : Top vide 234 jours sur 234. Une fois les fiches documentées, il resterait 2,8 spots documentés par jour. **Recommandée : (a), avec la recherche des données de sécurité comme priorité.** C'est la seule conforme à « une donnée de sécurité inconnue n'est jamais au vert ». Elle reste à décider par Félix (phase 9).

### Mise en œuvre pas à pas

1. Recalculer l'épreuve : `node scripts/epreuve-v3/epreuve.mjs --verifier` doit afficher « épreuve de la phase 8 à jour ».
2. Recalculer les jeux synthétiques : `node scripts/calibration/journal-synthetique.mjs --verifier`.
3. Recalculer l'audit : `node scripts/audit-fiches-phase-8.mjs --verifier`.
4. Tout contrôler : `node tests/calibration.mjs` doit afficher 44/44.
5. **Mesurer les notes sur un vrai journal**, le jour où il y a 40 sorties :
    1. exporter le journal **hors du dépôt**, par exemple dans le dossier Téléchargements ;
    2. lancer `node scripts/calibration/verification.mjs ~/Téléchargements/export.json` ;
    3. ne recopier dans le dépôt que les chiffres agrégés. L'outil refuse un fichier placé dans le dépôt.
6. Si Félix retrouve des sorties passées (solution B) :
    1. les noter hors du dépôt : date, spot, durée, prises ou bredouille ;
    2. rejouer la météo archivée de ces journées dans l'intégration continue (`scripts/epreuve-fetch.mjs`) ;
    3. passer le résultat à l'outil. Seuls les agrégats reviennent.

## 5. Livrables

| Livrable du référentiel | Fichier |
| --- | --- |
| Rapport de validation indépendante | ce rapport ; `docs/validation/REVUE-INDEPENDANTE-PHASES-5-7.md` |
| Fiche d'audit spot par spot selon le risque | `data/spots/audit-phase-8.json` (85 fiches) ; `docs/validation/AUDIT-FICHES-PHASE-8.md` |
| Résultats des tests halieutiques et du moteur | `data/moteur-bord/epreuve-phase-8.json` ; `docs/validation/EPREUVE-MOTEUR-PHASE-8.md` |
| Baseline | B-simple et B-V2, comparées sur 234 journées (EPREUVE, § 3) |
| Seuils validés | aucun seuil n'est validé sans Félix ; seuils et statuts proposés : § 12 |
| Anomalies et risques résiduels | § 10 ; REVUE § 2 ; AUDIT § 3 |
| Limites de calibration | `docs/validation/CALIBRATION-PHASE-8.md` |

## 6. Git et état du dépôt

- **Commits** : 14 commits atomiques avant ce rapport, tous poussés. `main` est inchangée et rien n'est fusionné.
- **Proposition** : n° 29, en brouillon vers la branche de la phase 7.
- **Fichiers** : 26 touchés avant ce rapport.
- **`src/`** : aucun fichier touché. Le modèle BATEAU est seulement importé par les jeux synthétiques.
- **Données** : aucun spot retiré, aucun secret. Rien du journal de Félix : les journées de l'archive qui portent une session sont écartées, et les exemples sont des journées choisies d'avance.

## 7. Preuves

Contrôles pendant la phase :
- calibration et épreuve 44/44 ;
- pare-feux 2061/2061 ;
- sabotage 53/53 ;
- spots V3 1266/1266.

`npm run -s verifier` sur la branche, avant les corrections de la passe 2 : construction et `npm test` au vert (561 s), le reste au vert.

### 7 bis. Gate final

Gate rejoué sur un clone neuf de 6ee97cf, le 27 nov. 2026 (tout le code et les données de la phase ; seul ce paragraphe a été ajouté depuis) :

| Commande | Code | Résultat |
| --- | --- | --- |
| `npm ci --ignore-scripts` | 0 | 0 faille |
| `npm run -s verifier` | 0 | 8 suites sur 8 au vert : construction ; npm test (552 s) ; accessibilité (0 violation) ; mise à jour 12/12 ; prototype V2 244/244 ; prototype V3 227/227 ; marque 35/35 ; indicateurs (aucun recul) |
| CI « tests », « contrat », « ign » sur 6ee97cf | success | passages 45912874059, 45912874141, 45912874146 |

Un premier gate, lancé sur 5a05a7a, a été arrêté volontairement : les corrections de la passe 3 sont venues après.

## 8. Résultats fonctionnels et qualité

| Indicateur | Valeur | Commentaire |
| --- | --- | --- |
| K-01 Brier skill score | non mesuré | 3 sorties notées sur 40 ; outil posé ; phase 13 |
| K-02 Pente de fiabilité | non mesuré | même besoin ; seuil à revoir (§ 4) |
| K-03 Aire ROC | non mesuré | même besoin |
| K-08 sécurité documentée | 22 fiches sur 98 | inchangé ; la revue montre qu'une fiche (Surtainville) le doit à une règle générale seulement |
| K-09 crédibilité | 48 sur 98 | inchangé |
| K-10 exactitude de la position | 69 sur 98 | inchangé ; Sainte-Marguerite est contestée par le contrôle web |
| K-11 complétude moyenne | 64,4 % | inchangé |
| K-12 conformité réglementaire | 63 sur 98 | inchangé : l'arrêté signé de la Manche est toujours illisible |

- **Ce qui fonctionne** :
    - la sécurité proposée ne fait jamais passer un créneau « non recommandé » au vert ;
    - les publications respectent la règle « pas de nombre sans tout connaître » ;
    - l'outil de calibration retrouve ce qu'on met dans les jeux synthétiques.
- **Ce qui ne fonctionne pas encore** : aucune fiche ne peut être SAFE, donc aucun Top documenté. Et aucune calibration réelle n'est faite.
- **Ce qui reste incertain** : quelle architecture classe le mieux, faute de vérité terrain. B-simple reste la baseline à battre.

## 9. Matrice des exigences

| Exigence | État en fin de phase 8 | Preuve, ou écart |
| --- | --- | --- |
| REC-11 | spécifiée et éprouvée sur l'étude ; acceptation en phase 11 | épreuve sur 234 journées (`tests/calibration.mjs`) ; paramètres non calibrés faute de sorties (K-01 à K-03, phase 13) |
| SPOT-07 | acceptée (revue) | revue indépendante ; audit stratifié ; contrôle web de 10 fiches ; aucune fiche ajoutée sans source |
| JRN-06 | à faire, phase 13 | instantané de la note exigé par l'outil (`noteFigee`) ; vue de comparaison à l'intégration |
| QA-02 | à faire, phase 14 | — |
| SPOT-01, BAT-01, QA-03, OPS-01 | acceptées | aucun spot perdu ; e2e BATEAU ; CI ; branche |

Tableau complet : `docs/regles/EXIGENCES.md`.

## 10. Red-team et risques

**Passe 1, auteur (27 nov.).** Constats trouvés et corrigés :
- trois fausses contradictions dans l'audit (« site isolé », « s'engager ») ;
- un test de calibration qui ne pouvait pas échouer (`||`) ;
- l'import de `revision-saison.mjs` exécutait le script ;
- un comptage de corroboration propre à l'audit, remplacé par QUAL-1.

**Passe 2, relecteur indépendant** (lecture seule, contexte minimal : diff et grille de 8 points). Bilan : 4 MAJEUR, 8 MINEUR, 3 OBSERVATION.
- Les 4 MAJEUR sont corrigés (EPREUVE, § 6) :
    - un critère de sécurité ne pouvait pas échouer ;
    - le rang ne se faisait pas sur la fenêtre SAFE du contrat ;
    - deux inconnues (direction « ? », lumière) étaient lues comme connues ;
    - V-01 et V-03 étaient déclarés tenus mais appliqués en partie.
- Les mineurs sont repris :
    - journées écartées dites ;
    - départage par le temps de route ;
    - strate « engagement inconnu » ;
    - motif accentué ;
    - garde-fou du journal durci contre les liens et « ..x » ;
    - saison répétée 50 fois ;
    - comptes de la revue corrigés ;
    - recommandation K-02 revue.
- **V-06** (revue du dossier 00 à 06) : tenue **en partie**. Le dossier a été relu à travers l'épreuve (point C7), et les constats MAJEUR qui touchaient l'accord entre le contrat et l'épreuve sont fermés. Il n'y a pas eu de relecture ligne à ligne des documents 02 à 05 : elle est reportée à la phase 9, qui consolide ces spécifications.

**Passe 3, contre-vérification** par un second relecteur indépendant, en lecture seule, sur les corrections.
- Sur les 15 constats de la passe 2 : 10 fermés, 4 partiels, 1 ouvert.
- Il a aussi relevé 8 défauts nouveaux : 1 MAJEUR, 3 MINEUR, 4 OBSERVATION.

Reprises :
- **MAJEUR, gate et passe 3 annoncés mais absents du rapport** : ils y sont maintenant (§ 7 bis et ce paragraphe).
- **V-06** : dit « en partie » (voir ci-dessus).
- **Comptes** : 252 journées pour les créneaux, 234 pour le classement.
- **K-02** : le libellé de l'intervalle est corrigé (centiles sur 200 journaux, pas l'intervalle d'un journal).
- **Test PF-17** : il nettoie son dossier temporaire.
- **Limites dites dans l'épreuve** :
    - deux lacunes critiques sur quatre seulement sont codées ;
    - V-04 est une non-régression ;
    - la perturbation météo ne départage pas les architectures ;
    - le créneau de V-03 n'est pas celui du contrat.
- **Ouvert et assumé** : PF-34 est « contrôlé » pour ce qui existe (l'outil et ses garde-fous). « Les notes jugées sur le journal » reste un complément daté de la phase 13 (`aCompleter`), que les pare-feux contrôlent.
- **SPOT-07** reste acceptée. Ses deux MAJEUR ont été réduits par l'auteur, faits à l'appui, et un second relecteur a vu cette réduction sans la contester ; les corrections de critère sont proposées pour la phase 9.

Risques :
- **règle stricte** : tant que les fiches ne sont pas documentées, SPUMY BORD ne recommande aucun spot sans réserve ;
- **ordre du Top 3** : fragile, il dépend des tables de points ;
- **journal** : sans bredouilles déclarées, toute mesure serait faussée ;
- **fiches V2** : Pointe du Raz (poste en falaise déconseillé par le Grand Site) et Sainte-Marguerite (position d'un parking), à revoir avec Félix.

### Menaces actuelles et parades

Veille du 27 nov. 2026, qui complète celle du 26 nov. (rapport de phase 7) :

| Menace | Parade dans SPUMY | Contrôle |
| --- | --- | --- |
| Actions GitHub compromises puis réactivées avec leur charge Mini Shai-Hulud toujours active (BleepingComputer ; The Hacker News, sept. 2026) ; vol de secrets par des workflows piégés. Titres lus, articles non lus : détails INCONNUS | actions épinglées par empreinte (une action réactivée sous la même étiquette ne change rien à une empreinte fixée) ; Dependabot des actions avec 7 jours de délai ; aucun secret dans le dépôt | `tests/actions-epinglees.mjs`, `tests/secrets.mjs` |
| Vers npm auto-propagés (ChainDrop, plus de 400 paquets ; Mini Shai-Hulud, plus de 320 paquets, SecurityWeek) | installation sans scripts, verrou intègre, délai de 7 jours, liste des failles en CI | `scripts/pare-feux/bibliotheques.mjs` |
| Export du journal déposé par erreur dans le dépôt (risque propre à cette phase) | l'outil refuse un fichier du dépôt, liens résolus ; agrégats seulement | `tests/calibration.mjs` (PF-17) |
| Pages et rapports d'agents qui donnent des ordres | lus comme des données ; chaque constat des relecteurs vérifié dans les fichiers avant correction | conduite de session |

Sources :
- [BleepingComputer, actions GitHub réactivées avec la charge Mini Shai-Hulud](https://bleepingcomputer.com/news/security/github-actions-re-enabled-with-mini-shai-hulud-payload-still-active)
- [The Hacker News, septembre 2026](https://thehackernews.com/2026/09/compromised-github-actions-came-back.html)
- [SecurityWeek, ChainDrop](https://www.securityweek.com/over-400-npm-packages-infected-in-chaindrop-supply-chain-attack/amp/)
- [SecurityWeek, Mini Shai-Hulud](https://www.securityweek.com/over-320-npm-packages-hit-by-fresh-mini-shai-hulud-supply-chain-attack)

## 11. Qualité et conformité

Critères du § 13.4 :

| N° | Critère | État |
| --- | --- | --- |
| 1 | Périmètre réalisé | oui pour chaque point du référentiel, avec ses limites écrites. Reports de la phase 7 qui restent ouverts : arrêté signé de la Manche (toujours illisible), 242 pages V2, second éditeur pour 89 postes, fenêtres de marée au format V3, règle des 15 m. Ce sont des recherches, pas des validations |
| 2 | Livrables produits | oui (§ 5) |
| 3 | Exigences couvertes | oui : preuve ou écart écrit (§ 9 ; PF-46 vert) |
| 4 | Tests exécutés, codes consignés | § 7 et § 7 bis |
| 5 | Preuves accessibles | oui : chaque résultat se recalcule |
| 6 | Risques documentés | oui (§ 10) |
| 7 | Red-team | trois passes, dont une par un relecteur indépendant |
| 8 | Aucun défaut bloquant ouvert | oui après les corrections de la passe 2 |
| 9 | Validations utilisateur requises | **oui** : la phase 8 attend la validation de Félix ; les livrables soumis à sa revue sont au § 12 |
| 10 | Documentation conforme | oui ; état de reprise mis à jour |

- **Statut : TESTED, en attente de la validation de Félix.** Ce n'est pas VALIDATED : le critère 9 n'est pas rempli.
- **UX et UI** : aucun écran changé.

## 12. Questions utilisateur et décisions attendues

**Posée maintenant (une seule) :** combien de sorties passées au bord, pour le bar, peux-tu retrouver avec la date, le spot, la durée et le résultat, bredouilles comprises ? À partir d'environ 40, SPUMY peut mesurer la justesse de ses notes, et seuls des chiffres d'ensemble entrent dans le dépôt.

**Livrables soumis à ta revue** (référentiel) ; les arbitrages définitifs se font en phase 9 :
- **critères TOP_TIER** : les sept critères tiennent. Deux renforcements sont proposés :
    - Q7-04, deux phases de marée au moins : Mousterlin passerait « à vérifier » ;
    - QUAL-5 : une règle générale ne suffit plus seule (Surtainville, −1 fiche à K-08) ; la consultation des mouvements de terrain est vérifiée dans le code ;
- **limites de calibration** : `docs/validation/CALIBRATION-PHASE-8.md` ;
- **seuils et statuts proposés** :
    - K-02 jugé à partir de 400 sorties ;
    - paliers 75 / 65 / 55 / 45 gardés (aucune preuve pour les changer) ;
    - règle de sécurité stricte gardée, avec son effet chiffré (Top vide) ;
    - effets BATEAU montrés seulement quand leur intervalle exclut zéro ;
- **fiches à revoir avec toi** : Pointe du Raz (poste en falaise), Sainte-Marguerite (position), Goury (courants jusqu'à 10 à 12 nœuds), Paluden (commune).

**Déjà ouvertes, non reposées** : confirmation des phases 6 et 7 ; D6-01 à D6-21 ; Q7-01, Q7-02, Q7-04 ; niveaux d'engagement ; seuils BATEAU. Q7-05 a une réponse, gardée hors du dépôt : le niveau 4 de l'hypothèse « abri » est gardé.

## 13. Prochaine phase proposée

**Phase 9 du référentiel (consolidation des spécifications du moteur)**, avec son propre jeton.
- Arbitrer D6-01 à D6-21, avec les chiffres de cette épreuve.
- Arbitrer les propositions du § 12.
- Garder la saison V2 ou adopter la proposition de la phase 7 (effet mesuré, faible).
- **Prérequis** : la validation de la phase 8 par Félix, puis le jeton « APPROVED — PROCEED TO PHASE 9 ».

## 14. Arrêt

Phase 8 close : **TESTED, en attente de la validation de Félix**. Il n'y a ni phase 9 sans son propre jeton, ni rien de planifié au-delà. Aucun changement du moteur avant l'approbation qui suit la phase 9.

## Complément du 27 nov. 2026 (réponse de Félix à la question du § 12)

Félix ne peut retrouver **aucune** sortie passée. La solution B (rejouer des sorties passées sur la météo archivée) est donc écartée. La mesure de K-01 à K-03 se fera sur les sorties notées à partir de maintenant : la V2 garde déjà, pour chaque sortie, la note de SPUMY au moment de la saisie, le nombre de bars, la durée et la météo du moment. Le statut de la phase ne change pas : TESTED, en attente de la validation de Félix.

## Validation (27 nov. 2026)

Félix, 6 h 15 : « Je valide la phase 8. » Statut : **VALIDATED (Félix, 27 nov. 2026)**. Décisions prises avec lui le même matin, pour la phase 9 (journal des décisions) : note de chaque spot affinée par les sorties au bord, affichée à côté de la note du modèle seul et mise à jour seule, réversible ; sorties de chaque pêcheur séparées ; rubrique « d'après tes sorties » sur la fiche ; retours de terrain vers la fiche commune. Aucune phase 9 sans son propre jeton.
