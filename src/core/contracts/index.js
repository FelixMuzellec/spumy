// Contrats de données de la V3 (ARCHITECTURE-V3 § 3 et § 11), en JSDoc, vérifiés par `npm run typecheck`
// (tsc --checkJs, ADR-V3-020). Ce module ne contient que des types : il n'exécute rien.
// Unités canoniques : degrés décimaux WGS 84, minutes, mètres, nœuds, °C, hPa ; heures en UTC (ISO 8601), sauf mention.

/** @typedef {"DEVICE" | "MANUAL"} SourcePosition */
/** @typedef {"granted" | "denied" | "prompt" | "unavailable"} PermissionPosition */

/**
 * Position de référence de la personne (§ 8.1). Jamais stockée hors du cache arrondi.
 * @typedef {object} Position
 * @property {number} lat
 * @property {number} lon
 * @property {number | null} precisionM précision annoncée, en mètres ; null si inconnue
 * @property {SourcePosition} source
 * @property {string} at heure de la mesure ou de la saisie (ISO 8601)
 * @property {string} validUntil
 * @property {PermissionPosition} permission
 * @property {boolean} explicit vrai si la personne l'a choisie elle-même
 * @property {string} label nom affiché (« Pirou »)
 */

/** @typedef {"mesurée" | "prévision" | "calculée" | "fournie_utilisateur" | "estimation" | "inconnue"} TypeDonnee */

/**
 * Valeur qualifiée : toute donnée affichée porte sa source et son heure (règle « chaque chiffre a sa source et son heure »).
 * @template T
 * @typedef {object} Qualified
 * @property {T | null} value null = inconnue, jamais « au vert »
 * @property {string} unit
 * @property {string} source
 * @property {string | null} at
 * @property {number | null} ageMin
 * @property {string | null} resolution
 * @property {TypeDonnee} type
 */

/** @typedef {"BORD" | "BATEAU"} Mode */

/**
 * Spot du catalogue (identifiants V2 gardés, V3-018).
 * @typedef {object} Spot
 * @property {string} id
 * @property {string} name
 * @property {Mode} mode
 * @property {{ lat: number, lon: number, precision: "décimales" | "minute" }} position
 * @property {{ lat: number, lon: number, kind: string }} [access] point d'accès (stationnement) pour l'isochrone
 * @property {string} habitat
 * @property {{ exposed: number[], sheltered: number[] }} exposure angles en degrés
 * @property {{ portId: string, rules: object }} tide
 * @property {{ dangerLevel: number, coefHardMax?: number, houleMax: number, notes: string[] }} safety
 * @property {string[]} sources
 * @property {object[]} evidence
 * @property {boolean} private spots personnels : privés par défaut
 * @property {{ guide: string, zone: string, isLocal: boolean, distMin: number }} [legacy]
 */

/**
 * Temps de route BORD (V3-009).
 * @typedef {object} Route
 * @property {string} spotId
 * @property {number | null} minutes
 * @property {"IGN" | "estimation"} source
 * @property {boolean} verified
 * @property {string} at
 * @property {string} validUntil
 * @property {string} originRounded position d'origine arrondie à 100 m (clé de cache)
 */

/** @typedef {"ok" | "verify" | "nr"} StatutSecurite */

/**
 * Sécurité, indépendante des scores et jamais compensée.
 * @typedef {object} Safety
 * @property {StatutSecurite} status
 * @property {{ id: string, status: StatutSecurite, reason: string, at: string }[]} rules
 * @property {string | null} worstAt
 */

/**
 * Un critère de la Favorabilité (moteur v2 : marée 25 + 20, lumière 25, vent et mer 30).
 * @typedef {object} CritereFavorabilite
 * @property {string} k
 * @property {string} label
 * @property {number} pts
 * @property {number} max
 * @property {string} why
 */

/**
 * Favorabilité (0 à 100) = conditions × présence.
 * @typedef {object} Favorability
 * @property {number | null} value
 * @property {1 | 2 | 3 | 4 | 5 | null} band
 * @property {number} coverage part des critères connus (0 à 1)
 * @property {CritereFavorabilite[]} parts
 * @property {{ start: string, end: string } | null} window
 * @property {string | null} reasonIfNull
 */

/**
 * Confiance (0 à 100) : affichée, ne change jamais le rang.
 * @typedef {object} Confidence
 * @property {number} value
 * @property {"haute" | "moyenne" | "faible"} level
 * @property {{ id: string, value: number, max: number }[]} dimensions
 * @property {"exact" | "range" | "none"} displayPrecision
 */

/**
 * Spot classé (§ 9.1.6).
 * @typedef {object} Ranked
 * @property {Spot} spot
 * @property {Route | null} route
 * @property {Safety} safety
 * @property {Favorability} favorability
 * @property {Confidence} confidence
 * @property {number | null} rank
 * @property {"sure" | "verify" | "excluded"} group
 * @property {string[]} tieWith
 * @property {string} reasonOfRank
 */

/** @typedef {"capture" | "sans_capture" | "resultat_inconnu" | "incomplete" | "annulee" | "absence_saisie"} IssueSortie */

/**
 * Sortie du journal (§ 8.4.1 ; JRN-06 : la note affichée au moment de la sortie est gardée).
 * @typedef {object} JournalEntry
 * @property {string} id
 * @property {Mode} mode
 * @property {string | null} spotId
 * @property {string} start
 * @property {string | null} end
 * @property {IssueSortie} outcome
 * @property {object[]} catches
 * @property {{ planned: object | null, observed: object | null }} conditions
 * @property {{ favorability: number | null, confidence: number | null, modelVersion: string } | null} noteSnapshot
 * @property {object[]} lures
 * @property {string} notes
 * @property {number} completeness
 * @property {string} updatedAt
 */

export {};
