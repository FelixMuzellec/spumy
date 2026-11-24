// Phase 6 V3 — étude du moteur BORD (PROVISOIRE, hors application) : formules du référentiel § 9.1.8 et § 9.1.9,
// écrites pour être vérifiées, pas pour être branchées sur le moteur. Aucune valeur ici n'est calibrée.
//   ψ  : probabilité de l'état « bar présent et actif au poste » ; π_zero = 1 − ψ (convention des bibliothèques).
//   Λ  : moyenne de captures de la composante de comptage (NB2), Λ = θ_x · E · λ_env.
//   k  : taille (dispersion) de la NB2 ; k → ∞ donne le Poisson.

/** log Γ(x), approximation de Lanczos (g = 7, 9 termes), précise à 1e-13 environ pour x > 0. */
export function lgamma(x) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

const estInfini = (k) => k == null || !Number.isFinite(k);

/** Probabilité d'un zéro dans la NB2 de moyenne Λ et de taille k : (k / (k + Λ))^k ; e^(−Λ) quand k → ∞. */
export function zeroNB(L, k) {
  if (!(L >= 0)) throw new Error("Λ doit être positive ou nulle");
  return estInfini(k) ? Math.exp(-L) : Math.exp(k * Math.log(k / (k + L)));
}

/** log P(Y = y) de la NB2 (moyenne μ, taille k) ; Poisson quand k → ∞. */
export function logNB(y, mu, k) {
  if (!Number.isInteger(y) || y < 0) throw new Error("y entier positif ou nul");
  if (mu === 0) return y === 0 ? 0 : -Infinity;
  if (estInfini(k)) return y * Math.log(mu) - mu - lgamma(y + 1);
  return lgamma(y + k) - lgamma(k) - lgamma(y + 1) + k * Math.log(k / (k + mu)) + y * Math.log(mu / (k + mu));
}

/** P(Y = y) du ZINB : avec probabilité 1 − ψ, zéro structurel ; avec ψ, NB2(μ, k). */
export function pZINB(y, psi, mu, k) {
  const nb = Math.exp(logNB(y, mu, k));
  return y === 0 ? (1 - psi) + psi * nb : psi * nb;
}

/** P(Y ≥ 1) = ψ [1 − (1 + Λ/k)^(−k)] (§ 9.1.8) ; ψ (1 − e^(−Λ)) dans la limite de Poisson. */
export function pAuMoinsUne(psi, L, k) {
  return psi * (1 - zeroNB(L, k));
}

/** Probabilité a posteriori qu'une bredouille confirmée soit un zéro structurel, π_i⁽⁰⁾ (§ 9.1.9) ; q_i = 1 − π_i⁽⁰⁾. */
export function zeroStructurel(psi, Lcurr, k) {
  const a = 1 - psi, b = psi * zeroNB(Lcurr, k);
  return a + b > 0 ? a / (a + b) : 0;
}

/**
 * Poids temporel candidat ω_i(t) = ω_long · ω_saison · exp(−ln 2 · Δt / h_récent) (§ 9.1.9). Proposition, pas valeur
 * approuvée : h_récent et les deux autres facteurs restent à estimer.
 */
export function poidsTemporel({ long = 1, saison = 1, ageJours, demiVieJours }) {
  if (!(demiVieJours > 0)) throw new Error("demi-vie > 0");
  return long * saison * Math.exp(-Math.LN2 * ageJours / demiVieJours);
}

/**
 * Estimateur de travail de θ_x (§ 9.1.9) : (b₀ + Σ ω q y) / (b₀ + Σ ω q Λ_base). Avec q = 1 partout, c'est le ratio
 * Gamma–Poisson sans excès de zéros. Il n'est le posterior exact que dans le cas Poisson, état actif connu, ω = 1.
 * sessions : [{ y, Lbase, w = 1, q = 1 }].
 */
