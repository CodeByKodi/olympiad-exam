/**
 * Predefined users for login.
 * Client-side only - not secure. Change credentials for your deployment.
 * Roles: admin (full access), teacher (library + manage), student (practice/mock only).
 */
export const PREDEFINED_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', displayName: 'Admin' },
  { username: 'teacher', password: 'teacher123', role: 'teacher', displayName: 'Teacher' },
  { username: 'student', password: 'student123', role: 'student', displayName: 'Student' },
];

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};
