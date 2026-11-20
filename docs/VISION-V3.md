# Vision produit — SPUMY V3

Phase 2 V3, 20 novembre 2026. Ce document fixe ce que la V3 doit réussir. Le détail testable est dans `docs/REQUIREMENTS.md`, et les arbitrages dans `docs/DECISIONS_LOG.md`.

## En une phrase

Où que tu sois, SPUMY te dit où et quand pêcher dans l'heure de route, du bord ou en bateau : avec quelle confiance, avec quels dangers, et comment t'y prendre.

## Pour qui

Félix et quelques proches (ADR-V3-005), pêcheurs aux leurres en mer, sur les côtes de la Bretagne jusqu'à Cherbourg.

| Profil | Ce qu'il fait | Statut |
| --- | --- | --- |
| Pêcheur du bar au leurre du bord | Choisit un spot et une marée pour une sortie de 2 à 4 h, souvent le jour même ; part de chez lui ou d'un lieu de vacances | OBSERVÉ (Félix : leurres seulement, jamais de surfcasting ; deux bases de pêche en Cotentin ouest et en rade de Brest ; canne 14 à 42 g) |
| Pêcheur en bateau | Décide s'il sort, où et pour quelles espèces ; jigging profond pour le lieu | OBSERVÉ (Félix : jigging en Bretagne, vers 70 m ; canne 90 à 210 g) |
| Proche moins expérimenté | Veut savoir où aller sans tout lire, et ne pas se mettre en danger | HYPOTHÈSE (aucun entretien) |

## Ce que la V3 change

1. **Elle part de toi, pas d'un guide.** Une position (« Me géolocaliser » ou « Saisir une position ») remplace les sept guides et les départements. En BORD, seuls les spots à 60 min de route réelle ou moins sont proposés.
2. **Deux scores clairs.** La Favorabilité classe ; la Confiance dit à quel point la croire ; la sécurité est un statut à part. La Pertinence disparaît.
3. **Une identité SPUMY nette.** Le logo de marque est respecté au pixel, avec la palette orange, bleu marine et ardoise, sans slogan ni cyan.
4. **Le BATEAU reste un mode de premier rang** : rien de ce qui existe n'est perdu, et la sortie en mer est jugée d'abord sur la sécurité.
5. **Plus de spots BORD, mieux décrits**, sur toute la côte de la Bretagne à Cherbourg, sans jamais supprimer les 66 spots V2.

## Ce qui ne change pas

Les moteurs testés (marée calculée sur l'appareil, sécurité non compensable, Favorabilité décomposée), le journal, l'ajout de spots personnels, l'analyse de photos, le fonctionnement hors ligne et la gratuité.

## Priorités (référentiel § 4.3)

1. UX/UI et identité : transversal, tout de suite après cette phase.
2. Décision, Carte et Fiche spot, conçues ensemble.
3. Journal.
4. Profil (statistiques personnelles, préférences, export).
5. Matériel (inventaire des leurres), en dernier.

Plus tard ou à l'essai : alertes par notification (idée de Félix, mise de côté), partage entre proches.

## Hors périmètre de la V3

- Usage commercial ou public (ADR-V3-005).
- Nouvelles espèces BORD : le bar seul.
- Nouvelles fonctions BATEAU non décidées par Félix, comme un temps de navigation ou de nouvelles espèces.
- Comptes utilisateurs.
- Couverture hors de la France.

## Réussite mesurable

Cibles proposées, à valider par Félix : elles ne reposent encore sur aucune mesure.

| Mesure | Cible (À VALIDER) | Comment |
| --- | --- | --- |
| Trouver un spot depuis une position nouvelle | en moins de 30 s, sans aide | test de tâche avec Félix et au moins un proche (Phase 3) |
| Comprendre « 53/100, à vérifier » et « Confiance 69, moyenne » | 4 personnes sur 5 l'expliquent sans erreur | test de compréhension (§ 6.7.2) |
| Aucune sortie proposée sans son danger visible | 0 cas | tests de sécurité et revue des écrans |
| Spots V2 conservés | 66 sur 66 | test de données |
| Spots BORD à 60 min ou moins | 100 % avec un temps vérifié ou marqué « estimation » | tests de routage |
