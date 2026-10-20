import { useState } from "react";
import type { Quiz } from "../../domain/models";
import { gradeQuiz } from "../../domain/scoring";

interface Props {
  quiz: Quiz;
  onComplete: (result: {
    score: number;
    passed: boolean;
    answers: Record<string, string[]>;
  }) => void;
}

export default function QuizRunner({ quiz, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  function toggle(qId: string, optId: string, multiple: boolean) {
    setAnswers((prev) => {
      const cur = prev[qId] ?? [];
      if (multiple) {
        return {
          ...prev,
          [qId]: cur.includes(optId)
            ? cur.filter((x) => x !== optId)
            : [...cur, optId]
        };
      }
      return { ...prev, [qId]: [optId] };
    });
  }

  function submit() {
    const result = gradeQuiz(quiz, answers);
    setSubmitted(result);
    onComplete({ ...result, answers });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-muted bg-card p-6 text-center">
        <div className="text-4xl">{submitted.passed ? "🎉" : "📚"}</div>
        <h2 className="text-2xl font-bold mt-2">
          {submitted.passed ? "Passed!" : "Keep going"}
        </h2>
        <p className="opacity-70 mt-1">Score: {submitted.score}%</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {quiz.questions.map((q, i) => {
        const multiple = q.type === "multiple";
        return (
          <div key={q.id} className="rounded-xl border border-muted bg-card p-4">
            <p className="font-medium">
              {i + 1}. {q.prompt}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => {
                const checked = (answers[q.id] ?? []).includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer ${
                      checked ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={q.id}
                      checked={checked}
                      onChange={() => toggle(q.id, opt.id, multiple)}
                    />
                    <span>{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
      <button
        onClick={submit}
        className="px-5 py-2 rounded-md bg-primary text-white"
      >
        Submit
      </button>
    </div>
  );
}