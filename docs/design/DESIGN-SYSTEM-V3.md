# Design System V3 — jetons, composants, états, contenus

Phase 3 V3, 20 novembre 2026. Référentiel § 6.2, § 6.7.5, § 6.8, § 6.10, § 6.11.

**Statut d'ensemble : PROPOSITION À TESTER.** Les jetons seront figés seulement après le jalon 2 (direction visuelle, principes du Design System et prototypes structurants), sur le prototype interactif, dans les deux modes et les deux thèmes.

## 0. Fichiers

| Fichier | Rôle |
| --- | --- |
| `src/design/v3/tokens.js` | **source unique** des jetons, avec types JSDoc et fonctions de palier : `displayValue`, `tierOf`, `gaugeWidth`, `favorabilityLabel`, `confidenceLabel` |
| `scripts/tokens-v3.mjs` | génère `src/design/v3/tokens.css` (`--check` : échoue s'il n'est pas à jour) |
| `src/design/v3/tokens.css` | variables CSS. Fichier généré : ne pas le modifier à la main |
| `tests/design-v3.mjs` | palette, marque protégée, absence de cyan, bornes des paliers, libellés de la fixture, contrastes WCAG des deux thèmes, fichier CSS à jour. Écrit `docs/design/contrastes-v3.json` |

Les jetons V2 (`src/design/ds/tokens.css`) restent en place tant que l'application en ligne s'en sert. Ils seront remplacés à l'intégration (Phases 10 à 12) : cyan structurant, trois anneaux de score et paliers bleus ne sont plus conformes.

## 1. Statuts des jetons

| Statut | Contenu | Qui peut le changer |
| --- | --- | --- |
| **PROTÉGÉ** | `brand-logo-orange` #C76A31 (mesuré sur la source BRAND) ; `brand-fish-mark` (exports du médaillon) | personne : aucun thème, filtre, transparence ni recoloration |
| **APPROUVÉ** | palette principale : `accent-orange` #F07824, marine #172B3A, ardoise #344B5A, blanc cassé #F3F1EB (§ 6.2) | Félix |
| **RÈGLE** | seuils des 6 paliers (0–19, 20–39, 40–59, 60–74, 75–89, 90–100) et leurs familles de teintes (§ 6.7.5.1) | Félix, par validation explicite |
| **PROPOSITION À TESTER** | valeurs exactes des paliers, couleurs fonctionnelles, neutres dérivés, typographie, espacements, rayons, élévations, mouvement | jalon 2, puis tests |
| **DÉCIDÉ** | seuil du filtre « Favorables » : 75 (§ 3.4, V3-021) | Félix |
| **À DÉCIDER** | police du mot SPUMY (§ 4) | Félix |

## 2. Couleurs

### 2.1 Principes

