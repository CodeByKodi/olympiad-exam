import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

/**
 * Protects routes that require login (exams, practice, mock).
 * Redirects to /login if not logged in.
 */
export function AuthRoute({ children }) {
  const { isLoggedIn } = useRole();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
