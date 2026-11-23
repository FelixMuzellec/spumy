# Rapport de phase 4 — SPUMY V3 : architecture détaillée, socle technique et assainissement contrôlé

23 novembre 2026 · branche `claude/v3-phase-4` (depuis `claude/v3-phase-3`) · proposition n° 18 (brouillon). Format du référentiel, § 16.

## 1. Objectif et périmètre

Jeton « APPROVED — PROCEED TO PHASE 4 » (Félix, 23 nov. 2026, 13 h 50). Référentiel § 15 (phase 4), § 10 à § 12 ; ADR-V3-020 (contrats JSDoc et `tsc --checkJs`).

Périmètre :
- architecture détaillée sur la base validée ;
- contrats typés, gestion d'erreurs, validation des entrées ;
- tests et CI, fixtures déterministes, configuration reproductible, secrets ;
- conventions, nettoyage autorisé, protection de `main` ;
- documentation opérationnelle, installation et lancement reproductibles.

Hors périmètre : aucune fonction métier, aucun changement de l'interface publiée, aucune suppression de branche (V3-019), aucune fusion.

## 2. Synthèse

Le socle est mesuré, documenté et contrôlé en continu. Les contrats de la V3 sont typés et vérifiés, une erreur commune et une validation des entrées sont en place, et la CI contrôle désormais les types, les secrets, le socle et le logo. L'installation depuis un clone neuf a été rejouée de bout en bout.

Cette répétition a fait trouver et corriger deux défauts réels :
- la construction n'était plus reproductible : esbuild lisait la configuration du contrôle de types ;
- le test d'accessibilité dépendait de l'heure du passage.

Deux points restent ouverts :
- **la protection de `main`** : Félix l'a accordée (« complète »), mais le relais GitHub de la session refuse ce réglage. Félix doit l'activer, en une commande ou en quelques clics ;
- **l'étalonnage de l'isochrone IGN**, prévu « en phase 4 » par l'architecture : l'IGN n'est pas joignable depuis la session. Il est proposé de le faire avec l'adaptateur IGN.

## 3. Travail réalisé

| Sous-tâche | Statut | Livrable |
| --- | --- | --- |
| 4.0 Jeton, branche, plan | IMPLEMENTED | `SPUMY_AUDIT_CONTINUITY.md`, `docs/DECISIONS_LOG.md` |
| 4.1 Audit du socle | IMPLEMENTED | `docs/socle/AUDIT-SOCLE.md` |
| 4.2 Architecture détaillée et budgets | IMPLEMENTED | `docs/ARCHITECTURE-V3.md` § 11, `scripts/mesure-perf.mjs`, `docs/socle/perf-avant.json` |
| 4.3 Contrats, erreurs, validation | TESTED | `src/core/contracts/`, `src/core/errors.js`, `src/core/validate.js`, `tsconfig.typecheck.json`, `tests/socle.mjs` |
| 4.4 Tests et CI | TESTED (CI : § 7) | `.github/workflows/tests.yml`, `tests/prototype-v3.mjs`, `tests/a11y.mjs`, `tests/requirements-marque.txt` |
| 4.5 Configuration et secrets | TESTED | `tests/secrets.mjs`, `.env.example`, `.gitignore` |
| 4.6 Conventions | IMPLEMENTED | `CONTRIBUTING.md` |
| 4.7 Nettoyage | TESTED | `docs/socle/NETTOYAGE.md` (`map.jsx` supprimé) |
| 4.8 Protection de `main` | **BLOCKED — action de Félix** | `docs/socle/PROTECTION-MAIN.md`, `docs/socle/protection-main.json` |
| 4.9 Documentation opérationnelle | IMPLEMENTED | `docs/socle/EXPLOITATION.md`, `README.md`, `CHANGELOG.md` |
| 4.10 Installation reproductible | TESTED | § 7 |
| 4.11 Red-team et rapport | ce document | — |

## 4. Changements significatifs

