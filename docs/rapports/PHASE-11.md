# SPUMY — Phase 11 : direction artistique et écrans

19 novembre 2026 · Félix · prototype interactif : https://claude.ai/artifact/BBDcujdvLQxMft99DxqCuP (privé tant que tu ne le partages pas) · branche `claude/phase-11-design`, proposition de fusion en brouillon (pas fusionnée sans ton accord)

SPUMY a maintenant une direction artistique tirée de ta maquette de référence, un système de design complet et un **prototype interactif de 23 écrans** que tu peux ouvrir sur ton téléphone ou ton ordinateur. Pour le BORD, il montre une vraie journée : le 16 mai 2026 à Logonna-Daoulas, la météo archivée passée au moteur v2. Pour le BATEAU, il montre des données d'exemple, marquées comme telles. Tes photos donnent l'ambiance de chaque écran : elles sont choisies selon la lumière, le ciel, la mer et le lieu du moment, et elles ne sont jamais présentées comme la photo d'un spot ou d'une prise.

C'est une maquette, pas l'application : l'application publiée ne change pas dans cette phase. Les questions sont gardées pour la fin, comme tu l'as demandé ; je ne t'en pose aucune ici.

## 1. Objectif

Phase 11 du prompt maître : analyser l'image de référence, en tirer un système de design (jetons, typographie, espacements, composants, icônes, états), concevoir la navigation et l'architecture de l'information, dessiner les écrans BORD et BATEAU, et les rendre consultables avec une comparaison visuelle (§ 5, § 6, § 7 et § 20). Contraintes tenues :
- au moins huit types d'écran par mode ;
- une planche BORD / BATEAU, le système, les icônes, les états, un avant / après ;
- des données fictives identifiées comme telles ;
- jamais une maquette présentée comme une interface qui fonctionne ;
- pas de simple changement de couleurs ;
- deux pictogrammes de mode distincts ;
- un prototype HTML plutôt que Figma.

## 2. Travail réalisé

| Lot | Statut | Contenu |
|---|---|---|
| 11.0 Départ | IMPLEMENTED | Branche `claude/phase-11-design` partie de la phase 9 ; consignes et images retrouvées (maquette en 8 écrans, 39 photos Gemini, 38 distinctes) |
| 11.1 Analyse de la référence | IMPLEMENTED | Couleurs mesurées sur les pixels, observable et interprété séparés (`docs/DIRECTION-ARTISTIQUE.md` § 2) |
| 11.2 Photos | TESTED | 32 photos retenues et décrites, 6 écartées avec leur raison ; WebP 1600 et 720 px ; choix déterministe et règles d'honnêteté (`ambiance.js`) |
| 11.3 Système de design | TESTED | Jetons des deux thèmes, polices auto-hébergées, 22 composants, 96 icônes Lucide et 8 pictogrammes SPUMY ; contrastes 41/41 |
| 11.4 Données du prototype | IMPLEMENTED | Journée BORD réelle (moteur v2, archive Open-Meteo), cartes OpenStreetMap de la rade et de l'Iroise, données BATEAU d'exemple (réglementation 2026 réelle) |
| 11.5 Écrans BORD | TESTED | Décision, Carte, Fiche du spot (trois niveaux), Comparaison, Stratégie, Matériel, Journal, Terrain, Plus |
| 11.6 Écrans BATEAU | TESTED | Sortir aujourd'hui ?, Sécurité de la sortie, Zones, Une zone, Espèces, Technique, Sorties, Ton bateau |
| 11.7 Planches | TESTED | Accueil, États, Système de design, BORD face à BATEAU, Avant / après, Conformité à la référence |
| 11.8 Tests et revue visuelle | TESTED | Parcours des 23 écrans (390 et 320 px, deux thèmes, axe-core) 244/244 ; chaque écran relu en capture dans les deux thèmes, défauts corrigés (voir § 4) |
| 11.9 Rapport, arrêt | IMPLEMENTED | Ce rapport ; `docs/DIRECTION-ARTISTIQUE.md` ; suivi mis à jour |

