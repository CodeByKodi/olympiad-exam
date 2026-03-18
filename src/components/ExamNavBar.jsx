import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EXAMS, GRADES } from '../constants/exams';
import styles from '../styles/ExamNavBar.module.css';

export function ExamNavBar({ inline }) {
  const [openExam, setOpenExam] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenExam(null);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const examIds = Object.keys(EXAMS);
  const gradeIds = Object.keys(GRADES).filter((id) => GRADES[id]?.enabled);

  return (
    <nav ref={navRef} className={`${styles.navBar} ${inline ? styles.inline : ''}`}>
      {examIds.map((id) => {
        const exam = EXAMS[id];
        const isOpen = openExam === exam.id;
        return (
          <div key={exam.id} className={styles.menuItem}>
            <button
              type="button"
              className={styles.menuTrigger}
              onClick={() => setOpenExam(isOpen ? null : exam.id)}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {exam.name} ▸
            </button>
            {isOpen && (
              <div className={styles.dropdown}>
                <ul className={styles.gradeList}>
                  {gradeIds.map((gradeId) => (
                    <li key={gradeId}>
                      <Link
                        to={`/exam/${exam.id}/grade/${gradeId}`}
                        className={styles.gradeLink}
                        onClick={() => setOpenExam(null)}
                      >
                        Grade {gradeId}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
