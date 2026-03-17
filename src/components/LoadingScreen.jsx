import styles from '../styles/LoadingScreen.module.css';

export function LoadingScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <span className={styles.icon}>🏆</span>
        <h1 className={styles.title}>Olympiad Mock Exam</h1>
        <p className={styles.subtitle}>Practice Platform</p>
        <div className={styles.spinner} />
      </div>
    </div>
  );
}
