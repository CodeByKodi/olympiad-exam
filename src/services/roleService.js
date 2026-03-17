/**
 * Role service - Client-side role management for Student/Admin modes.
 * Uses localStorage. Works offline. No backend.
 */

const STORAGE_KEY = 'olympiad_role';
const ADMIN_VALUE = 'admin';

export function getRole() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === ADMIN_VALUE ? 'admin' : 'user';
  } catch {
    return 'user';
  }
}

export function isAdmin() {
  return getRole() === 'admin';
}

export function setAdmin() {
  try {
    localStorage.setItem(STORAGE_KEY, ADMIN_VALUE);
    return true;
  } catch {
    return false;
  }
}

export function clearAdmin() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
