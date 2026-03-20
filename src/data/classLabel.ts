/** Treat "Grade 7", "grade7", "Class 7" as equivalent for syllabus and mock lookups. */
export function normalizeClassLabel(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\bgrade\b/g, 'class')
    .replace(/\s+/g, ' ');
}
