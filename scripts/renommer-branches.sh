#!/usr/bin/env bash
# Renomme les branches GitHub de SPUMY selon le modèle de docs/BRANCHES.md.
# GitHub met à jour les propositions ouvertes (même numéro) et redirige les anciens noms ; aucun commit n'est perdu.
# Prérequis : GitHub CLI (gh) installé et connecté au compte propriétaire du dépôt (gh auth login).
# Usage : bash scripts/renommer-branches.sh      (relançable : les branches déjà renommées sont sautées)
set -euo pipefail
REPO="FelixMuzellec/spumy"
enc() { printf '%s' "$1" | sed 's#/#%2F#g'; }

while read -r ancien nouveau; do
  [ -z "${ancien:-}" ] && continue
  if gh api "repos/$REPO/branches/$(enc "$nouveau")" --silent 2>/dev/null; then
    echo "déjà fait   $nouveau"
  elif gh api "repos/$REPO/branches/$(enc "$ancien")" --silent 2>/dev/null; then
    gh api -X POST "repos/$REPO/branches/$(enc "$ancien")/rename" -f new_name="$nouveau" --silent
    echo "renommée    $ancien -> $nouveau"
  else
    echo "introuvable $ancien (rien à faire)"
  fi
done <<'LISTE'
claude/v3-phase-2 claude/v3-phase-02-vision-exigences
claude/v3-phase-3 claude/v3-phase-03-ux-design-system
claude/v3-phase-4 claude/v3-phase-04-architecture-socle
claude/v3-phase-5 claude/v3-phase-05-referentiel-spots
claude/v3-phase-6 claude/v3-phase-06-moteur-bord
claude/phase-3-socle claude/v2-phase-03-socle
claude/phase-4-bord claude/v2-phase-04-audit-bord
claude/phase-5-halieutique claude/v2-phase-05-halieutique
claude/phase-6-conception claude/v2-phase-06-conception-moteur
claude/phase-7-moteur-v2 claude/v2-phase-07-moteur
claude/phase-8-epreuve claude/v2-phase-08-epreuve
claude/phase-9-bateau claude/v2-phase-09-bateau-conception
claude/phase-11-design claude/v2-phase-11-design
claude/phase-12 claude/v2-phase-12-specifications-charte
claude/phase-13-bateau claude/v2-phase-13-bateau
claude/transfert-spumy claude/v2-suivi-transfert-spumy
claude/suivi-fusion-phase-8 claude/v2-suivi-fusion-phases-05-08
claude/qualite-avant-phase-9 claude/v2-suivi-qualite-avant-phase-09
claude/suivi-fusion-phase-11 claude/v2-suivi-fusion-phases-09-11
claude/suivi-pages claude/v2-suivi-pages
LISTE
echo "Terminé. Sur un clone local : git fetch --prune"
