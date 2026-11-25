# Nom des branches GitHub

Modèle demandé par Félix le 24 nov. 2026, à 21 h 45, pour s'y retrouver.

## Modèle

| Type | Modèle | Exemple |
| --- | --- | --- |
| Phase de développement | `claude/<programme>-phase-<NN>-<sujet>` | `claude/v3-phase-06-moteur-bord` |
| Travail hors phase (suivi, correction, transfert) | `claude/<programme>-suivi-<sujet>` | `claude/v2-suivi-pages` |

- **`claude/`** : préfixe obligatoire. C'est le seul où Claude a le droit de pousser.
- **`<programme>`** : toujours en minuscule, `v` et non `V` (Félix, 24 nov. 2026, 22 h 52) :
  - `v2` pour le premier programme, celui qui a construit l'application en ligne (phases 3 à 13, du 13 au 20 nov. 2026) ;
  - `v3` pour le programme en cours (référentiel `docs/SPUMY_MASTER_PROMPT.md`).
- **`<NN>`** : numéro de phase sur deux chiffres, pour que GitHub range les branches dans l'ordre (`phase-09` avant `phase-10`).
- **`<sujet>`** : deux à quatre mots, en minuscules, sans accents, séparés par des tirets. Il reprend l'objet de la phase dans le référentiel.
- `main` ne change pas de nom : c'est elle que GitHub Pages publie.

## Correspondance des branches existantes

| Nom actuel (24 nov. 2026, 22 h 52) | Nouveau nom | Proposition (état) |
| --- | --- | --- |
| `claude/v3-phase-2` | `claude/v3-phase-02-vision-exigences` | n° 16, brouillon |
| `claude/v3-phase-3` | `claude/v3-phase-03-ux-design-system` | n° 17, brouillon |
| `claude/v3-phase-4` | `claude/v3-phase-04-architecture-socle` | n° 18, brouillon |
| `claude/v3-phase-5` | `claude/v3-phase-05-referentiel-spots` | n° 19, brouillon |
| `claude/v3-phase-6` | `claude/v3-phase-06-moteur-bord` | n° 20, brouillon |
| (à créer jeudi) | `claude/v3-phase-07-enrichissement-halieutique` | — |
| `claude/V2-phase-3-socle` (ex `claude/phase-3-socle`) | `claude/v2-phase-03-socle` | n° 1, fusionnée |
| `claude/V2-phase-4-bord` (ex `claude/phase-4-bord`) | `claude/v2-phase-04-audit-bord` | n° 2, fusionnée |
| `claude/V2-phase-5-halieutique` (ex `claude/phase-5-halieutique`) | `claude/v2-phase-05-halieutique` | n° 3, fusionnée |
| `claude/V2-phase-6-conception` (ex `claude/phase-6-conception`) | `claude/v2-phase-06-conception-moteur` | n° 4, fermée sans fusion |
| `claude/V2-phase-7-moteur-v2` (ex `claude/phase-7-moteur-v2`) | `claude/v2-phase-07-moteur` | n° 6, fusionnée |
| `claude/V2-phase-8-epreuve` (ex `claude/phase-8-epreuve`) | `claude/v2-phase-08-epreuve` | n° 7, fusionnée |
| `claude/V2-phase-9-bateau` (ex `claude/phase-9-bateau`) | `claude/v2-phase-09-bateau-conception` | n° 10, fusionnée |
| `claude/V2-phase-11-design` (ex `claude/phase-11-design`) | `claude/v2-phase-11-design` | n° 11, fusionnée |
| `claude/V2-phase-12` (ex `claude/phase-12`) | `claude/v2-phase-12-specifications-charte` | n° 14, fusionnée |
| `claude/V2-phase-13-bateau` (ex `claude/phase-13-bateau`) | `claude/v2-phase-13-bateau` | n° 15, brouillon |
| `claude/V2-transfert-spumy` (ex `claude/transfert-spumy`) | `claude/v2-suivi-transfert-spumy` | n° 5, fusionnée |
| `claude/V2-suivi-fusion-phase-8` (ex `claude/suivi-fusion-phase-8`) | `claude/v2-suivi-fusion-phases-05-08` | n° 8, fusionnée |
| `claude/V2-qualite-avant-phase-9` (ex `claude/qualite-avant-phase-9`) | `claude/v2-suivi-qualite-avant-phase-09` | n° 9, fusionnée |
| `claude/V2-suivi-fusion-phase-11` (ex `claude/suivi-fusion-phase-11`) | `claude/v2-suivi-fusion-phases-09-11` | n° 12, fusionnée |
| `claude/V2-suivi-pages` (ex `claude/suivi-pages`) | `claude/v2-suivi-pages` | n° 13, fusionnée |

## Renommage

Le renommage se fait par GitHub lui-même, qui :
- met à jour les propositions ouvertes, sans changer leur numéro ;
- redirige les anciens noms.

Aucun commit n'est perdu.

Le relais Git de la session de Claude refuse cette opération (« Write access to this GitHub API path is not permitted through this proxy »). Elle se fait donc avec le compte de Félix, de l'une de ces deux façons :
- avec le script `scripts/renommer-branches.sh` (GitHub CLI connecté à son compte) ;
- à la main, sur la page des branches du dépôt (icône crayon de chaque branche).

Le script peut être relancé sans risque : il saute les branches déjà renommées. Il reprend aussi les noms `claude/V2-…` posés à la main le 24 nov. : quand seule la majuscule change, il passe par un nom intermédiaire.

Après le renommage, sur un clone local : `git fetch --prune`, puis `git branch -m <ancien> <nouveau>` et `git branch -u origin/<nouveau>` pour chaque branche suivie.

Les rapports de phase gardent les noms en vigueur à leur date ; ce tableau fait la correspondance.
