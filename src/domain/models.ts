export type Role = "student" | "instructor" | "admin";

export interface Academy {
  id: string;
  title: string;
  description: string;
  icon?: string;
  courseIds: string[];
}

export interface Course {
  id: string;
  academyId: string;
  title: string;
  description: string;
  passThreshold: number;
  days: Day[];
  finalExam: Exam;
}

export interface Day {
  id: string;
  index: number;
  title: string;
  objectives: string[];
  content: ContentBlock[];
  videoUrl?: string;
  resources: Resource[];
  quiz: Quiz;
}

export interface ContentBlock {
  type: "heading" | "paragraph" | "code" | "callout";
  value: string;
}

export interface Resource {
  label: string;
  url: string;
  kind: "pdf" | "link" | "audio" | "sheet";
}

export interface Quiz {
  id: string;
  questions: Question[];
  passThreshold?: number;
}

export interface Question {
  id: string;
  prompt: string;
  type: "single" | "multiple" | "boolean";
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  points?: number;
}

export interface Exam extends Quiz {
  title: string;
  timeLimitMinutes?: number;
}

export interface QuizAttempt {
  quizId: string;
  score: number;
  passed: boolean;
  answeredAt: string;
  answers: Record<string, string[]>;
}

export type DayStatus = "locked" | "unlocked" | "completed";

export interface DayProgress {
  dayId: string;
  status: DayStatus;
  bestScore?: number;
  attempts: QuizAttempt[];
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  days: Record<string, DayProgress>;
  finalExam?: QuizAttempt;
  certificateId?: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  score: number;
  issuedAt: string;
}