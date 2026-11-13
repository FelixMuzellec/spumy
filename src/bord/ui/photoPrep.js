// Préparation des photos, commune au guide et à la page d'analyse claude.ai : image réduite et
// ré-encodée en JPEG (aucune métadonnée ne part), vue moyenne, vignette, date de prise de vue.
import { PHOTO, photoInstant, readExif } from "../engine/photo.js";

async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { /* repli <img> */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = () => ko(new Error("illisible")); img.src = url; });
    return img;
  } finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
}
function draw(src, edge, quality) {
  const w0 = src.width, h0 = src.height, k = Math.min(1, edge / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  cv.getContext("2d").drawImage(src, 0, 0, w, h);
  return { url: cv.toDataURL("image/jpeg", quality), w, h };
}
export async function preparePhoto(file) {
  const head = await file.slice(0, 256 * 1024).arrayBuffer();
  const exif = readExif(head);
  let bmp;
  try { bmp = await decode(file); } catch { throw new Error(`${file.name} : format non lisible par le navigateur (HEIC ? choisis « JPEG » ou « Le plus compatible » dans les réglages de l'appareil photo).`); }
  const big = draw(bmp, PHOTO.longEdge, PHOTO.jpegQuality);
  const view = draw(bmp, 1280, 0.75);
  const thumb = draw(bmp, PHOTO.thumbEdge, 0.6);
  if (bmp.close) bmp.close();
  return { name: file.name, b64: big.url.split(",")[1], w: big.w, h: big.h, view: view.url, thumb: thumb.url, exif, when: photoInstant(exif, file.lastModified) };
}
