# Plan de migration V2 → V3

Phase 2 V3, 20 novembre 2026. Rien n'est perdu : chaque donnée V2 est copiée vers la V3, l'original reste en place jusqu'à la fin de la V3, et un retour à la V2 est possible à chaque étape.

## 1. Ce qui migre

| Donnée V2 | Clés ou fichiers | Cible V3 | Règle |
| --- | --- | --- | --- |
| Spots des 7 guides | `data/sites/*.config.js` | catalogue `data/spots/` | identifiants gardés (V3-018) ; champs de guide dans `legacy` ; test : 66 sur 66, aucune source perdue |
| Ports de marée | blocs `tide` des fiches | catalogue de ports | test : mêmes heures et hauteurs qu'en V2, à la seconde près, pour chaque port |
| Journal BORD | `bar:journal:<guide>` | journal V3 (états typés, JRN-01) | une sortie V2 sans prise renseignée devient `resultat_inconnu`, jamais `sans_capture` |
| Spots personnels BORD | `bar:myspots:<guide>` | spots personnels V3, privés | rattachement au guide supprimé ; position gardée |
| Spots et sorties BATEAU | `bar:offshore:spots`, `bar:offshore:trips` | mode BATEAU V3 | à l'identique |
| Boîte à leurres | `bar:boite` | inventaire (Matériel), puis conseil personnel | `bar:boite-complete` ignoré (Pertinence) |
| Réglages | `bar:theme`, `bar:terrain-mode`, `bar:reglages`, `bar:heures:` | préférences V3 | `bar:moteur` (note sur 10) selon V3-015 ; `bar:trajet-max` ignoré |
| Sauvegarde GitHub | `bar:sync` et le dépôt du journal | même dépôt, format V3 versionné | écriture du nouveau format seulement après lecture réussie de l'ancien (V2 : sonde, écriture non destructive) |
| Caches | `bar:data:`, `bar:eau:`, `bar:scores`, `bar:offshore:wx` | aucun | re-téléchargés ; jamais présentés comme récents |
| Photos analysées | IndexedDB | idem | à l'identique |

## 2. Adresses

Les adresses `pirou.html#spots`, `logonna.html#synthese`… restent valables. Chaque page de guide devient une redirection vers la V3 :
- position = le pôle du guide, marquée « position proposée, à confirmer » ;
- l'ancre est convertie (`#spots` → `#carte`, `#spot=goury` → `#spot=goury`).

Les liens partagés et les icônes d'écran d'accueil continuent donc de marcher.

## 3. Étapes et retour arrière

1. **Point de retour** : étiquette `v2-final` sur bb4f940 (V3-019).
2. **Migration à la première ouverture de la V3** :
    - copie des clés V2 vers les clés V3, puis vérification par relecture ;
    - les clés V2 ne sont ni modifiées ni effacées ;
    - en cas d'échec, la V3 s'ouvre en lecture seule et propose l'export brut (comme l'écran de secours V2).
3. **Retour à la V2** : republier `v2-final`. Les données V2 sont intactes puisqu'elles n'ont pas été touchées ; les saisies faites en V3 depuis restent exportables.
4. **Nettoyage des clés V2** : jamais automatique avant la fin de la V3. Ensuite, seulement avec l'accord de Félix et après un export.

## 4. Preuves attendues

- `tests/upgrade.mjs` étendu : des états V2 réels anonymisés (journal, spots, bateau) sont ouverts en V3 ; on vérifie zéro perte et que les clés V2 sont restées identiques.
- Parcours des 7 anciennes adresses (OPS-04).
- Comparaison des classements : pour une position au pôle de chaque guide, ordre V3 = ordre V2, hors Pertinence et hors filtre des 60 min.
