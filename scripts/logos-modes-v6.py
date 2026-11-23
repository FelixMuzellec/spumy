"""Prototype V6 : exports web des logos Inshore et Offshore d'origine (Home, cartes Shore et Offshore, V3-028).
Redimensionnement seul (Lanczos), sans recadrage, recoloration, filtre ni transparence.
Usage : python3 scripts/logos-modes-v6.py"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
for name in ("inshore", "offshore"):
    src = Image.open(ROOT / "assets/brand/sources" / f"{name}.jpg").convert("RGB")
    for size in (128, 256):
        out = ROOT / "assets/brand/v3" / f"{name}-{size}.webp"
        src.resize((size, size), Image.LANCZOS).save(out, "WEBP", quality=92, method=6)
        print(out.relative_to(ROOT), out.stat().st_size // 1024, "Ko")
