/**
 * Question Library Service - Static hosting (GitHub Pages, web).
 * Loads from question bank (primary) plus imported packs from IndexedDB.
 * Browser storage only (IndexedDB). For GitHub Pages.
 */

import * as libraryStorage from './libraryStorageService.js';
import * as questionBankService from './questionBankService.js';
import { resolveStaticPath } from '../config.js';
import { buildPracticePool, buildMockIndex } from '../utils/questionLibraryUtils.js';
import { EXAMS, GRADES } from '../constants/exams.js';

/**
 * Load packs from question bank (scalable architecture).
 * Uses index.json when available to skip probing; otherwise falls back to hasQuestionBank.
 * Runs all loads in parallel for faster initial load.
 * @returns {Promise<Array>} Packs in library format
 */
async function loadQuestionBankPacks() {
  let combos = await getQuestionBankCombos();
  if (combos.length === 0) return [];

  const results = await Promise.all(
    combos.map(async ({ examId, gradeId }) => {
      try {
        const [bank, packDefs] = await Promise.all([
          questionBankService.loadQuestionBank(examId, gradeId),
          questionBankService.loadPackDefinitions(examId, gradeId),
        ]);

        if (!bank || bank.size === 0 || !packDefs?.length) return null;

        return packDefs.map((def) => {
        const packId = `${examId}-grade${gradeId}-${def.packId?.replace(/^[^-]+-grade\d+-/, '') || def.packId}`;
        const mode = (def.mode || 'mock').toLowerCase();
        const isMock = mode === 'mock';
        const questionCount = isMock ? (def.questionIds?.length || 0) : (def.questionCount || 25);
        return {
          packId,
          exam: examId,
          grade: gradeId,
          mode: isMock ? 'mock' : 'practice',
          title: def.title || packId,
          topic: def.topic,
          questionCount,
          durationMinutes: def.durationMinutes ?? Math.ceil(questionCount * 1.2),
          isStarter: true,
          enabled: true,
          isQuestionBank: true,
          _bankDef: def,
          _bank: bank,
        };
      });
      } catch (_) {
        return null;
      }
    })
  );

  const flat = results.flat ? results.flat() : results.reduce((a, r) => a.concat(Array.isArray(r) ? r : []), []);
  return flat.filter(Boolean);
}

/**
 * Get exam/grade combos that have question banks.
 * Uses index.json for fast path; falls back to probing syllabus.json.
 */
async function getQuestionBankCombos() {
  try {
    const res = await fetch(resolveStaticPath('question-bank/index.json'));
    if (res.ok) {
      const data = await res.json();
      const banks = data?.banks;
      if (Array.isArray(banks) && banks.length > 0) {
        return banks
          .filter((b) => b && b.exam && b.grade)
          .map((b) => ({ examId: String(b.exam), gradeId: String(b.grade) }));
      }
    }
  } catch (_) {
    /* fall through to probe */
  }

  const examIds = Object.keys(EXAMS).map((k) => EXAMS[k].id);
  const enabledGradeIds = Object.values(GRADES).filter((g) => g.enabled).map((g) => g.id);
  const combos = examIds.flatMap((examId) => enabledGradeIds.map((gradeId) => ({ examId, gradeId })));
  const hasBank = await Promise.all(
    combos.map(async (c) => (await questionBankService.hasQuestionBank(c.examId, c.gradeId)) ? c : null)
  );
  return hasBank.filter(Boolean);
}

/**
 * Load imported packs from IndexedDB.
 * @returns {Promise<Array>} Imported packs
 */
export async function loadImportedPacks() {
  try {
    return await libraryStorage.loadAllPacks();
  } catch (e) {
    console.warn('Failed to load imported packs:', e);
    return [];
  }
}

/**
 * Merge built-in packs (question bank) and imported packs.
 * Imported packs take precedence for same exam/grade/mode (different packIds).
 * @param {Array} builtInPacks
 * @param {Array} importedPacks
 * @returns {Array} Merged packs
 */
export function mergeLibraries(builtInPacks, importedPacks) {
  const byKey = new Map();
  for (const p of builtInPacks || []) {
    byKey.set(p.packId, { ...p });
  }
  for (const p of importedPacks || []) {
    byKey.set(p.packId, { ...p, isStarter: false });
  }
  return Array.from(byKey.values());
}

/**
 * Reload library: fetch question bank (built-in) + load imported, then merge.
 * Resilient: returns partial packs if one source fails (e.g. network or IndexedDB).
 * @returns {Promise<{ packs: Array, warning?: string }>}
 */
