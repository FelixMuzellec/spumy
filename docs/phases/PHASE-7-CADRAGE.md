# Cadrage de la phase 7 — deuxième passe de recherche et enrichissement halieutique

Repris de la tâche planifiée du 24 nov. 2026 (Félix, 11 h 04 : « je veux bien que tu planifies une tache le jeudi matin à 08H01 »), pour que le message de la tâche reste court (Félix, 25 nov. 2026, 20 h 36). Seul ce qui touche au journal privé de Félix reste hors du dépôt : il est dans le message de la tâche.

## Démarrage

- Jeton conditionnel de Félix du 23 nov. 2026, 23 h 15 : « Après 3 passages pour challenger tes inputs et que cette phase est validée plannifie la tâche — PROCEED TO PHASE 7 ». La phase 6 est close (VALIDATED par délégation, à confirmer par Félix).
- Si une reprise a déjà avancé la phase 7, continuer depuis ce point sans rien refaire. Si elle est close ou arrêtée sur une question à Félix, ne rien faire de plus.
- Branche `claude/v3-phase-07-enrichissement-halieutique` (`docs/BRANCHES.md`), depuis la branche de la phase 6 : `claude/v3-phase-06-moteur-bord` si Félix a lancé `scripts/renommer-branches.sh`, sinon `claude/v3-phase-6` (vérifier avec `git ls-remote --heads origin` ; si renommées, `git branch -m` et `git branch -u` en local).
- Ligne d'ouverture au journal des décisions ; proposition en brouillon vers la branche de la phase 6 (si `gh pr create` renvoie 403, la route REST que l'erreur indique : `gh api repos/FelixMuzellec/spumy/pulls` avec `-F draft=true`).

## Périmètre du référentiel (lignes 2678 à 2694)

La phase challenge la phase 5 et comble ses lacunes, sans la répéter mécaniquement :
- registre des candidats et couverture ;
- sources locales sur les approches, marées, courants, accès, saisons et conditions ;
- spots peu documentés ;
- revue contradictoire des spots TOP_TIER (mousterlin, penmarch) ;
- doublons, sans fusion automatique ;
- informations par phase de marée, poste précis, accès et sécurité ;
- informations permanentes et périssables distinguées ;
- audit du mode BATEAU existant : toute extension est proposée à Félix, jamais développée ;
- lacunes impossibles à résoudre, avec les demandes de photos ou de précisions à Félix (§ 0.6) ;
- mise à jour de la couverture, de la matrice des sources et des niveaux de preuve.

Livrables : registre d'enrichissement, nouveaux candidats, fiches enrichies, rapport de challenge des TOP_TIER, rapport de couverture, registre des inconnues et des demandes à Félix.

## Priorité n° 1 : comportement et alimentation du bar, Bretagne et Cotentin

