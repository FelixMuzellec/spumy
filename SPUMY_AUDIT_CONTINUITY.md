# SPUMY_AUDIT_CONTINUITY.md

Document de continuité unique du chantier « audit, amélioration et refonte » (section 24 du prompt maître). Il dit où en est le travail ; il ne prouve rien à lui seul : vérifier l'état réel du dépôt avant de reprendre.

## Périmètre

Audit et refonte de SPUMY en 17 phases validées une à une par Félix (`APPROVED — PROCEED TO PHASE X`). Modes BORD (pêche du bord) et BATEAU. Référence visuelle : maquette en 8 écrans fournie par Félix.

## État

| Phase | Statut | Livrable |
| --- | --- | --- |
| 1. Audit initial | VALIDATED (6 nov. 2026) | Rapport « SPUMY — Phase 1 : audit initial » (document Claude de Félix) |
| 2. Architecture cible | VALIDATED (6 nov. 2026, 22 h 59) | Document « SPUMY — Phase 2 : architecture cible » ; résumé dans `docs/ARCHITECTURE.md` |
| 3. Socle technique | IN PROGRESS | Branche `claude/phase-3-socle` |
| 4 à 17 | NOT STARTED | — |

### Phase 3, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 3.1 Code source dans le dépôt | TESTED | `npm ci && npm run build` = fichiers publiés (build b930d9512616) ; unitaires 3 182/3 182 ; contrat simulé 24/24 |
| 3.2 Outils et documentation | TESTED | `npm run lint` 0 erreur ; `npm run test:a11y` 0 violation (guide de Logonna et accueil) ; build inchangé ; test unitaire du README vert |
| 3.3 Intégration continue | TESTED | Premier passage entièrement vert sur GitHub le 6 nov. (commit 3c72fde) : « Tests » https://github.com/FelixMuzellec/spumy/actions/runs/42302505872 et « Contrat Open-Meteo » réel https://github.com/FelixMuzellec/spumy/actions/runs/42302505663. Le contrat quotidien ne tournera qu'une fois le workflow sur `main` (règle de GitHub pour les tâches planifiées) |
| 3.4 Réorganisation par couche | TESTED | 62 fichiers déplacés (`git mv`), imports réécrits ; fichiers publiés identiques octet pour octet (build b930d9512616) ; `test:layers` 0 écart (et 1 écart bien détecté sur un import interdit d'essai) ; lint 0 erreur |
| 3.6 Fiches en données + schéma | TESTED | `data/schema/site.schema.json` ; `test:data` 69/69 : 7 fiches valides, export JSON sans perte, 16 erreurs de saisie refusées, 66 spots identiques à l'empreinte v9.2 (tirée du commit a03e074) ; un spot modifié d'essai est bien signalé ; la construction refuse une fiche invalide (essai fait) ; build inchangé b930d9512616 |
| 3.5 Application unique | TESTED | Un seul `app.js` (847 Ko) pour l'accueil et les sept guides, fiches `<guide>.json` ; anciennes adresses gardées comme portes d'entrée (pas de redirection) ; poids publié 7,0 → 1,7 Mo ; e2e 774/774 ; mise à jour d'un téléphone `test:upgrade` 11/11 (5 passages de suite) ; axe 0 violation ; unitaires, données, couches, contrat simulé, studio verts ; build 470565a6a9c8 |
| 3.7 Jetons de design | TESTED | `src/design/tokens.js` (valeurs actuelles) ; jauge, pastille, chargement et style de bouton dans `src/design/components.jsx` ; 22 vues capturées avant/après identiques pixel pour pixel (`tests/visual.mjs`, deux captures de suite identiques aussi) ; axe 0 violation ; e2e 774/774 ; couleurs en dur hors design 298 → 291, compte bloqué à la hausse |
| 3.8 | IN PROGRESS | — |

## Décisions prises

- Trois scores sur 100 (favorabilité, pertinence, confiance), chacun décomposé et expliqué.
- Photos fournies par Félix (générées) : ambiance et illustration seulement, jamais présentées comme la photo réelle d'un spot ou d'une prise ; 32 retenues.
- Historique Git conservé tel quel (pas de réécriture).
- Accès en écriture de Claude au dépôt : actif depuis le 6 novembre ; fusion dans `main` seulement avec l'accord de Félix.

## Décisions ouvertes

1. Adresse dédiée (organisation GitHub, nom de domaine ou statu quo) — avant le lot 3.8.
2. Profil pour le score de pertinence — avant la phase 6.
3. Historique de sorties réelles comme référence — avant la phase 6.
4. Gratuit et sans publicité ? — avant la phase 15.
5. Direction artistique appliquée à BORD en phase 13 élargie — avant la phase 11.
6. Espèces du mode BORD — avant la phase 5.

## Défauts bloquants connus (audit de phase 1)

1. Code source absent du dépôt — corrigé par le lot 3.1 (en attente de fusion).
2. Sécurité qui ne retire un spot que pour la houle (essai : force 9 et rafales à 85 km/h, spot encore proposé) — phases 6 et 7.
3. Houle inconnue comptée 0 m dans la note — phase 7.
4. Interface non conforme à la référence visuelle — phases 11 et 13.

## Incident

- 13 nov. 2026 : l'espace de travail de Claude a été réinitialisé après une pause d'une semaine. Les lots 3.4 et 3.6, terminés le 6 nov. mais pas encore poussés, ont été perdus puis refaits. Règle depuis : chaque lot est poussé dès qu'il est terminé ; rien d'important ne reste seulement sur la machine de Claude.

## Prochaine action

Lot 3.8 ; rapport de fin de phase 3 ; attendre `APPROVED — PROCEED TO PHASE 4`.
