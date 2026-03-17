import styles from '../styles/AdminBadge.module.css';

export function AdminBadge({ role = 'admin' }) {
  const label = role === 'teacher' ? 'Teacher' : 'Admin';
  return <span className={styles.badge}>{label}</span>;
}
