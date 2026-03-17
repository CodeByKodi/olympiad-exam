import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { ADMIN_KEY } from '../config/admin';
import styles from '../styles/AdminUnlockPage.module.css';

export function AdminUnlockPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const { isAdmin, setAdmin } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/question-library', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter the Admin Key.');
      return;
    }
    if (trimmed === ADMIN_KEY) {
      setAdmin();
      navigate('/question-library', { replace: true });
    } else {
      setError('Invalid Admin Key. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>
          Enter the Admin Key to unlock Library Manager and pack management.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="admin-key" className={styles.label}>
            Admin Key
          </label>
          <input
            id="admin-key"
            type="password"
            className={styles.input}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter Admin Key"
            autoComplete="off"
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn}>
            Unlock
          </button>
        </form>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
