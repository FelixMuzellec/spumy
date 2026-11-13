# Audit de la V2 « SPUMY » et corrections de la v9.1

Audit du dossier Drive « V2 » (6 novembre 2026) : architecture, toutes les images, le code modifié ligne à ligne, l'expérience d'usage, la sécurité et la mission. Chaque constat porte sa preuve (fichier, valeur, rendu). La dernière partie dit ce que la v9.1 corrige et ce qui reste à faire.

## Verdict en bref

La V2 a de bonnes intentions (une marque, un indicateur de sécurité, un mode terrain), mais elle **ne se construit pas** (12 ruptures d'import ou de fichier), ses **logos sont illisibles** sous 96 px et leurs sous-titres sont barrés par l'anneau, elle **affiche deux échelles de notes contradictoires** (/10 et /100), et son filtre de sécurité **affiche un feu vert** (« Conditions de sécurité sereines ») que l'application ne peut pas savoir. Les fichiers en ligne ne viennent pas de ces sources : ils sont identiques octet pour octet à la v8.15.

La v9.1 repart de la v8.15 (complète et testée), y intègre proprement les idées de la V2 et corrige tout ce qui suit, sauf les 6 points de la dernière partie.

## Méthode

- Lecture de chaque fichier de la V2 qui diffère de la v8.15 : `src/ui/App.jsx`, `kit.jsx`, `TabBar.jsx`, `theme.js`, `SpumyViews.jsx`, `tabs/Synthese.jsx`, `src/engine/scale.js`, `scale.js` et `rules.js` à la racine du Drive, `scripts/build.mjs`, `scripts/sites.mjs`, `manifest.json`, `package.json`.
- Comparaison des imports avec les exports réels de chaque module.
- Rendu des 10 images SVG de `assets/` à 256, 96, 60 et 40 px (tailles réelles : carte d'accueil, favicon, écran d'accueil du téléphone).
- Comparaison octet pour octet des fichiers construits de la V2 avec la v8.15.

---

## 1. Mission

| # | Constat | Gravité |
|---|---|---|
| M1 | La mission de l'application est de dire **où et quand pêcher, avec quoi, et ce qu'on ne sait pas**. La V2 la déplace vers un « tableau de bord » de trois scores /100 (« Favorabilité, Pertinence, Confiance ») qui ajoutent des chiffres sans ajouter d'information : `favorability100 = round(score × 10)`. | Majeure |
| M2 | La V2 présente la sécurité comme un score qu'on additionne (points de sécurité ajoutés à la « pertinence » dans `src/engine/scale.js`) : un spot plus sûr remonte au classement. La sécurité doit rester une information à part, jamais compensée par une belle note. | Majeure |
| M3 | « SAFE — Conditions de sécurité sereines », en vert : l'application ne voit ni l'état réel de la mer, ni l'accès, ni la fatigue. Elle ne peut que dire qu'elle ne connaît pas d'alerte. | Critique |
| M4 | Des valeurs inventées quand le moteur n'en a pas (profondeur « 1 à 4 m », animation « Walking the dog » ou « dent de scie » selon la couche) : contraire à la règle « sans rien inventer » du projet. | Majeure |

## 2. Architecture

| # | Constat (preuve) | Gravité |
|---|---|---|
| A1 | `kit.jsx` renomme ses exports (`C`→`h`, `num`→`TabNum`, `fr`→`fmt`, `Alert`→`Banner`, `Muted`→`Sub`, `Disclosure`→`Fold`, `SubTabs`→`Seg`, `Row`→`KV`, `Why`→`WhyList`, `GoLink`→`MoreBtn`, `Chip`→`Pill`). Les fichiers inchangés (`components.jsx`, `MapView.jsx`, `MySpotForm.jsx`, `Orientation.jsx`…) importent toujours les anciens noms : la construction échoue (« No matching export »). | Bloquante |
| A2 | `App.jsx` importe `nowDateISO` et `nowHHMM` de `components.jsx`, qui ne les exporte pas (il exporte `parisISO`, `parisHHMM`). | Bloquante |
| A3 | `tabs/Synthese.jsx` importe `Badge`, `hrsLeft`, `Spinner`, `SpreadNotice` de `components.jsx` : aucun n'existe. Il exporte `WeekStrip` alors que `Meteo.jsx` importe `WeekCompact`. | Bloquante |
| A4 | `src/ui/tabs/` ne contient que `Spots.jsx` et `Synthese.jsx` ; `App.jsx` importe aussi `JournalTab`, `Leurres`, `Maree`, `Meteo`, `Regles`, `Saison`, `Photos`, et `Spots.jsx` sa fiche `SpotDetail.jsx` : 8 fichiers absents. | Bloquante |
| A5 | `offshore.jsx` est rangé dans `src/offshore/` alors que `src/home/main.jsx` l'importe depuis `./offshore.jsx`. | Bloquante |
| A6 | `src/studio/` absent : `scripts/build-studio.mjs` ne peut plus construire la page d'analyse photo. | Majeure |
| A7 | `scripts/build.mjs` copie `assets/<guide>-512.png`, que la V2 a archivés (renommés `OLD_DUP_*`) : erreur ENOENT. | Bloquante |
| A8 | La version la plus récente de `scale.js` (« SPUMY V6.2 », 8 Ko) et `rules.js` (filtre `evaluateBordSecurity`) sont **à la racine du Drive**, hors de `src/engine/` : jamais construits. `src/engine/scale.js` est une version antérieure (4 Ko) aux poids différents. Deux vérités pour le même calcul. | Majeure |
| A9 | Les fichiers construits de la V2 (`index.html`, sept guides, `home.js`, `sw.js`) sont identiques octet pour octet à la v8.15 ; `package.json` dit 9.0.0, `manifest.json` a été modifié à la main (« 3 scores de décision (/100) ») et ne correspond plus aux pages, qui affichent /10. Ce qui est en ligne ne vient pas de ces sources. | Majeure |
| A10 | `scripts/build.mjs` de la V2 supprime les contrôles « gabarit non remplacé » (feuille Leaflet, version, guides) : une construction ratée partirait en ligne sans erreur. | Majeure |
| A11 | `theme.js` remplace l'inversion du mode plein soleil par des variables CSS `--spumy-*`… qu'aucun composant n'utilise (tous les styles sont en ligne, avec les couleurs fixes de `kit.jsx`). En plein soleil, seul le fond devient clair : les cartes restent sombres. | Majeure |
| A12 | `TabBar.jsx` déclare une barre inférieure à 5 piliers (`BOTTOM_PILLARS`) qui n'est jamais affichée : code mort. | Mineure |
| A13 | Questions d'architecture déjà posées (typage, couplage, images) : les images PNG pesaient 245 Ko, soit 3,6 % des 6,8 Mo du site ; le poids vient de React, Leaflet et du moteur intégrés **huit fois** (sept guides et `home.js`). Le levier est un paquet partagé, pas le WebP. Le couplage interface/moteur est réel (`src/home/site-api.js` refait les entrées de note d'`App.jsx`), aujourd'hui tenu par un test de bout en bout qui vérifie l'égalité des 66 notes. Le typage se ferait sans réécriture par JSDoc et `tsc --checkJs`. | Information |

