#!/usr/bin/env python3
"""Fond de carte du prototype (phase 11) : terres d'OpenStreetMap découpées autour des spots d'un guide.

Usage : python3 scripts/carte-prototype.py <map.geo.json de @geo-maps/earth-lands-10m> [guide=logonna]
Source : @geo-maps/earth-lands-10m v0.6.0 (terres d'OpenStreetMap, erreur absolue 10 m), données ODbL
© contributeurs OpenStreetMap. Le fichier source (135 Mo) n'est pas dans le dépôt.
Sortie : src/prototype/data/carte-<guide>.json — chemin SVG des terres, projection (équirectangulaire corrigée de la
latitude), cadre ; tracé lissé (Chaikin, 2 passes). Aucune bathymétrie : la carte ne montre que ce qui est mesuré (le trait de côte).
"""
import json, math, os, sys
from shapely.geometry import box, shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main(src, guide="logonna"):
    data = json.load(open(os.path.join(ROOT, "src/prototype/data/bord.json"), encoding="utf-8"))
    lats = [s["lat"] for s in data["spots"] if s.get("lat")]; lons = [s["lon"] for s in data["spots"] if s.get("lon")]
    m = 0.05
    W, S, E, N = min(lons) - m * 1.6, min(lats) - m, max(lons) + m * 1.6, max(lats) + m
    clip = box(W, S, E, N)
    geo = json.load(open(src, encoding="utf-8"))
    parts = []
    for g in geo["geometries"]:
        shp = shape(g)
        if not shp.intersects(clip):
            continue
        parts.append(shp.intersection(clip))
    land = unary_union(parts).simplify(0.00025, preserve_topology=True)
    kx = math.cos(math.radians((S + N) / 2))
    VW = 1000.0
    VH = VW * (N - S) / ((E - W) * kx)
    def P(lon, lat):
        return ((lon - W) / (E - W) * VW, (N - lat) / (N - S) * VH)
    def chaikin(pts, n=2):
        # Lissage de Chaikin (anneau fermé) : adoucit les angles du tracé simplifié sans déplacer la côte de plus
        # d'un quart de segment (environ 100 m ici).
        for _ in range(n):
            out = []
            for i in range(len(pts) - 1):
                (x0, y0), (x1, y1) = pts[i], pts[i + 1]
                out += [(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1), (0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)]
            pts = out + [out[0]]
        return pts
    def ring(coords):
        pts = chaikin([P(x, y) for x, y in coords])
        return "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"
    polys = land.geoms if isinstance(land, MultiPolygon) else [land]
    d = "".join(ring(p.exterior.coords) + "".join(ring(i.coords) for i in p.interiors) for p in polys if isinstance(p, Polygon) and p.area > 1e-7)
    out = {
        "guide": guide, "bbox": [round(W, 5), round(S, 5), round(E, 5), round(N, 5)], "viewBox": [0, 0, VW, round(VH, 1)], "kx": round(kx, 6),
        "land": d,
        "attribution": "Trait de côte © contributeurs OpenStreetMap (ODbL), via geo-maps (earth-lands-10m)",
    }
    dest = os.path.join(ROOT, f"src/prototype/data/carte-{guide}.json")
    json.dump(out, open(dest, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"{dest} : {len(d) / 1024:.0f} Ko de tracé, cadre {out['bbox']}")

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    main(*sys.argv[1:])
