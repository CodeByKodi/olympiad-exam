import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import { AdminBadge } from './AdminBadge';
import { useRole } from '../hooks/useRole';
import styles from '../styles/Header.module.css';

export function Header({ onDarkModeToggle, darkMode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { hasLibraryAccess, isLoggedIn, user, logout } = useRole();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        window.location.hash = '#/login';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>🏆</span>
        <span className={styles.logoText}>Olympiad Practice</span>
        {hasLibraryAccess && <AdminBadge role={user?.role} />}
      </Link>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        {isLoggedIn && (
          <Link to="/progress" className={styles.navLink}>Progress</Link>
        )}
        {hasLibraryAccess && (
          <>
            <Link to="/manage-questions" className={styles.navLink}>Questions</Link>
            <Link to="/question-library" className={styles.navLink}>Library</Link>
          </>
        )}
        {isLoggedIn ? (
          <>
            <span className={styles.userLabel}>{user?.displayName || user?.username}</span>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={logout}
              title="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.navLink}>Login</Link>
        )}
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
