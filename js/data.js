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
      difficulty: "Beginner", estMinutes: 35,
      // Rendered by the interactive lesson in js/lessons/meetYourVoice.js
      interactive: "meet-your-voice",
      subtitle: "Before we try to improve your voice, let's learn to hear it.",
      description: "An interactive first lesson: listening, voice awareness and comfort — hear your environment, your speaking voice, a gentle hum, higher and lower notes, and your first recordings. No judgement, no scores.",
      content: {
        whatYoullLearn: "How to listen — to your surroundings, to your own speaking voice and humming, to higher and lower sounds — and how to record yourself and notice what you hear, without judging it.",
        whyItMatters: "The first skill of a singer isn't singing loudly or reaching high notes. It's listening. Everything you learn later — pitch, breath, control, recording — starts with being able to hear what your voice is doing.",
        theory: "Everyone's voice is different, and there is no requirement to sound like another singer. A recording often sounds different from the voice you hear inside your head — that's normal. Singing uses many of the same systems as speaking, and adds controlled pitch, rhythm and longer sounds.",
        guidedPractice: [
          "Checked in with how my voice feels, listened to the room, recorded my speaking voice, hummed gently, heard higher and lower notes, let my voice glide, tried a first pitch-matching preview, and compared speaking with singing.",
        ],
        assignment: {
          // Every part is evidence from the lesson (auto-ticked); the reflection questions follow
          instructions: [
            "Natural speaking recording",
            "Gentle humming",
            "Higher/lower listening exercise",
            "One pitch-matching attempt",
            "Listening-back exercise",
            "Personal reflection",
          ],
          questions: [
            "What surprised me about my voice?",
            "Was listening to myself comfortable or uncomfortable?",
            "Could I hear which note was higher?",
            "Could I hear whether my singing matched the reference?",
            "What do I want to learn first?",
          ]
        }
      }
    },
    {
      number: 2, title: "Comfortable Breathing for Singing", category: "Breath Support", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 30,
      // Rendered by the interactive lesson in js/lessons/comfortableBreathing.js
      interactive: "comfortable-breathing",
      subtitle: "Breathing for singing starts with comfort, not force.",
      description: "An interactive lesson: notice your natural breathing, breathe comfortably, and begin connecting breath with sound — hum, speech, a short phrase and one note. Never a lung-capacity workout.",
      content: {
        whatYoullLearn: "How to notice your natural breathing without changing it, take a comfortable (not big) breath, let the air out gently, and connect a comfortable breath to a hum, a spoken phrase, a short sung phrase and a single note — then rest.",
        whyItMatters: "We breathe automatically all day. Singing asks us to become more aware of when we breathe and how we use the breath while making sound. A comfortable breath leads to a comfortable voice; forcing the breath leads to tension.",
        theory: "Breathing for singing isn't about the biggest breath, the longest hold or the longest exhale. At this stage it's awareness, comfort and coordination: breath → voice → rest → normal breathing. Breath support is not holding the breath, pushing the stomach, forcing air or squeezing the throat; more advanced ideas come later, on top of this foundation.",
        guidedPractice: [
          "Observed natural breathing, let a few breaths come and go naturally, made a gentle “sss”, connected a comfortable breath to a hum, to speech, to a short sung phrase and to one note, noticed tension and shoulder movement without judging, and recorded breath + voice.",
        ],
        assignment: {
          // Every part is evidence from the lesson (auto-ticked); these questions are the reflection
          instructions: [
            "Natural breathing awareness",
            "Gentle exhale",
            "Breath + hum",
            "Breath + speech",
            "Short singing phrase",
            "Breath + pitch",
            "Recording playback",
            "Reflection",
          ],
          questions: [
            "Did I naturally hold my breath?",
            "Did I take larger breaths than necessary?",
            "Could I connect breath to sound comfortably?",
            "Did I notice tension anywhere?",
            "Did breathing feel easier when I stopped trying to control it?",
            "What will I remember from this class?",
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

  /* ---------- Level 1, Class 14 (interactive) ---------- */
  const basicDynamicsClass = {
    number: 14, title: "Basic Vocal Dynamics", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 40,
    // Rendered by the interactive lesson in js/lessons/basicVocalDynamics.js
    interactive: "basic-vocal-dynamics",
    subtitle: "Control how softly and strongly you sing — without losing pitch or comfort.",
    description: "An interactive lesson: singing the same note softly, at medium volume and a little stronger, moving gradually between them, and combining dynamics with pitch, transitions, rhythm, breath and a short melody — never by shouting or forcing.",
    content: {
      whatYoullLearn: "The difference between pitch (which note) and dynamics (how softly or strongly you sing it) — singing one note at a few comfortable volumes, moving gradually between them, a simple crescendo and decrescendo, and combining dynamics with everything learned so far: pitch stability, transitions, rhythm, breath and a short melody.",
      whyItMatters: "A beginner's instinct is often to sing louder to sound 'stronger' or 'better' — but volume and quality aren't the same thing, and pushing for volume is how tension and strain begin. Dynamics is simply another dimension of control, built the same careful way as pitch (Class 4), stability (Class 12) and transitions (Class 13).",
      theory: "'Stronger' does not mean louder at any cost — it means singing with a little more energy while staying comfortable and in tune. Dynamics sit on a spectrum (soft, medium, stronger), not a 0–100 score. If your pitch rises, your throat tightens, or your breath runs out when you sing stronger, you're pushing — not developing control.",
      guidedPractice: [
        "Listened to the same note at different volumes, sang it at three comfortable levels, moved gradually between soft and medium, practised a simple crescendo and decrescendo, then combined dynamics with pitch stability, note transitions, rhythm, breath and a short melody.",
      ],
      assignment: {
        instructions: [
          "Choose a comfortable note from the exercises above.",
          "Attempt 1 — medium volume, Attempt 2 — soft, Attempt 3 — slightly stronger (never shout).",
          "Crescendo (soft → medium → stronger → medium) and decrescendo (stronger → medium → soft), each on one comfortable breath.",
          "A short melody (1 → 2 → 3 → 2 → 1) sung with changing dynamics (soft → medium → stronger → medium → soft).",
        ],
        questions: [
          "Could I keep my pitch steady while my volume changed?",
          "Did my voice disappear or become breathy when I sang softly?",
          "Did I feel any tension when I sang stronger?",
          "Was the crescendo or the decrescendo easier?",
          "Did the melody with changing dynamics feel more expressive than a constant volume?",
          "Did I push, shout or force my voice at any point today?",
          "What do I want to focus on next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 15 (interactive) ---------- */
  const dictionClass = {
    number: 15, title: "Diction & Pronunciation", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 40,
    // Rendered by the interactive lesson in js/lessons/dictionPronunciation.js
    interactive: "diction-pronunciation",
    subtitle: "Let the listener hear the words you're singing.",
    description: "An interactive lesson: sing the words clearly without losing the music — vowels, consonants, word endings and lyric clarity, combined with pitch, rhythm, breath and dynamics. Clear, natural, musical — never exaggerated.",
    content: {
      whatYoullLearn: "How to keep vowels and consonants clear, finish the ends of words, and keep lyrics understandable while you also manage pitch, rhythm, breath and dynamics — building from speaking, to rhythm, to singing.",
      whyItMatters: "A singer isn't only producing notes — a singer is communicating words and meaning. A technically correct note can still be hard to understand if the words are unclear.",
      theory: "Clear does not mean exaggerated. Common beginner problems are swallowed words, missing consonants, unclear vowels, dropped word endings, rushing through words, vowels changing with pitch — and over-pronouncing everything. The goal is clear, natural and musical. Your accent is not a mistake: the aim is understandability and consistency, not one 'correct' accent.",
      guidedPractice: [
        "Spoke and sang lyric phrases, explored AH/EH/EE/OH/OO on a comfortable note, clear consonants and syllables, word endings, speak → rhythm → sing, lyric clarity, and diction combined with pitch, breath and dynamics — then compared my own versions.",
      ],
      assignment: {
        // The four attempts live in the lesson; these are the questions answered afterwards
        instructions: [
          "Attempt 1 — speak it naturally",
          "Attempt 2 — speak it rhythmically",
          "Attempt 3 — sing it slowly",
          "Attempt 4 — sing it at normal speed",
        ],
        questions: [
          "Which word was least clear?",
          "Did I lose any consonants?",
          "Did I lose any word endings?",
          "Did my vowels remain clear?",
          "Did focusing on diction affect my pitch?",
          "Did focusing on pitch affect my pronunciation?",
          "Did I over-pronounce anything?",
          "What should I improve next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 16 (interactive) ---------- */
  const singingPhrasesClass = {
    number: 16, title: "Singing Simple Phrases", category: "Vocal Foundation", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 45,
    // Rendered by the interactive lesson in js/lessons/singingSimplePhrases.js
    interactive: "singing-simple-phrases",
    subtitle: "Now let's put the pieces together.",
    description: "An interactive lesson: the first major integration point — combining pitch, rhythm, breath, note transitions, dynamics, diction and listening into one short musical phrase. The objective is not perfection — it's coordination.",
    content: {
      whatYoullLearn: "How to build a short phrase step by step — speaking it, finding its rhythm, learning its melody, humming it, singing it on one vowel, then adding the words — and how to combine pitch, rhythm, breath, transitions, dynamics and diction into one connected musical thought, one focus at a time.",
      whyItMatters: "Until now, most exercises focused on one skill at a time. A real musical phrase asks for several of them at once. Trying to fix everything simultaneously overwhelms a beginner — choosing one main focus per attempt (pitch, then rhythm, then words, then expression) makes the combination manageable.",
      theory: "A phrase has a beginning, a middle and an ending, each with its own common problems: starting too loudly, softly or tensely; losing pitch or rhythm partway through; dropping the final word or note. Reviewing a recording works best one lens at a time — pitch, rhythm, breath, diction, transitions, dynamics, comfort — rather than judging everything at once.",
      guidedPractice: [
        "Spoke the phrase, found its rhythm with the metronome, learned its melody, hummed it, sang it on one vowel, added the words, chose a breath point, practised its beginning/middle/ending separately, sang it complete, reviewed it one skill at a time, then added dynamics, diction focus and simple emotional meaning.",
      ],
      assignment: {
        // The six attempts live in the lesson; these are the questions answered afterwards
        instructions: [
          "Attempt 1 — hum the melody",
          "Attempt 2 — sing the melody on one vowel",
          "Attempt 3 — sing with the lyrics",
          "Attempt 4 — sing with the lyrics and rhythm",
          "Attempt 5 — sing with the lyrics, rhythm and gentle dynamics",
          "Attempt 6 — a final, natural performance",
        ],
        questions: [
          "Which version felt easiest?",
          "Did adding lyrics affect my pitch?",
          "Did rhythm affect my pitch?",
          "Did I lose breath near the end?",
          "Which word was unclear?",
          "Which note was difficult?",
          "Did my transitions feel smooth?",
          "Did dynamics improve the phrase?",
          "Did thinking about emotion help or distract me?",
          "What should I practice next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 17 (interactive) ---------- */
  const connectingPhrasesClass = {
    number: 17, title: "Connecting Phrases", category: "Vocal Foundation", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 45,
    // Rendered by the interactive lesson in js/lessons/connectingPhrases.js
    interactive: "connecting-phrases",
    subtitle: "Turn separate phrases into one musical thought.",
    description: "An interactive lesson: finishing one phrase, breathing comfortably, and beginning the next without losing pitch, rhythm or meaning — the second major integration point, building directly on Class 16's single phrase.",
    content: {
      whatYoullLearn: "How to connect two (and then three) short phrases into one continuous musical thought — identifying where a phrase ends, breathing without rushing, beginning the next phrase smoothly, and keeping pitch, rhythm, words and dynamics connected across the breath.",
      whyItMatters: "A song is rarely one continuous line — it's made of phrase after phrase. The listener should still feel the phrases belong together. Class 16 built a single phrase; this is the first time two of them have to connect.",
      theory: "A good phrase connection needs four moments: finish, recover, prepare, begin. Rushing, holding the breath, or taking an oversized breath all break the connection just as much as a long awkward silence does. Breathing is part of the musical sentence, not an interruption of it.",
      guidedPractice: [
        "Identified where a phrase ends, spoke then hummed two phrases with a breath between them, practised the ending and the beginning separately, then combined them — and connected pitch, rhythm, diction, dynamics and simple expression across the breath, before trying a third phrase.",
      ],
      assignment: {
        // The six attempts live in the lesson; these are the questions answered afterwards
        instructions: [
          "Attempt 1 — hum both phrases",
          "Attempt 2 — sing the melody using one vowel",
          "Attempt 3 — add the lyrics",
          "Attempt 4 — focus on comfortable breathing between phrases",
          "Attempt 5 — focus on a smooth phrase connection",
          "Attempt 6 — a natural final performance",
        ],
        questions: [
          "Did I rush between phrases?",
          "Was my breath comfortable?",
          "Did the second phrase begin at the correct pitch?",
          "Did I maintain the rhythm?",
          "Were the words clear?",
          "Did the phrase connection feel natural?",
          "Did the second phrase lose energy?",
          "Which transition needs the most practice?",
        ]
      }
    }
  };

  /* ---------- Level 1, Classes 18–20 (not written yet) ---------- */
  /* ---------- Level 1, Class 18 (interactive) ---------- */
  const musicalPhrasingClass = {
    number: 18, title: "Musical Phrasing & Line Shape", category: "Vocal Foundation", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 45,
    // Rendered by the interactive lesson in js/lessons/musicalPhrasing.js
    interactive: "musical-phrasing",
    subtitle: "Make the listener feel where the phrase is going.",
    description: "An interactive lesson: singing is not NOTE → NOTE → NOTE → NOTE, it's BEGINNING → DEVELOPMENT → DIRECTION → DESTINATION. Finding a phrase's peak, building gently toward it, and releasing afterward — without forcing volume.",
    content: {
      whatYoullLearn: "How to give a short phrase musical direction — tracing its melodic shape, finding its peak (the moment that feels most important), building gently toward it and releasing afterward, and connecting that shape with dynamics, breath and word emphasis, without forcing volume anywhere.",
      whyItMatters: "Two singers can sing the same notes correctly, and still sound different — one flat and mechanical, the other musical. The difference is usually phrasing: where the phrase begins, grows, peaks, relaxes and finishes.",
      theory: "“Musical shape does not mean singing louder all the time.” A phrase can have direction through pitch, rhythm, dynamics, vowel emphasis, timing, breath and articulation — not only volume. A gentle, subtle build toward a phrase's peak, followed by a release, is enough; this class does not require advanced interpretation.",
      guidedPractice: [
        "Listened for a melody's destination and traced its shape, hummed and sang it on one vowel, found its peak and sang toward it, compared a flat version with a shaped one, connected dynamics, breath and word emphasis to the shape, then built a complete beginning → peak → ending phrase and practised focusing on one element at a time.",
      ],
      assignment: {
        // The six takes live in the lesson; these are the questions answered afterwards
        instructions: [
          "Take 1 — sing naturally",
          "Take 2 — identify the phrase peak",
          "Take 3 — sing toward the peak",
          "Take 4 — add gentle dynamics",
          "Take 5 — focus on the meaning of the words",
          "Take 6 — a final natural performance",
        ],
        questions: [
          "Where was the phrase peak?",
          "Did I naturally build toward it?",
          "Did I make it too loud?",
          "Did I lose pitch while shaping the phrase?",
          "Did my breathing support the phrase?",
          "Were the important words clear?",
          "Did the ending feel complete?",
          "Did the phrase sound more musical after shaping it?",
          "What single thing should I improve next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Classes 19–20 (not written yet) ---------- */
  /* ---------- Level 1, Class 19 (interactive) ---------- */
  const melodicPatternsClass = {
    number: 19, title: "Melodic Patterns & Vocal Consistency", category: "Pitch", skillTag: "pitch",
    difficulty: "Beginner", estMinutes: 45,
    // Rendered by the interactive lesson in js/lessons/melodicPatterns.js
    interactive: "melodic-patterns",
    subtitle: "Can you sing it the same way twice?",
    description: "An interactive lesson: short melodic patterns, sung and then repeated — pitch, rhythm, vowel and tone consistency, pattern memory, and comparing takes honestly. Being able to sing something once is useful; repeating it consistently is a skill.",
    content: {
      whatYoullLearn: "How to hear and repeat short melodic patterns consistently — matching pitch, rhythm, vowel and tone across repeated attempts, remembering a short pattern by ear, recognizing that a transposed pattern is the same shape on a different starting note, and comparing takes honestly without a fake score.",
      whyItMatters: "Professional singing requires repeatability. If a phrase is correct once but changes every time, control is still developing — a simple pattern sung consistently is more valuable than a difficult one sung inconsistently.",
      theory: "“Consistency comes before complexity.” Patterns here stay very short and comfortable — no difficult scales, no extreme notes, no added difficulty for its own sake. Perform → listen → identify → adjust → repeat, always listening before correcting rather than blindly repeating.",
      guidedPractice: [
        "Listened to and hummed two- and three-note patterns, repeated them and compared pitch, rhythm, vowel and tone consistency across attempts, tried a pattern from memory and transposed to a new starting note, connected pattern consistency to phrase shape and dynamics, then ran a three-take challenge and expanded a pattern into a short phrase.",
      ],
      assignment: {
        // The six takes live in the lesson; these are the questions answered afterwards
        instructions: [
          "Take 1 — listen and sing",
          "Take 2 — repeat without changing the pattern",
          "Take 3 — listen to both recordings",
          "Take 4 — identify ONE difference",
          "Take 5 — correct only that difference",
          "Take 6 — record the pattern naturally",
        ],
        questions: [
          "Was I able to remember the pattern?",
          "Did I start on the correct pitch?",
          "Did my pitch remain stable?",
          "Did my rhythm remain consistent?",
          "Did my tone change noticeably?",
          "Did my vowels affect the sound?",
          "Was my second attempt better than my first?",
          "What was the biggest difference between my attempts?",
          "What should I practice next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 20 (interactive) ---------- */
  const melodicMovementClass = {
    number: 20, title: "Melodic Movement & Controlled Range", category: "Pitch", skillTag: "pitch",
    difficulty: "Beginner", estMinutes: 45,
    // Rendered by the interactive lesson in js/lessons/melodicMovement.js
    interactive: "melodic-movement",
    subtitle: "Move between notes without forcing your voice.",
    description: "An interactive lesson: controlled melodic movement — ascending, descending, small intervals, matching a destination note, and a comfortable-area exploration. Not a vocal-range competition. Comfort first — range comes later.",
    content: {
      whatYoullLearn: "How to move between notes comfortably — ascending, descending, small intervals vs. larger skips, matching a destination note, connecting two notes smoothly, and exploring your comfortable singing area for today without chasing a highest or lowest note.",
      whyItMatters: "Singing is movement — up, down, across, between notes. A smaller range with good control is more valuable at this stage than a large, forced one. Your range is not a number to chase; your control is more important than your highest note.",
      theory: "“Comfort first. Range comes later.” Never push to reach a note, never increase volume to reach a higher one, never force the throat. If a note feels uncomfortable, stop and move the exercise into a comfortable range — today's comfortable area may change from day to day, and that's normal.",
      guidedPractice: [
        "Listened to and hummed upward and downward movement, explored small intervals and step vs. skip, matched a destination note, connected two notes smoothly, explored a comfortable range without labelling it permanent, connected movement to dynamics, rhythm and phrase shape, then recorded three takes and identified one difficult movement to practise slowly.",
      ],
      assignment: {
        // The six takes live in the lesson; these are the questions answered afterwards
        instructions: [
          "Take 1 — hum the pattern",
          "Take 2 — sing it on \"AH\"",
          "Take 3 — sing it on \"OO\"",
          "Take 4 — sing it with simple lyrics",
          "Take 5 — focus on smooth movement",
          "Take 6 — focus on comfort and relaxed singing",
        ],
        questions: [
          "Was ascending comfortable?",
          "Was descending comfortable?",
          "Which note was hardest?",
          "Did I push any note?",
          "Did my volume change unintentionally?",
          "Did I maintain pitch?",
          "Did I maintain rhythm?",
          "Did the movement feel connected?",
          "What is my comfortable area today?",
          "What single movement should I practice next?",
        ]
      }
    }
  };

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
    // Classes 1 "Voice Placement", 2 "Resonance", 3 "Chest Voice Foundations" and 4 "Head Voice
    // Foundations" are now real, authored classes (voicePlacementClass, resonanceClass,
    // chestVoiceFoundationsClass, headVoiceFoundationsClass below) — these remaining 6 stay
    // comingSoon placeholders, numbered 5-10 via startNumber.
    2: { category: "Vocal Technique", skillTag: "vocal", difficulty: "Beginner–Intermediate", startNumber: 5,
      titles: ["Mixed Voice", "Vocal Range", "Dynamics", "Expression", "Phrasing", "First Performance Assessment"] },
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

  /* ---------- Level 1, Class 21 (interactive) ---------- */
  const vocalCoordinationClass = {
    number: 21, title: "Vocal Coordination & Longer Melodic Patterns", category: "Pitch", skillTag: "pitch",
    difficulty: "Beginner", estMinutes: 50,
    // Rendered by the interactive lesson in js/lessons/vocalCoordination.js
    interactive: "vocal-coordination",
    subtitle: "Keep everything connected as the melody gets longer.",
    description: "An interactive lesson: keeping pitch, rhythm, breath, movement, diction and relaxation working together as a melodic pattern grows longer. The challenge is not speed — it's coordination. \"Longer does not mean harder.\"",
    content: {
      whatYoullLearn: "How to keep several singing skills working together as a melody gets longer — breaking a longer pattern into smaller groups, maintaining pitch and rhythm together, adding vowels, syllables and words without losing stability, managing breath at sensible points, keeping one musical phrase shape, and practising only the one section that needs it instead of repeating the whole pattern.",
      whyItMatters: "Good singing is not one skill — it's many small skills (pitch, rhythm, breath, movement, words, relaxation, phrase shape) working together without fighting each other. A longer melody is where that coordination is first really tested.",
      theory: "\"Longer does not mean harder.\" The number of notes increases gradually — never by pushing the voice, raising volume, reaching for extreme notes, singing faster, or practising until tired. When a pattern feels difficult: slow it down, shorten it, or return to a comfortable range. \"Accuracy first. Speed later.\"",
      guidedPractice: [
        "Learned and grouped a longer 5–7 note pattern, combined it with rhythm, vowels, syllables and simple words, managed breath at sensible points, kept one phrase shape and gentle dynamics across it, reviewed pitch consistency and tone across repeated takes, practised slow to normal speed, tried it from memory, turned the pattern into a short musical phrase, then identified and practised the one weakest section.",
      ],
      assignment: {
        // The seven takes live in the lesson; these are the questions answered afterwards
        instructions: [
          "Take 1 — hum the pattern",
          "Take 2 — sing it on \"AH\"",
          "Take 3 — sing it using simple syllables",
          "Take 4 — add lyrics",
          "Take 5 — focus on pitch consistency",
          "Take 6 — focus on smooth movement",
          "Take 7 — a final natural performance",
        ],
        questions: [
          "Did I remember the pattern?",
          "Where did I lose accuracy?",
          "Did my pitch change when I added words?",
          "Did my rhythm remain stable?",
          "Did I breathe comfortably?",
          "Did I become tense anywhere?",
          "Did my phrase maintain direction?",
          "Which section needs isolated practice?",
          "Was the final attempt better than the first?",
          "What should I focus on next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 22 (interactive) ---------- */
  const vocalAgilityClass = {
    number: 22, title: "Vocal Agility Foundations", category: "Pitch", skillTag: "pitch",
    difficulty: "Beginner", estMinutes: 50,
    // Rendered by the interactive lesson in js/lessons/vocalAgility.js
    interactive: "vocal-agility",
    subtitle: "Move lightly. Stay accurate. Don't rush.",
    description: "An interactive lesson: the first introduction to vocal agility — moving between notes lightly, clearly and accurately. Not speed. Accuracy → Coordination → Speed, never reversed.",
    content: {
      whatYoullLearn: "How to move between notes cleanly and lightly — two- and three-note movements, repeated-note patterns, syllable and vowel agility, clean note changes without sliding or pushing, a small repeatable \"melodic cell,\" and how to build speed only once coordination is reliable, never before.",
      whyItMatters: "Vocal agility is not the same as singing fast. Before fast runs, a singer needs clean note changes, accurate pitch, light articulation, relaxed movement and stable rhythm — the coordination this class establishes for later.",
      theory: "\"Agility does not mean singing fast.\" It means moving accurately, efficiently, cleanly, relaxed, and in rhythm. Slow and accurate is always better practice than fast and inaccurate. \"Accuracy → Coordination → Speed\" — never reversed. If accuracy decreases, return to the slower level; speed is never the goal in itself.",
      guidedPractice: [
        "Practised two- and three-note movements, repeated-note patterns, syllables and vowels on a short pattern, clean note changes and light movement, a slow-practice ladder with the metronome, a small melodic cell with rhythm, connected the cell into a short phrase with breath and dynamics, then recorded three takes at different speeds and identified one problem to return to slowly.",
      ],
      assignment: {
        // The seven takes live in the lesson; these are the questions answered afterwards
        instructions: [
          "Take 1 — hum slowly",
          "Take 2 — sing on \"LA\"",
          "Take 3 — sing on \"DA\"",
          "Take 4 — sing on \"AH\"",
          "Take 5 — use a metronome",
          "Take 6 — slightly faster, only if accurate and comfortable",
          "Take 7 — sing it naturally",
        ],
        questions: [
          "Which speed was most accurate?",
          "Did my pitch remain stable?",
          "Did my articulation remain clear?",
          "Did my jaw remain relaxed?",
          "Did my throat remain comfortable?",
          "Did I maintain rhythm?",
          "Did I lose accuracy when increasing speed?",
          "Which syllable was easiest?",
          "Which syllable was hardest?",
          "What should I practice next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 23 (interactive) ---------- */
  const registerAwarenessClass = {
    number: 23, title: "Register Awareness & Voice Connection", category: "Pitch", skillTag: "pitch",
    difficulty: "Beginner", estMinutes: 50,
    // Rendered by the interactive lesson in js/lessons/registerAwareness.js
    interactive: "register-awareness",
    subtitle: "Notice the changes. Connect them gently.",
    description: "An interactive lesson: how the voice can feel different across its range, and learning to move between comfortable areas smoothly. Awareness, not classification — not a search for a permanent voice type, and never forced.",
    content: {
      whatYoullLearn: "How to notice that your voice can feel different in different parts of your range — vibration, resonance, volume, tone, effort, breath sensation — and how to move through those areas, and any transition between them, gently and without forcing. Lower, middle and upper are used only as descriptive, non-permanent areas for this exploration.",
      whyItMatters: "You cannot improve something you cannot notice. Before any register technique is appropriate, a beginner needs to notice how their voice actually feels across its comfortable range — and learn that a transition that feels unstable is fixed by reducing range and slowing down, never by pushing harder.",
      theory: "\"Awareness before control.\" LISTEN → NOTICE → EXPLORE → CONNECT. This class never assigns a permanent voice classification, never calls an endpoint your \"highest note,\" and never labels every change a \"vocal break.\" If a transition feels unstable: reduce the range, lower the volume, slow down, return to humming — never push, tighten the throat, lift the chin, or force one area's sound onto another.",
      guidedPractice: [
        "Explored a comfortable range and noticed any change in sensation, glided gently between areas, connected two and three notes smoothly, tried ng→ah and hum→vowel transitions, moved slightly lower and slightly higher from a comfortable note, listened for any noticeable change without forcing a fix, connected notes without relying on sliding, added rhythm, dynamics and simple words to the pattern, then recorded a transition a few different ways and mapped today's comfort zone.",
      ],
      assignment: {
        // The five takes live in the lesson; these are the questions answered afterwards
        instructions: [
          "Take 1 — hum",
          "Take 2 — sing on \"OO\"",
          "Take 3 — sing on \"AH\"",
          "Take 4 — sing with simple words",
          "Take 5 — repeat softly",
        ],
        questions: [
          "Did my voice feel different as the pitch changed?",
          "Where did I notice the biggest change?",
          "Did I notice a break?",
          "Was ascending comfortable?",
          "Was descending comfortable?",
          "Did I push anywhere?",
          "Did humming feel easier?",
          "Did adding words change the transition?",
          "Which area feels most comfortable today?",
          "What transition should I practice next?",
        ]
      }
    }
  };

  /* ---------- Level 1, Class 24 (interactive) ---------- */
  const singingCompleteSongClass = {
    number: 24, title: "Singing a Complete Simple Song", category: "Performance", skillTag: "song",
    difficulty: "Beginner", estMinutes: 60,
    // Rendered by the interactive lesson in js/lessons/singingCompleteSong.js
    interactive: "singing-complete-song",
    subtitle: "Bring everything together. One song, one connected musical experience.",
    description: "An interactive lesson: combining pitch, rhythm, breath, diction, transitions, phrasing and dynamics to sing a short, complete, original practice song. The goal is not perfection — it's a complete, manageable performance that notices what works and what needs more practice.",
    content: {
      whatYoullLearn: "How to prepare and sing a complete simple song by combining pitch accuracy, rhythm and timing, comfortable breathing, diction and pronunciation, smooth note transitions, phrase connection, basic dynamics, musical expression, and self-listening — all the skills practiced individually across Classes 1–23, now coordinated together.",
      whyItMatters: "A song is not merely a sequence of correct notes. It has phrases, breathing points, rhythm, words, dynamics and emotional direction. You don't need to master every skill before singing a song — you learn to coordinate them by practicing music in manageable steps.",
      theory: "LISTEN → LEARN → BREAK DOWN → PRACTICE → CONNECT → PERFORM → REVIEW. Learn a short song in small sections, master each one before connecting it to the next, and bring pitch, rhythm, breath, diction, transitions and dynamics together gradually rather than all at once.",
      guidedPractice: [
        "Chose a practice song, listened to the reference without singing, learned it in small sections, matched the starting note, practiced the rhythm before the lyrics, planned comfortable breathing points, worked on diction, practiced a smooth transition and connected the phrases, added simple dynamics, sang the complete song in a chosen mode, recorded three takes, listened back and compared them, chose one area for targeted correction, then recorded a final performance.",
      ],
      assignment: {
        // The checklist and both recordings live in the lesson; these mirror the spec's 10-step list
        instructions: [
          "Listen to the reference.",
          "Practice the melody in small sections.",
          "Practice the rhythm.",
          "Identify comfortable breathing points.",
          "Sing the sections with words.",
          "Connect the sections.",
          "Record a natural first attempt.",
          "Identify one area to improve.",
          "Practice that area separately.",
          "Record a final complete attempt.",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 1, Class 25 (interactive) ---------- */
  const foundationFinalAssessmentClass = {
    number: 25, title: "Foundation Final Assessment & Progress Recording", category: "Performance", skillTag: "song",
    difficulty: "Beginner", estMinutes: 60,
    // Rendered by the interactive lesson in js/lessons/foundationFinalAssessment.js
    interactive: "foundation-final-assessment",
    subtitle: "Review your journey, listen to your progress, and plan your next step.",
    description: "An interactive lesson: the final class of the Foundation level. Not an audition — an opportunity to listen to yourself, recognize your progress, and understand what deserves more practice, then record a comfortable performance and plan a practical next step.",
    content: {
      whatYoullLearn: "How to review the essential skills from Classes 1–24, record a comfortable final performance, listen critically without judging yourself harshly, compare it with your Class 10 baseline if you have one, identify specific strengths and growth areas, and decide — honestly, not automatically — whether to keep strengthening the Foundation or begin Level 2.",
      whyItMatters: "Your voice does not need to be perfect for your progress to matter. A real, honest look at where you are now — not a score, not a ranking — is what makes the next step of practice useful instead of guesswork.",
      theory: "LISTEN → RECORD → COMPARE → REFLECT → PLAN. Self-observation, not professional diagnosis. Completing a class doesn't automatically mean a skill is mastered — this class asks the learner to notice for themselves.",
      guidedPractice: [
        "Reviewed the Foundation skills honestly, recorded a natural performance and a focused-improvement take, compared today's recording with the Class 10 baseline where available, completed a personal self-assessment, identified strengths and growth areas, reviewed an honest progress summary, and chose a recommended next step.",
      ],
      assignment: {
        instructions: [
          "Take 1 — natural performance",
          "Take 2 — focused improvement",
          "Take 3 — optional final take",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 1 (interactive) ---------- */
  const voicePlacementClass = {
    number: 1, title: "Voice Placement", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/voicePlacement.js
    interactive: "voice-placement",
    subtitle: "Discover a comfortable, clear, and easy way to begin shaping your singing tone.",
    description: "An interactive lesson: voice placement as a teaching concept for exploring vocal sensation and sound — not a literal instruction to move the voice into a body part. Gentle humming, vowel and pitch exploration at an easy, comfortable volume.",
    content: {
      whatYoullLearn: "How to explain voice placement in beginner-friendly language, recognize comfortable versus forced sound production, explore a few gentle vocal exercises at an easy pitch and volume, listen to how small changes affect vocal tone, and record observations about what feels easy, clear or uncomfortable.",
      whyItMatters: "Singers experience sensations differently, and the sound heard, ease of production, and absence of strain matter more than forcing a particular sensation. Noticing this honestly, without chasing a specific feeling, is what prepares a beginner for resonance work in the next class.",
      theory: "Voice placement is a way of exploring the perceived focus and quality of vocal sound. The sound we hear is affected by vocal-fold vibration and the shape of the vocal tract — throat, mouth and tongue. Vibration sensations around the lips, face or chest may occur, but they are not reliable standalone proof of correct technique. A comfortable tone does not need to be loud.",
      guidedPractice: [
        "Checked in with how my speaking voice felt, explored an easy hum, spoke into a gentle hum, explored three vowels without pushing the sound, tried a nearby note and returned to a comfortable one, and listened back for comfort and clarity.",
      ],
      assignment: {
        instructions: [
          "A short, easy hum",
          "One or two comfortable vowels",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 2 (interactive) ---------- */
  const resonanceClass = {
    number: 2, title: "Resonance", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/resonance.js
    interactive: "resonance",
    subtitle: "Discover how small, comfortable changes shape your vocal tone.",
    description: "An interactive lesson: resonance as the vocal tract shaping the sound vocal-fold vibration produces — not a sensation to chase, and not the same as volume. Gentle humming, vowel comparison, soft-vs-normal volume, and pitch exploration.",
    content: {
      whatYoullLearn: "How to explain resonance in beginner-friendly language, understand how the shape of the vocal tract affects vocal tone, explore comfortable changes in vowel sound, compare gentle humming, speaking and vowel sounds, recognize the difference between a tone change and simply singing louder, and record personal observations without judging the voice harshly.",
      whyItMatters: "Resonance is not the same as volume, and not every singer feels the same sensation in the same place. Noticing tone by listening — rather than chasing a particular vibration or forcing more volume — is what keeps this exploration honest and comfortable.",
      theory: "Vocal-fold vibration produces the initial sound; the vocal tract — throat, mouth, tongue — shapes and filters it. Vowel shapes influence the resulting tone. Nasal resonance and oral vowel shaping are related concepts, but neither means forcing air through the nose. Different voices naturally have different tone qualities.",
      guidedPractice: [
        "Listened for the difference between ordinary speech and a gentle sung sound, explored an easy hum, compared three vowel shapes, compared soft and normal volume on one vowel, explored a nearby pitch and returned to a comfortable note, and compared recordings for audible differences in tone.",
      ],
      assignment: {
        instructions: [
          "Gentle humming",
          "Two comfortable vowels",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 3 (interactive) ---------- */
  const chestVoiceFoundationsClass = {
    number: 3, title: "Chest Voice Foundations", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/chestVoiceFoundations.js
    interactive: "chest-voice-foundations",
    subtitle: "Explore a comfortable, speech-like vocal quality — no forcing, no searching for a sensation.",
    description: "An interactive lesson: chest voice as a comfortable, speech-like vocal coordination — not a sensation to find, and not the same as shouting, speaking loudly, or forcing low notes. Gentle humming, a simple vowel, and optional pitch exploration.",
    content: {
      whatYoullLearn: "How to explain chest voice in beginner-friendly language, explore a comfortable speech-like sound at an easy pitch, notice the difference between speaking and gently sustaining a voiced sound, and understand that chest voice is not the same as shouting, speaking loudly, or forcing low notes.",
      whyItMatters: "Comfort and consistency matter more than whether a voice sounds professional yet. Chest voice is a coordination you already use when you speak comfortably — not a sensation to search for or force.",
      theory: "Chest voice is a commonly used term for a vocal coordination often associated with comfortable speaking and lower-to-middle singing pitches. Some singers notice vibration around the chest, but sensations differ between people, and the name doesn't mean sound is produced only in the chest.",
      guidedPractice: [
        "Listened to my speaking voice, explored a gentle voiced “mmm” sound, tried “mmm-ah,” explored one comfortable reference note, compared comfortable exploration with what to avoid, and reflected on comfort and tension rather than judging my voice.",
      ],
      assignment: {
        instructions: [
          "One short sentence, spoken naturally",
          "Two comfortable “mmm-ah” repetitions",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 4 (interactive) ---------- */
  const headVoiceFoundationsClass = {
    number: 4, title: "Head Voice Foundations", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/headVoiceFoundations.js
    interactive: "head-voice-foundations",
    subtitle: "Explore a lighter vocal quality — gently, without forcing a sound or a sensation.",
    description: "An interactive lesson: head voice as a lighter vocal coordination, not proof that sound is produced in the head. A gentle 'oo', a small pitch movement, an optional tiny glide, and a non-judging comparison with Class 3's chest-voice exploration.",
    content: {
      whatYoullLearn: "What singers generally mean by 'head voice', that it's a term for vocal coordination rather than a literal sound source, how to explore a gentle, lighter sound without forcing pitch or volume, and how to reflect on comfort and effort instead of judging vocal quality.",
      whyItMatters: "Not everyone experiences an obvious difference immediately, and that's normal. Comparing sensations honestly — without needing a 'right' answer — matters more than identifying a register correctly on the first try.",
      theory: "Chest voice and head voice are terms for vocal coordination, not two completely separate physical sound sources. Some singers notice sensations around the face or head; others don't. The goal is exploration, not achieving a particular sound.",
      guidedPractice: [
        "Relaxed and listened to my speaking voice, explored a gentle 'oo' sound, tried a small pitch movement, optionally explored a tiny glide, compared the 'oo' with Class 3's 'mmm-ah' without judging either, and reflected on comfort and effort.",
      ],
      assignment: {
        instructions: [
          "One short sentence, spoken naturally",
          "Two comfortable “oo” sounds",
          "One small pitch glide, if comfortable",
        ],
        questions: []
      }
    }
  };

  const CLASSES = [
    ...[...level1, breathPhraseClass, pitchStabilityClass, smoothTransitionsClass, basicDynamicsClass, dictionClass, singingPhrasesClass, connectingPhrasesClass, musicalPhrasingClass, melodicPatternsClass, melodicMovementClass, vocalCoordinationClass, vocalAgilityClass, registerAwarenessClass, singingCompleteSongClass, foundationFinalAssessmentClass].map(c => ({ ...c, levelId: 1 })),
    ...[voicePlacementClass, resonanceClass, chestVoiceFoundationsClass, headVoiceFoundationsClass].map(c => ({ ...c, levelId: 2 })),
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
