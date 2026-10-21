import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Certificate,
  Course,
  CourseProgress,
  QuizAttempt
} from "../domain/models";

interface ProgressState {
  byCourse: Record<string, CourseProgress>;
  certificates: Certificate[];
  ensure: (courseId: string, userId: string) => void;
  recordDay: (
    courseId: string,
    dayId: string,
    attempt: QuizAttempt
  ) => void;
  recordExam: (courseId: string, attempt: QuizAttempt) => void;
  saveCertificate: (courseId: string, cert: Certificate) => void;
  get: (courseId: string) => CourseProgress | undefined;
}

function key(courseId: string) {
  return courseId;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      byCourse: {},
      certificates: [],
      ensure: (courseId, userId) =>
        set((s) => {
          if (s.byCourse[key(courseId)]) return s;
          return {
            byCourse: {
              ...s.byCourse,
              [key(courseId)]: {
                courseId,
                userId,
                days: {},
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),
      recordDay: (courseId, dayId, attempt) =>
        set((s) => {
          const cp = s.byCourse[key(courseId)];
          if (!cp) return s;
          const existing = cp.days[dayId];
          const best = Math.max(existing?.bestScore ?? 0, attempt.score);
          // A failed retake must not un-complete a passed day (that would re-lock every later day)
          const day = {
            dayId,
            status:
              attempt.passed || existing?.status === "completed"
                ? ("completed" as const)
                : ("unlocked" as const),
            bestScore: best,
            attempts: [...(existing?.attempts ?? []), attempt]
          };
          return {
            byCourse: {
              ...s.byCourse,
              [key(courseId)]: {
                ...cp,
                days: { ...cp.days, [dayId]: day },
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),
      recordExam: (courseId, attempt) =>
        set((s) => {
          const cp = s.byCourse[key(courseId)];
          if (!cp) return s;
          return {
            byCourse: {
              ...s.byCourse,
              [key(courseId)]: {
                ...cp,
                finalExam: attempt,
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),
      saveCertificate: (courseId, cert) =>
        set((s) => {
          const cp = s.byCourse[key(courseId)];
          return {
            certificates: [
              ...s.certificates.filter((c) => c.courseId !== courseId),
              cert
            ],
            byCourse: cp
              ? {
                  ...s.byCourse,
                  [key(courseId)]: { ...cp, certificateId: cert.id }
                }
              : s.byCourse
          };
        }),
      get: (courseId) => get().byCourse[key(courseId)]
    }),
    { name: "mla:progress" }
  )
);