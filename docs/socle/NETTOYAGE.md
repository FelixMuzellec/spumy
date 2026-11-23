# Nettoyage contrôlé — registre

Phase 4 V3 (référentiel § 12.2 : « ne supprime rien sans audit de dépendances et stratégie de restauration »). Inventaire complet et méthode : `docs/socle/AUDIT-SOCLE.md` § 7.

## Supprimé

| Élément | Audit | Contrôles après suppression | Restauration |
| --- | --- | --- | --- |
| `src/prototype-v3/map.jsx` (carte et météo de la version 5 du prototype, fond schématique) | aucun import ; son en-tête disait « gardé pour mémoire jusqu'à la revalidation de la version 6 », faite le 23 nov. 2026 (jeton de phase 4) | lint 0 ; couches 0 écart ; construction du prototype V3 identique (360 Ko) ; tests du prototype V3 au vert | `git checkout 874912f -- src/prototype-v3/map.jsx` |

## Gardé, avec la raison

| Élément | Raison | Quand le revoir |
| --- | --- | --- |
| Logos V2 non conformes (`assets/brand/spumy-*-sombre.png`, `web/spumy-logo-sombre.webp`, `logo-spumy.webp`) | encore servis par le site en ligne | remplacement à l'intégration (phases 10 à 12) |
| Fichiers publiés à la racine | c'est le site (GitHub Pages) | migration vers l'entrée unique V3 (`docs/MIGRATION-V3.md`) |
| `audit/` (audits V2 9.1 et 9.2) | cités par `docs/ARCHITECTURE.md` et le rapport de phase 1 | déplacement vers `docs/historique/` à la phase 15 |
| Générateurs V2 (`scripts/logos.py`, `photos.py`, `brand.mjs`, `prototype-data.mjs`, `avant-prototype.mjs`, `carte-prototype.py`) | régénèrent des fichiers encore publiés ou testés | avec le retrait des fichiers qu'ils produisent |
| `prototype/` (phase 11 de la V2) | testé par la CI | quand le prototype V3 l'aura remplacé partout |

## Branches (V3-019, À DÉCIDER par Félix : rien n'est supprimé)

| Branche | État | Proposition |
| --- | --- | --- |
| 13 branches V2 (`claude/phase-3-socle` à `claude/suivi-pages`) | fusionnées dans `main` | suppression possible après le point de retour `v2-final` (V3-019) ; l'historique reste dans `main` |
| `claude/phase-13-bateau` | non fusionnée ; reprise en V3 (V3-014) | garder jusqu'à l'intégration BATEAU |
| `claude/transfert-spumy` | non fusionnée (13 nov.) | à examiner avec Félix |
| `claude/v3-phase-2`, `-3`, `-4` | en cours (propositions n° 16, 17, 18) | garder |
