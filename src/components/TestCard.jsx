import { Link } from 'react-router-dom';
import { TEST_MODES } from '../constants/exams';
import styles from '../styles/TestCard.module.css';

const ORIGIN_LABEL = {
  'built-in-mock': 'Built-in',
  'question-bank': 'Library',
  imported: 'Imported',
};

export function TestCard({
  examId,
  gradeId,
  testId,
  mode,
  questionCount,
  durationMinutes,
  title,
  topic,
  packOrigin,
}) {
  const isPractice = mode === TEST_MODES.PRACTICE;
  const to = `/exam/${examId}/grade/${gradeId}/test/${testId}?mode=${mode}`;
  const qc = questionCount ?? 0;
  const dm = durationMinutes ?? 0;
  const perQ =
    qc > 0 && dm > 0 ? Math.round((dm / qc) * 10) / 10 : null;
  const pacingHint =
    perQ != null
      ? `${qc} questions • ~${dm} min (~${perQ} min per question on average)`
      : `${qc} questions • ~${dm} min`;

  return (
    <Link to={to} className={styles.card} title={pacingHint}>
      <div className={styles.badges}>
        <span className={`${styles.badge} ${isPractice ? styles.practice : styles.mock}`}>
          {isPractice ? 'Practice' : 'Mock Test'}
        </span>
        {packOrigin && ORIGIN_LABEL[packOrigin] && (
          <span
            className={`${styles.originBadge} ${
              packOrigin === 'built-in-mock'
                ? styles.originBuiltIn
                : packOrigin === 'question-bank'
                  ? styles.originLibrary
                  : styles.originImported
            }`}
            title={
              packOrigin === 'built-in-mock'
                ? 'Shipped with the app (TypeScript mock bank)'
                : packOrigin === 'question-bank'
                  ? 'Loaded from the public question-bank JSON'
                  : 'Imported or added from your library'
            }
          >
            {ORIGIN_LABEL[packOrigin]}
          </span>
        )}
        {topic && <span className={styles.topicBadge}>{topic}</span>}
      </div>
      <h3 className={styles.title}>{title || `Test ${testId}`}</h3>
      <div className={styles.meta}>
        <span>{questionCount ?? 0} questions</span>
        <span>•</span>
        <span>~{durationMinutes ?? 0} min</span>
      </div>
    </Link>
  );
}
