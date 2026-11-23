#!/usr/bin/env python3
"""Symbole SPUMY détouré (disque orange et poisson, sans le fond crème), pour les en-têtes sombres du prototype V6.

Demande de Félix (23 nov. 2026, 12 h 45 : « le logo n'est pas bon ») : sur ses maquettes, le disque et le poisson sont
posés directement sur le fond marine, sans l'anneau crème du médaillon.

Règle de marque (CLAUDE.md, BRAND-MANIFEST § 2) : le dessin du poisson et l'orange de l'aplat ne changent jamais. Ici,
aucune valeur de couleur n'est modifiée : on ne fait que rendre transparent le fond crème d'origine, c'est-à-dire les
pixels proches du crème (écart < 40) reliés au bord du cadre, et le haut des lettres du mot SPUMY. Les reflets clairs
du poisson, entourés de son trait, restent opaques. Le bord extérieur est adouci d'un pixel (alpha seulement).
Le médaillon (spumy-medaillon-*) reste l'export de référence sur fond clair ou incertain.

Usage : python3 scripts/logos-symbole-v6.py   (contrôlé par python3 tests/brand.py)
"""
import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("logos_v3", ROOT / "scripts/logos-v3.py")
L = importlib.util.module_from_spec(spec)
spec.loader.exec_module(L)

CREAM_GAP = 40   # écart RVB au fond crème en dessous duquel un pixel relié au bord est du fond


def symbol():
    src = np.asarray(Image.open(L.SRC).convert("RGB"))
    bg = L.background(src).astype(np.int32)
    R = L.MEDAL_R
    x0, y0 = int(round(L.CX - R)), int(round(L.CY - R))
    crop = src[y0:y0 + 2 * R, x0:x0 + 2 * R]
    yy = np.mgrid[0:2 * R, 0:2 * R][0]
    letters = (yy + y0) >= L.WORD_TOP - 5
    creamish = np.sqrt(((crop.astype(np.int32) - bg) ** 2).sum(-1)) < CREAM_GAP
    lab, _ = ndimage.label(creamish | letters)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    back = np.isin(lab, list(edge)) | letters
    fg = ~back
    alpha = np.where(fg, 1.0, ndimage.gaussian_filter(fg.astype(float), 1.0))
    alpha[letters] = 0
    rgba = np.dstack([crop, (alpha * 255).round().astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA"), (x0, y0), back


def reduce(im, s):
    """Réduction proportionnelle en alpha prémultiplié (pas de liseré crème au bord)."""
    return im.convert("RGBa").resize((s, s), Image.LANCZOS).convert("RGBA")


def main():
    im, origin, _ = symbol()
    im.save(L.OUT / "spumy-symbole-744.png", optimize=True)
    for s in (256, 128):
        reduce(im, s).save(L.OUT / f"spumy-symbole-{s}.png", optimize=True)
    with open(L.OUT / "ORIGINE.txt", "a", encoding="utf-8") as f:
        f.write(f"Symbole détouré (spumy-symbole-744.png, -256.png, -128.png, scripts/logos-symbole-v6.py) : même recadrage que le médaillon, origine {origin} ; "
                f"fond crème d'origine relié au bord (écart < {CREAM_GAP}) et haut des lettres rendus transparents ; aucune valeur de couleur modifiée.\n")
    print("symbole : spumy-symbole-744.png, -256.png, -128.png")


if __name__ == "__main__":
    main()
