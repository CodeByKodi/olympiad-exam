import { createContext, useState, useCallback, useEffect } from 'react';
import * as roleService from '../services/roleService';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => roleService.getRole());

  const setAdmin = useCallback(() => {
    roleService.setAdmin();
    setRoleState('admin');
  }, []);

  const clearAdmin = useCallback(() => {
    roleService.clearAdmin();
    setRoleState('user');
  }, []);

  const refreshRole = useCallback(() => {
    setRoleState(roleService.getRole());
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'olympiad_role') {
        setRoleState(roleService.getRole());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = {
    role,
    isAdmin: role === 'admin',
    setAdmin,
    clearAdmin,
    refreshRole,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export { RoleContext };
