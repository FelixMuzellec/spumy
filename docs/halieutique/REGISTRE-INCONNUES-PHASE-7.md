# Registre des inconnues et des demandes à Félix (phase 7)

Phase 7 V3, livrable « registre des inconnues et demandes utilisateur » (référentiel, lignes 2690 et 2694 ; protocole § 0.6). Version 1 du 26 novembre 2026.

Les comptes ci-dessous sont mesurés sur les 98 fiches de `data/spots/fiches/` le 26 nov. 2026 (66 spots V2, 32 candidats V3), avec le même critère que `scripts/qualifier-fiches.mjs` : une rubrique est inconnue quand son statut est INCONNU ou qu'elle manque. Une donnée de sécurité inconnue n'est jamais « au vert » (PF-07).

## 1. Lacunes qu'aucune source publique lue ne comble

| Lacune | Fiches | Pourquoi les sources ne suffisent pas | Voie |
| --- | --- | --- | --- |
| Accès selon la marée (`safety.acces_maree`) | 75 sur 98 | Les guides et les offices de tourisme disent « attention à la marée » sans dire si le retour est coupé, ni quand | terrain ; journal de Félix (voie empirique) ; demande Q7-03 |
| Fenêtre de sécurité des fiches à contrainte de marée connue (`windows.securite`) | 23 sur 23 | Aucune source lue ne donne une durée praticable (« repartir au plus tard BM + x h ») : sans elle, aucun horaire ne peut être calculé (§ 7.6) | demande Q7-03 ; à défaut, le spot n'est jamais présenté comme praticable |
| Coefficient maximal (`safety.coef_max`) | 92 sur 98 | Une seule famille de sources (la V2) en donne, pour 6 fiches | même voie que la fenêtre de sécurité |
| Phases de marée (`tide_approaches`) | 32 fiches sans aucune phase documentée, 33 avec moins de deux | Les sources de pêche donnent surtout « la montante » ; la basse mer, l'étale et le jusant sont rarement décrits | journal de Félix ; Q7-02 pour Penmarc'h |
| Engagement (échelle SPUMY 1 à 3) | 66 jugements de la V2 seulement | C'est un jugement de SPUMY, pas une donnée publiée ; aucune source ne le valide | validation des niveaux par Félix (reste de la phase 5) |
| Houle maximale | 66 valeurs de la V2, sans source | Aucune source ne publie une houle maximale par poste | épreuve de la phase 8 ; journal |
| Mouvements de terrain | 54 fiches sans mouvement recensé | Le recensement du BRGM (Géorisques) n'est pas exhaustif : l'absence d'enregistrement ne prouve pas l'absence de risque | inconnu gardé ; observation sur place |
| Consigne de sécurité sourcée | 40 fiches sans aucune | Les consignes de la V2 renvoient souvent à la « prudence du guide », qui n'est pas une source | recherche à poursuivre (phase 8) |
| Restrictions d'accès (`access.restrictions`) | 98 sur 98 | Propriétés, arrêtés municipaux et zones protégées : aucun inventaire public par poste | recherche commune par commune, hors de portée de cette phase |
| Règles locales | 35 fiches non conformes (QUAL-6) | Finistère : limites des ports et périmètres des cantonnements absents de la synthèse de la DDTM. Manche (lue le 26 nov.) : l'arrêté signé n° 116/2026 n'a qu'une copie sans texte lisible ; les six arrêtés de cantonnement que le projet garde (Chausey 1964, Cosqueville 1965, Blainville-sur-Mer 1977, Pirou 1978, Quinéville 1980, Saint-Germain-sur-Ay 1982) n'ont pas été trouvés en ligne ; trois touchent une fiche | texte signé à relire dès qu'une copie lisible paraît au recueil des actes de la préfecture de Normandie ; mairies |
| Rade de Brest, abers et havres du Cotentin en hiver | aucune étude | Aucun marquage publié dans ces milieux en hiver ; l'« abri » de de Pontual 2019 est la mer d'Iroise entière | hypothèse « abri » gardée au niveau 4 ; voie empirique (journal, hors du dépôt, PF-17) |
| Côte ouest du Cotentin (Pirou, Portbail) | aucun marquage | Ce qui s'y applique est INFÉRÉ des zones voisines | Confiance plus basse proposée (`docs/moteur-bord/07-REVISION-PHASE-7.md`) |
| Comportement selon la phase de marée au poste | aucune mesure régionale | De Pontual 2019 ne décrit qu'un rythme lié à la renverse, sur un poisson, au large | épreuve de la phase 8 sur le journal |
| *Movement Ecology* 2024 (doi 10.1186/s40462-024-00482-w) ; notice Archimer 56738 ; Carroll 2014 | 3 sources | Page de l'éditeur illisible (erreur de témoins) ; notice Archimer non ouverte (autorisation sans réponse), contenu inconnu ; thèse hors zone | à relire si l'accès s'ouvre ; faible apport attendu |

