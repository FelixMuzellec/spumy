#!/usr/bin/env python3
"""Photos d'ambiance (phase 11) : des originaux de Félix aux fichiers publiés.

Usage : python3 scripts/photos.py <dossier des originaux> [--seulement id1,id2]
--seulement : ne traite que ces photos (les autres originaux ne sont pas nécessaires).
Un original plus petit que 1 600 px n'est jamais agrandi : le fichier « -1600 » garde alors sa taille d'origine.
Lit data/photos/catalogue.json, retrouve chaque original par son nom (le dossier peut préfixer les noms),
écrit assets/photos/<id>-1600.webp (grand côté 1600 px) et <id>-720.webp (720 px), puis complète le catalogue
(dimensions, aperçu flou de 24 px en data URI pour l'affichage immédiat). Les originaux ne sont pas dans le dépôt.
"""
import base64, io, json, os, sys
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(ROOT, "data/photos/catalogue.json")
OUT = os.path.join(ROOT, "assets/photos")

def main(src, only=None):
    cat = json.load(open(CAT, encoding="utf-8"))
    files = os.listdir(src)
    os.makedirs(OUT, exist_ok=True)
    for p in cat["photos"]:
        if only and p["id"] not in only:
            continue
        match = [f for f in files if f.endswith(p["source"])]
        if not match:
            sys.exit(f"original introuvable : {p['source']}")
        im = Image.open(os.path.join(src, match[0])).convert("RGB")
        p["w"], p["h"] = im.size
        p["orientation"] = "paysage" if im.width > im.height else "portrait"
        for size, q in ((1600, 74), (720, 70)):
            t = im.copy(); t.thumbnail((size, size), Image.LANCZOS)
            t.save(os.path.join(OUT, f"{p['id']}-{size}.webp"), "WEBP", quality=q, method=6)
        tiny = im.copy(); tiny.thumbnail((24, 24), Image.LANCZOS)
        buf = io.BytesIO(); tiny.filter(ImageFilter.GaussianBlur(0.6)).save(buf, "WEBP", quality=50)
        p["lqip"] = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    with open(CAT, "w", encoding="utf-8") as fh:
        json.dump(cat, fh, ensure_ascii=False, indent=2); fh.write("\n")
    n = len(only) if only else len(cat["photos"])
    print(f"{n} photos écrites dans assets/photos")

if __name__ == "__main__":
    args = sys.argv[1:]
    only = None
    if "--seulement" in args:
        i = args.index("--seulement"); only = set(args[i + 1].split(",")); del args[i:i + 2]
    if len(args) != 1: sys.exit(__doc__)
    main(args[0], only)
