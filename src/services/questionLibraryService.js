/**
 * Question Library Service - Static hosting (GitHub Pages, web).
 * Loads from question bank (primary) plus imported packs from IndexedDB.
 * Browser storage only (IndexedDB). For GitHub Pages.
 */

import * as libraryStorage from './libraryStorageService.js';
import * as questionBankService from './questionBankService.js';
import { getBuiltInOlympiadMockPacks } from '../data/builtInMockPackAdapter.js';
import { buildPracticePool, buildMockIndex } from '../utils/questionLibraryUtils.js';

/**
 * Load packs for a single exam/grade from question bank.
 * Used for on-demand loading when user visits an exam/grade page.
 * @param {string} examId
 * @param {string} gradeId
 * @returns {Promise<Array>} Packs in library format
 */
export async function loadBankForExamGrade(examId, gradeId) {
  /** Typed mock exams (IGKO/IMO/NSO/IEO) merged into the library so the UI lists every paper. */
  const builtInMocks = getBuiltInOlympiadMockPacks(examId, gradeId);

  try {
    const [bank, packDefs] = await Promise.all([
      questionBankService.loadQuestionBank(examId, gradeId),
      questionBankService.loadPackDefinitions(examId, gradeId),
    ]);

    const bankPacks =
      bank && bank.size > 0 && packDefs?.length
        ? packDefs.map((def) => {
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
          })
        : [];

    if (bankPacks.length === 0 && import.meta.env?.DEV) {
      console.warn(
        `[QuestionBank] No JSON bank for ${examId} grade ${gradeId}; using ${builtInMocks.length} built-in mock pack(s) only.`,
      );
    }

    return [...bankPacks, ...builtInMocks];
  } catch (e) {
    console.warn(`[QuestionBank] Failed to load ${examId} grade ${gradeId}:`, e?.message || e);
    return builtInMocks;
  }
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
 * Reload library: load imported packs from IndexedDB only.
 * Question bank packs are loaded on-demand when user visits an exam/grade page
 * (via loadBankFor in TestSelectPage) to avoid slow startup and fetch failures.
 * @returns {Promise<{ packs: Array, warning?: string }>}
 */
export async function reloadLibrary() {
  let importedPacks = [];
  let warning = null;

  try {
    importedPacks = await loadImportedPacks();
  } catch (e) {
    console.warn('Failed to load imported packs:', e);
    warning = 'Could not load imported packs.';
  }

  return { packs: importedPacks, warning };
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
  if (pack.isStarter || pack.isQuestionBank || pack.isBuiltInOlympiadMock) {
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
  if (pack.isStarter || pack.isQuestionBank || pack.isBuiltInOlympiadMock) return { ok: true };
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
  if (pack.isBuiltInOlympiadMock && Array.isArray(pack.questions) && pack.questions.length > 0) {
    const content = {
      packId: pack.packId,
      exam: pack.exam,
      grade: pack.grade,
      mode: pack.mode,
      title: pack.title,
      topic: pack.topic,
      questions: pack.questions,
      durationMinutes: pack.durationMinutes ?? Math.ceil(pack.questions.length * 1.2),
    };
    return { ok: true, content: JSON.stringify(content, null, 2) };
  }
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
  if (pack.isBuiltInOlympiadMock && Array.isArray(pack.questions) && pack.questions.length > 0) {
    return {
      ok: true,
      pack: {
        packId: pack.packId,
        exam: pack.exam,
        grade: pack.grade,
        mode: pack.mode,
        title: pack.title,
        topic: pack.topic,
        questions: pack.questions,
        durationMinutes: pack.durationMinutes ?? Math.ceil(pack.questions.length * 1.2),
      },
    };
  }
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
