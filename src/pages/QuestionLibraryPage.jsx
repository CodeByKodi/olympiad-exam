import { useState, useRef } from 'react';
import { useQuestionLibrary } from '../context/QuestionLibraryContext';
import { validatePack, detectDuplicates } from '../utils/questionLibraryUtils';
import * as libraryService from '../services/questionLibraryService';
import { EXAMS } from '../constants/exams';
import { LibrarySkeleton } from '../components/LibrarySkeleton';
import styles from '../styles/QuestionLibraryPage.module.css';

export function QuestionLibraryPage() {
  const { packs, loading, error, reload, isAvailable, service } = useQuestionLibrary();
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [filterExam, setFilterExam] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const fileInputRef = useRef(null);

  const handleReload = async () => {
    setImportResult(null);
    await reload();
  };

  const processFiles = async (files) => {
    const summary = { imported: 0, skipped: 0, failed: 0, errors: [] };
    const existingPacks = packs.filter((p) => p.exam && p.grade && p.mode);

    const processOne = async (content, label) => {
      let pack;
      try {
        pack = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        summary.failed++;
        summary.errors.push(`${label}: Invalid JSON`);
        return;
      }

      const validation = validatePack(pack);
      if (!validation.valid) {
        summary.failed++;
        summary.errors.push(`${pack.title || label}: ${validation.errors?.join('; ')}`);
        return;
      }

      const sameMode = existingPacks.filter(
        (p) =>
          p.exam === pack.exam &&
          String(p.grade) === String(pack.grade) &&
          p.mode === pack.mode
      );
      const existingWithQuestions = [];
      for (const p of sameMode) {
        const res = await service.loadPackData(p);
        if (res.ok && res.pack) existingWithQuestions.push(res.pack);
      }

      const { skippedIndices } = detectDuplicates(pack, existingWithQuestions);
      if (skippedIndices.length > 0) {
        const filtered = pack.questions.filter((_, i) => !skippedIndices.includes(i));
        if (filtered.length === 0) {
          summary.skipped++;
          return;
        }
        pack = { ...pack, questions: filtered };
      }

      const importRes = await service.importPack(JSON.stringify(pack), true);
      if (importRes.ok) {
        summary.imported++;
        existingPacks.push(importRes.pack || pack);
      } else {
        summary.failed++;
        summary.errors.push(importRes.error || 'Import failed');
      }
    };

    if (Array.isArray(files)) {
      for (const file of files) {
        const readRes = await service.readFileFromInput(file);
        if (!readRes.ok) {
          summary.failed++;
          summary.errors.push(`${file.name}: ${readRes.error}`);
          continue;
        }
        await processOne(readRes.content, file.name);
      }
    }

    return summary;
  };

  const handleImport = () => {
    setImportResult(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setImporting(true);
    setImportResult(null);
    setImportProgress(files.length > 1 ? { total: files.length } : null);
    try {
      const summary = await processFiles(files);
      setImportResult(summary);
      await reload();
    } catch (err) {
      setImportResult({ imported: 0, skipped: 0, failed: 1, errors: [err.message] });
    } finally {
      setImporting(false);
      setImportProgress(null);
      e.target.value = '';
    }
  };

  const handleDelete = async (pack) => {
    if (pack.isStarter) return;
    if (!confirm(`Delete "${pack.title}"? This cannot be undone.`)) return;
    setDeleting(pack.packId);
    try {
      await service.deletePack(pack);
      await reload();
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (pack) => {
    const enabled = !pack.enabled;
    await service.togglePackEnabled(pack, enabled);
    await reload();
  };

  const handleExport = async (pack) => {
    setExporting(pack.packId);
    try {
      const res = await service.getPackContent(pack);
      if (!res.ok) {
        alert(res.error || 'Export failed');
        return;
      }
      const blob = new Blob([res.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pack.fileName || `${pack.packId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts * 1000);
    return d.toLocaleDateString();
  };

  const filteredPacks = packs.filter((p) => {
    if (filterExam && p.exam !== filterExam) return false;
    if (filterMode && p.mode !== filterMode) return false;
    return true;
  });

  return (
    <div className={styles.page}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        multiple
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>Question Library</h1>
        <p className={styles.subtitle}>
          Import, manage, and organize question packs. Changes apply immediately.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleImport}
            disabled={importing}
          >
            {importing
              ? importProgress
                ? `Importing ${importProgress.total} files…`
                : 'Importing…'
              : '📥 Import Packs'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleReload}
            disabled={loading}
          >
            🔄 Reload Library
          </button>
        </div>
      </div>

      {importResult && (
        <div className={styles.importSummary}>
          <strong>Import summary:</strong> {importResult.imported} imported, {importResult.skipped} skipped
          (duplicates), {importResult.failed} failed.
          {importResult.errors?.length > 0 && (
            <ul>
              {importResult.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button type="button" className={styles.retryBtn} onClick={handleReload} disabled={loading}>
            {loading ? 'Reloading…' : 'Retry'}
          </button>
        </div>
      )}

      {packs.length > 0 && (
        <div className={styles.filters}>
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All exams</option>
            {Object.entries(EXAMS).map(([k, v]) => (
              <option key={k} value={v.id}>{v.name}</option>
            ))}
          </select>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All modes</option>
            <option value="practice">Practice</option>
            <option value="mock">Mock</option>
          </select>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading && packs.length === 0 ? (
          <LibrarySkeleton />
        ) : packs.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📚</span>
            <h3 className={styles.emptyTitle}>No question packs yet</h3>
            <p className={styles.emptyText}>
              Import JSON question packs to get started. Each pack should include exam, grade, mode, and a questions array.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleImport}
              disabled={importing}
            >
              📥 Import Packs
            </button>
          </div>
        ) : (
          <>
            <div className={styles.tableDesktop}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Exam</th>
                    <th>Grade</th>
                    <th>Mode</th>
                    <th>Questions</th>
                    <th>Imported</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacks.map((pack) => (
                    <tr key={`${pack.exam}-${pack.mode}-${pack.packId}`}>
                      <td className={styles.titleCell}>{pack.title || pack.packId}</td>
                      <td>{EXAMS[pack.exam?.toUpperCase()]?.name || pack.exam}</td>
                      <td>{pack.grade}</td>
                      <td>
                        <span className={pack.mode === 'practice' ? styles.practice : styles.mock}>
                          {pack.mode}
                        </span>
                      </td>
                      <td>{pack.questionCount}</td>
                      <td>{formatDate(pack.importedAt)}</td>
                      <td>
                        {pack.isStarter ? (
                          <span className={styles.starterBadge}>Starter</span>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.toggleBtn} ${pack.enabled ? styles.enabled : ''}`}
                            onClick={() => handleToggle(pack)}
                            title={pack.enabled ? 'Disable' : 'Enable'}
                          >
                            {pack.enabled ? '✓ Enabled' : 'Disabled'}
                          </button>
                        )}
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => handleExport(pack)}
                            disabled={exporting === pack.packId}
                            title="Export"
                          >
                            📤
                          </button>
                          {!pack.isStarter && (
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => handleDelete(pack)}
                              disabled={deleting === pack.packId}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.cardsMobile}>
              {filteredPacks.map((pack) => (
                <div key={pack.packId} className={styles.packCard}>
                  <div className={styles.packCardHeader}>
                    <h3>{pack.title || pack.packId}</h3>
                    <span className={pack.mode === 'practice' ? styles.practice : styles.mock}>
                      {pack.mode}
                    </span>
                  </div>
                  <div className={styles.packCardMeta}>
                    <span>{EXAMS[pack.exam?.toUpperCase()]?.name || pack.exam}</span>
                    <span>Grade {pack.grade}</span>
                    <span>{pack.questionCount} questions</span>
                    <span>{formatDate(pack.importedAt)}</span>
                  </div>
                  <div className={styles.packCardActions}>
                    {pack.isStarter ? (
                      <span className={styles.starterBadge}>Starter</span>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${pack.enabled ? styles.enabled : ''}`}
                        onClick={() => handleToggle(pack)}
                      >
                        {pack.enabled ? '✓ Enabled' : 'Disabled'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleExport(pack)}
                      disabled={exporting === pack.packId}
                      title="Export"
                    >
                      📤
                    </button>
                    {!pack.isStarter && (
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => handleDelete(pack)}
                        disabled={deleting === pack.packId}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
