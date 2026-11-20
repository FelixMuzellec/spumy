#!/usr/bin/env python3
"""Test de la zone protégée du logo BRAND (poisson et aplat orange), § 6.1.1 et § 6.2.1.

1. Le médaillon en taille native est identique, pixel pour pixel, à la source dans la zone protégée.
2. Chaque export redimensionné garde l'orange de l'aplat (#C76A31, ±2 par canal) et la silhouette du
   poisson (recouvrement des pixels sombres ≥ 97 % avec la source réduite de la même façon).
3. Aucun export ne recolore la zone protégée (pas de pixel crème là où la source est sombre).
4. Les exports V2 restent listés : la variante sombre V2 est signalée comme non conforme (défaut A01).
Usage : python3 tests/brand.py   (Pillow et NumPy requis)
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util  # noqa: E402

spec = importlib.util.spec_from_file_location("logos_v3", ROOT / "scripts/logos-v3.py")
L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)

ok = fail = 0
def t(name, cond, info=""):
    global ok, fail
    if cond: ok += 1
    else:
        fail += 1; print(f"   ÉCHEC · {name}" + (f" — {info}" if info else ""))

src = np.asarray(Image.open(L.SRC).convert("RGB")).astype(int)
x0, y0 = int(round(L.CX - L.MEDAL_R)), int(round(L.CY - L.MEDAL_R))
size = 2 * L.MEDAL_R
win = src[y0:y0 + size, x0:x0 + size]
yy, xx = np.mgrid[0:size, 0:size]
d = np.hypot(xx + 0.5 - (L.CX - x0), yy + 0.5 - (L.CY - y0))
protected = (d <= L.PROTECTED_R) & ((yy + y0) < L.WORD_TOP)

# Géométrie : la zone protégée contient toute l'encre du symbole.
bg = np.array([233, 226, 210]); ink = (np.abs(win - bg).max(axis=2) > 28) & ((yy + y0) < L.WORD_TOP)
t("géométrie : toute l'encre du symbole est dans la zone protégée", not (ink & ~protected).any(), str(int((ink & ~protected).sum())))

# 1. Taille native : identité stricte.
med = np.asarray(Image.open(L.OUT / "spumy-medaillon-744.png").convert("RGBA")).astype(int)
t("médaillon natif : 744 × 744", med.shape[:2] == (size, size))
t("médaillon natif : zone protégée identique à la source, pixel pour pixel", np.array_equal(med[..., :3][protected], win[protected]))
t("médaillon natif : zone protégée entièrement opaque", (med[..., 3][protected] == 255).all())

# Mesure de l'orange sur la source (aplat) et sur les exports.
def orange_of(rgb):
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    m = (R > 150) & (R - B > 90) & (G > 70) & (G < 150)
    px = rgb[m]; med_ = np.median(px, axis=0)
    core = px[np.abs(px - med_).max(axis=1) <= 12]
    return core.mean(axis=0).round().astype(int), int(m.sum())

o_src, _ = orange_of(win)
t("source : orange de l'aplat = #C76A31", tuple(o_src) == (0xC7, 0x6A, 0x31), "#%02X%02X%02X" % tuple(o_src))

# 2 et 3. Exports réduits.
for s in (512, 256, 128, 64):
    e = np.asarray(Image.open(L.OUT / f"spumy-medaillon-{s}.png").convert("RGBA")).astype(int)
    ref = np.asarray(Image.fromarray(win.astype(np.uint8)).resize((s, s), Image.LANCZOS)).astype(int)
    k = s / size
    ys, xs = np.mgrid[0:s, 0:s]
    dd = np.hypot(xs + 0.5 - (L.CX - x0) * k, ys + 0.5 - (L.CY - y0) * k)
    inner = (dd <= L.DISC_R * k * 0.9)
    o, n = orange_of(e[..., :3][inner])
    t(f"export {s} : orange de l'aplat conservé (±2)", n > 0 and np.abs(o - o_src).max() <= 2, "#%02X%02X%02X" % tuple(o))
    prot = (dd <= (L.PROTECTED_R - 4) * k) & ((ys / k + y0) < L.WORD_TOP - 8)
    dark_ref = ref[..., :3].mean(axis=2) < 110; dark_e = e[..., :3].mean(axis=2) < 110
    inter = (dark_ref & dark_e & prot).sum(); union = ((dark_ref | dark_e) & prot).sum()
    t(f"export {s} : silhouette du poisson conservée (≥ 97 %)", union == 0 or inter / union >= 0.97, f"{inter / max(union, 1):.3f}")
    recolor = (dark_ref & prot & (e[..., :3].mean(axis=2) > 180)).sum()
    t(f"export {s} : aucun pixel sombre du poisson devenu clair", recolor == 0, str(int(recolor)))

# Icônes : le médaillon y est entier (proportionnel) et l'orange intact.
for name in ("icon-512.png", "icon-192.png", "icon-maskable-512.png", "apple-touch-icon-180.png"):
    e = np.asarray(Image.open(L.OUT / name).convert("RGB")).astype(int)
    o, n = orange_of(e)
    t(f"{name} : orange de l'aplat conservé (±3)", n > 0 and np.abs(o - o_src).max() <= 3, "#%02X%02X%02X" % tuple(o))

# Contrôle négatif : une recoloration de type V2 (marine → crème hors du disque) est bien détectée.
mut = med[..., :3].copy()
outside_disc = d > L.DISC_R - 2
dark_px = mut.mean(axis=2) < 110
mut[outside_disc & dark_px & protected] = [239, 231, 216]
t("contrôle négatif : une recoloration du poisson est détectée", not np.array_equal(mut[protected], win[protected]) and int((outside_disc & dark_px & protected).sum()) > 0)

# 4. Signalement de l'export V2 non conforme (il reste en place jusqu'à son remplacement dans l'application).
v2 = ROOT / "assets/brand/spumy-marque-sombre.png"
t("export V2 sombre toujours présent (remplacement prévu en Phase 10–12, défaut A01)", v2.exists())

print(f"[marque] zone protégée du logo BRAND : {ok}/{ok + fail}")
sys.exit(1 if fail else 0)
