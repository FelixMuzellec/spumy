# Référentiel biologique

Phase 5 V3, sous-tâche 5.5 (référentiel § 9.1.2 et § 9.1.3). Première version du 23 novembre 2026 : **le bar**, espèce unique du BORD. Les cinq autres espèces du BATEAU suivront dans une prochaine session.

Ce référentiel décrit ; il ne note pas. Aucune variable n'entre dans la Favorabilité sur la seule foi de ce document : c'est le travail des phases 6 à 9.

## 1. Périmètre et méthode

- **Espèces** : la liste réelle de la V2 (audit fonctionnel, § 3).
    - BORD : le bar.
    - BATEAU : lieu jaune, lieu noir, maquereau, bar, vieille et saint-pierre.
    - Aucune autre espèce n'est ajoutée.
- **Niveaux de preuve** : échelle des connaissances V2 (`data/knowledge/bar-bord.json`, champ `echelle`). Le niveau 1 correspond à une source scientifique ou institutionnelle, le niveau 5 à une heuristique.
- **Statuts** :
    - VÉRIFIÉ : la source a été lue, au moins son résumé public ;
    - INFÉRÉ : déduit de sources lues ;
    - HYPOTHÈSE : rien ne la soutient ;
    - INCONNU : lacune.
- **Base de départ** : les 27 connaissances BORD de la V2, déjà sourcées, avec leurs limites. Elles ne sont pas répétées ici, seulement citées par leur identifiant (`migration-saisonniere`, `frai-temperature`…).
- **Recherches du 23 nov.** : télémétrie et activité au cours de la journée, marée et alimentation des juvéniles, période et lieux de frai, régime alimentaire côtier.

## 2. Le bar (*Dicentrarchus labrax*) en Manche et en Bretagne

### 2.1 Deux stocks, séparés au 48ᵉ parallèle

Le programme Bargip de l'Ifremer distingue :
- le stock « mers Celtiques » : mer Celtique, Manche et sud de la mer du Nord ;
- le stock « golfe de Gascogne », de la baie d'Audierne (48ᵉ parallèle) vers le sud.

**VÉRIFIÉ**, niveau 1, Ifremer, synthèse Bargip de 2018.

