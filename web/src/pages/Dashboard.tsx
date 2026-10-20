import { useEffect } from "react";
import { Link } from "react-router-dom";
import { academies, getCourse } from "../content/academies";
import { useAuthStore } from "../store/useAuthStore";
import { useProgressStore } from "../store/useProgressStore";
import {
  getDayStatus,
  isCourseComplete,
  overallPercent
} from "../domain/progress";
import ProgressRing from "../components/ProgressRing";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)!;
  const ensure = useProgressStore((s) => s.ensure);
  const progressMap = useProgressStore((s) => s.byCourse);

  const courseId = academies[0].courseIds[0];
  const course = getCourse(courseId)!;

  useEffect(() => {
    ensure(courseId, user.id);
  }, [courseId, user.id, ensure]);

  const progress = progressMap[courseId];
  const complete = isCourseComplete(course, progress);
  const percent = overallPercent(course, progress);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="opacity-70 text-sm">{course.description}</p>
        </div>
        <ProgressRing percent={percent} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {course.days.map((day) => {
          const status = getDayStatus(day, course, progress);
          const locked = status === "locked";
          const done = status === "completed";
          return (
            <div
              key={day.id}
              className={`rounded-xl border border-muted bg-card p-4 ${
                locked ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium opacity-60">
                  Day {day.index}
                </span>
                <span>{done ? "✅" : locked ? "🔒" : "▶️"}</span>
              </div>
              <h3 className="font-semibold mt-1">{day.title}</h3>
              {done && (
                <p className="text-xs opacity-60 mt-1">
                  Best: {progress?.days[day.id]?.bestScore}%
                </p>
              )}
              {locked ? (
                <p className="text-sm mt-3 opacity-60">Complete previous day</p>
              ) : (
                <Link
                  to={`/course/${course.id}/day/${day.index}`}
                  className="inline-block mt-3 text-sm px-3 py-1 rounded-md bg-primary text-white"
                >
                  {done ? "Review" : "Start"}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-muted bg-card p-5">
        <h2 className="font-semibold">Final Exam</h2>
        <p className="opacity-70 text-sm mt-1">
          {complete
            ? "All days complete — you can take the final exam."
            : "Finish all 10 days to unlock the final exam."}
        </p>
        {complete && (
          <Link
            to={`/course/${course.id}/exam`}
            className="inline-block mt-3 px-4 py-2 rounded-md bg-primary text-white text-sm"
          >
            Take Final Exam
          </Link>
        )}
      </div>
    </div>
  );
}