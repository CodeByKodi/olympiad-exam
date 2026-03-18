import { createContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/authService';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

const RoleContext = createContext(null);

function SessionTimeoutHandler() {
  useSessionTimeout();
  return null;
}

export function RoleProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const login = useCallback((username, password) => {
    const result = authService.login(username, password);
    if (result.ok) {
      setUser(result.user);
      return result;
    }
    return result;
  }, []);

  const loginWithUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshRole = useCallback(() => {
    setUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'olympiad_user') {
        setUser(authService.getCurrentUser());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const role = user?.role || null;
  const value = {
    user,
    role,
    isAdmin: role === 'admin',
    isTeacher: role === 'teacher',
    hasLibraryAccess: authService.hasLibraryAccess(),
    login,
    loginWithUser,
    logout,
    refreshRole,
    isLoggedIn: !!user,
  };

  return (
    <RoleContext.Provider value={value}>
      <SessionTimeoutHandler />
      {children}
    </RoleContext.Provider>
  );
}

export { RoleContext };
