# Stratégie de test — SPUMY V3

Phase 2 V3, 20 novembre 2026. Référentiel § 13. On part de la suite V2, qui est complète et verte (phase 1 : e2e 849/849, a11y 0 violation, mise à jour 12/12), et on y ajoute les risques propres à la V3.

## 1. Risques et tests

| Risque (§ 13.1) | Exemple | Tests | Exigences |
| --- | --- | --- | --- |
| Danger physique | un spot engagé « vert » par grand vent ; vigilance ignorée | scénarios de sécurité BORD (16, V2) et BATEAU (16, phase 13) ; donnée manquante → « à vérifier » | SEC-01 à SEC-05, BAT-03, BAT-04 |
| Mauvaise décision halieutique | rang faux, égalité tranchée en douce | **tests d'invariance du rang** (§ 13.2) ; égalités et pénuries du Top 3 | REC-01 à REC-10 |
| Perte de données | journal V2 perdu à la mise à jour | `test:upgrade` étendu (états V2 réels anonymisés) ; clés V2 intactes | JRN-03, BAT-02, OFF-04 |
| Exposition de la position | position conservée ou envoyée à un tiers | inventaire des requêtes sortantes dans l'e2e ; revue du stockage | PRV-01, PRV-03 |
| Erreur réglementaire | fermeture du lieu jaune ignorée | dates de fermeture testées | SPOT-04, BAT-05 |
| Recommandation trompeuse | estimation de route présentée comme vérifiée ; Confiance prise pour une chance de prise | rendu des états de route ; test de compréhension (fixture 53 et 69) | RTE-02, UX-04 |
| Indisponibilité terrain | réseau absent sur la côte | e2e hors ligne, services en échec, position refusée | POS-07, OFF-02, OFF-03 |
| Atteinte à la marque | poisson recoloré, orange modifié | **test de la zone protégée** : chaque export comparé pixel à pixel à `spumy.jpg` | UX-01 |

## 2. Suites

| Suite | Existe (V2) | Ajouts V3 |
| --- | --- | --- |
| `lint`, `test:layers` | oui | couche des adaptateurs dans `core` |
| `test:data`, `test:knowledge` | oui | catalogue : 66 identifiants V2 présents, positions en décimales ou signalées, sources |
| `test:v2` (moteur BORD) | oui | Pertinence retirée ; invariance du rang (Confiance, boîte) ; égalités ; Top 3 |
| `test:bateau` | branche phase 13 | selon V3-014 |
| `test:unit` (7 guides) | oui | remplacé par des tests par spot du catalogue, même couverture |
| `test:e2e` | oui (849) | position (appareil, refus, saisie, épingle, changement) ; routage 59 / 61 min et estimation ; anciennes adresses ; Pertinence absente ; textes interdits (slogan, « V2 ») |
| `test:contract` | oui (Open-Meteo) | contrat IGN : géocodage, isochrone, itinéraire, CORS ; vigilance selon V3-011 |
| `test:a11y` | oui | nouveaux écrans ; contrastes mesurés de la palette V3 |
| `test:upgrade` | oui (12) | migration V2 → V3 complète |
| `test:design`, `test:prototype` | oui | jetons V3 ; zone protégée du logo |
| Tests utilisateurs | non | `docs/design/DISCOVERY.md`, section 3 ; résultats marqués `TEST UTILISATEUR` ou `REVUE INTERNE` |

## 3. Performance

Les budgets sont fixés en Phase 4 après une mesure AVANT de la V2 en ligne :
- appareil : téléphone moyen émulé (Playwright, processeur ralenti 4 fois) ;
- réseau : 4G et réseau lent ;
- scénarios : première ouverture, réouverture en cache, classement après changement de position, ouverture de la carte.

Aucun gain n'est annoncé sans mesure avant et après, reproductible.

## 4. Règles de passage

- Suite complète verte dans l'intégration continue avant toute fusion (QA-03).
- `TESTED` n'est déclaré qu'avec les commandes exécutées et leurs codes de sortie consignés (§ 12.3).
- Le test de parcours instable connu (réouverture d'une analyse photo, délai de 12 s) est corrigé ou rendu déterministe en Phase 14.
