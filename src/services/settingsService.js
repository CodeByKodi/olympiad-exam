/**
 * Settings Service - User preferences.
 * Uses IndexedDB via storageUtils (browser storage only).
 */

import { getSettings, saveSettings, getDarkMode, setDarkMode } from '../utils/storageUtils.js';

export function get() {
  return getSettings();
}

export function save(settings) {
  saveSettings(settings);
}

export function getDark() {
  return getDarkMode();
}

export function setDark(value) {
  setDarkMode(value);
}
