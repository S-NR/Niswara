import type { Course, Day, Quiz } from "../../../domain/models";

const dayTitles = [
  "Sound & the Basics of Music",
  "Rhythm & Beat",
  "Notes & the Musical Alphabet",
  "Scales & Keys",
  "Intervals",
  "Chords & Harmony",
  "Reading Sheet Music",
  "Melody & Phrasing",
  "Ear Training",
  "Putting It Together: Your First Piece"
];

function makeQuiz(n: number): Quiz {
  return {
    id: `music-day-${n}-quiz`,
    passThreshold: 70,
    questions: [
      {
        id: `d${n}-q1`,
        prompt: `Day ${n}: Which statement is correct about "${dayTitles[n - 1]}"?`,
        type: "single",
        options: [
          { id: "a", text: "It is a core fundamental of music theory" },
          { id: "b", text: "It is unrelated to music" },
          { id: "c", text: "It only applies to drums" }
        ],
        correctOptionIds: ["a"]
      },
      {
        id: `d${n}-q2`,
        prompt: "True or False: Practicing daily improves retention.",
        type: "boolean",
        options: [
          { id: "t", text: "True" },
          { id: "f", text: "False" }
        ],
        correctOptionIds: ["t"]
      }
    ]
  };
}

const days: Day[] = dayTitles.map((title, i) => {
  const n = i + 1;
  return {
    id: `music-day-${n}`,
    index: n,
    title,
    objectives: [
      `Understand the core ideas of ${title.toLowerCase()}`,
      "Apply the concept in a short exercise",
      "Pass the day quiz to unlock the next class"
    ],
    content: [
      { type: "heading", value: `Welcome to Day ${n}: ${title}` },
      {
        type: "paragraph",
        value:
          "This lesson introduces the key concepts you need. Read through, watch the video when available, then take the quiz."
      },
      {
        type: "callout",
        value: "Tip: Re-read the objectives before attempting the quiz."
      }
    ],
    videoUrl: undefined, // future-ready: drop a URL here
    resources: [
      { label: "Lesson notes (PDF)", url: "#", kind: "pdf" },
      { label: "Extra reading", url: "#", kind: "link" }
    ],
    quiz: makeQuiz(n)
  };
});

export const musicCourse: Course = {
  id: "music-foundations",
  academyId: "music",
  title: "Music Foundations",
  description: "A 10-day journey from sound basics to your first piece.",
  passThreshold: 70,
  days,
  finalExam: {
    id: "music-final-exam",
    title: "Music Foundations — Final Exam",
    passThreshold: 75,
    timeLimitMinutes: 30,
    questions: [
      {
        id: "fe-q1",
        prompt: "How many days are in this course?",
        type: "single",
        options: [
          { id: "a", text: "5" },
          { id: "b", text: "10" },
          { id: "c", text: "20" }
        ],
        correctOptionIds: ["b"]
      },
      {
        id: "fe-q2",
        prompt: "Select all that are musical fundamentals.",
        type: "multiple",
        options: [
          { id: "a", text: "Rhythm" },
          { id: "b", text: "Scales" },
          { id: "c", text: "Photosynthesis" }
        ],
        correctOptionIds: ["a", "b"]
      },
      {
        id: "fe-q3",
        prompt: "True or False: Chords are built from intervals.",
        type: "boolean",
        options: [
          { id: "t", text: "True" },
          { id: "f", text: "False" }
        ],
        correctOptionIds: ["t"]
      }
    ]
  }
};