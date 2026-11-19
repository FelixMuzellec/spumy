# Direction artistique de SPUMY

Phase 11 du prompt maître · novembre 2026 · statut : **VALIDATED** (« APPROVED — PROCEED TO PHASE 12 », 19 novembre 2026) ; appliquée à l'application en phase 12 (v10), avec les logos de Félix.

Ce document fixe l'identité visuelle et l'interface de SPUMY, pour le mode **BORD** (pêcheur sur le rivage) et le mode **BATEAU** (sortie en mer). Il s'appuie sur la maquette de référence fournie par Félix et sur ses photos. Il est accompagné d'un **prototype interactif** (`prototype/`, 23 écrans) et de quatre planches (système, BORD face à BATEAU, avant / après, conformité).

> Le prototype est une **maquette**, pas l'application. Les écrans BORD montrent une journée réelle (16 mai 2026, Logonna-Daoulas, archive Open-Meteo AROME passée au moteur v2). Les écrans BATEAU montrent des **données d'exemple** (bateau, zones, sorties inventés, marqués « exemple ») : le moteur BATEAU est la phase 10, mise de côté. L'application publiée n'est pas modifiée par cette phase.

## 1. Sources

| Source | Ce que c'est | Usage |
|---|---|---|
| `SPUMY_Fishing_App_UI_Showcase.png` (1536 × 1024) | Maquette de référence de Félix : huit écrans de téléphone (Décision, Carte, Fiche, Comparaison, Stratégie, Matériel, Journal, Terrain) | Analysée ci-dessous ; recadrages dans `docs/reference/ref-*.webp` |
| 39 images Gemini | Photos générées, fournies par Félix (38 distinctes) | 32 retenues, 6 écartées avec leur raison (`data/photos/catalogue.json`) |
| Application v9.2 | L'application actuelle | Captures « avant » (`docs/reference/avant-*.webp`, `scripts/avant-prototype.mjs`) |
| 3 logos de Félix (19 novembre 2026) | SPUMY (bar en S dans un disque orange, nom en capitales), Inshore (pêcheur sur la roche), Offshore (bateau de pêche) | Marque de l'application, du site et du prototype (§ 5 bis) |

Consigne de Félix (19 novembre 2026) : « I am impatient how you will stunningly improve the UX including the pictures I sent you. »
Décision déjà actée (continuité) : les photos fournies sont **ambiance et illustration seulement, jamais présentées comme la photo réelle d'un spot ou d'une prise**.

## 2. Analyse de la référence

Les couleurs ont été mesurées sur les pixels de l'image (PNG, valeurs arrondies par pas de 8 : la compression et l'anticrénelage déplacent un peu les teintes). Le reste distingue ce qu'on voit (VÉRIFIÉ, observable) de ce qu'on en déduit (INFÉRÉ).

