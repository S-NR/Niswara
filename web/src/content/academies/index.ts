import type { Academy, Course } from "../../domain/models";
import { musicCourse } from "./music/course";

export const academies: Academy[] = [
  {
    id: "music",
    title: "Music Learning Academy",
    description: "Learn music from the ground up in 10 days.",
    icon: "🎵",
    courseIds: ["music-foundations"]
  }
  // Add more academies here — no code changes elsewhere required.
];

export const courses: Record<string, Course> = {
  [musicCourse.id]: musicCourse
};

export function getCourse(courseId: string): Course | undefined {
  return courses[courseId];
}