- **Marine** : couleur sombre structurante (navigation, fonds sombres, en-têtes). **Ardoise** : cartes et panneaux du thème sombre. **Blanc cassé** : fond de lecture du thème clair.
- **Orange d'accent** : action principale, repère actif, marque ; avec parcimonie. Il n'est jamais écrit en texte sur fond clair (2,5:1) ni en petit texte sur l'ardoise (3,2:1). Sur fond clair, il sert de **remplissage**, avec un texte marine (5,1:1).
- **Orange du logo** (#C76A31) : n'apparaît que dans le logo, jamais comme couleur d'interface.
- **Aucun cyan ni turquoise** : le test refuse toute teinte de 160 à 200° saturée à plus de 35 % dans les thèmes et les paliers.
- **Couleurs fonctionnelles** (succès, avertissement, danger, information) : jetons distincts. Elles sont toujours accompagnées d'un pictogramme et d'un mot, jamais de la couleur seule. L'avertissement est un ambre, distinct de l'orange d'accent ; l'information est neutre (ardoise).
- **Couleurs des scores** : gouvernées par les paliers (§ 3) seulement. Elles ne disent ni succès, ni sécurité, ni qualité des données.
- **Texte** : toujours dans les jetons de texte, jamais dans la couleur d'un palier. Le chiffre « 72/100 » est écrit en `text-primary` ; la jauge à côté porte la couleur.

### 2.2 Thèmes

Deux thèmes : clair (plein jour, défaut sans préférence du système) et sombre (nuit marine). L'application suit le système ; Profil, Réglages permet d'imposer l'un ou l'autre. Les mêmes jetons sémantiques existent dans les deux thèmes.

| Jeton | Clair | Sombre | Usage |
| --- | --- | --- | --- |
| `bg-app` | #F3F1EB (approuvé) | #172B3A (approuvé) | fond de l'application |
| `surface-card` | #FBFAF7 | #344B5A (approuvé) | cartes, panneaux, feuilles |
| `surface-sunken` | #E9E5DC | #203545 | champs, zones repliées |
| `surface-inverse` | #172B3A | #0F1E29 | barre de navigation, en-têtes forts |
| `text-primary` | #172B3A | #F3F1EB | titres, chiffres, texte courant |
| `text-secondary` | #344B5A | #D5DADD | texte d'appui |
| `text-muted` | #56656F | #B4BEC4 | unités, sources, aides |
| `text-on-accent` | #172B3A | #172B3A | texte sur remplissage orange |
| `border`, `border-strong` | #D3CEC3, #7A848B | #4C6372, #8597A3 | séparateurs ; contours de champs et de boutons secondaires (3:1) |
| `accent` | #F07824 | #F07824 | remplissage d'action, repère actif |
| `accent-ink` | #172B3A | #F07824 | liens, icônes actives (clair : marine ; sombre : orange, sur le marine) |
| `focus-ring` | #172B3A | #F07824 | anneau de focus, 2 px, décalé de 2 px |
| `gauge-track`, `gauge-index` | #DDD8CE, #172B3A | #1E3342, #F3F1EB | piste et repère de valeur des jauges |
| `success-ink` / `-soft` | #2F6B45 / #E1ECE2 | #9BD3AC / #2C4A3C | succès, confirmation |
| `warning-ink` / `-soft` | #7F5300 / #F5E7C4 | #F2C772 / #4B3F22 | « À vérifier », prudence |
| `danger-ink` / `-soft` | #A12C26 / #F5DDD9 | #F3A79E / #4F2E2E | danger, non recommandé, erreur |
| `info-ink` / `-soft` | #344B5A / #E2E6E8 | #CBD5DB / #2B4353 | information neutre |
| `marker-ring-inner`, `-outer` | #F3F1EB, #172B3A | idem | anneau double des pastilles de carte |

### 2.3 Contrastes calculés (WCAG 2.2)

Ratios calculés par `tests/design-v3.mjs`, à partir des luminances relatives WCAG. Seuils : 4,5:1 pour le texte courant ; 3:1 pour le grand texte, les icônes, les contours et les repères (critère 1.4.11). Toutes les associations déclarées passent (168 contrôles sur 168, seuil « Favorables » compris). Ce sont des calculs sur des couleurs pleines : la lisibilité en plein soleil reste à observer sur le prototype, sur un vrai téléphone.

**Thème clair**

| Usage | Premier plan | Fond | Rapport | Seuil |
| --- | --- | --- | ---: | ---: |
| texte principal sur le fond | `textPrimary` #172B3A | `bgApp` #F3F1EB | 12,88:1 | 4,50:1 |
| texte principal sur carte | `textPrimary` #172B3A | `surfaceCard` #FBFAF7 | 13,94:1 | 4,50:1 |
| texte dans un champ | `textPrimary` #172B3A | `surfaceSunken` #E9E5DC | 11,58:1 | 4,50:1 |
| texte secondaire sur le fond | `textSecondary` #344B5A | `bgApp` #F3F1EB | 8,08:1 | 4,50:1 |
| texte secondaire sur carte | `textSecondary` #344B5A | `surfaceCard` #FBFAF7 | 8,75:1 | 4,50:1 |
| texte discret sur le fond | `textMuted` #56656F | `bgApp` #F3F1EB | 5,33:1 | 4,50:1 |
| texte discret sur carte | `textMuted` #56656F | `surfaceCard` #FBFAF7 | 5,77:1 | 4,50:1 |
| aide de champ | `textMuted` #56656F | `surfaceSunken` #E9E5DC | 4,79:1 | 4,50:1 |
| navigation : libellés | `textOnInverse` #F3F1EB | `surfaceInverse` #172B3A | 12,88:1 | 4,50:1 |
| navigation : repère actif orange | `accent` #F07824 | `surfaceInverse` #172B3A | 5,14:1 | 3,00:1 |
| bouton principal : texte marine sur orange | `textOnAccent` #172B3A | `accent` #F07824 | 5,14:1 | 4,50:1 |
| lien et icône active sur carte | `accentInk` #172B3A | `surfaceCard` #FBFAF7 | 13,94:1 | 4,50:1 |
| lien sur le fond | `accentInk` #172B3A | `bgApp` #F3F1EB | 12,88:1 | 4,50:1 |
| anneau de focus sur le fond | `focusRing` #172B3A | `bgApp` #F3F1EB | 12,88:1 | 3,00:1 |
| anneau de focus sur carte | `focusRing` #172B3A | `surfaceCard` #FBFAF7 | 13,94:1 | 3,00:1 |
| contour de champ et de bouton secondaire | `borderStrong` #7A848B | `surfaceCard` #FBFAF7 | 3,66:1 | 3,00:1 |
| contour sur le fond | `borderStrong` #7A848B | `bgApp` #F3F1EB | 3,38:1 | 3,00:1 |
| succès sur sa pastille | `successInk` #2F6B45 | `successSoft` #E1ECE2 | 5,23:1 | 4,50:1 |
| succès sur carte | `successInk` #2F6B45 | `surfaceCard` #FBFAF7 | 6,08:1 | 4,50:1 |
| avertissement sur sa pastille | `warningInk` #7F5300 | `warningSoft` #F5E7C4 | 5,45:1 | 4,50:1 |
| avertissement sur carte | `warningInk` #7F5300 | `surfaceCard` #FBFAF7 | 6,41:1 | 4,50:1 |
| danger sur sa pastille | `dangerInk` #A12C26 | `dangerSoft` #F5DDD9 | 5,59:1 | 4,50:1 |
| danger sur carte | `dangerInk` #A12C26 | `surfaceCard` #FBFAF7 | 6,93:1 | 4,50:1 |
| information sur sa pastille | `infoInk` #344B5A | `infoSoft` #E2E6E8 | 7,27:1 | 4,50:1 |
| information sur carte | `infoInk` #344B5A | `surfaceCard` #FBFAF7 | 8,75:1 | 4,50:1 |
| repère de valeur de la jauge sur sa piste | `gaugeIndex` #172B3A | `gaugeTrack` #DDD8CE | 10,25:1 | 3,00:1 |

**Thème sombre**

| Usage | Premier plan | Fond | Rapport | Seuil |
| --- | --- | --- | ---: | ---: |
| texte principal sur le fond | `textPrimary` #F3F1EB | `bgApp` #172B3A | 12,88:1 | 4,50:1 |
| texte principal sur carte | `textPrimary` #F3F1EB | `surfaceCard` #344B5A | 8,08:1 | 4,50:1 |
| texte dans un champ | `textPrimary` #F3F1EB | `surfaceSunken` #203545 | 11,22:1 | 4,50:1 |
| texte secondaire sur le fond | `textSecondary` #D5DADD | `bgApp` #172B3A | 10,33:1 | 4,50:1 |
| texte secondaire sur carte | `textSecondary` #D5DADD | `surfaceCard` #344B5A | 6,48:1 | 4,50:1 |
| texte discret sur le fond | `textMuted` #B4BEC4 | `bgApp` #172B3A | 7,69:1 | 4,50:1 |
| texte discret sur carte | `textMuted` #B4BEC4 | `surfaceCard` #344B5A | 4,83:1 | 4,50:1 |
| aide de champ | `textMuted` #B4BEC4 | `surfaceSunken` #203545 | 6,70:1 | 4,50:1 |
| navigation : libellés | `textOnInverse` #F3F1EB | `surfaceInverse` #0F1E29 | 15,02:1 | 4,50:1 |
| navigation : repère actif orange | `accent` #F07824 | `surfaceInverse` #0F1E29 | 5,99:1 | 3,00:1 |
| bouton principal : texte marine sur orange | `textOnAccent` #172B3A | `accent` #F07824 | 5,14:1 | 4,50:1 |
| lien orange sur le fond marine | `accentInk` #F07824 | `bgApp` #172B3A | 5,14:1 | 4,50:1 |
| icône active orange sur carte (pas de petit texte) | `accentInk` #F07824 | `surfaceCard` #344B5A | 3,22:1 | 3,00:1 |
| anneau de focus sur le fond | `focusRing` #F07824 | `bgApp` #172B3A | 5,14:1 | 3,00:1 |
| anneau de focus sur carte | `focusRing` #F07824 | `surfaceCard` #344B5A | 3,22:1 | 3,00:1 |
| contour de champ sur carte | `borderStrong` #8597A3 | `surfaceCard` #344B5A | 3,02:1 | 3,00:1 |
| contour sur le fond | `borderStrong` #8597A3 | `bgApp` #172B3A | 4,82:1 | 3,00:1 |
| succès sur sa pastille | `successInk` #9BD3AC | `successSoft` #2C4A3C | 5,72:1 | 4,50:1 |
| succès sur carte | `successInk` #9BD3AC | `surfaceCard` #344B5A | 5,35:1 | 4,50:1 |
| avertissement sur sa pastille | `warningInk` #F2C772 | `warningSoft` #4B3F22 | 6,49:1 | 4,50:1 |
| avertissement sur carte | `warningInk` #F2C772 | `surfaceCard` #344B5A | 5,73:1 | 4,50:1 |
| danger sur sa pastille | `dangerInk` #F3A79E | `dangerSoft` #4F2E2E | 6,15:1 | 4,50:1 |
| danger sur carte | `dangerInk` #F3A79E | `surfaceCard` #344B5A | 4,71:1 | 4,50:1 |
| information sur sa pastille | `infoInk` #CBD5DB | `infoSoft` #2B4353 | 6,93:1 | 4,50:1 |
| information sur carte | `infoInk` #CBD5DB | `surfaceCard` #344B5A | 6,12:1 | 4,50:1 |
| repère de valeur de la jauge sur sa piste | `gaugeIndex` #F3F1EB | `gaugeTrack` #1E3342 | 11,57:1 | 3,00:1 |

### 2.4 Associations interdites

| Interdit | Raison | À la place |
| --- | --- | --- |
| Texte ou icône orange sur blanc cassé ou sur carte claire | 2,5:1 | texte marine ; l'orange en remplissage ou en repère sur marine |
| Petit texte orange sur ardoise | 3,2:1 | texte blanc cassé ; orange seulement pour les icônes et le texte de 19 px gras ou plus |
| Texte blanc cassé sur orange | 2,5:1 | texte marine sur orange (5,1:1) |
| Chiffre de score écrit dans la couleur de son palier | lisibilité variable (jaune sur clair 1,3:1) | chiffre en `text-primary`, couleur portée par la jauge ou la pastille |
| Couleur fonctionnelle sans mot ni pictogramme | couleur seule (§ 6.10) | pastille avec pictogramme et libellé |
| `brand-logo-orange` dans un composant | jeton protégé | `accent` |

## 3. Paliers des jauges et des pastilles

### 3.1 Règle et valeurs

| Palier | Valeurs | Famille (règle) | Mot | Couleur (proposition) |
| --- | --- | --- | --- | --- |
| 0 | 0–19 | anthracite | Très faible | #2B3034 |
| 1 | 20–39 | rouge | Faible | #A82E2A |
| 2 | 40–59 | orange | Moyen | #F5962A |
| 3 | 60–74 | jaune | Bon | #F8D757 |
| 4 | 75–89 | vert | Très bon | #21915A |
| 5 | 90–100 | bleu | Excellent | #2C60C2 |

- **Valeur affichée** : l'entier arrondi du score (19,5 s'affiche 20, palier 1). Le chiffre, la longueur remplie et la couleur viennent de cette même valeur. Hors de 0–100, ou sans nombre : « sans note », sans jauge, pastille vide.
- **Confiance** : même code de couleur, mais son mot vient du moteur (Haute, Moyenne, Faible), pas du palier. « 69/100 — Moyenne » est jaune.
- **Statuts** : « À vérifier » et « Non recommandé » ne changent pas la couleur du palier. Ils ajoutent leur propre signe (contour pointillé et « ? », pastille barrée) et remplacent le mot du palier dans le libellé (« 53/100 — À vérifier »).

