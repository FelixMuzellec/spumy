# Contribuer à SPUMY

## Principes

- On ne modifie jamais à la main les fichiers compilés de la racine (`*.html`, `home.js`, `sw.js`, `manifest.json`, icônes) : on change `src/` ou `data/`, puis `npm run build`.
- Chaque fichier va dans sa couche : `src/core/` (commun au bord et au bateau), `src/bord/`, `src/bateau/`, `src/design/` (style sans métier), `src/app/` (coquille), `data/` (fiches des sites). Le bord et le bateau ne s'importent jamais l'un l'autre ; `npm run test:layers` le vérifie.
- Aucun secret dans le dépôt : ni jeton GitHub, ni clé d'API, ni coordonnées d'un spot personnel.
- Toute information halieutique ajoutée porte sa source, sa date et son niveau de preuve (scientifique ou institutionnel, observation documentée, retour local identifiable, hypothèse, heuristique).
- Une valeur inconnue reste inconnue : jamais remplacée en silence par une valeur neutre.

## Proposer une modification

1. Créer une branche depuis `main` (`claude/<sujet>` pour les travaux de Claude).
2. Faire des commits petits et explicites, en français, qui disent ce qui change et pourquoi.
3. Lancer `npm test` (contrôle du code, unitaires, parcours, contrat simulé) ; selon le changement, `npm run test:a11y` et `npm run test:studio`.
4. Ouvrir une demande de fusion vers `main` avec : objectif, fichiers concernés, tests lancés et résultats, risques, retour arrière.
5. Rien n'est fusionné dans `main`, donc publié, sans tests verts et sans l'accord de Félix.

## Versions

Chaque version publiée est décrite dans [CHANGELOG.md](CHANGELOG.md). Le numéro de version et l'identifiant de construction s'affichent en bas de l'accueil.
