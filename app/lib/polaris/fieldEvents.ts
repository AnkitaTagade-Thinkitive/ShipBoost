/**
 * Helpers for reading values out of Polaris web-component field events.
 *
 * Polaris fields (`s-text-field`, `s-money-field`, `s-color-field`,
 * `s-number-field`, `s-switch`, ...) dispatch native DOM events whose
 * `currentTarget` exposes `value` (text-like fields) or `checked` (toggles).
 * Centralising the cast here keeps components clean and type-safe.
 */

/** Read the string `value` from a Polaris field change/input event. */
export function fieldValue(event: Event): string {
  return (event.currentTarget as HTMLInputElement).value;
}

/** Read the boolean `checked` state from an `s-switch` / `s-checkbox` event. */
export function fieldChecked(event: Event): boolean {
  return (event.currentTarget as HTMLInputElement).checked;
}

/**
 * Read a numeric `value` from an `s-number-field` event, falling back to a
 * default when the field is empty or not a finite number.
 */
export function fieldNumber(event: Event, fallback = 0): number {
  const parsed = Number((event.currentTarget as HTMLInputElement).value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
