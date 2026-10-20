import { Link, Navigate, useParams } from "react-router-dom";
import { getCourse } from "../content/academies";
import { useProgressStore } from "../store/useProgressStore";
import { getDayStatus } from "../domain/progress";

export default function Lesson() {
  const { courseId, n } = useParams();
  const course = getCourse(courseId!);
  const progress = useProgressStore((s) => s.get(courseId!));
  if (!course) return <Navigate to="/dashboard" replace />;

  const day = course.days.find((d) => d.index === Number(n));
  if (!day) return <Navigate to="/dashboard" replace />;

  const status = getDayStatus(day, course, progress);
  if (status === "locked") return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-5">
      <Link to="/dashboard" className="text-sm opacity-60">
        ← Dashboard
      </Link>
      <div>
        <p className="text-xs opacity-60">Day {day.index}</p>
        <h1 className="text-2xl font-bold">{day.title}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {day.objectives.map((o, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
            {o}
          </span>
        ))}
      </div>

      {/* Video placeholder (future-ready) */}
      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-sm opacity-60">
        {day.videoUrl ? (
          <video src={day.videoUrl} controls className="w-full h-full rounded-xl" />
        ) : (
          "Video coming soon"
        )}
      </div>

      <article className="space-y-3">
        {day.content.map((b, i) => {
          if (b.type === "heading")
            return (
              <h2 key={i} className="text-xl font-semibold">
                {b.value}
              </h2>
            );
          if (b.type === "callout")
            return (
              <div key={i} className="rounded-lg bg-muted p-3 text-sm">
                {b.value}
              </div>
            );
          return (
            <p key={i} className="opacity-90">
              {b.value}
            </p>
          );
        })}
      </article>

      <div>
        <h3 className="font-semibold mb-2">Notes & resources</h3>
        <ul className="list-disc pl-5 text-sm">
          {day.resources.map((r, i) => (
            <li key={i}>
              <a href={r.url} className="text-primary underline">
                {r.label}
              </a>{" "}
              <span className="opacity-50">({r.kind})</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to={`/course/${course.id}/day/${day.index}/quiz`}
        className="inline-block px-5 py-2 rounded-md bg-primary text-white"
      >
        Take the Quiz
      </Link>
    </div>
  );
}