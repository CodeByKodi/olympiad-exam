import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import styles from '../styles/AdminToggleButton.module.css';

export function AdminToggleButton() {
  const { clearAdmin } = useRole();
  const navigate = useNavigate();

  const handleExit = () => {
    clearAdmin();
    navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      className={styles.exitBtn}
      onClick={handleExit}
      title="Exit Admin Mode"
    >
      Exit Admin Mode
    </button>
  );
}
