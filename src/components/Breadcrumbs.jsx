import { Link, useParams, useLocation } from 'react-router-dom';
import { EXAMS } from '../constants/exams';
import styles from '../styles/Breadcrumbs.module.css';

export function Breadcrumbs() {
  const params = useParams();
  const location = useLocation();
  const path = location.pathname || '';

  const crumbs = [];
  crumbs.push({ label: 'Home', to: '/home' });

  if (params.examId) {
    const exam = EXAMS[params.examId?.toUpperCase()];
    crumbs.push({ label: exam?.name || params.examId, to: `/exam/${params.examId}` });
  }
  if (params.gradeId) {
    const gradePath = `/exam/${params.examId}/grade/${params.gradeId}`;
    const onTestSelectOnly =
      path === gradePath || path === `${gradePath}/`;
    crumbs.push({
      label: `Grade ${params.gradeId}`,
      to: onTestSelectOnly ? null : gradePath,
    });
  }
  if (params.testId && params.testId !== 'review-wrong') {
    crumbs.push({ label: 'Test', to: null });
  }
  if (path.includes('/result')) {
    crumbs.push({ label: 'Results', to: null });
  }
  if (path.includes('/progress')) {
    crumbs.push({ label: 'Progress', to: null });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      {crumbs.map((crumb, i) => (
        <span key={i} className={styles.item}>
          {i > 0 && <span className={styles.sep} aria-hidden>›</span>}
          {crumb.to ? (
            <Link to={crumb.to} className={styles.link}>{crumb.label}</Link>
          ) : (
            <span className={styles.current}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
