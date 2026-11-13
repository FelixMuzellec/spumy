# Passer à l'adresse spumy.github.io sans perdre le journal

Décision de Félix (13 nov. 2026) : une organisation GitHub gratuite « spumy », qui donne l'adresse `https://spumy.github.io/`, à part de `felixmuzellec.github.io` (le jeton GitHub et la clé Claude ne sont plus lisibles par les autres pages du compte).

Une nouvelle adresse est un nouveau site pour le navigateur : il ne reprend pas ce qui est enregistré sur le téléphone. Le journal passe par son fichier d'export. Ce passage est testé : `npm run test:migration` (journal de la v8.15 à l'ancienne adresse → nouvelle version à la racine d'une autre origine : chaque session est là, à l'identique).

## À faire par Félix sur github.com (Claude n'a pas accès à ces réglages)

1. **Créer l'organisation** : <https://github.com/organizations/plan> → *Free* → nom `spumy` (si le nom est pris, GitHub le dit : prendre par exemple `spumy-app`, l'adresse sera alors `spumy-app.github.io`).
2. **Transférer le dépôt** `FelixMuzellec/spumy` dans l'organisation : *Settings → General → Danger Zone → Transfer ownership* → `spumy`.
3. **Le renommer** `spumy.github.io` (*Settings → General → Repository name*) : le site sera à la racine, `https://spumy.github.io/`. Sans ce renommage, il serait à `https://spumy.github.io/spumy/`.
4. **Activer Pages** : *Settings → Pages → Deploy from a branch → main / (root) → Save*.
5. Donner à Claude l'accès au dépôt renommé (il le demandera), pour vérifier le déploiement et continuer les phases.

## Sur chaque téléphone, une fois le site en ligne

1. **Avant tout**, dans l'application actuelle (ancienne adresse), pour chaque guide où tu as noté des sessions : onglet **Journal → Exporter**. Un fichier `journal-bar-<guide>.json` est enregistré.
2. Ouvrir `https://spumy.github.io/`, installer l'application depuis l'accueil.
3. Dans chaque guide concerné : **Journal → Importer** → choisir le fichier du même guide. Les sessions s'affichent ; un import en double ne crée pas de doublon (fusion par identifiant).
4. Si la sauvegarde GitHub du journal était active : recoller le jeton dans les Réglages. Le journal se relit aussi depuis le dépôt privé.
5. Recoller la clé Claude (onglet Photos) si tu t'en sers.
6. Garder l'ancienne application jusqu'à ce que tout soit vérifié.

## Ce que le fichier du journal ne transporte pas

Le fichier du journal ne contient que les sessions. Ne passent pas par lui : les spots que tu as ajoutés (« Tes spots »), les corrections d'orientation et de terrain, les poids pesés de ta boîte, les réglages, les analyses photo enregistrées, les sorties en bateau. Les spots ajoutés suivent la sauvegarde GitHub si elle est active ; pour le reste, une sauvegarde complète (export et import de tout le stockage, sauf les secrets) peut être ajoutée avant le changement si tu en as.
