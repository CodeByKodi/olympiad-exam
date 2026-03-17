/**
 * App configuration for build and deployment.
 * BASE_URL is set by Vite based on the base config (e.g. './' or '/olympiad-exam/').
 */
export const BASE_PATH = import.meta.env?.BASE_URL ?? './';

/**
 * Resolve a path for static assets (e.g. starter packs, images).
 * Works with Vite base path for GitHub Pages subpath deployment.
 */
export function resolveStaticPath(relativePath) {
  const base = BASE_PATH.endsWith('/') ? BASE_PATH : BASE_PATH + '/';
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${base}${clean}`;
}
