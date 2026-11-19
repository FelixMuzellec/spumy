// Pictogrammes propres à SPUMY (phase 11), dessinés sur la grille de Lucide (24 px, trait 2, bouts ronds) pour
// rester du même style. Même format que lucide.js : [balise, attributs].
//
// Les deux pictogrammes de mode (§5.5 du prompt maître) : BORD = un pêcheur debout sur la roche, canne pliée, ligne
// dans les vagues ; BATEAU = une coque de pêche avec sa cabine et une canne à l'arrière. Silhouettes différentes à
// toutes les tailles (personnage contre coque).
export const GLYPHS = {
  "mode-bord": [
    ["circle", { cx: "6.6", cy: "4.6", r: "1.7" }],
    ["path", { d: "M6.6 6.6 7.4 12" }],
    ["path", { d: "M7.4 12 5.4 16.6" }],
    ["path", { d: "M7.4 12l2.4 4.4" }],
    ["path", { d: "M6.9 8.4 10.6 9.6" }],
    ["path", { d: "M10.6 9.6C13.4 5.6 17 3.4 21.2 3.2" }],
    ["path", { d: "M21.2 3.2v9.4", "stroke-dasharray": "1.4 1.8" }],
    ["path", { d: "M2.2 20.6 4 16.8h7.4l1.4 3.8" }],
    ["path", { d: "M14.6 19.4c1 0 1.3-.9 2.3-.9s1.3.9 2.3.9 1.3-.9 2.3-.9" }],
  ],
  "mode-bateau": [
    ["path", { d: "M2.6 14.4h18.8l-2.6 5H5.4z" }],
    ["path", { d: "M6.2 14.4v-4.2h6.2l2.2 4.2" }],
    ["path", { d: "M8.6 10.2V8" }],
    ["path", { d: "M16.4 14.4 20.8 4" }],
    ["path", { d: "M20.8 4v6.6", "stroke-dasharray": "1.4 1.8" }],
    ["path", { d: "M2 22.2c1.3 0 1.6-.9 2.9-.9s1.6.9 2.9.9 1.6-.9 2.9-.9 1.6.9 2.9.9 1.6-.9 2.9-.9 1.6.9 2.9.9" }],
  ],
  // Leurre (minnow) : corps, bavette, œil, hameçon triple.
  "leurre": [
    ["path", { d: "M3.2 12.4c2.6-3.6 8.8-4.8 13.6-2.8l3.6-1.6-.6 4.2.6 4.2-3.6-1.6c-4.8 1.8-11 .9-13.6-2.4z" }],
    ["path", { d: "M3.2 12.4 1.6 14" }],
    ["circle", { cx: "6.6", cy: "11.6", r: ".9" }],
    ["path", { d: "M10.6 15.4v2.4a1.5 1.5 0 0 0 3 0v-.6" }],
  ],
  // Jig : lame métallique et assist.
  "jig": [
    ["path", { d: "M5 18.6 16.6 7a3 3 0 0 1 4.2 4.2L9.2 22.8z" }],
    ["path", { d: "M18.8 5.2 21 3" }],
    ["path", { d: "M21 3c-.8 2.2-.2 3.6 1.2 4.4" }],
  ],
  // Marée montante / descendante : vague et flèche.
  "maree-montante": [
    ["path", { d: "M2.6 17.6c1.5 0 1.8-1.1 3.3-1.1s1.8 1.1 3.3 1.1 1.8-1.1 3.3-1.1 1.8 1.1 3.3 1.1 1.8-1.1 3.3-1.1 1.8 1.1 3.3 1.1" }],
    ["path", { d: "M12 13V4.2" }],
    ["path", { d: "m8.4 7.6 3.6-3.6 3.6 3.6" }],
  ],
  "maree-descendante": [
    ["path", { d: "M2.6 17.6c1.5 0 1.8-1.1 3.3-1.1s1.8 1.1 3.3 1.1 1.8-1.1 3.3-1.1 1.8 1.1 3.3 1.1 1.8-1.1 3.3-1.1 1.8 1.1 3.3 1.1" }],
    ["path", { d: "M12 4.2V13" }],
    ["path", { d: "m8.4 9.6 3.6 3.6 3.6-3.6" }],
  ],
  // Gilet (aide à la flottabilité).
  "gilet": [
    ["path", { d: "M8 3.4 5 5.2v14.6a1.2 1.2 0 0 0 1.2 1.2H11V9.6L8 3.4z" }],
    ["path", { d: "M16 3.4 19 5.2v14.6a1.2 1.2 0 0 1-1.2 1.2H13V9.6l3-6.2z" }],
    ["path", { d: "M5 13h6M13 13h6" }],
  ],
  // Houle : grande vague qui déferle.
  "houle": [
    ["path", { d: "M2.4 17.4c3.4 0 4.6-9.8 10.6-9.8 3.2 0 5 2.4 5 4.6 0 1.6-1.2 2.8-2.8 2.8-1.2 0-2.2-.9-2.2-2.1" }],
    ["path", { d: "M2.4 21.4c1.5 0 1.8-1.1 3.3-1.1s1.8 1.1 3.3 1.1 1.8-1.1 3.3-1.1 1.8 1.1 3.3 1.1 1.8-1.1 3.3-1.1 1.8 1.1 3.3 1.1" }],
  ],
};
