/**
 * Question Library Storage - IndexedDB for web.
 */

import { openDB } from './db.js';

const PACKS_STORE = 'question_packs';
const INDEX_STORE = 'library_index';

async function loadIndex() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(INDEX_STORE, 'readonly');
    const req = tx.objectStore(INDEX_STORE).get('packs');
    req.onsuccess = () => resolve(req.result?.entries || []);
    req.onerror = () => reject(req.error);
  });
}

async function saveIndex(entries) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(INDEX_STORE, 'readwrite');
    tx.objectStore(INDEX_STORE).put({ id: 'packs', entries });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAllPacks() {
  const database = await openDB();
  const packs = await new Promise((resolve, reject) => {
    const tx = database.transaction(PACKS_STORE, 'readonly');
    const req = tx.objectStore(PACKS_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  const index = await loadIndex();
  const byPackId = new Map(index.map((e) => [e.packId, e]));

  return packs.map((p) => ({
    ...p,
    enabled: byPackId.get(p.packId)?.enabled !== false,
    questionCount: (p.questions || []).length,
    durationMinutes: p.durationMinutes ?? Math.ceil((p.questions || []).length * 1.5),
    fileName: `${p.packId}.json`,
  }));
}

export async function savePack(pack) {
  const database = await openDB();
  const toSave = {
    ...pack,
    packId: pack.packId || `${pack.exam}-grade${pack.grade}-${pack.mode}-${Date.now()}`,
    importedAt: Math.floor(Date.now() / 1000),
  };
  return new Promise((resolve, reject) => {
    const tx = database.transaction(PACKS_STORE, 'readwrite');
    tx.objectStore(PACKS_STORE).put(toSave);
    tx.oncomplete = () => resolve(toSave);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePack(packId) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(PACKS_STORE, 'readwrite');
    tx.objectStore(PACKS_STORE).delete(packId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function setPackEnabled(packId, enabled) {
  const entries = await loadIndex();
  const idx = entries.findIndex((e) => e.packId === packId);
  if (idx >= 0) {
    entries[idx].enabled = enabled;
  } else {
    entries.push({ packId, enabled });
  }
  await saveIndex(entries);
}

export async function getPack(packId) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(PACKS_STORE, 'readonly');
    const req = tx.objectStore(PACKS_STORE).get(packId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
