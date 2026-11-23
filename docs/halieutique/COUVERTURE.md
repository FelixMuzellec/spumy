# Couverture, limites, contradictions et anomalies

Phase 5 V3, livrable 5, sous-tâche 5.10, **mise à jour par la passe exhaustive (5.12) du 23 novembre 2026 (fin de soirée)**, après après les deux passes de recherche, les collectes officielles (IGN, BRGM, Géorisques, Wikimedia Commons) et la qualification. Les repères par département servent seulement à mesurer la couverture : ils ne créent aucun secteur dans l'application (§ 7.2).

## 1. Couverture actuelle

| Repère littoral (audit seulement) | Fiches V2 vérifiées en partie | Candidats de la 1ʳᵉ passe | État |
| --- | --- | --- | --- |
| Manche, côte ouest (Granville → la Hague) | 10 | 3 (Écalgrain ; cap de la Hague, doublon probable de Goury ; Jobourg, en bateau) | couvert ; positions à finir |
| Manche, nord et est (Cherbourg → Barfleur → Saint-Vaast) | 0 | 1 (pointe de Barfleur, en bateau seulement) | **lacune** |
| Ille-et-Vilaine (baie du Mont-Saint-Michel → Saint-Malo → Saint-Briac) | 0 | 1 (pointe de la Chaîne, source très faible) | **lacune** |
| Côtes-d'Armor | 0 | 2 zones (granit rose ; Goëlo et baie de Saint-Brieuc), sans poste nommé | **lacune** |
| Finistère | 56 | — | couvert |
| Morbihan | 0, hors Laïta, à la limite du Finistère | 2 (rade de Lorient et Gâvres, source très faible ; côte sauvage de Quiberon, accès restreint) | **lacune** |

**Constat principal** : la V2 couvre deux tronçons, le Finistère et la côte ouest du Cotentin. Les sources publiques lues le 23 novembre nomment des **zones** plutôt que des postes : les pêcheurs du bord publient rarement leurs postes exacts. Aucun candidat de la première passe n'atteint encore le niveau d'une fiche (§ 7.2). La deuxième passe (5.8), ci-dessous, a visé les sources locales.

### Passe exhaustive (5.12, 23 nov. 2026, fin de soirée)

