/**
 * Utilities for calculating and formatting score summaries.
 */

/**
 * Calculate score summary from answers and questions.
 * @param {Array} questions - Array of question objects with correctAnswer
 * @param {Object} userAnswers - Map of questionId -> selectedOptionIndex (0-based)
 * @returns {Object} Score summary
 */
export function calculateScoreSummary(questions, userAnswers) {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  questions.forEach((q) => {
    const userAnswer = userAnswers[q.id];
    if (userAnswer === undefined || userAnswer === null || userAnswer < 0) {
      unanswered++;
    } else {
      const correctIdx = normalizeCorrectAnswer(q.correctAnswer, q.options?.length ?? 4);
      if (userAnswer === correctIdx) {
        correct++;
      } else {
        wrong++;
      }
    }
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    total,
    correct,
    wrong,
    unanswered,
    percentage,
  };
}

/**
 * Normalize correctAnswer from JSON (may be 0-based or 1-based).
 * 0-based takes precedence when valid (e.g. 2 with 4 options = index 2).
 * @param {number} correctAnswer - From question JSON
 * @param {number} optionsLength - Number of options
 * @returns {number} 0-based index
 */
export function normalizeCorrectAnswer(correctAnswer, optionsLength = 4) {
  if (correctAnswer == null) return -1;
  const idx = typeof correctAnswer === 'string' ? parseInt(correctAnswer, 10) : Math.floor(correctAnswer);
  if (isNaN(idx)) return -1;
  if (idx >= 0 && idx < optionsLength) return idx;
  if (idx >= 1 && idx <= optionsLength) return idx - 1;
  return 0;
}

/**
 * Get performance label based on percentage.
 * @param {number} percentage - Score percentage
 * @returns {{ label: string, variant: string }}
 */
export function getPerformanceLabel(percentage) {
  if (percentage >= 90) return { label: 'Outstanding!', variant: 'outstanding' };
  if (percentage >= 75) return { label: 'Excellent!', variant: 'excellent' };
  if (percentage >= 60) return { label: 'Good Job!', variant: 'good' };
  if (percentage >= 40) return { label: 'Keep Practicing', variant: 'fair' };
  return { label: 'Needs Practice', variant: 'poor' };
}
