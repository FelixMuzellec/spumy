# SPUMY — Phase 7 : moteur BORD v2

18 novembre 2026 · Félix

Le moteur v2 de la spécification validée le 18 novembre est en place, à côté de la v1 : trois scores sur 100 (favorabilité, pertinence, confiance), jamais fusionnés, et le filtre de sécurité de la spécification, commun aux deux moteurs. La v2 est le moteur par défaut ; *Réglages → Moteur de notes* ramène la note sur 10 tant que la phase 8 n'a pas validé la v2.

## 1. Objectif

Implémenter la spécification `docs/SPEC-MOTEUR-BORD-V2.md` : filtre de sécurité (lot 7.2), trois scores comparés à la v1 sur les mêmes journées avec un réglage pour revenir à la v1 (lot 7.1), pastilles et niveaux de preuve, conseil tiré de ta boîte, 16 scénarios en tests.

## 2. Travail réalisé

| Lot | Ce qui a été fait | Statut |
| --- | --- | --- |
| 7.0 | Branche `claude/phase-7-moteur-v2` (phase 6 + `main`) ; suivi à jour | TESTED |
| 7.2 | Sécurité de la spécification, commune aux deux moteurs | TESTED |
| 7.1 | Moteur v2, classement, réglage v1/v2, comparaison v1/v2 | TESTED |
| 7.3 | Pastilles, trois scores à l'écran, niveaux de preuve, meilleurs leurres de ta boîte | TESTED |
| 7.4 | 16 scénarios en tests, parcours, accessibilité, captures | TESTED |
| 7.5 | Ce rapport, questions, arrêt | IMPLEMENTED |

## 3. Livrables

…

## 4. Preuves

…

## 5. Résultats

…

## 6. Problèmes et risques

…

## 7. Critères d'acceptation

…

## 8. Décisions attendues

…

## 9. Prochaine phase proposée, et arrêt

…