## 3. Images

Rendu réel des 10 SVG de la V2 à 256, 96, 60 et 40 px, et des PNG d'icône.

| # | Constat (preuve) | Gravité |
|---|---|---|
| I1 | **Les sous-titres sont barrés** : l'anneau (`stroke-dasharray="980 1320"`, rayon 210, épaisseur 14) passe sur la ligne y = 464 de chaque guide — « RADE DE BREST · 29 », « CAP SIZUN · 29 », « BAIE DE MORLAIX · 29 », « COTENTIN · 50 », « PAYS DES ABERS · 29 », « CORNOUAILLE · 29 », « PRESQU'ÎLE · 29 ». C'est le défaut que tu as vu. | Critique |
| I2 | Écritures illisibles aux tailles réelles : à 96 px le nom fait environ 8 px de haut et le sous-titre 4 px ; à 40 px (favicon, raccourci) rien n'est lisible. Les recommandations d'Apple demandent de n'inclure du texte dans une icône « que s'il est indispensable au sens » ; ici le nom est déjà écrit à côté de l'icône partout où elle apparaît. | Critique |
| I3 | « PLOUGUERNEAU » et « CONCARNEAU » touchent l'anneau ; tailles de police différentes d'un guide à l'autre (36, 38, 42). | Majeure |
| I4 | Le texte est en `font-family="system-ui"` : le rendu change d'un appareil à l'autre (iPhone, Android, Windows). | Majeure |
| I5 | Aucun PNG n'a été tiré des nouveaux SVG : `manifest.json` et l'icône iPhone pointent toujours sur `icon-192.png`, `icon-512.png`, `icon-maskable.png`… identiques à la v8.15 (l'ancien poisson). L'application installée garde l'ancienne icône alors que l'interface dit SPUMY. iOS n'accepte pas de SVG en icône d'écran d'accueil. | Majeure |
| I6 | Dessins de repères peu reconnaissables et qui se fondent en taches sous 60 px (zigzag de Logonna, créneaux de Carantec, beffroi de Concarneau, phares de Pirou, Audierne, Plouguerneau). | Majeure |
| I7 | `spumy-logo.svg` : un poisson abstrait (crochet blanc sur deux vagues) sans les traits du bar ; style différent des icônes des guides (deux langages visuels). | Majeure |
| I8 | `mode-bord.svg` et `mode-bateau.svg` : illustrations détaillées de 512 px, non utilisées par le code, illisibles à la taille d'un onglet. | Mineure |
| I9 | Couleurs des guides : Logonna `#0ea5e9` et Carantec `#38bdf8` se confondent, Audierne `#f59e0b` et Concarneau `#f97316` aussi ; l'ambre et le vert sont les couleurs des notes, d'où une confusion avec la qualité du jour. | Majeure |

## 4. Code, fichier par fichier

**`src/engine/scale.js` et `scale.js` (racine)**

| # | Constat | Gravité |
|---|---|---|
| C1 | `toScore100 = round(score10 × 10)` : la même information que la note /10, avec une précision qui n'existe pas (le moteur ne départage pas deux spots à moins de 0,2 point). | Majeure |
| C2 | `opportunityBand` : seuils 80 / 65 / 45 et couleurs `#10b981`, `#22c55e`, `#f59e0b`, `#ef4444`, alors que `scoreColor` utilise 7 / 5 et `#22c55e`, `#f59e0b`, gris. Un spot à 4,4 est gris sur /10 et rouge « Conditions faibles » sur /100, à côté. | Majeure |
| C3 | `confidence100` additionne des points arbitraires (modèle 30 ou 20, fraîcheur 16 « par défaut » sans heure de téléchargement, houle 12 constants, eau 8/6/3, fiche 15/11/5 + 3 + 2, journal ×2), bornés à 5–98 ; l'autre version bornait à 25–99. Aucune source, et le nombre ressemble à une probabilité. | Majeure |
| C4 | `relevance100` mêle la faveur du poisson, la distance, l'équipement et (version de 17 h 50) des points de sécurité ; constantes 0,55 / 20 / 40 puis 0,75 / 15 / 45 selon la version. | Majeure |
| C5 | `computeSpumyScores` est appelé sans `live`, `isRade` ni `allScored` : fraîcheur toujours par défaut, et toute rade traitée comme côte ouverte. | Majeure |

**`rules.js` (racine) — `evaluateBordSecurity`**

| # | Constat | Gravité |
|---|---|---|
| C6 | Règle de période (`period ≥ 12 s` et `h²T > houleMax² × 11`) : la météo de zone ne fournit aucune période, la règle ne se déclenche jamais. | Majeure |
| C7 | Seuils non sourcés : rafales 80 km/h (blocage) et 65 km/h (spot modéré), 85 % de la houle maximale, coefficient 85 pour l'isolement, `houleMax` à 1,5 m par défaut. | Majeure |
| C8 | Doublon du moteur avec d'autres tolérances : le moteur exclut à `houleMax + 0,5 m` (0 sur spot engagé), `rules.js` à `+ 0,3 m`. Les deux peuvent se contredire (spot proposé et « BLOCKED », ou l'inverse). | Majeure |
| C9 | « SAFE — Conditions de sécurité sereines » en vert `#10b981` (voir M3). | Critique |
| C10 | `fallbackSpot` : propose le premier spot éligible « abri » ou facile, sans regarder sa note ni son créneau. | Mineure |