### 3.2 Distinction des paliers (mesurée)

Les valeurs ont été choisies avec le validateur de palettes `validate_palette.js` (OKLab, simulation de protanopie, deutéranopie et tritanopie), sur toutes les paires de paliers, après 9 essais :

| Contrôle | Résultat | Commande |
| --- | --- | --- |
| Séparation en vision normale, pire paire | ΔE 15,4 (jaune et orange), plancher 15 : réussi | `validate_palette.js "<6 paliers>" --pairs all` |
| Séparation en protanopie et deutéranopie, pire paire | ΔE 8,9 (vert et rouge), cible 8 : réussi | idem |
| Tritanopie, pire paire | ΔE 7,8 (signalé, sans seuil bloquant) | idem |
| Bande de luminosité, chroma minimal | **échec attendu** pour l'anthracite (imposé « très sombre ») et le jaune (très clair) | idem |
| Orange du palier 2 contre l'orange d'accent | ΔE 6,9 : proches | idem, paire ajoutée |

Conséquence : l'orange du palier 2 et l'orange d'accent ne doivent jamais se côtoyer. L'orange d'accent ne sert ni aux filtres actifs ni aux pastilles : le filtre actif est marine plein (clair) ou blanc cassé plein (sombre).

### 3.3 Contraste des paliers (information, pas un critère de rejet)