1. **Contrats V3 en JSDoc**, vérifiés par `npm run typecheck` (TypeScript 6.0.3 épinglé, mode strict) :
    - contrats : Position, Qualified, Spot, Route, Safety, Favorability, Confidence, Ranked, JournalEntry, avec l'instantané de note de JRN-06 ;
    - périmètre de départ : les modules communs nouveaux et le modèle de note du prototype. Il s'étendra lot par lot.
2. **`SpumyError`** : code stable par famille, message en français qui dit quoi faire, cause gardée. Les détails sont **expurgés** : ni jeton, ni journal, ni notes, et les coordonnées sont arrondies à 0,01°. Les fonctions qui peuvent échouer renvoient un `Result`.
3. **Validation aux frontières** :
    - nombres bornés, avec la virgule acceptée ;
    - coordonnées WGS 84, coefficient de 20 à 120, heure ISO avec fuseau ;
    - clé de cache arrondie à 100 m : la position exacte n'est jamais gardée.
4. **CI** : nouvelles étapes pour le contrôle de types, l'absence de secrets, le socle commun et le logo de marque. `tests/brand.py` était prévu en CI depuis la phase 3 ; il y tourne, avec des versions Python épinglées.
5. **Fixtures déterministes** :
    - le prototype V3 se mesure après le chargement des polices (cause du débordement de 5 px en CI le 23 nov.) ;
    - le test d'accessibilité tourne à heure fixe, comme les parcours.
6. **Construction reproductible** : la configuration du contrôle de types s'appelle `tsconfig.typecheck.json`. Sous le nom `tsconfig.json`, esbuild la lisait et ajoutait « use strict » au site publié, ce que la CI a bien détecté.
7. **Mesure AVANT des performances et budgets** (ARCHITECTURE-V3 § 11.5) :
    - premier affichage ≤ 1,5 s ;
    - plus grand affichage ≤ 2,5 s ;
    - premier écran ≤ 500 Ko compressés.

    Home V3 et le guide V2 dépassent aujourd'hui le plus grand affichage : photos en 1 600 px sur téléphone.
8. **Test de version du README** : il exigeait « 9.2 », alors que le site affiche 10.0 depuis `package.json`. Le test lit désormais `package.json`.

## 5. Livrables

- `docs/socle/` : AUDIT-SOCLE, EXPLOITATION, NETTOYAGE, PROTECTION-MAIN (+ `protection-main.json`), `perf-avant.json`.
- `docs/ARCHITECTURE-V3.md` § 11 :
    - arborescence et frontières ;
    - flux d'une recommandation ;
    - modèle d'erreurs ;
    - budgets ;
    - observabilité et environnements.
- Code : `src/core/contracts/index.js`, `src/core/errors.js`, `src/core/validate.js` ; `src/prototype-v3/modele.js` typé.
- Outillage :
    - `tsconfig.typecheck.json` et scripts `typecheck`, `test:secrets`, `test:socle` ;
    - `scripts/mesure-perf.mjs` ;
    - `tests/socle.mjs`, `tests/secrets.mjs`, `tests/requirements-marque.txt` ;
    - `.env.example`.

## 6. Git

- `main` inchangé ; le site en ligne n'a pas changé.
- 12 commits atomiques sur `claude/v3-phase-4`, ce rapport compris ; avant lui, 32 fichiers, +1 054 / −319. Proposition n° 18 en brouillon vers `claude/v3-phase-3`.
- Aucune branche supprimée (V3-019 non exécuté). Un seul fichier supprimé : `src/prototype-v3/map.jsx`, du code mort, restaurable par `git checkout 874912f -- src/prototype-v3/map.jsx`.
- Aucun secret ; recherche sur tout l'historique (177 commits) sans résultat.

## 7. Preuves (23 nov. 2026)

Depuis un **clone neuf** de 8118388, sauf mention :

