import { useState, useEffect } from 'react';
import styles from '../styles/OfflineIndicator.module.css';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    let onlineTimeout;
    const onOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      onlineTimeout = setTimeout(() => setWasOffline(false), 3000);
    };

    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearTimeout(onlineTimeout);
    };
  }, []);

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`${styles.banner} ${isOnline ? styles.reconnected : styles.offline}`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>✓ Back online. Your progress is saved.</>
      ) : (
        <>📵 You're offline. Content may not load. Your progress is saved locally.</>
      )}
    </div>
  );
}