Certains paliers se confondent avec leur fond ; c'est inévitable avec six teintes imposées, du très sombre au très clair :

| Palier | Couleur | Clair : fond | Clair : carte | Clair : piste | Sombre : fond | Sombre : carte | Sombre : piste |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | #2B3034 | 11,80 | 12,77 | 9,39 | 1,09 | 1,46 | 1,02 |
| 1 | #A82E2A | 6,02 | 6,51 | 4,79 | 2,14 | 1,34 | 1,92 |
| 2 | #F5962A | 2,00 | 2,17 | 1,59 | 6,43 | 4,03 | 5,77 |
| 3 | #F8D757 | 1,25 | 1,35 | 1,00 | 10,29 | 6,46 | 9,24 |
| 4 | #21915A | 3,53 | 3,82 | 2,81 | 3,65 | 2,29 | 3,27 |
| 5 | #2C60C2 | 5,22 | 5,65 | 4,15 | 2,47 | 1,55 | 2,21 |

Mesures prises pour que l'information ne dépende jamais de ce contraste :
1. **Jauge** : le chiffre et le mot sont toujours écrits à côté, en `text-primary`. Un **repère de valeur** (trait de 2 px en `gauge-index`, 3:1 au moins sur la piste dans les deux thèmes) marque le bout de la portion remplie. Le remplissage reste d'une seule couleur, sans dégradé ni segment.
2. **Pastille** : un anneau double, intérieur blanc cassé et extérieur marine. Les deux anneaux ont entre eux un rapport de 12,9:1 ; sur n'importe quel fond de carte, l'un des deux atteint donc au moins √12,9 = 3,6:1 (vérifié aussi sur 18 gris de 0 à 255).
3. **« ? » d'une pastille à vérifier** : dans une petite pastille marine sur blanc cassé (12,9:1), accrochée en haut à droite, et non dans le remplissage : un « ? » sur le vert du palier 4 n'atteindrait que 3,6:1.

