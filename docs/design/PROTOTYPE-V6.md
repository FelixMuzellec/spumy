# Prototype SPUMY V3, version 6 — cahier des charges

Décidé avec Félix le 23 novembre 2026, de 5 h 50 à 6 h 22, à partir de ses maquettes. Décision : V3-028 (`docs/DECISIONS_LOG.md`).

**Statut** : DÉCIDÉ, réalisation pas commencée. Elle démarre au feu vert de Félix, dans la phase 3. Rien n'est publié sur le site.

**Références** dans `docs/design/maquettes-v6/` :
- `home.jpg` : Home ;
- `carte-vue-peche.jpg` : Carte, la vue pêche ;
- `meteo-video-planche.jpg` et `meteo-video-trois-temps.jpg` : images de la vidéo de 10 s, la vue Météo.

Félix ne veut pas revenir sur ce qui a été validé : ce document et le journal des décisions font foi. Toute nouvelle idée qui toucherait un point validé doit être présentée comme un changement, avec son impact, et jamais appliquée d'office.

## 1. Exigences de finition

1. **Fidélité aux maquettes** : composition, couleurs, tailles, espacements et comportements. Avant de montrer un écran, le comparer côte à côte avec la maquette, à la même taille. La reproduction au pixel près n'est pas visée, puisque les maquettes sont des images générées.
2. **Finition exceptionnelle des cartes**, au niveau des maquettes : trait de côte réel, pastilles à anneau, onde au toucher, vent animé fluide, panneaux translucides, ombres douces.
3. **Qualité de l'information** : chaque chiffre affiché a sa source et son heure. Ce qui n'a pas de source sûre n'est pas affiché. Rien n'est inventé.
4. **Même niveau partout** : chaque écran de l'application reçoit le même soin de détail et la même qualité d'information que les trois vues de référence.

## 2. Home

- **En-tête** :
  - médaillon SPUMY et mot SPUMY ;
  - le slogan « Read the sea. » sur la première ligne et « Fish the moment. » en orange sur la seconde, comme sur la maquette (V3-028 : le slogan est autorisé) ;
  - contraste de l'orange sur le fond marine mesuré : grand texte, 3:1 au moins.
- **Deux cartes de mode** : Shore (« Du bord · Bar ») et Offshore (« En bateau · Toutes espèces »).
  - Elles portent les logos Inshore et Offshore d'origine (`assets/brand/sources/inshore.jpg`, `offshore.jpg`), sans aucune retouche.
  - Le mode actif a un contour orange.
- **Champ de lieu** avec le bouton de localisation, en mode automatique ou manuel.
- **Jours** : Aujourd'hui, Demain, 7 jours.
- **Carte principale** :
  - photo marquée « Illustration » ;
  - phrase de synthèse avec le créneau (« Très bonne matinée pour le bar : 07:10–10:20 ») ;
  - ligne « à moins d'1 h d'ici · spot · mot du palier » ;
  - vigilance avec sa source et son heure ;
  - bande de 24 h où **chaque heure prend la couleur de son vrai score**, avec le repère « maintenant » et les heures 00, 06, 12, 18, 24.
- **Dessous** : les 3 cartes de spots, aux règles validées (place réservée au plus proche, « À vérifier » à part, égalités, pénurie), au même niveau de finition.
- **Partie haute fixe** :
  - tout en haut de la page, elle s'affiche en entier ;
  - quand on fait défiler, elle se resserre en une bande fixe : Shore / Offshore avec les petits logos, le lieu, le jour ;
  - elle reprend sa taille quand on remonte.
- **Barre du bas** : Home, Carte, Météo, Profil, avec le trait orange au-dessus de l'onglet actif. Ordre réglable dans Profil (validé).

## 3. Carte : la vue pêche

- **En haut** :
  - médaillon et mot SPUMY ;
  - bascule Shore / Offshore en pastille ;
  - champ de lieu (« Pirou ») avec le bouton de localisation.
- **Filtres** : « Tous n », « Favorables n » avec un point vert, « À vérifier n » avec le signe ⚠.
  - Les compteurs sont égaux aux pastilles ;
  - la règle de chaque filtre est affichée (validé).
- **Fond** :
  - trait de côte réel, d'après des contours publics ;
  - courbes de profondeur **seulement d'après des données réelles** : EMODnet Bathymetry (CC BY 4.0, grille d'environ 115 m) ou relevés du Shom (licence ouverte Etalab 2.0), avec la source, la précision et la mention « ne pas utiliser pour la navigation » ;
  - sans données réelles, **aucune courbe**.
- **Pastilles** :
  - disque sombre, score en crème, anneau de la couleur du palier (palette validée ; 60 à 74 en jaune) ;
  - nom du spot à côté, caché quand on dézoome ;
  - onde au toucher ;
  - « À vérifier », « Non recommandé » et « Sans note » gardent leur marque validée (⚠, score barré, pastille vide).
- **Spots à leur vraie position** : ceux de la maquette sont des spots V2 de Pirou (`data/sites/pirou.config.js`). Les scores restent des données de démonstration, marquées comme telles.
- **Toucher un spot** ouvre une bulle à côté de lui :
  - nom ;
  - « 3,4 km · 8 min » ;
  - tes sorties et tes poissons, tirés du journal de l'appareil ;
  - « Meilleur moment : 07:10–10:20 ».

  Retoucher le spot ferme la bulle. Un bouton de fermeture et la touche Échap la ferment aussi.
