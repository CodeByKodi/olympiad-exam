import styles from '../styles/SectionTabs.module.css';

/**
 * Clean segmented control for exam sections.
 * When only one section exists, shows a minimal active tab.
 */
export function SectionTabs({ sections = [{ id: '1', label: 'Questions', count: 0 }], activeId, onSelect }) {
  if (!sections?.length) return null;
  if (sections.length === 1) {
    return (
      <div className={styles.wrap}>
        <div className={styles.singleTab}>{sections[0].label}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.tab} ${activeId === s.id ? styles.active : ''}`}
            onClick={() => onSelect?.(s.id)}
          >
            {s.label}
            {s.count != null && <span className={styles.count}>{s.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
