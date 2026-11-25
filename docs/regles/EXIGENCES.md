# Exigences du cahier des charges et leurs preuves

Généré par `node tests/pare-feux.mjs --ecrire` depuis `tests/pare-feux/exigences.mjs` et `docs/REQUIREMENTS.md`. Ne pas modifier à la main.

Félix (25 nov. 2026, 7 h 25) : les exigences sont reliées aux pare-feux (PF-46). Une phase ne se clôt pas sans que ses exigences aient leur preuve, ou leur écart écrit avec la phase où il se résout.

## Bilan

- acceptée : 9
- tenue sur le prototype : 7
- spécifiée et éprouvée sur l'étude : 6
- écart : 7
- à faire : 69

## Exigences

| Exigence | Phase | État | Preuve, ou écart |
| --- | --- | --- | --- |
| POS-01 | 3, 10 | à faire, phase 10 | — |
| POS-02 | 10 | à faire, phase 10 | — |
| POS-03 | 10 | à faire, phase 10 | — |
| POS-04 | 4, 10 | à faire, phase 10 | — |
| POS-05 | 3, 10 | à faire, phase 10 | — |
| POS-06 | 10 | à faire, phase 10 | — |
| POS-07 | 3, 10 | à faire, phase 10 | — |
| RTE-01 | 10 | à faire, phase 10 | — |
| RTE-02 | 10 | à faire, phase 10 | — |
| RTE-03 | 10 | à faire, phase 10 | — |
| RTE-04 | 5, 7 | à faire, phase 7 | — |
| REC-01 | 6, 10 | à faire, phase 10 | — |
| REC-02 | 6, 10 | à faire, phase 10 | — |
| REC-03 | 6 | spécifiée et éprouvée sur l'étude, acceptation finale en phase 11 | `tests/etude-moteur-bord.mjs`, `tests/prototype-v3.mjs` |
| REC-04 | 6, 10 | à faire, phase 10 | — |
| REC-05 | 6, 10 | à faire, phase 10 | — |
| REC-06 | 6 | spécifiée et éprouvée sur l'étude, acceptation finale en phase 11 | `tests/etude-moteur-bord.mjs` |
| REC-07 | 3, 10 | à faire, phase 10 | — |
| REC-08 | 6 | spécifiée et éprouvée sur l'étude, acceptation finale en phase 11 | `tests/etude-moteur-bord.mjs` |
| REC-09 | 3, 10 | à faire, phase 10 | — |
| REC-10 | 6, 10 | à faire, phase 10 | — |
| REC-11 | 5 à 8 | à faire, phase 8 | — |
| REC-12 | 6, 9 | à faire, phase 9 | — |
| SEC-01 | 6, 10 | à faire, phase 10 | — |
| SEC-02 | 6 | spécifiée et éprouvée sur l'étude, acceptation finale en phase 11 | `tests/etude-moteur-bord.mjs` ; écart déclaré pour la visibilité (D6-16, rapport de phase 6) |
| SEC-03 | 9, 10 | à faire, phase 10 | — |
| SEC-04 | 3 | tenue sur le prototype, acceptation finale en phase 12 | `tests/prototype-v3.mjs` |
| SEC-05 | 6, 9 | à faire, phase 9 | — |
| MAP-01 | 3, 10 | à faire, phase 10 | — |
| MAP-02 | 3 | tenue sur le prototype, acceptation finale en phase 12 | `tests/prototype-v3.mjs` |
| MAP-03 | 3, 10 | à faire, phase 10 | — |
| MAP-04 | 10 | à faire, phase 10 | — |
| MAP-05 | 3, 10 | à faire, phase 10 | — |
| MAP-06 | 5, 7 | à faire, phase 7 | — |
| MAP-07 | 3 | tenue sur le prototype, acceptation finale en phase 12 | `tests/prototype-v3.mjs` |
| MAP-08 | 3, 10 | à faire, phase 10 | — |
| MAP-09 | 3, 5, 10 | à faire, phase 10 | — |
| SPOT-01 | toutes | acceptée | `tests/spots-v3.mjs`, `scripts/inventaire-spots-v2.mjs` |
| SPOT-02 | 5, 7 | à faire, phase 7 | — |
| SPOT-03 | 5, 7 | à faire, phase 7 | — |
| SPOT-04 | 5, 9 | à faire, phase 9 | — |
| SPOT-05 | 3, 10 | à faire, phase 10 | — |
| SPOT-06 | 10 | à faire, phase 10 | — |
| SPOT-07 | 5, 7, 8 | à faire, phase 8 | — |
| SPOT-08 | 3 | écart, acceptation finale en phase 12 | le prototype affiche « Illustration » sur ses photos, mais aucun test ne le vérifie (PF-31) |
| SPOT-09 | 3, 7 | à faire, phase 7 | — |
| JRN-01 | 13 | à faire, phase 13 | — |
| JRN-02 | 13 | à faire, phase 13 | — |
| JRN-03 | 4, 13 | à faire, phase 13 | — |
| JRN-04 | 13 | à faire, phase 13 | — |
| JRN-05 | 6, 13 | à faire, phase 13 | — |
| JRN-06 | 3, 6, 8, 13 | à faire, phase 13 | — |
| PRO-01 | 13 | à faire, phase 13 | — |
| PRO-02 | 13 | à faire, phase 13 | — |
| PRO-03 | 3, 13 | à faire, phase 13 | — |
| MAT-01 | 12 | à faire, phase 12 | — |
| BAT-01 | toutes | acceptée | `tests/e2e.mjs` |
| BAT-02 | 4 | acceptée | `tests/upgrade.mjs` |
| BAT-03 | 9, 10 | à faire, phase 10 | — |
| BAT-04 | 9 | à faire, phase 9 | — |
| BAT-05 | 9 | à faire, phase 9 | — |
| BAT-06 | 9 | à faire, phase 9 | — |
| BAT-07 | 9 | à faire, phase 9 | — |
| BAT-08 | 3 | écart, acceptation finale en phase 12 | aucune donnée BORD dans BATEAU : tenu par les couches (tests/layers.mjs) ; le test de tâche 6 auprès d'utilisateurs n'a pas été mené (hypothèse H6 « À VALIDER », docs/design/DISCOVERY.md) ; `tests/layers.mjs` |
| BAT-09 | 3, 9 | à faire, phase 9 | — |
| BAT-10 | à décider | à décider | — |
| MET-01 | 3, 6 | tenue sur le prototype, acceptation finale en phase 12 | `tests/prototype-v3.mjs` |
| MET-02 | 3, 9 | à faire, phase 9 | — |
| MET-03 | 3 | écart, acceptation finale en phase 12 | aucune couleur de palier ni nom de zone dans la couche de vent : respecté par le prototype, sans test dédié |
| MET-04 | 3, 6 | tenue sur le prototype, acceptation finale en phase 12 | `tests/prototype-v3.mjs` ; « dans tous les états » (hors ligne, obsolète) reste à éprouver sur l'application intégrée |
| MET-05 | 3, 5, 6 | tenue sur le prototype, acceptation finale en phase 12 | `tests/prototype-v3.mjs`, `tests/knowledge.mjs` |
| UX-01 | 3 | acceptée | `tests/brand.py` |
| UX-02 | 3 | acceptée | `tests/design-v3.mjs` |
| UX-03 | 3 | tenue sur le prototype, acceptation finale en phase 12 | `tests/prototype-v3.mjs`, `tests/pare-feux.mjs` |
| UX-04 | 3 | écart, acceptation finale en phase 12 | le test de compréhension (4 personnes sur 5 expliquent « 53/100, à vérifier » et « 69/100, moyenne ») n'a pas été mené : hypothèses H4 et H5 « À VALIDER » (docs/design/DISCOVERY.md) |
| UX-05 | 3, 10 | à faire, phase 10 | — |
| UX-06 | 3, 14 | à faire, phase 14 | — |
| UX-07 | 3 | écart, acceptation finale en phase 12 | aucune capture au chargement ne vérifie l'absence de « à vérifier » provisoire |
| UX-08 | 3, 10 | à faire, phase 10 | — |
| UX-09 | 3, 10 | à faire, phase 10 | — |
| OFF-01 | 4 | acceptée | `tests/upgrade.mjs` |
| OFF-02 | 3, 13 | à faire, phase 13 | — |
| OFF-03 | 10 | à faire, phase 10 | — |
| OFF-04 | 4 | écart, acceptation finale en phase 13 | `test:upgrade` couvre la V2 ; la V3 n'a pas encore de stockage à migrer (Journal, Profil et synchronisation : phase 13) ; `tests/upgrade.mjs` |
| OFF-05 | 13 | à faire, phase 13 | — |
| PRV-01 | 4, 10 | à faire, phase 10 | — |
| PRV-02 | 2, 14 | à faire, phase 14 | — |
| PRV-03 | 10 | à faire, phase 10 | — |
| PRV-04 | 13 | à faire, phase 13 | — |
| DAT-01 | 4 | spécifiée et éprouvée sur l'étude, acceptation finale en phase 10 | `tsconfig.typecheck.json`, `tests/socle.mjs` |
| DAT-02 | 4 | spécifiée et éprouvée sur l'étude, acceptation finale en phase 10 | `tests/socle.mjs` ; adaptateur IGN et validation de ses réponses posés en phase 4 ; le changement de fournisseur avec un simulateur s'éprouve à l'implémentation |
| QA-01 | 4 | écart, acceptation finale en phase 9 | mesure AVANT consignée en phase 4, seuils pas encore validés par Félix ; contrainte du 25 nov. 2026, 7 h 25 : la vitesse ne se gagne jamais aux dépens de la qualité du graphisme (PF-43) |
| QA-02 | 4 à 14 | à faire, phase 14 | — |
| QA-03 | toutes | acceptée | `.github/workflows/tests.yml` |
| OPS-01 | toutes | acceptée | `.githooks/pre-push`, `scripts/pare-feux/branche.mjs` |
| OPS-02 | 4 | acceptée | `docs/DECISIONS_LOG.md` |
| OPS-03 | 15 | à faire, phase 15 | — |
| OPS-04 | 10 | à faire, phase 10 | — |