## 3. Livrables

- **Prototype interactif** : https://claude.ai/artifact/BBDcujdvLQxMft99DxqCuP. Il sera aussi en ligne à `https://felixmuzellec.github.io/spumy/prototype/` une fois GitHub Pages activé et la branche fusionnée. Sur téléphone, l'onglet au bord droit ouvre la liste des écrans ; sur ordinateur, le téléphone est au centre et la note de l'écran à droite.
- `docs/DIRECTION-ARTISTIQUE.md` : analyse, principes, système, photos, navigation, écarts voulus, accessibilité.
- `src/design/ds/` : le système de design. Il contient `tokens.css`, `components.css`, `ui.jsx`, `lucide.js`, `glyphs.js`, `ambiance.js` et `illustrations.js`.
- `src/prototype/` : les écrans et leurs données. `prototype/` : la construction publiée.
- `data/photos/catalogue.json`, `assets/photos/` : les photos d'ambiance.
- `docs/reference/` : les recadrages de la référence et les captures « avant » de la v9.2.
- Scripts :
    - `build-prototype.mjs` (construction) ;
    - `prototype-data.mjs` (journée BORD) ;
    - `carte-prototype.py` (trait de côte) ;
    - `photos.py` (conversion des photos) ;
    - `avant-prototype.mjs` (captures « avant »).
- Tests : `tests/design.mjs`, `tests/prototype.mjs` ; commandes `npm run build:prototype`, `test:design`, `test:prototype`.

## 4. Preuves

