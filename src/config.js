/**
 * App configuration for build and deployment.
 * BASE_URL is set by Vite from the base config (e.g. './' or '/olympiad-exam/').
 * For GitHub Pages: base must be /repo-name/ so assets load under the subpath.
 */
export const BASE_PATH = import.meta.env?.BASE_URL ?? './';

/**
 * Resolve a path for static assets (e.g. starter packs, images).
 * Works with Vite base path for GitHub Pages subpath deployment.
 * Uses absolute URLs in browser to avoid fetch resolution issues.
 * @param {string} relativePath - Path like "starter-packs/nso/grade3/test1.json" or "images/logo.png"
 * @returns {string} Full URL path
 */
export function resolveStaticPath(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return '';
  const base = BASE_PATH.endsWith('/') ? BASE_PATH : BASE_PATH + '/';
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const path = `${base}${clean}`;
  if (typeof window !== 'undefined') {
    try {
      return new URL(path, document.baseURI || window.location.href).href;
    } catch {
      return path;
    }
  }
  return path;
}

/** Alias for resolveStaticPath - use for images, JSON, and other static assets. */
export function getAssetPath(path) {
  return resolveStaticPath(path);
}
