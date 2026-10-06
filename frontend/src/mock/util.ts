export function seeded(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function seededRange(seed: string, min: number, max: number): number {
  return Math.round(min + seeded(seed) * (max - min));
}

export function gradeFor(percentage: number): string {
  if (percentage >= 90) return "O";
  if (percentage >= 80) return "A+";
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B+";
  if (percentage >= 55) return "B";
  if (percentage >= 50) return "C";
  return "F";
}

export const GRADE_ORDER = ["O", "A+", "A", "B+", "B", "C", "F"];
