/**
 * Resolve asset URLs for static hosting (Vite dev, GitHub Pages).
 * Uses Vite base path for correct resolution under repo subpaths.
 */

import { resolveStaticPath } from '../config.js';

/**
 * Resolve an asset path (e.g. image) to a URL that works in dev and production.
 * @param {string} path - Path from JSON (e.g. "images/nso/grade3/q1.png" or "/images/...")
 * @returns {string} Resolved URL
 */
export function resolveAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return resolveStaticPath(path.startsWith('/') ? path.slice(1) : path);
}