| Commande | Code | Résultat |
| --- | --- | --- |
| `npm ci` | 0 | 237 paquets en 4 s ; 0 vulnérabilité |
| `npm run build`, puis `git status --porcelain` | 0 | aucun écart |
| `npm test` | 0 | lint ; types ; secrets (548 fichiers) ; couches 0 écart ; socle 16/16 ; données ; connaissances ; design ; design V3 186/186 ; moteur v2 56/56 ; unitaires des 7 guides ; e2e 846/846 ; contrat simulé 28/28 |
| `npm run test:a11y` | 0 | 0 violation (sur d32fe82, après la fixture d'heure ; 2 violations l'après-midi avant : § 10) |
| `npm run test:upgrade` | 0 | 12/12 |
| `npm run test:prototype` | 0 | 244/244 |
| `npm run test:prototype-v3` | 0 | 224/224 |
| `tests/brand.py` (venv, versions épinglées) | 0 | 35/35 |
| `node tests/secrets.mjs --historique` | 0 | 548 fichiers et 177 commits : aucun secret |
| `npm audit` | 0 | 0 vulnérabilité |
| `node scripts/mesure-perf.mjs` | 0 | `docs/socle/perf-avant.json` |
| CI GitHub (`tests`, `contrat`) | succès | sur d32fe82 : passages 45185341523 (Tests) et 45185341453 (Contrat Open-Meteo) verts |

## 8. Résultats

Le socle est prêt pour les phases 5 à 9 :
- un nouveau module commun a ses types, son erreur et sa validation ;
- la CI refuse un secret, une erreur de types, un logo altéré ou un site publié différent de ses sources ;
- l'installation se rejoue sur un poste neuf.

Rien n'a changé pour les personnes : le site publié est identique à ses sources, et le test de mise à jour depuis la version en ligne passe.

## 9. Exigences

