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
| 2. Vision produit, exigences et architecture cible | VALIDATED (jeton de phase 3) | « APPROVED — PROCEED TO PHASE 2 », 20 nov. 2026, 1 h 24 | Rapport https://claude.ai/artifact/JWzDnppc1u7Wf6SPEgceDn ; copie `docs/rapports/v3/PHASE-2.md` ; branche `claude/v3-phase-2`, proposition n° 16 (brouillon) |
| 3. Conception UX/UI, direction artistique, Design System, prototypes | TESTED (jalons 1 et 2 validés par Félix ; jeton de phase 4 attendu) | « APPROVED — PROCEED TO PHASE 3 », 20 nov. 2026, 4 h 25 | Rapport https://claude.ai/artifact/MUeZdUAtxSDqAKQxML511A ; copie `docs/rapports/v3/PHASE-3.md` ; branche `claude/v3-phase-3` (partie de `claude/v3-phase-2`), proposition n° 17 (brouillon) |
| 4 à 15 | NOT STARTED | — | — |

Le jeton de la phase 2 a été donné après le rapport de phase 1, qui proposait de passer outre la réserve P1-14. Il vaut acceptation de cette réserve (INFÉRÉ) ; le contrôle sera refait dès qu'un navigateur sera relié.

## Phase 2 — sous-tâches

| Sous-tâche | Statut | Fichiers |
| --- | --- | --- |
| 2.0 Branche, continuité, `CLAUDE.md`, référentiel maître | IMPLEMENTED (a228e7a ; proposition n° 16 en brouillon) | ce fichier, `CLAUDE.md`, `docs/SPUMY_MASTER_PROMPT.md`, `docs/historique/CONTINUITE-V2.md`, `docs/rapports/v3/PHASE-1.md` |
| 2.1 Journal des décisions | IMPLEMENTED (20 ADR : 8 validées, 7 proposées, 5 à décider) | `docs/DECISIONS_LOG.md` |
| 2.2 Services externes, licences | IMPLEMENTED (pages officielles lues le 20 nov.) | `docs/DATA_SOURCES.md` |
| 2.3 Vision, découverte produit, exigences | IMPLEMENTED (84 exigences, 10 hypothèses, matrice BATEAU) | `docs/VISION-V3.md`, `docs/design/DISCOVERY.md`, `docs/REQUIREMENTS.md` |
| 2.4 Architecture cible, menace, migration, stratégie de test | IMPLEMENTED | `docs/ARCHITECTURE-V3.md`, `docs/security/THREAT_MODEL.md`, `docs/MIGRATION-V3.md`, `docs/TEST_STRATEGY.md` |
| 2.5 Vérification, red-team, rapport, arrêt | TESTED (npm test 0 ; e2e 849/849 ; build identique à main) | `docs/rapports/v3/PHASE-2.md` |

## Phase 3 — sous-tâches

| Sous-tâche | Statut | Fichiers |
| --- | --- | --- |
| 3.0 Branche, validations de la phase 2, suivi | IMPLEMENTED (proposition n° 17) | `docs/DECISIONS_LOG.md`, ce fichier |
| 3.1 Audit AVANT : captures de toutes les routes et de tous les états, registre priorisé des écarts | IMPLEMENTED (31 captures, 22 écarts ; site en ligne non vérifiable) | `docs/design/AUDIT-UX-AVANT.md`, `docs/design/avant/` |
| 3.2 Logos : manifeste, matrice des usages, exports V3 sans altération du poisson, test de la zone protégée | TESTED (`python3 tests/brand.py` 23/23, code 0) | `docs/design/BRAND-MANIFEST.md`, `scripts/logos-v3.py`, `assets/brand/v3/`, `tests/brand.py` |
| 3.3 Planche UI Showcase écran par écran ; revue des photos et demandes de remplacement | IMPLEMENTED (8 écrans revus ; 4 photos demandées à Félix le 20 nov., `BLOCKED — PHOTO UTILISATEUR ATTENDUE`) | `docs/design/REFERENCES.md` |
| 3.4 Usages, scénarios, architecture de l'information, parcours, carte, cartes de recommandation (jalon 1) | VALIDATED avec remarques (Félix, 20 nov., 13 h 46) ; remarques intégrées : UX-V3 version 2, 15 wireframes, ADR V3-023 et V3-024, 94 exigences | `docs/design/UX-V3.md`, `docs/design/wireframes/` (page de revue publiée en artefact privé) |
| 3.5 Design System V3 : jetons, contrastes, composants, états, contenus | TESTED (`npm run test:design-v3` : 168/168, code 0 ; lint 0 ; couches 0 écart) ; valeurs à valider au jalon 2 | `docs/design/DESIGN-SYSTEM-V3.md`, `src/design/v3/`, `scripts/tokens-v3.mjs`, `tests/design-v3.mjs`, `docs/design/contrastes-v3.json` ; ADR V3-021 et V3-022 proposées |
| 3.6 Prototype interactif (BORD et BATEAU) ; les wireframes sont faits en 3.4 | VALIDATED avec réserves (jalon 2, Félix, 20 nov., 15 h 40 ; V3-027) sur la version 5.2 (28b3b85 ; `test:prototype-v3` 156/156, `test:design-v3` 186/186, `tests/brand.py` 29/29) | `src/prototype-v3/`, `scripts/build-prototype-v3.mjs`, `tests/prototype-v3.mjs`, `prototype-v3/`, `docs/design/PROTOTYPE-V3.md`, `docs/design/prototype-v3/` ; artefact « Prototype SPUMY V3 » |
| 3.7 Revues, tests, galerie AVANT/CIBLE, matrices de conformité et de traçabilité | IMPLEMENTED (revues UX, plateformes, WCAG 2.2, DA, carte, contenus, terrain ; 16 défauts dont 8 corrigés, 0 critique ou majeur ouvert ; matrices § 6.16 et de traçabilité ; 14 critères de recette ; TEST UTILISATEUR NON EFFECTUÉ, protocole prêt ; prototype 5.3 : `test:prototype-v3` 194/194) | `docs/design/REVUES-V3.md`, `docs/design/galerie-avant-cible.html` (artefact privé), `scripts/mesures-revue-v3.mjs`, `docs/design/revue-v3-mesures.json` |
| 3.8 Rapport et arrêt | TESTED (`npm ci`, `npm run build` sans écart, `npm test`, `test:a11y`, `test:upgrade`, `test:prototype` 244/244, `test:prototype-v3` 194/194, `tests/brand.py` 29/29 : tous code 0 ; CI verte sur a2b7844 ; D-16 corrigé en 76338f2) | `docs/rapports/v3/PHASE-3.md`, document Claude du rapport |

