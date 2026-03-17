import styles from '../styles/Skeleton.module.css';

/**
 * Skeleton placeholder for loading states.
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS class
 * @param {string} [props.width] - CSS width (e.g. '100%', '60px')
 * @param {string} [props.height] - CSS height (e.g. '1rem', '40px')
 * @param {boolean} [props.circle] - Round shape
 */
export function Skeleton({ className = '', width, height, circle = false }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  return (
    <div
      className={`${styles.skeleton} ${circle ? styles.circle : ''} ${className}`.trim()}
      style={Object.keys(style).length ? style : undefined}
      aria-hidden="true"
    />
  );
}
