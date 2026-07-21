/**
 * Decorative, floating blurred gradient blobs used as the landing page
 * background. Purely presentational and `aria-hidden` — all styling and the
 * float animation live in the route-scoped `landing.css`.
 */
export function GradientBlobs() {
  return (
    <div className="sb-blobs" aria-hidden="true">
      <span className="sb-blob sb-blob--green" />
      <span className="sb-blob sb-blob--lime" />
      <span className="sb-blob sb-blob--emerald" />
    </div>
  );
}