- **Boutons à droite** : Me localiser, Couches, Vue d'ensemble, avec un + et − discrets.
- **Légende** dépliable : les 6 paliers.
- **Pas de vent** sur la Carte.

## 4. Météo : la vue conditions

- **En haut** : même en-tête, avec la bascule Shore / Offshore et le champ de lieu.
- **Jours** : Aujourd'hui, Demain, 7 jours.
- **Vent animé en couleurs**, comme dans la vidéo : traînées et nappe de couleurs.
  - Légende du vent en nœuds.
  - Les pastilles restent lisibles par-dessus.
  - L'animation s'arrête quand l'écran n'est pas visible et devient une image fixe si l'on demande moins d'animations.
- **Pastilles** : les mêmes que sur la Carte.
- **Toucher un spot** ouvre un panneau à droite ; retoucher le spot le ferme, comme le bouton de fermeture et la touche Échap.
  - La carte se décale pour que le spot touché reste visible ; le panneau ne masque ni les jours ni la pastille.
  - **Contenu, dans l'ordre** :
    1. nom et score du spot touché ;
    2. Sécurité, en tête ;
    3. ciel ;
    4. air ;
    5. eau ;
    6. vent, en nœuds avec la direction ;
    7. houle ;
    8. pression ;
    9. marée (montante ou descendante, avec l'heure).
  - Chaque valeur a sa source et son heure, sans aucune ligne en double.
- **Boutons et légende** : comme sur la Carte.

## 5. Reste de l'application, au même standard

Fiche spot, Comparaison, Journal, Profil, Home Offshore et ses vues, feuille de position, écran de lancement, et le thème clair (« plein soleil »), redessiné dans le même style.

## 6. Corrections des maquettes (validées par Félix)

1. Le panneau montre le spot touché. Dans la vidéo, toucher Baie de Sienne (54) ouvre Pointe d'Agon (84).
2. Aucune ligne en double : « Vent » apparaît deux fois, et « Pluie » avec « Probabilité de pluie ».
3. Le panneau ne masque ni les jours ni les pastilles.
4. Cap de Carteret (62) a un anneau jaune, pas orange.
5. Le panneau commence par la sécurité.
6. Les spots sont à leur vraie position : Cap de Carteret au nord de Pirou, Pointe d'Agon au sud.
7. La vue de la vidéo est l'onglet Météo : le passage à Carte en cours de vidéo est une erreur de génération.
8. « Meilleur moment » remplace « Prime ».
9. La bande de 24 h colore chaque heure selon son vrai score.
10. Les noms des spots se cachent quand on dézoome.
11. La distance s'affiche en « km · min » ; la limite de 60 min de route reste la règle.

## 7. Ce qui ne change pas (validé, à ne pas rediscuter)

- **Logos** : le logo BRAND garde son poisson et son orange #C76A31 intacts. Les logos Inshore et Offshore sont utilisés sans retouche.
- **Scores** :
  - deux scores seulement, Favorabilité et Confiance ; la Confiance ne change jamais le rang ;
  - six paliers de couleur ;
  - « Favorables » : 75 ou plus, sécurité permise, rien à vérifier ;
  - « À vérifier » à part ;
  - la sécurité ne se compense jamais.
- **Recommandations** : 3 cartes, place réservée au plus proche (15 min ou moins), égalités, pénurie sans carte inventée.
- **Géographie** : aucun découpage géographique ; 60 min de route au plus en Shore.
- **Navigation** :
  - 4 onglets, Home, Carte, Météo, Profil, dont l'ordre se règle dans Profil ;
  - barre qui défile ;
  - Journal accessible depuis Home et Profil.
- **Photos** : pas de vraies photos de spots ; les photos sont marquées « Illustration ».
- **Accessibilité** : cibles de 44 px au moins, texte de 12 px au moins, WCAG 2.2 AA, deux thèmes.
- **Textes à l'écran** : ni « V2 », ni « phase », ni note sur 10, ni Pertinence. Le seul slogan est celui de V3-028.
- **Données** : les données de démonstration sont marquées comme telles.

## 8. Travaux, dans l'ordre

1. Règle du slogan mise à jour : `CLAUDE.md`, V3-028, UX-03 (fait le 23 nov.).
2. Données :
   - trait de côte public ;
   - essai de récupération des profondeurs EMODnet ou Shom pour Pirou ;
   - si l'espace de travail est bloqué, demander à Félix un seul fichier, en lui disant lequel.
3. Composants communs :
   - en-tête et bascule ;
   - champ de lieu ;
   - filtres et jours ;
   - pastille à anneau et onde ;
   - bulle, panneau, boutons et légende ;
   - barre du bas.
4. Écrans de référence : Carte, Météo, Home, chacun comparé côte à côte avec sa maquette.
5. Reste des écrans (§ 5).
6. Tests :
   - mise à jour de `tests/prototype-v3.mjs` pour la nouvelle mise en page ;
   - toutes les règles gardées ;
   - axe, 44 px, 12 px, captures, planches de comparaison avec les maquettes.
7. Documents : Design System, UX-V3, PROTOTYPE-V3, revues (complément), galerie AVANT/CIBLE, exigences touchées (MAP-02, MET-01, UX-05, UX-09).
8. Revalidation par Félix, complément au rapport de phase 3, puis jeton de phase 4.
