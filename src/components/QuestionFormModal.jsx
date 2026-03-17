import { useState, useEffect } from 'react';
import styles from '../styles/QuestionFormModal.module.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export function QuestionFormModal({ open, question, onSave, onCancel }) {
  const [form, setForm] = useState({
    questionText: '',
    image: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    topic: '',
    difficulty: 'easy',
  });

  useEffect(() => {
    if (question) {
      setForm({
        questionText: question.questionText || '',
        image: question.image || '',
        options: Array.from({ length: 4 }, (_, i) => question.options?.[i] ?? ''),
        correctAnswer: question.correctAnswer ?? 0,
        explanation: question.explanation || '',
        topic: question.topic || '',
        difficulty: question.difficulty || 'easy',
      });
    } else {
      setForm({
        questionText: '',
        image: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        topic: '',
        difficulty: 'easy',
      });
    }
  }, [question, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const opts = form.options.map((o) => (o ?? '').trim()).slice(0, 4);
    const filled = opts.filter(Boolean);
    if (filled.length < 2) {
      alert('At least 2 options are required');
      return;
    }
    if (filled.length !== 4) {
      alert('Grade 3 tests require exactly 4 options. Please fill all A, B, C, and D.');
      return;
    }
    const correctIdx = Math.min(form.correctAnswer, opts.length - 1);
    onSave({
      questionText: form.questionText.trim(),
      image: form.image.trim(),
      options: opts,
      correctAnswer: correctIdx,
      explanation: form.explanation.trim(),
      topic: form.topic.trim(),
      difficulty: form.difficulty,
    });
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{question ? 'Edit Question' : 'New Question'}</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Question text *
            <textarea
              value={form.questionText}
              onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
              required
              rows={3}
            />
          </label>
          <label className={styles.label}>
            Image URL (optional)
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="images/nso/grade3/q1.png"
            />
          </label>
          {['A', 'B', 'C', 'D'].map((letter, i) => (
            <label key={i} className={styles.label}>
              Option {letter} *
              <input
                type="text"
                value={form.options[i] ?? ''}
                onChange={(e) => {
                  const opts = [...form.options];
                  opts[i] = e.target.value;
                  setForm((f) => ({ ...f, options: opts }));
                }}
                required={i < 2}
              />
            </label>
          ))}
          <label className={styles.label}>
            Correct answer
            <select
              value={form.correctAnswer}
              onChange={(e) => setForm((f) => ({ ...f, correctAnswer: parseInt(e.target.value, 10) }))}
            >
              {form.options.map((opt, i) => (
                <option key={i} value={i} disabled={!opt.trim()}>
                  {String.fromCharCode(65 + i)} {opt || '(empty)'}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            Explanation (optional)
            <textarea
              value={form.explanation}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              rows={2}
            />
          </label>
          <label className={styles.label}>
            Topic (optional)
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            />
          </label>
          <label className={styles.label}>
            Difficulty
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <div className={styles.actions}>
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
