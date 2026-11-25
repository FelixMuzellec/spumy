"""Logos de SPUMY fournis par Félix (19 novembre 2026) : déclinaisons pour l'application, le site et le prototype.

Sources (versionnées) : assets/brand/sources/spumy.jpg (bar dans un disque orange + « SPUMY »),
inshore.jpg (pêcheur sur la roche : mode BORD), offshore.jpg (bateau de pêche : mode BATEAU).

    python3 scripts/logos.py

Produit, sans retoucher le dessin :
  assets/brand/<nom>-clair.png    fond crème rendu transparent (pour un fond clair ou un badge crème)
  assets/brand/<nom>-sombre.png   idem, le bleu marine passé en crème (pour un fond sombre) ; le dessin à
                                  l'intérieur du disque orange du logo SPUMY reste tel quel ; SPUMY seulement,
                                  encore servi par le site en ligne (non conforme, défaut A01 : retiré aux phases 10 à 12)
  noms : spumy-logo (marque + nom), spumy-marque (disque et bar), spumy-nom, inshore, offshore
  assets/icon-192.png, icon-512.png, icon-maskable.png, apple-touch-icon.png, assets/<guide>-192.png
                                  icônes de l'application : la marque sur un carré crème
  assets/brand/web/*.webp         images du site et du prototype (tailles d'affichage × 2)
"""
import os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "brand", "sources")
OUT = os.path.join(ROOT, "assets", "brand")
WEB = os.path.join(OUT, "web")
GUIDES = ["logonna", "pirou", "plouguerneau", "audierne", "carantec", "concarneau", "crozon"]
CREME = np.array([0xEF, 0xE7, 0xD8], dtype=np.float64)   # crème des badges et du thème Plein soleil


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, name)).convert("RGB"), dtype=np.float64)


def border_color(a):
    b = np.concatenate([a[:20].reshape(-1, 3), a[-20:].reshape(-1, 3), a[:, :20].reshape(-1, 3), a[:, -20:].reshape(-1, 3)])
    return np.median(b, axis=0)


def color_to_alpha(a, bg):
    """Algorithme « couleur vers alpha » : chaque pixel = mélange du dessin et du fond ; on retire le fond."""
    diff = a - bg
    up = np.where(diff > 0, diff / np.maximum(255 - bg, 1), 0)
    down = np.where(diff < 0, -diff / np.maximum(bg, 1), 0)
    alpha = np.clip(np.max(np.maximum(up, down), axis=2), 0, 1)
    # Bruit de compression du JPEG autour du fond (jusqu'à 0,13 mesuré sur les bords) : seuil doux.
    alpha = np.clip((alpha - 0.16) / 0.84, 0, 1)
    safe = np.maximum(alpha, 1e-4)[..., None]
    fg = np.clip((a - bg) / safe + bg, 0, 255)
    return fg, alpha


def disc_mask(a):
    """Disque orange du logo SPUMY : centre et rayon d'après les pixels orange."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    orange = (r > 170) & (g > 70) & (g < 150) & (b < 90)
    ys, xs = np.nonzero(orange)
    cy, cx = (ys.min() + ys.max()) / 2, (xs.min() + xs.max()) / 2
    rad = (ys.max() - ys.min() + xs.max() - xs.min()) / 4
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    return ((yy - cy) ** 2 + (xx - cx) ** 2) <= (rad - 2) ** 2, (cy, cx, rad)


def to_dark(fg, alpha, keep=None):
    """Variante pour fond sombre : le bleu marine (pixels sombres) devient crème ; l'orange ne bouge pas."""
    lum = (0.2126 * fg[..., 0] + 0.7152 * fg[..., 1] + 0.0722 * fg[..., 2]) / 255
    t = np.clip((0.42 - lum) / 0.30, 0, 1)[..., None]       # 1 pour le marine, 0 pour l'orange et le crème
    out = fg * (1 - t) + CREME * t
    if keep is not None:
        out[keep] = fg[keep]
    return out, alpha


def rgba(fg, alpha):
    return Image.fromarray(np.dstack([fg, alpha * 255]).astype(np.uint8), "RGBA")


def crop(img, pad=0.04):
    box = img.getchannel("A").point(lambda v: 255 if v > 90 else 0).getbbox()
    w, h = box[2] - box[0], box[3] - box[1]
    p = int(max(w, h) * pad)
    return img.crop((max(0, box[0] - p), max(0, box[1] - p), min(img.width, box[2] + p), min(img.height, box[3] + p)))


