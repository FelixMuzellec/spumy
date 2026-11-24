#!/usr/bin/env bash
# Renomme les branches GitHub de SPUMY selon le modèle de docs/BRANCHES.md.
# GitHub met à jour les propositions ouvertes (même numéro) et redirige les anciens noms ; aucun commit n'est perdu.
# Prérequis : GitHub CLI (gh) installé et connecté au compte propriétaire du dépôt (gh auth login).
# Usage : bash scripts/renommer-branches.sh      (relançable : les branches déjà renommées sont sautées)
# Toujours « v » minuscule (Félix, 24 nov. 2026, 22 h 52) : les noms « claude/V2-… » posés à la main sont repris.
set -euo pipefail
REPO="FelixMuzellec/spumy"
enc() { printf '%s' "$1" | sed 's#/#%2F#g'; }

while read -r ancien nouveau; do
  [ -z "${ancien:-}" ] && continue
  if gh api "repos/$REPO/branches/$(enc "$nouveau")" --silent 2>/dev/null; then
    echo "déjà fait   $nouveau"
  elif gh api "repos/$REPO/branches/$(enc "$ancien")" --silent 2>/dev/null; then
    depart="$ancien"
    if [ "$(printf '%s' "$ancien" | tr 'A-Z' 'a-z')" = "$nouveau" ]; then
      # seule la majuscule change (V2 -> v2) : passage par un nom intermédiaire, au cas où GitHub refuserait le renommage direct
      gh api -X POST "repos/$REPO/branches/$(enc "$ancien")/rename" -f new_name="$nouveau-renommage" --silent
      ancien="$nouveau-renommage"
    fi
    gh api -X POST "repos/$REPO/branches/$(enc "$ancien")/rename" -f new_name="$nouveau" --silent
    echo "renommée    $depart -> $nouveau"
  else
    echo "introuvable $ancien (rien à faire)"
  fi
done <<'LISTE'
claude/V2-phase-3-socle claude/v2-phase-03-socle
claude/V2-phase-4-bord claude/v2-phase-04-audit-bord
claude/V2-phase-5-halieutique claude/v2-phase-05-halieutique
claude/V2-phase-6-conception claude/v2-phase-06-conception-moteur
claude/V2-phase-7-moteur-v2 claude/v2-phase-07-moteur
claude/V2-phase-8-epreuve claude/v2-phase-08-epreuve
claude/V2-phase-9-bateau claude/v2-phase-09-bateau-conception
claude/V2-phase-11-design claude/v2-phase-11-design
claude/V2-phase-12 claude/v2-phase-12-specifications-charte
claude/V2-phase-13-bateau claude/v2-phase-13-bateau
claude/V2-transfert-spumy claude/v2-suivi-transfert-spumy
claude/V2-suivi-fusion-phase-8 claude/v2-suivi-fusion-phases-05-08
claude/V2-qualite-avant-phase-9 claude/v2-suivi-qualite-avant-phase-09
claude/V2-suivi-fusion-phase-11 claude/v2-suivi-fusion-phases-09-11
claude/V2-suivi-pages claude/v2-suivi-pages
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