Félix, 24 nov. 2026, 10 h 57 : « Il est vraiment nécessaire que tu te montres top tier concernant le comportement du bar et son alimentation en fonction des régions concernées qui sont la Bretagne et le Cotentin (jusqu'à Cherbourg et à coté si tu as des spots proches). »

- But (Félix, même jour) : un moteur qui anticipe le comportement du bar selon son comportement alimentaire, régi par les moments de la journée, les saisons, les marées et la météo ; documentation scientifique top tier et expérience de pêche ; évolution permanente. La migration est partielle (correction de Félix).
- Zones : Bretagne (nord, Iroise, sud, rades et rias), Cotentin jusqu'à Cherbourg et ses abords. Pour chaque zone : présence et résidence selon le mois (résidents, migrants, départ, retour, frai) ; alimentation (proies par saison, taille, habitat) ; activité selon l'heure, la lumière, la marée, le coefficient, la température de l'eau, le vent, la houle, la turbidité.
- Point de départ, vérifié le 24 nov. 2026 :
  - de Pontual et al. 2019, ICES JMS 76 : 501-515 : 246 marques électroniques en Iroise ; migration partielle ; 6,8 à 21,9 °C.
  - de Pontual et al. 2023, ICES JMS 80 : 1606-1618 (Bargip) : 1 220 marques de Dunkerque à Capbreton ; environ la moitié migrent pour frayer ; 71 % des bars de Manche ouest et 67 % d'Iroise vers le golfe de Gascogne ; Manche et mer du Nord dans le stock nord ; signal de marée sur environ 35 % des marques ; minimum vers 6,5 °C.
  - Ifremer, synthèse Bargip (janv. 2018) : zones côtières d'alimentation de mai à novembre ; les bars de Saint-Vaast ont frayé en mer Celtique.
  - Le Luherne et al. 2022 (fidélité aux frayères) ; thèse de M. Fritsch, 2005, Ifremer ; Kostecki et Lorance 2013 (régime au large, ne vaut pas pour le bord) ; Doyle et al. 2017 ; Watson et al. 2022.
- Méthode : lire chaque source en entier quand l'accès est libre ; chercher le régime côtier (Manche, Bretagne, Normandie), les juvéniles et nourriceries (rade de Brest, estuaires, havres du Cotentin), les observations de pêcheurs identifiables.
- Biais à déclarer : poissons marqués capturés par des professionnels en juin ou en septembre ; aucun marquage sur la côte ouest du Cotentin (Pirou, Portbail) : ce qui s'y applique est INFÉRÉ des zones voisines.
- La température de l'air n'est pas celle de l'eau (vers 11 à 13 °C à Brest en décembre) : le moteur lit l'eau.
- Livrables : fiches de connaissance de `data/knowledge/bar-bord.json` mises à jour ou ajoutées (source, niveau, zone de validité, limites) ; proposition chiffrée de révision des paramètres du moteur (saison par zone de validité, résidence d'hiver, abri, alimentation, activité), présentée comme un changement avec son impact sur les 66 spots, jamais appliquée dans `src/`. La zone de validité s'applique par la position du spot : jamais de secteur ni de région dans le produit.
- Pare-feu à poser avant la clôture (PF-33) : chaque règle du moteur citée par ses sources régionales.

## Priorités suivantes

Phase 6 (rapport § 13 ; D6-15, D6-21) : aucune fiche ne peut être SAFE avec les données actuelles. À combler : accès selon la marée (75 fiches) ; fenêtre de sécurité des 23 fiches à contrainte de marée connue ; réglementation locale (35 fiches, dont l'arrêté de la Manche n° 34/2021 et son projet 2026) ; engagement (32) et houle maximale (32) ; mouvements de terrain (54) ; fenêtres de marée au format V3 ; recherches de `docs/moteur-bord/02` § 5 (seuils thermiques, lumière, courant au poste, débit, plages utiles).

Restes de la phase 5 : 242 pages V2 à lire ; chasse sous-marine comme preuve ; règle des 15 m des concessions du Morbihan ; 89 postes sans second éditeur ; validation des niveaux d'engagement.

Indicateurs des données (K-08 à K-12) : objectifs suivis, jamais au détriment des spots (Félix, 25 nov., 10 h 31) ; à défaut de sources, voie empirique.

## Méthode et clôture

- Collectes réseau par la CI (`data/spots/collecte/demande.json`, puis `scripts/sauver-collecte.mjs`) ; fichiers téléchargés à part ; Python avec `-I`.
- Clôture : trois passes de challenge, dont au moins une par un relecteur indépendant (agent séparé, en lecture seule), puis contre-vérification ; gate sur clone neuf (`npm run -s verifier`, codes de sortie consignés) ; CI verte ; rapport en 14 parties `docs/rapports/v3/PHASE-7.md` (PF-48) ; « VALIDATED (par délégation de Félix, 23 nov., 23 h 15 ; à confirmer par Félix) » seulement si les dix critères du § 13.4 sont remplis.
- Arrêts : gate en échec ou question bloquante, une seule question à Félix (IN PROGRESS ou BLOCKED) ; limite de crédits, § 3.6 ; fin de phase, arrêt explicite. Jamais de phase 8 sans son propre jeton, rien de planifié au-delà.
- Messages à Félix (SendUserMessage) : courts, sans jargon, à la fin de chaque étape et à la clôture, avec le lien de la proposition ; toujours dire s'il a quelque chose à faire, et quoi.
