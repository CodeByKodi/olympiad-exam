import { useState, useEffect } from 'react';
import { EXAMS, GRADES, TESTS_PER_EXAM } from '../constants/exams';
import {
  loadQuestionSet,
  saveQuestionSet,
  resetQuestionSet,
  exportQuestionSet,
  parseImportJson,
  validateQuestion,
  generateQuestionId,
  hasEditedQuestions,
  loadAllQuestionSetsForExam,
  checkDuplicateInExam,
} from '../utils/questionManagerUtils';
import { QuestionFormModal } from '../components/QuestionFormModal';
import { QuestionListSkeleton } from '../components/QuestionListSkeleton';
import styles from '../styles/QuestionManagerPage.module.css';

export function QuestionManagerPage() {
  const [examId, setExamId] = useState('nso');
  const [gradeId, setGradeId] = useState('3');
  const [testId, setTestId] = useState('1');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [importError, setImportError] = useState(null);
  const [duplicateError, setDuplicateError] = useState(null);
  const [testCounts, setTestCounts] = useState({});

  useEffect(() => {
    const load = async () => {
      const counts = {};
      await Promise.all(
        TESTS_PER_EXAM.map(async (t) => {
          try {
            const qs = await loadQuestionSet(examId, gradeId, t.id);
            counts[t.id] = qs.length;
          } catch {
            counts[t.id] = 0;
          }
        })
      );
      setTestCounts(counts);
    };
    load();
  }, [examId, gradeId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadQuestionSet(examId, gradeId, testId)
      .then((qs) => {
        if (!cancelled) setQuestions(qs);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setQuestions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [examId, gradeId, testId]);

  useEffect(() => {
    if (questions.length > 0 && testId) {
      setTestCounts((c) => ({ ...c, [testId]: questions.length }));
    }
  }, [questions.length, testId]);

  const handleSaveQuestion = async (formData) => {
    setDuplicateError(null);
    const err = validateQuestion(formData, gradeId);
    if (err) {
      alert(err);
      return;
    }
    const allSets = await loadAllQuestionSetsForExam(examId, gradeId);
    const dup = checkDuplicateInExam(
      allSets,
      formData.questionText,
      testId,
      editingQuestion !== null ? editingQuestion : null
    );
    if (dup.duplicate) {
      setDuplicateError(`This question already exists in Test ${dup.inTest}. Each question must be unique within the exam.`);
      return;
    }
    const prefix = `${examId}-grade${gradeId}-test${testId}`;
    let updated;
    if (editingQuestion !== null) {
      updated = questions.map((q, i) =>
        i === editingQuestion ? { ...formData, id: questions[editingQuestion].id } : q
      );
    } else {
      const id = generateQuestionId(questions, prefix);
      updated = [...questions, { ...formData, id }];
    }
    setQuestions(updated);
    saveQuestionSet(examId, gradeId, testId, updated);
    setFormOpen(false);
    setEditingQuestion(null);
  };

  const handleEdit = (index) => {
    setEditingQuestion(index);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteConfirm === null) return;
    const updated = questions.filter((_, i) => i !== deleteConfirm);
    setQuestions(updated);
    saveQuestionSet(examId, gradeId, testId, updated);
    setDeleteConfirm(null);
  };

  const handleExport = () => {
    const filename = `${examId}-grade${gradeId}-test${testId}.json`;
    const title = `${exam?.name || examId} Grade ${gradeId} Test ${testId}`;
    exportQuestionSet(questions, filename, { title, durationMinutes: 15, questionCount: questions.length });
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setDuplicateError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const result = parseImportJson(reader.result, gradeId);
      if (!result.valid) {
        setImportError(result.error);
        return;
      }
      const imported = result.questions;
      if (imported.length < 1 || imported.length > 10) {
        setImportError(`Import must have 1–10 questions. Got ${imported.length}.`);
        return;
      }
      const allSets = await loadAllQuestionSetsForExam(examId, gradeId);
      const existingTexts = new Set();
      for (const [tid, qs] of allSets) {
        if (tid === testId) continue;
        for (const q of qs) {
          const t = (q.questionText || '').trim().toLowerCase();
          if (t) existingTexts.add(t);
        }
      }
      const dupCount = imported.filter(
        (q) => existingTexts.has((q.questionText || '').trim().toLowerCase())
      ).length;
      if (dupCount > 0) {
        setImportError(`Cannot import: ${dupCount} question(s) already exist in this exam.`);
        return;
      }
      const prefix = `${examId}-grade${gradeId}-test${testId}`;
      const withIds = imported.map((q, i) => ({
        ...q,
        id: q.id || `${prefix}-q${i + 1}`,
      }));
      setQuestions(withIds);
      saveQuestionSet(examId, gradeId, testId, withIds);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (!confirm('Reset to default? This will remove your edits and reload from the original JSON file.')) return;
    resetQuestionSet(examId, gradeId, testId);
    loadQuestionSet(examId, gradeId, testId)
      .then(setQuestions)
      .catch((e) => setError(e.message));
  };

  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;
  const isEdited = hasEditedQuestions(examId, gradeId, testId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Question Manager</h1>
        <p className={styles.subtitle}>Add, edit, and manage questions for each test</p>
      </div>

      <div className={styles.filters}>
        <label className={styles.label}>
          Exam
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className={styles.select}>
            {Object.values(EXAMS).map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name} - {ex.fullName}</option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Grade
          <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} className={styles.select}>
            {Object.values(GRADES).filter((g) => g.enabled).map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Test
          <select value={testId} onChange={(e) => setTestId(e.target.value)} className={styles.select}>
            {TESTS_PER_EXAM.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({testCounts[t.id] ?? '—'} questions)
              </option>
            ))}
          </select>
        </label>
      </div>

      {duplicateError && (
        <div className={styles.errorBanner}>{duplicateError}</div>
      )}

      {isEdited && (
        <div className={styles.editedBadge}>Using edited questions</div>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={() => { setEditingQuestion(null); setFormOpen(true); }}>
          New Question
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={handleExport}>
          Export JSON
        </button>
        <label className={styles.importBtn}>
          Import JSON
          <input type="file" accept=".json" onChange={handleImport} className={styles.fileInput} />
        </label>
        <button type="button" className={styles.secondaryBtn} onClick={handleReset}>
          Reset to Default
        </button>
      </div>

      {importError && (
        <div className={styles.errorBanner}>{importError}</div>
      )}

      {loading ? (
        <QuestionListSkeleton />
      ) : error ? (
        <div className={styles.errorBanner}>{error}</div>
      ) : (
        <div className={styles.questionList}>
          {questions.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>✏️</span>
              <h3 className={styles.emptyTitle}>No questions in this test</h3>
              <p className={styles.emptyText}>
                Add your first question to get started. You can also import from a JSON file.
              </p>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => { setEditingQuestion(null); setFormOpen(true); }}
              >
                New Question
              </button>
            </div>
          ) : (
            questions.map((q, index) => (
              <div key={q.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <span className={styles.qNum}>Q{index + 1}</span>
                  <span className={styles.topic}>{q.topic || '—'}</span>
                  <div className={styles.cardActions}>
                    <button type="button" className={styles.editBtn} onClick={() => handleEdit(index)}>Edit</button>
                    <button type="button" className={styles.deleteBtn} onClick={() => setDeleteConfirm(index)}>Delete</button>
                  </div>
                </div>
                <p className={styles.questionText}>{q.questionText}</p>
                <div className={styles.options}>
                  {(q.options || []).map((opt, i) => (
                    <span key={i} className={i === q.correctAnswer ? styles.correctOpt : ''}>
                      {String.fromCharCode(65 + i)}: {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <QuestionFormModal
        open={formOpen}
        question={editingQuestion !== null ? questions[editingQuestion] : null}
        gradeId={gradeId}
        onSave={handleSaveQuestion}
        onCancel={() => { setFormOpen(false); setEditingQuestion(null); }}
      />

      {deleteConfirm !== null && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Question?</h3>
            <p>This cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button type="button" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button type="button" className={styles.dangerBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
