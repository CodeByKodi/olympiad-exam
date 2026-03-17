/**
 * Question Library - Electron main process handlers.
 * File operations for question-bank folder.
 */

const fs = require('fs');
const path = require('path');

const INDEX_FILE = 'library-index.json';

function getQuestionBankPath(app) {
  return path.join(app.getPath('userData'), 'question-bank');
}

function getPackPath(app, exam, grade, mode, fileName) {
  const base = getQuestionBankPath(app);
  return path.join(base, exam, `grade${grade}`, mode, fileName);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readIndex(app) {
  const indexPath = path.join(getQuestionBankPath(app), INDEX_FILE);
  if (!fs.existsSync(indexPath)) {
    return { packs: [] };
  }
  try {
    const raw = fs.readFileSync(indexPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { packs: [] };
  }
}

function writeIndex(app, index) {
  const base = getQuestionBankPath(app);
  ensureDir(base);
  const indexPath = path.join(base, INDEX_FILE);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
}

function scanPacksFromDisk(app) {
  const base = getQuestionBankPath(app);
  const packs = [];

  if (!fs.existsSync(base)) return packs;

  const exams = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
  const modes = ['practice', 'mock'];

  for (const exam of exams) {
    const examPath = path.join(base, exam);
    if (!fs.existsSync(examPath)) continue;

    const grade3Path = path.join(examPath, 'grade3');
    if (!fs.existsSync(grade3Path)) continue;

    for (const mode of modes) {
      const modePath = path.join(grade3Path, mode);
      if (!fs.existsSync(modePath)) continue;

      const files = fs.readdirSync(modePath).filter((f) => f.endsWith('.json') && f !== INDEX_FILE);
      for (const file of files) {
        const filePath = path.join(modePath, file);
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const pack = JSON.parse(raw);
          const stat = fs.statSync(filePath);
          packs.push({
            packId: pack.packId || path.basename(file, '.json'),
            exam: pack.exam || exam,
            grade: pack.grade ?? 3,
            mode: pack.mode || mode,
            title: pack.title || pack.packId,
            questionCount: (pack.questions || []).length,
            durationMinutes: pack.durationMinutes ?? 15,
            fileName: file,
            importedAt: Math.floor((stat.mtime || stat.birthtime).getTime() / 1000),
          });
        } catch (e) {
          console.warn('Skipping invalid pack:', file, e.message);
        }
      }
    }
  }

  return packs;
}

function registerQuestionLibraryHandlers(ipcMain, app, dialog) {
  ipcMain.handle('questionLibrary:getPath', () => {
    return getQuestionBankPath(app);
  });

  ipcMain.handle('questionLibrary:loadLibrary', () => {
    const index = readIndex(app);
    const diskPacks = scanPacksFromDisk(app);

    const byKey = new Map();
    for (const p of diskPacks) {
      byKey.set(`${p.exam}-grade3-${p.mode}-${p.fileName}`, p);
    }

    for (const entry of index.packs || []) {
      const key = `${entry.exam}-grade3-${entry.mode}-${entry.fileName}`;
      const disk = byKey.get(key);
      if (disk) {
        disk.enabled = entry.enabled !== false;
      }
    }

    return {
      packs: Array.from(byKey.values()).map((p) => ({
        ...p,
        enabled: (index.packs || []).find((e) => e.packId === p.packId && e.fileName === p.fileName)?.enabled !== false,
      })),
    };
  });

  ipcMain.handle('questionLibrary:reloadLibrary', () => {
    const diskPacks = scanPacksFromDisk(app);
    const index = readIndex(app);
    const existingByKey = new Map();
    for (const e of index.packs || []) {
      existingByKey.set(`${e.exam}-grade3-${e.mode}-${e.fileName}`, e.enabled);
    }

    const newPacks = diskPacks.map((p) => ({
      packId: p.packId,
      exam: p.exam,
      grade: p.grade,
      mode: p.mode,
      fileName: p.fileName,
      enabled: existingByKey.get(`${p.exam}-grade3-${p.mode}-${p.fileName}`) !== false,
    }));

    writeIndex(app, { packs: newPacks });

    return {
      packs: diskPacks.map((p) => ({
        ...p,
        enabled: newPacks.find((e) => e.fileName === p.fileName)?.enabled !== false,
      })),
    };
  });

  ipcMain.handle('questionLibrary:importPack', async (_, { content, skipDuplicates }) => {
    let pack;
    try {
      pack = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      return { ok: false, error: 'Invalid JSON: ' + e.message };
    }

    const exam = String(pack.exam || 'nso').toLowerCase();
    const grade = Number(pack.grade) || 3;
    const mode = String(pack.mode || 'practice').toLowerCase();
    const packId = pack.packId || `${exam}-grade${grade}-${mode}-${Date.now()}`;
    const fileName = `${packId}.json`;

    const base = getQuestionBankPath(app);
    const dir = path.join(base, exam, `grade${grade}`, mode);
    ensureDir(dir);

    const filePath = path.join(dir, fileName);
    const toSave = {
      ...pack,
      packId,
      exam,
      grade,
      mode,
      questions: pack.questions || [],
      durationMinutes: pack.durationMinutes ?? Math.ceil((pack.questions?.length || 0) * 1.5),
    };

    fs.writeFileSync(filePath, JSON.stringify(toSave, null, 2), 'utf8');

    const index = readIndex(app);
    const existing = (index.packs || []).filter((e) => e.fileName !== fileName);
    existing.push({
      packId,
      exam,
      grade,
      mode,
      fileName,
      enabled: true,
    });
    writeIndex(app, { packs: existing });

    return {
      ok: true,
      pack: {
        packId,
        exam,
        grade,
        mode,
        title: pack.title,
        questionCount: (pack.questions || []).length,
        durationMinutes: toSave.durationMinutes,
        fileName,
        importedAt: Math.floor(Date.now() / 1000),
      },
    };
  });

  ipcMain.handle('questionLibrary:deletePack', (_, { exam, grade, mode, fileName }) => {
    const filePath = getPackPath(app, exam, grade, mode, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const index = readIndex(app);
    index.packs = (index.packs || []).filter((e) => e.fileName !== fileName);
    writeIndex(app, index);
    return { ok: true };
  });

  ipcMain.handle('questionLibrary:togglePackEnabled', (_, { packId, fileName, enabled, exam, grade, mode }) => {
    const index = readIndex(app);
    let found = false;
    for (const p of index.packs || []) {
      if (p.packId === packId && p.fileName === fileName) {
        p.enabled = enabled;
        found = true;
        break;
      }
    }
    if (!found) {
      index.packs = index.packs || [];
      index.packs.push({ packId, fileName, enabled, exam: exam || 'nso', grade: grade || 3, mode: mode || 'practice' });
    }
    writeIndex(app, index);
    return { ok: true };
  });

  ipcMain.handle('questionLibrary:getPackContent', (_, { exam, grade, mode, fileName }) => {
    const filePath = getPackPath(app, exam, grade, mode, fileName);
    if (!fs.existsSync(filePath)) {
      return { ok: false, error: 'Pack not found' };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return { ok: true, content: raw };
  });

  ipcMain.handle('questionLibrary:loadPackData', (_, { exam, grade, mode, fileName }) => {
    const filePath = getPackPath(app, exam, grade, mode, fileName);
    if (!fs.existsSync(filePath)) {
      return { ok: false, error: 'Pack not found' };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const pack = JSON.parse(raw);
    return { ok: true, pack };
  });

  ipcMain.handle('questionLibrary:showOpenDialog', async (_, options) => {
    return dialog.showOpenDialog(options);
  });

  ipcMain.handle('questionLibrary:readFile', (_, filePath) => {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return { ok: true, content: raw };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
}

module.exports = { registerQuestionLibraryHandlers, getQuestionBankPath, getPackPath, readIndex };
