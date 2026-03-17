/**
 * Attempt Service - In-progress and completed test attempts.
 * Uses IndexedDB via storageUtils (browser storage only).
 */

import {
  getInProgressAttempt,
  saveInProgressAttempt,
  clearInProgressAttempt,
  getCompletedTests,
  addCompletedTest,
  getBestScores,
  updateBestScore,
} from '../utils/storageUtils.js';

export function getInProgress() {
  return getInProgressAttempt();
}

export function saveInProgress(attempt) {
  saveInProgressAttempt(attempt);
}

export function clearInProgress() {
  clearInProgressAttempt();
}

export function getCompleted() {
  return getCompletedTests();
}

export function addCompleted(entry) {
  addCompletedTest(entry);
}

export function getBest() {
  return getBestScores();
}

export function updateBest(examId, percentage, testId) {
  return updateBestScore(examId, percentage, testId);
}