| Élément | Observé (VÉRIFIÉ) | Interprétation (INFÉRÉ) | Dans SPUMY |
|---|---|---|---|
| Fond | Bleu nuit très sombre, dominant (#001020 ≈ 19 % des pixels, puis #001030, #002030) | Ambiance « mer de nuit », premium | `--bg-0` #040b16, `--bg-1` #071427, `--bg-2` #0b1d35 |
| Action | Cyan lumineux (#00d0f8 à #00e0f8) en dégradé sur les boutons principaux, onglet actif souligné | Une seule couleur d'action, très visible | `--accent` #1fd2f5 → `--accent-2` #2a9df4 (bouton), `--accent-ink` #7ee7ff (texte) |
| « Recommandé », pastille positive | Vert vif (#38e858, #10c050) | Statut positif | `--good` #35e07c, `--good-deep` #0b6b37 (fond de puce, 6,3:1 avec son texte) |
| « À surveiller », « Astuce », « Notre conseil » | Ambre et or (#f0c008, #f8d050) | Attention, conseil | `--warn` #ffc53d, `--gold` #ffcf4d |
| Texte | Blanc (#f8f8f8) et bleu-gris (#607898 à #7088a8) | Deux niveaux de texte | `--text-1` #f3f8fc, `--text-3` #93a8c0 (éclairci : #6880a0 ne donne que 3,8:1 sur une carte #11253f, sous le seuil WCAG de 4,5:1) |
| Anneaux de score | Trois anneaux ouverts en dégradé (vert-cyan, cyan-bleu, violet #d058f0) | Trois mesures distinctes | Trois dégradés : favorabilité aqua → cyan, pertinence cyan → bleu, confiance violet → indigo |
| Typographie | Linéale condensée grasse pour titres, chiffres et onglets ; chiffres très gros ; « /100 » en petit | Famille proche de Roboto Condensed | Roboto Condensed (titres, chiffres, libellés), Roboto (textes longs), auto-hébergées |
| Composition | Grande photo en tête, carte vitrée qui chevauche la photo, une action principale, trois niveaux (Vue rapide, Détails, Expert) | Décider vite, détailler à la demande | Repris tel quel ; niveaux sur la fiche du spot, la stratégie et la technique BATEAU |
| Composants | Cartes vitrées à vignette, contrôle segmenté, tuiles d'accès, barres de facteurs, barre du bas à cinq entrées | Système cohérent | 22 composants React (`src/design/ds/ui.jsx`) et leurs classes `s-*` |
| Formes, rayons, bordures | Coins nettement arrondis sur les cartes, boutons en pilule, liserés fins plus clairs autour des cartes | Rayons de l'ordre de 12 à 20 px à l'échelle d'un téléphone (estimés, pas mesurés) | Rayons 12, 16, 20 et 28 px, pilule ; bordure 1 px translucide |
| Espacements, densité | Blocs aérés, une idée par carte, marges régulières | Pas régulier, densité moyenne | Pas de 4 px, marge latérale de 16 px |
| Effets | Surfaces translucides sur fond sombre, halo cyan autour des éléments actifs, photo qui se fond dans le fond | Effet « verre » (flou d'arrière-plan) | Surfaces vitrées (flou 14 px), halo de l'accent, fondu des photos de tête |
| Animations | Non observable (image fixe) | — | Transitions courtes, coupées si l'appareil demande moins de mouvement |
| Icônes | Pictos au trait, arrondis | Un seul jeu | Lucide (licence ISC, 96 icônes) + 8 pictogrammes SPUMY dans le même trait |
| Photos | Spots photographiés (phare, crique), vignettes de prises dans le journal, leurres photographiés avec étoiles | Images d'illustration générées | Voir les écarts voulus (§ 7) |

## 3. Principes

1. **Décider en trois secondes.** Le premier écran dit s'il faut y aller, où, quand ; le reste est à un geste.
2. **Une action principale par écran** (bouton cyan) ; les autres actions sont secondaires ou dans les tuiles.
3. **La photo donne l'ambiance, jamais la preuve.** Elle suit la lumière, le ciel, la mer et le type de lieu du moment ; elle porte toujours la marque « Illustration ».
4. **La sécurité ne se compense pas.** Un « non recommandé » ou un « à vérifier » passe avant toute note ; l'inconnu n'est jamais vert.
5. **Trois scores, jamais fusionnés.** Favorabilité, pertinence, confiance : trois anneaux, trois couleurs, trois décompositions.
6. **Deux modes, une famille.** BORD et BATEAU partagent le système ; ils se distinguent par leur pictogramme, leurs photos (rivage contre bateau) et ce qui passe en premier (le meilleur spot ; la sécurité de la sortie).
7. **Dehors, au soleil, avec des gants.** Thème Plein soleil, cibles tactiles de 44 px (52 px pour l'action principale), texte lisible à 320 px de large.

## 4. Système de design

Fichiers : `src/design/ds/tokens.css` (jetons), `components.css` (composants), `ui.jsx` (composants React), `lucide.js` et `glyphs.js` (icônes), `ambiance.js` (choix des photos), `illustrations.js` (couleurs des dessins). Planche : écran « Système de design » du prototype.

**Thèmes.** Nuit marine (défaut, tiré de la référence) et Plein soleil (fond clair, encre presque noire, cyan assombri à #087a9e pour garder 4,5:1 sur blanc). Le choix est gardé sur l'appareil.

**Contrastes mesurés (Nuit marine, `tests/design.mjs`, 41/41 contrôles WCAG dans les deux thèmes)** : texte principal 14,4:1 sur une carte, texte secondaire 6,3:1, cyan de texte 10,9:1, bouton principal 9,2:1, chiffres des pastilles 4,9:1 à 11,6:1.

**Favorabilité.** Cinq paliers de bleu (spécification v2, bornes 75, 65, 55, 45), du plus clair (très favorable) au plus foncé. Jamais d'ambre ni de rouge : ces couleurs sont réservées à la sécurité. L'orange de la marque (#d9772f, logos) ne porte jamais un statut. « À vérifier » : ambre, contour pointillé et « ? ». « Non recommandé » : gris barré. La forme porte le sens autant que la couleur.

**Typographie.** Roboto Condensed (police variable, graisses 100 à 900) pour les titres, les chiffres (tabulaires) et les libellés ; Roboto pour les textes. Échelle : 11, 12, 13, 15, 17, 18, 22, 30 et 40 px ; chiffres 34 et 64 px.

**Espacements, rayons, ombres, mouvement.** Pas de 4 px ; rayons 8 / 12 / 16 / 20 / 28 px et pilule ; deux élévations ; transitions de 120 à 340 ms, coupées si l'appareil demande moins de mouvement.

**Composants** (préfixe `s-`) : barre de titre, logo, boutons (principal, secondaire, discret, positif), bouton icône, puces, cartes, encadrés, tuiles, statistiques, contrôle segmenté, barre du bas, photo d'ambiance, anneau et triplet de scores, pastille, barre de facteur, raisons, bandeaux (hors ligne, données anciennes, erreur), squelettes, feuille, frise, message bref.

**États** (planche « États ») : chargement, données absentes, erreur, données anciennes, hors ligne, permission refusée, résultat vide, action réussie ou impossible.

## 5. Photos

- **Catalogue** : `data/photos/catalogue.json`, 32 photos décrites (sujet, lumière, ciel, mer, lieu, espèce, « reconnaissable », point d'intérêt, LQIP). 6 écartées : une montre une fausse interface SPUMY, trois sont des quasi-doublons, une est redondante, une montre du surfcasting à deux cannes (pas la pêche aux leurres).
- **Chaîne** : `python3 scripts/photos.py <dossier>` produit des WebP 1600 et 720 px (qualité 74 et 70) et une miniature floue pour l'affichage progressif.
- **Choix** (`ambiance.js`) : la photo suit d'abord la lumière du créneau (même lumière +10, aube et crépuscule voisins +7, nuit contre jour pénalisée), puis le ciel, la mer et le type de lieu ; le résultat est déterministe (même contexte, même photo).
- **Honnêteté** : une image reconnaissable (phare, port, granit, abbaye) ne va jamais sur la fiche d'un spot nommé ; une photo de poisson ne sert qu'aux fiches d'espèce, jamais au journal comme « ta prise » ; chaque photo porte « Illustration ».

## 5 bis. Logos et marque (phase 12)

- **Logos de Félix** (`assets/brand/sources/`) : SPUMY, Inshore, Offshore. Bleu marine (#14283c), orange (#d9772f), crème (#efe7d8).
- **Déclinaisons** (`python3 scripts/logos.py`, dessin intact) :
    - fond crème rendu transparent (« clair ») ;
    - bleu marine passé en crème pour les fonds sombres (« sombre »), le dessin du disque orange restant tel quel ;
    - icônes de l'application : la marque sur un carré crème.
- **Usage** :
    - accueil : grand logo, et choix Inshore / Offshore avec leurs logos sur un badge crème ;
    - en-tête des guides et icônes du téléphone : la marque ;
    - prototype : la marque dans le logo, et les logos de mode sur les cartes de l'accueil et la planche BORD / BATEAU.
- **Petites tailles** : en dessous d'environ 32 px, les pictogrammes au trait (modes BORD et BATEAU) remplacent les logos, dont les détails ne se lisent plus.
- **Noms des modes** : **Inshore** (du bord) et **Offshore** (en bateau), comme les nomme Félix ; BORD et BATEAU restent les noms techniques.
- **Orange** : identité seulement (logos, accroche de l'accueil), jamais une alerte.

## 6. Navigation et architecture de l'information

- **Accueil** : choix du mode (deux grandes cartes photo avec leur pictogramme), meilleur spot du jour, guides par département.
- **BORD** — barre du bas : Décision, Carte, Journal, Matériel, Plus. Parcours principal : Décision → fiche du spot (Vue rapide, Détails, Expert) → stratégie → matériel. Comparaison et mode terrain depuis les tuiles.
- **BATEAU** — barre du bas : Sortie, Zones, Espèces, Sorties, Bateau. Parcours principal : Sortir aujourd'hui ? → sécurité de la sortie → zone → espèce → technique.
- **Trois niveaux** partout où il y a du détail : Vue rapide (ce qu'il faut faire), Détails (pourquoi, créneaux, marée), Expert (décomposition des scores, sources).

## 7. Écarts voulus à la référence

| Référence | SPUMY | Raison |
|---|---|---|
| Pastilles de carte vertes, jaunes, orange | Cinq bleus | Spécification v2 ; l'orange et le rouge sont réservés à la sécurité |
| Photo réelle du spot (phare du Minou) | Photo d'ambiance choisie par la lumière, marquée « Illustration », jamais reconnaissable sur un spot nommé | Les photos sont générées : les présenter comme un lieu réel serait faux |
| Vignettes de prises dans le journal | Vignette de moment (aube, jour, coucher) | Aucune photo de prise n'existe ; le journal n'en garde pas encore |
| Leurres photographiés, notes en étoiles | Leurres dessinés (robe d'après le coloris de ta boîte), puce « Conseillé » | Aucune note de leurre n'est mesurée ; pas de photo de produit sous licence |
| Carte bathymétrique colorée | Trait de côte OpenStreetMap sur fond nuit, sans profondeurs | Pas de données de profondeur sourcées dans le projet |
| « Engagé », « 92/100 » seuls | Trois scores séparés, et la raison d'un « non recommandé » | Règle du prompt maître : jamais de fusion, jamais de vert sans tout savoir |

## 8. Accessibilité

- Contrastes : 41/41 (`npm run test:design`).
- Prototype : 23 écrans × 390 et 320 px × deux thèmes, rendu, pas de défilement horizontal, aucune erreur de console, interactions principales, axe-core sans violation : 244/244 (`npm run test:prototype`).
- Cibles tactiles 44 px, action principale 52 px ; focus visible ; pastilles et cellules nommées pour les lecteurs d'écran ; tableaux horaires défilables au clavier.

## 9. Reproduire

```sh
npm run build:prototype            # prototype/ (index.html, app.js, app.css, polices)
npm run test:design                # contrastes des jetons
npm run test:prototype             # construit puis parcourt les 23 écrans (axe compris)
node scripts/prototype-data.mjs    # journée BORD du prototype (moteur v2, archive)
python3 scripts/carte-prototype.py <earth-lands-10m map.geo.json> logonna   # trait de côte
node scripts/avant-prototype.mjs   # captures « avant » de l'application v9.2
```

## 10. Ce qui reste à décider

La direction artistique elle-même (validation de Félix), le dessin du logo, l'origine et la licence des photos générées pour une publication, et l'application de ce système à l'application réelle (phase 13, décision ouverte n° 5). Voir `SPUMY_AUDIT_CONTINUITY.md`.
