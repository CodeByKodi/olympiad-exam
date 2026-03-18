import { Component } from 'react';
import styles from '../styles/ErrorBoundary.module.css';

/**
 * Catches React render errors and shows a fallback UI with retry.
 * Prevents the whole app from crashing on component errors.
 */
export class ErrorBoundary extends Component {
  state = { error: null, showDetails: false };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null, showDetails: false });
  };

  toggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }));
  };

  render() {
    if (this.state.error) {
      const err = this.state.error;
      const msg = err?.message || String(err);
      const showDetails = this.state.showDetails;
      return (
        <div className={styles.screen}>
          <div className={styles.content}>
            <span className={styles.icon}>⚠️</span>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              The app encountered an error. You can try again or refresh the page.
            </p>
            {msg && (
              <>
                <button type="button" className={styles.detailToggle} onClick={this.toggleDetails}>
                  {showDetails ? 'Hide' : 'Show'} details
                </button>
                {showDetails && <pre className={styles.errorDetail}>{msg}</pre>}
              </>
            )}
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
