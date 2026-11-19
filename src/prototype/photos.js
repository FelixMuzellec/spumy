// Catalogue des photos d'ambiance pour le prototype : chaque photo reçoit son adresse publiée.
import catalogue from "../../data/photos/catalogue.json";
import { pickPhoto } from "../design/ds/ambiance.js";

/* global PHOTO_BASE */
// Dossier des photos : « ../assets/photos/ » pour le prototype publié avec le site, « photos/ » dans la page de revue.
const BASE = typeof PHOTO_BASE === "string" ? PHOTO_BASE : "photos/";
export const PHOTOS = catalogue.photos.map((p) => ({ ...p, src: (size = 1600) => `${BASE}${p.id}-${size >= 1000 ? 1600 : 720}.webp` }));
export const PHOTO = Object.fromEntries(PHOTOS.map((p) => [p.id, p]));
export const CATALOGUE = catalogue;
export const photoFor = (ctx) => pickPhoto(PHOTOS, ctx);
