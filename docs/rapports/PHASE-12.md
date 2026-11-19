# SPUMY — Phase 12 : spécifications, et la charte dans l'application (v10)

19–20 novembre 2026 · Félix · branche `claude/phase-12`

La charte de la phase 11 est dans l'application que tu ouvres, en version 10. On y trouve :
- tes trois logos : SPUMY, Inshore et Offshore ;
- le bleu nuit de ta référence et le cyan pour l'action ;
- les titres condensés ;
- tes photos sur l'écran Décision et dans la fiche du spot.

Les spécifications fonctionnelles et techniques sont écrites, écran par écran (`docs/SPECIFICATIONS.md`). Le prototype utilise aussi tes logos.

Tu m'as demandé de répondre seul aux questions ; mes réponses sont au § 8.

## 1. Objectif

Deux consignes de Félix :
- 19 novembre, 20 h 14 : « les changements graphiques ne semblent pas avoir été pris en compte », avec les trois logos ;
- 19 novembre, 23 h 11 : « APPROVED — PROCEED TO PHASE 12 », et que les phases 11 et 12 soient sur GitHub et fonctionnent, nouveau design, photos et fonctionnalités compris.

La phase 12 couvre donc :
- les spécifications prévues par le prompt maître ;
- l'application de la charte au code de l'application, avancée ici à la demande de Félix (décision ouverte n° 5).

## 2. Travail réalisé

| Lot | Statut | Contenu |
|---|---|---|
| 12.A Logos et accueil | TESTED | Logos sources versionnés ; déclinaisons claires et sombres (`scripts/logos.py`) ; icônes du téléphone ; accueil à la charte avec Inshore et Offshore ; Roboto Condensed auto-hébergée ; service worker sans `prototype/`, `assets/`, `docs/` |
| 12.B Charte dans les guides | TESTED | Jetons Nuit marine, ancienne palette remplacée partout (couleurs en dur 291 → 253) ; titres condensés ; photo d'ambiance sur l'écran Décision et dans la fiche du spot |
| 12.C Finitions et prototype | TESTED | Anneaux de note en dégradé et chiffres condensés ; logos de Félix dans le prototype (marque, cartes Inshore et Offshore, planche BORD / BATEAU) ; version 10.0 |
| 12.D Spécifications | IMPLEMENTED | `docs/SPECIFICATIONS.md` : cadre, services, système, états, écrans, exigences, reste à faire |
| 12.E Documents, fusion | IMPLEMENTED | Direction artistique (logos et marque), suivi, journal des versions ; fusion dans `main` une fois les tests GitHub verts |

## 3. Livrables

- **L'application v10** à https://felixmuzellec.github.io/spumy/, publiée par GitHub Pages après la fusion.
- `docs/SPECIFICATIONS.md`.
- `docs/DIRECTION-ARTISTIQUE.md`, § 5 bis : logos et marque.
- `assets/brand/` (sources, déclinaisons, images du site) et `scripts/logos.py`.
- `src/bord/ui/ambiance.js` et `AmbiancePhoto.jsx` : les photos d'ambiance dans l'application.
- Le prototype, mis à jour avec tes logos.

## 4. Preuves

Résultats des contrôles : voir le suivi (`SPUMY_AUDIT_CONTINUITY.md`, lots 12.A à 12.E) et les tests GitHub de la proposition de fusion.

Les suites jouées :
- lint ;
- couches ;
- données, connaissances, moteur v2, unitaires ;
- accessibilité ;
- parcours complets ;
- mise à jour d'un téléphone ;
- studio ;
- design ;
- prototype.

## 5. Résultats

- **Accueil** :
    - grand logo SPUMY ;
    - accroche « Où et quand pêcher le bar aux leurres », avec l'orange de la marque ;
    - deux cartes, Inshore (du bord) et Offshore (en bateau), avec tes logos sur un badge crème.
