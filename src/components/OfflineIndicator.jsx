import { useState, useEffect } from 'react';
import styles from '../styles/OfflineIndicator.module.css';

/**
 * Shows a banner when the app is offline.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.icon}>📴</span>
      <span>You&apos;re offline. Cached content is still available.</span>
    </div>
  );
}