export async function reloadLibrary() {
  let builtInPacks = [];
  let importedPacks = [];
  let warning = null;

  try {
    builtInPacks = await loadQuestionBankPacks();
  } catch (e) {
    console.warn('Failed to load question bank:', e);
    warning = 'Could not load built-in tests. You can still use imported packs.';
  }

  try {
    importedPacks = await loadImportedPacks();
  } catch (e) {
    console.warn('Failed to load imported packs:', e);
    warning = warning
      ? 'Some packs could not be loaded. Try reloading.'
      : 'Could not load imported packs. Built-in tests are still available.';
  }

  const packs = mergeLibraries(builtInPacks, importedPacks);
  return { packs, warning };
}

/**
 * Alias for reloadLibrary - used by context.
 */
export async function loadLibrary() {
  return reloadLibrary();
}

/**
 * Save imported pack to IndexedDB.
 * @param {string} content - JSON string
 * @param {boolean} skipDuplicates
 * @returns {Promise<{ ok: boolean, pack?: Object, error?: string }>}
 */
export async function saveImportedPack(content, _skipDuplicates = false) {
  try {
    const pack = typeof content === 'string' ? JSON.parse(content) : content;
    const saved = await libraryStorage.savePack(pack);
    return { ok: true, pack: saved };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Import pack - validate and save to IndexedDB.
 */
export async function importPack(content, skipDuplicates = false) {
  return saveImportedPack(content, skipDuplicates);
}

/**
 * Delete imported pack from IndexedDB.
 */
export async function deletePack(pack) {
  if (pack.isStarter || pack.isQuestionBank) {
    return { ok: false, error: 'Cannot delete built-in packs' };
  }
  try {
    await libraryStorage.deletePack(pack.packId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Toggle pack enabled/disabled (imported packs only; built-in always enabled).
 */
export async function togglePackEnabled(pack, enabled) {
  if (pack.isStarter || pack.isQuestionBank) return { ok: true };
  try {
    await libraryStorage.setPackEnabled(pack.packId, enabled);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Get pack content for export.
 */
export async function getPackContent(pack) {
  if (pack.isQuestionBank && pack._bankDef && pack._bank) {
    const def = pack._bankDef;
    const bank = pack._bank;
    let questions = [];
    if (def.mode === 'mock' && def.questionIds) {
      questions = questionBankService.resolveMockPack(def, bank);
    } else if (def.mode === 'practice' && def.selectionRules) {
      questions = questionBankService.resolvePracticePack(def, bank);
    }
    const content = {
      packId: pack.packId,
      exam: pack.exam,
      grade: pack.grade,
      mode: pack.mode,
      title: def.title,
      topic: def.topic,
      questions,
      durationMinutes: def.durationMinutes ?? Math.ceil(questions.length * 1.2),
    };
    return { ok: true, content: JSON.stringify(content, null, 2) };
  }
  try {
    const p = await libraryStorage.getPack(pack.packId);
    return p ? { ok: true, content: JSON.stringify(p, null, 2) } : { ok: false, error: 'Pack not found' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Load pack data (questions etc.) for taking a test.
 */
export async function loadPackData(pack) {
  if (pack.isQuestionBank && pack._bankDef && pack._bank) {
    const def = pack._bankDef;
    const bank = pack._bank;
    let questions = [];
    if (def.mode === 'mock' && def.questionIds) {
      questions = questionBankService.resolveMockPack(def, bank);
    } else if (def.mode === 'practice' && def.selectionRules) {
      questions = questionBankService.resolvePracticePack(def, bank);
    }
    return {
      ok: true,
      pack: {
        packId: pack.packId,
        exam: pack.exam,
        grade: pack.grade,
        mode: pack.mode,
        title: def.title,
        topic: def.topic,
        questions,
        durationMinutes: def.durationMinutes ?? Math.ceil(questions.length * 1.2),
      },
    };
  }
  try {
    const p = await libraryStorage.getPack(pack.packId);
    return p ? { ok: true, pack: p } : { ok: false, error: 'Pack not found' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Build practice pool from enabled practice packs.
 */
export function buildPracticePoolFromPacks(packs) {
  return buildPracticePool(packs);
}

/**
 * Build mock index from enabled mock packs.
 */
export function buildMockIndexFromPacks(packs) {
  return buildMockIndex(packs);
}

/**
 * Read file from File input (web file picker).
 */
export function readFileFromInput(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ ok: true, content: reader.result });
    reader.onerror = () => resolve({ ok: false, error: reader.error?.message || 'Read failed' });
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Show open dialog - web always uses file input (no native dialog).
 */
export async function showOpenDialog() {
  return { canceled: true, filePaths: [] };
}

export function isAvailable() {
  return true;
}
