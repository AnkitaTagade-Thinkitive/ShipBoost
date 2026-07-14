/**
 * Smart Match — the default recommendation engine.
 *
 * Given how much a customer still needs to spend to unlock free shipping
 * ("remaining") and a pool of candidate products, pick the products whose price
 * best helps close that gap:
 *
 *   1. Prefer products priced at (or very near) the remaining amount.
 *   2. Then products within ±10%, then within ±20%.
 *   3. Avoid extremely expensive products (a $200 add-on for a $10 gap).
 *   4. Fall back to the closest available prices when nothing lands in-band.
 *
 * This is a PURE function with no I/O so it can be unit-tested, reused by the
 * dashboard preview, and mirrored by the storefront script. It is unit-agnostic:
 * `price` and `remaining` only need to share the SAME unit. The storefront feeds
 * both in cents (matching `cart.total_price`); the tests use whole dollars.
 */

export interface SmartMatchCandidate {
  /** Price in the same unit the caller uses for `remaining`. */
  price: number;
}

/**
 * How far over "remaining" a price may sit before it starts collecting an
 * "extremely expensive" penalty. Anything within +20% is still considered a
 * good nudge to the goal; beyond that the penalty grows with the overshoot.
 */
export const EXPENSIVE_BAND = 0.2;

/**
 * Score a single price against the remaining amount. Lower is better.
 * Exported for testing and for the mirrored storefront implementation.
 */
export function scorePrice(price: number, remaining: number): number {
  // Goal already reached (or unknown): rank by cheapest so a sane, inexpensive
  // set surfaces if the caller still wants to show something.
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return price;
  }

  const ratio = Math.abs(price - remaining) / remaining;

  // Penalize prices that overshoot the remaining amount by a lot. Undershooting
  // (a cheap product) is already ranked down by `ratio`, and cheap add-ons are
  // never "too expensive", so only the over-shoot side is penalized.
  const over = price > remaining ? (price - remaining) / remaining : 0;
  const expensivePenalty = over > EXPENSIVE_BAND ? over - EXPENSIVE_BAND : 0;

  return ratio + expensivePenalty;
}

/**
 * Rank candidates by Smart Match and return the best `max`.
 *
 * - Candidates with a non-finite or non-positive price are ignored.
 * - The sort is stable: equally-scored products keep their input order, so a
 *   merchant-curated pool keeps its curation as a tiebreak.
 */
export function smartMatch<T extends SmartMatchCandidate>(
  candidates: readonly T[],
  remaining: number,
  max: number,
): T[] {
  if (max <= 0) return [];

  const eligible = candidates.filter(
    (c) => Number.isFinite(c.price) && c.price > 0,
  );

  return eligible
    .map((candidate, index) => ({
      candidate,
      index,
      score: scorePrice(candidate.price, remaining),
    }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, max)
    .map((entry) => entry.candidate);
}
