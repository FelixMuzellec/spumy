# Rapport de phase 3 — SPUMY V3 : UX/UI, direction artistique, Design System, prototypes

20 novembre 2026 · branche `claude/v3-phase-3` · proposition n° 17 (brouillon). Le rapport complet est le document Claude « SPUMY V3 — Rapport de phase 3 » (https://claude.ai/artifact/MUeZdUAtxSDqAKQxML511A). Ce fichier en garde l'essentiel dans le dépôt.

## 1. Objectif et périmètre

Poser les fondations UX/UI de la V3 avant tout code d'application : besoins, architecture de l'information, parcours BORD et BATEAU, direction artistique, Design System et prototypes. La phase a été ouverte par le jeton « APPROVED — PROCEED TO PHASE 3 » (20 nov., 4 h 25).

Hors périmètre :
- aucun changement de l'application en ligne ;
- aucun moteur ni score réel : les données du prototype sont de démonstration ;
- aucune fusion dans `main`.

## 2. Synthèse

Phase 3 **TESTED**, en attente du jeton de la phase 4. Aucun défaut critique ou majeur ne reste ouvert.

| Jalon | Statut |
| --- | --- |
| 1. Besoins, architecture, parcours | VALIDÉ avec remarques (Félix, 13 h 46 ; V3-023) |
| 2. Direction visuelle, Design System, prototypes | VALIDÉ AVEC RÉSERVES (Félix, 15 h 40 ; V3-027, 6 réserves) |
| 3. Revalidation métier | À venir, après les phases 5, 8 et 9 |
| 4. Critères de recette UX/UI et cartographique | PROPOSÉ (CR-01 à CR-14), validé par le jeton de phase 4 |

Limites :
- **TEST UTILISATEUR NON EFFECTUÉ** : le protocole de 8 tâches est prêt ;
- **VALIDATION HUMAINE INDÉPENDANTE NON OBTENUE** : les revues sont de Claude, auteur du prototype.

## 3. Travail réalisé

| Sous-tâche | Statut |
| --- | --- |
| 3.0 Branche, validations de la phase 2 | IMPLEMENTED |
| 3.1 Audit AVANT (31 captures, 22 écarts dont 2 critiques et 15 majeurs) | IMPLEMENTED |
| 3.2 Logos (manifeste, exports sans retouche, `tests/brand.py` 29/29) | TESTED |
| 3.3 Planche UI, photos (V3-026 : pas de vraies photos de spots) | IMPLEMENTED |
| 3.4 Usages, architecture, parcours, wireframes | VALIDATED avec remarques |
| 3.5 Design System V3 (186/186) | TESTED |
| 3.6 Prototype interactif, versions 1 à 5.2 | VALIDATED avec réserves |
| 3.7 Revues, galerie AVANT/CIBLE, matrices, recette, protocole de test (16 défauts, 8 corrigés en version 5.3) | IMPLEMENTED |
| 3.8 Vérification, rapport, arrêt | TESTED |

## 4. Changements significatifs

| Changement | Origine | Vérification |
| --- | --- | --- |
| Design System V3, source unique de jetons (V3-022) | A06, A07, A16 | `test:design-v3` 186/186 |
| Navigation Home, Carte, Météo, Profil ; barre qui défile (V3-023) | A17, jalon 1 | tests de la barre |
| Refonte visuelle (V3-025) | Félix, 14 h 26 | jalon 2 |
| Logo d'origine en lancement, en-tête et icônes | A01 ; Félix, 15 h 02 et 15 h 08 | `tests/brand.py` 29/29 |
| Carte déplaçable, regroupement, panneau du bas | A11 ; Félix, 14 h 46 | tests Carte |
| Seuil « Favorables » à 75 (V3-021) | Q9 | design-v3, prototype |
| Corrections des revues (cibles de 44 px, texte de 12 px, titres, règle des filtres, fixture § 6.7.2, « phase » retiré) | revues 3.7 et 3.8 | `test:prototype-v3` 194/194 |
| Marqueur « à vérifier » : ⚠ et contour, au lieu du pointillé et du « ? » du § 6.9 | Félix, 14 h 26 | test des pastilles ⚠ ; écart consigné (D-13) |

## 5. Livrables

- Prototype version 5.3 : artefact « Prototype SPUMY V3 » (version 10) ; `src/prototype-v3/`, `prototype-v3/` ; `docs/design/PROTOTYPE-V3.md`.
- Galerie AVANT/CIBLE et critères APRÈS : `docs/design/galerie-avant-cible.html` (artefact privé).
- Revues, registre des défauts, matrices § 6.16 et de traçabilité, recette, protocole de test : `docs/design/REVUES-V3.md` ; mesures : `scripts/mesures-revue-v3.mjs`, `docs/design/revue-v3-mesures.json`.
- Audit AVANT : `docs/design/AUDIT-UX-AVANT.md`, `docs/design/avant/`.
- Usages, architecture, parcours : `docs/design/UX-V3.md` ; wireframes : `docs/design/wireframes/`.
- Design System : `docs/design/DESIGN-SYSTEM-V3.md`, `src/design/v3/tokens.js`, `src/design/v3/tokens.css` (généré), `docs/design/contrastes-v3.json`.
- Marque : `docs/design/BRAND-MANIFEST.md`, `assets/brand/v3/`, `scripts/logos-v3.py`.
- Photos : `data/photos/catalogue.json`, `docs/design/PROMPTS-PHOTOS.md`, `docs/design/REFERENCES.md`.
- Décisions V3-021 à V3-027 (`docs/DECISIONS_LOG.md`) ; 95 exigences (`docs/REQUIREMENTS.md`).

## 6. Git

- `main` inchangé (bb4f940) ; le site en ligne n'a pas changé.
- Branche `claude/v3-phase-3`, partie de `claude/v3-phase-2` ; commits atomiques, CI verte sur a2b7844.
- Propositions en brouillon : n° 17 (phase 3, vers `claude/v3-phase-2`), n° 16 (phase 2, vers `main`), n° 15 (phase 13 de la V2).
- Aucun secret, aucune coordonnée personnelle ; V3-019 non exécuté.

## 7. Preuves (20 nov. 2026, sur a2b7844)

| Commande | Code | Résultat |
| --- | --- | --- |
| `npm ci` | 0 | — |
| `npm run build`, puis `git status --porcelain` | 0 | aucun écart entre sources et fichiers publiés |
| `npm test` | 0 | lint et couches sans écart ; données 69/69 ; connaissances 27/27 ; design 41/41 ; design V3 186/186 ; moteur V2 56/56 ; unitaires des 7 guides ; e2e 849/849 ; contrat simulé 28/28 |
| `npm run test:a11y` | 0 | 0 violation |
| `npm run test:upgrade` | 0 | 12/12 |
| `npm run test:prototype` (V2) | 0 | 244/244 |
| `npm run test:prototype-v3` | 0 | 194/194 (repassé à 194/194 sur 76338f2) |
| `python3 tests/brand.py` | 0 | 29/29 |
| CI GitHub | succès | Tests ; Contrat Open-Meteo |

## 8. Résultats

Le prototype couvre de bout en bout les 8 tâches prioritaires, en BORD et en BATEAU, sur 10 écrans, à 4 largeurs et dans 2 thèmes. Il manque encore : le vrai fond de carte, les vraies données, le déplacement de la carte au clavier, le glisser-déposer des onglets, Demain et 7 jours. L'application V2 en ligne ne régresse pas (e2e 849/849, mise à jour 12/12).

## 9. Exigences

25 exigences touchées :
- 23 sont conçues ou prototypées : UX-01 à UX-09, MAP-01 à MAP-05, MAP-07, MAP-08, MET-01 à MET-04, SPOT-09, PRO-03, BAT-09 ;
- MAP-06 relève des phases 5 et 7 ;
- BAT-10 reste à décider.

Aucune n'est intégrée dans l'application (phases 10 à 12). Le détail est dans le rapport complet, § 9.

## 10. Red-team et risques

| Risque | Gravité | Traitement |
| --- | --- | --- |
| Revues faites par l'auteur du prototype | MAJEURE | mesures reproductibles ; test et revue indépendante avant le jalon 3 |
| Compréhension des scores non testée | MAJEURE | tâche T7 ; jalon 3 |
| Logo altéré et slogan toujours en ligne (A01, A05) | CRITIQUE côté site | corrigés en V3, publiés à une fusion décidée par Félix |
| Fusion qui publierait `prototype-v3/` et ses données fictives | MINEURE | décision demandée (§ 12) |
| Écarts au référentiel (barre qui défile, marqueur « à vérifier ») | OBSERVATION | arbitrés par Félix et consignés |

## 11. Qualité et conformité UX/UI

- **Matrice § 6.16** : 6 domaines conformes, 9 partiellement conformes, aucun non conforme.
- **WCAG 2.2 AA** : 24 critères conformes, 7 partiels ou non vérifiables.
- **Nielsen** : 7 heuristiques conformes sur 10.
- **Recette cartographique du prototype** : 10 points conformes sur 14.
- **Défauts** : 16, dont 8 corrigés et testés, 4 ouverts mineurs, 4 arbitrés ou à décider.
- **Gates** : A, D, E, F, G et H passées pour le périmètre ; B et C sans objet ; I à la clôture de la V3.

## 12. Décisions attendues

1. Jeton « APPROVED — PROCEED TO PHASE 4 », qui valide aussi les critères CR-01 à CR-14 (jalon 4).
2. Fusion des phases 2 et 3, c'est-à-dire leur publication. Recommandation : attendre la phase 4 et garder `prototype-v3/` hors du site publié.
3. Cibles tactiles de 44 px ou de 48 dp (D-11). Recommandation : 44.
4. Emplacement de l'export du journal (D-15) : à décider après la tâche T6.

V3-019 reste ouverte.

Demande à Félix : faire passer le test de 15 min à 2 à 4 proches avant le jalon 3.

## 13. Prochaine phase

Phase 4 : architecture détaillée, socle technique et assainissement contrôlé. Elle couvre :
- contrats typés et gestion d'erreurs ;
- CI et fixtures déterministes ;
- secrets ;
- protection de `main` ;
- nettoyage autorisé, après audit des dépendances et avec une stratégie de restauration.

Dépendances : accès IGN (V3-009, V3-012), relais Météo-France plus tard (V3-011), JSDoc (V3-020).

## 14. Arrêt

Phase 3 **TESTED**. Arrêt : aucune tâche de la phase 4 n'a commencé. Jeton attendu : `APPROVED — PROCEED TO PHASE 4`.