## 2. Demandes à Félix (§ 0.6)

Aucune n'est bloquante pour la phase 7 : les tâches qui en dépendent restent marquées inconnues, jamais remplies par défaut. Une seule question est posée à la fois ; l'ordre ci-dessous est celui de l'impact sur la sécurité.

| N° | Question | Raison | Tâches en attente | Option par défaut | Réponse |
| --- | --- | --- | --- | --- | --- |
| Q7-03 | Pour les 23 spots où la marée peut couper le retour ou noyer le poste, combien de temps avant ou après la basse mer repars-tu, et au-dessus de quel coefficient n'y vas-tu pas ? Commencer par ceux que tu pratiques. Liste : Aber Benoît, pointe d'Agon, Barnénez – Dourduff, Cap Coz, Carantec (Penn al Lann – Cosmeur), Gouville-sur-Mer, Saint-Malo (Grand Bé et Petit Bé), Granville, Kermorvan, baie du Kernic, Locquirec, Mousterlin, Aber Wrac'h (Paluden – pont du Diable), Penmarc'h, Penn Enez – Grève Blanche, embouchure de la Penzé, Pirou Plage, Portbail, Régnéville, dunes de Sainte-Marguerite, Sciotot, Surtainville, île de Térénez | aucune source ne donne de durée praticable ; sans elle, aucun horaire sûr n'est calculable | `windows.securite` et `coef_max` de ces fiches ; condition d'une fiche SAFE (D6-15, D6-21) | rester inconnu : le spot n'est jamais présenté comme praticable | — |
| Q7-01 | Mousterlin : pêches-tu à la pointe (bordures du platier) ou à l'exutoire des eaux pluviales, à environ 510 m ? Une photo du poste suffit | deux postes probables d'un même site | poste précis de la fiche ; challenge TOP_TIER | garder la pointe, poste « à préciser » | — |
| Q7-02 | Penmarc'h : quel est ton poste habituel autour du phare d'Eckmühl, et à quelles phases de marée ? | phases haute et basse inconnues | `tide_approaches` de la fiche | inconnues gardées | — |
| Q7-04 | Proposition : qu'un spot ne soit TOP_TIER qu'avec au moins deux phases de marée documentées. Les deux TOP_TIER actuels passeraient « à vérifier » | la qualification de la phase 5 est validée : tout changement est présenté (PF-04) | `scripts/qualifier-fiches.mjs` (rien n'est changé) | ne rien changer | — |
| Q7-05 | Rades, abers et havres en hiver : ton journal confirme-t-il des prises de décembre à février, et où ? (réponse gardée hors du dépôt, PF-17) | seule voie pour l'hypothèse « abri » | niveau de preuve de `abri-hiver` | niveau 4 gardé | — |

Questions déjà ouvertes, non reposées (§ 0.6, règle 3) : confirmation de la phase 6 et des décisions D6-01 à D6-21 ; validation des niveaux d'engagement ; seuils BATEAU (PF-37).

## 3. Suite

- Une réponse de Félix est intégrée dans la fiche concernée avec son statut (INFÉRÉ, « d'après Félix ») et sa date, puis la question est close ici.
- Le texte signé de la Manche (arrêté n° 116/2026) est à relire dès qu'une copie lisible est publiée : ses règles passeraient alors de « à vérifier » à VÉRIFIÉ, et l'indicateur K-12 avancerait de 13 fiches au plus (les trois cantonnements et Sciotot gardent leur réserve).
