import { useContext } from 'react';
import { RoleContext } from '../context/RoleContext';

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    return {
      role: 'user',
      isAdmin: false,
      setAdmin: () => {},
      clearAdmin: () => {},
      refreshRole: () => {},
    };
  }
  return ctx;
}
