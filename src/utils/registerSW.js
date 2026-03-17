/**
 * Register service worker for offline support.
 * Uses BASE_URL so it works with GitHub Pages subpath.
 */
export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  const base = import.meta.env.BASE_URL ?? '/';
  const swPath = `${base}sw.js`;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(swPath, { scope: base })
      .then((reg) => {
        reg.update();
      })
      .catch(() => {});
  });
}