**`SpumyViews.jsx`, `tabs/Synthese.jsx`, `App.jsx`, `TabBar.jsx`**

| # | Constat | Gravité |
|---|---|---|
| C11 | Marée : `tidePhaseType === "descendant" ? "Descendante" : "Montante"` (mode terrain et verdict) : l'étale et la marée variable s'affichent « Montante ». | Majeure |
| C12 | `SpumyStrategyCard` : profondeur « 1 à 4 m » quand le moteur n'a pas d'estimation, animation déduite de la seule couche ; elle double la carte « Leurre conseillé » juste au-dessus. | Majeure |
| C13 | Verdict : « 8,1 sur 10 · 81/100 », puis une jauge /100 de couleur différente, puis trois barres /100 : quatre chiffres pour une seule note. | Majeure |
| C14 | La stabilité du classement a sa propre pastille vert/orange/rouge (« Stable / Sensible / Volatile ») : une troisième échelle de couleurs. | Mineure |
| C15 | Mode terrain non mémorisé (perdu à chaque ouverture). En-tête « SPUMY · Guide du bar · Logonna-Daoulas » : coupé ou sur trois lignes sous 360 px. | Mineure |
| C16 | « Eau » du verdict : température du site, pas celle du spot recommandé. | Mineure |

## 5. Expérience d'usage

