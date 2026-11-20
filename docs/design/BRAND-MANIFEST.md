# Manifeste de marque — logos SPUMY

Phase 3 V3, 20 novembre 2026. Référentiel § 6.1 et § 6.2.1 ; décision de Félix ADR-V3-002 (logo BRAND repris, Inshore et Offshore facultatifs).

## 1. Fichiers maîtres

Emplacement canonique : `assets/brand/sources/`, établi par l'audit. Les fichiers ne sont pas recopiés dans `docs/design-reference/brand/logos/`, pour ne pas créer de doublon ; le référentiel admet un emplacement canonique choisi après audit. Ces fichiers sont **en lecture seule** : aucun script ne les écrit.

| Fichier | Rôle | SHA-256 (début) | Format | Dimensions | Profil | Transparence | Fond | Provenance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `spumy.jpg` | **BRAND** : symbole (disque orange, poisson) et mot SPUMY | d4357a758ad601fe | JPEG, RVB 8 bits | 2 048 × 2 048 | aucun profil ICC (sRVB supposé) | non | crème #E9E2D2 | envoyé par Félix le 19 nov. 2026 à 23 h 11, identique octet pour octet |
| `inshore.jpg` | **INSHORE** (BORD) : pêcheur sur la roche | 8d6facc8937ecde3 | idem | idem | idem | non | #E9DCC9 | idem |
| `offshore.jpg` | **OFFSHORE** (BATEAU) : bateau | 2d929f408c687728 | idem | idem | idem | non | #E7DCC6 | idem |

Les rôles sont attribués d'après le contenu de chaque image, vu et vérifié, et non d'après le nom des fichiers. Aucun fichier vectoriel n'existe, et aucun n'est fabriqué : un PNG n'est jamais présenté comme vectoriel.

## 2. Invariants du logo BRAND (mesurés)

- **Aplat orange du disque** : **#C76A31**, soit `brand-logo-orange`.
    - Mesure : moyenne des pixels de l'aplat (138 000 pixels environ) ; écart type d'environ 2 par canal ; même valeur en médiane, en moyenne et en mode.
    - La mesure est faite sur un JPEG ; un original sans perte, s'il existe, fera foi.
    - Ce n'est pas #F07824, l'orange d'accent de l'interface (`accent-orange`). Les deux jetons restent distincts.
- **Poisson** (`brand-fish-mark`) : dessin, couleurs et gravure de la source, sans aucun traitement. Il dépasse du disque :
    - nageoires et queue jusqu'à 358,7 px du centre ;
    - disque de 302,75 px de rayon, centré en (1 023,5 ; 902) sur la source.
- **Zone protégée testée** : tout pixel à 361 px du centre ou moins, au-dessus des lettres (ligne 1 245). Elle contient toute l'encre du symbole (vérifié par le test).

## 3. Exports V3 (`assets/brand/v3/`, générés par `scripts/logos-v3.py`)

Le **médaillon** est un recadrage circulaire de la source, de 372 px de rayon. Il garde, sans aucune modification, l'aplat orange, le poisson et le fond crème qui les entoure.
- Sur un fond sombre, c'est ce fond crème d'origine qui fait ressortir le poisson : on adapte le fond extérieur, jamais le symbole (§ 6.1.3).
- Le mot SPUMY n'est pas dans le médaillon. L'interface le compose en texte, dans la typographie de la marque : c'est un élément adaptable (§ 6.1.2).

| Export | Taille | Opération | Usage |
| --- | --- | --- | --- |
| `spumy-medaillon-744.png` | 744 px, taille native | recadrage et masque circulaire ; les hauts de lettres entrés dans le cercle reçoivent la couleur du fond, hors zone protégée | référence dérivée ; grands formats |
| `spumy-medaillon-512.png`, `-256.png`, `-256.webp`, `-128.png`, `-64.png` | 512 à 64 px | réduction proportionnelle (Lanczos) du médaillon | en-têtes, écran de lancement, accueil |
| `spumy-logo-960.webp`, `spumy-logo-480.png` | 960, 480 px de large | **logo complet d'origine** (symbole et mot SPUMY) : recadrage de la source autour de l'encre (424–1624 × 518–1521), puis réduction proportionnelle ; aucune retouche | écran de lancement, à propos |
| `icon-512.png`, `icon-192.png` | 512, 192 px | **version 2** (20 nov., après le retour de Félix) : carré de la source centré sur le symbole, sur son fond crème d'origine, plein cadre (le symbole occupe 82 % du côté) | icônes de l'application installée |
| `icon-maskable-512.png` | 512 px | même carré, symbole à 72 % : il tient dans la zone sûre de 80 % | icône adaptative (Android) |
| `apple-touch-icon-180.png` | 180 px | même carré, symbole à 80 % | iOS |
| `favicon-32.png` | 32 px | même carré, symbole à 94 % | onglet du navigateur (silhouette seulement à cette taille) |

