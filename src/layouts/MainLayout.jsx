import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useDarkMode } from '../hooks/useDarkMode';
import styles from '../styles/MainLayout.module.css';

export function MainLayout() {
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.dark : ''}`}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Header onDarkModeToggle={() => setDarkMode((d) => !d)} darkMode={darkMode} />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