| # | Constat | Gravité |
|---|---|---|
| U1 | Deux échelles et deux jeux de couleurs sur le même écran (C2, C13, C14) : l'utilisateur ne sait plus laquelle croire. | Majeure |
| U2 | Feu vert de sécurité (M3). | Critique |
| U3 | Mode plein soleil cassé (A11). | Majeure |
| U4 | Logos illisibles et sous-titres barrés (I1, I2). | Critique |
| U5 | Carte leurre en double (C12). | Mineure |
| U6 | « Confiance 87/100 » se lit comme « 87 % de chances » : c'est faux. | Majeure |
| U7 | Barre inférieure annoncée, jamais affichée (A12). | Mineure |

## 6. Sécurité

**Des personnes** : M3, C6 à C9, et l'absence de « vérifie sur place ». **Des données et du code** : aucune clé ni jeton dans les fichiers lus ; la politique de sécurité du contenu (CSP) de la construction est conservée ; la suppression des contrôles de construction (A10) est le risque principal : une page incomplète partirait en ligne.

---

## 7. Ce que corrige la v9.1

| Constat | Correction | Vérification |
|---|---|---|
| A1–A10 | Repartie de la v8.15 complète ; idées de la V2 réintégrées dans les vrais modules ; contrôles de construction conservés ; un seul `scale.js`, un seul calcul de note. | Construction des 22 fichiers ; tous les tests |
| I1–I9 | Nouvelle marque : un bar de profil (première dorsale épineuse, seconde dorsale, queue fourchue, opercule) qui bondit hors de l'écume. **Aucune écriture dans les icônes** : les noms sont du vrai texte à côté (en-tête de l'accueil, en-tête des guides, cartes, écran d'accueil). Sept variantes de guide par la seule couleur de l'eau, en teintes marines distinctes, jamais celles des notes. PNG tirés : `icon-192`, `icon-512`, `icon-maskable` (zone sûre de 80 %), `apple-touch-icon` 180 px, une icône par guide. Sources vectorielles dans `assets/brand/`, générateur `scripts/icons.mjs`. Nom sous l'icône : « SPUMY ». | Rendu contrôlé de 29 à 512 px, masque rond et carré arrondi ; test de bout en bout (nom court, icône iPhone 180 px) |
| M3, C6–C10 | `src/engine/safety.js` : sécurité à part de la note, construite seulement sur les données du moteur (consignes actives de la fiche, houle face au maximum de la fiche, vent moyen sur l'échelle de Beaufort — force 7 : Météo-France émet un BMS côte ; force 8 : coup de vent —, nuit sur spot modéré ou engagé, houle ou météo inconnues). Trois états : « Alerte sécurité », « Prudence », « Aucune alerte connue ». **Jamais de vert**, et toujours « vérifie sur place ». Aucun seuil inventé ; aucun doublon des portes du moteur. Affichée dans le verdict et dans l'onglet Accès de chaque fiche. | 10 tests unitaires × 7 guides ; test de bout en bout du verdict sur les 7 guides |
| C3, U6 | `src/engine/confidence.js` : la confiance n'est plus un nombre. Liste de ce que le conseil avait et de ce qui manquait, résumée en « élevée / moyenne / faible » avec des points, sans couleur d'état. | 9 tests unitaires × 7 guides ; test de bout en bout du détail |
| C1, C2, C13, C14, U1 | Une seule échelle : la note /10 et ses trois couleurs (7 et plus, 5 et plus, en dessous). Plus de /100, plus de pastille colorée de stabilité (elle passe dans la confiance), plus de couleur de stabilité dans l'onglet Météo. | Tests « jamais /100 ni % » |
| C11, C12, C15, C16, M4 | Mode terrain refait : le verdict en gros caractères (spot, créneau, note, marée **montante ou descendante d'après les pleines et basses mers calculées** avec l'heure de la prochaine, vent et côté, houle, leurre de ta boîte, sécurité). Ce qui manque s'affiche « — ». Mémorisé sur l'appareil. Aucune carte en double. | 2 tests unitaires de la marée à un instant ; 3 tests de bout en bout (calcul, mémorisation, retour) |
| C15 | En-tête des guides : icône du guide, « SPUMY » en petit, nom du guide en grand, une ligne chacun. | Capture à 390 px |
| Accueil | En-tête SPUMY (marque, nom, promesse en texte) ; onglets Inshore et Offshore avec pictogrammes tracés à la taille d'usage. | Capture à 390 px |

Données conservées : toutes les clés de stockage `bar:*` restent les mêmes (journal, spots, sorties en bateau, réglages) ; rien n'est perdu en passant à la v9.1.

## 8. Ce qui reste à faire (dit franchement)

1. **Thème plein soleil par variables** : la v9.1 garde l'inversion (testée depuis la v8.9, lisible, sans erreur d'accessibilité) ; un vrai thème clair demande de passer toutes les couleurs en ligne de ~40 fichiers par des variables.
2. **Paquet partagé** : React, Leaflet et le moteur sont encore intégrés dans chaque page ; c'est le seul gain de poids important. Les nouvelles icônes pèsent 390 Ko en tout (dégradés en pleines couleurs : une réduction à 256 couleurs faisait apparaître des bandes, refusée).
3. **Typage** : JSDoc et `tsc --checkJs` sur `src/engine/` d'abord.
4. **Barre inférieure à 5 piliers** : non reprise ; l'actuelle barre de 9 onglets est accessible au clavier et testée. Une barre inférieure mérite d'abord un essai sur le terrain.
5. **Sécurité sur la carte de l'accueil et le top 5** : pas encore.
6. **Dépôt dans le Drive** : le connecteur Google Drive est en lecture seule ; il faut le reconnecter en autorisant la création de fichiers.

## Sources

- Échelle de Beaufort et seuil du BMS côte (force 7) : [Digischool — Météo marine : lire un bulletin avant de prendre la mer](https://www.digischool.fr/articles/bateau/meteo-marine-permis-bateau/)
- Texte dans les icônes (« Include text in your design only when it's essential for conveying meaning ») : [Apple — Human Interface Guidelines, Icons](https://developer.apple.com/design/human-interface-guidelines/icons.md)
- Zone sûre des icônes « maskable » (cercle de 80 % du côté) : [MDN — Define your app icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons)
