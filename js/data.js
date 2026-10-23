/* ============================================================
   APP DATA
   Static curriculum / content. Structured so a real backend
   (DB + API) can replace this module later without touching
   any page code — every page reads data through APP_DATA only.
   ============================================================ */

const APP_DATA = (() => {

  /* ---------- Journey Levels ---------- */
  const LEVELS = [
    { id: 1, title: "Foundation", role: "Beginner", skills: ["Voice awareness", "Breathing", "Pitch", "Rhythm", "Ear training", "Basic music concepts"] },
    { id: 2, title: "Singer", role: "Vocalist", skills: ["Vocal technique", "Range", "Resonance", "Dynamics", "Expression", "Performance"] },
    { id: 3, title: "Musician", role: "Theory & Keys", skills: ["Music theory", "Keyboard", "Scales", "Intervals", "Chords", "Harmony", "Rhythm", "Melody"] },
    { id: 4, title: "Recording Artist", role: "Studio Craft", skills: ["Microphone", "Recording", "Editing", "Comping", "Pitch correction", "Vocal production"] },
    { id: 5, title: "Producer", role: "Songcraft", skills: ["Songwriting", "Arrangement", "Instrumentation", "Sound selection", "Production"] },
    { id: 6, title: "Mixing Engineer", role: "Mix Craft", skills: ["EQ", "Compression", "De-essing", "Saturation", "Reverb", "Delay", "Automation", "Bus processing", "Stereo imaging"] },
    { id: 7, title: "Mastering Engineer", role: "Final Polish", skills: ["Dynamics", "Loudness", "True peak", "Limiting", "Stereo", "Reference tracks", "Streaming preparation"] },
    { id: 8, title: "Professional Artist", role: "Release & Identity", skills: ["Complete songs", "Portfolio", "Release preparation", "Performance", "Artist identity"] },
  ];

  /* ---------- Level 1 : fully authored classes ---------- */
  const level1 = [
    {
      number: 1, title: "Meet Your Voice", category: "Vocal Foundation", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 25,
      description: "Understand your natural voice and establish your Day-1 baseline.",
      content: {
        whatYoullLearn: "How your natural speaking and singing voice actually sounds, without judgement — and how to capture an honest Day-1 baseline you'll compare against for the rest of this journey.",
        whyItMatters: "Every professional vocalist, producer and mixing engineer starts from the same place: knowing exactly what they're working with. You can't track progress without a true starting point, and you can't improve a sound you've never really listened to.",
        theory: "Your voice has two closely related instruments: your speaking voice (relaxed, habitual, usually in your most comfortable range) and your singing voice (which asks for more breath support, pitch accuracy and sustained tone). Today isn't about sounding good — it's about sounding like you, so Day 180 has something honest to compare against.",
        guidedPractice: [
          "Sit or stand tall, relaxed shoulders, feet flat on the floor.",
          "Speak one sentence about your day exactly as you normally would.",
          "Hum a comfortable note for 5 seconds and notice where you feel the vibration.",
          "Sing the first line of any song you know well, at a comfortable volume.",
          "Notice — don't judge — any tension in your jaw, neck or shoulders."
        ],
        assignment: {
          instructions: [
            "Record 20 seconds of natural speech (just talk about your day).",
            "Record 20–30 seconds of natural singing (any song, comfortable key).",
          ],
          questions: [
            "What did I notice about my voice?",
            "Where did I feel comfortable?",
            "Where did I struggle?",
            "Did I run out of breath?",
            "Did I notice pitch problems?",
            "What do I currently consider my biggest weakness?",
            "What do I think is my strongest point?",
          ]
        }
      }
    },
    {
      number: 2, title: "Breathing & Breath Awareness", category: "Breath Support", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 20,
      description: "Learn how breath actually powers singing, and feel the difference between chest and diaphragmatic breathing.",
      content: {
        whatYoullLearn: "The difference between shallow chest breathing and deep diaphragmatic breathing, and how to feel your breath support engage.",
        whyItMatters: "Breath is the engine of every note you'll ever sing. Weak or tense breathing is the root cause of most pitch, tone and endurance problems later on.",
        theory: "Diaphragmatic breathing lets your lower ribs and belly expand on the inhale, giving your vocal folds a steady, supported stream of air instead of a tense push from the throat.",
        guidedPractice: [
          "Lie down and place a hand on your belly — breathe so only your hand rises.",
          "Repeat standing up, noticing the same expansion.",
          "Inhale for 4 counts, exhale on a slow hiss for 8 counts.",
          "Repeat 5 times, extending the exhale by 1 count each round if comfortable."
        ],
        assignment: {
          instructions: [
            "Practice the 4-in / 8-out breathing cycle for 5 minutes.",
            "Record a 15 second voice memo describing how your breath felt today.",
          ],
          questions: [
            "Did I feel my belly expand on the inhale?",
            "Was my exhale steady or shaky?",
            "Did I feel any tension in my shoulders or neck while breathing?",
            "How long could I comfortably sustain the exhale?",
          ]
        }
      }
    },
    {
      number: 3, title: "Understanding Pitch", category: "Pitch", skillTag: "pitch",
      difficulty: "Beginner", estMinutes: 40,
      // Rendered by the interactive lesson in js/lessons/understandingPitch.js instead of the standard class layout
      interactive: "understanding-pitch",
      subtitle: "Before we learn to sing a note, we need to learn to hear a note.",
      description: "An interactive lesson: what pitch is, high vs low, your first notes on a piano, three ear-training games, and singing your first note.",
      content: {
        whatYoullLearn: "What sound and pitch are, how to hear whether a note goes up, down or stays the same, what note names like C4 mean, and how to match a note with your voice.",
        whyItMatters: "Pitch accuracy is the single most noticeable skill to untrained ears. Every melody, harmony and in-tune recording depends on this foundation.",
        theory: "A higher pitch means something vibrates faster; a lower pitch means it vibrates slower. Your vocal folds work the same way — and your ears are the tool that keeps them on the right note.",
        guidedPractice: [
          "Played my first notes on a piano and trained my ears with Higher/Lower, Same/Different and Find-the-Note exercises.",
        ],
        assignment: {
          instructions: [
            "Play three comfortable notes on the piano.",
            "Identify which is highest and which is lowest.",
            "Complete the High/Low exercise.",
            "Complete the Same/Different exercise.",
            "Complete the Note Identification exercise.",
            "Choose one comfortable note.",
            "Play it.",
            "Sing it.",
            "Record yourself.",
            "Write a short reflection.",
          ],
          questions: [
            "What did I find easy?",
            "What did I find difficult?",
            "Which notes felt comfortable?",
            "Could I hear when my voice was higher or lower?",
            "Did I notice myself going off pitch?",
          ]
        }
      }
    },
    {
      number: 4, title: "Matching a Note", category: "Pitch", skillTag: "pitch",
      difficulty: "Beginner", estMinutes: 45,
      // Rendered by the interactive lesson in js/lessons/matchingANote.js
      interactive: "matching-a-note",
      subtitle: "Can you hear a note and make your voice meet it?",
      description: "An interactive lesson: hear a reference note, sing it, listen back and adjust — the ear → brain → voice loop at the heart of singing in tune.",
      content: {
        whatYoullLearn: "How to hear a reference note, remember it, sing it, compare your voice with it and make small adjustments — and what flat and sharp mean.",
        whyItMatters: "Note-matching is the core mechanical skill behind every in-tune performance — it's the bridge between hearing pitch and producing it.",
        theory: "Matching pitch is a feedback loop: listen, sing, listen back, adjust. The goal isn't to be perfect instantly — it's to train the loop so the adjustments get smaller and faster over time.",
        guidedPractice: [
          "Listened to reference notes, sang them back, compared my recordings and adjusted — including slides, blind notes and a three-note chain.",
        ],
        assignment: {
          instructions: [
            "Choose one comfortable note.",
            "Play the note using the virtual piano.",
            "Listen carefully.",
            "Sing the note.",
            "Record yourself.",
            "Compare your voice with the reference.",
            "Try again and make a small adjustment.",
            "Repeat this with 3 different notes.",
            "Record your best attempt.",
            "Write your reflection.",
          ],
          questions: [
            "What happened when I first tried to match the note?",
            "Was my voice generally higher, lower or close?",
            "What did I do to correct it?",
            "Did I feel relaxed while singing?",
          ]
        }
      }
    },
    {
      number: 5, title: "Listening to Your Own Voice", category: "Ear Training", skillTag: "ear",
      difficulty: "Beginner", estMinutes: 45,
      // Rendered by the interactive lesson in js/lessons/listeningToYourVoice.js
      interactive: "listening-to-your-voice",
      subtitle: "A singer improves faster when they learn to listen like a singer.",
      description: "An interactive lesson: record yourself, listen three ways, notice what your voice is doing, mark moments — and choose one thing to work on. Observation before correction.",
      content: {
        whatYoullLearn: "How to listen back to your own singing calmly and specifically — noticing pitch, words, breath, volume, smoothness and tone — and turn what you hear into simple observations.",
        whyItMatters: "Mixing and mastering engineers spend their entire career critically listening. Learning to do this calmly, about your own voice, starts that muscle early.",
        theory: "Most people feel their voice sounds 'wrong' on playback because they're used to hearing it through bone conduction, not air. That mismatch is normal — the recording is the more accurate version of what others hear.",
        guidedPractice: [
          "Recorded myself, listened three ways (just listening, only pitch, words/breath/smoothness), marked moments and noted what I observed.",
        ],
        assignment: {
          instructions: [
            "Record 30–60 seconds of a song — no effects.",
            "Listen 1: listen normally.",
            "Listen 2: listen only for pitch.",
            "Listen 3: listen for words, breath, volume and smoothness.",
            "Record at least three observations (mark the moments).",
            "Answer the five questions below.",
            "Choose ONE observation to practise next.",
          ],
          questions: [
            "What changed when you listened to yourself carefully?",
            "Did your voice sound different from how you expected?",
            "Was it easy or difficult to identify problems?",
            "What is the ONE thing you want to improve next?",
          ]
        }
      }
    },
    {
      number: 6, title: "Rhythm & Timing", category: "Rhythm", skillTag: "rhythm",
      difficulty: "Beginner", estMinutes: 45,
      // Rendered by the interactive lesson in js/lessons/rhythmAndTiming.js
      interactive: "rhythm-and-timing",
      subtitle: "Learn to feel the pulse before you try to sing with it.",
      description: "An interactive lesson: hear the beat, feel the pulse, count, tap, speak and sing in time — with a metronome at the centre.",
      content: {
        whatYoullLearn: "What beat, rhythm, tempo and timing mean, how to feel and count a steady pulse, tap and clap simple patterns, and place spoken words and sung notes in time.",
        whyItMatters: "Rhythm is invisible when it's right and obvious when it's wrong — a singer can sing the correct note and still sound wrong if the timing is wrong.",
        theory: "A steady pulse (the beat) is the grid everything lines up against; tempo is how fast it goes; rhythm is the pattern placed on it; timing is putting each sound in the right place.",
        guidedPractice: [
          "Tapped, counted and clapped with a metronome, tapped back simple patterns, and spoke and sang in time at 60–80 BPM.",
        ],
        assignment: {
          // The five assignment parts and seven questions live in the lesson; these are the reflection prompts
          instructions: [
            "Set the metronome to 60 BPM. Listen for 8 beats, then tap along for another 8.",
            "Count 1 2 3 4 for 8 bars.",
            "Speak a short phrase in time.",
            "Sing a comfortable note in a simple rhythm.",
            "Repeat at 80 BPM.",
          ],
          questions: [
            "Can I feel the beat without looking at the screen?",
            "Can I count while singing?",
            "Do I tend to rush?",
            "Do I tend to fall behind?",
            "Can I recover if I lose the beat?",
            "What is one thing I want to improve?",
          ]
        }
      }
    },
    {
      number: 7, title: "Basic Vocal Warm-Up", category: "Vocal Technique", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 20,
      // Rendered by the interactive lesson in js/lessons/basicVocalWarmup.js
      interactive: "basic-vocal-warmup",
      subtitle: "Prepare your voice gently before you sing.",
      description: "An interactive lesson: a short, comfortable warm-up routine — breathing awareness, humming, a gentle pitch glide, easy vowels, a five-note pattern and simple articulation — to prepare your voice, not push it.",
      content: {
        whatYoullLearn: "A short, repeatable warm-up routine — breathing awareness, gentle humming or lip trills, an easy pitch glide, simple vowels, a five-note pattern and basic articulation — that gently prepares your voice before you sing.",
        whyItMatters: "A warm-up prepares the coordination between breath, voice, pitch, resonance and articulation. It's preparation, not a workout — a voice that's gently prepared works more easily in everything that follows.",
        theory: "Just as the body benefits from easing into activity, the voice benefits from a short, comfortable routine before it's asked to do more. A good warm-up feels easy, comfortable, controlled and gradual — never painful, strained, forced or exhausting.",
        guidedPractice: [
          "Worked through a short, comfortable routine: breathing awareness, humming or lip trills, a gentle pitch glide, easy vowels, a five-note pattern and simple articulation.",
        ],
        assignment: {
          // The assignment steps live in the lesson; these are the reflection prompts
          instructions: [
            "Gentle humming or lip trill",
            "An easy pitch glide",
            "AH, EE and OO on one comfortable note",
            "A simple five-note pattern",
            "A short articulation exercise (Ma-Me-Mi-Mo or La-Le-Li-Lo)",
          ],
          questions: [
            "How does my voice feel before the warm-up?",
            "How does it feel after?",
            "Which exercise feels most natural?",
            "Did I notice tension anywhere?",
            "Did I try to push?",
            "What should I remember before my next singing session?",
          ]
        }
      }
    },
    {
      number: 8, title: "Vocal Relaxation", category: "Vocal Health", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 20,
      // Rendered by the interactive lesson in js/lessons/vocalRelaxation.js
      interactive: "vocal-relaxation",
      subtitle: "Less tension. More freedom.",
      description: "An interactive lesson: notice unnecessary tension in the jaw, tongue, neck, shoulders and throat, learn to release it, and feel the difference in a simple before/after comparison.",
      content: {
        whatYoullLearn: "How to notice unnecessary tension in the face, jaw, tongue, neck, shoulders and throat, release it without force, and feel the difference it makes before and after you sing.",
        whyItMatters: "Singing doesn't need the whole body to work hard. Unnecessary tension is the most common thing standing between a beginner and a comfortable, free voice — and it's a skill to notice and release, not a flaw to fix once.",
        theory: "Relaxation is awareness, not force: you can't make a muscle relax by trying harder. The pattern is simple — notice, release, sing, notice again — and relaxed does not mean weak or collapsed; it means comfortable alignment with nothing unnecessary switched on.",
        guidedPractice: [
          "Worked through a short body check, gentle shoulder, jaw and tongue awareness, humming and relaxed vowels, then compared a before and after recording.",
        ],
        assignment: {
          // The assignment's two recordings live in the lesson (built on Exercise 6); these are the reflection prompts
          instructions: [
            "Recording 1 — sing a comfortable exercise naturally, without consciously relaxing anything",
            "Complete the Class 8 relaxation routine",
            "Recording 2 — sing the same exercise again",
          ],
          questions: [
            "What does a relaxed singing voice feel like to me?",
            "Where do I tend to create unnecessary tension?",
            "Do I try too hard when singing?",
            "Does singing softer help me stay relaxed?",
            "Did I notice anything new about my body?",
          ]
        }
      }
    },
    {
      number: 9, title: "Basic Vocal Control", category: "Vocal Technique", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 45,
      // Rendered by the interactive lesson in js/lessons/basicVocalControl.js
      interactive: "basic-vocal-control",
      subtitle: "Good singing is not about forcing the voice. It is about learning to control it.",
      description: "An interactive lesson: start, stabilize, control, change, transition and combine — small, intentional changes while staying comfortable.",
      content: {
        whatYoullLearn: "How to start and stop a note on purpose, keep a note reasonably stable, make small volume changes without forcing, and move smoothly between nearby notes — in time.",
        whyItMatters: "Control is what separates a shaky first attempt from a confident note — and it comes from comfort and coordination, not force.",
        theory: "A controlled note is started and ended intentionally, stays reasonably level in pitch, and changes volume only as much as you choose — supported by easy breath, never a squeezed throat.",
        guidedPractice: [
          "Practised steady notes, starting and stopping, soft and comfortable volume, a gentle swell, two- and three-note moves, and singing notes in time.",
        ],
        assignment: {
          // The assignment steps live in the lesson; these are the reflection prompts
          instructions: [
            "One comfortable sustained note",
            "Three short start/stop notes",
            "One soft → comfortable volume change",
            "A comfortable three-note pattern (e.g. C4 → D4 → E4)",
            "A simple rhythm pattern with the metronome",
          ],
          questions: [
            "What does vocal control mean to me now?",
            "Could I control my voice without forcing it?",
            "Was pitch easier when I stayed relaxed?",
            "Did increasing volume affect my pitch?",
            "Did I notice any tension?",
            "Which exercise felt most natural?",
            "What should I practice next?",
          ]
        }
      }
    },
    {
      number: 10, title: "First Progress Recording", category: "Recording", skillTag: "recording",
      difficulty: "Beginner", estMinutes: 35,
      // Rendered by the interactive lesson in js/lessons/firstProgressRecording.js
      interactive: "first-progress-recording",
      subtitle: "Don't try to sound perfect. Record where you are today.",
      description: "An interactive milestone: bring together everything from Classes 3–9 into one structured baseline recording — speaking, a reference note, a simple pattern, a rhythm exercise and a short song excerpt — your first point of comparison for future growth.",
      content: {
        whatYoullLearn: "How to create a structured, honest baseline recording — speaking voice, a comfortable reference note, a simple pitch pattern, a short rhythm exercise and a song excerpt — that becomes your first point of comparison for future progress.",
        whyItMatters: "You can't measure improvement without an honest starting point. This isn't an audition or a professional recording — it's a snapshot of where you are today, recorded naturally, without heavy editing or effects.",
        theory: "A useful baseline is consistent and honest: a similarly quiet environment and distance from the microphone each time, a comfortable volume, no pitch correction or effects, and no cherry-picking only the best take. The goal is a true record of today, not a performance.",
        guidedPractice: [
          "Brought together speaking, a reference note, a simple pattern, a rhythm exercise and a short song excerpt into one structured baseline recording, then reflected on it.",
        ],
        assignment: {
          // The five recordings live in the lesson (built on Parts 1-5); these are the reflection prompts ("What I Notice")
          instructions: [
            "Speaking sample",
            "Comfortable reference note",
            "Simple pitch pattern",
            "Rhythm exercise",
            "30–60 second song excerpt",
            "Self-evaluation",
            "Personal reflection",
            "One primary improvement focus",
          ],
          questions: [
            "One thing I like about my voice",
            "One thing I noticed that I need to improve",
            "One thing that surprised me",
            "One thing that felt easier than expected",
            "One thing I want to work on next",
          ]
        }
      }
    },
  ];

  /* ---------- Level 1, Class 11 (interactive) ----------
     Built first as Level 2 Class 1 (L2C01) and moved into Level 1 on
     2026-10-23; Store / ClassActivity carry old L2C01 progress across
     (see LEGACY_CLASS_IDS below). */
  const breathPhraseClass = {
    number: 11, title: "Breath & Phrase Control", category: "Breath Support", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 35,
    // Rendered by the interactive lesson in js/lessons/breathPhraseControl.js
    interactive: "breath-phrase-control",
    subtitle: "Learn to breathe for the phrase, not just for the note.",
    description: "An interactive lesson: connect breathing to real singing — when to breathe, how much breath you actually need, and how to release it naturally through a musical phrase.",
    content: {
      whatYoullLearn: "How to plan and use breath for a musical phrase — choosing a natural breathing point, taking a comfortable (not maximal) breath, completing a phrase without rushing, and releasing it naturally at the end.",
      whyItMatters: "Breathing for singing isn't an isolated exercise — it's a decision made in service of the phrase. Learning to breathe comfortably at the right moment prevents running out of air mid-word, and prevents the strain that comes from over-preparing.",
      theory: "A musical phrase is a group of words or notes that belong together, usually ending at a natural pause. Good phrase breathing means a comfortable breath just before the phrase, using it efficiently through to a natural end, and releasing without forcing — never maximum inhalation, never breath-holding, never racing a timer.",
      guidedPractice: [
        "Explored natural breath awareness, a gentle controlled exhale, breath-marking in spoken and sung phrases, phrases of increasing length, breath with rhythm and with pitch, and compared two recordings made with different breathing choices.",
      ],
      assignment: {
        // The two recordings live in the lesson (built on the Breath Marking exercise); these are the reflection prompts
        instructions: [
          "Record a short, comfortable song phrase (first attempt)",
          "Plan your breath — where, how much, and how you'll end",
          "Record the same phrase again (second attempt)",
          "Compare Attempt 1 and Attempt 2",
        ],
        questions: [
          "Did planning the breath help?",
          "Did I take too much breath?",
          "Did I run out of breath?",
          "Did I rush any words?",
          "Where is my most comfortable breathing point?",
          "What is one thing I want to improve?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 12 (interactive) ---------- */
  const pitchStabilityClass = {
    number: 12, title: "Pitch Stability", category: "Pitch", skillTag: "pitch",
    difficulty: "Beginner", estMinutes: 40,
    // Rendered by the interactive lesson in js/lessons/pitchStability.js
    interactive: "pitch-stability",
    subtitle: "Find the note — then learn to stay with it.",
    description: "An interactive lesson: the difference between matching a note and staying with it — listening first, then looking at an estimated pitch trace, with gentle, comfortable control.",
    content: {
      whatYoullLearn: "The difference between pitch matching and pitch stability: hearing a steady reference, matching it, holding it comfortably for a few seconds, noticing when your voice moves away, and trying again — on one note, on different vowels, with a comfortable breath and across three nearby notes.",
      whyItMatters: "Reaching the right note is only the beginning. Melodies sound in tune when each note stays reasonably close to where it should be. Learning to notice unwanted movement — with your ears first — is the foundation for singing melodies accurately.",
      theory: "A sung note naturally moves a little; stable does not mean perfectly flat. Unwanted movement can drift slightly sharp (higher), slightly flat (lower) or wobble. It often comes from an unfamiliar note, hard-to-hear reference, breath running low, tension, singing too loudly or holding too long — so the gentle fixes are shorter notes, comfortable volume and a natural breath, never squeezing or forcing.",
      guidedPractice: [
        "Listened to a steady reference, matched and stopped, held a note comfortably, judged stability by ear before seeing an estimated pitch trace, corrected a second attempt, compared vowels, connected breath and pitch, and stabilised three nearby notes and a short 1-2-3-2-1 pattern.",
      ],
      assignment: {
        // The three recordings live in the lesson; these are the parts and the reflection questions
        instructions: [
          "Attempt 1 — play the reference, sing the note comfortably, record, listen back",
          "Attempt 2 — play the reference again, sing the same note relaxed and stable, record",
          "Three-note pattern — 1 → 2 → 3 → 2 → 1 from a comfortable starting pitch, record",
        ],
        questions: [
          "Could I match the reference?",
          "Did my pitch move?",
          "Could I hear the movement?",
          "Did my pitch become less stable near the end?",
          "Did I become tense?",
          "Was Attempt 2 easier?",
          "Which note or part was hardest?",
          "What will I focus on next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 13 (interactive) ---------- */
  const smoothTransitionsClass = {
    number: 13, title: "Smooth Note Transitions", category: "Pitch", skillTag: "pitch",
    difficulty: "Beginner", estMinutes: 40,
    // Rendered by the interactive lesson in js/lessons/smoothNoteTransitions.js
    interactive: "smooth-note-transitions",
    subtitle: "Move between notes without losing control.",
    description: "An interactive lesson: controlled movement from one note to another — hearing, matching, then connecting nearby notes, ascending and descending, with rhythm and breath, and gently further apart.",
    content: {
      whatYoullLearn: "How to move smoothly between nearby notes instead of jumping or sliding too far — hearing which note is higher or lower, matching each note on its own, then connecting them ascending and descending, in time with a metronome, on a comfortable breath, and across a slightly larger step.",
      whyItMatters: "A melody is made of individual notes, but good singing also requires controlled movement between those notes. Matching a note (Class 4) and staying with it (Class 12) are the foundation; this is the first step toward connecting them into a melody.",
      theory: "Smooth does not mean slow — a transition can be quick and clean or slow and controlled. A clean transition moves from the first note toward the second, arrives, and briefly stabilises, without a sudden jump, an overshoot, or losing the pitch along the way. Small, nearby intervals come first; wider steps wait until the small ones feel comfortable.",
      guidedPractice: [
        "Listened to two notes and judged direction, matched each note on its own, connected them smoothly, then practised ascending and descending runs, a three-note movement, a slightly wider skip, a transition in time with the metronome, and a transition on a comfortable breath.",
      ],
      assignment: {
        // The three attempts live in the lesson; these are the reflection prompts
        instructions: [
          "Choose three comfortable nearby notes (e.g. 1 → 2 → 3 → 2 → 1)",
          "Attempt 1 — listen to the reference, record naturally",
          "Attempt 2 — repeat, focusing on smooth movement, relaxation and accurate arrival",
          "Attempt 3 — add the metronome and sing the same pattern in time",
        ],
        questions: [
          "Which transition was easiest?",
          "Which transition was hardest?",
          "Was ascending easier?",
          "Was descending easier?",
          "Did I overshoot any note?",
          "Did I arrive below the note?",
          "Did I become tense?",
          "Did the metronome make the exercise harder?",
          "What do I want to improve?",
        ]
      }
    }
  };

  /* ---------- Level 1, Classes 14–20 (not written yet) ---------- */
  const level1Upcoming = [
    { title: "Basic Dynamics", category: "Vocal Technique", skillTag: "vocal", goal: "Soft/loud control",
      learn: "Comfortable soft and louder singing, and gentle changes between them, without forcing." },
    { title: "Diction & Pronunciation", category: "Vocal Technique", skillTag: "vocal", goal: "Make words clearer",
      learn: "Clear vowels and consonants while singing, so words are easy to understand." },
    { title: "Basic Scale Patterns", category: "Pitch", skillTag: "pitch", goal: "Develop pitch coordination",
      learn: "Simple scale patterns at a comfortable pitch, to coordinate the ear and the voice." },
    { title: "Simple Melodic Phrases", category: "Pitch", skillTag: "pitch", goal: "Combine pitch + rhythm",
      learn: "Short melodies that combine the right notes with the right timing." },
    { title: "Singing a Simple Song", category: "Vocal Foundation", skillTag: "vocal", goal: "Apply the fundamentals",
      learn: "Bringing pitch, rhythm, breath and control together in one simple song." },
    { title: "Self-Evaluation", category: "Ear Training", skillTag: "ear", goal: "Learn to critically listen",
      learn: "Listening back to your own singing honestly and choosing what to work on next." },
    { title: "Level 1 Progress Recording", category: "Recording", skillTag: "recording", goal: "Measure foundation progress",
      learn: "A second structured recording, compared with your Class 10 baseline, to hear how far your foundation has come." },
  ].map((c, i) => ({
    number: 14 + i, title: c.title, category: c.category, skillTag: c.skillTag,
    difficulty: "Beginner", estMinutes: 35,
    comingSoon: true, // no lesson content yet — can be viewed but not completed (see Store.completeClass)
    description: `Coming soon: ${c.goal.charAt(0).toLowerCase()}${c.goal.slice(1)}.`,
    content: {
      whatYoullLearn: c.learn,
      whyItMatters: "Content is released gradually so each skill builds on the foundations before it.",
      theory: "Coming soon.",
      guidedPractice: [],
      assignment: { instructions: [], questions: [] }
    }
  }));

  /* ---------- Placeholder classes for Levels 2–8 ---------- */
  function placeholderLevel(levelId, category, skillTag, titles, difficulty, startNumber = 1) {
    return titles.map((title, i) => ({
      number: startNumber + i,
      title,
      category,
      skillTag,
      difficulty,
      estMinutes: 30,
      comingSoon: true, // no lesson content yet — can be viewed but not completed (see Store.completeClass)
      description: `Unlocks once Level ${levelId - 1} is complete.`,
      content: {
        whatYoullLearn: "This lesson will unlock as you progress through the curriculum.",
        whyItMatters: "Content is released gradually so advanced techniques are never introduced before their foundations are ready.",
        theory: "Coming soon.",
        guidedPractice: [],
        assignment: { instructions: [], questions: [] }
      }
    }));
  }

  const levelClassDefs = {
    2: { category: "Vocal Technique", skillTag: "vocal", difficulty: "Beginner–Intermediate",
      titles: ["Vocal Placement", "Resonance", "Chest Voice", "Head Voice", "Mixed Voice", "Vocal Range", "Dynamics", "Expression", "Phrasing", "First Performance Assessment"] },
    3: { category: "Music Theory", skillTag: "theory", difficulty: "Intermediate",
      titles: ["Music Theory Basics", "Keyboard Fundamentals", "Scales", "Intervals", "Chords", "Harmony", "Rhythm for Musicians", "Melody Writing"] },
    4: { category: "Recording", skillTag: "recording", difficulty: "Intermediate",
      titles: ["Microphone Technique", "Recording Fundamentals", "Editing Basics", "Comping Takes", "Pitch Correction", "Vocal Production"] },
    5: { category: "Production", skillTag: "recording", difficulty: "Intermediate",
      titles: ["Songwriting Fundamentals", "Arrangement Basics", "Instrumentation Choices", "Sound Selection", "Production Workflow"] },
    6: { category: "Mixing", skillTag: "mixing", difficulty: "Advanced",
      titles: ["EQ Fundamentals", "Compression Basics", "De-essing", "Saturation", "Reverb & Space", "Delay", "Automation", "Bus Processing", "Stereo Imaging"] },
    7: { category: "Mastering", skillTag: "mastering", difficulty: "Advanced",
      titles: ["Dynamics", "Loudness", "True Peak", "Limiting", "Stereo Processing", "Reference Tracks", "Streaming Preparation"] },
    8: { category: "Professional Practice", skillTag: "vocal", difficulty: "Professional",
      titles: ["Completing Full Songs", "Building a Portfolio", "Release Preparation", "Live Performance", "Artist Identity"] },
  };

  const CLASSES = [
    ...[...level1, breathPhraseClass, pitchStabilityClass, smoothTransitionsClass, ...level1Upcoming].map(c => ({ ...c, levelId: 1 })),
    ...Object.entries(levelClassDefs).flatMap(([levelId, def]) =>
      placeholderLevel(Number(levelId), def.category, def.skillTag, def.titles, def.difficulty, def.startNumber || 1)
        .map(c => ({ ...c, levelId: Number(levelId) }))
    ),
  ].map(c => ({ ...c, id: `L${c.levelId}C${String(c.number).padStart(2, "0")}` }));

  /* ---------- Resources: Mixing & Mastering learning area ---------- */
  const RESOURCE_TOPICS = [
    { group: "Recording", unlockLevel: 4, topics: [
      { title: "Recording", blurb: "Setting up a clean, consistent home recording chain." },
      { title: "Vocal Editing", blurb: "Comping takes, tuning timing, cleaning breaths." },
    ]},
    { group: "Mixing", unlockLevel: 6, topics: [
      { title: "EQ", blurb: "Shaping tone by boosting or cutting frequencies." },
      { title: "Compression", blurb: "Controlling dynamic range for consistency and punch." },
      { title: "De-essing", blurb: "Taming harsh sibilance in vocal recordings." },
      { title: "Saturation", blurb: "Adding warmth and harmonic character." },
      { title: "Reverb", blurb: "Placing a voice inside a believable space." },
      { title: "Delay", blurb: "Rhythmic repeats that add depth and interest." },
      { title: "Automation", blurb: "Moving mix parameters over time for dynamics." },
      { title: "Bus Processing", blurb: "Treating groups of tracks together." },
      { title: "Stereo Image", blurb: "Controlling width and placement in the stereo field." },
      { title: "Mix Bus", blurb: "Gluing the whole mix together before mastering." },
    ]},
    { group: "Mastering", unlockLevel: 7, topics: [
      { title: "Mastering", blurb: "The final polish pass across a whole track." },
      { title: "Loudness", blurb: "Targeting perceived volume standards." },
      { title: "Limiting", blurb: "Controlling peaks while preserving punch." },
      { title: "True Peak", blurb: "Avoiding distortion after lossy encoding." },
      { title: "Reference Tracks", blurb: "Benchmarking your master against professional releases." },
      { title: "Streaming Master", blurb: "Preparing masters for Spotify, Apple Music & more." },
    ]},
  ];

  /* ---------- Before / After milestones ---------- */
  const MILESTONES = [
    { id: "day1", day: 1, label: "Starting Point" },
    { id: "day30", day: 30, label: "First Improvement" },
    { id: "day60", day: 60, label: "Better Pitch Control" },
    { id: "day100", day: 100, label: "More Vocal Control" },
    { id: "day180", day: 180, label: "First Professional Recording" },
  ];

  /* ---------- Sample project ---------- */
  const PROJECTS_SEED = [
    {
      id: "proj-1",
      title: "My First Original Song",
      startedAt: null,
      isOriginal: true,
      checklist: [
        { key: "lyrics", label: "Lyrics", done: false },
        { key: "melody", label: "Melody", done: false },
        { key: "chords", label: "Chords", done: false },
        { key: "arrangement", label: "Arrangement", done: false },
        { key: "vocalRecording", label: "Vocal Recording", done: false },
        { key: "vocalEditing", label: "Vocal Editing", done: false },
        { key: "mixing", label: "Mixing", done: false },
        { key: "mastering", label: "Mastering", done: false },
        { key: "finalExport", label: "Final Export", done: false },
      ],
    },
  ];

  /* ---------- Achievements ---------- */
  const ACHIEVEMENTS = [
    { id: "first-recording", icon: "🎤", title: "First Recording", desc: "Upload your first practice recording." },
    { id: "first-song", icon: "🎵", title: "First Complete Song", desc: "Finish every step of a project checklist." },
    { id: "ten-hours-listening", icon: "🎧", title: "10 Hours Listening Practice", desc: "Log 10 hours of ear-training practice." },
    { id: "ten-vocal-sessions", icon: "🎙️", title: "10 Vocal Sessions", desc: "Complete 10 days of vocal practice." },
    { id: "first-chord", icon: "🎹", title: "First Chord Progression", desc: "Complete your first Musician-level class." },
    { id: "first-mix", icon: "🎚️", title: "First Vocal Mix", desc: "Complete your first Mixing Engineer class." },
    { id: "first-master", icon: "🔊", title: "First Master", desc: "Complete your first Mastering Engineer class." },
    { id: "first-original", icon: "🎼", title: "First Original Song", desc: "Finish a project marked as an original song." },
    { id: "streak-30", icon: "🔥", title: "30-Day Practice Streak", desc: "Practice 30 days in a row." },
    { id: "all-classes", icon: "🏆", title: "Curriculum Complete", desc: "Complete every class across all eight levels." },
  ];

  /* ---------- Quotes ---------- */
  const QUOTES = [
    "Don't try to sound professional today. Try to become better than yesterday.",
    "Train your ears before you train your plugins.",
    "Consistency beats intensity.",
    "Every professional voice was once a beginner's voice, practiced daily.",
    "You can't fix what you haven't learned to hear.",
    "Progress is quiet. Show up anyway.",
    "The microphone doesn't lie — and that's exactly why it helps.",
    "Small, honest practice sessions compound into a career.",
  ];

  /* ---------- Practice tasks ---------- */
  const PRACTICE_TASKS = [
    { key: "warmup", label: "Warm-up", skillTag: "vocal" },
    { key: "pitch", label: "Pitch Training", skillTag: "pitch" },
    { key: "ear", label: "Ear Training", skillTag: "ear" },
    { key: "song", label: "Song Practice", skillTag: "vocal" },
    { key: "recording", label: "Recording Exercise", skillTag: "recording" },
  ];

  const SKILL_LABELS = {
    vocal: "Vocal Skills", pitch: "Pitch", rhythm: "Rhythm", ear: "Ear Training",
    theory: "Music Theory", recording: "Recording", mixing: "Mixing", mastering: "Mastering",
  };

  /* Classes that moved: old id -> new id. Store and ClassActivity carry a
     learner's progress, notes and practice across, but only while the old
     id is a comingSoon placeholder (so a future real class there is safe). */
  const LEGACY_CLASS_IDS = { L2C01: "L1C11" }; // Breath & Phrase Control: Level 2 Class 1 -> Level 1 Class 11

  return { LEVELS, CLASSES, LEGACY_CLASS_IDS, RESOURCE_TOPICS, MILESTONES, PROJECTS_SEED, ACHIEVEMENTS, QUOTES, PRACTICE_TASKS, SKILL_LABELS };
})();