| Contrôle | Résultat |
|---|---|
| `npm run test:design` : contrastes WCAG des jetons, Nuit marine et Plein soleil | 41/41 |
| `npm run test:prototype` : 23 écrans × 390 et 320 px × deux thèmes. Pour chacun : rendu, pas de défilement horizontal, aucune erreur de console ni requête échouée. S'y ajoutent les interactions principales, l'absence de pastille masquée sur la carte, et axe-core sur chaque écran dans les deux thèmes. | 244/244 |
| Copie de revue (celle de l'artefact), servie localement, 390 et 1 440 px | aucune erreur, aucune image cassée |
| `npm run lint` | 0 problème |
| `npm run test:layers` | 0 écart aux couches (nouvelle couche `prototype` : n'importe que `design` et `data`) ; couleurs en dur hors de `src/design/` : 291, inchangé |
| `test:data`, `test:knowledge`, `test:v2` | 69/69, 27/27, 56/56 |
| `test:unit` (sept guides et un fuseau de l'autre côté du monde) | 3 390 contrôles, tous verts |
| `test:e2e` (application inchangée) | voir le suivi : premier passage interrompu par un délai dépassé pendant que d'autres tests chargeaient la machine (étape déjà connue pour sa lenteur), relancé seul |

Défauts trouvés à la relecture des captures, puis corrigés :
- photo de nuit sur un spot de l'aube : la lumière pèse désormais plus que le reste ;
- « Pen-Hir » coupé en fin de ligne ;
- pastilles de spots voisins superposées : elles sont écartées, avec un trait vers leur vraie position ;
- étiquettes de zones qui se chevauchaient ;
- leurre rogné dans la carte « Technique » ;
- « Descendante » tronquée en mode terrain ;
- valeurs du profil du bateau coupées sur deux lignes ;
- décimales à l'anglaise ;
- texte blanc illisible sur la photo d'en-tête en Plein soleil, barre du bas transparente ;
- chemin de fichier affiché à l'écran.

Deux phrases fausses ont aussi été corrigées dans le journal :
- « toutes au coucher » : les trois bars ont été pris au coucher, pas les trois sessions ;
- la part « ton journal » de la confiance : 1,5 point par session, jusqu'à 10 sessions, et 0 dans cette journée calculée sans journal.

## 5. Résultats

### 5.1 La référence, analysée

Ce qu'on voit dans ta maquette :
- un fond bleu nuit (#001020 domine) ;
- un cyan lumineux pour l'action (#00d0f8 à #00e0f8) ;
- du vert pour « Recommandé », de l'ambre et de l'or pour « À surveiller » et « Notre conseil » ;
- deux niveaux de texte, blanc et bleu-gris ;
- trois anneaux de score en dégradé ;
- une linéale condensée grasse ;
- une grande photo en tête et des cartes vitrées qui la chevauchent ;
- une action principale par écran, trois niveaux de détail, une barre du bas à cinq entrées.

Ce qu'on ne voit pas, les animations, n'est pas inventé. Le détail, avec la valeur retenue pour chaque élément, est au § 2 de `docs/DIRECTION-ARTISTIQUE.md`.

### 5.2 Le système

Il y a deux thèmes :
- **Nuit marine**, par défaut, tiré de la référence ;
- **Plein soleil**, pour dehors au soleil : fond clair, cyan assombri pour garder 4,5:1.

Les autres choix :
- typographie : Roboto Condensed pour les titres, les chiffres et les libellés, Roboto pour les textes ;
- favorabilité : cinq bleus. L'orange et le rouge restent réservés à la sécurité. « À vérifier » est en ambre pointillé avec un « ? », « non recommandé » en gris barré : la forme porte le sens autant que la couleur ;
- deux pictogrammes de mode bien distincts : un pêcheur qui lance depuis le rivage, un bateau de pêche ;
- des cibles tactiles de 44 px, et 52 px pour l'action principale.

### 5.3 Les écrans

**BORD**, du plus court au plus détaillé :
1. Décision : verdict, fenêtre, meilleur spot, accès au reste.
2. Carte : pastilles du moteur, classement du jour dessous.
3. Fiche du spot : trois scores qui s'ouvrent sur leur décomposition ; Vue rapide, Détails, Expert.
4. Comparaison : barres par famille de critères, et le conseil.
5. Stratégie : leurre de ta boîte, poids, taille, couleur, animation.
6. Matériel : ta boîte en dessins, et ce qui est conseillé aujourd'hui.
7. Journal : tes trois vraies sessions et leurs statistiques.
8. Mode terrain : gros caractères, une main.
9. Plus : marée, météo, saison, règles, thème.

**BATEAU** : la sécurité passe d'abord.
1. Sortir aujourd'hui ? : le verdict de la sortie.
2. Sécurité de la sortie : heure par heure, les douze règles `SEC_*`.
3. Zones : cercles de 2 et 6 milles autour des abris.
4. Une zone : les espèces du jour, classées.
5. Espèces : réglementation 2026 réelle.
6. Technique : avec, au niveau Expert, les connaissances sourcées de `data/knowledge/bateau.json`.
7. Sorties : le carnet.
8. Ton bateau : le profil.

### 5.4 Conformité à la référence (§ 20)

| Critère | Résultat | Justification |
|---|---|---|
| Identité générale | Conforme | Photo plein cadre, fond bleu nuit, surfaces vitrées, cyan pour l'action |
| Palette | Conforme | Couleurs mesurées ; écart voulu : favorabilité en bleus |
| Typographie | Conforme | Condensée grasse pour les titres et les chiffres, « /100 » en petit |
| Composition | Conforme | Une action principale, gros blocs, trois niveaux |
| Composants | Conforme | Cartes à vignette, anneaux, segments, tuiles, barres, encadrés |
| Navigation | Conforme | Barre du bas à cinq entrées par mode, titres avec retour |
| Iconographie | Conforme | Un seul jeu au trait, deux pictogrammes de mode distincts |
| Photographies | Partiellement conforme | Ambiance oui ; jamais présentées comme un spot ou une prise (images générées) |
| Carte | Partiellement conforme | Trait de côte réel, pas de fond bathymétrique (aucune donnée de profondeur) |
| Interactions | Conforme | Les dix états du § 7.3 (planche « États » : huit cas, données absentes et erreur réunies ; données disponibles : tous les écrans), retour au toucher, focus visible ; animations de la référence non vérifiables |
| Application globale | Partiellement conforme | Cohérente sur tout le prototype ; l'application publiée garde l'ancien design jusqu'à la phase 13 |

La planche « Conformité » du prototype place chaque écran de la référence à côté du prototype ; la planche « Avant / après » fait de même avec l'application v9.2.

## 6. Problèmes et risques

- **Maquette, pas application.** Rien n'est branché. Les écrans BORD montrent une journée figée ; les écrans BATEAU des données d'exemple, parce que le moteur BATEAU est la phase 10.
- **Photos générées.** Leur origine et leurs droits pour une publication sont à confirmer (question 28). Elles restent marquées « Illustration ».
- **Écarts voulus à la référence**, que tu peux refuser : pastilles bleues, pas de photo de spot ni de prise, leurres dessinés sans étoiles, pas de bathymétrie, texte secondaire éclairci pour la lisibilité.
- **Poids** : le prototype pèse 450 Ko de code, sans compter les photos. C'est sans effet sur l'application, qui ne le charge pas.
- **Captures « avant »** : elles sont faites avec la météo simulée des tests et un fond de carte remplacé par un aplat. Elles servent à comparer la forme, pas les données.
- **Mise en ligne** : l'artefact est privé, et GitHub Pages n'est toujours pas activé (décision ouverte n° 9).

## 7. Critères d'acceptation

| Critère (prompt maître) | Statut |
|---|---|
| Analyse de la référence, observable et interprété distingués (§ 5.2) | IMPLEMENTED |
| Système de design : jetons, couleurs, typographie, espacements, rayons, ombres, composants, variantes, états, icônes, règles responsive (§ 5.3) | TESTED |
| Pas de modernisation superficielle (§ 5.4) : composition, composants, icônes, navigation et niveaux d'information changés | IMPLEMENTED, à juger par toi |
| Pictogrammes BORD et BATEAU distincts (§ 5.5) | IMPLEMENTED |
| Prototype consultable sans outil de design (§ 6) | TESTED |
| Trois niveaux d'information (§ 7.2) ; dix états (§ 7.3 : planche « États », huit cas, plus les écrans ordinaires) | TESTED |
| Huit types d'écran par mode au moins (§ 7.4) : 9 BORD, 8 BATEAU | TESTED |
| Planche BORD / BATEAU, système, composants, icônes, états, parcours, avant / après (§ 7.4) | TESTED |
| Données fictives identifiées ; maquette jamais présentée comme fonctionnelle (§ 7.4) | TESTED (bandeaux « exemple », note « Maquette interactive, pas l'application ») |
| Matrice de conformité (§ 20) | IMPLEMENTED (§ 5.4) |
| Validation de la direction artistique par toi | en attente |

## 8. Décisions attendues

Je ne te pose pas ces questions maintenant ; elles rejoignent la liste à traiter ensemble (`SPUMY_AUDIT_CONTINUITY.md`, questions 26 à 31) :
- 26 : valider la direction artistique ;
- 27 : le logo ;
- 28 : l'origine et les droits des photos ;
- 29 : quand appliquer le système à l'application (décision ouverte n° 5) ;
- 30 : les écarts voulus à la référence ;
- 31 : la fusion de la phase 11 dans `main`.

## 9. Prochaine phase proposée, et arrêt

**Phase 12 — Spécifications fonctionnelles et techniques** (prompt maître) : pour chaque écran du prototype, ses composants, ses états, ses actions, les données et les règles métier qu'il lit, les appels aux services, ses comportements et ses critères d'acceptation, de façon que le développement (BORD dans la refonte, puis BATEAU) parte d'un cahier des charges vérifiable. La phase 10 (moteur BATEAU) reste mise de côté tant que tu ne la rouvres pas.

**STOP.** J'attends « APPROVED — PROCEED TO PHASE 12 ».
