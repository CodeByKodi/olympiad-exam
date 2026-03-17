/**
 * Utilities for formatting time and timer display.
 */

/**
 * Format remaining time as MM:SS.
 * @param {number} totalSeconds - Total seconds remaining
 * @returns {string} Formatted string like "45:30"
 */
export function formatRemainingTime(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0 || !Number.isFinite(totalSeconds)) {
    return '00:00';
  }
  const secs = Math.floor(totalSeconds);
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Parse duration string or number to seconds.
 * @param {string|number} duration - "60" or 60 (minutes)
 * @returns {number} Total seconds
 */
export function parseDurationToSeconds(duration) {
  if (typeof duration === 'number') return duration * 60;
  const mins = parseInt(String(duration), 10);
  return isNaN(mins) ? 60 * 60 : mins * 60;
}
