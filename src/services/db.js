/**
 * Shared IndexedDB database for Olympiad app.
 * Single DB with multiple stores for storage abstraction.
 */

const DB_NAME = 'olympiad-exam-db';
const DB_VERSION = 2;

let db = null;

export function openDB() {
  if (db) return Promise.resolve(db);
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

export function isAvailable() {
  return typeof indexedDB !== 'undefined';
}
