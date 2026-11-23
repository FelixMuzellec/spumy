# Protection de `main`

Phase 4 V3 (référentiel § 12.1). Accord de Félix le 23 nov. 2026 (13 h 55, protection « complète »). Fusionner dans `main` publie le site (GitHub Pages).

## Règle retenue

Ruleset « Protéger main (fusion = publication du site) », sur la branche par défaut (`docs/socle/protection-main.json`) :

| Règle | Effet |
| --- | --- |
| Suppression interdite | `main` ne peut pas être supprimée |
| Push forcé interdit | l'historique publié ne peut pas être réécrit |
| Passage par une proposition (PR) | aucun push direct sur `main`, y compris par Claude ; 0 relecture exigée (dépôt à une personne) |
| Contrôles verts : `tests` et `contrat` | la fusion attend la CI « Tests » et le contrat Open-Meteo |
| Contournement | rôle administrateur (Félix), **par proposition seulement** : fusion sans attendre la CI en cas d'urgence, jamais de push direct |

## État

**BLOCKED — action de Félix.** La session Claude a les droits d'administration, mais son relais vers GitHub refuse l'écriture des rulesets (HTTP 403, « Write access to this GitHub API path is not permitted through this proxy »). Le relais n'est pas contourné.

## Pour l'activer (Félix, une minute)

Au choix :
1. **Depuis un terminal connecté à GitHub** :
   `gh api -X POST repos/FelixMuzellec/spumy/rulesets --input docs/socle/protection-main.json`
2. **Depuis GitHub** : dépôt → Settings → Rules → Rulesets → New ruleset → New branch ruleset :
   - nom : « Protéger main (fusion = publication du site) » ; Enforcement status : Active ;
   - Bypass list : Repository admin, « For pull requests only » ;
   - Target branches : Include default branch ;
   - cocher : Restrict deletions ; Block force pushes ; Require a pull request before merging (0 approbation) ; Require status checks to pass → ajouter `tests` et `contrat` (GitHub Actions).

## Vérification

`gh api repos/FelixMuzellec/spumy/rules/branches/main --jq '[.[].type]'` doit lister `deletion`, `non_fast_forward`, `pull_request`, `required_status_checks` (lecture seule, permise à la session).

## Retour arrière

Settings → Rules → Rulesets → le ruleset → Disable (ou Delete). Aucune donnée n'est touchée.
