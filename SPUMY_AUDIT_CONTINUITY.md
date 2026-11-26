# SPUMY_AUDIT_CONTINUITY.md

État courant du chantier V3, court par principe (Félix, 25 nov. 2026, 20 h 36 : mêmes exigences, moins de jetons). Il ne prouve rien seul : vérifier l'état réel du dépôt (référentiel § 3.4). Historique complet, déplacé tel quel : `docs/continuite/HISTORIQUE-V3.md`. Paquet d'entrée de session : `npm run -s contexte -- <phase>`.

## État des phases V3

| Phase | Statut | Rapport |
| --- | --- | --- |
| 1. Audit initial V2 | TESTED ; réserve P1-14 acceptée (INFÉRÉ) | `docs/rapports/v3/PHASE-1.md` |
| 2. Vision, exigences, architecture cible | VALIDATED (jeton de la phase 3) | `docs/rapports/v3/PHASE-2.md` |
| 3. UX/UI, Design System, prototypes | VALIDATED (jeton de la phase 4) | `docs/rapports/v3/PHASE-3.md` |
| 4. Architecture détaillée, socle, assainissement | VALIDATED (jeton de la phase 5) | `docs/rapports/v3/PHASE-4.md` |
| 5. Audit BORD et référentiel des spots | close, tous ses gates PASS (ouverture de la phase 6 par le jeton conditionnel du 23 nov., 23 h 15) | `docs/rapports/v3/PHASE-5.md` |
| 6. Conception et validation du moteur BORD | VALIDATED (par délégation de Félix, 23 nov., 23 h 15 ; à confirmer par Félix) | `docs/rapports/v3/PHASE-6.md` |
| 7. Deuxième passe de recherche et enrichissement halieutique | VALIDATED (par délégation de Félix, 23 nov., 23 h 15 ; à confirmer par Félix) ; close le 26 nov. 2026 | `docs/rapports/v3/PHASE-7.md` |
| 8. Validation indépendante du référentiel et calibration du moteur | IN PROGRESS (jeton du 26 nov. 2026, 23 h 48 ; ouverte à 23 h 57) | `docs/rapports/v3/PHASE-8.md` (à écrire) |
| 9 à 15 | NOT STARTED ; jamais de phase 9 sans son propre jeton | — |

## Checkpoint

- Phase 8 : branche `claude/v3-phase-08-validation-calibration` (depuis la phase 7), proposition n° 29 en brouillon vers la branche de la phase 7.
- Phase 7 : branche `claude/v3-phase-07-enrichissement-halieutique` (depuis `claude/v3-phase-6`), proposition n° 28 en brouillon vers `claude/v3-phase-6`.
- Branche de travail : `claude/v3-phase-6` (propositions en chaîne n° 16 à 20 jusqu'à `main`, toutes en brouillon ; rien n'est fusionné dans `main`, qui reste la V2 publiée, `v2-final` sur bb4f940). Les suivis du 24 et du 25 nov. (n° 21 à 26) y sont intégrés.
- Contrôles : `npm run -s verifier` (toutes les suites, une ligne chacune) ; CI de chaque proposition (pare-feux, sabotage, bibliothèques, indicateurs).
- Pare-feux : `docs/regles/PARE-FEUX.md` (50 règles), `docs/regles/EXIGENCES.md` (98 exigences), `docs/regles/KPI.md` (37 indicateurs, 10 sections). Crochets Git : `git config core.hooksPath .githooks` à chaque session.

## Points ouverts

- **À confirmer par Félix** : phases 6 et 7 VALIDATED par délégation ; questions Q7-01 à Q7-05 (`docs/halieutique/REGISTRE-INCONNUES-PHASE-7.md`, Q7-03 posée) ; décisions D6-01 à D6-21 après les phases 8 et 9 (notamment D6-15 et D6-21, règle de sécurité stricte).
- **Félix** : renommage des branches (`bash scripts/renommer-branches.sh`, `docs/BRANCHES.md`) ; réglages de sécurité recommandés (`docs/security/THREAT_MODEL.md`) ; archive ZIP de la V2 sur Drive reportée (« on verra cela plus tard »).
- **Échéances écrites** : 7 écarts d'exigences (`docs/regles/EXIGENCES.md`) ; 9 versions de développement admises jusqu'au 30 nov. (`tests/pare-feux/failles-acceptees.json`) ; pare-feux, exigences et indicateurs prévus par phase (paquet de contexte).
- **Indicateurs des spots** : objectifs suivis, jamais au détriment des spots ; à défaut de sources, voie empirique (journal).

## Prochaine action

Phase 8 en cours (reprises de secours à 3 h 51 et 7 h 51 : reprendre ici, sans rien refaire). Fait et poussé : épreuve sur 234 journées (`scripts/epreuve-v3/`), outil de calibration K-01 à K-03 et jeux synthétiques, BATEAU compris (`scripts/calibration/`, `tests/calibration.mjs`, PF-34 posé, K-01 à K-03 reportés en phase 13 faute de sorties), audit stratifié des fiches (`scripts/audit-fiches-phase-8.mjs`), revue indépendante des phases 5 et 7 et contrôle web de 10 fiches (résultats à consigner dans `docs/validation/`). Reste : documents `docs/validation/`, exigences REC-11 et SPOT-07, passes de challenge 2 et 3, rapport en 14 parties, gate sur clone neuf, CI, question unique à Félix. Statut final : soumis à la validation de Félix (aucune délégation). Aucune phase 9.

- **Environnement** : le Playwright du dépôt attend Chromium 1194. Faire pointer `/opt/pw-browsers/chromium-1194/chrome-linux` et `chromium_headless_shell-1194/chrome-linux` vers les versions 1243 installées (`cp -rs`, et le lien `headless_shell`). `npm run -s verifier` dure plus de 10 min : le lancer en arrière-plan.

## Règle de passation (limite de crédits, référentiel § 3.6)

Dès qu'un avertissement de crédits, de quota ou de contexte apparaît, ou que le reste à faire risque de ne pas tenir : ne rien commencer de nouveau ; lister ce qui reste obligatoire dans la phase ; si la clôture complète tient, finir la phase (tests, red-team, documents, sauvegarde, rapport) puis s'arrêter ; sinon s'arrêter au premier point sûr, sans sauter de contrôle, phase `IN PROGRESS` ou `BLOCKED`. Avant l'arrêt : tout écrire sur disque, commit atomique sur la branche de phase (jamais `main`), et mettre à jour ce fichier avec `STOP_REASON: CREDIT_LIMIT`, la phase et son statut exact, la sous-tâche terminée, la sous-tâche en cours, les tâches restantes dans l'ordre, les fichiers touchés, la branche, le dernier commit, l'état du diff, les tests et leurs codes de sortie, les preuves, les décisions prises et attendues, les risques et la prochaine action exacte. Rapport de passation marqué `ARRÊT AUTOMATIQUE — LIMITE DE CRÉDITS`, avec `PHASE TERMINÉE` ou `PHASE NON TERMINÉE — REPRISE NÉCESSAIRE`. À la reprise : relire `CLAUDE.md`, ce fichier, `docs/DECISIONS_LOG.md` et l'état Git réel, puis reprendre la prochaine tâche non terminée de la même phase, sans redemander le jeton. Une nouvelle phase exige toujours son propre jeton.