def save(img, name):
    """Original de travail : 1 024 px au plus de côté (assez pour toute icône ou en-tête), PNG optimisé."""
    k = 1024 / max(img.size)
    if k < 1:
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    img.save(os.path.join(OUT, name), optimize=True)


def web(img, name, width):
    h = round(img.height * width / img.width)
    img.resize((width, h), Image.LANCZOS).save(os.path.join(WEB, name), "WEBP", quality=88, method=6)


def icon(mark, size, scale, rounded):
    """Icône : la marque centrée sur un carré crème (coins arrondis pour « any », plein cadre sinon)."""
    s = size * 4
    base = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    tile = Image.new("RGBA", (s, s), tuple(int(v) for v in CREME) + (255,))
    mask = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(mask)
    if rounded:
        d.rounded_rectangle((0, 0, s - 1, s - 1), radius=int(s * 0.22), fill=255)
    else:
        d.rectangle((0, 0, s, s), fill=255)
    base.paste(tile, (0, 0), mask)
    m = mark.copy()
    k = s * scale / max(m.size)
    m = m.resize((round(m.width * k), round(m.height * k)), Image.LANCZOS)
    base.alpha_composite(m, ((s - m.width) // 2, (s - m.height) // 2))
    return base.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(WEB, exist_ok=True)
    # ── Logo SPUMY : marque (disque + bar) et nom ──
    a = load("spumy.jpg")
    bg = border_color(a)
    fg, al = color_to_alpha(a, bg)
    inside, _ = disc_mask(a)
    fg[inside], al[inside] = a[inside], 1.0     # le dessin dans le disque reste entier (gravure crème comprise)
    dark_fg, _ = to_dark(fg, al, keep=inside)
    rows = np.nonzero((al > 0.5).sum(axis=1) > 3)[0]
    gaps = np.nonzero(np.diff(rows) > 40)[0]     # bande vide entre le bar et le nom
    split = (rows[gaps[0]] + rows[gaps[0] + 1]) // 2
    for suffix, f in (("clair", fg), ("sombre", dark_fg)):
        full = crop(rgba(f, al))
        save(full, f"spumy-logo-{suffix}.png")
        save(crop(rgba(f[:split], al[:split])), f"spumy-marque-{suffix}.png")
        save(crop(rgba(f[split:], al[split:])), f"spumy-nom-{suffix}.png")
    mark_clair = Image.open(os.path.join(OUT, "spumy-marque-clair.png"))
    web(Image.open(os.path.join(OUT, "spumy-logo-sombre.png")), "spumy-logo-sombre.webp", 520)
    web(Image.open(os.path.join(OUT, "spumy-logo-clair.png")), "spumy-logo-clair.webp", 520)
    web(Image.open(os.path.join(OUT, "spumy-marque-sombre.png")), "spumy-marque-sombre.webp", 160)
    web(Image.open(os.path.join(OUT, "spumy-nom-sombre.png")), "spumy-nom-sombre.webp", 360)

    # ── Inshore (BORD) et Offshore (BATEAU) ──
    for n in ("inshore", "offshore"):
        a = load(f"{n}.jpg")
        fg, al = color_to_alpha(a, border_color(a))
        img = crop(rgba(fg, al))   # pas de variante sombre : elle recolorait le dessin et ne servait nulle part
        save(img, f"{n}-clair.png")
        web(img, f"{n}-clair.webp", 240)

    # ── Icônes de l'application (et des guides : la même marque) ──
    A = lambda f: os.path.join(ROOT, "assets", f)
    icon(mark_clair, 192, 0.80, True).save(A("icon-192.png"), optimize=True)
    icon(mark_clair, 512, 0.80, True).save(A("icon-512.png"), optimize=True)
    icon(mark_clair, 512, 0.62, False).save(A("icon-maskable.png"), optimize=True)
    icon(mark_clair, 180, 0.76, False).save(A("apple-touch-icon.png"), optimize=True)
    for g in GUIDES:
        icon(mark_clair, 192, 0.80, True).save(A(f"{g}-192.png"), optimize=True)
    print("logos et icônes écrits dans assets/ et assets/brand/")


if __name__ == "__main__":
    main()