## Questions et décisions (registre)

| N° | Date | Question | Réponse | Effet |
| --- | --- | --- | --- | --- |
| Q1 | 20 nov., 1 h 05 | Relier un navigateur pour auditer le site en ligne | sans réponse ; jeton de phase 2 donné ensuite | P1-14 BLOCKED, réserve acceptée (INFÉRÉ) |
| Q2 | 20 nov., 1 h 30 | Qui utilisera SPUMY V3 ? | « Moi et quelques proches » | Usage privé, gratuit, non commercial : hébergement statique, sans compte ; ADR-V3-005 |
| Q3 | 20 nov., 4 h 18 | Branche BATEAU de la phase 13 | La reprendre en V3 | ADR-V3-014 ; proposition n° 15 gardée en brouillon |
| Q4 | 20 nov., 4 h 18 | Vigilance Météo-France | Petit relais gratuit | ADR-V3-011 ; comptes Météo-France et Cloudflare à fournir par Félix plus tard |
| Q5 | 20 nov., 4 h 18 | Place réservée dans le Top 3 | Oui, 15 min ou moins | ADR-V3-016, REC-06 |
| Q6 | 20 nov., 4 h 18 | Ancienne note sur 10 | La retirer | ADR-V3-015, REC-12 |
| Q7 | 20 nov., 5 h 05 | 4 photos à remplacer (2 espèces BATEAU, 1 silhouette, 1 semi-rigide), avec briefs | reçues le 20 nov., 4 h 56 (heure de Paris), conformes ; copies à 1 024 px seulement | intégrées à titre provisoire (`bar-eau-claire`, `lieu-noir-pont-jig`, `platier-aube-frontale`, `jigging-console-sondeur`) ; 2ᵉ envoi à 6 h 18 : bar corrigé (contenu nouveau), les 3 autres identiques ; mais seulement 512 px (la conversation réduit les images) : rien n'est remplacé ; originaux demandés par Google Drive |
| Q8 | 20 nov. | Jalon 1 : tâches prioritaires, architecture, parcours (UX-V3, 13 wireframes) | répondu le 20 nov., 13 h 46 : tâches validées ; 11 remarques sur l'architecture et les parcours (Home, Météo, barre, position, horaires, courbe de marée, vent, bateau, carte marine en bonus) | intégrées (V3-023, V3-024) |
| — | 20 nov., 4 h 50 | Félix demande des prompts complets pour les photos de Q7 | fournis (4 prompts) | `docs/design/PROMPTS-PHOTOS.md` |
| Q9 | 20 nov., après 13 h 46 | Seuil du filtre « Favorables » : 60, 65 ou 75 | **75** (Félix) | V3-021 VALIDÉE ; `FAVORABLE_MIN`, `isFavorable` testés ; MAP-08 |
| Q10 (jalon 2) | 20 nov., 14 h 26 | Retour de Félix sur le prototype : « loin d'un graphisme top tier » ; pas assez de photos, photos de mauvaise qualité, interface lourde et peu attrayante ; les informations y sont. Barre : impossible de faire défiler les onglets. Carte : pastilles laides et incompréhensibles (carrés, barrés, pointillés, « ? ») ; le nombre de pastilles doit égaler les compteurs ; couleurs appréciées, mais il manque les scores. Météo : bien, graphisme à travailler ; différence BORD / Mer (carrés, ronds) incomprise | jalon 2 NON VALIDÉ : refonte visuelle faite (3.6, versions 2 à 5.2), revalidée en Q11 | V3-025 |
| Q11 (jalon 2) | 20 nov., 15 h 37 | Validation explicite du jalon 2 sur la version 5.2, avec les réserves proposées | « jalon 2 validé avec réserves » (15 h 40) | V3-022, V3-025 et V3-027 VALIDÉES AVEC RÉSERVES ; 6 réserves suivies en 3.7 |
| Q12 (version 6) | 23 nov., 5 h 50 à 6 h 22 | Maquettes de Félix (Home, Carte, vidéo Météo) : reproduction fidèle et même standard partout ; slogan ; 7 propositions | Recommandations acceptées ; slogan gardé ; Carte = vue pêche, Météo = vue conditions ; vent en couleurs gardé ; panneau à droite qui s'ouvre et se ferme au toucher ; Home parfaite, partie haute fixe qui se resserre ; aucune courbe de profondeur inventée ; ne pas revenir sur ce qui est validé | V3-028 VALIDÉE ; `docs/design/PROTOTYPE-V6.md` ; `CLAUDE.md` et UX-03 mis à jour |
| Q13 (finalité) | 23 nov., 6 h 59 | Directive de Félix sur le but des onglets Carte et Météo | Carte = typologie du terrain et ses effets sur la pêche du bar ; Météo = effet de chaque élément expliqué scientifiquement | V3-029 VALIDÉE ; MAP-09 et MET-05 ajoutées ; `PROTOTYPE-V6.md` § 0, 3, 4 |
| Q14 (ordre de l'information) | 23 nov., 7 h 03 | Précision de Félix : « toujours de façon générale pour aller vers le spécifique » | Vue d'ensemble, puis le spot, puis chaque élément, puis le détail sourcé ; explication de la règle générale vers le cas du spot | V3-029 complétée ; `CLAUDE.md` ; `PROTOTYPE-V6.md` § 0 |

## Checkpoint

- Branche : `claude/v3-phase-3`, partie de `claude/v3-phase-2` (05cbcc0), elle-même partie de `main` (bb4f940). La phase 2 n'est pas fusionnée.
- Dernier commit : voir `git log` ; ce fichier est mis à jour à chaque sous-tâche.
- Tests : suite complète relancée le 20 nov. 2026 (3.8), tous les codes de sortie à 0 ; voir le rapport, § 7.
- Rien n'est fusionné ; `main` reste à bb4f940 ; V3-019 non exécuté.

## Prochaine action

Phase 3 TESTED, rapport remis. Version 6 du prototype décidée le 23 nov. (V3-028) : NE PAS COMMENCER avant le feu vert explicite de Félix. Au feu vert, suivre `docs/design/PROTOTYPE-V6.md` § 8, dans la phase 3, sur `claude/v3-phase-3`, sans rien publier. Ne pas revenir sur ce qui est validé. Le jeton de phase 4 sera demandé après la revalidation de la version 6.

## Règle de passation (limite de crédits, référentiel § 3.6)

Dès qu'un avertissement de crédits, de quota ou de contexte apparaît, ou que le reste à faire risque de ne pas tenir : ne rien commencer de nouveau ; lister ce qui reste obligatoire dans la phase ; si la clôture complète tient, finir la phase (tests, red-team, documents, sauvegarde, rapport) puis s'arrêter ; sinon s'arrêter au premier point sûr, sans sauter de contrôle, phase `IN PROGRESS` ou `BLOCKED`. Avant l'arrêt : tout écrire sur disque, commit atomique sur la branche de phase (jamais `main`), et mettre à jour ce fichier avec `STOP_REASON: CREDIT_LIMIT`, la phase et son statut exact, la sous-tâche terminée, la sous-tâche en cours, les tâches restantes dans l'ordre, les fichiers touchés, la branche, le dernier commit, l'état du diff, les tests et leurs codes de sortie, les preuves, les décisions prises et attendues, les risques et la prochaine action exacte. Rapport de passation marqué `ARRÊT AUTOMATIQUE — LIMITE DE CRÉDITS`, avec `PHASE TERMINÉE` ou `PHASE NON TERMINÉE — REPRISE NÉCESSAIRE`. À la reprise : relire `CLAUDE.md`, ce fichier, `docs/DECISIONS_LOG.md` et l'état Git réel, puis reprendre la prochaine tâche non terminée de la même phase, sans redemander le jeton. Une nouvelle phase exige toujours son propre jeton.
