# Registre des exigences — SPUMY V3

Phase 2 V3, 20 novembre 2026. Format du référentiel, § 5.2.

**Version 3** (23 nov. 2026, V3-029) : 97 exigences ; MAP-09 et MET-05 ajoutées, UX-03 modifiée (V3-028).

**Version 2** (20 nov. 2026, jalon 1 de la phase 3) : 95 exigences ; MET-01 à MET-04, UX-08, UX-09, PRO-03, SPOT-09, BAT-09, BAT-10 et MAP-08 ajoutées, UX-05 modifiée (V3-023).

**Colonnes**
- **Prio.** : `IND` indispensable, `IMP` importante, `SEC` secondaire, `EXP` expérimentale.
- **Origine** : référentiel (§), décision (ADR, `docs/DECISIONS_LOG.md`), audit de la phase 1 (D1 à D14) ou hypothèse (H, `docs/design/DISCOVERY.md`).
- **V2** : état de la version en ligne (`Conforme`, `Partiel`, `Non conforme`, `Absent`).
- **Statut V3** : `NOT STARTED` pour toutes les exigences ; elles passent `IMPLEMENTED`, `TESTED` puis `VALIDATED` avec leurs preuves.
- **Vérif.** :
    - `U` test unitaire ;
    - `I` intégration ;
    - `E` parcours de bout en bout (Playwright) ;
    - `V` revue visuelle sur captures ;
    - `T` test utilisateur ;
    - `R` revue de données ou de documents.

Validation : registre validé par le jeton de la phase 3 (20 nov. 2026, 4 h 25). Les exigences liées à une décision « à décider » restent `À DÉCIDER` ; les décisions du 20 nov. à 4 h 18 (V3-011, V3-014, V3-015, V3-016) sont appliquées.