Touchées : QA-01 (mesure AVANT et budgets), les exigences de sécurité « aucun secret » et de confidentialité (détails d'erreur expurgés, position arrondie dans les clés de cache), et la décision V3-020 (appliquée). Aucune exigence fonctionnelle n'est intégrée dans l'application : c'est le rôle des phases 10 à 12.

## 10. Red-team et risques

| Constat | Gravité | Traitement |
| --- | --- | --- |
| `main` toujours sans protection (relais de la session refusé) | MAJEURE | activation par Félix (`docs/socle/PROTECTION-MAIN.md`) ; d'ici là, la règle « jamais de push sur `main` » de `CLAUDE.md` |
| Étalonnage isochrone et itinéraire IGN promis « en phase 4 » non fait : l'IGN n'est pas joignable depuis la session | MAJEURE pour le classement BORD | **changement proposé** : le faire avec l'adaptateur IGN (phases 9 à 12), par un passage de CI qui, lui, atteint l'IGN ; d'ici là, aucun spot n'est écarté sur le seul polygone (règle inchangée) |
| Contrastes insuffisants dans le panneau des spots V2 à certaines heures (rouge 4,02, vert 4,36 ; texte de 13 px) | MINEURE (héritage V2) | consigné ; corrigé à l'intégration V3 ; le test d'accessibilité est désormais à heure fixe, ce qui le rend reproductible mais ne couvre plus ces heures-là |
| Les parcours et l'accessibilité tournent « aujourd'hui » : la date reste variable (marée, soleil) | MINEURE | heure fixée ; une date fixe demande des réponses météo simulées par date (à faire avec les adaptateurs) |
| ESLint 8 n'est plus maintenu | MINEURE | passage à ESLint 9 ou 10 (configuration « flat ») proposé à Félix |
| Actions GitHub épinglées par étiquette, pas par empreinte ; avertissement de dépréciation de Node 20 | MINEURE | épinglage par empreinte et passage aux versions suivantes proposés |
| Contrôle de types limité aux modules nouveaux | OBSERVATION | extension lot par lot (CONTRIBUTING) |
| Budgets mesurés sur un serveur local limité, pas sur un vrai téléphone | OBSERVATION | méthode et conditions écrites ; vérification sur appareil réel (CR-06) |
| Revue faite par l'auteur | OBSERVATION | revue indépendante prévue au référentiel (§ 14.2) avant la production |

## 11. Qualité et conformité

- **Gate technique § 12.3** : build, lint, typecheck et tests réellement lancés, codes de sortie consignés (§ 7). Aucune commande inventée ; la commande `typecheck` est nouvelle.
- **§ 12.2** : rien supprimé sans audit et restauration.
- **§ 11** : aucune donnée personnelle dans les erreurs ; position arrondie dans les clés de cache ; aucun secret.
- **§ 10.3** : budgets fixés après mesure, avec appareil émulé, réseau, scénario, outil, seuil et méthode.

## 12. Décisions attendues

1. **Activer la protection de `main`** (une commande ou quelques clics : `docs/socle/PROTECTION-MAIN.md`).
2. **Étalonnage IGN** : accepter de le faire avec l'adaptateur IGN (phases 9 à 12) plutôt qu'en phase 4 ?
3. **ESLint 9 ou 10** et **actions épinglées par empreinte** : à faire maintenant (petite phase de maintenance) ou à la phase 14 ?
4. **Fusion des phases 2, 3 et 4** (= publication) : recommandation inchangée, attendre l'intégration.
5. Toujours ouvertes : V3-019, D-11 (44 px ou 48 dp), D-15 (emplacement de l'export).

## 13. Prochaine phase

**Phase 5 : audit BORD et référentiel halieutique des spots.** Elle comprend :
- l'audit des 66 spots V2 ;
- le catalogue unique (`data/spots/`, V3-018) ;
- les fiches au schéma du § 7.4 ;
- les fenêtres horaires, les sources et les niveaux de preuve.

Elle s'appuie sur les contrats de `src/core/contracts/` et sur la validation des entrées.

## 14. Arrêt

Phase 4 **TESTED**, hors 4.8 (BLOCKED, action de Félix). Aucune tâche de la phase 5 n'a commencé. Jeton attendu : `APPROVED — PROCEED TO PHASE 5`.

## Complément du 23 novembre 2026 (réponses de Félix, 14 h 54)

Réponses de Félix aux décisions du § 12, consignées dans `docs/DECISIONS_LOG.md` :

| Point | Réponse de Félix | Suite |
| --- | --- | --- |
| 1. Protection de `main` | oui | Nouvel essai à 14 h 58 : toujours refusé par le relais de la session (HTTP 403, non contourné). **Reste à faire par Félix**, en une minute : `docs/socle/PROTECTION-MAIN.md`. |
| 2. Étalonnage IGN | « si c'est la meilleure option, on avance » | Oui, c'est la meilleure option : l'étalonnage compare les temps de route aux points d'accès des spots, que la phase 5 audite. Il est fait après la phase 5, avec l'adaptateur IGN (ARCHITECTURE-V3 § 4). **Oubli corrigé** : le rapport de phase 2 prévoyait en phase 4 un test CORS de l'IGN, absent du rapport de phase 4. Il est fait (4.14). |
| 3. ESLint, épinglage des actions | « si c'est la meilleure solution technique, on avance » | Oui, maintenant plutôt qu'en phase 14, avec une correction : ESLint 9 est en fin de vie depuis le 6 août 2026, donc ESLint 10 (4.12). Actions épinglées par empreinte (4.13). |
| 4. Fusions | oui, attendre l'intégration de la V3 | Rien n'est fusionné. |

### Sous-tâches ajoutées

| Sous-tâche | Statut | Livrable |
| --- | --- | --- |
| 4.12 ESLint 10 | TESTED | ESLint 10.15.0 en configuration « flat » ; `eslint.config.js`, `tests/lint-regles.mjs`, `docs/socle/MAINTENANCE-OUTILS.md` § 1 |
| 4.13 Actions épinglées par empreinte | TESTED | checkout 7.0.1, setup-node 7.1.0, upload-artifact 7.0.2, toutes sous Node 24 ; contrat Open-Meteo sur `ubuntu-24.04` ; `tests/actions-epinglees.mjs`, `docs/socle/MAINTENANCE-OUTILS.md` § 2 |
| 4.14 Contrat IGN | TESTED | `.github/workflows/contrat-ign.yml`, `tests/contrat-ign.mjs` ; non exigé pour fusionner |

### Résultat du contrat IGN

Premier passage, 23 nov. 2026, passage 45210735483 : **8/8**.
- Le géocodage, l'itinéraire et l'isochrone répondent depuis la CI.
- Les ressources `bdtopo-osrm` et `bdtopo-valhalla` sont annoncées.
- Les trois services renvoient `Access-Control-Allow-Origin: *`.
- Les trois appels réussissent dans Chromium, depuis une page de l'origine `https://felixmuzellec.github.io`.

**CORS est donc ouvert : le relais du plan B (V3-009) n'est pas nécessaire.** Le contrat le revérifie chaque jour.

### Preuves

| Commande | Code | Résultat |
| --- | --- | --- |
| `npm run lint` (ESLint 10.15.0) | 0 | 149 fichiers, les mêmes qu'avec ESLint 8 ; 0 erreur, 0 avertissement ; règles 19/19 ; actions et images de runner : OK |
| `tests/lint-regles.mjs` sur ESLint 8.57.1 (copie propre de 22e705b) | — | 19/19 cas identiques |
| `node tests/actions-epinglees.mjs`, deux cas négatifs (`@v7`, `ubuntu-latest`) | 1 et 1 | refusés comme prévu |
| `npm audit` | 0 | 0 vulnérabilité (10.15.0 ; la 10.14.0 en avait 3, par minimatch) |
| `npm test` (535183f) | 0 | e2e 846/846, contrat simulé 28/28 |
| CI sur 44dc559 | succès | Tests 45191466560, Contrat Open-Meteo 45191466716 : actions épinglées et ESLint 10 |
| CI sur e6d4aa3 | succès | Contrat IGN 45210735483 (8/8), Contrat Open-Meteo 45210735478, Tests 45210735286 |

### Red-team, mise à jour

| Constat | Gravité | Traitement |
| --- | --- | --- |
| ESLint 8 n'est plus maintenu | — | **résolu** (4.12) |
| Actions épinglées par étiquette ; Node 20 | — | **résolu** (4.13) |
| CORS de l'IGN inconnu (rapport de phase 2) | — | **résolu** : ouvert (4.14) |
| Étalonnage IGN | MAJEURE pour le classement BORD | reporté après la phase 5, accord de Félix ; règle inchangée d'ici là |
| `main` sans protection | MAJEURE | action de Félix |
| La règle de clés remplaçant `react/jsx-key` est plus étroite (fragments, ternaires et tableaux non couverts) | MINEURE | remettre eslint-plugin-react quand il déclarera ESLint 10 |
| Un seul trajet IGN mesuré, Coutances → Granville (centres) : 30,0 km en 48 min (2 899 s), soit 37 km/h de moyenne | OBSERVATION (HYPOTHÈSE : temps IGN prudents) | à confronter au terrain lors de l'étalonnage ; s'ils sont prudents, le filtre des 60 min écarterait trop de spots |
| Empreintes d'actions à tenir à jour à la main | OBSERVATION | procédure dans MAINTENANCE-OUTILS § 2 ; Dependabot possible, non activé (décision de Félix) |

### Décisions encore attendues

1. Activer la protection de `main` (`docs/socle/PROTECTION-MAIN.md`).
2. Toujours ouvertes, sans urgence :
    - V3-019 (nettoyage des branches) ;
    - D-11 (44 px ou 48 dp) ;
    - D-15 (emplacement de l'export) ;
    - Dependabot pour les actions (option).
3. Le jeton de la phase 5.

### Arrêt

Phase 4 **TESTED**, hors 4.8 (BLOCKED, action de Félix). Aucune tâche de la phase 5 n'a commencé. Jeton attendu : `APPROVED — PROCEED TO PHASE 5`.
