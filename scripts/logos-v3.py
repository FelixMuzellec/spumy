#!/usr/bin/env python3
"""Exports V3 du logo de marque SPUMY (BRAND), sans jamais toucher au poisson ni à l'aplat orange.

Phase 3 V3 (docs/design/BRAND-MANIFEST.md). Source en lecture seule : assets/brand/sources/spumy.jpg.

Principe : le « médaillon » est un recadrage circulaire du fichier source, pixels d'origine
inchangés. Le disque orange, le poisson (y compris les pointes qui dépassent du disque) et le fond
crème qui les entoure restent tels quels. Sur un fond sombre, c'est ce fond crème d'origine qui
assure le contraste du poisson : on adapte le fond extérieur, jamais le symbole (§ 6.1.3).
Le mot SPUMY n'est pas repris : il est composé en texte par l'interface (élément adaptable, § 6.1.2).

Seules opérations : recadrage, masque circulaire hors de la zone protégée, effacement du haut des
lettres qui entrent dans le cercle (remplacé par la couleur du fond d'origine, hors zone protégée),
redimensionnement proportionnel. Usage : python3 scripts/logos-v3.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/brand/sources/spumy.jpg"
OUT = ROOT / "assets/brand/v3"

# Géométrie mesurée sur la source 2048 × 2048 (phase 3) : centre et rayon du disque orange,
# rayon maximal de l'encre du symbole (pointes du poisson), haut des lettres du mot SPUMY.
CX, CY = 1023.5, 902.0
DISC_R = 302.75
INK_R = 358.7          # aucune encre du symbole au-delà (pointes de nageoires et de queue)
WORD_TOP = 1245        # première ligne des lettres ; aucune encre du symbole en dessous de 1200
MEDAL_R = 372          # rayon du médaillon : 13 px de marge autour de l'encre du symbole
PROTECTED_R = 361      # zone protégée testée : tout pixel à moins de 361 px du centre et au-dessus des lettres
NAVY = (23, 43, 58)    # #172B3A, fond des icônes (palette V3)


def background(a):
    """Couleur du fond crème d'origine, médiane d'une zone sans encre."""
    return np.median(a[20:120, 20:120].reshape(-1, 3), axis=0).round().astype(np.uint8)


def medallion():
    src = np.asarray(Image.open(SRC).convert("RGB"))
    bg = background(src)
    x0, y0 = int(round(CX - MEDAL_R)), int(round(CY - MEDAL_R))
    size = 2 * MEDAL_R
    crop = src[y0:y0 + size, x0:x0 + size].copy()
    yy, xx = np.mgrid[0:size, 0:size]
    # Les lettres du mot SPUMY qui entrent dans le cercle (hors zone protégée) prennent la couleur du fond.
    letters = (yy + y0) >= WORD_TOP
    crop[letters] = bg
    # Masque circulaire avec bord lissé (le bord ne touche que du fond crème : MEDAL_R > INK_R).
    d = np.hypot(xx + 0.5 - (CX - x0), yy + 0.5 - (CY - y0))
    alpha = np.clip((MEDAL_R - d) * 2.0, 0, 1)
    rgba = np.dstack([crop, (alpha * 255).round().astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA"), (x0, y0)


def square(side):
    """Carré de la source centré sur le symbole, sur son fond crème d'origine ; le haut des lettres qui y entre
    reçoit la couleur du fond (hors zone protégée). Aucun pixel du disque ni du poisson n'est modifié."""
    src = np.asarray(Image.open(SRC).convert("RGB"))
    bg = background(src)
    x0, y0 = int(round(CX - side / 2)), int(round(CY - side / 2))
    crop = src[y0:y0 + side, x0:x0 + side].copy()
    yy = np.mgrid[0:side, 0:side][0]
    crop[(yy + y0) >= WORD_TOP] = bg
    return Image.fromarray(crop, "RGB")


LOCKUP_BOX = (424, 518, 1624, 1521)  # emprise de l'encre (507–1541 × 601–1438) plus 83 px de marge, fond crème d'origine


def lockup():
    """Logo complet d'origine (symbole et mot SPUMY) : simple recadrage de la source, sans aucune retouche."""
    return Image.open(SRC).convert("RGB").crop(LOCKUP_BOX)


def icon(med, size, scale, bg=NAVY, radius_ratio=0.0):
    """Icône carrée : médaillon centré, mis à l'échelle proportionnellement, sur fond marine."""
    canvas = Image.new("RGBA", (size, size), bg + (255,))
    if radius_ratio:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255)
        canvas.putalpha(mask)
    m = int(round(size * scale))
    small = med.resize((m, m), Image.LANCZOS)
    canvas.alpha_composite(small, ((size - m) // 2, (size - m) // 2))
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    med, origin = medallion()
    med.save(OUT / "spumy-medaillon-744.png", optimize=True)          # taille native : pixels d'origine
    for s in (512, 256, 128, 64):
        med.resize((s, s), Image.LANCZOS).save(OUT / f"spumy-medaillon-{s}.png", optimize=True)
    med.resize((256, 256), Image.LANCZOS).save(OUT / "spumy-medaillon-256.webp", quality=95, method=6)
    # Icônes de l'application : le symbole sur son fond crème d'origine, plein cadre (version 2, après le retour de Félix).
    # Côté du carré source : l'encre (rayon 358,7 px) tient dans 84 % (icônes), 80 % (iOS) et la zone sûre de 80 % (adaptative).
    square(880).resize((512, 512), Image.LANCZOS).save(OUT / "icon-512.png", optimize=True)
    square(880).resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png", optimize=True)
    square(1000).resize((512, 512), Image.LANCZOS).save(OUT / "icon-maskable-512.png", optimize=True)
    square(900).resize((180, 180), Image.LANCZOS).save(OUT / "apple-touch-icon-180.png", optimize=True)
    square(760).resize((32, 32), Image.LANCZOS).save(OUT / "favicon-32.png", optimize=True)
    # Logo complet (écran de lancement, à propos) : recadrage puis réduction proportionnelle.
    full = lockup()
    full.resize((960, round(960 * full.height / full.width)), Image.LANCZOS).save(OUT / "spumy-logo-960.webp", quality=92, method=6)
    full.resize((480, round(480 * full.height / full.width)), Image.LANCZOS).save(OUT / "spumy-logo-480.png", optimize=True)
    (OUT / "ORIGINE.txt").write_text(
        "Dérivés de assets/brand/sources/spumy.jpg par scripts/logos-v3.py.\n"
        f"Médaillon : recadrage circulaire de rayon {MEDAL_R} px centré en ({CX}, {CY}), origine {origin} ; "
        "pixels du disque orange, du poisson et du fond crème inchangés.\n"
        "Icônes : carré de la source centré sur le symbole (fond crème d'origine), réduit proportionnellement.\n"
        f"Logo complet (spumy-logo-960.webp, spumy-logo-480.png) : recadrage {LOCKUP_BOX} de la source, puis réduction proportionnelle ; aucune retouche.\n", encoding="utf-8")
    print("exports V3 :", ", ".join(sorted(p.name for p in OUT.iterdir())))


if __name__ == "__main__":
    main()