Conséquence pour les spots : la même limite partage déjà la réglementation V2. Les spots du sud du Cap Sizun (Penhors, la Torche, Penmarc'h) et du guide de Concarneau relèvent du stock de Gascogne ; tous les autres, du stock nord. Une saison de frai ou une date de retour ne se transposent pas d'un stock à l'autre sans preuve.

### 2.2 Cycle annuel

| Période | Ce qui est établi | Statut et niveau | Limite |
| --- | --- | --- | --- |
| Hiver | La plupart des adultes frayent au large ; une partie reste résidente (`migration-saisonniere`) | VÉRIFIÉ, 1 | Résidents plus rares que les migrants, observés surtout au centre du golfe de Gascogne |
| Frai, stock de Gascogne | Cartes mensuelles des frayères de **janvier à mars**, d'après les positions de pêche des navires (Ifremer, jeu de données Sextant) | VÉRIFIÉ, 1 | Frayères au large ; ne dit rien de la présence des adultes à la côte |
| Frai, stock nord | Février à juin, dans des eaux d'au moins 9 °C environ, d'après un modèle de dérive larvaire (`frai-temperature`, Graham 2023) | VÉRIFIÉ, 1 | Seuil du modèle, pas une observation des adultes. Cartes des frayères Manche et mer Celtique : Ifremer (Dambrine, Woillez, Huret, de Pontual, 2020), **mois à relire** |
| Printemps | Retour sur des zones d'alimentation côtières, les mêmes d'une année sur l'autre (`migration-saisonniere` ; Edwards 2025 : 130 adultes de 40 à 75 cm suivis en télémétrie acoustique) | VÉRIFIÉ, 1 | Dates de retour publiées pour Cork (mi-avril, Doyle 2017), aucune pour le Finistère ni le Cotentin : **INCONNU** localement |
| Été | Présence côtière et fidélité estivale au site (Edwards 2025 ; Doyle 2017) | VÉRIFIÉ, 1 | — |
| Automne | Départ vers le large (Cork : mi-octobre, Doyle 2017) | VÉRIFIÉ ailleurs, 1 ; INCONNU ici | Aucune date publiée pour ces côtes |

**Granularité** : les études ne permettent pas un calendrier mois par mois pour ces côtes (§ 9.1.2, « ne pas forcer une granularité mensuelle artificielle »). Les coefficients mensuels de présence de la V2 (`saison-coefficients`) restent une HYPOTHÈSE de niveau 4.

### 2.3 Juvéniles et nourriceries

- Les œufs et les larves dérivent des frayères du large vers la côte. Les juvéniles grandissent dans des nourriceries surtout estuariennes, pendant leurs trois premières années (Ifremer, Bargip). **VÉRIFIÉ**, niveau 1.
- En baie du Mont-Saint-Michel, les bars de l'année entrent dans les chenaux des prés salés au flot, lors des vives-eaux (43 % des marées). Ils y mangent 1 à 2 heures, au moins 8 % de leur poids, et repartent au jusant (Laffaille et al., 2001, *Estuaries* 24 : 116-125). **VÉRIFIÉ**, niveau 1.
    - Repas au flot : des mysidacés.
    - Repas au jusant : un amphipode des prés salés.
- Dans les nourriceries anglaises, les juvéniles utilisent tous les habitats disponibles à marée haute plutôt que d'en choisir un (Freeman et al., 2024, *Journal of Fish Biology*). Leur régime montre une spécialisation individuelle, plus faible au printemps (étude de Southampton, contenus stomacaux et isotopes, cycle annuel). **VÉRIFIÉ**, niveau 1.
- **Portée pour SPUMY** : ces poissons sont sous la taille légale de 42 cm. Ces résultats décrivent le fonctionnement d'un havre ou d'un estuaire au flot, et la présence de proies ; ils ne prédisent pas la prise d'un bar maillé.

### 2.4 Marée et courants

| Constat | Statut et niveau |
| --- | --- |
| Grands bars vus traversant des vasières submergées à pleine mer (Edwards 2025) | VÉRIFIÉ, 1 |
| Signal de marée dans les profondeurs enregistrées pour environ 35 % des marques (de Pontual 2023) | VÉRIFIÉ, 1 |
| Juvéniles entrant au flot et sortant au jusant (Laffaille 2001) | VÉRIFIÉ, 1 |
| « Le bar suit le flot sur les estrans et se poste aux sorties d'eau au jusant » (`maree-flot`) | INFÉRÉ : soutenu pour le principe, pas pour chaque spot |
| Fenêtres de marée propres à chaque spot | sources de pêche, niveaux 2 à 4, à documenter par phase en 5.7 (§ 7.5) |

### 2.5 Rythme au cours de la journée

- En captivité, l'alimentation culmine à l'aube ou au crépuscule selon les individus (Millot et Bégout, 2009 ; Chen et al., 2023, en cage). Dans un enclos en mer, les groupes nagent plus lentement et sont moins serrés la nuit (Wageningen, étude du bruit). **VÉRIFIÉ**, niveau 1, **en captivité**.
- **Aucune étude d'activité de jour et de nuit du bar adulte en milieu naturel n'a été trouvée** (recherche du 23 nov.). La règle « lumière basse » (`lumiere-basse`) reste un savoir de pêcheur, de niveau 2 à 4. **Lacune.**

### 2.6 Température

- Des adultes ont été suivis jusqu'à 6,5 °C (de Pontual 2023). D'autres ont hiverné dans un port à 6,9 °C (Goossens 2023, cité par Edwards 2025). **VÉRIFIÉ**, niveau 1.
- Les paliers V2 de présence côtière (7,5, 9,5, 11,5, 13,5 et 19 °C, `seuils-thermiques`) : **aucune source**. HYPOTHÈSE, niveau 4.
- « Au-delà de 19 °C, activité décalée vers la nuit » (`eau-chaude`) : aucune source. HYPOTHÈSE, niveau 5.

### 2.7 Alimentation et proies

- Adultes du large, en automne et en hiver, golfe de Gascogne : surtout des poissons pélagiques (maquereau, chinchard, anchois, sardine). Les crustacés font environ 3 % de la biomasse (Spitz et al., 2013, *ICES Journal of Marine Science* 70 : 452-461). **VÉRIFIÉ**, niveau 1, pour le large.
- Juvéniles : prédateurs opportunistes (Pickett et Pawson, 1994, cité par Spitz 2013). **VÉRIFIÉ**, niveau 1.
- **Régime des adultes à la côte, en Manche et en Bretagne : aucune étude trouvée.** Le calendrier des proies V2 par guide (`proies-calendrier`) reste INFÉRÉ, niveau 5. **Lacune.** À lire en priorité : la thèse de M. Fritsch (UBO et Ifremer, 2005), *Traits biologiques et exploitation du bar commun dans les pêcheries françaises de la Manche et du golfe de Gascogne*.

### 2.8 Habitat et profondeur

Le bar est surtout côtier, et migre au large et plus profond en hiver (Pickett et Pawson, 1994, cité par Spitz 2013). **VÉRIFIÉ**, niveau 1. Le détail par poste (fond, structures, profondeur) relève des fiches de spots (5.7).

### 2.9 Conditions atmosphériques

- **Pression** : aucune étude sur le bar ; seulement des blogs (`pression`, niveau 5). Conformément au § 9.1.3, elle n'est pas un prédicteur du modèle initial. Elle reste un contexte, et un signal de redondance avec le vent et les fronts.
- **Vent, houle, turbidité** : règles V2 de niveaux 4 et 5 (`vent-exposition`, `houle-turbidite`, `pluie-turbidite`, `gros-coefficient-turbidite`). Aucune étude trouvée sur la réponse du bar. HYPOTHÈSES.
- Effets à séparer (§ 9.1.3) : ce qui agit sur le poisson (turbidité, proies), et ce qui agit sur le pêcheur (lancer, tenue de la ligne, sécurité). La phase 6 devra séparer ces deux effets.

## 3. Lacunes et contradictions

| Sujet | État | Effet sur le moteur (phases 6 à 9) |
| --- | --- | --- |
| Dates de retour et de départ à la côte (Finistère, Cotentin) | **INCONNU** ; seulement l'Irlande (Cork) | la présence saisonnière reste une HYPOTHÈSE, et la Confiance baisse |
| Activité de jour et de nuit des adultes en milieu naturel | **INCONNU** ; études en captivité seulement | le poids de la lumière reste empirique |
| Régime des adultes à la côte | **INCONNU** ; thèse Fritsch 2005 à lire | le conseil de leurres s'appuie sur la proie documentée du spot, sinon reste qualitatif |
| Paliers de température de la V2 | **aucune source** ; des poissons suivis sous les paliers | à ne pas garder comme seuils sans preuve |
| Mois de frai | **nuance** : Gascogne janvier à mars (cartes de l'Ifremer) ; stock nord février à juin (modèle) | stocks séparés au 48ᵉ parallèle ; pas une contradiction, mais deux calendriers |
| Pression | aucune preuve | exclue du modèle initial (§ 9.1.3) |

## 4. Espèces du BATEAU

Lieu jaune, lieu noir, maquereau, vieille et saint-pierre, sans oublier le bar en bateau : **à faire** (prochaine session de 5.5). La base de départ est faite des 35 connaissances BATEAU de la V2 (`data/knowledge/bateau.json`).

## 5. Sources de cette version

- Ifremer (2018). Résultats de l'action « Marquage » du projet Bargip (2014-2017) : https://bar.ifremer.fr/content/download/116111/file/4PagesMarquageAdultes_Final-3.pdf
- Ifremer, Sextant : *Spawning areas of seabass in the Bay of Biscay*, cartes mensuelles de janvier à mars : https://doi.org/10.12770/4ca9f42a-af88-4a00-a553-32130a1b23a2 ; *Spawning areas of Dicentrarchus labrax in the English Channel – Celtic Sea* (Dambrine, Woillez, Huret, de Pontual, 2020) : https://doi.org/10.12770/763b125d-afbe-4d32-bd0f-707c1f4474a8
- Laffaille P., Lefeuvre J.-C., Schricke M.-T., Feunteun E. (2001). Feeding ecology of 0-group sea bass in salt marshes of Mont Saint Michel Bay. *Estuaries* 24(1) : 116-125 : https://hal.archives-ouvertes.fr/hal-00736433
- Freeman H. A. et al. (2024). What makes a habitat a home? Habitat associations of juvenile European sea bass in estuarine nurseries. *Journal of Fish Biology* : https://ueaeprints.uea.ac.uk/97407/
- Spécialisation trophique individuelle des juvéniles (université de Southampton) : https://eprints.soton.ac.uk/437916
- Spitz J. et al. (2013). Prey preferences of adult sea bass in the northeastern Atlantic. *ICES Journal of Marine Science* 70(2) : 452-461 : https://doi.org/10.1093/icesjms/fss200
- Edwards J. E. et al. (2025). Multi-year tracking of European sea bass. *ICES Journal of Marine Science* : https://doi.org/10.1093/icesjms/fsaf190
- Bruit et comportement de jour et de nuit en enclos (Wageningen) : https://research.wur.nl/en/publications/european-seabass-respond-more-strongly-to-noise-exposure-at-night/
- Fritsch M. (2005), thèse UBO et Ifremer : https://archimer.ifremer.fr/doc/2005/sup-1088.pdf (**à lire**)
- Sources des connaissances V2 citées par identifiant : `data/knowledge/bar-bord.json` (de Pontual 2023, Doyle 2017, Graham 2023, Millot et Bégout 2009, Chen 2023).
