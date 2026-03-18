import { Component } from 'react';
import styles from '../styles/ErrorBoundary.module.css';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <span className={styles.icon} aria-hidden>⚠️</span>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              We're sorry. The app encountered an error. You can try again or go back to the home page.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryBtn} onClick={this.handleRetry}>
                Try Again
              </button>
              <a href="#/" className={styles.secondaryBtn}>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