## POS — Position de référence (BORD et BATEAU)

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POS-01 | Deux actions toujours visibles, « Me géolocaliser » et « Saisir une position », depuis Décision et Carte | IND | § 8.1 ; V3-010 | atteintes en un geste depuis les deux écrans, aux largeurs 320 à 1 280 px | E, V | Partiel (« les plus proches de moi » sur l'accueil seulement) | 3, 10 |
| POS-02 | Géolocalisation seulement sur demande ; un refus laisse la saisie manuelle disponible tout de suite ; jamais de région par défaut | IND | § 8.1 | permission refusée : la saisie s'ouvre, aucune position ni région n'est inventée | E | Partiel | 10 |
| POS-03 | Saisie par recherche avec suggestions (ville, adresse, code postal, lieu, coordonnées), puis épingle déplaçable ; confirmation si le résultat est ambigu ou imprécis | IND | § 8.1 ; V3-009 (géocodage IGN) | 3 recherches types aboutissent ; une recherche ambiguë demande de choisir | E | Absent | 10 |
| POS-04 | Contrat de position : `lat`, `lon`, `precisionM`, `source` (`DEVICE` ou `MANUAL`), `at`, `validUntil`, `permission`, `explicit` ; une position imprécise n'est jamais rendue précise ; aucun historique | IND | § 8.1 ; V3-010 | contrat typé (V3-020) et testé ; aucune position antérieure stockée | U, R | Absent | 4, 10 |
| POS-05 | Position active visible sous un libellé compréhensible ; modifiable sans recommencer un parcours ; retour à la position actuelle | IND | § 8.1 | libellé présent sur Décision et Carte ; modification en 2 gestes au plus | E, V | Absent | 3, 10 |
| POS-06 | Changer de position met à jour la liste, la carte, les temps de route et les recommandations, avec l'heure de mise à jour | IND | § 8.1 | après un déplacement, liste, marqueurs et compteurs concordent (QA-02) | E | Absent | 10 |
| POS-07 | États gérés : permission accordée, refusée ou non demandée ; position indisponible, imprécise ou obsolète ; hors réseau ; géocodage en échec ; aucun spot à proximité | IND | § 8.1 | un message et une sortie pour chacun des 9 états | E, V | Absent | 3, 10 |

## RTE — Temps de route (BORD seulement)

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RTE-01 | Seuls les spots à 60 min ou moins de route réelle, depuis la position active jusqu'à l'accès du spot, sont proposés en BORD ; seuil réglable selon les décisions | IND | § 0.5, § 8.1 ; V3-007 ; D3 | spot à 59 min gardé, spot à 61 min écarté (service simulé) | U, E | Non conforme (temps fixes depuis le pôle du guide, 45 min dans la Pertinence) | 10 |
| RTE-02 | Un temps vérifié porte son fournisseur, son heure et sa validité ; hors ligne ou en échec, une estimation est marquée « estimation » et n'est jamais présentée comme vérifiée | IND | § 8.1 ; V3-009 | rendu distinct des deux états ; aucun « vérifié » sans réponse du service | E, V | Absent | 10 |
| RTE-03 | Aucun seuil routier en BATEAU | IND | § 8.1 | le mode BATEAU n'appelle jamais le routage | U | Conforme | 10 |
| RTE-04 | Point d'accès du spot (stationnement ou départ du sentier) distinct du poste ; tant qu'il manque, la position du poste sert et le temps le signale | IMP | § 7.4, § 8.1 | champ `access` dans le schéma ; mention « jusqu'au poste » si l'accès manque | R, V | Absent | 5, 7 |

## REC — Moteur et classement

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REC-01 | Deux indicateurs sur 100, Favorabilité et Confiance, jamais fusionnés ni multipliés | IND | § 9.1 ; V3-006 | aucune note composite dans le code ni à l'écran | U, V | Partiel (trois scores) | 6, 10 |
| REC-02 | Pertinence supprimée : ni calculée, ni affichée, ni stockée comme score, ni utilisée pour filtrer, trier, pondérer ; champs V2 gardés en lecture pour la migration seulement | IND | § 9.1 ; V3-006 ; D2 | test : les anciens champs n'ont aucun effet sur le calcul, l'ordre ou l'écran | U, E | Non conforme | 6, 10 |
| REC-03 | La Confiance ne modifie jamais la Favorabilité ni le rang ; elle peut imposer une fourchette, un « — » ou « à vérifier » | IND | § 9.1.5 | test d'invariance du rang (§ 13.2) | U | Conforme (rang) ; Absent (précision affichée) | 6 |
| REC-04 | Ordre : sécurité ; puis « à vérifier » séparé ; filtres opérationnels validés ; Favorabilité décroissante ; départage validé (temps de route) | IND | § 9.1.6 | ordre de la liste conforme sur 10 cas de test | U, E | Partiel (Pertinence et temps fixe dans l'ordre) | 6, 10 |
| REC-05 | 3 cartes par défaut ; 4 ou 5 en cas d'égalité stricte au dernier rang ; plus de 5 ex æquo : 5 et un accès aux autres ; jamais complétées par un spot bloqué ou « à vérifier » | IND | § 9.1.7, § 6.6 ; D4 | cas d'égalité et de pénurie testés | U, E | Non conforme | 6, 10 |
| REC-06 | Place réservée à un spot admissible à 15 min ou moins de route vérifiée, sans bonus de Favorabilité, jamais à un spot « à vérifier » ou bloqué | IND | § 9.1.7 ; V3-016 ; H8 | cas : spot proche hors des 3 premiers → 3ᵉ place ; aucun spot proche admissible → rien de réservé | U | Non conforme (zone « local ») | 6 |
| REC-07 | « À vérifier » ne dépend jamais du seul chiffre et reste visible dans la liste, sur la carte et dans la fiche | IND | § 6.7.2, § 9.1.5 | même spot, même statut sur les trois vues | E, V | Conforme | 3, 10 |
| REC-08 | Une donnée absente n'est jamais remplacée par zéro ni par une valeur neutre ; la couverture est affichée ; pas de note si les données critiques manquent | IND | § 9.1.5 | « calculée sur N % des critères » ; « — » sous le seuil | U, V | Conforme | 6 |
| REC-09 | Fenêtre horaire `HH:MM–HH:MM`, ou « Fenêtre non déterminable » avec sa raison ; la comparaison signale des fenêtres différentes | IND | § 9.1.7, § 6.7.4 | format testé ; message de fenêtres différentes | U, V | Partiel (format « 08h30 → 12h30 ») | 3, 10 |
| REC-10 | La boîte à leurres n'agit sur aucun indicateur ni sur le rang ; le conseil générique est identique, quelle que soit la boîte | IND | § 9.1.6, § 13.2 | test d'invariance avec 3 boîtes | U | Non conforme (Pertinence) | 6, 10 |
| REC-11 | Favorabilité BORD refondée sur la biologie du bar ; paramètres tracés, calibrés et éprouvés | IND | § 9.1.1 à 9.1.9, § 9.2, § 9.3 | spécification validée (Phase 6) ; épreuve (Phase 8) | R, U | Partiel (moteur v2 éprouvé ; stabilité FAILED en phase 8 V2) | 5 à 8 |
| REC-12 | Aucune note sur 10 : option v1 retirée en BORD ; modèle BATEAU présenté « d'après tes sorties » | IND | V3-015 ; D9 | aucun « /10 » ni « sur 10 » dans le build ; clé `bar:moteur` ignorée | U, V | Non conforme | 6, 9 |

## SEC — Sécurité

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-01 | Sécurité indépendante, prioritaire, jamais compensée ; règles propres à BORD et à BATEAU | IND | § 9.5 | aucun « non recommandé » ne remonte, quelle que soit la Favorabilité | U | Conforme | 6, 10 |
| SEC-02 | Une donnée de sécurité inconnue (vent, rafales, houle, visibilité) n'est jamais « au vert » | IND | § 9.5 | tests par donnée manquante | U | Conforme | 6 |
| SEC-03 | Vigilance Météo-France lue par un relais qui garde la clé hors du dépôt ; en panne ou en attente, rappel explicite et lien ; une vigilance inconnue ne vaut jamais « aucune vigilance » | IND | § 9.5 ; V3-011 ; D10 | selon V3-011 ; jamais de vert sur une vigilance inconnue si elle est lue | U, E | Partiel (rappel seulement) | 9, 10 |
| SEC-04 | Danger d'un spot engagé visible au premier niveau ; nuit sur un spot engagé « non recommandé » | IND | § 9.5 ; décision V2 | visible sans ouvrir de détail | V, U | Conforme | 3 |
| SEC-05 | Seuils de sécurité validés par Félix avant toute mise en ligne (BORD : validés le 13 nov. 2026 ; BATEAU : questions 16 à 25 ouvertes) | IND | § 0.2 ; V3-014 | décision consignée dans `DECISIONS_LOG` | R | Partiel | 6, 9 |

## MAP — Carte

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MAP-01 | Carte centrée sur la position active, cadrée sur les spots retenus | IND | § 6.9 ; D11 | position et spots visibles sans geste, aux 4 largeurs | E, V | Non conforme | 3, 10 |
| MAP-02 | Remplissage du marqueur = palier de Favorabilité seulement ; « à vérifier », « non recommandé » et « pas de note » par des signes distincts | IND | § 6.7.4 | légende et rendu conformes | V | Conforme | 3 |
| MAP-03 | Pas de chevauchement illisible (regroupement ou décalage) ; zone tactile de 44 px au moins | IND | § 6.9, § 6.10 ; D11 | capture de la côte de Carteret sans chevauchement | V, E | Non conforme | 3, 10 |
| MAP-04 | Accord exact entre liste, marqueurs et compteurs de filtres | IND | § 13.2 | test croisé sur 3 positions | E | Conforme (par guide) | 10 |
| MAP-05 | Fond de carte attribué ; hors ligne, un message clair ; aucun préchargement interdit | IND | § 8.5 ; V3-012 | attribution visible ; aucune requête de tuile hors de la vue | E, R | Conforme | 3, 10 |
| MAP-06 | Chaque spot a une position en décimales, sourcée ; une position imprécise est signalée tant qu'elle n'est pas corrigée | IND | § 7.4 ; D8 | 66 spots sur 66 en décimales, ou signalés | R | Non conforme (7 spots) | 5, 7 |
| MAP-07 | Carte utilisable sur téléphone et sur ordinateur (taille adaptée à l'écran) | IMP | § 6.11 ; D11 | captures 320, 390, 1 280 px | V | Non conforme | 3 |
| MAP-08 | Filtre « Favorables » : Favorabilité affichée de 75 ou plus, sécurité permise, pas « à vérifier » ; jamais « sans danger » | IND | V3-021 | bornes 74 et 75 testées ; compteur égal aux pastilles | U, E | Partiel (seuil 65) | 3, 10 |
| MAP-09 | Carte = typologie du terrain : pour chaque spot, fond, terrain, structure, exposition et courant, avec leur effet favorable ou défavorable sur la pêche du bar, l'explication, la source et le niveau de preuve (1 à 5) ; couches de terrain (natures de fonds, profondeurs, estran, courants) seulement d'après des données réelles | IND | V3-029 | chaque effet affiché renvoie à une source et à un niveau ; aucune couche sans source | U, E | Partiel (rubriques des spots, sans effet affiché) | 3, 5, 10 |

## SPOT — Fiches, données et spots personnels

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SPOT-01 | Les 66 spots V2 sont conservés, avec leurs identifiants (V3-018), leurs sources et leur historique | IND | § 0.2, § 7.3 | test de données : 66 identifiants présents, aucune source perdue | U | Conforme | toutes |
| SPOT-02 | Schéma de fiche du § 7.4 : postes, accès, stationnement, approche, marée par phase, courants, houle, vent, exposition, profondeur, structures, stratégies, dangers ; chaque rubrique avec sa source et son niveau de preuve | IND | § 7.4 | validation du schéma (`data/schema`) | U, R | Partiel | 5, 7 |
| SPOT-03 | Approches par phase de marée (§ 7.5) et fenêtres horaires de fonctionnement (§ 7.6) | IND | § 7.5, § 7.6 | présentes ou marquées inconnues pour chaque spot | R | Partiel | 5, 7 |
| SPOT-04 | Réglementation contextualisée : zone, espèce, taille, période, quota, source officielle, date de vérification | IND | § 8.3 | chaque règle a sa source et sa date | R | Conforme (onglet Règles) | 5, 9 |
| SPOT-05 | « Leurres conseillés » dans la fiche : conseil générique d'abord, sans inventaire ; sélection personnelle ensuite, quand Matériel existera | IND | § 7.4.1 ; H10 | conseil présent avec une boîte vide | U, V | Partiel (onglet Matériel séparé) | 3, 10 |
| SPOT-06 | Ajout manuel d'un spot, privé par défaut, sans rattachement à un guide | IND | § 4.1 ; V3-007 | le spot ajouté est classé depuis la position, comme les autres | E | Partiel (rattaché au guide le plus proche) | 10 |
| SPOT-07 | Couverture BORD étendue de la Bretagne à Cherbourg, sans fabrication, chaque ajout sourcé | IMP | § 0.5, § 7.2 | revue indépendante (Phase 8) | R | — | 5, 7, 8 |
| SPOT-08 | Une photo de spot n'est montrée que si le lieu et la provenance sont vérifiés ; sinon, elle est marquée « Illustration » | IND | § 6.12 | aucune photo d'ambiance sans mention | V | Conforme | 3 |
| SPOT-09 | Fiche : courbe de marée du jour (basse et pleine mer, coefficient, nuit, « maintenant »), heures favorables coloriées au palier de leur Favorabilité et horaires écrits ; indicateurs du jour (vent et exposition, vagues, eau, pression, ciel, lune) avec source et heure | IND | V3-023 (jalon 1) | courbe juste contre le calcul de marée ; horaires identiques à ceux de Home | U, V | Partiel (Marée, frise) | 3, 7 |

## JRN, PRO, MAT — Journal, Profil, Matériel

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| JRN-01 | États typés : `capture`, `sans_capture`, `resultat_inconnu`, `incomplete`, `annulee`, `absence_saisie` ; une absence de saisie n'est jamais une bredouille | IND | § 8.4 | 6 états testés ; aucune conversion implicite | U | Partiel | 13 |
| JRN-02 | Démarrage simple ; saisie facultative ; entrées corrigibles | IND | § 8.4.1 ; H9 | une sortie sans prise notée en 3 gestes | E, T | Partiel | 13 |
| JRN-03 | Journal V2 (BORD et BATEAU) migré sans perte | IND | § 0.2 ; Gate C | test de mise à jour avec un journal V2 réel anonymisé | U | — | 4, 13 |
| JRN-04 | Export du journal ; point d'entrée à décider | IMP | § 4.3 | format et emplacement décidés, puis testés | E | Partiel (Transfert, dans les réglages) | 13 |
| JRN-05 | Apprentissage personnel : aucune conclusion sur trop peu de sorties ; séparé par mode et par espèce | IND | § 9.1.9 | seuils de sessions testés | U | Conforme (BORD : 5 sessions dont 2 avec prise ; BATEAU : 8 sorties) | 6, 13 |
| PRO-01 | Profil : informations facultatives, préférences, statistiques personnelles ; aucun onglet Statistiques | IMP | § 4.3, § 6.4 | onglet Profil présent, sans page de statistiques séparée | V | Absent | 13 |
| PRO-02 | Indicateurs du Profil choisis après étude et validation, pas figés d'avance | IMP | § 4.3 | liste validée par Félix | R | — | 13 |
| PRO-03 | Profil, Affichage : ordre des onglets de la barre, photo de fond de Home, thème, mode terrain ; Profil, Mes bateaux : un ou plusieurs profils, l'un par défaut | IMP | V3-023 | réglages enregistrés sur l'appareil et rétablis | E | Absent | 3, 13 |
| MAT-01 | Onglet Matériel affiché seulement quand son contenu existe ; inventaire des leurres au dernier lot ; boîte V2 migrée | SEC | § 4.3, § 6.4 | aucun onglet vide ; boîte V2 retrouvée | E | Partiel (onglet présent) | 12 |

## BAT — Mode BATEAU

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BAT-01 | Aucune fonction BATEAU en ligne perdue : spots bateau personnels (GPS ou carte), conditions sur 7 jours, sorties et prises, modèle appris | IND | § 4.1 ; Gate A | parcours e2e V2 du mode BATEAU repris et verts | E | Conforme | toutes |
| BAT-02 | Données BATEAU V2 (spots, sorties) migrées sans perte | IND | § 0.2 | test de mise à jour | U | — | 4 |
| BAT-03 | « Sortir aujourd'hui ? » : profil du bateau, règles de sécurité sur le pire moment du créneau, zone par zone, avant les espèces | IND | V3-014 ; branche phase 13 | 16 scénarios de la spécification BATEAU | U, E | Absent en ligne (branche) | 9, 10 |
| BAT-04 | Seuils BATEAU (vent, mer, marges, nuit, seul à bord) validés par Félix avant mise en ligne | IND | SEC-05 ; questions 16 à 25 | décisions consignées | R | — | 9 |
| BAT-05 | Espèces proposées avec leur réglementation, sourcée et datée (fermeture du lieu jaune, tailles) | IND | § 8.3 | sources et dates présentes | R, U | Absent en ligne (branche) | 9 |
| BAT-06 | Aucune Pertinence en BATEAU | IND | V3-006 | — | U | Non conforme (branche) | 9 |
| BAT-07 | Aucun temps ni faisabilité nautique sans données suffisantes ; aucun seuil routier | IND | § 8.1 | — | U | Conforme | 9 |
| BAT-08 | Passage d'un mode à l'autre clair, sans perte de contexte ni mélange de règles | IND | § 6.3, § 6.4 | test de tâche 6 ; aucune donnée BORD dans BATEAU | E, T | Partiel (onglets de l'accueil) | 3 |
| BAT-09 | Bateau de la sortie : profil enregistré dans Profil, ou saisie pour cette sortie (avec enregistrement possible) ; aucun verdict sans l'un ou l'autre | IND | V3-023 (jalon 1) | les deux chemins mènent au verdict | E | Absent | 3, 9 |
| BAT-10 | Carte marine (épaves, hauts-fonds, balisage) en couche facultative de la Carte BATEAU, seulement après vérification des sources et des licences ; jamais présentée comme une carte officielle | EXP | V3-024 | sources et licences vérifiées, avertissement affiché | R | Absent | à décider |

## MET — Onglet Météo

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MET-01 | Carte du vent autour de la position de référence : flèches sur une grille régulière, force et rafales écrites, direction, heure par heure sur 48 h, puis 7 jours | IND | V3-023 (jalon 1) | flèches justes contre les données reçues ; heure choisie gardée | U, V | Absent (onglet Météo V2 sans carte) | 3, 6 |
| MET-02 | BATEAU : couche Mer (hauteur, période, direction des vagues) aux mêmes points | IMP | V3-023 | couche testée en BATEAU seulement | U, V | Absent | 3, 9 |
| MET-03 | Aucun découpage géographique (grille de points, aucune zone nommée) ; couleur neutre, distincte des paliers de Favorabilité ; avertissement écrit à partir de force 6 | IND | § 0.2 ; V3-023 | aucune couleur de palier ni nom de zone dans la couche | U, V | — | 3 |
| MET-04 | Résumé du lieu de référence (vent, mer, eau, pression, pluie, vigilance, soleil) et courbes du jour ; source, modèle et âge toujours écrits ; hors ligne : dernière prévision avec son âge | IND | § 6.11 ; DATA_SOURCES | source et âge visibles dans tous les états | E, V | Partiel | 3, 6 |
| MET-05 | Météo = explication scientifique : pour chaque élément (vent et son orientation à la côte, rafales, houle, pression, température de l'eau, ciel et lumière, pluie, marée, coefficient, courant), l'effet favorable ou défavorable sur la pêche du bar, pourquoi, la source et le niveau de preuve ; sans connaissance sourcée, la valeur s'affiche sans effet annoncé | IND | V3-029 | chaque effet renvoie à une connaissance sourcée (`data/knowledge/bar-bord.json`) | U, E | Absent | 3, 5, 6 |

## UX — Identité, interface, accessibilité

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UX-01 | Logo BRAND : poisson et orange #C76A31 intacts dans tous les exports ; contrôle automatique de la zone protégée | IND | § 6.1.1 ; V3-002 ; D1 | test pixel à pixel de la zone protégée de chaque export contre la source | U, V | Non conforme (variante sombre) | 3 |
| UX-02 | Palette #F07824, #172B3A, #344B5A, #F3F1EB ; aucun cyan structurant ; jetons sémantiques ; `brand-logo-orange` distinct de `accent-orange` | IND | § 6.2 ; D6, D7 | jetons et contrastes mesurés (WCAG 2.2 AA) | U, V | Non conforme | 3 |
| UX-03 | Aucun slogan sauf « Read the sea. Fish the moment. » en tête de Home (V3-028) ; aucune mention de « V2 » ni de « phase » à l'écran | IND | § 6.2.2 ; D5, D13 | recherche de texte dans le build | U | Non conforme | 3 |
| UX-04 | Deux scores dans une disposition lisible, pas une grille à trois colonnes ; la fixture « 53/100, à vérifier » et « 69/100, moyenne » est comprise | IND | § 6.7.1, § 6.7.2 ; H4, H5 | 4 personnes sur 5 l'expliquent (test) | T, V | Non conforme | 3 |
| UX-05 | Barre défilante : 4 onglets visibles, ordre par défaut Home, Carte, Météo, Profil, puis Journal ; ordre modifiable dans Profil ; Journal aussi depuis Home et Profil ; bascule BORD / BATEAU (V3-023, qui remplace en partie V3-017) | IND | § 6.4 ; V3-023 | navigation testée au clavier et au toucher ; ordre enregistré et rétabli | E | Partiel | 3, 10 |
| UX-06 | WCAG 2.2 AA mesuré ; largeurs 320, 375, 390 px et ordinateur ; thème Plein soleil ; mouvement réduit | IND | § 6.10, § 6.14 | 0 violation axe et ratios consignés | U, V | Partiel | 3, 14 |
| UX-07 | Le chargement n'affiche pas de statut provisoire comme s'il était réel | IMP | D12 | capture au chargement sans « à vérifier » provisoire | V | Non conforme | 3 |
| UX-08 | On change d'onglet en le touchant ; glisser la barre fait apparaître les autres onglets (défilement par onglet entier, repère de suite, onglet actif toujours visible) ; le contenu ne change pas d'onglet par glissement ; sans animation si le mouvement est réduit | IMP | V3-023 (précision du 20 nov., 14 h 02) | barre défilée au doigt et au clavier ; Journal atteint en faisant défiler | E | Absent | 3, 10 |
| UX-09 | Home : photo de fond (automatique selon les conditions, ou choisie dans Profil), marquée « Illustration », et phrase de synthèse de la pêche probable, horaires compris | IND | V3-023 | phrase lisible sur chaque photo (voile, contraste mesuré) ; aucune promesse | V, T | Partiel | 3, 10 |

## OFF — Hors ligne et synchronisation

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OFF-01 | Application installable, cache versionné | IND | § 8.5 | test de mise à jour | E | Conforme | 4 |
| OFF-02 | États affichés : disponible hors ligne, obsolète, connexion requise, synchronisé, en attente, échec de synchronisation | IND | § 8.5 | 6 états rendus | E, V | Partiel | 3, 13 |
| OFF-03 | Une donnée en cache affiche son âge, jamais « en direct » | IND | § 8.5 | test de cache | E | Conforme | 10 |
| OFF-04 | Migrations de schéma testées ; aucune perte à la mise à jour | IND | § 8.5 ; Gate C | `test:upgrade` étendu à la V3 | U | Conforme (V2) | 4 |
| OFF-05 | Conflits de synchronisation : aucun écrasement silencieux | IND | § 8.5 | test de conflit | U | Conforme (fusion sans perte, `src/app/merge.js`) | 13 |

## PRV — Confidentialité et sécurité applicative

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PRV-01 | Position précise non conservée au-delà du besoin (cache arrondi à 100 m) ; aucun historique ; spots personnels privés par défaut | IND | § 8.1, § 11 | revue du stockage | R, U | Conforme (aucune position de l'utilisateur stockée ; spots personnels sur l'appareil) | 4, 10 |
| PRV-02 | Aucun secret dans le dépôt ; jetons de l'utilisateur sur l'appareil seulement ; modèle de menace tenu à jour | IND | § 11 | `docs/security/THREAT_MODEL.md` ; recherche de secrets dans la CI | R | Conforme | 2, 14 |
| PRV-03 | Les tiers ne reçoivent que le minimum : coordonnées pour la météo et le routage, aucune adresse IP envoyée à un service de localisation | IND | § 11 ; V3-010 | liste des requêtes sortantes vérifiée | E, R | Conforme | 10 |
| PRV-04 | Export et suppression des données de l'utilisateur disponibles | IMP | § 11 | test d'export et d'effacement | E | Partiel | 13 |

## DAT, QA, OPS — Données, qualité, dépôt

| Id | Exigence | Prio. | Origine | Critère d'acceptation | Vérif. | V2 | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DAT-01 | Chaque valeur porte sa source, son heure, son type et son unité ; heures stockées en UTC | IND | § 8.2 | contrat typé | U | Partiel | 4 |
| DAT-02 | Un adaptateur par fournisseur ; attributions affichées | IMP | § 10.4 ; V3-008 | changement de fournisseur sans toucher aux moteurs (test avec un simulateur) | U | Partiel | 4 |
| QA-01 | Budgets de performance fixés après mesure (téléphone moyen, 4G et réseau dégradé) | IND | § 10.3 | mesure AVANT consignée, seuils validés | R | — | 4 |
| QA-02 | Tests d'invariance du rang et parcours e2e du § 13.2 | IND | § 13.2 | suite verte dans la CI | U, E | Partiel | 4 à 14 |
| QA-03 | Suite complète verte avant toute fusion | IND | § 12.3 | CI verte sur la proposition | I | Conforme | toutes |
| OPS-01 | Jamais de push sur `main` ; une proposition par phase ; fusion = publication, avec l'accord de Félix | IND | § 12.1 | historique Git | R | Conforme | toutes |
| OPS-02 | Point de retour `v2-final` | IMP | V3-019 | étiquette présente | R | Absent | 2 ou 4 |
| OPS-03 | Archive Drive à la clôture de la V3 (Gate I) | IND | § 0.2.1 | `ARCHIVAGE VÉRIFIÉ` | R | — | 15 |
| OPS-04 | Les anciennes adresses `<guide>.html#…` mènent à la V3 sans erreur ni perte de contexte | IMP | migration | 7 adresses testées | E | — | 10 |

## Matrice BATEAU : en ligne, prévu, à décider

| Fonction | En ligne (`main`, v10.0) | Prévu (spécification BATEAU de la phase 9, branche de la phase 13) | À décider |
| --- | --- | --- | --- |
| Spots bateau personnels (GPS, carte) | oui | — | — |
| Conditions sur 7 jours (vent, vagues, houle, eau, pression, marée du port le plus proche) | oui | + visibilité, orage, CAPE (branche) | — |
| Sorties et prises (prises et capots) | oui | — | — |
| Modèle appris (régression de Poisson, note sur 10 dès 8 sorties) | oui | ajustement personnel ±10 dès 8 sorties (spécification) | V3-015 : présenté « d'après tes sorties », sans note sur 10 |
| Profil du bateau (catégorie, armement, abris, vitesse, seul à bord, canne) | non | oui (branche) | repris (V3-014) |
| Sécurité de sortie (SEC_*, pire moment, zone par zone) | non | oui (branche) | reprise (V3-014) ; seuils : questions 16 à 25 |
| Espèces (lieu jaune, maquereau, bar, vieille, saint-pierre ; lieu noir si pris) et réglementation | non | oui (branche) | reprises (V3-014) |
| Pertinence BATEAU | non | oui (branche) | **supprimée** (V3-006) |
| Temps de navigation, ports de mise à l'eau | non | temps de route à la vitesse du bateau depuis le port (branche) | à confirmer (§ 8.1 : aucun calcul nautique sans données suffisantes) |
| Carte des zones avec les cercles des abris | non | prévu (rapport de la phase 13, « pas encore fait ») | oui |
| Bulletins météo marine spéciaux (BMS) | non | rappel seulement | oui : source à trouver, même relais que la vigilance si possible |

## Frontières héritées de la V2

| Élément V2 | Sort en V3 | Raison |
| --- | --- | --- |
| 66 spots, fiches, sources, rubriques de preuve | **conservé**, enrichi | § 0.2 |
| Moteur BORD v2 (sécurité, Favorabilité, Confiance) | **conservé**, Pertinence retirée, refonte biologique en Phases 5 à 8 | V3-006, § 9.1 |
| Marée calculée sur l'appareil | **conservée** ; ports en catalogue commun | V3-008 |
| Sept guides, départements, zones, `isLocal`, `distMin` | **retirés des parcours** ; gardés comme données de provenance | V3-007 |
| Journal, spots personnels, sauvegarde GitHub, transfert | **conservés**, migrés | V3-013 |
| Analyse de photos (clé de l'utilisateur) | **conservée** | utile, déjà sûre |
| Mode BATEAU en ligne | **conservé** | Gate A |
| Note sur 10 (BORD v1, BATEAU) | **retirée** ; modèle BATEAU gardé comme information | V3-015 |
| Thème Plein soleil, mode terrain | **conservés**, refaits avec la nouvelle palette | § 6.10 |
| Prototype de la phase 11 V2 | référence, remplacé par les prototypes de la Phase 3 | § 6.13 |

## Contrôles de couverture (§ 5.2)

- **Besoins sans exigence** : alertes par notification (idée de Félix, mise de côté : hors V3) ; partage entre proches (expérimental, non spécifié).
- **Exigences sans conception** : toutes, pour l'instant. Les conceptions arrivent en Phase 3 (UX), en Phase 4 (socle) et en Phases 6 et 9 (moteurs).
- **Exigences sans test** : aucune. Chaque ligne a une méthode de vérification.
- **Tests existants sans exigence** : les tests V2 de la Pertinence (S13, S14, « boîte complète ») ; à retirer avec REC-02.
- **Exigences modifiées sans analyse d'impact** : aucune. Les remplacements de décisions V2 sont listés dans `DECISIONS_LOG`.
