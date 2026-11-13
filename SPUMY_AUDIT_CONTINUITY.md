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
| 5. Connaissances halieutiques | VALIDATED (13 nov. 2026, 13 h 58, « APPROVED — PROCEED TO PHASE 6 ») ; non fusionnée (accord de fusion non donné) | Branche `claude/phase-5-halieutique`, demande de fusion n° 3 ; rapport « SPUMY — Phase 5 : connaissances halieutiques » https://claude.ai/artifact/BmTd9B29oPziqDZqh9n1cC |
| 6. Conception du moteur BORD (spécification, sans code) | IMPLEMENTED, en attente de validation | Branche `claude/phase-6-conception`, demande de fusion n° 4 ; `docs/SPEC-MOTEUR-BORD-V2.md` ; rapport `docs/rapports/PHASE-6.md` (service de documents Claude indisponible le 13 nov.) |
| 7 à 17 | NOT STARTED | — |

### Phase 4, lots

| Lot | Statut | Preuve |
| --- | --- | --- |
| 4.0 Grille de scénarios | TESTED | `tests/scenarios.mjs` : 66 spots × 896 météos = 59 136 cas, avant/après comparés |
| 4.1 Houle inconnue | TESTED | Côte ouverte : « à vérifier », jamais au vert (624 cas au vert avant, 0 après) ; rade inchangée |
| 4.2 Vent et rafales | TESTED | Danger annoncé (force ≥ 8 ou rafales ≥ 90 km/h) : 69,3 % proposés avant, 0 après ; doute (force 7, rafales ≥ 75, houle inconnue) : 27,2 % au vert avant, 0 après ; sans doute : 13 376 cas identiques ; Moulin Mer NE force 9 non recommandé |
| 4.3 Source météo, fiche injoignable | TESTED | « AROME · vent comparé à ECMWF » (unitaire et contrat) ; écran « Le guide n'a pas pu se charger » (e2e) |
| 4.4 Audit BORD | TESTED | `tests/audit-spots.mjs` : 396 rubriques de preuve (192 vérifiées, 191 déduites, 13 connaissance locale) ; 3 spots sans rubrique vérifiée ; 9 spots sans consigne de sécurité ; 7 positions en degrés-minutes seulement |

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

1. Adresse dédiée — **décidée le 13 nov. (14 h 25)** : organisation GitHub gratuite « spumy » (`spumy.github.io`), sans perdre le journal. Procédure : `docs/CHANGEMENT-ADRESSE.md` ; passage du journal testé (`npm run test:migration`). Création de l'organisation, transfert et activation de Pages : à faire par Félix.
2. Profil pour le score de pertinence — avant la phase 6.
3. Historique de sorties réelles comme référence — avant la phase 6.
4. Gratuit et sans publicité ? — avant la phase 15.
5. Direction artistique appliquée à BORD en phase 13 élargie — avant la phase 11.
6. Espèces du mode BORD — avant la phase 5.
7. Seuils de vent (force 8 / rafales 90 → non recommandé ; force 7 / rafales 75 → à vérifier ; 75 km/h déduit) — avant la phase 6.
8. Seuils en rade : les mêmes qu'en côte ouverte, ou par exposition — phase 6.
9. Publication : fusion des phases 3 et 4 autorisée par Félix le 13 nov. (12 h 37) sous condition de la revue finale ; la mise en ligne elle-même attend la décision 1 (GitHub Pages n'est pas activé sur ce dépôt).

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
- Questions posées : pourquoi la même adresse que guide-peche-bar (réponse : même compte GitHub, donc même domaine felixmuzellec.github.io ; seule une organisation ou un domaine donne une adresse à part, décision 1) ; pourquoi seulement orange ou vert sur les pastilles (réponse : échelle sur 10 tassée, et orange = « moyen » ou « à vérifier » depuis la phase 4 ; corrigé par la spécification de la phase 6, appliqué en phase 7).

## Prochaine action

Phase 6 : spécification `docs/SPEC-MOTEUR-BORD-V2.md` rédigée, rapport de phase 6, arrêt. Attendre `APPROVED — PROCEED TO PHASE 7`. Fusion de la phase 5 : attendre l'accord de Félix.
