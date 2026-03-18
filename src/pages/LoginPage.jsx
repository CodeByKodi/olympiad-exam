import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import styles from '../styles/LoginPage.module.css';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = login(username, password);

    if (result.ok) {
      const target = from === '/' || from === '/login' ? '/home' : from;
      navigate(target, { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>
          Sign in with your username and password.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            id="username"
            type="text"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            autoFocus
          />
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>
        </form>
        <Link to="/home" className={styles.backBtn}>
          Continue without logging in
        </Link>
      </div>
    </div>
  );
}
