import { Component } from 'react';
import styles from '../styles/ErrorBoundary.module.css';

/**
 * Catches React render errors and shows a fallback UI with retry.
 * Prevents the whole app from crashing on component errors.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className={styles.screen}>
          <div className={styles.content}>
            <span className={styles.icon}>⚠️</span>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              The app encountered an error. You can try again or refresh the page.
            </p>
            <button type="button" className={styles.retryBtn} onClick={this.handleRetry}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
