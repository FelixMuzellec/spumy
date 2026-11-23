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
| 3. Conception UX/UI, direction artistique, Design System, prototypes | VALIDATED (jeton de phase 4 ; version 6.2 du prototype acceptée par la demande du jeton, INFÉRÉ) | « APPROVED — PROCEED TO PHASE 3 », 20 nov. 2026, 4 h 25 | Rapport https://claude.ai/artifact/MUeZdUAtxSDqAKQxML511A ; copie `docs/rapports/v3/PHASE-3.md` ; branche `claude/v3-phase-3` (partie de `claude/v3-phase-2`), proposition n° 17 (brouillon) |
| 4. Architecture détaillée, socle technique et assainissement contrôlé | VALIDATED (jeton de phase 5) | « APPROVED — PROCEED TO PHASE 4 », 23 nov. 2026, 13 h 50 | Rapport `docs/rapports/v3/PHASE-4.md` ; branche `claude/v3-phase-4` (depuis `claude/v3-phase-3`, 080d5e3), proposition n° 18 (brouillon) |
| 5. Audit BORD et référentiel halieutique des spots | IN PROGRESS | « APPROVED — PROCEED TO PHASE 5 », 23 nov. 2026, 20 h 02 | branche `claude/v3-phase-5` (depuis `claude/v3-phase-4`) |
| 6 à 15 | NOT STARTED | — | — |

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
| 3.9 Prototype V6 (maquettes de Félix, V3-028 à V3-030 ; feu vert du 23 nov., 8 h 47 ; version 6.1 recalée sur les maquettes après la remarque de 12 h 07 ; version 6.2 après les remarques de 12 h 45) | TESTED (version 6.2 : `prototype-v3 --axe` 224/224, `npm test` 0, `tests/brand.py` 35/35 ; `npm test` 0, `test:a11y` 0, `test:upgrade` 12/12, `test:prototype` 244/244, `prototype-v3 --axe` 216/216, `connaissances-v6 --check` 0) ; revalidation par Félix attendue | `docs/design/PROTOTYPE-V6.md`, `src/prototype-v3/` (geo, connaissances, data, effets, geomap, carte6, home, v6.css), `scripts/geo-v6.mjs`, `scripts/connaissances-v6.mjs`, `scripts/logos-modes-v6.py`, `tests/prototype-v3.mjs`, captures `docs/design/prototype-v3/`, planches `docs/design/comparaison-v6/`, documents DESIGN-SYSTEM-V3 § 11, UX-V3 § 15, PROTOTYPE-V3, REVUES-V3 § 14, REQUIREMENTS (MAP-02, MET-01, UX-05, UX-09) |

## Phase 4 — sous-tâches

Référentiel § 15 (phase 4), § 10, § 11, § 12 ; ARCHITECTURE-V3 (phase 2) ; V3-020 (contrats JSDoc et `tsc --checkJs`). Rien n'est supprimé sans audit de dépendances et stratégie de restauration ; V3-019 n'est pas exécuté.

