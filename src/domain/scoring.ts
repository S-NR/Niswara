import type { Quiz } from "./models";

export function gradeQuiz(
  quiz: Quiz,
  answers: Record<string, string[]>,
  defaultThreshold = 70
): { score: number; passed: boolean } {
  let earned = 0;
  let total = 0;
  for (const q of quiz.questions) {
    const pts = q.points ?? 1;
    total += pts;
    const given = (answers[q.id] ?? []).slice().sort().join(",");
    const correct = q.correctOptionIds.slice().sort().join(",");
    if (given && given === correct) earned += pts;
  }
  const score = total === 0 ? 0 : Math.round((earned / total) * 100);
  return { score, passed: score >= (quiz.passThreshold ?? defaultThreshold) };
}