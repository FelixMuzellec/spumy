# CLAUDE.md — instructions de travail SPUMY V3

À lire à chaque session, avant toute action. Le référentiel complet est `docs/SPUMY_MASTER_PROMPT.md` (V4.1.13) ; ce fichier le résume et ne le contredit jamais, sauf là où une décision de Félix consignée dans `docs/DECISIONS_LOG.md` modifie le référentiel (jamais en sécurité) : ce fichier le signale alors.

## Entrée de session

1. Lire ce fichier, `SPUMY_AUDIT_CONTINUITY.md`, `docs/DECISIONS_LOG.md` et les exigences applicables (`docs/REQUIREMENTS.md`).
2. Vérifier l'état réel : `git status`, branche, branches distantes, derniers commits, propositions ouvertes.
   - Activer les pare-feux locaux : `git config core.hooksPath .githooks` (refus du push sur `main` et de la suppression d'une branche, nom de branche et phase autorisée, lignes d'attribution). Registre des pare-feux, version par version : `docs/regles/PARE-FEUX.md` (Félix, 25 nov. 2026, 6 h 32).
3. Identifier la dernière phase autorisée par un jeton `APPROVED — PROCEED TO PHASE X` et reprendre sa prochaine tâche non terminée. Sans jeton, aucune phase suivante ne démarre.
   - Jetons conditionnels de Félix (23 nov. 2026, 23 h 15, `docs/DECISIONS_LOG.md` ; modifie l'arrêt obligatoire du référentiel) : la phase 6 démarre seulement quand la phase 5 est close avec tous ses gates PASS ; la phase 7 seulement quand la phase 6 est close après trois passes de challenge (au moins une par un relecteur qui n'a pas produit le travail). Gate en échec ou question bloquante : arrêt, question à Félix. Jamais de phase 8 sans son jeton.
4. Fin de phase : rapport en 14 parties (§ 16 du référentiel), puis arrêt.

## Règles absolues (résumé du § 0.2)

- Aucune fabrication. Marquer `VÉRIFIÉ`, `INFÉRÉ`, `HYPOTHÈSE`, `INCONNU` ou `À DÉCIDER`. Une déclaration n'est pas une preuve.
- À l'écran, chaque chiffre a sa source et son heure ; sans source sûre, rien n'est affiché. Pas de courbes de profondeur sans données réelles (Félix, 23 nov. 2026, V3-028).
- L'information va toujours du général au spécifique, jamais tout au même niveau : la carte de l'onglet occupe le premier écran (point de vue global), puis le spot et sa note (bulle ou panneau courts), puis, en faisant défiler sous la carte, la justification (Carte : pourquoi ce spot est bon aujourd'hui par son terrain ; Météo : comment chaque élément a pesé dans la note), puis le détail sourcé. Chaque explication part de la règle générale avant le cas du spot (Félix, 23 nov. 2026, V3-029).
- Ne pas revenir sur ce qui a été validé avec Félix (23 nov. 2026) : `docs/DECISIONS_LOG.md` fait foi. Une idée qui touche un point validé est présentée comme un changement, avec son impact, jamais appliquée d'office.
- Ne jamais supprimer un spot V2. Aucun nettoyage destructif, aucun remplacement gratuit.
- La sécurité ne se compense jamais. Une donnée de sécurité inconnue n'est jamais « au vert ».
- Deux scores seulement : Favorabilité et Confiance. La Pertinence est supprimée ; la Confiance ne change jamais le rang.
- Aucun découpage géographique dans le produit (secteurs, régions, départements) : position de référence dynamique ; 60 min de route au plus en BORD seulement.
- Logo BRAND : le dessin du poisson et l'orange de l'aplat (#C76A31, mesuré sur `assets/brand/sources/spumy.jpg`) ne changent jamais, ni par recoloration, ni par filtre, ni par transparence. Logos Inshore et Offshore facultatifs (décision de Félix, 20 nov. 2026).
- Un seul slogan dans l'application : « Read the sea. Fish the moment. », en tête de Home (Félix, 23 nov. 2026, V3-028 ; modifie le référentiel § 6.2.2). Aucun autre. « V2 » n'apparaît pas à l'écran.
- Poser tout de suite une question qui bloque, une à la fois.

## Dépôt

- Jamais de commit ni de push sur `main`. Une branche par phase, `claude/v3-phase-NN-sujet` (deux chiffres, sujet court en minuscules sans accents ; hors phase : `claude/v3-suivi-sujet` ; modèle et correspondance des anciens noms : `docs/BRANCHES.md`, Félix, 24 nov. 2026), proposition en brouillon, fusion seulement avec l'accord explicite de Félix (fusionner `main` = publier : GitHub Pages publie `main`).
- Commits atomiques. Messages terminés par les deux lignes d'attribution de la session.
- Aucun secret dans le dépôt, ni coordonnée de spot personnel. Un jeton d'accès donné en clair dans une conversation n'est jamais utilisé ni stocké.

## Commandes

- `npm ci`, puis `npm run build` (régénère les fichiers publiés à la racine), `npm test` (lint, couches, données, connaissances, design, moteur v2, unitaires, e2e, contrat simulé), `npm run test:a11y`, `npm run test:upgrade`, `npm run test:prototype`.
- Le statut `TESTED` exige des commandes réellement exécutées, avec leurs codes de sortie consignés.

## Micro-checkpointing (§ 3.5)

Après chaque sous-tâche (hors phase en lecture seule) : écrire sur disque, commit atomique, mise à jour de `SPUMY_AUDIT_CONTINUITY.md` (fichiers touchés, branche, commit, tests, risques, prochaine action).

## Limite de crédits (§ 3.6, à respecter tel quel)

Dès qu'un avertissement de crédits, de quota ou de contexte apparaît, ou que le reste à faire risque de ne pas tenir :
1. ne rien commencer de nouveau (aucune fonction, aucune amélioration optionnelle, aucune tâche d'une autre phase) ;
2. lister les critères, tests, contrôles red-team et livrables qui restent obligatoires dans la phase ;
3. si la clôture complète tient, finir la phase (tests, red-team, documents, sauvegarde, rapport), puis s'arrêter sans jamais entamer la suivante ;
4. sinon, s'arrêter au premier point sûr, sans sauter de contrôle : phase `IN PROGRESS` ou `BLOCKED`, jamais `TESTED` ni `VALIDATED` sans preuves.

Avant l'arrêt : tout écrire sur disque ; commit atomique sur la branche de phase (jamais `main`, jamais les fichiers hors périmètre) ou, à défaut, patch de reprise documenté ; `SPUMY_AUDIT_CONTINUITY.md` mis à jour avec `STOP_REASON: CREDIT_LIMIT` et l'état complet. Rapport de passation marqué `ARRÊT AUTOMATIQUE — LIMITE DE CRÉDITS`, avec `PHASE TERMINÉE` ou `PHASE NON TERMINÉE — REPRISE NÉCESSAIRE`. En Phase 1 (lecture seule), aucun commit : notes hors du dépôt. À la reprise : relire ce fichier, la continuité, les décisions et l'état Git, puis reprendre la même phase sans redemander son jeton.
