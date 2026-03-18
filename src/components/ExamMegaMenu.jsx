import { Link } from 'react-router-dom';
import { EXAMS } from '../constants/exams';
import styles from '../styles/ExamMegaMenu.module.css';

const EXAM_LINKS = [
  { label: 'About', format: (prefix) => `About ${prefix}` },
  { label: 'Content', format: (prefix) => `${prefix} Content` },
  { label: 'Exam Pattern', format: (prefix) => `${prefix} Exam Pattern` },
  { label: 'Syllabus', format: (prefix) => `${prefix} Syllabus` },
  { label: 'Sample Papers', format: (prefix) => `${prefix} Sample Papers` },
  { label: 'Previous Year Papers', format: (prefix) => `${prefix} Previous Year Papers` },
  { label: 'Mock Tests', format: (prefix) => `${prefix} Mock Tests` },
];

export function ExamMegaMenu() {
  const examIds = Object.keys(EXAMS);

  return (
    <div className={styles.megaMenu}>
      {examIds.map((id) => {
        const exam = EXAMS[id];
        const prefix = exam.name;
        return (
          <div key={exam.id} className={styles.column}>
            <Link to={`/exam/${exam.id}`} className={styles.columnHeader}>
              {prefix} ▸
            </Link>
            <ul className={styles.linkList}>
              {EXAM_LINKS.map(({ label, format }) => (
                <li key={label}>
                  <Link to={`/exam/${exam.id}`} className={styles.link}>
                    {format(prefix)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
