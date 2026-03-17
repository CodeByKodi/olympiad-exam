import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

export function AdminRoute({ children }) {
  const { isAdmin } = useRole();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
