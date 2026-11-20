# Prototype interactif V3 (phase 3.6)

20 novembre 2026. Prototype haute fidélité **sur la base de UX-V3 version 2** (jalon 1 validé avec remarques, V3-023) et du Design System V3 (V3-022, proposé ; V3-021 : seuil « Favorables » à 75).

**Version 2** (20 nov., après le retour de Félix au jalon 2, V3-025) :
- photos en 1 600 px, une par carte, par espèce et par sortie du journal ;
- nuit marine par défaut ;
- cartes allégées avec disque de score ;
- pastilles-étiquettes avec le score ;
- compteurs égaux aux pastilles ;
- barre déplaçable au doigt, à la souris et à la molette, avec chevrons cliquables ;
- Météo redessinée, avec sa légende.

**Version 3** (20 nov., 14 h 46, demande de Félix) :
- carte déplaçable et zoomable (glisser, molette, pincement, double-clic, boutons + et − et « vue d'ensemble »), pastilles de taille constante ;
- feuille glissante à trois hauteurs, aimantée ;
- transitions entre écrans, désactivées si le mouvement est réduit ;
- rythme de 16 px dans les écrans et de 40 px entre les sections ;
- au plus trois tailles de texte par carte (30, 19 et 14 px), vérifié par test.

**Version 4** (20 nov., 15 h 02, demande de Félix) :
- **logo SPUMY** dans l'en-tête de tous les écrans (médaillon de 40 px, mot SPUMY à côté sur bureau) ;
- favicon, icône iOS et manifeste avec l'icône adaptative, tous tirés des exports V3 du logo ;
- cartes de spot compactes : score posé sur la photo, une ligne de faits (sécurité, route, Confiance) et la raison ; partie sous la photo de 110 px au plus ;
- 32 px entre deux spots.

**Version 5** (20 nov., 15 h 08, « pas top tier ce que tu as fait avec le logo ») :
- **écran de lancement** : le logo complet d'origine (symbole et mot SPUMY) sur son fond crème, en plein écran pendant 1,5 s (un appui le passe) ;
- **en-tête de marque** : médaillon de 44 px et mot SPUMY en Montserrat ; la bascule BORD / BATEAU passe sur une seconde ligne, pleine largeur ;
- **icônes** de l'application refaites sur le fond crème d'origine (symbole plein cadre), comme le logo ;
- Profil, à propos : le logo complet sur son fond ;
- carte : vue d'ensemble au départ (tous les spots visibles), regroupement des pastilles trop proches (nombre compté dans les filtres), recherche repliée derrière une loupe.

Vraies photos de spots : abandonnées (V3-026). Le fond IGN réel arrive aux phases 4 et 10 : la page de revue bloque les tuiles, et elles ne sont pas joignables d'ici.

**Statut** : à revalider au jalon 2, avec la direction visuelle et les principes du Design System. Toutes les données sont **de démonstration**, et l'écran le dit en permanence. Le prototype n'appelle aucun service : ni météo, ni route, ni géocodage, ni tuiles.

## Où le voir

- **Page de revue** : artefact « Prototype SPUMY V3 » (privé), construit avec `node scripts/build-prototype-v3.mjs --revue <dossier>`.
- **Dans le dépôt** : `prototype-v3/`, construit par `npm run build:prototype-v3`. Les photos et le logo sont lus dans `../assets`. Ce dossier sera publié avec le site seulement si Félix accepte la fusion.
- **Captures** à 390 × 844 : `docs/design/prototype-v3/*.webp`, 11 images, nuit marine (et deux en plein jour), plus le bureau.

## Ce qu'on peut faire

| Écran | Interactions |
| --- | --- |
| En-tête | bascule BORD / BATEAU ; puce de position en haut à droite, qui ouvre la feuille de position (automatique ou manuel, me géolocaliser, lieu modifiable avec propositions pendant la frappe seulement, épingle) |
| Barre | 4 onglets visibles (Home, Carte, Météo, Profil) ; on la fait glisser pour voir Journal ; fondu et chevron du côté où elle peut défiler ; sur bureau, tous les onglets en haut |
| Home BORD | photo de fond (automatique selon la lumière, ou choisie dans Profil), phrase de synthèse, jours, frise du jour, 3 cartes avec les horaires en tête, place réservée « Le plus proche », zone « À vérifier », Comparer, Noter une sortie |
| Home BATEAU | choix du bateau (enregistré, ou saisi pour la sortie), verdict sur le pire moment, 3 marques avec leurs espèces, rappels, carte marine notée comme bonus à étudier |
| Carte | filtres avec compteurs exacts (Favorables = 75 ou plus, sécurité permise, pas à vérifier), pastilles à 6 paliers (anneau double, « ? », barrée, vide, carrée, sélectionnée), groupe, légende, feuille à aperçu ou liste ; sur bureau, liste à gauche |
| Météo | flèches de vent sur une grille de points, force et rafales écrites, avertissement à partir de force 6, curseur horaire sur 48 h, résumé, courbe vent et rafales ; en BATEAU, couche Mer |
| Fiche spot | photo marquée « Illustration », Favorabilité et Confiance, sécurité, courbe de marée avec heures favorables coloriées au palier (appui : heure et hauteur), indicateurs du jour, approche, stratégie, leurres conseillés, « Pourquoi ? » |
| Comparaison | sécurité, **vent** (force, rafales, exposition), Favorabilité, Confiance, horaires, route, règles, raison ; écart chiffré ou « avantage non établi » |
| Journal | sortie en cours, ajout rapide (enregistrement avec « Annuler »), états typés |
| Profil | Journal, bateaux, **ordre des onglets** (flèches ; poignées dessinées), photo de fond de Home, thème (système, clair, sombre), panneau « Démonstration : états » |

**Panneau « Démonstration : états »**, dans Profil :
- hors ligne ;
- chargement ;
- moins de 3 spots ;
- égalité au dernier rang ;
- aucun spot à 1 h ou moins ;
- premier lancement, avec la demande d'autorisation simulée ;
- position refusée.

Il n'existe pas dans l'application.

## Preuves

| Commande | Code de sortie | Résultat |
| --- | --- | --- |
| `npm run test:prototype-v3` (construction, puis `tests/prototype-v3.mjs --axe`) | 0 | 153/153 |
| `npm run test:design-v3` | 0 | 184/184 |
| `npm run -s lint` ; `node tests/layers.mjs` | 0 ; 0 | aucun écart ; 253 couleurs en dur hors de `src/design/`, inchangé |

`tests/prototype-v3.mjs` vérifie :
- 10 écrans à 320, 375 et 390 px et sur bureau, dans les deux thèmes, sans erreur ni défilement horizontal ;
- les règles de Home : phrase et horaires, 3 cartes, « Le plus proche », « À vérifier » hors des cartes ;
- la Carte : « Favorables » = 3, compteur égal aux pastilles, signes des pastilles ;
- la fiche : courbe, danger avant la marée, fixture « 53/100 — À vérifier » ;
- la comparaison : vent, écart chiffré, « avantage non établi » ;
- la barre : 4 onglets visibles, Journal hors champ, chevrons, ordre modifié ;
- la Météo : grille de flèches, curseur, couche Mer ;
- BATEAU : choix du bateau avant le verdict ;
- axe-core (WCAG 2.2 A et AA) sur 6 écrans dans les deux thèmes : aucune violation grave ni critique.

## Limites connues

- Fond de carte schématique, côte inventée, et données inventées : aucune décision ne doit s'appuyer sur les chiffres.
- Glisser-déposer des onglets : seules les flèches fonctionnent ; les poignées sont dessinées.
- Demain et 7 jours : seule la journée d'aujourd'hui est remplie.
- Les composantes de « Pourquoi ? », la réglementation et les sources sont des textes d'exemple.
- Test utilisateur : **NON EFFECTUÉ** (à faire avec les proches de Félix, § 3.7).
