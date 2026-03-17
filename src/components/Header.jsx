import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import styles from '../styles/Header.module.css';

export function Header({ onDarkModeToggle, darkMode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>🏆</span>
        <span className={styles.logoText}>Olympiad Practice</span>
      </Link>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/manage-questions" className={styles.navLink}>Questions</Link>
        <Link to="/question-library" className={styles.navLink}>Library</Link>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          aria-label="Settings"
        >
          ⚙️
        </button>
        <button
          type="button"
          className={styles.darkModeBtn}
          onClick={onDarkModeToggle}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </nav>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