### 3.4 Filtre « Favorables » : seuil de 75 (décidé)

En V2, « favorable » commence à 65 (`scale.js`, les deux bandes du haut). Avec six paliers, 65 tombe au milieu du jaune : deux pastilles jaunes pourraient être l'une favorable, l'autre non. Trois options :
- **(A) 60**, début de « Bon » : tous les jaunes, verts et bleus sont favorables. Cohérent avec la couleur.
- **(B) 65**, la valeur V2 : continuité, mais incohérent avec la couleur.
- **(C) 75**, début de « Très bon » : plus strict.

Dans tous les cas, le filtre exige aussi la sécurité et l'absence de statut « À vérifier » ; il ne veut jamais dire « sans danger ».

**Décision de Félix (20 nov. 2026, V3-021) : 75.** Favorables = vert et bleu, avec la sécurité et sans « à vérifier ». Constante `FAVORABLE_MIN` de `src/design/v3/tokens.js`, testée. La recalibration du moteur (Phase 8) pourra revoir ce seuil avec lui.

## 4. Typographie

| Jeton | Valeur | Statut |
| --- | --- | --- |
| `font-text` | Roboto, puis polices du système | PROPOSITION : déjà embarquée, fonctionne hors ligne, sans service tiers |
| `font-numeric` | Roboto Condensed, chiffres tabulaires (`font-variant-numeric: tabular-nums`) | PROPOSITION : scores, heures, compteurs, puces denses à 320 px |
| `font-brand` | Montserrat (gras, interlettrage 0,12 em), seulement pour le mot SPUMY et les grands titres d'écran | À DÉCIDER : le mot du logo source est un sans-serif géométrique large et gras (ressemblance INFÉRÉE, aucun fichier de police fourni). Montserrat n'est pas encore embarquée (dépendance à ajouter à l'intégration) |

Échelle (px) : 12 légende, 13 étiquette, 14 petit, 16 texte, 18 texte large et petit titre, 22 titre, 28 titre d'écran, 34 score.
- Interlignage : 1,1 (chiffres), 1,25 (titres), 1,5 (texte).
- Graisses : 400, 500, 700, 800.
- Aucun texte sous 12 px. Les scores principaux font 34 px en mode terrain.
- Le zoom du texte du système doit être respecté jusqu'à 200 % sans perte d'accès.

## 5. Espace, formes, mouvement

- **Espacements** : pas de 4 (4, 8, 12, 16, 20, 24, 32, 40, 48). Marge latérale de 16 px au moins ; largeur de lecture 680 px au plus.
- **Grille** : une colonne sur mobile. Au-delà de 1 024 px : liste de 400 px et carte (Carte), ou deux colonnes de cartes (Décision, à décider sur prototype).
- **Points de rupture** : 320 (minimum testé), 375, 390, 600, 1 024.
- **Rayons** : 6 (étiquettes), 10 (boutons, champs), 16 (cartes), 20 (feuilles glissantes), pilule (puces, bascule).
- **Élévations** : 0 (à plat, cas par défaut), 1 (carte posée sur la carte géographique), 2 (feuilles glissantes, menus). Pas d'effet de verre ni de lueur.
- **Mouvement** : 120 ms (appui), 200 ms (feuilles, bascules), 280 ms (changement d'écran), courbe `cubic-bezier(0.2, 0.8, 0.2, 1)`. Tout passe à 0 si le système demande moins de mouvement. Aucune animation n'est nécessaire à la compréhension.
- **Cibles tactiles** : 44 × 44 px au moins, 52 px pour l'action principale ; 8 px au moins entre deux cibles.

## 6. Iconographie et logos

- **Pictogrammes** : au trait, 24 px, épaisseur 1,75, angles arrondis, de la famille Lucide déjà utilisée en V2 (`src/design/ds/lucide.js`, licence ISC). Toujours accompagnés d'un libellé dans la navigation et les statuts.
- **Statuts** :
    - sécurité OK : bouclier coché ;
    - prudence : triangle ;
    - danger : octogone ;
    - à vérifier : point d'interrogation dans un cercle pointillé ;
    - non recommandé : cercle barré ;
    - information : « i ».
- **Logos** : la matrice d'usage de `docs/design/BRAND-MANIFEST.md` § 6 s'applique.
    - Médaillon BRAND : 40 px au moins dans l'interface.
    - Mot SPUMY : en texte, jamais accompagné d'un slogan.
    - INSHORE et OFFSHORE : facultatifs, jamais dans la navigation.

## 7. Composants

Chaque composant est spécifié ici, puis prototypé en 3.6. Le critère d'acceptation est vérifié sur le prototype, à 320, 375, 390 px et sur bureau.

| Composant | Rôle et structure | Variantes | États | Accessibilité | Critère d'acceptation |
| --- | --- | --- | --- | --- | --- |
| Bascule de mode | deux segments BORD / BATEAU dans l'en-tête | — | repos, actif, focus, pressé | `role="radiogroup"`, libellés texte, 44 px de haut | le mode actif se lit sans la couleur (fond plein et texte gras) |
| Puce de position | lieu, source (appareil, saisie), précision ou âge | appareil, saisie, imprécise, ancienne, aucune | repos, focus, pressé, chargement | bouton nommé « Position de référence : … » | source et précision toujours écrites |
| Barre de navigation | 4 onglets, pictogramme et libellé ; par défaut Home, Carte, Météo, Profil ; les deux du milieu au choix (V3-023) ; glisser sur le contenu pour changer d'onglet | mobile en bas ; bureau en haut | repos, actif (repère orange et libellé gras), focus | `nav`, `aria-current="page"` ; le glissement double les onglets, ne les remplace pas | entrée active lisible sans couleur ; glissement ignoré sur une carte, une courbe ou un curseur |
| Bouton | libellé, pictogramme facultatif | principal (orange, texte marine), secondaire (contour), discret, danger | repos, survol, focus, pressé, désactivé, chargement | 44 px au moins ; le chargement garde le libellé (« Calcul… ») | une seule action principale par écran |
| Puce de filtre | libellé et compteur exact | — | repos, actif (plein), focus, désactivé (compteur 0) | `aria-pressed`, compteur lu | le compteur est égal au nombre de pastilles affichées |
| Jauge de score | libellé (« Favorabilité », « Confiance »), valeur et mot, piste, remplissage, repère | grande (fiche), moyenne (carte), fine (Confiance) | valeur, sans note, chargement (squelette sans valeur) | `role="meter"`, `aria-valuenow`, texte visible | bornes 0, 19, 20, 39, 40, 59, 60, 74, 75, 89, 90 et 100 justes ; aucune jauge de Pertinence |
| Pastille de statut | pictogramme et mot | sécurité OK, prudence, danger, à vérifier, non recommandé, information | — | le mot est le nom accessible | jamais la couleur seule |
| Carte de recommandation | **horaires en tête, en grand** (V3-023), puis rang, nom, Favorabilité, Confiance, statut, sécurité, espèce, route, raison ; « Fiche » et « Sur la carte » | BORD ; BATEAU (zone, espèces, abri) ; « Le plus proche » ; ex æquo | chargée, incomplète, périmée, hors ligne | carte = `article`, titre = nom, rang lu | contenu minimal du § 6.7.4.1 ; aucune valeur inventée |
| Zone « À vérifier » | titre et compteur, liste repliée avec la raison de chaque spot | — | repliée, ouverte | `details` / `summary` ou équivalent | ces spots n'apparaissent jamais parmi les cartes |
| Pastille de carte | disque rempli au palier, anneau double | à vérifier (contour pointillé, « ? »), non recommandé (barrée), sans note (vide), mon spot (carrée), sélectionnée (anneau épais) | repos, sélectionnée, focus | bouton nommé « Spot A, 72/100, Bon, à 24 min » | remplissage = Favorabilité seulement |
| Groupe de pastilles | disque blanc cassé, nombre | — | repos, focus | « 12 spots, zoomer » | nombre exact ; ni couleur ni moyenne |
| Légende | 6 paliers et 4 signes, sur une ligne | repliée, détaillée | — | texte lisible | les bornes sont écrites |
| En-tête de Home | photo de fond (automatique ou choisie), voile, phrase de synthèse, ligne de contexte | BORD, BATEAU, sans position | chargement (phrase neutre), hors ligne | la phrase est un titre lisible ; la photo est décorative et marquée « Illustration » | contraste de la phrase mesuré sur le voile (4,5:1 au moins) ; aucune promesse |
| Frise du jour | 00:00–24:00, heures favorables coloriées au palier, nuit grisée, repère « maintenant » | Home | — | horaires écrits à côté | mêmes horaires que les cartes |
| Courbe de marée | hauteur d'eau du jour, basse et pleine mer, coefficient, heures favorables coloriées au palier, nuit, « maintenant » | fiche spot | appui : heure, hauteur, conditions | description textuelle des horaires favorables | courbe conforme au calcul de marée ; glisser dessus ne change pas d'onglet |
| Flèche de vent | flèche orientée dans le sens du vent ; longueur et épaisseur selon la force ; force et rafales écrites | vent ; mer (hauteur, période) en BATEAU | normale ; avertissement à partir de force 6 (contour pointillé et signe) | chaque point a un nom accessible (« 4 Beaufort, rafales 35 km/h, de nord-ouest ») | couleur neutre, jamais celle des paliers ; aucune zone nommée |
| Curseur horaire | heure choisie, de maintenant à +48 h ; puces Aujourd'hui, Demain, 7 jours | Météo | repos, glissement, focus | `input type=range` étiqueté, flèches du clavier | l'heure choisie est gardée entre les onglets |
| Choix du bateau | « Mon bateau » enregistré (par défaut) ou « Saisir pour cette sortie » | BATEAU | — | groupe de boutons radio | aucun verdict sans l'un ou l'autre |
| Feuille glissante | poignée, contenu | 3 hauteurs (poignée, liste, aperçu) | ouverte, fermée, glissement | bouton de poignée, Échap ferme, focus piégé seulement en plein écran | ne cache jamais la navigation |
| Tableau de comparaison | colonnes alignées par critère | 2 ou 3 colonnes | comparable, avantage non établi | `table` avec en-têtes | aucun score composite ni trophée |
| Champ et recherche | libellé persistant, aide, erreur sous le champ | texte, recherche avec suggestions, coordonnées | repos, focus, rempli, erreur, désactivé | `label` lié, erreur annoncée | la saisie est conservée après une erreur |
| Bandeau | message court et action | hors ligne, données anciennes, erreur de service | — | `role="status"` | dit quoi, pourquoi, que faire |
| Message bref | confirmation et « Annuler » pendant 5 s | — | visible, disparu | `role="status"` | jamais de succès simulé |
| État vide | phrase, raison, action | aucune position, aucun spot à ≤ 1 h, journal vide | — | — | aide à avancer |
| Squelette | formes neutres, sans valeur ni statut | carte, liste | — | `aria-busy` | aucun statut provisoire (défaut A12) |
| Onglets de niveau | Vue rapide, Détails, Expert | — | actif, focus | `tablist` | le choix est gardé par spot |
| Entrée de journal | date, lieu, état typé, prises | prise, sans prise, non renseigné, incomplète, annulée | — | état écrit en toutes lettres | « non renseigné » n'est jamais « bredouille » |
| Confirmation dans la page | question, conséquence, deux boutons | effacement, écrasement | — | focus sur l'action prudente | aucune boîte de dialogue du navigateur |

## 8. États

| Situation | Composant | Signe | Texte type |
| --- | --- | --- | --- |
| Chargement | squelette | formes grises sans valeur | « Calcul des spots autour de Pirou-Plage… » |
| Données absentes | jauge, pastille | « sans note », pastille vide | « Houle inconnue : sécurité à vérifier » |
| Données anciennes | bandeau, puce de source | âge écrit | « Météo d'il y a 3 h » |
| Hors ligne | bandeau marine | pictogramme « hors ligne » | « Hors ligne : données de 06:10 » |
| Erreur de service | bandeau, pastille d'information | « i » | « Météo injoignable : marée et lumière seulement · Réessayer » |
| Succès | message bref | coche | « Sortie enregistrée sur cet appareil · Annuler » |
| Avertissement | pastille ambre | triangle | « Prudence : rafales à 45 km/h » |
| Danger, bloqué | pastille rouge | octogone | « Non recommandé : accès coupé par la marée » |
| Sécurité non documentée | pastille ambre | « ? » | « Danger non documenté : à vérifier sur place » |
| Désactivé | bouton, puce | opacité 0,5 et curseur | la raison est écrite à côté si elle n'est pas évidente |

## 9. Contenus et rédaction

- **Phrases courtes**, au présent ; un verbe pour chaque action (« Ouvrir la fiche », « Me géolocaliser »).
- **Aucun slogan** ; « V2 » n'apparaît jamais à l'écran (§ 6.2.2).
- **Heures** au format `HH:MM–HH:MM`, en heure locale. Sinon : « Fenêtre non déterminable », suivi de sa raison.
- **Nombres** : virgule décimale (« 4,2 MN ») ; espace insécable avant les unités et avant « : ; ? ! » ; « ~ » ou « environ » pour une estimation ; « estimation » écrit en toutes lettres quand le temps de route n'est pas vérifié.
- **Scores** :
    - Favorabilité : « 72/100 — Bon » ;
    - Confiance : « 69/100 — Moyenne », toujours avec « ne change pas le rang » dans la fiche ;
    - jamais « % de chances » ;
    - jamais le libellé « Sans doute » (§ 6.7.4).
- **États** : chaque message dit ce qui se passe, pourquoi, et ce qu'on peut faire. Un succès n'est annoncé qu'une fois réellement acquis.
- **Sécurité** : le mot précis plutôt que l'alarme (« Accès coupé à marée haute après 11:40 », plutôt que « DANGER »). Le rouge permanent est réservé à ce qui bloque.
- **Provenance** : source et heure à côté de la donnée (« Météo-France, 06:00 »). Une photo d'ambiance porte la mention « Illustration ».

## 10. À valider au jalon 2

1. Thème par défaut et rendu en plein soleil (prototype sur téléphone).
2. Valeurs des 6 paliers et des couleurs fonctionnelles.
3. Police du mot SPUMY et des grands titres.
5. Disposition des cartes de recommandation sur bureau.
6. Rendu de la carte du vent (épaisseur des flèches, densité de la grille) et de la courbe de marée.

## 11. Preuves

| Commande | Code de sortie | Résultat |
| --- | --- | --- |
| `node scripts/tokens-v3.mjs --check` | 0 | `tokens.css` à jour |
| `node tests/design-v3.mjs` | 0 | 168/168 |
| `npx eslint -c .eslintrc.json src/design/v3 scripts/tokens-v3.mjs tests/design-v3.mjs` | 0 | aucun écart |
| `node tests/layers.mjs` | 0 | 0 écart aux règles de couches ; 253 couleurs en dur hors de `src/design/`, inchangé |
| `validate_palette.js` (6 paliers, fond clair et fond marine, toutes paires) | 1 (échec attendu de la bande de luminosité) | voir § 3.2 |
