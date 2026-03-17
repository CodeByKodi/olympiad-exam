/**
 * Auth service - Login with predefined credentials.
 * Uses localStorage. Works offline. No backend.
 */

import { PREDEFINED_USERS } from '../config/auth.js';

const STORAGE_KEY = 'olympiad_user';

export function login(username, password) {
  const u = String(username || '').trim().toLowerCase();
  const p = String(password || '');

  const user = PREDEFINED_USERS.find(
    (x) => x.username.toLowerCase() === u && x.password === p
  );

  if (!user) return { ok: false, error: 'Invalid username or password' };

  const session = {
    username: user.username,
    role: user.role,
    displayName: user.displayName,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  } catch {
    return { ok: false, error: 'Could not save session' };
  }
}

export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export function getRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

export function isAdmin() {
  return getRole() === 'admin';
}

export function isTeacher() {
  return getRole() === 'teacher';
}

export function hasLibraryAccess() {
  const role = getRole();
  return role === 'admin' || role === 'teacher';
}
