import type { Course, CourseProgress, Day, DayStatus } from "./models";

export function getDayStatus(
  day: Day,
  course: Course,
  progress: CourseProgress | undefined
): DayStatus {
  const dp = progress?.days[day.id];
  if (dp?.status === "completed") return "completed";
  if (day.index === 1) return "unlocked";
  const prev = course.days.find((d) => d.index === day.index - 1);
  const prevDone =
    prev && progress?.days[prev.id]?.status === "completed";
  return prevDone ? "unlocked" : "locked";
}

export function isCourseComplete(
  course: Course,
  progress: CourseProgress | undefined
): boolean {
  if (!progress) return false;
  return course.days.every(
    (d) => progress.days[d.id]?.status === "completed"
  );
}

export function completedCount(
  course: Course,
  progress: CourseProgress | undefined
): number {
  if (!progress) return 0;
  return course.days.filter(
    (d) => progress.days[d.id]?.status === "completed"
  ).length;
}

export function overallPercent(
  course: Course,
  progress: CourseProgress | undefined
): number {
  return Math.round((completedCount(course, progress) / course.days.length) * 100);
}