export function thetaRatio(b0, sessions) {
  let n = b0, d = b0;
  for (const s of sessions) {
    // Une bredouille sans q n'est jamais comptée active par défaut : q doit être donné (q = 1 seulement si ψ = 1 est connu).
    if (s.y === 0 && s.q == null) throw new Error("q manquant pour une bredouille");
    const w = s.w ?? 1, q = s.y > 0 ? 1 : s.q; n += w * q * s.y; d += w * q * s.Lbase;
  }
  return n / d;
}

/**
 * Posterior « exact » de θ_x sur une grille : a priori Gamma(b₀, b₀) (forme, taux), vraisemblance ZINB de chaque session
 * avec μ_i = θ · Λ_base,i (ψ_i et k connus), puissance ω_i (vraisemblance pondérée, convention de travail).
 * Renvoie moyenne, écart type et quantiles 5 % et 95 %.
 */
export function thetaPosterieur(b0, sessions, { psi = 1, k = Infinity, max = 12, pas = 1e-3 } = {}) {
  const xs = [], lp = [];
  for (let th = pas; th <= max; th += pas) {
    let l = (b0 - 1) * Math.log(th) - b0 * th;
    for (const s of sessions) l += (s.w ?? 1) * Math.log(pZINB(s.y, s.psi ?? psi, th * s.Lbase, k));
    xs.push(th); lp.push(l);
  }
  const m = Math.max(...lp), p = lp.map((v) => Math.exp(v - m)), z = p.reduce((a, v) => a + v, 0);
  const moy = xs.reduce((a, x, i) => a + x * p[i], 0) / z;
  const sd = Math.sqrt(xs.reduce((a, x, i) => a + (x - moy) ** 2 * p[i], 0) / z);
  let c = 0, q05 = null, q95 = null;
  for (let i = 0; i < xs.length; i++) { c += p[i] / z; if (q05 == null && c >= 0.05) q05 = xs[i]; if (q95 == null && c >= 0.95) q95 = xs[i]; }
  // Densité relative au bord de la grille : contrôle de troncature (doit rester négligeable, sinon élargir `max`).
  return { moyenne: moy, ecartType: sd, q05, q95, densiteAuBord: p[p.length - 1] };
}

/** Posterior de travail de ψ (Beta, poids fractionnaires, § 9.1.9) : (a_ψ + Σ ω q) / (a_ψ + b_ψ + Σ ω). */
export function psiBeta(a, b, sessions) {
  let n = a, d = a + b;
  for (const s of sessions) {
    if (s.q == null && !(s.y > 0)) throw new Error("q manquant pour une bredouille");
    const w = s.w ?? 1; n += w * (s.y > 0 ? 1 : s.q); d += w;
  }
  return n / d;
}

// ── Tirages reproductibles (graine fixe) ──
/** Générateur mulberry32 : suite déterministe dans [0, 1). */
export function alea(graine) {
  let a = graine >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function normal(u) { let a = 0, b = 0; while (a === 0) a = u(); b = u(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }
/** Gamma(forme α, échelle 1), méthode de Marsaglia et Tsang. */
function gamma(u, alpha) {
  if (alpha < 1) return gamma(u, alpha + 1) * Math.pow(u(), 1 / alpha);
  const d = alpha - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { x = normal(u); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    const w = u();
    if (w < 1 - 0.0331 * x ** 4 || Math.log(w) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function poisson(u, mu) {
  if (mu > 30) return Math.max(0, Math.round(mu + Math.sqrt(mu) * normal(u)));
  const L = Math.exp(-mu); let k = 0, p = 1;
  do { k++; p *= u(); } while (p > L);
  return k - 1;
}
/** Tirage ZINB : état actif avec probabilité ψ, puis Poisson de moyenne tirée d'une Gamma(k, μ/k) (mélange NB2). */
export function tirerZINB(u, psi, mu, k) {
  if (u() >= psi) return 0;
  return poisson(u, estInfini(k) ? mu : gamma(u, k) * mu / k);
}
