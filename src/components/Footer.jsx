import styles from '../styles/Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Olympiad Mock Exam Platform — Practice &amp; Learn</p>
      <p className={styles.sub}>All data stored locally. No account required.</p>
      <p className={styles.copyright}>© CodebyKodi</p>
    </footer>
  );
}
