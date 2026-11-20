# SPUMY_AUDIT_CONTINUITY.md

Suivi unique du chantier V3. Il dit où en est le travail, pourquoi il s'est arrêté et quelle est la prochaine action. Il ne prouve rien à lui seul : vérifier l'état réel du dépôt avant de reprendre (référentiel, § 3.4).

- **Référentiel maître** : `docs/SPUMY_MASTER_PROMPT.md` (V4.1.13, SHA-256 33ba3fff…). Instructions courtes : `CLAUDE.md`.
- **Décisions** : `docs/DECISIONS_LOG.md`. **Exigences** : `docs/REQUIREMENTS.md`.
- **Historique V2** (prompt maître V2, phases 1 à 13) : `docs/historique/CONTINUITE-V2.md`.
- **Jeton de phase** : `APPROVED — PROCEED TO PHASE X`, phase exacte. Sans jeton, aucune phase ne démarre.

## État des phases V3

| Phase | Statut | Jeton | Livrables |
| --- | --- | --- | --- |
| 1. Audit initial V2 (lecture seule) | TESTED, avec une réserve : P1-14 (site en ligne dans un vrai navigateur) BLOCKED, aucun navigateur relié | démarrage (§ 18) | Rapport https://claude.ai/artifact/62UYfGbGKJtRvo6rAF9QrK ; copie `docs/rapports/v3/PHASE-1.md` |
| 2. Vision produit, exigences et architecture cible | IN PROGRESS | « APPROVED — PROCEED TO PHASE 2 », 20 nov. 2026, 1 h 24 | Branche `claude/v3-phase-2` |
| 3 à 15 | NOT STARTED | — | — |

Le jeton de la phase 2 a été donné après le rapport de phase 1, qui proposait de passer outre la réserve P1-14. Il vaut acceptation de cette réserve (INFÉRÉ) ; le contrôle sera refait dès qu'un navigateur sera relié.

## Phase 2 — sous-tâches

| Sous-tâche | Statut | Fichiers |
| --- | --- | --- |
| 2.0 Branche, continuité, `CLAUDE.md`, référentiel maître | IMPLEMENTED (a228e7a ; proposition n° 16 en brouillon) | ce fichier, `CLAUDE.md`, `docs/SPUMY_MASTER_PROMPT.md`, `docs/historique/CONTINUITE-V2.md`, `docs/rapports/v3/PHASE-1.md` |
| 2.1 Journal des décisions | IMPLEMENTED (20 ADR : 8 validées, 7 proposées, 5 à décider) | `docs/DECISIONS_LOG.md` |
| 2.2 Services externes, licences | IMPLEMENTED (pages officielles lues le 20 nov.) | `docs/DATA_SOURCES.md` |
| 2.3 Vision, découverte produit, exigences | IMPLEMENTED (83 exigences, 10 hypothèses, matrice BATEAU) | `docs/VISION-V3.md`, `docs/design/DISCOVERY.md`, `docs/REQUIREMENTS.md` |
| 2.4 Architecture cible, menace, migration, stratégie de test | IMPLEMENTED | `docs/ARCHITECTURE-V3.md`, `docs/security/THREAT_MODEL.md`, `docs/MIGRATION-V3.md`, `docs/TEST_STRATEGY.md` |
| 2.5 Vérification, red-team, rapport, arrêt | NOT STARTED | `docs/rapports/v3/PHASE-2.md` |

## Questions et décisions (registre)

| N° | Date | Question | Réponse | Effet |
| --- | --- | --- | --- | --- |
| Q1 | 20 nov., 1 h 05 | Relier un navigateur pour auditer le site en ligne | sans réponse ; jeton de phase 2 donné ensuite | P1-14 BLOCKED, réserve acceptée (INFÉRÉ) |
| Q2 | 20 nov., 1 h 30 | Qui utilisera SPUMY V3 ? | « Moi et quelques proches » | Usage privé, gratuit, non commercial : hébergement statique, sans compte ; ADR-V3-005 |

## Checkpoint

- Branche : `claude/v3-phase-2`, partie de `main` (bb4f940).
- Dernier commit : voir `git log` ; ce fichier est mis à jour à chaque sous-tâche.
- Tests : la phase 2 ne touche que des documents ; la suite complète est relancée avant le rapport.

## Prochaine action

2.5 : décisions groupées à Félix, vérification croisée des documents, tests, rapport de phase 2, arrêt.

## Règle de passation (limite de crédits, référentiel § 3.6)

Dès qu'un avertissement de crédits, de quota ou de contexte apparaît, ou que le reste à faire risque de ne pas tenir : ne rien commencer de nouveau ; lister ce qui reste obligatoire dans la phase ; si la clôture complète tient, finir la phase (tests, red-team, documents, sauvegarde, rapport) puis s'arrêter ; sinon s'arrêter au premier point sûr, sans sauter de contrôle, phase `IN PROGRESS` ou `BLOCKED`. Avant l'arrêt : tout écrire sur disque, commit atomique sur la branche de phase (jamais `main`), et mettre à jour ce fichier avec `STOP_REASON: CREDIT_LIMIT`, la phase et son statut exact, la sous-tâche terminée, la sous-tâche en cours, les tâches restantes dans l'ordre, les fichiers touchés, la branche, le dernier commit, l'état du diff, les tests et leurs codes de sortie, les preuves, les décisions prises et attendues, les risques et la prochaine action exacte. Rapport de passation marqué `ARRÊT AUTOMATIQUE — LIMITE DE CRÉDITS`, avec `PHASE TERMINÉE` ou `PHASE NON TERMINÉE — REPRISE NÉCESSAIRE`. À la reprise : relire `CLAUDE.md`, ce fichier, `docs/DECISIONS_LOG.md` et l'état Git réel, puis reprendre la prochaine tâche non terminée de la même phase, sans redemander le jeton. Une nouvelle phase exige toujours son propre jeton.
