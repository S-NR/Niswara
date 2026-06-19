import type { Certificate, Course, CourseProgress, User } from "./models";
import { isCourseComplete } from "./progress";

export function isEligibleForCertificate(
  course: Course,
  progress: CourseProgress | undefined
): boolean {
  return isCourseComplete(course, progress) && !!progress?.finalExam?.passed;
}

export function buildCertificate(
  user: User,
  course: Course,
  progress: CourseProgress
): Certificate {
  return {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    courseId: course.id,
    courseTitle: course.title,
    score: progress.finalExam?.score ?? 0,
    issuedAt: new Date().toISOString()
  };
}