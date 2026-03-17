import { useContext } from 'react';
import { RoleContext } from '../context/RoleContext';

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    return {
      user: null,
      role: null,
      isAdmin: false,
      isTeacher: false,
      hasLibraryAccess: false,
      isLoggedIn: false,
      login: () => ({ ok: false }),
      logout: () => {},
      refreshRole: () => {},
    };
  }
  return ctx;
}
