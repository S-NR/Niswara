import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCourse } from "../content/academies";
import { useProgressStore } from "../store/useProgressStore";
import { isCourseComplete } from "../domain/progress";
import QuizRunner from "../features/quiz/QuizRunner";

export default function ExamPage() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const course = getCourse(courseId!);
  const progress = useProgressStore((s) => s.get(courseId!));
  const recordExam = useProgressStore((s) => s.recordExam);

  if (!course) return <Navigate to="/dashboard" replace />;
  if (!isCourseComplete(course, progress))
    return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{course.finalExam.title}</h1>
      <QuizRunner
        quiz={course.finalExam}
        onComplete={(r) => {
          recordExam(course.id, {
            quizId: course.finalExam.id,
            score: r.score,
            passed: r.passed,
            answeredAt: new Date().toISOString(),
            answers: r.answers
          });
          if (r.passed) setTimeout(() => nav(`/course/${course.id}/certificate`), 1500);
        }}
      />
    </div>
  );
}