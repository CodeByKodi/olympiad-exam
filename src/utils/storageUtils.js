/**
 * Persistence utilities - Cross-platform.
 * Uses IndexedDB (storageService) for web. Electron uses electron-store when available.
 */

import { STORAGE_KEYS } from '../constants/exams.js';
import * as storageService from '../services/storageService.js';

const IS_ELECTRON = typeof window !== 'undefined' && window.electronStore;

let _cache = {};
let _cacheReady = false;

async function ensureCache() {
  if (_cacheReady) return;
  if (IS_ELECTRON) {
    _cache[STORAGE_KEYS.COMPLETED_TESTS] = await window.electronStore.get(STORAGE_KEYS.COMPLETED_TESTS) ?? [];
    _cache[STORAGE_KEYS.BEST_SCORES] = await window.electronStore.get(STORAGE_KEYS.BEST_SCORES) ?? {};
    _cache[STORAGE_KEYS.IN_PROGRESS] = await window.electronStore.get(STORAGE_KEYS.IN_PROGRESS) ?? null;
    _cache[STORAGE_KEYS.DARK_MODE] = await window.electronStore.get(STORAGE_KEYS.DARK_MODE);
    _cache[STORAGE_KEYS.SETTINGS] = await window.electronStore.get(STORAGE_KEYS.SETTINGS) ?? { shuffleQuestions: false, shuffleOptions: false };
  } else if (storageService.isAvailable()) {
    _cache[STORAGE_KEYS.COMPLETED_TESTS] = await storageService.get(STORAGE_KEYS.COMPLETED_TESTS) ?? [];
    _cache[STORAGE_KEYS.BEST_SCORES] = await storageService.get(STORAGE_KEYS.BEST_SCORES) ?? {};
    _cache[STORAGE_KEYS.IN_PROGRESS] = await storageService.get(STORAGE_KEYS.IN_PROGRESS) ?? null;
    _cache[STORAGE_KEYS.DARK_MODE] = await storageService.get(STORAGE_KEYS.DARK_MODE);
    _cache[STORAGE_KEYS.SETTINGS] = await storageService.get(STORAGE_KEYS.SETTINGS) ?? { shuffleQuestions: false, shuffleOptions: false };
  } else {
    try {
      const get = (k, def) => {
        try {
          const raw = localStorage.getItem(k);
          return raw != null ? JSON.parse(raw) : def;
        } catch { return def; }
      };
      _cache[STORAGE_KEYS.COMPLETED_TESTS] = get(STORAGE_KEYS.COMPLETED_TESTS, []);
      _cache[STORAGE_KEYS.BEST_SCORES] = get(STORAGE_KEYS.BEST_SCORES, {});
      _cache[STORAGE_KEYS.IN_PROGRESS] = get(STORAGE_KEYS.IN_PROGRESS, null);
      _cache[STORAGE_KEYS.DARK_MODE] = get(STORAGE_KEYS.DARK_MODE, undefined);
      _cache[STORAGE_KEYS.SETTINGS] = get(STORAGE_KEYS.SETTINGS, { shuffleQuestions: false, shuffleOptions: false });
    } catch {}
  }
  _cacheReady = true;
}

function getJson(key, defaultValue = null) {
  if (IS_ELECTRON && _cache[key] !== undefined) return _cache[key] ?? defaultValue;
  if (!IS_ELECTRON && _cache[key] !== undefined) return _cache[key] ?? defaultValue;
  if (!IS_ELECTRON) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

function setJson(key, value) {
  _cache[key] = value;
  if (IS_ELECTRON) {
    window.electronStore.set(key, value);
  } else if (storageService.isAvailable()) {
    storageService.set(key, value);
  } else {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set failed:', e);
    }
  }
}

function deleteKey(key) {
  delete _cache[key];
  if (IS_ELECTRON) {
    window.electronStore.delete(key);
  } else if (storageService.isAvailable()) {
    storageService.remove(key);
  } else {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

export async function initStorage() {
  if (IS_ELECTRON) {
    try {
      await Promise.race([
        ensureCache(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Storage init timeout')), 5000)),
      ]);
    } catch (e) {
      console.warn('Storage init failed, using defaults:', e.message);
    }
  } else if (storageService.isAvailable()) {
    try {
      await Promise.race([
        ensureCache(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Storage init timeout')), 5000)),
      ]);
    } catch (e) {
      console.warn('Storage init failed, using defaults:', e.message);
    }
  }
  const dark = getDarkMode();
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  return Promise.resolve();
}

export function getCompletedTests() {
  return getJson(STORAGE_KEYS.COMPLETED_TESTS, []);
}

export function addCompletedTest(entry) {
  const list = getCompletedTests();
  list.unshift({ ...entry, timestamp: Date.now() });
  setJson(STORAGE_KEYS.COMPLETED_TESTS, list.slice(0, 500));
}

export function getBestScores() {
  return getJson(STORAGE_KEYS.BEST_SCORES, {});
}

export function updateBestScore(examId, percentage, testId) {
  const scores = getBestScores();
  const current = scores[examId];
  if (!current || percentage > current.percentage) {
    scores[examId] = { percentage, testId, timestamp: Date.now() };
    setJson(STORAGE_KEYS.BEST_SCORES, scores);
    return true;
  }
  return false;
}

export function getInProgressAttempt() {
  return getJson(STORAGE_KEYS.IN_PROGRESS, null);
}

export function saveInProgressAttempt(attempt) {
  setJson(STORAGE_KEYS.IN_PROGRESS, attempt);
}

export function clearInProgressAttempt() {
  deleteKey(STORAGE_KEYS.IN_PROGRESS);
}

export function getDarkMode() {
  const val = getJson(STORAGE_KEYS.DARK_MODE);
  if (val === true || val === 'true') return true;
  if (val === false || val === 'false') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function setDarkMode(value) {
  setJson(STORAGE_KEYS.DARK_MODE, value);
}

export function getSettings() {
  return getJson(STORAGE_KEYS.SETTINGS, {
    shuffleQuestions: false,
    shuffleOptions: false,
  });
}

export function saveSettings(settings) {
  setJson(STORAGE_KEYS.SETTINGS, { ...getSettings(), ...settings });
}