| Sous-tâche | Statut | Fichiers |
| --- | --- | --- |
| 4.0 Jeton, branche, suivi, plan | IMPLEMENTED | ce fichier, `docs/DECISIONS_LOG.md` |
| 4.1 Audit du socle (stack réelle, dépendances, sécurité des dépendances, CI, reproductibilité, inventaire de nettoyage) | IMPLEMENTED (`npm audit` 0 vulnérabilité ; historique sans secret ; ESLint 8 non maintenu ; CI sans typecheck ni brand.py) | `docs/socle/AUDIT-SOCLE.md` |
| 4.2 Architecture détaillée (modules, frontières V3 / services communs / héritage V2, flux, erreurs, migration) | IMPLEMENTED (ARCHITECTURE-V3 § 11 ; mesure AVANT des performances et budgets) | `docs/ARCHITECTURE-V3.md`, `scripts/mesure-perf.mjs`, `docs/socle/perf-avant.json` |
| 4.3 Contrats typés (JSDoc) et `tsc --checkJs` ; erreurs typées ; validation des entrées | TESTED (`npm run typecheck` 0, TypeScript 6.0.3 épinglé ; `tests/socle.mjs` 16/16 ; couches 0 écart) | `src/core/contracts/index.js`, `src/core/errors.js`, `src/core/validate.js`, `tsconfig.typecheck.json`, `tests/socle.mjs`, `src/prototype-v3/modele.js` (types), `tests/layers.mjs` |
| 4.4 Tests et CI : fixtures déterministes (heure, fuseau, polices), contrôles manquants en CI (typecheck, marque) | TESTED (CI : typecheck, secrets, socle, marque avec versions Python épinglées ; tests du prototype V3 attendent les polices ; accessibilité à heure fixe ; `npm test` 0, prototype-v3 224/224 ; CI verte sur d32fe82 : Tests 45185341523, Contrat 45185341453) | `.github/workflows/`, `tests/` |
| 4.5 Configuration reproductible et secrets (`.env.example`, détection de secrets, `.gitignore`) | TESTED (`tests/secrets.mjs` : 544 fichiers et 173 commits, aucun secret ; `.env.example` ; `.gitignore` complété) | `.env.example`, `tests/secrets.mjs` |
| 4.6 Conventions et qualité de code | IMPLEMENTED (conventions V3 dans CONTRIBUTING ; ESLint 8 non maintenu : passage à ESLint 9 ou 10 proposé à Félix, pas fait d'office) | `CONTRIBUTING.md`, `.eslintrc.json` |
| 4.7 Nettoyage autorisé (registre, suppressions sûres seulement, restauration) | TESTED (`map.jsx` supprimé après audit ; lint 0, couches 0, construction identique ; reste en registre ; branches : V3-019, rien supprimé) | `docs/socle/NETTOYAGE.md` |
| 4.8 Protection de `main` | TESTED (posée par Félix le 23 nov., 15 h 31, ruleset 27906963 ; contrôle exigé corrigé par Félix à 19 h 47 : `tests` et `contrat`, GitHub Actions ; vérifié en lecture à 19 h 50) | `docs/socle/PROTECTION-MAIN.md`, `docs/socle/protection-main.json` |
| 4.9 Documentation opérationnelle, README et fichiers de pilotage | IMPLEMENTED (EXPLOITATION : installer, publier, revenir en arrière, surveiller, incident, secrets, sauvegardes, coûts ; README et CHANGELOG à jour) | `README.md`, `docs/socle/EXPLOITATION.md`, `CHANGELOG.md` |
| 4.10 Installation et lancement reproductibles (clone neuf) | TESTED (clone neuf de 8118388 : `npm ci` 0, build sans écart, `npm test` 0, upgrade 12/12, prototype 244/244, prototype-v3 224/224, marque 35/35, secrets 177 commits ; deux défauts trouvés et corrigés : esbuild lisait `tsconfig.json`, test a11y dépendant de l'heure) | — |
| 4.11 Red-team, rapport en 14 parties, arrêt | TESTED (red-team : 2 constats majeurs ouverts, protection de `main` et étalonnage IGN, 7 mineurs ou observations ; preuves § 7 du rapport) | `docs/rapports/v3/PHASE-4.md` |
| 4.12 ESLint 10 (réponse de Félix, 23 nov., 14 h 54) | TESTED (19f8737 : ESLint 10.15.0, configuration « flat », eslint-plugin-react retiré, mêmes 149 fichiers, 0 erreur et 0 avertissement avant et après, `tests/lint-regles.mjs` 19/19 sur ESLint 8 et 10, `npm audit` 0 ; `npm test` 0 sur 535183f, e2e 846/846 ; CI verte sur 44dc559) | `eslint.config.js`, `tests/lint-regles.mjs`, `package.json`, `package-lock.json`, `tests/upgrade.mjs`, `docs/socle/MAINTENANCE-OUTILS.md` |
| 4.13 Actions épinglées par empreinte | TESTED (535183f : checkout 7.0.1, setup-node 7.1.0, upload-artifact 7.0.2, Node 24 ; contrat sur `ubuntu-24.04` ; `tests/actions-epinglees.mjs` OK, deux cas négatifs à 1 ; CI verte sur 44dc559 : Tests 45191466560, Contrat Open-Meteo 45191466716) | `.github/workflows/`, `tests/actions-epinglees.mjs` |
| 4.14 Contrat IGN en CI : joignabilité et CORS depuis le site publié (promis en phase 4 par le rapport de phase 2, oublié dans le rapport de phase 4) | TESTED (e6d4aa3 ; passage 45210735483 : 8/8, CORS ouvert `Access-Control-Allow-Origin: *`, appels réussis dans Chromium depuis l'origine du site ; relais non nécessaire, V3-009 complétée) | `.github/workflows/contrat-ign.yml`, `tests/contrat-ign.mjs`, `docs/DATA_SOURCES.md`, `docs/ARCHITECTURE-V3.md`, `docs/DECISIONS_LOG.md` |
| 4.15 Complément du rapport, CI verte, arrêt | TESTED (complément du rapport, red-team mise à jour, CHANGELOG ; test de mise à jour : échec rare de `page.reload` sur 90eaf1b, puis blocage de 34 min ; blocage corrigé, échec simulé en 8 s, code 1 ; local 12/12) | `docs/rapports/v3/PHASE-4.md`, `CHANGELOG.md`, `tests/upgrade.mjs` |
| 4.16 Décisions du 23 nov. (19 h 07) : V3-019, D-11, D-15, Dependabot, IGN | TESTED (b125156, 648d8cc, 3e624b7 ; étiquette `v2-final` publiée par Félix à 20 h 00, vérifiée (bb4f940) ; D-11 consigné, appliqué à l'intégration ; D-15 dans le prototype, 224/224 ; `src/core/ign/reponses.js`, socle 25/25 ; contrat IGN 15/15 en CI ; `npm test` 0) | `docs/DECISIONS_LOG.md`, `docs/ARCHITECTURE-V3.md`, `src/core/ign/reponses.js`, `tests/contrat-ign.mjs`, `.github/dependabot.yml`, prototype |

## Phase 5 — sous-tâches

Référentiel § 15 (phase 5), § 7 (sources, pipeline, préservation V2, schéma des fiches, marée, fenêtres horaires), § 9.1.2 et § 9.1.3 (audit biologique et variables). Livrables : (1) audit fonctionnel BORD ; (2) audit halieutique BORD ; (3) base de spots enrichie ; (4) registre de sources ; (5) couverture, limites, contradictions et anomalies. Aucun spot V2 supprimé, aucune donnée de personne écrasée, aucune coordonnée personnelle dans le dépôt, aucun secteur dans le produit ; paywalls et CGU respectés. La phase demandera plusieurs sessions : chaque sous-tâche est commitée et notée ici.

| Sous-tâche | Statut | Fichiers |
| --- | --- | --- |
| 5.0 Jeton, branche, plan | IMPLEMENTED | ce fichier, `docs/DECISIONS_LOG.md` |
| 5.1 Inventaire exhaustif et sauvegarde logique des spots V2, empreintes, comparaison avant/après | TESTED (32a36a3 : 66 spots, 7 guides, 66 identifiants uniques ; 7 spots du guide Pirou sans coordonnées numériques (texte à la minute près) ; `--verifier` 0, dans `npm test` et la CI) | `scripts/inventaire-spots-v2.mjs`, `data/spots/` |
| 5.2 Audit fonctionnel V2, BORD et BATEAU (parcours, moteurs, espèces, spots, données, sécurité, matériel, localisation, UX) — livrable 1 | IMPLEMENTED (espèces réelles : bar en BORD ; lieu jaune, lieu noir, maquereau, bar, vieille, saint-pierre en BATEAU ; aucun point d'accès dans les fiches ; 8 écarts pour la phase 5) | `docs/audit/` |
| 5.3 Registre central des spots au schéma § 7.4 (66 fiches `v2_preserved`, identifiants V3-018, statut, provenance, preuve, dernière vérification, lacunes) | TESTED (schéma `data/schema/spot-v3.schema.json` ; 66 fiches `data/spots/fiches/`, toutes « à vérifier », 0 stationnement connu ; registre `data/spots/registre.json` généré ; `tests/spots-v3.mjs` 404/404, dans `npm test` et la CI ; 28 fiches V2 citent le journal personnel : anomalie à revoir) | `data/schema/`, `data/spots/`, tests |
| 5.4 Registre de sources (évaluation § 7.1, indépendance, droits, CGU) — livrable 4 | IN PROGRESS (292 sources ; 8 évaluées à la main : textes officiels 2026, IGN, OpenStreetMap ; 284 sources V2 encore « à évaluer ») | `data/sources/`, `docs/halieutique/REGISTRE-SOURCES.md` |
| 5.5 Référentiel biologique par espèce, région et saison (espèces réelles de la V2), fiches de preuve, lacunes et contradictions | IMPLEMENTED, version 1 (bar : deux stocks, cycle d'après Fritsch 2005, juvéniles, marée, rythme, température, régime ; lieu jaune, maquereau, vieille, saint-pierre ; lieu noir en lacune ; réglementation BATEAU ; à lire : atlas des frayères de l'Ifremer 2024, mois des frayères Manche) | `docs/halieutique/REFERENTIEL-BIOLOGIQUE.md` |
| 5.6 Recherche systématique des spots, Bretagne → Cherbourg, première passe | IMPLEMENTED (9 candidats : 3 candidats, 1 doublon probable de goury, 2 hors BORD, 2 zones, 1 à accès restreint ; aucun au niveau d'une fiche ; lacunes : Manche nord et est, Ille-et-Vilaine, Côtes-d'Armor, Morbihan) | `data/spots/candidats.json` |
| 5.7 Vérification par spot : coordonnées, accès et stationnement, marche, milieu, marée en quatre phases, conditions, sécurité, réglementation, fenêtres, photos | IN PROGRESS (collecte IGN par la CI : stationnement et marche 59/66, positions contrôlées 60, corrigées 3 (+ Régnéville en cours) ; réglementation du bar 2026 vérifiée 66/66 ; marée : 133 phases sur 264 depuis les fenêtres V2 ; reste : poste réel de pirou, gouville, surtainville, écarts > 1,5 km, sécurité et fenêtres V3, photos, sources § 7.1) | `scripts/collecte-acces.mjs`, `scripts/integrer-acces.mjs`, `scripts/reglementation-fiches.mjs`, `scripts/marees-fiches.mjs`, `data/spots/collecte/` |
| 5.8 Deuxième passe : spots oubliés, déséquilibres de couverture | NOT STARTED | `data/spots/` |
| 5.9 Qualification des fiches (critères explicites) et facteurs complémentaires documentés | NOT STARTED | `data/spots/`, `docs/halieutique/` |
| 5.10 Rapport de couverture, limites, contradictions et anomalies — livrable 5 | IN PROGRESS (version intermédiaire) | `docs/halieutique/COUVERTURE.md` |
| 5.11 Red-team, rapport en 14 parties, arrêt | NOT STARTED | `docs/rapports/v3/PHASE-5.md` |

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
| Q15 (justification) | 23 nov., 7 h 47 | Précision de Félix : partir de la carte de chaque onglet, puis justifier | Carte : pourquoi ce spot est bon aujourd'hui par son terrain ; Météo : comment chaque élément a pesé dans la note | V3-029 complétée ; MAP-09, MET-05 ; `CLAUDE.md` ; `PROTOTYPE-V6.md` § 0 |
| Q16 (niveaux) | 23 nov., 7 h 52 | Précision de Félix : pas toute l'information au même niveau | La carte au premier écran ; bulle et panneau courts ; justification et détail sous la carte, en faisant défiler, avec au moins la rigueur des trois vues | V3-029 complétée ; `CLAUDE.md` ; `PROTOTYPE-V6.md` § 0, 3, 4 |
| Q17 (journal) | 23 nov., 8 h 11 | Directive de Félix : juger les notes sur le journal et faire s'affiner le modèle | Déjà au référentiel (§ 9.3.1, phase 8) ; ajout de l'instantané de la note et de la vue de comparaison ; apprentissage contrôlé, approuvé, réversible | V3-030 VALIDÉE ; JRN-06 ; `PROTOTYPE-V6.md` § 5 |
| Q18 (protection de main) | 23 nov., 13 h 55 | Question de la phase 4 : quelle protection pour `main` ? | Félix : « Complète » (PR obligatoire, CI `tests` et `contrat` verte, ni push forcé ni suppression, contournement administrateur par PR seulement) | Pose bloquée par le relais (403) ; à activer par Félix (`docs/socle/PROTECTION-MAIN.md`) |

## Checkpoint

- Branche : `claude/v3-phase-4`, partie de `claude/v3-phase-3` (080d5e3), elle-même partie de `claude/v3-phase-2`, partie de `main` (bb4f940). Aucune des phases 2 à 4 n'est fusionnée.
- Dernier commit : voir `git log` ; ce fichier est mis à jour à chaque sous-tâche.
- Tests : clone neuf de 8118388 le 23 nov. 2026, tous les codes de sortie à 0 : `npm ci`, `npm run build` sans écart, `npm test` (e2e 846/846), `test:upgrade` 12/12, `test:prototype` 244/244, `test:prototype-v3` 224/224, `tests/brand.py` 35/35, secrets sur 177 commits ; `test:a11y` 0 violation sur d32fe82 ; CI verte sur d32fe82.
- Rien n'est fusionné ; `main` reste à bb4f940 et sans protection (4.8) ; V3-019 non exécuté.

## Prochaine action

Phase 5 IN PROGRESS sur `claude/v3-phase-5` (proposition n° 19). Ordre de reprise :
1. Intégrer la collecte de Régnéville (`data/spots/collecte/demande.json`, passage « Collecte des accès des spots » sur la proposition), avec `node scripts/integrer-acces.mjs <fichier>` après avoir enregistré le résultat IGN dans `data/spots/collecte/` ;
2. 5.8, deuxième passe de recherche sur les lacunes (Manche nord et est, Ille-et-Vilaine, Côtes-d'Armor, Morbihan) : clubs, guides professionnels, comptes rendus datés ; promouvoir en fiches `v3_researched` les candidats établis ;
3. 5.7 : sécurité et fenêtres V3 par spot, évaluation § 7.1 des sources V2 les plus citées, photos ;
4. 5.9 qualification, puis 5.11 red-team et rapport en 14 parties.

## Règle de passation (limite de crédits, référentiel § 3.6)

Dès qu'un avertissement de crédits, de quota ou de contexte apparaît, ou que le reste à faire risque de ne pas tenir : ne rien commencer de nouveau ; lister ce qui reste obligatoire dans la phase ; si la clôture complète tient, finir la phase (tests, red-team, documents, sauvegarde, rapport) puis s'arrêter ; sinon s'arrêter au premier point sûr, sans sauter de contrôle, phase `IN PROGRESS` ou `BLOCKED`. Avant l'arrêt : tout écrire sur disque, commit atomique sur la branche de phase (jamais `main`), et mettre à jour ce fichier avec `STOP_REASON: CREDIT_LIMIT`, la phase et son statut exact, la sous-tâche terminée, la sous-tâche en cours, les tâches restantes dans l'ordre, les fichiers touchés, la branche, le dernier commit, l'état du diff, les tests et leurs codes de sortie, les preuves, les décisions prises et attendues, les risques et la prochaine action exacte. Rapport de passation marqué `ARRÊT AUTOMATIQUE — LIMITE DE CRÉDITS`, avec `PHASE TERMINÉE` ou `PHASE NON TERMINÉE — REPRISE NÉCESSAIRE`. À la reprise : relire `CLAUDE.md`, ce fichier, `docs/DECISIONS_LOG.md` et l'état Git réel, puis reprendre la prochaine tâche non terminée de la même phase, sans redemander le jeton. Une nouvelle phase exige toujours son propre jeton.
