/**
 * Utilities for normalizing and validating answer indexes.
 * Handles 0-based and 1-based indexing consistently.
 */

/**
 * Normalize answer index to 0-based for internal use.
 * @param {number} index - Answer index (0-based or 1-based)
 * @param {number} optionsLength - Number of options
 * @returns {number} 0-based index, or -1 if invalid
 */
export function normalizeAnswerIndex(index, optionsLength = 4) {
  if (index == null || index < 0) return -1;
  const idx = typeof index === 'string' ? parseInt(index, 10) : Math.floor(index);
  if (isNaN(idx) || idx < 0 || idx >= optionsLength) return -1;
  return idx;
}

/**
 * Convert 0-based index to option label (A, B, C, D).
 * @param {number} index - 0-based index
 * @returns {string} Option label
 */
export function indexToLabel(index) {
  if (index < 0 || index > 25) return '';
  return String.fromCharCode(65 + index);
}

/**
 * Convert option label to 0-based index.
 * @param {string} label - Option label (A, B, C, D)
 * @returns {number} 0-based index
 */
export function labelToIndex(label) {
  if (!label || typeof label !== 'string') return -1;
  const char = label.toUpperCase().charAt(0);
  const idx = char.charCodeAt(0) - 65;
  return idx >= 0 && idx < 26 ? idx : -1;
}
