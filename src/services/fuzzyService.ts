/**
 * Fuzzy Logic Restock Urgency Engine
 *
 * Method: Mamdani-style inference with singleton output sets
 * (equivalent to a Sugeno zero-order system — compact and readable).
 *
 * Inputs
 * ──────
 *  • stock         : product's current stock level  (0 – 100+)
 *  • salesVelocity : daily average units sold        (0 – 30+)
 *
 * Output
 * ──────
 *  • urgencyScore  : defuzzified urgency value       (0 – 100)
 *  • urgencyStatus : human-readable label
 *
 * Membership function notation used below:
 *   trapmf(x, a, b, c, d) → 0 outside [a,d], rises linearly a→b,
 *                            stays 1 from b→c, falls linearly c→d
 *   trimf(x, a, b, c)     → 0 outside [a,c], rises linearly a→b,
 *                            falls linearly b→c
 */

// ─────────────────────────────────────────────────────────────────
// SECTION 1 — Stock Level membership functions
//             Input range: 0 to ∞  (practical ceiling ~100)
// ─────────────────────────────────────────────────────────────────

/**
 * Stock = LOW
 * Shape: trapezoidal (flat top at left)
 *
 *  1 │▓▓▓▓▓\
 *  0 │      \___
 *    0  10  25  100
 */
function stockLow(x: number): number {
  if (x <= 10) return 1;
  if (x >= 25) return 0;
  return (25 - x) / (25 - 10);
}

/**
 * Stock = MEDIUM
 * Shape: triangular, peak at 30
 *
 *  1 │     /\
 *  0 │____/  \____
 *    0 10  30  55  100
 */
function stockMedium(x: number): number {
  if (x <= 10 || x >= 55) return 0;
  if (x > 10 && x <= 30) return (x - 10) / (30 - 10);
  return (55 - x) / (55 - 30);
}

/**
 * Stock = HIGH
 * Shape: trapezoidal (flat top at right)
 *
 *  1 │        /▓▓▓
 *  0 │_______/
 *    0   40  60  100
 */
function stockHigh(x: number): number {
  if (x <= 40) return 0;
  if (x >= 60) return 1;
  return (x - 40) / (60 - 40);
}

// ─────────────────────────────────────────────────────────────────
// SECTION 2 — Sales Velocity membership functions
//             Input range: 0 to ∞  (practical ceiling ~30)
// ─────────────────────────────────────────────────────────────────

/**
 * Velocity = SLOW  (units/day)
 * Shape: trapezoidal (flat top at left)
 *
 *  1 │▓▓\
 *  0 │   \___
 *    0  2  7  30
 */
function velocitySlow(v: number): number {
  if (v <= 2) return 1;
  if (v >= 7) return 0;
  return (7 - v) / (7 - 2);
}

/**
 * Velocity = NORMAL
 * Shape: triangular, peak at 9
 *
 *  1 │    /\
 *  0 │___/  \___
 *    0 3  9  18  30
 */
function velocityNormal(v: number): number {
  if (v <= 3 || v >= 18) return 0;
  if (v > 3 && v <= 9) return (v - 3) / (9 - 3);
  return (18 - v) / (18 - 9);
}

/**
 * Velocity = FAST
 * Shape: trapezoidal (flat top at right)
 *
 *  1 │        /▓▓▓
 *  0 │_______/
 *    0   12  20  30
 */
function velocityFast(v: number): number {
  if (v <= 12) return 0;
  if (v >= 20) return 1;
  return (v - 12) / (20 - 12);
}

// ─────────────────────────────────────────────────────────────────
// SECTION 3 — Output singleton centers
// Each represents the "center of gravity" of an output fuzzy set.
// ─────────────────────────────────────────────────────────────────

const URGENCY = {
  LOW: 15,        // "Safe"      – no immediate action needed
  MEDIUM: 40,     // "Watch"     – keep an eye on stock levels
  HIGH: 70,       // "Urgent"    – schedule restock soon
  EMERGENCY: 90,  // "Emergency" – restock immediately
} as const;

// ─────────────────────────────────────────────────────────────────
// SECTION 4 — Rule base  (IF … AND … THEN …)
//
//  │ Stock╲Velocity │  Slow  │ Normal │  Fast  │
//  │────────────────┼────────┼────────┼────────│
//  │ Low            │ MEDIUM │  HIGH  │  EMRG  │
//  │ Medium         │  LOW   │ MEDIUM │  HIGH  │
//  │ High           │  LOW   │  LOW   │ MEDIUM │
// ─────────────────────────────────────────────────────────────────

interface Rule {
  firing: number;
  center: number;
}

function buildRules(
  sLow: number, sMed: number, sHigh: number,
  vSlow: number, vNorm: number, vFast: number,
): Rule[] {
  // AND operator = min(μA, μB)  — standard Mamdani conjunction
  return [
    { firing: Math.min(sLow,  vFast), center: URGENCY.EMERGENCY }, // R1
    { firing: Math.min(sLow,  vNorm), center: URGENCY.HIGH },      // R2
    { firing: Math.min(sLow,  vSlow), center: URGENCY.MEDIUM },    // R3
    { firing: Math.min(sMed,  vFast), center: URGENCY.HIGH },      // R4
    { firing: Math.min(sMed,  vNorm), center: URGENCY.MEDIUM },    // R5
    { firing: Math.min(sMed,  vSlow), center: URGENCY.LOW },       // R6
    { firing: Math.min(sHigh, vFast), center: URGENCY.MEDIUM },    // R7
    { firing: Math.min(sHigh, vNorm), center: URGENCY.LOW },       // R8
    { firing: Math.min(sHigh, vSlow), center: URGENCY.LOW },       // R9
  ];
}

// ─────────────────────────────────────────────────────────────────
// SECTION 5 — Defuzzification  (weighted centroid)
//
//  score = Σ( firing_i × center_i ) / Σ( firing_i )
// ─────────────────────────────────────────────────────────────────

function defuzzify(rules: Rule[]): number {
  const totalFiring = rules.reduce((sum, r) => sum + r.firing, 0);
  if (totalFiring === 0) return 0; // edge case: no rule fires at all
  const weightedSum = rules.reduce((sum, r) => sum + r.firing * r.center, 0);
  return Math.round((weightedSum / totalFiring) * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────
// SECTION 6 — Status label
// ─────────────────────────────────────────────────────────────────

function toUrgencyStatus(score: number): string {
  if (score >= 75) return 'Emergency';
  if (score >= 55) return 'Urgent';
  if (score >= 30) return 'Watch';
  return 'Safe';
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

export interface FuzzyResult {
  urgencyScore: number;
  urgencyStatus: string;
}

export function calculateRestockUrgency(
  stock: number,
  salesVelocity: number,
): FuzzyResult {
  // Step 1 — Fuzzify inputs
  const sLow  = stockLow(stock);
  const sMed  = stockMedium(stock);
  const sHigh = stockHigh(stock);

  const vSlow = velocitySlow(salesVelocity);
  const vNorm = velocityNormal(salesVelocity);
  const vFast = velocityFast(salesVelocity);

  // Step 2 — Evaluate rule base
  const rules = buildRules(sLow, sMed, sHigh, vSlow, vNorm, vFast);

  // Step 3 — Defuzzify
  const urgencyScore = defuzzify(rules);

  // Step 4 — Derive label
  const urgencyStatus = toUrgencyStatus(urgencyScore);

  return { urgencyScore, urgencyStatus };
}