**Preuve de conservation** (`python3 tests/brand.py`, 29/29, code de sortie 0) :
1. Le médaillon natif est identique à la source, pixel pour pixel, dans toute la zone protégée, qui y est entièrement opaque.
2. Chaque export réduit garde l'orange à ±2 par canal, et la silhouette du poisson à 97 % au moins (comparée à la source réduite de la même façon).
3. Aucun pixel sombre du poisson ne devient clair.
4. **Contrôle négatif** : une recoloration de type V2 (marine → crème hors du disque) est bien détectée par le test.

Le test se lance à la main ; son branchement dans l'intégration continue (Python et Pillow) est prévu en Phase 4.

## 4. Exports V2 (à retirer de l'application)

| Fichiers | Statut |
| --- | --- |
| `assets/brand/spumy-logo-sombre.png`, `spumy-marque-sombre.png`, `web/spumy-logo-sombre.webp` (= `logo-spumy.webp`, en ligne sur l'accueil) | **Non conformes** (défaut A01 : pointe de la queue du poisson recolorée en crème). Gardés tant que l'application les utilise ; remplacés par le médaillon V3 à l'intégration (Phases 10 à 12) |
| `spumy-*-clair.*` | Conformes au poisson, mais un liseré apparaît au bord du disque (détourage par couleur). Remplacés par le médaillon |
| `icon-192.png`, `icon-512.png`, `icon-maskable.png` (racine) | Dérivés V2, à vérifier puis remplacer par les icônes V3 |
| `inshore-*`, `offshore-*` | Liés aux logos facultatifs (section 5) |

Aucun fichier n'est supprimé dans cette phase : l'application en ligne s'en sert encore.

## 5. Logos INSHORE et OFFSHORE (facultatifs)

Félix les rend facultatifs (ADR-V3-002). Proposition de la Phase 3, à valider avec les prototypes :
- l'identité des modes passe d'abord par la bascule BORD / BATEAU (libellé, pictogramme fonctionnel, couleur de repère) ;
- les deux logos peuvent illustrer l'écran d'entrée de chaque mode, à 96 px au moins sur leur fond crème d'origine ;
- ils ne sont jamais affichés dans la barre de navigation ni sur les cartes de recommandation ;
- leurs éléments ne sont pas protégés par les invariants du logo BRAND (§ 6.1.1).

## 6. Matrice des usages

| Fichier | Rôle | Écran ou contexte | Taille minimale | Fond compatible | Règles |
| --- | --- | --- | --- | --- | --- |
| Médaillon BRAND | marque | écran de lancement, en-tête de Décision, Profil (à propos), écran d'erreur générale | 40 px dans l'interface ; 32 px pour le favicon | tous : son fond crème le détache du marine comme du blanc cassé | proportions conservées ; marge de 8 % ; ni recadrage dans le cercle, ni ombre, ni filtre, ni transparence, ni effet ; jamais sur une photo sans fond uni |
| Mot SPUMY (texte) | marque | à côté du médaillon | 16 px | marine : crème #F3F1EB ; clair : marine #172B3A | typographie de la marque ; écrit `SPUMY` ; jamais de slogan à côté |
| Logo complet d'origine | marque | écran de lancement (fond crème d'origine, plein écran, 1,5 s), Profil (à propos) | 240 px de large | crème d'origine #E9E2D2 seulement | jamais sur une photo ni sur le marine ; aucun slogan |
| Médaillon et mot SPUMY | marque | en-tête de tous les écrans : médaillon de 44 px, mot SPUMY en Montserrat 800, interlettrage 0,16 em | 44 px | marine, ardoise | le mot est du texte, jamais une image recolorée |
| Icônes V3 | application installée | icône d'écran d'accueil, favicon | — | crème d'origine | produites par le script seulement |
| INSHORE, OFFSHORE | modes (facultatif) | écran d'entrée de mode, au choix | 96 px | leur fond d'origine | jamais dans la navigation ni sur les cartes |
