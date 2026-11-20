# SPUMY V3 — Phase 2 : vision, exigences et architecture cible

20 novembre 2026 · Félix · rapport complet en 14 parties : document Claude https://claude.ai/artifact/JWzDnppc1u7Wf6SPEgceDn. Ce fichier en garde l'essentiel dans le dépôt.

## Synthèse

La cible V3 est définie et prête à valider. Ce sera une seule application gratuite, à deux modes :
- elle classe un catalogue unique de spots depuis ta position ;
- en BORD, le temps de route réel est de 60 min au plus ;
- deux scores, et une sécurité à part ;
- elle garde les moteurs, les données et le mode BATEAU de la V2.

Statut de la phase : **TESTED**, en attente de validation.

**Décisions de Félix pendant la phase (20 nov.)**

| Heure | Décision |
| --- | --- |
| 1 h 30 | Usage : lui et quelques proches, gratuit, non commercial (ADR-V3-005) |
| 4 h 18 | Branche BATEAU de la phase 13 reprise en V3, Pertinence retirée, seuils à valider (V3-014) |
| 4 h 18 | Vigilance Météo-France lue par un petit relais gratuit qui garde la clé (V3-011) |
| 4 h 18 | Top 3 BORD : une place pour un spot à 15 min ou moins de la position, sans bonus (V3-016) |
| 4 h 18 | Note sur 10 retirée (V3-015) |

**À valider avec le jeton de la phase 3** : V3-008 (une page, deux modes, un catalogue), V3-009 (routage IGN), V3-010 (position sans localisation par l'adresse IP), V3-012 (Plan IGN), V3-013 (données sur l'appareil), V3-018 (identifiants gardés), V3-020 (types JSDoc), le registre de 84 exigences et la vision. **Encore ouvert** : V3-019 (étiquette `v2-final`, suppression des 14 branches fusionnées).

## Livrables

`CLAUDE.md`, `SPUMY_AUDIT_CONTINUITY.md`, `docs/SPUMY_MASTER_PROMPT.md`, `docs/DECISIONS_LOG.md` (20 ADR), `docs/VISION-V3.md`, `docs/design/DISCOVERY.md` (10 hypothèses), `docs/REQUIREMENTS.md` (84 exigences, matrice BATEAU, frontières V2), `docs/DATA_SOURCES.md`, `docs/ARCHITECTURE-V3.md`, `docs/security/THREAT_MODEL.md`, `docs/MIGRATION-V3.md`, `docs/TEST_STRATEGY.md`, `docs/historique/CONTINUITE-V2.md`, `docs/rapports/v3/PHASE-1.md`.

## Preuves

| Commande | Code de sortie | Résultat |
| --- | --- | --- |
| `npm ci` | 0 | 235 paquets |
| `npm run build` | 0 | empreinte e6d65f7622cb, identique à `main` ; `git status` vide |
| `npm test` | 0 | lint 0 ; couches 0 écart ; données 69/69 ; connaissances 27/27 ; design 41/41 ; moteur v2 56/56 ; unitaires des 7 guides (407 à 437) ; e2e 849/849 ; contrat simulé 28/28 |
| Vérification croisée des documents | 0 | 20 ADR définies et indexées ; 84 exigences ; aucune référence inexistante |

Sources lues le 20 nov. 2026 : conditions d'Open-Meteo, politique des tuiles OpenStreetMap, fiches data.gouv.fr de la Géoplateforme IGN (isochrone, itinéraire, WMTS, liste des services), transfert de l'API Adresse à l'IGN, API Bulletin Vigilance (liens dans `docs/DATA_SOURCES.md`).

**Non vérifié** :
- CORS des services IGN ;
- licence exacte de TICON-4 ;
- conditions d'OpenRouteService et d'OSRM ;
- usage hors ligne des tuiles IGN.

## Red-team

| Point | Gravité | Traitement |
| --- | --- | --- |
| L'isochrone suit les routes : un poste sur une pointe peut sortir du polygone alors que son stationnement y est | MAJEURE | corrigé dans `ARCHITECTURE-V3.md` (test sur l'accès ou le point routier le plus proche, étalonnage en Phase 4) |
| CORS des services IGN inconnu | MAJEURE | test en Phase 4 ; plan B : le relais |
| Un seul utilisateur interrogé | MAJEURE | test de tâche avec un proche en Phase 3 |
| Place « 15 min » hors ligne | MINEURE | aucune place réservée sans temps vérifié |
| Anciennes adresses : position du pôle du guide | MINEURE | marquée « proposée, à confirmer » |
| Relais de vigilance hors de GitHub | MINEURE | origine du site seule, aucune donnée gardée |
| Réserve P1-14 acceptée par inférence | MINEURE | contrôle du site en ligne dès qu'un navigateur est relié |

## Gates

A PASS · B PASS · C PASS · D N/A JUSTIFIÉ (pas d'écran) · E PASS · F PASS · G PASS · H PASS · I N/A JUSTIFIÉ.

## Arrêt

**STOP.** Proposition n° 16 en brouillon, non fusionnée ; site en ligne inchangé. Jeton attendu : `APPROVED — PROCEED TO PHASE 3`.