La recherche limitée à un site fait remonter les pages que la recherche générale ne trouvait pas :
- **mieuxpecher.com** publie une liste de coins de pêche du bord par département (Finistère NORD et SUD, Côtes-d'Armor, Ille-et-Vilaine, Morbihan, Normandie), par le même auteur (Norbert), 2018-2022, sans méthode publiée. C'est la « liste-maîtresse » qui avait servi à construire la V2 ; elle nomme des postes dans les quatre zones vides.
- **carnet-de-peche.com** publie des fiches de spots rédigées par l'éditeur (632 annoncées), avec la structure, les espèces et souvent le moment de marée ; positions floutées en accès gratuit (jamais reprises).

Résultat : **six fiches nouvelles** (`candidate`), chacune nommée par deux éditeurs indépendants — Pointe du Percho, Pointe du Conguel, Pointe de Saint-Colomban (Morbihan), Pointe du Château à Plougrescant (Côtes-d'Armor), Pointe et digue de Querqueville, Cap Lévi (nord et est du Cotentin). Ille-et-Vilaine : un seul éditeur, aucune fiche.

**Contradiction relevée** : le guide Bretagne de carnet-de-peche.com recommande Port Bara (côte sauvage de Quiberon), dont l'accès est signalé interdit à cause des éboulements par une autre source (candidat `cand-quiberon` de la première passe). Port Bara n'est pas proposé.

### Deuxième passe (5.8, 23 nov. 2026, soir)

Sources locales recherchées sur les quatre zones vides : guides professionnels, offices de tourisme, études, comptes rendus. Quatre candidats de plus, soit **13 au total**. **Aucun ne devient une fiche.**
- Les guides professionnels d'Ille-et-Vilaine, des Côtes-d'Armor et du Morbihan proposent la pêche du bord « depuis les meilleurs postes côtiers sélectionnés par votre guide », sans jamais les nommer.
- La seule étude institutionnelle trouvée est celle de l'Ifremer sur le golfe du Morbihan (2003). Elle ne nomme qu'un site du bord, la jetée de Larmor-Baden, et y range le bar parmi les espèces des plages et des côtes rocheuses, pas des jetées.
- Les pages qui nomment des pointes, à Cancale, Dinard ou Lorient, sont des agrégateurs sans auteur.

**Conclusion, corrigée le 23 nov. (22 h 40)** : avec les recherches faites (une dizaine de requêtes et une page lue), le catalogue ne s'étend pas honnêtement à ces quatre zones. Ce n'est **pas** une recherche exhaustive : la liste par département de mieuxpecher.com, qui a servi à construire la V2, n'a pas pu être lue (absente du moteur de recherche, et l'outil de lecture n'ouvre que les adresses trouvées par une recherche ou envoyées par Félix). Trois pistes restent possibles :
- des sources de terrain identifiables : clubs, associations, comptes rendus datés et nominatifs ;
- la connaissance de Félix, pour les spots publics qu'il accepte de verser au catalogue ;
- une étape ultérieure (phase 7, deuxième passe d'enrichissement du référentiel). Elle pourrait partir d'hypothèses d'habitat (pointes exposées au courant, embouchures), mais elles resteraient marquées HYPOTHÈSE et ne seraient jamais présentées comme des spots corroborés.

## 2. Ce qui a été vérifié sur les 66 fiches (23 nov. 2026)

| Contrôle | Résultat |
| --- | --- |
| Inventaire et sauvegarde des spots V2 | 66 sur 66, empreintes vérifiées à chaque test |
| Stationnement (BD TOPO de l'IGN) et temps de marche (itinéraire piéton de l'IGN) | **60 sur 66** ; médiane de 5 min de marche, maximum 37 min |
| Position contrôlée par un toponyme officiel de même nom | 60 ; **4 positions corrigées** (Agon, Carteret, Portbail, Régnéville) |
| Réglementation du bar 2026, sur les textes officiels | 66 sur 66 (52 en zone CIEM 7, 14 en zone CIEM 8) |
| Approches par phase de marée | 133 phases documentées sur 264 (fenêtres V2) ; les autres restent inconnues |
| Contrainte d'accès liée à la marée (classée à la main depuis les consignes) | **22 spots** : 16 « le flot peut couper le retour », 6 « praticable seulement à basse mer », 4 « poste recouvert à marée haute », 1 « selon la marée » ; 44 sans consigne de marée, marqués INCONNU (jamais « sans risque ») |
| Fenêtre de sécurité/accessibilité (§ 7.6) | **0 documentée** : aucune durée praticable n'est sourcée ; la raison nomme la contrainte. Fenêtre habituelle : 0 (aucune observation locale documentée) |
| Mouvements de terrain (BDMvt du BRGM, 500 m) | **26 spots** concernés, dont **13 avec chutes de blocs** (Corsen, Dinan, Espagnols, Granville, Kermorvan, Lostmarc'h, Petit Minou, Morgat, Pen-Hir, Rospico, Saint-Jean-du-Doigt, la Torche, Trépassés) ; la plupart des événements n'ont pas de date ; 40 sans événement recensé, marqués INCONNU |
| Risques de la commune (GASPAR, Géorisques) | 66 sur 66 ; 22 points hors des limites communales (pointe, embouchure), rattachés aux communes à 1 km et signalés comme tels |
| Règles locales sourcées | **17 spots** : limites des ports (14) et herbiers de zostères (2) dans le Finistère, cantonnement « Le Cochon » à Port-Manec'h, arrêté municipal de Sciotot ; application au poste « à vérifier » partout |
| Photos libres (Wikimedia Commons, 400 m, nom du lieu dans le titre ou la description) | **31 spots**, 107 photos, statut INFÉRÉ : ce que montre chaque image reste à vérifier avant affichage ; 35 sans photo retenue |
| Sources | 304 au registre, 86 groupes d'indépendance ; **60 évaluées page par page** (dont 35 citations mieuxpecher.com vérifiées mot pour mot), 2 introuvables ; peche-poissons.com non classé |
| Qualification (critères QUAL-1 à QUAL-7, `QUALIFICATION.md`) | 72 fiches : **2 TOP_TIER** (Mousterlin, Penmarc'h), **7 corroborées**, **57 à vérifier**, **6 candidates** |

## 3. Anomalies

| Anomalie | Spots | Traitement |
| --- | --- | --- |
| Position V2 à la minute près, sans toponyme naturel de même nom | pirou, gouville, surtainville | à positionner sur le poste réel (source de terrain ou Félix) |
| Position V2 à plus de 1,5 km du toponyme de même nom | camfrout, gouville, kernic, laita, odet, paluden, sciotot | souvent un toponyme de village ou de commune ; à vérifier poste par poste |
| Aucun parking de la BD TOPO à 1,5 km | armorique, raz, rostiviec | à documenter autrement (le grand parking de la pointe du Raz est peut-être hors rayon ou classé autrement : à vérifier) |
| Aucun toponyme de même nom | bendy, capcoz, lauberlach, locquirec, penze, portmanech | noms de pêcheurs ou composés : position à contrôler autrement |
| Spot à moins de 2,2 km du 48ᵉ parallèle | goyen, sainttugen | zone CIEM (7 ou 8) à vérifier au poste exact |
| Fiches V2 citant le journal personnel de Félix | 28 | à garder hors des fiches V3 publiques |
| Positions sourcées sur Google Maps | 4 sources, 7 citations | à reprendre sur l'IGN ; fait pour les positions contrôlées |

| Conseils V2 qui visent les herbiers de zostères, interdits à la pêche dans le Finistère | bendy (« passer au-dessus des zostères »), camfrout (« texan sur les parcs et les herbiers ») | conseils à revoir avant publication ; règle locale ajoutée à la fiche |
| Points hors des limites communales | 22 | rattachement aux communes à 1 km ; le poste réel est sur l'estran ou la roche |
| Sources V2 sans adresse | 244 sur 297 | page introuvable dans la plupart des cas : l'affirmation V2 reste INFÉRÉ |

## 4. Contradictions et nuances

- **Frai du bar** : janvier à mars dans le golfe de Gascogne (cartes de l'Ifremer), février à juin pour le stock nord (modèle larvaire). Ce ne sont pas des contradictions mais deux stocks, séparés au 48ᵉ parallèle (référentiel biologique, § 2.1).
- **Réglementation du lieu jaune pour 2026** : les quotas européens annonçaient 3 lieus par jour au nord du 48ᵉ parallèle. L'administration a rappelé que seuls s'appliquent les textes en vigueur, soit 2 par jour. **Résolu (23 nov., soir)** : la synthèse de la DDTM du Finistère mise à jour en avril 2026 cite l'arrêté du 24 décembre 2024 : aucune détention du 1er janvier au 30 avril, 2 lieus par pêcheur et par jour du 1er mai au 31 décembre, relâcher interdit. VÉRIFIÉ sur une source administrative de 2026 ; le texte de l'arrêté reste à lire sur Légifrance.
- **Mesures locales** : la synthèse régionale de 2024 (DIRM Nord Atlantique-Manche Ouest) cite une interdiction de toute pêche du bar du 1er mars au 31 mai au large du cap Fréhel. Elle s'appuie sur l'arrêté n° 116/2005 de la direction régionale des affaires maritimes et vise un rectangle compris entre 48°40' et 48°42' de latitude nord, et entre 2°17'50'' et 2°20' de longitude ouest. D'autres règles locales de ce type peuvent exister : chaque fiche nouvelle devra les rechercher (5.7).

- **Nourricerie possible à l'Aber Ildut** : une série de photos de l'Ifremer (projets JUNO et Recapture), géolocalisée à environ 210 m du point du spot, montre la capture de juvéniles de bar « à la senne de plage dans des nourriceries », pour les mesurer, les marquer et les relâcher. INFÉRÉ de la géolocalisation : à confirmer dans les publications des projets. Si l'Aber Ildut est une nourricerie, la fiche devra rappeler la taille minimale (42 cm) et le relâcher des juvéniles.
- **Lignes à hameçons sur l'estran** : dans le Finistère, « la pose de lignes munies d'hameçons est interdite du 1er juin au 30 septembre » sur le littoral nord jusqu'à Poullan-sur-Mer (synthèse DDTM 29, avril 2026, p. 5). Le texte vise la pose de lignes, pas la pêche au leurre tenue à la main : non reporté dans les fiches, à confirmer.
- **Sciotot** : l'arrêté municipal cité interdit « le mode de pêche à l'hameçon (paillots…) » entre la cale et la Roquette ; le mot « paillots » désigne sans doute des lignes posées, mais la portée pour la pêche au leurre n'est pas établie.

## 5. Limites de la méthode

- Le parking le plus proche à pied n'est pas forcément l'accès habituel au poste. L'itinéraire piéton ne compte ni l'estran, ni la grève, ni les rochers.
- Le point d'un toponyme réduit un lieu étendu (pointe, plage) à un point, d'où la précision estimée à 300 m.
- Les sources de presse et les sites spécialisés relaient souvent les mêmes auteurs : l'indépendance est comptée par éditeur.
- Aucune source n'a été lue derrière un accès payant ou réservé aux membres.
- Une citation V2 sans adresse ne peut pas être relue : elle compte pour la corroboration par éditeur (QUAL-1) mais jamais pour la qualité examinée (QUAL-2).
- Les données de risque du BRGM sont un recensement : zéro événement n'est jamais une garantie.
- Les photos sont retenues sur leur nom et leur distance, pas sur leur contenu.

## 6. Passe forums et listes complètes (5.13, demande de Félix du 23 nov., 23 h 10)

**Méthode.** Chaque poste nommé par les listes de mieuxpecher.com des quatre zones pauvres a été croisé avec le catalogue complet de lechasseursousmarin.com (335 zones, lu en entier), les listes de carnet-de-peche.com vues dans les pages lues (catalogue de 632 fiches : vu en partie seulement), les forums publics (pechemercotentin.forumactif.org, carnalor.com), un blog de première main (oupecher.fr) et la presse. Aucune page réservée aux membres ou aux abonnés n'a été lue ; aucune connexion. Le croisement est automatique (règle de nommage `texteNommeLeSpot`), puis relu.

| Zone (repère d'audit) | Postes de la liste | Avec fiche | Second éditeur, sans position IGN | Sans second éditeur trouvé |
| --- | --- | --- | --- | --- |
| Ille-et-Vilaine | 22 | 5 (Meinga, Moulière, Varde, Décollé, Grand Bé et Petit Bé) | 0 | 17 |
| Côtes-d'Armor | 31 | 7 (cap Fréhel, Rosaires, Bec de Vir, Bréhec, pointe du Château, Bihit, Dourven) | 1 (anse des Sévignés) | 23 |
| Morbihan | 41 | 6 (Laïta, Toulhars, pointe des Chats, Conguel, Percho, Saint-Colomban) | 3 (Étel, Berchis, Penvins) | 32 |
| Manche, Basse-Normandie | 34 | 15 postes, 13 fiches (dont Saint-Vaast, Tatihou, Saire, Gatteville, Gattemare, la Loge, cap Lévi, Querqueville, et 5 fiches V2) | 1 (pointe de Néville) | 18 |

Hors listes de mieuxpecher.com, deux autres éditeurs indépendants ont suffi pour : la pointe de la Latte, Gwin Zégal, la pointe de Séhar, la pointe des Poulains (carnet-de-peche.com et lechasseursousmarin.com) ; la pointe de Perhérel, l'embouchure du Merrien, Beg an Fry, l'île Percée (mieuxpecher.com Finistère avec carnet-de-peche.com ou lechasseursousmarin.com).

**Écartés, avec la raison :**
- pointe du Grouin, pointe de la Varde et pointe du Décollé chez bretagne-peche-et-nature.fr et a-babord.com : éditeurs anonymes ou sans source, classés famille 6, qui ne comptent jamais (la Varde et le Décollé ont trouvé leur second éditeur ailleurs) ;
- pointe de la Garde Guérin : écrite « Guarde Guérin » chez mieuxpecher.com, la règle de nommage ne rapproche pas les deux graphies ; pointe du Dourven : « Dourvin » chez mieuxpecher.com, une seule source de pêche compte (fiche gardée, candidate) ;
- môle de Saint-Malo et cale Solidor : oupecher.fr les nomme pour le maquereau, l'encornet et la dorade, pas pour le bar ; non retenus comme postes à bar ;
- « Le Dibenn » de carnet-de-peche.com : une digue près de Brest, pas la pointe du Diben de Plougasnou ;
- île Tatihou chez lechasseursousmarin.com : parcours en dérive depuis la cale de Jonville ; la fiche existe, mais l'accès à pied du pêcheur du bord n'est pas documenté ;
- port de Saint-Quay-Portrieux : « maintenant interdit » selon mieuxpecher.com (mise à jour de la liste), non retenu.

**Sécurité nouvelle.** Grand Bé et Petit Bé : accès seulement autour de la basse mer, isolement au flot (office de tourisme de Saint-Malo, oupecher.fr, Le Figaro Nautisme) ; anse des Sévignés : sentier à fort dénivelé et stationnement interdit en haut de la falaise (lechasseursousmarin.com) ; Dinard : un sentier côtier fermé après un éboulement (photo d'un avis municipal sur decathlon-outdoor.com : INFÉRÉ, lieu exact non établi).

**Restes.** Ces 90 postes sans second éditeur restent hors du catalogue tant qu'une seconde voix indépendante ne les nomme pas. La couverture de carnet-de-peche.com n'est pas exhaustive (pages refusées à la lecture directe ; extraits du moteur seulement). La phase 7 est prévue pour reprendre ces lacunes par d'autres sources locales.
