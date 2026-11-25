# Dossier de conception du moteur BORD (phase 6 V3, PROVISOIRE)

Le bar depuis le bord. Rien de ce dossier n'est implémenté dans l'application : aucun changement de moteur avant l'approbation explicite qui suit la phase 9.

| Document | Contenu |
| --- | --- |
| [00-AUDIT-MOTEUR-V2.md](00-AUDIT-MOTEUR-V2.md) | Audit du moteur en ligne : inventaire, ce qui reste, 18 constats prouvés |
| [01-CONTRAT.md](01-CONTRAT.md) | Favorabilité, Confiance, publication, sécurité en cinq états, classement, données manquantes, explicabilité |
| [02-VARIABLES-ET-FACTEURS.md](02-VARIABLES-ET-FACTEURS.md) | Variables du § 9.1.3 et facteurs du § 9.1.4 : retenus, candidats, écartés, non vérifiables |
| [03-ARCHITECTURES.md](03-ARCHITECTURES.md) | Architectures candidates contre deux baselines ; choix provisoire A1 |
| [04-PROBABILISTE.md](04-PROBABILISTE.md) | ZINB : vérifications, limites du ratio Gamma–Poisson, identifiabilité ; moteur 2 du journal |
| [05-SCENARIOS-SENSIBILITE.md](05-SCENARIOS-SENSIBILITE.md) | 24 scénarios, sensibilité, stabilité du classement, effets de seuil, monotonie |
| [06-PLAN-VALIDATION.md](06-PLAN-VALIDATION.md) | Hypothèses, inconnues, plan de validation, questions D6-01 à D6-21 |

Code de l'étude : `scripts/etude-moteur-bord/`. Résultats : `data/moteur-bord/resultats-etude.json` (régénérer : `node scripts/etude-moteur-bord/etude.mjs`). Fixtures : `data/moteur-bord/scenarios.json`. Tests : `npm run test:etude-moteur`.
