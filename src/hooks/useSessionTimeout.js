/**
 * Session timeout - auto logout after inactivity.
 * Resets on user activity (mousemove, keydown, click, scroll).
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRole } from './useRole';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useSessionTimeout() {
  const { isLoggedIn, logout } = useRole();
  const timeoutRef = useRef(null);

  const resetTimeout = useCallback(() => {
    if (!isLoggedIn) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      logout();
      timeoutRef.current = null;
    }, TIMEOUT_MS);
  }, [isLoggedIn, logout]);

  useEffect(() => {
    if (!isLoggedIn) return;
    resetTimeout();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimeout();

    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoggedIn, resetTimeout]);
}
