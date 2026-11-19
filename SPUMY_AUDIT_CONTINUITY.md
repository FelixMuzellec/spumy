# SPUMY_AUDIT_CONTINUITY.md

Document de continuité unique du chantier « audit, amélioration et refonte » (section 24 du prompt maître). Il dit où en est le travail ; il ne prouve rien à lui seul : vérifier l'état réel du dépôt avant de reprendre.

## Périmètre

Audit et refonte de SPUMY en 17 phases validées une à une par Félix (`APPROVED — PROCEED TO PHASE X`). Modes BORD (pêche du bord) et BATEAU. Référence visuelle : maquette en 8 écrans fournie par Félix.

## État

| Phase | Statut | Livrable |
| --- | --- | --- |
| 1. Audit initial | VALIDATED (6 nov. 2026) | Rapport « SPUMY — Phase 1 : audit initial » (document Claude de Félix) |
| 2. Architecture cible | VALIDATED (6 nov. 2026, 22 h 59) | Document « SPUMY — Phase 2 : architecture cible » ; résumé dans `docs/ARCHITECTURE.md` |
| 3. Socle technique | VALIDATED (13 nov. 2026, 3 h 57, « APPROVED — PROCEED TO PHASE 4 ») ; fusionnée dans `main` le 13 nov. (e743b10), pas en ligne | Branche `claude/phase-3-socle`, demande de fusion n° 1 ; rapport « SPUMY — Phase 3 : socle technique » https://claude.ai/artifact/NYumZHjRgLUa9jMQcBGXK9 |
| 4. Audit BORD approfondi + corrections météo et sécurité demandées par Félix | VALIDATED (13 nov. 2026, 12 h 37, « APPROVED — PROCEED TO PHASE 5 ») ; revue finale puis fusion dans `main` le 13 nov. (e743b10, propositions n° 1 et n° 2), pas en ligne | Branche `claude/phase-4-bord` (partie de `claude/phase-3-socle`), demande de fusion n° 2 (brouillon) ; rapport « SPUMY — Phase 4 : audit BORD et corrections météo » https://claude.ai/artifact/LryzgD9Q9KbMNec91sMYNx |
| 5. Connaissances halieutiques | VALIDATED (13 nov. 2026, 13 h 58, « APPROVED — PROCEED TO PHASE 6 ») ; fusionnée dans `main` le 19 nov. 2026 (f9f39e7, proposition n° 7) | Branche `claude/phase-5-halieutique`, demande de fusion n° 3 ; rapport « SPUMY — Phase 5 : connaissances halieutiques » https://claude.ai/artifact/BmTd9B29oPziqDZqh9n1cC |
| 6. Conception du moteur BORD (spécification, sans code) | VALIDATED (18 nov. 2026, 14 h 47, « APPROVED — PROCEED TO PHASE 7 ») ; fusionnée dans `main` le 19 nov. 2026 (f9f39e7, proposition n° 7 ; la n° 4 est fermée) | Branche `claude/phase-6-conception`, demande de fusion n° 4 ; `docs/SPEC-MOTEUR-BORD-V2.md` ; rapport « SPUMY — Phase 6 : conception du moteur BORD » https://claude.ai/artifact/Fa93x9zkURzEdVRxRZy8Fj (copie : `docs/rapports/PHASE-6.md`) |
| 7. Moteur BORD v2 | VALIDATED (18 nov. 2026, « APPROVED — PROCEED TO PHASE 8 ») ; fusionnée dans `main` le 19 nov. 2026 (f9f39e7, proposition n° 7) | Branche `claude/phase-7-moteur-v2`, proposition de fusion n° 6 (brouillon, contient les phases 5 et 6) ; rapport « SPUMY — Phase 7 : moteur BORD v2 » https://claude.ai/artifact/5VVWp9Z3HfSvn72Uy3Ztwo (copie : `docs/rapports/PHASE-7.md`) |
| 8. Épreuve du moteur (Monte Carlo, journées archivées) | VALIDATED (19 nov. 2026, 14 h 27, « APPROVED — PROCEED TO PHASE 9 ») ; critère de stabilité FAILED, dit dans le rapport ; fusionnée dans `main` le 19 nov. 2026 (f9f39e7) | Branche `claude/phase-8-epreuve`, proposition de fusion n° 7 (phases 5 à 8) ; rapport « SPUMY — Phase 8 : épreuve du moteur » https://claude.ai/artifact/WcWRqYiDoNWaJWUtfmFKLY (copie : `docs/rapports/PHASE-8.md`) |
| 8bis. Revue de qualité avant la phase 9 | Faite le 19 nov. 2026 ; fusionnée dans `main` (40ba84f, proposition n° 9) | `CHANGELOG.md` |
| 9. BATEAU — conception | VALIDATED (19 nov. 2026, 18 h 14, « APPROVED — PROCEED TO PHASE 11 ») ; fusionnée dans `main` le 19 nov. 2026 avec la phase 11 (e7ad6ba, proposition n° 11) | Branche `claude/phase-9-bateau`, proposition de fusion n° 10 (marquée fusionnée par GitHub avec la n° 11) ; `docs/SPEC-MOTEUR-BATEAU.md`, `data/knowledge/bateau.json` ; rapport « SPUMY — Phase 9 : BATEAU, conception » https://claude.ai/artifact/UziTDraLFrMrgTDQYtmgjz (copie : `docs/rapports/PHASE-9.md`) |
| 10. Moteur BATEAU par espèce | NOT STARTED (mise de côté « pour le moment » par Félix le 19 nov., 18 h 14) | — |
| 11. Direction artistique et UX/UI | VALIDATED (19 nov. 2026, 23 h 11, « APPROVED — PROCEED TO PHASE 12 ») ; fusionnée dans `main` le 19 nov. 2026 à la demande de Félix (e7ad6ba, proposition n° 11 ; tests et contrat verts sur cf1c2c3), publiée par GitHub Pages (voir « Publication ») | Branche `claude/phase-11-design` (partie de `claude/phase-9-bateau`), proposition de fusion n° 11 ; `docs/DIRECTION-ARTISTIQUE.md` ; prototype https://claude.ai/artifact/BBDcujdvLQxMft99DxqCuP (aussi dans `prototype/`) ; rapport « SPUMY — Phase 11 : direction artistique et écrans » https://claude.ai/artifact/SCaJaTS7YAcLTe4242KAQr (copie : `docs/rapports/PHASE-11.md`) |
| 12. Spécifications fonctionnelles et techniques (+ charte dans l'application, v10) | IN PROGRESS (depuis le 19 nov. 2026, 23 h 11) | Branche `claude/phase-12` ; `docs/SPECIFICATIONS.md` ; rapport `docs/rapports/PHASE-12.md` |
| 13 à 17 | NOT STARTED | — |

### Phase 4, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 4.0 Grille de scénarios | TESTED | `tests/scenarios.mjs` : 66 spots × 896 météos = 59 136 cas, avant/après comparés |
| 4.1 Houle inconnue | TESTED | Côte ouverte : « à vérifier », jamais au vert (624 cas au vert avant, 0 après) ; rade inchangée |
| 4.2 Vent et rafales | TESTED | Danger annoncé (force ≥ 8 ou rafales ≥ 90 km/h) : 69,3 % proposés avant, 0 après ; doute (force 7, rafales ≥ 75, houle inconnue) : 27,2 % au vert avant, 0 après ; sans doute : 13 376 cas identiques ; Moulin Mer NE force 9 non recommandé |
| 4.3 Source météo, fiche injoignable | TESTED | « AROME · vent comparé à ECMWF » (unitaire et contrat) ; écran « Le guide n'a pas pu se charger » (e2e) |
| 4.4 Audit BORD | TESTED | `tests/audit-spots.mjs` : 396 rubriques de preuve (192 vérifiées, 191 déduites, 13 connaissance locale) ; 3 spots sans rubrique vérifiée ; 9 spots sans consigne de sécurité ; 7 positions en degrés-minutes seulement |

### Phase 7, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 7.0 Départ | TESTED | Branche `claude/phase-7-moteur-v2` = phase 6 + `main` ; construction identique à `main` (bc6ce2bfa664) avant tout changement |
| 7.2 Sécurité de la spécification | TESTED | `windowSafety` (safety.js), commun aux deux moteurs ; `tests/v2.mjs` S1 à S9 ; grille 73 986 cas : 0 danger proposé, 12 672 cas « à vérifier » de plus, 0 au vert sans météo |
| 7.1 Trois scores, réglage v1/v2 | TESTED | `src/bord/engine/v2.js`, `v2-params.js`, `rankDay` ; Réglages → Moteur de notes ; `tests/v2.mjs` 51/51 ; comparaison v1/v2 sur 2 016 journées d'essai : même premier spot 52,9 %, écarts expliqués (vent et mer 49 %, ensemble v1 26 %, créneau 13 %, marée 11 %) |
| 7.3 Pastilles, preuves, conseil de la boîte | TESTED | `note.jsx`, `Scores.jsx`, `Pastille` ; parcours e2e ; captures v1 et v2 relues |
| 7.4 Tests | TESTED | e2e 843/843 ; unitaires 7 guides verts ; axe 0 violation ; mise à jour 11/11 ; GitHub : « Tests » et contrat réel verts (commit 9337732, proposition n° 6) |
| 7.5 Rapport, questions | VALIDATED | `docs/rapports/PHASE-7.md` ; questions 1 à 3 sans préférence, la 4e a reçu l'approbation de la phase 8 |

### Phase 9, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 9.0 Départ | IMPLEMENTED | Branche `claude/phase-9-bateau` partie de `main` (40ba84f) |
| 9.1 Audit du BATEAU | IMPLEMENTED | `docs/SPEC-MOTEUR-BATEAU.md` §0, rapport 5.1 : aucune sécurité en mer, aucune logique par espèce, aucune réglementation des espèces du bateau ; tests actuels : 20 unitaires, 26 de parcours |
| 9.2 Espèces et réglementation | TESTED | `data/knowledge/bateau.json` : 21 connaissances d'espèces et de réglementation ; vieille et saint-pierre : réglementation INCONNU |
| 9.3 Sécurité en mer | TESTED | 12 règles `SEC_*` ; 14 connaissances (sécurité, données) ; une règle sans source n'est jamais « VÉRIFIÉ » (contrôlé) |
| 9.4 Spécification | IMPLEMENTED | `docs/SPEC-MOTEUR-BATEAU.md` : circuit, profil, sécurité, trois scores par espèce, 16 scénarios, plan d'épreuve ; aucun fichier de `src/` ni de `scripts/` modifié |
| 9.5 Rapport, arrêt | IMPLEMENTED | `docs/rapports/PHASE-9.md` ; `test:knowledge` 27/27, `test:v2` 56/56, unitaires 3 390, `test:data` 69/69, couches 0 écart, lint 0 problème |

### Phase 12, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 12.A Logos et accueil | TESTED | f55822f : logos de Félix (`assets/brand/`, `scripts/logos.py`), icônes, accueil Inshore / Offshore, Roboto Condensed auto-hébergée, service worker sans `prototype/`, `assets/`, `docs/` ; lint, couches, unitaires, accessibilité, e2e 850/850, mise à jour 12/12 |
| 12.B Charte dans les guides | TESTED | bc533f6 : jetons Nuit marine, palette remplacée (couleurs en dur 291 → 253), titres condensés, photo d'ambiance sur Décision et dans la fiche ; accessibilité 0 violation |
| 12.C Finitions, prototype, v10 | TESTED | Anneaux en dégradé, chiffres condensés ; logos dans le prototype ; version 10.0.0 |
| 12.D Spécifications | IMPLEMENTED | `docs/SPECIFICATIONS.md` |
| 12.E Documents et fusion | IN PROGRESS | Direction artistique § 5 bis, rapport, suivi, journal des versions ; proposition de fusion puis `main` |

### Phase 11, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 11.0 Départ | IMPLEMENTED | Branche `claude/phase-11-design` partie de `claude/phase-9-bateau` ; maquette de référence et 39 photos retrouvées dans les pièces jointes |
| 11.1 Analyse de la référence | IMPLEMENTED | `docs/DIRECTION-ARTISTIQUE.md` § 2 : couleurs mesurées sur les pixels, observable et interprété séparés, animations non vérifiables |
| 11.2 Photos | TESTED | `data/photos/catalogue.json` (32 retenues, 6 écartées avec leur raison), `assets/photos/` (WebP 1600 et 720), `src/design/ds/ambiance.js` (choix déterministe, jamais une image reconnaissable sur un spot nommé) |
| 11.3 Système de design | TESTED | `src/design/ds/` ; `test:design` 41/41 (contrastes WCAG, deux thèmes) |
| 11.4 Données du prototype | IMPLEMENTED | `scripts/prototype-data.mjs` (journée réelle du 16 mai 2026, moteur v2), `scripts/carte-prototype.py` (OSM), `src/prototype/data/bateau.js` (exemple, réglementation 2026 réelle) |
| 11.5 et 11.6 Écrans BORD (9) et BATEAU (8) | TESTED | `test:prototype` 244/244 : 23 écrans × 390 et 320 px × deux thèmes, interactions, pastilles jamais masquées, axe-core sans violation ; chaque écran relu en capture |
| 11.7 Planches | TESTED | États, Système, BORD/BATEAU, Avant/après (`scripts/avant-prototype.mjs`, v9.2), Conformité (§ 20) |
| 11.8 Couches et non-régression | TESTED | `test:layers` : couche `prototype` (design et data seulement), 0 écart, couleurs en dur 291 (inchangé) ; lint 0 ; `test:data` 69/69, `test:knowledge` 27/27, `test:v2` 56/56, unitaires 3 390 ; e2e 850/850 (deux passages arrêtés avant à l'étape lente « analyse enregistrée rouverte », délai de 12 s ; la branche de la phase 9 passe aussi 850/850 sur la même machine) ; application publiée inchangée ; intégration continue : `test:design` et `test:prototype` ajoutés |
| 11.9 Rapport, arrêt | IMPLEMENTED | `docs/rapports/PHASE-11.md` |

### Phase 8, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 8.1 Journées de référence | TESTED | 36 dates fixées d'avance (6, 16, 26 de chaque mois, nov. 2025 à nov. 2026) + 3 sessions du journal ; téléchargées par l'intégration continue (« Épreuve du moteur », passage 44330704552), déposées dans la branche (`data/epreuve/archives/`) ; 0 journée en échec |
| 8.2 Monte Carlo | TESTED | `scripts/epreuve-mc.mjs` : 1 000 tirages par journée et par guide, 241 journées-guides notées ; tirages « entrées seules » et « hypothèses seules » (300) ; `data/epreuve/resultats/` |
| 8.3 Analyse telle quelle | TESTED | `scripts/epreuve-analyse.mjs` : coût de la prudence, paliers, v1/v2 réels, journal, qualité des données |
| 8.4 Corrections | TESTED | Paliers 75/65/55/45 (gardés). Lumière en rampe : règle fixée avant le second passage (gardée si les trois premiers inchangés gagnent au moins 2 points sans que le premier perde plus de 1 point) ; mesuré +1,8 point (35,9 → 37,7 %), premier +1,4 → **retirée** (`resultats/mc-v2-rampe-1000-*`). Passage de contrôle du moteur livré (`mc-v2-livre-1000-*`) : identique au premier passage, 0 écart sur 252 journées-guides ; palier inchangé 56,1 % |
| 8.5 Rapport, arrêt | IMPLEMENTED | `docs/rapports/PHASE-8.md` ; tests 51/51, 3 390, 843/843, 12/12, 0 violation ; proposition de fusion n° 7 |

### Phase 5, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 5.0 Échelle à cinq niveaux | TESTED | `data/knowledge/bar-bord.json` (champ « echelle ») et `data/schema/knowledge.schema.json` |
| 5.1 Connaissances du moteur BORD | TESTED | 27 connaissances : niveau 1 : 4, niveau 2 : 7, hypothèses : 9, heuristiques : 7 ; 82 règles de leurres classées par source |
| 5.2 Rubriques des spots | TESTED | `data/knowledge/preuves-spots.json` : 396 rubriques ; les 192 « verified » relues : 8 → 1, 145 → 2, 31 → 3, 3 → 4, 5 → 5 |
| 5.3 Vérifications prioritaires | TESTED | Réglementation revue (inchangée ; « retrait de RecFishing » = poisson d'avril) ; 3 spots sans source de pêche trouvée ; 22 mentions « à confirmer » classées ; 7 positions de Pirou : décision |
| 5.4 Tests | TESTED | `npm run test:knowledge` 15/15 (9 erreurs de saisie refusées) ; dans l'intégration continue |

### Revue finale des phases 3 et 4 (13 nov. 2026, avant fusion)

Consigne de Félix : « Tu peux fusionner, si après la revue finale tu penses que la version remplit parfaitement le cahier des charges. » Lue comme : la version fusionnée doit remplir parfaitement ce qu'elle promet (critères d'acceptation des phases 3 et 4, aucun recul par rapport aux versions sur les téléphones, règles de sécurité du cahier des charges, toutes les suites vertes sur GitHub sur le commit fusionné). Le reste du cahier des charges (trois scores sur 100, interface conforme, BATEAU…) relève des phases 5 à 17.

| Point revu | Constat | Suite |
| --- | --- | --- |
| Inconnu → « à vérifier », jamais vert | ÉCART : sans aucune météo, le vent était compté calme ; les 11 spots de rade passaient au vert (8,5, « Très bonnes conditions », vu en parcours sur l'ancienne version). Rafales absentes comptées comme nulles | Corrigé : vent inconnu, rafales inconnues, direction inconnue (force ≥ 2) → à vérifier ; grille 73 986 cas : 0 au vert sans météo (11 avant), 0 au vert à rafales inconnues (4 161 avant) ; sans doute : 13 376 cas identiques |
| Hors ligne, origine partagée | ÉCART : le service worker effaçait aussi la copie hors ligne de l'ancienne adresse /guide-peche-bar/ (même origine, même nom de cache) | Corrigé : il ne supprime que ce qui est sous sa propre adresse ; test de mise à jour servi sous /spumy/, contrôle ajouté (et vu en échec avec l'ancien code) |
| Mise à jour depuis les versions des téléphones | v9.2 → cette version : 12/12 ; v8.15 (ancienne adresse) → cette version : 12/12 | Passage v8.15 ajouté à l'intégration continue |
| Clé Claude, sauvegarde GitHub | Clé déjà enregistrée gardée ; dépôt de sauvegarde `guide-peche-bar-journal` non lisible anonymement (privé ou absent : INFÉRÉ), donc la sauvegarde n'est pas bloquée par le refus des dépôts publics | — |
| Publication | VÉRIFIÉ (API GitHub) : GitHub Pages n'est pas activé sur `FelixMuzellec/spumy`. Fusionner dans `main` ne met rien en ligne ; les rapports des phases 3 et 4 disaient le contraire (INFÉRÉ à tort). L'ancienne adresse sert le dépôt `guide-peche-bar` (v8.15) | Mise en ligne = décision 1 (adresse) |
| Test de parcours instable | 1 échec sur 3 passages locaux le 13 nov. : l'ouverture d'une analyse photo enregistrée a dépassé 5 s (sur la version d'avant la revue) ; non reproduit ensuite (821/821 deux fois), vert sur GitHub | À surveiller |

Seuils de vent posés (à valider par Félix en phase 6) : force 8 et rafales 90 km/h → non recommandé (Météo-France) ; force 7 → à vérifier (BMS côte, Météo-France) ; rafales 75 km/h → à vérifier (DÉDUIT de l'échelle de Beaufort).

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
| 3.8 Sécurité rapide | TESTED (adresse dédiée : BLOCKED, décision 1) | Écriture GitHub refusée vers un dépôt public (e2e : aucune écriture, message, session gardée) ; clé Claude en session par défaut, case « garder » (e2e dans les deux sens) ; export puis import du journal sur un téléphone neuf (e2e) ; axe 0 violation ; mise à jour 11/11 |

## Décisions prises

- Trois scores sur 100 (favorabilité, pertinence, confiance), chacun décomposé et expliqué.
- Photos fournies par Félix (générées) : ambiance et illustration seulement, jamais présentées comme la photo réelle d'un spot ou d'une prise ; 32 retenues.
- Historique Git conservé tel quel (pas de réécriture).
- Accès en écriture de Claude au dépôt : actif depuis le 6 novembre ; fusion dans `main` seulement avec l'accord de Félix.

## Écarts au plan de la phase 2 (à valider)

1. Pas de redirection : `logonna.html` et les autres restent les portes d'entrée des guides (même garantie pour les anciens liens).
2. Fiches en JavaScript commenté (données pures, provenance en commentaire), publiées en JSON à la construction.
3. Une seule branche et une seule demande de fusion pour la phase, un ou plusieurs commits par lot.

## Décisions ouvertes

1. Adresse — **décidée le 18 nov.** : la seule adresse est https://felixmuzellec.github.io/spumy/ (GitHub Pages sur `FelixMuzellec/spumy`, branche `main`, racine). Tous les fichiers dans `main` de ce dépôt.
2. Profil pour le score de pertinence — décidé le 13 nov. : inventaire complet de la boîte, à fournir par Félix (pas encore reçu au 18 nov. : la phase 7 part de la boîte déjà enregistrée dans l'application).
3. Historique de sorties réelles comme référence — avant la phase 6.
4. Gratuit et sans publicité ? — avant la phase 15.
5. Direction artistique appliquée à l'application — décidé le 19 nov. (23 h 11 : « que tout fonctionne, ce qui inclut le nouveau design ») : faite en phase 12 (v10) ; le reste du prototype est le lot BORD restant (`docs/SPECIFICATIONS.md`, § 7).
6. Espèces du mode BORD — décidé le 13 nov. : bar seul.
7. Seuils de vent — décidé le 13 nov. : plus prudents (à vérifier dès la force 6 ou 60 km/h de rafales ; non recommandé dès la force 8 ou 90 km/h). Appliqués en phase 7.
8. Seuils en rade : les mêmes qu'en côte ouverte, ou par exposition — phase 6.
9. Publication : fusion des phases 3 et 4 autorisée le 13 nov. (12 h 37) ; fusion des phases 5 à 8 demandée le 18 nov. (« Transfert tous les fichiers sur https://github.com/FelixMuzellec/spumy ») ; fusion des phases 9 et 11 demandée le 19 nov. (19 h 25). GitHub Pages actif depuis le 19 nov. 2026 : la tâche « pages build and deployment » de GitHub a publié e7ad6ba à 18 h 43 UTC sur https://felixmuzellec.github.io/spumy/ (« Reported success ») ; Claude ne peut pas ouvrir l'adresse depuis son espace (hors de sa liste autorisée), à vérifier par Félix.

## Défauts bloquants connus (audit de phase 1)

1. Code source absent du dépôt — corrigé par le lot 3.1.
2. Sécurité qui ne retire un spot que pour la houle (essai : force 9 et rafales à 85 km/h, spot encore proposé) — corrigé par le lot 4.2 et la revue finale (vent et rafales inconnus) ; seuils à valider en phase 6.
3. Houle inconnue comptée 0 m dans la note — corrigé par le lot 4.1.
4. Interface non conforme à la référence visuelle — phases 11 et 13.

## Incident

- 13 nov. 2026 : l'espace de travail de Claude a été réinitialisé après une pause d'une semaine. Les lots 3.4 et 3.6, terminés le 6 nov. mais pas encore poussés, ont été perdus puis refaits. Règle depuis : chaque lot est poussé dès qu'il est terminé ; rien d'important ne reste seulement sur la machine de Claude.

## Consignes de Félix (13 nov. 2026, 3 h 57)

- Phase 4 approuvée, avec une demande : « résoudre absolument les points bloquants de la section 6, surtout concernant la météo ». Lu comme : corriger maintenant les défauts météo et sécurité (houle inconnue comptée 0 m ; vent et rafales qui ne retirent jamais un spot ; source météo affichée incomplète ; comportement quand Open-Meteo est injoignable), en plus de l'audit en lecture seule prévu. La conformité de l'interface reste aux phases 11 et 13.
- « Si tu es interrompu dans ta session, reprends quand tu le peux » : rappel programmé pour cette session (13 nov. 7 h UTC) ; reprendre d'après ce document.
- Publication (fusion dans `main`) : pas d'accord à cette date.

## Consignes de Félix (13 nov. 2026, 12 h 37)

- « APPROVED — PROCEED TO PHASE 5. Tu peux fusionner, si après la revue finale tu penses que la version remplit parfaitement le cahier des charges. » Lu comme : fusion des phases 3 et 4 après une revue finale stricte (voir « Revue finale »). La fusion de la phase 5 sera proposée dans son rapport.
- Espèces (décision 6) non tranchées : la phase 5 part de la recommandation de la phase 2, le bar d'abord.

## Consignes de Félix (13 nov. 2026, 13 h 28)

- Mise en ligne choisie : GitHub Pages sur `FelixMuzellec/spumy`, branche `main`, dossier racine (adresse https://felixmuzellec.github.io/spumy/). L'API Pages est bloquée pour Claude (proxy) : l'activation se fait par Félix dans *Settings → Pages* ; Claude vérifie ensuite le déploiement (dépôt `has_pages`, passage « pages-build-deployment »).

## Consignes de Félix (13 nov. 2026, 13 h 58)

- « APPROVED — PROCEED TO PHASE 6 ». Réponses aux décisions : seuils de vent **plus prudents** (à vérifier dès la force 6 ou des rafales de 60 km/h ; non recommandé dès la force 8 ou 90 km/h) ; **bar seul** ; profil = **inventaire complet de sa boîte**, que Félix fournira, pour que SPUMY conseille les meilleurs leurres et montages ; pastilles : **attendre la phase 7**.
- Questions posées : pourquoi la même adresse que guide-peche-bar (réponse : même compte GitHub, donc même domaine felixmuzellec.github.io) ; pourquoi seulement orange ou vert sur les pastilles (réponse : échelle sur 10 tassée, et orange = « moyen » ou « à vérifier » depuis la phase 4 ; corrigé par la spécification de la phase 6, appliqué en phase 7).

## Consignes de Félix (18 nov. 2026, 14 h 47)

- « APPROVED — PROCEED TO PHASE 7 / And transfer / Tu me poseras toutes les questions une par une, à la fin du processus, pour corriger si besoin. » Lu comme : la spécification de la phase 6 est validée telle quelle ; Claude fait la phase 7 sans s'arrêter pour poser des questions, en prenant les recommandations de la spécification là où une décision manque, et pose toutes ses questions une par une à la fin, pour corriger ensuite. « And transfer » : question posée à la fin (réglée le 18 nov. au soir, voir plus bas).
- Fusion des phases 5, 6 et 7 dans `main` : pas d'accord explicite ; question posée à la fin.

## Consignes de Félix (18 nov. 2026, vers 15 h 55)

- Questions de fin de phase 7, posées une par une : transfert (1), fusion (2), boîte (3) → « sans préférence » ; on garde l'état actuel (transfert non fait, rien fusionné, boîte provisoire, trajet 45 min).
- En réponse à la question 4 : « APPROVED — PROCEED TO PHASE 8. Tu continueras automatiquement si tu arrives à ta limite. Retiens toutes tes questions que l'on traitera ensemble après que toutes les étapes sont accomplies. » Lu comme : phase 7 VALIDATED ; faire la phase 8 sans poser de question ; garder toutes les questions (celles de la phase 7 encore ouvertes et les nouvelles) pour les traiter ensemble plus tard ; reprise automatique programmée (rappel « Reprendre la phase 8 de SPUMY », 18 nov. 20 h 58, heure de Paris). L'arrêt de fin de phase reste dû (prompt maître) : rapport, puis attente de « APPROVED — PROCEED TO PHASE 9 ».

## Consignes de Félix (18 nov. 2026, 20 h 48)

- « Avant de passer à la prochaine étape et quand l'étape 8 est terminée : oublie complètement l'adresse [l'ancienne adresse dédiée] ; la seule adresse valable est https://felixmuzellec.github.io/spumy/ ; transfère tous les fichiers sur https://github.com/FelixMuzellec/spumy ; supprime tous les fichiers inutiles ; si tu arrives à ta limite, reprends quand tu le peux. »
- Lu comme : une fois la phase 8 terminée (rapport), et avant la phase 9 : retirer l'ancien projet d'adresse partout (code, tests, documentation, suivi, mémoire) ; servir les tests sous `/spumy/` ; fusionner les phases 5 à 8 dans `main` de `FelixMuzellec/spumy` (accord de fusion), par une proposition de fusion, une fois les tests verts sur GitHub ; retirer les fichiers qui ne servent plus. L'arrêt avant la phase 9 reste dû.
- Dépôt de sauvegarde du journal par défaut : `FelixMuzellec/spumy-journal` (choix de Claude, à confirmer ; un réglage déjà enregistré sur le téléphone est gardé).

## Consignes de Félix (19 nov. 2026, 13 h 56) — revue de qualité

- « Avant de passer à l'étape 9, est-ce que tout est optimisé à ce point si on ignore les questions que tu as ? Si ce n'est pas optimisé, il est nécessaire de corriger. Il faut que l'ensemble soit super précis et propre. Continue quand tu le peux si tu arrives à ta propre limite. »
- Fait (branche `claude/qualite-avant-phase-9`) : voir `CHANGELOG.md`, « revue de qualité avant la phase 9 ». Laissé en l'état, avec la raison :
    - moteur compilé deux fois dans `app.js` (application et accueil), environ 165 Ko sur 991 : la dédoublonner touche toute l'interface du bord ; le tout est en cache dès la première visite ;
    - 291 couleurs écrites en dur hors de `src/design/` : conformité visuelle des phases 11 et 13 (le compte ne peut que baisser) ;
    - prise non saisie enregistrée « 0 » : journal, phase 14 ;
    - branches de travail : leur suppression est refusée à Claude par le proxy Git.

## Consignes de Félix (19 nov. 2026, 14 h 27)

- « APPROVED — PROCEED TO PHASE 9. Reprends automatiquement si limite atteinte. » Phase 8 validée. Périmètre de la phase 9, celui proposé à la fin de la phase 8 : audit du mode BATEAU tel qu'il est ; sécurité en mer, séparée de celle du bord ; spécification du moteur par espèce, sans code, à valider comme celle du BORD. Espèces prioritaires (consigne antérieure) : lieu jaune, lieu noir là où il est pertinent, maquereau, bar, vieille, saint-pierre.

## Consignes de Félix (19 nov. 2026, 18 h 14)

- « APPROVED — PROCEED TO PHASE 11. Skip Phase 10 for the moment. I am impatient how you will stuningly improve the UX including the pictures I sent you. »
- Lu comme : phase 9 validée ; phase 10 (moteur BATEAU) reportée, pas abandonnée ; phase 11 (direction artistique et écrans, §5 à §7 et §20 du prompt maître) avec les photos qu'il a fournies.
- Images retrouvées dans les pièces jointes de la conversation : la maquette de référence en 8 écrans (`SPUMY_Fishing_App_UI_Showcase.png`, deux copies identiques) et 39 photos générées par Gemini (38 distinctes). Rappel de la décision prise : photos d'ambiance et d'illustration seulement, jamais présentées comme la photo réelle d'un spot ou d'une prise.

## Consignes de Félix (19 nov. 2026, 19 h 25)

- « Fusion de la phase 11 dans `main`. Reprends dès que tu le peux si tu atteins ta limite. » (réponse à la question 31, depuis le rapport de la phase 11)
- Lu comme : fusionner la proposition n° 11 dans `main`, une fois les tests verts sur GitHub. Elle part de la phase 9 (proposition n° 10) : la spécification et les connaissances BATEAU entrent donc aussi dans `main` (aucun code de l'application). La phase 11 reste en attente de validation (« APPROVED — PROCEED TO PHASE 12 »). Rappel de reprise programmé (19 nov., 21 h 26, heure de Paris).

## Consignes de Félix (19 nov. 2026, 20 h 14)

- « Pour l'instant, les changements graphiques ne semblent pas avoir été pris en compte. Pour t'aider dans le développement de la charte graphique voici le logo de Spumy à utiliser sur l'application et sur le site internet, le logo pour l'Inshore et l'Offshore. Créer une tâche pour continuer automatiquement si tu arrives dans ta limite. »
- Logos : `assets/brand/sources/` (spumy.jpg, inshore.jpg, offshore.jpg). Travail interrompu par la limite d'usage à 20 h 23 (lot 12.A fait, non versé), repris à 23 h 11.

## Consignes de Félix (19 nov. 2026, 23 h 11)

- Même message, plus : « APPROVED — PROCEED TO PHASE 12. Fais en sorte que la phase 11 et 12 soient transférées sur github et que tout fonctionne, ce qui inclue le nouveau design, l'inclusion des nouvelles photos, photos et fonctionnalités etc etc. Si tu as des questions pour que cela fonctionne, ne me les pose pas et réponds y de façon indépendante et top tier. »
- Lu comme : phase 11 validée ; phase 12 = spécifications + charte appliquée à l'application (v10), logos et photos compris ; fusion dans `main` quand les tests GitHub sont verts ; questions 26 à 31 réglées par Claude (ci-dessous, et rapport de la phase 12, § 8). Rappel de reprise programmé (20 nov., 4 h 30).

## Questions retenues pour Félix (à traiter ensemble)

1. Adresse — réglée le 18 nov. : https://felixmuzellec.github.io/spumy/ seule. GitHub Pages actif depuis le 19 nov. 2026 : la tâche « pages build and deployment » de GitHub a publié e7ad6ba à 18 h 43 UTC sur https://felixmuzellec.github.io/spumy/ (« Reported success ») ; Claude ne peut pas ouvrir l'adresse depuis son espace (hors de sa liste autorisée), à vérifier par Félix (application à la racine, prototype dans `prototype/`).
2. Fusion des phases 5 à 8 dans `main` — lue comme accordée le 18 nov. au soir (« Transfert tous les fichiers sur https://github.com/FelixMuzellec/spumy ») ; **faite le 19 nov.** (f9f39e7, tests et contrat Open-Meteo verts). Branches de travail des phases 3 à 8 et `claude/transfert-spumy` : toutes contenues dans `main`, mais leur suppression est refusée à Claude par le proxy Git ; à supprimer par Félix s'il le souhaite (*Code → Branches*).
3. Inventaire complet de la boîte — sans préférence le 18 nov.
4. Temps de trajet maximal (45 min par défaut).
5. Vigilance Météo-France : compte portail-api et tâche GitHub, ou rester INCONNU.
6. Isolement par la marée : Mousterlin (coef. > 75), Agon et Sciotot (marée montante) → non recommandé ?
7. Écart à la spécification pour S12 (présence en abri 0,6 entre 7,5 et 9,5 °C).
8. Sécurité commune aux deux moteurs (lecture de Claude).
9. Historique de sorties réelles (vérité terrain) : 3 sessions, trop peu ; ordre de grandeur pour trancher un critère : 40 sessions par situation.
10. Restes de la phase 5 : 9 rubriques « connaissance locale », positions GPS des 7 spots de Pirou, 3 spots sans source.
11. Houle maximale de chaque spot : première cause de « non recommandé » (298 spots-journées) ; la revoir spot par spot.
12. Paliers 75/65/55/45 : les garder.
13. Égalité à 3 points : la garder, ou annoncer l'égalité jusqu'à 10 points (le premier ne tient dans 80 % des tirages qu'à 10 points d'avance).
14. Rampe de lumière : retirée selon la règle fixée d'avance ; la reprendre si le gain « à égalité près » (+3,5 points) suffit.
15. Dépôt de sauvegarde par défaut du journal : `FelixMuzellec/spumy-journal`.
16. Seuils en bateau (SEC_VENT, SEC_MER) : à vérifier dès la force 5 ou 50 km/h de rafales, non recommandé dès la force 6 ou 60 km/h ; mer « agitée » à vérifier.
17. Profil du bateau (le sien, celui d'un ami, une location ?) : catégorie de conception, armement, port d'attache et abris, vitesse de route ; matériel de départ à confirmer : canne Daiwa Megaforce 170 (90 à 210 g), Stradic 4000, tresse 16/100.
18. Seul à bord : seuils serrés d'un cran ?
19. Retour après le coucher du soleil : « à vérifier » ?
20. Lieu noir : proposé seulement s'il a déjà été pris, ou toujours avec une confiance faible ?
21. Vieille : conseiller de relâcher les gros sujets ?
22. Saint-pierre : saison en côte (source ou expérience de Félix).
23. Raz : liste des zones « raz » et source des heures de renverse (atlas de courants du SHOM, ou marques de Félix).
24. BMS : source lisible par l'application, ou rester à l'écran.
25. Fusion de la phase 9 dans `main` : faite avec la phase 11 le 19 nov. (e7ad6ba ; la branche de la phase 11 part de la phase 9).
26. Direction artistique — réglée le 19 nov. (23 h 11, approbation) ; les logos de Félix ajoutent l'orange et la crème à la marque, l'interface garde le cyan pour l'action et l'ambre et le rouge pour la sécurité.
27. Logo — réglé le 19 nov. : ceux de Félix, tels quels (`assets/brand/`).
28. Photos générées — réglé par Claude à la demande de Félix (19 nov., 23 h 11) : publiées comme demandé, toujours marquées « Illustration », jamais une image reconnaissable sur un spot nommé, jamais une photo de prise.
29. Application du système à l'application — réglée le 19 nov. (23 h 11) : faite en phase 12 (v10) ; le reste du prototype est le lot BORD restant.
30. Écarts voulus à la référence — réglé par Claude (19 nov., 23 h 11) : gardés (pastilles bleues, pas de bathymétrie, leurres dessinés sans étoiles, texte secondaire éclairci).
31. Fusion de la phase 11 dans `main` — demandée le 19 nov., 19 h 25 (« Fusion de la phase 11 dans `main` ») ; **faite le 19 nov.** (e7ad6ba, proposition n° 11, qui contient la phase 9 ; tests GitHub verts, dont les nouveaux contrôles du design et du prototype). Le prototype sera à https://felixmuzellec.github.io/spumy/prototype/ une fois Pages activé.

## Prochaine action

Phase 12 en cours (lot 12.E) : tests complets, proposition de fusion, tests GitHub verts, fusion dans `main` (consigne du 19 nov., 23 h 11), puis **STOP** et attendre « APPROVED — PROCEED TO PHASE 13 » (Développement BATEAU, avec le moteur de la phase 10). Rapport : `docs/rapports/PHASE-12.md`. GitHub Pages publie `main`.