- **Guides** :
    - fond bleu nuit, cartes vitrées, cyan pour l'action ;
    - en-tête avec la marque ;
    - barre du bas inchangée dans son principe (Décision, Carte, Journal, Matériel, Plus), aux nouvelles couleurs.
- **Décision** :
    - le verdict s'écrit sur une photo d'ambiance choisie d'après la lumière, le ciel, la mer et le type de lieu du créneau ;
    - « Illustration » en haut à gauche ;
    - hors connexion, la miniature floue reste affichée.
- **Fiche du spot** : bandeau photo au-dessus de l'anneau et du nom ; mêmes règles.
- **Plein soleil** : toujours disponible ; les photos gardent leurs couleurs.

## 6. Problèmes et risques

- **Le prototype va plus loin que l'application.** Restent à faire :
    - la fiche à trois niveaux ;
    - les écrans Comparaison et Stratégie dédiés ;
    - le classement sous la carte ;
    - les écrans BATEAU de la phase 10.

  Leur liste et leurs critères sont dans `docs/SPECIFICATIONS.md`, § 7.
- **Photos** :
    - environ 5 Mo pour les deux tailles, hors du cache hors ligne ;
    - l'application charge la version de 720 px quand il y a du réseau ;
    - elles restent marquées « Illustration ».
- **Plein soleil** reste un affichage inversé : lisible, mais moins fin que le thème clair du prototype. Un vrai thème clair est à faire avec le lot BORD restant.
- **Un logo de moins de 32 px** ne se lit plus. Les pictogrammes au trait prennent alors le relais.

## 7. Critères d'acceptation

| Critère | Statut |
|---|---|
| Logos de Félix dans l'application, le site et le prototype | TESTED |
| Nouveau design visible dans l'application publiée (pas seulement le prototype) | TESTED après fusion ; à confirmer par toi sur ton téléphone |
| Photos d'ambiance dans l'application, jamais présentées comme un spot ou une prise | TESTED |
| Aucune régression : parcours, mise à jour d'un téléphone, accessibilité | TESTED (voir le suivi) |
| Spécifications écran par écran avec critères vérifiables (prompt maître, phase 12) | IMPLEMENTED |

## 8. Décisions prises seul (à ta demande)

1. **Direction artistique** : validée par ton approbation. Tes logos ajoutent l'orange et la crème à la marque, sans changer l'interface : cyan pour l'action, et ambre et rouge pour la sécurité.
2. **Logo** : les tiens, tels quels. Le dessin n'est pas retouché ; seuls le fond et, sur fond sombre, le bleu marine sont adaptés.
3. **Noms des modes** : Inshore et Offshore à l'écran, comme toi ; BORD et BATEAU restent les noms techniques.
4. **Photos** : publiées comme tu l'as demandé, toujours marquées « Illustration », jamais une image reconnaissable sur un spot nommé. Aucune n'est une photo de prise.
5. **Application du design** : faite maintenant, comme tu l'as demandé. Ce que le prototype montre en plus reste listé dans les spécifications, comme un lot BORD à placer avant la QA globale (phase 16).
6. **Écarts voulus à la référence** : gardés (pastilles bleues, pas de bathymétrie, leurres dessinés sans étoiles).
7. **BATEAU** : l'onglet Offshore existant reste tel qu'il est (tes spots, conditions, sorties, modèle appris de tes sorties). Aucune donnée d'exemple n'entre dans l'application ; le moteur de la phase 10 reste à faire.

## 9. Prochaine phase proposée, et arrêt

**Phase 13 — Développement BATEAU** (prompt maître) : architecture, interfaces, moteur, données, fonctionnalités, intégration. Elle commence par le moteur de la phase 10 (mise de côté), d'après `docs/SPEC-MOTEUR-BATEAU.md` et les écrans BATEAU du prototype. Les seuils de sécurité restent « à vérifier » tant que tu ne les as pas validés (questions 16 à 25). Le lot BORD restant (§ 7 des spécifications) peut passer avant si tu préfères.

**STOP.** J'attends « APPROVED — PROCEED TO PHASE 13 ».
