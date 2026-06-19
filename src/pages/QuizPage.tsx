import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCourse } from "../content/academies";
import { useProgressStore } from "../store/useProgressStore";
import { getDayStatus } from "../domain/progress";
import QuizRunner from "../features/quiz/QuizRunner";

export default function QuizPage() {
  const { courseId, n } = useParams();
  const nav = useNavigate();
  const course = getCourse(courseId!);
  const progress = useProgressStore((s) => s.get(courseId!));
  const recordDay = useProgressStore((s) => s.recordDay);

  if (!course) return <Navigate to="/dashboard" replace />;
  const day = course.days.find((d) => d.index === Number(n));
  if (!day) return <Navigate to="/dashboard" replace />;
  if (getDayStatus(day, course, progress) === "locked")
    return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Quiz — {day.title}</h1>
      <QuizRunner
        quiz={day.quiz}
        onComplete={(r) => {
          recordDay(course.id, day.id, {
            quizId: day.quiz.id,
            score: r.score,
            passed: r.passed,
            answeredAt: new Date().toISOString(),
            answers: r.answers
          });
          setTimeout(() => nav("/dashboard"), 1500);
        }}
      />
    </div>
  );
}