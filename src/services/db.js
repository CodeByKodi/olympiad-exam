/**
 * Shared IndexedDB database for Olympiad app.
 * Single DB with multiple stores for storage abstraction.
 * Includes retry for transient failures (e.g. private browsing, quota).
 */

const DB_NAME = 'olympiad-exam-db';
const DB_VERSION = 2;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 300;

let db = null;

function openDBOnce() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains('kv')) {
        database.createObjectStore('kv');
      }
      if (!database.objectStoreNames.contains('question_packs')) {
        database.createObjectStore('question_packs', { keyPath: 'packId' });
      }
      if (!database.objectStoreNames.contains('library_index')) {
        database.createObjectStore('library_index', { keyPath: 'id' });
      }
    };
  });
}

export async function openDB() {
  if (db) return db;
  let lastError;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await openDBOnce();
      return result;
    } catch (e) {
      lastError = e;
      if (attempt < RETRY_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  throw lastError;
}

export function isAvailable() {
  return typeof indexedDB !== 'undefined';
}
