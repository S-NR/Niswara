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
    // Re-pointed from the original "Musician / Theory & Keys" (music theory) plan: Level 2's own
    // Class 25 already previewed a different real Level 3 — "Song Mastery & Performance
    // Development" — as the user's own stated plan, and Level 3 Class 1's own spec confirmed it.
    // See js/lessons/introductionToSongMastery.js's header comment for the full story.
    { id: 3, title: "Song Master", role: "Mastery & Performance", skills: ["Song interpretation", "Melody & raga exploration", "Vocal coordination", "Musical styles", "Song analysis", "Live performance", "Microphone technique", "Studio recording"] },
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
    // Level 2 is now complete: Classes 1-25 ("Voice Placement" ... "Level 2 Final Assessment &
    // Progress Recording") are all real, authored classes, and Class 25's own spec confirmed it
    // as Level 2's final class ("Do not implement Level 3"). No `2:` entry remains here — the
    // same resolution Level 1 reached once its own 25 classes were all real (Level 1 has no entry
    // in this object either).
    //
    // Level 3 is now real, starting with Class 1 — "Introduction to Song Mastery" (see
    // js/lessons/introductionToSongMastery.js). It replaces the ORIGINAL Level 3 plan that lived
    // here before this session ("Music Theory Basics" and seven theory/keyboard siblings) — Class
    // 25's own "Song Mastery & Performance Development" preview turned out to be the user's real
    // plan, confirmed by Class 1's own spec, so `LEVELS[2]` and this entry were both re-pointed to
    // match it rather than leaving two contradictory plans for the same level number. Class 1's
    // own spec names the real Class 2 as "Melody Analysis and Phrase Mapping", so only that single
    // title remains here — the same one-rename-at-a-time precedent every level since 2 has used.
    //
    // Class 2's own spec names no next class at all (unlike every spec since Level 2 Class 5) —
    // so there's nothing to rename this `3:` entry to yet, and it's removed entirely rather than
    // guessed. Level 3 shows exactly its two real classes with no "Coming Soon" tile for now; a
    // `3:` entry reappears here once a future spec actually names what Class 3 is.
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
    number: 1, id: "L2C01", section: "Musical Foundations", title: "Voice Placement", category: "Vocal Technique", skillTag: "vocal",
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
    number: 2, id: "L2C02", section: "Musical Foundations", title: "Resonance", category: "Vocal Technique", skillTag: "vocal",
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

  /* ---------- Level 2, Class 3 (interactive, id L2C26) ---------- */
  const shrutiAndFindingYourSaClass = {
    number: 3, id: "L2C26", section: "Musical Foundations", title: "Shruti and Finding Your Sa", category: "Carnatic Fundamentals", skillTag: "swara",
    difficulty: "Beginner", estMinutes: 22,
    // Rendered by the interactive lesson in js/lessons/shrutiAndFindingYourSa.js
    interactive: "shruti-and-finding-your-sa",
    subtitle: "Before learning different notes, learn to recognise and maintain your own Sa.",
    description: "An interactive lesson: shruti as the pitch reference a singer tunes against (distinct from tala, which is about rhythm), and Sa as the name for whichever pitch a singer personally chooses — never assumed to be any particular Western note like C. Guides you to a comfortable Sa on the piano, introduces a synthesized tanpura-style reference tone, and practises listening, humming and recognising Sa before carrying that choice forward into every later class.",
    content: {
      whatYoullLearn: "What shruti means as a continuous pitch reference (and how it differs from tala, which is about rhythm), what Sa represents and why it acts as a reference, why different singers may choose different Sa pitches, how to find a comfortable Sa, and how to listen to a reference drone and maintain Sa.",
      whyItMatters: "There's no universal 'correct' Sa — a chosen reference pitch that fits your own comfortable range is what makes every later swara, scale and pattern approachable rather than strained.",
      theory: "Shruti is the pitch reference or tonal foundation a singer tunes against — traditionally a continuous drone, such as a tanpura. Sa is the name Carnatic music gives to whichever pitch a singer chooses as that reference; it is not fixed to any particular note, and different singers comfortably choose different Sa pitches. Shruti is about pitch; tala, a separate idea not covered in this class, is about rhythmic cycles.",
      guidedPractice: [
        "Found a comfortable Sa on the piano, listened to a synthesized tanpura-style reference tone, hummed Sa along with and without the drone, and practised recognising Sa among a short played sequence.",
      ],
      assignment: {
        instructions: [
          "A comfortable Sa, chosen on the piano",
          "Humming Sa along with the reference tone, repeated a few times with short breaks",
          "Recognising Sa within a short played sequence",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 4 (interactive, id L2C27) ---------- */
  const introductionToSaptaSwarasClass = {
    number: 4, id: "L2C27", section: "Musical Foundations", title: "Introduction to Sapta Swaras", category: "Carnatic Fundamentals", skillTag: "swara",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/introductionToSaptaSwaras.js
    interactive: "introduction-to-sapta-swaras",
    subtitle: "Music is built from notes. Let's learn to recognise and sing those notes one by one.",
    description: "An interactive lesson: the seven sapta swara names (Sa Ri Ga Ma Pa Dha Ni), their order, and their relationship to the Sa chosen in Class 3 — individual swara cards to listen to one at a time, a guided ascending (arohana) and descending (avarohana) sequence, and a listen-and-identify exercise. This is an introduction, not a complete swara theory course: varieties and raga formation are named as later topics, not taught here.",
    content: {
      whatYoullLearn: "The seven basic swara names and their order, how each swara's position is relative to your own chosen Sa, how to listen to and sing a simple ascending sequence (arohana) and descending sequence (avarohana), and how to recognise basic movement between swaras.",
      whyItMatters: "Learning the swaras by their relationship to your own Sa — rather than by fixed Western note names — is what makes this vocabulary genuinely transferable, whatever pitch you choose as Sa on a given day.",
      theory: "Sapta Swaras refers to the seven basic swara names: Sa, Ri, Ga, Ma, Pa, Dha, Ni. Sa and Pa are generally treated as fixed positions relative to the chosen Sa; Ri, Ga, Ma, Dha and Ni each have different varieties, learned gradually in later lessons. Different combinations and positions of swaras matter for raga formation — a simple ascending or descending sequence is not automatically a complete raga. These names are not the same as fixed Western notes like C, D, E, F, G, A and B.",
      guidedPractice: [
        "Met the seven swara names and their order, listened to and sang the ascending sequence (arohana) and the descending sequence (avarohana), listened to each individual swara card, and practised a listen-and-identify exercise.",
      ],
      assignment: {
        instructions: [
          "Listening to the ascending and descending sequences",
          "Singing along with at least one of the two sequences",
          "Listening to at least one individual swara card",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 5 (interactive, id L2C28) ---------- */
  const arohanaAndAvarohanaClass = {
    number: 5, id: "L2C28", section: "Musical Foundations", title: "Arohana and Avarohana", category: "Carnatic Fundamentals", skillTag: "swara",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/arohanaAndAvarohana.js
    interactive: "arohana-and-avarohana",
    subtitle: "Learn how musical notes travel upward and downward.",
    description: "An interactive lesson: arohana (ascending) and avarohana (descending) swara movement, with a side-by-side comparison, guided practice connecting both directions, and an honest, beginner-level introduction to how a raga's own ascending/descending structure can differ from this class's basic seven-swara sequence — without teaching detailed raga theory, and without implying this sequence IS a raga.",
    content: {
      whatYoullLearn: "What arohana and avarohana mean, how to recognise and sing each direction, the difference between moving higher and lower in pitch, how to follow a swara sequence without rushing, and that ragas can have their own characteristic ascending and descending structures that this simple sequence doesn't represent.",
      whyItMatters: "Recognising ascending and descending movement by name is a small but genuine step toward reading and discussing melody — without yet requiring any of the more advanced raga theory those terms eventually lead to.",
      theory: "Arohana is the ascending swara sequence, from Sa up to the upper Sa. Avarohana is the descending swara sequence, from the upper Sa back down to Sa. The swaras are not equally spaced in frequency — this class's sequence already uses uneven steps, not a simple equal-step staircase. A raga has its own characteristic rules and identity; not every raga uses all seven swaras in both directions, and some ragas use different swaras ascending versus descending. This basic seven-swara exercise is not itself a specific raga.",
      guidedPractice: [
        "Recapped the seven swaras, listened to and sang arohana and avarohana separately with synchronized visual highlighting, then practised connecting both directions into one attempt.",
      ],
      assignment: {
        instructions: [
          "Singing arohana (ascending)",
          "Singing avarohana (descending)",
          "Connecting both directions, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 6 (interactive, id L2C29) ---------- */
  const basicSwaraPatternsClass = {
    number: 6, id: "L2C29", section: "Musical Foundations", title: "Basic Swara Patterns", category: "Carnatic Fundamentals", skillTag: "swara",
    difficulty: "Beginner to early intermediate", estMinutes: 28,
    // Rendered by the interactive lesson in js/lessons/basicSwaraPatterns.js
    interactive: "basic-swara-patterns",
    subtitle: "Don't just sing Sa Ri Ga Ma in order — learn to recognise and sing different combinations of notes.",
    description: "An interactive lesson: 14 beginner swara patterns across three groups (three-note, returning, longer), a listen-and-recognise exercise, a repeat-the-pattern recording exercise, a complete-the-pattern exercise, and a steady-pulse rhythm-coordination section (a basic metronome, not tala theory, which stays a Level 3 topic). Closes the four-class Musical Foundations arc before the curriculum returns to vocal technique at Class 7.",
    content: {
      whatYoullLearn: "What a swara pattern is, how to recognise different combinations of swaras (three-note, returning, and longer patterns), how to sing a pattern without losing the reference pitch, and how a steady pulse supports clear, unhurried movement between notes.",
      whyItMatters: "Patterns develop pitch awareness, note coordination and familiarity with musical movement — a more useful and comfortable building block than attempting a full scale or song too soon.",
      theory: "A swara pattern is a combination of notes arranged in a particular sequence — not necessarily ascending or descending in simple order. These are introductory practice patterns, not a claim that every sequence is a traditional named Carnatic exercise, and no tala theory is introduced here; that belongs in Level 3.",
      guidedPractice: [
        "Reviewed the seven swaras, arohana and avarohana, listened to and sang three-note, returning and longer patterns, practised a listen-and-recognise exercise, a repeat-the-pattern recording, and a complete-the-pattern exercise, and practised singing with a steady pulse.",
      ],
      assignment: {
        instructions: [
          "Listening to at least one pattern from each group",
          "Singing at least one pattern back, with or without audio",
          "The complete-the-pattern exercise",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 7 (interactive) ---------- */
  const chestVoiceFoundationsClass = {
    number: 7, id: "L2C03", section: "Vocal Technique Development", title: "Chest Voice Foundations", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/chestVoiceFoundations.js
    interactive: "chest-voice-foundations",
    subtitle: "Chest voice should feel natural and comfortable, not pushed or shouted.",
    description: "An interactive lesson: chest voice as a comfortable, speech-like vocal coordination — not a sensation to find, and not the same as shouting, speaking loudly, or forcing low notes. A speaking-voice awareness exercise, three gentle chest-dominant exercises, a chest-voice-vs-shouting comparison, a listen-and-observe section, and a short self-practice routine.",
    content: {
      whatYoullLearn: "What chest voice means in beginner-friendly language, how to recognise your own comfortable speaking voice, the difference between comfortable chest-dominant singing and shouting or pressing, how to explore gentle chest-dominant sounds, and why not every singer experiences register sensations the same way.",
      whyItMatters: "Comfort and consistency matter more than whether a voice sounds professional yet. Chest voice is a coordination you already use when you speak comfortably — not a sensation to search for or force, and loudness alone never identifies it.",
      theory: "Chest voice is a commonly used term for a vocal coordination often associated with comfortable speaking and lower-to-middle singing pitches, producing a fuller, speech-like sound. Some singers notice vibration around the chest, but this sensation is not a reliable test of register, and sensations differ between people — the name doesn't mean sound is produced only in the chest.",
      guidedPractice: [
        "Recognised my comfortable speaking voice, explored gentle humming, a speech-to-song exercise, and gentle short notes, compared chest-dominant singing with shouting, listened back to notice tone and comfort, and practised a short self-practice routine.",
      ],
      assignment: {
        instructions: [
          "The comfortable-speaking-voice awareness exercise",
          "At least one of the three gentle chest-dominant exercises",
          "The self-practice routine, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 4 (interactive) ---------- */
  const headVoiceFoundationsClass = {
    number: 8, id: "L2C04", section: "Vocal Technique Development", title: "Head Voice Foundations", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/headVoiceFoundations.js
    interactive: "head-voice-foundations",
    subtitle: "Higher notes should become lighter and easier, not louder and harder.",
    description: "An interactive lesson: head voice as a lighter vocal coordination for higher notes, not proof that sound is produced in the head. Three gentle exercises (humming, a light 'oo', and a gentle siren glide), a chest-vs-head comparison, a brief, honest introduction to falsetto, a listen-and-observe section, and a short self-practice routine.",
    content: {
      whatYoullLearn: "What head voice means, how to recognise a lighter, higher vocal coordination, how to explore gentle humming and comfortable higher notes, the basic difference between head voice and falsetto, why higher notes shouldn't be pushed or forced, and how this prepares for connecting chest and head voice next class.",
      whyItMatters: "Not everyone experiences an obvious difference immediately, and that's normal. Higher notes becoming lighter and easier — not louder and harder — is the whole goal; comparing sensations honestly, without needing a 'right' answer, matters more than identifying a register correctly on the first try.",
      theory: "Head voice is a vocal register or coordination commonly used for higher singing notes, often feeling lighter than chest-dominant singing. Some singers notice vibration or resonance sensations around the face or head, but these sensations are subjective and don't mean sound physically originates there. Falsetto is a related but distinct production pattern, often breathier or lighter than some forms of head voice — the distinction can vary across vocal traditions and teaching approaches, and this class doesn't require mastering it.",
      guidedPractice: [
        "Explored the feeling of lighter singing, practised gentle humming, a light 'oo', and a gentle siren glide, compared chest-dominant and head-dominant coordination, learned a little about falsetto, listened back to notice tone and coordination, and practised a short self-practice routine.",
      ],
      assignment: {
        instructions: [
          "The feeling-of-lighter-singing awareness exercise",
          "At least one of the three gentle head-voice exercises",
          "The self-practice routine, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 5 (interactive) ---------- */
  const connectingChestHeadClass = {
    number: 9, id: "L2C05", section: "Vocal Technique Development", title: "Connecting Chest & Head Voice", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/connectingChestHead.js
    interactive: "connecting-chest-head",
    subtitle: "Smooth coordination comes from gentle practice, not force — the passaggio is an area, not a wall.",
    description: "An interactive lesson: a recap of Classes 7-8's chest/head voice work, an introduction to register transitions and the passaggio, six named guided exercises (humming glide, “oo” glide, lip trill, speech-to-song, two-note and three-note patterns), a progressive coordination routine, and a knowledge check.",
    content: {
      whatYoullLearn: "What chest-dominant and head-dominant vocal coordination mean, why the voice can feel and sound different as pitch changes, what a register transition is, what singers mean by the passaggio, why smooth transitions require coordination rather than force, and how to explore gentle movement between comfortable lower and higher notes.",
      whyItMatters: "Forcing chest-dominant coordination upward can cause strain, and abruptly switching registers is never the goal — sensations differ between singers, and a noticeable change or voice break is useful information, not a failure.",
      theory: "Chest voice and head voice are vocal register or coordination terms — sound does not literally originate in the chest or head. The passaggio is a transition area, not one universal fixed note, and its exact location varies between singers. Smooth coordination develops gradually, through gentle, repeated practice.",
      guidedPractice: [
        "Recapped chest and head voice, learned what a register transition and the passaggio are, practised six gentle guided exercises (humming glide, “oo” glide, lip trill, speech-to-song, two-note and three-note patterns), worked through a progressive coordination routine, and reflected on tension and comfort rather than forcing a perfect transition.",
      ],
      assignment: {
        instructions: [
          "The recap listening exercise",
          "At least one of the six guided exercises",
          "The progressive coordination routine, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 6 (interactive) ---------- */
  const introMixedCoordinationClass = {
    number: 10, id: "L2C06", section: "Vocal Technique Development", title: "Introduction to Mixed Coordination", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/introMixedCoordination.js
    interactive: "intro-mixed-coordination",
    subtitle: "A broad, gentle introduction to balancing comfortable chest- and head-voice qualities.",
    description: "An interactive lesson: mixed coordination as a broad teaching term for balancing qualities commonly associated with chest and head voice, with seven named guided exercises (humming, “ng”, “oo” glide, small-range siren, speech-into-singing, three-note patterns, and light melodic patterns), a coordination practice routine, and a practical application using the learner's own comfortable Sa — never equating mixed voice with any specific swara or fixed Western pitch.",
    content: {
      whatYoullLearn: "What singers commonly mean by mixed voice or mixed coordination, how it relates to chest-dominant and head-dominant coordination, why singers work towards a more connected sound across their range, why mixed coordination is not simply singing loudly, and why it should not be forced or rushed.",
      whyItMatters: "Mixed coordination is a broad teaching term, and different teachers may use slightly different terminology for it. No single sensation proves a singer is using mixed voice — comfort and repeatability matter more than chasing a recognisable sound in one short lesson.",
      theory: "'Mix' describes coordination that balances qualities commonly associated with chest and head voice — not a literal 50/50 combination, and not the same as a specific Carnatic swara or fixed Western pitch. Vocal registers and coordination are a separate idea from swara positions, which describe pitch relative to your own chosen Sa.",
      guidedPractice: [
        "Recapped chest voice, head voice, connecting chest and head voice, and register transitions, practised seven gentle guided exercises, worked through a coordination practice routine, and tried a simple melody-like application using comfortable notes and (optionally) a simple swara pattern based on a personally chosen Sa.",
      ],
      assignment: {
        instructions: [
          "The recap warm-up",
          "At least one of the seven guided exercises",
          "The simple melody-like application, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 7 (interactive) ---------- */
  const vowelModificationClass = {
    number: 11, id: "L2C07", section: "Vocal Technique Development", title: "Vowel Modification Foundations", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/vowelModification.js
    interactive: "vowel-modification",
    subtitle: "Hear and explore how small changes in vowel shape affect the sound and comfort of singing.",
    description: "An interactive lesson: the five basic vowel sounds (ah/ee/oo/eh/oh), how mouth, tongue and lip shape affect them, five named guided exercises (awareness, sustained vowels, transitions, consistency, gentle pitch movement), a practical word-application section, and a knowledge check — never a distorted word or an instruction to change pronunciation unnecessarily.",
    content: {
      whatYoullLearn: "What vowels are and how they differ from consonants, why vowels influence vocal tone and clarity, why a vowel may need a small adjustment as pitch changes, how to maintain understandable pronunciation while exploring comfortable vowel shapes, and why vowel modification should be subtle and should never feel forced.",
      whyItMatters: "Vowel modification is gradual and depends on pitch, voice, language, musical context and the individual singer — there's no single vowel shape that's correct for every person or every note.",
      theory: "Vowel modification is a singing technique — a small adjustment, not an instruction to distort words or change pronunciation unnecessarily. Clear pronunciation remains important, and different musical phrases and languages may call for different choices.",
      guidedPractice: [
        "Explored the five basic vowel sounds, practised sustained vowels, gentle transitions, vowel consistency on a repeated-note pattern, and gentle pitch movement, applied vowels to a few simple words, and reflected on which vowels felt easiest without exaggerating or forcing any of them.",
      ],
      assignment: {
        instructions: [
          "“Ah,” “ee” and “oo,” spoken naturally",
          "At least one of the five guided exercises",
          "One word, spoken then sung",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 8 (interactive) ---------- */
  const resonanceToneColourClass = {
    number: 12, id: "L2C08", section: "Vocal Technique Development", title: "Resonance and Tone Colour", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/resonanceToneColour.js
    interactive: "resonance-tone-colour",
    subtitle: "Build on Class 2's foundation with practical listening, tone exploration and controlled variation.",
    description: "An interactive lesson: building practically on Class 2's introductory resonance theory — bright/warm/light/dark as descriptive listening terms, six guided exercises, an interactive tone-exploration activity, and a practical application comparing two tone colours on the same phrase, optionally using a simple swara or melody on the learner's comfortable shruti.",
    content: {
      whatYoullLearn: "How vocal tract shape influences the sound, how vowels influence tone quality, what singers mean by bright, warm, light and dark tone, how to explore different tone colours naturally, how resonance and articulation influence the perceived sound, and how to maintain vocal comfort while exploring tonal variation.",
      whyItMatters: "Bright, warm, light and dark are descriptive listening terms, not rigid scientific categories or medical assessments — two people can sing the same note at the same volume and still sound different, and that's normal, not a problem to fix.",
      theory: "Tone colour is influenced by vocal tract shape, mouth opening, tongue position, jaw relaxation and vowel shape. Resonance is not simply making sound in the nose, chest or head. A brighter tone isn't automatically better than a warmer one — consistency and comfort matter more than imitating another singer's tone.",
      guidedPractice: [
        "Recapped Class 2's resonance foundation, practised six guided exercises exploring bright/warm/light/dark tone, used an interactive tone-exploration activity, sang a short phrase with two different tone colours, and reflected on which felt most natural.",
      ],
      assignment: {
        instructions: [
          "At least one of the six guided exercises",
          "The interactive tone-exploration activity",
          "A short phrase sung with two different tone colours",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 9 (interactive) ---------- */
  const projectionWithoutPushingClass = {
    number: 13, id: "L2C09", section: "Vocal Technique Development", title: "Projection Without Pushing", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/projectionWithoutPushing.js
    interactive: "projection-without-pushing",
    subtitle: "Discover comfortable vocal clarity — the difference between easy, audible singing and forced loudness.",
    description: "An interactive lesson: vocal projection as being heard clearly for the situation — not shouting. Six guided exercises, a practical projection routine, a two-intensity recording activity, and a musical application exploring gentle, comfortable medium and natural expressive intensity.",
    content: {
      whatYoullLearn: "What vocal projection means, the difference between projection and shouting, how comfortable breathing, posture and articulation support an audible voice, why increasing throat pressure is not healthy projection, how to maintain comfortable tone while increasing perceived intensity, and why microphones and room acoustics also affect perceived loudness.",
      whyItMatters: "A louder sound is not automatically a better sound. Microphone use, room acoustics and distance also affect how audible a singer sounds — vocal effort isn't always the solution to an acoustic problem.",
      theory: "Projection means allowing the voice to be heard clearly for the situation. Clarity can be influenced by articulation, vowel shape, vocal coordination, and appropriate volume — not by forcing more air or tightening the throat. Room acoustics and microphone placement also affect perceived loudness.",
      guidedPractice: [
        "Prepared gently, practised six guided exercises comparing comfortable projection with shouting, worked through a practical projection routine, recorded the same phrase at two comfortable intensities, and applied gentle, medium and expressive intensity to a short musical phrase.",
      ],
      assignment: {
        instructions: [
          "At least one of the six guided exercises",
          "The practical projection routine, if comfortable",
          "A short phrase at two comfortable intensities",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 10 (interactive) ---------- */
  const registerTransitionsClass = {
    number: 14, id: "L2C10", section: "Vocal Technique Development", title: "Register Transitions and Coordination", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 27,
    // Rendered by the interactive lesson in js/lessons/registerTransitions.js
    interactive: "register-transitions",
    subtitle: "How the voice travels across its range, and how to practise that journey gently.",
    description: "An interactive lesson: a recap of Classes 7-10's register work, an introduction to the passaggio (a transition area, not one fixed note), six named guided exercises (humming glide, “oo” glide, lip trill, two-note and three-note patterns, speech-to-song), a progressive transition routine, and a knowledge check. A voice break is not automatically a failure; vocal continuity and coordination both develop gradually.",
    content: {
      whatYoullLearn: "How the voice may behave differently across its range, why transitions between registers can feel uneven, how chest-dominant, head-dominant and mixed coordination relate to vocal development, how to practise transitions using small, comfortable patterns, and how to identify tension and avoid forcing the voice.",
      whyItMatters: "Vocal registers and coordination are complex, and sensations differ among singers — there are no rigid universal register boundaries, and a noticeable transition or voice break is not automatically a failure.",
      theory: "A register transition is an area where the voice's coordination shifts as pitch changes — often called the passaggio, a transition area rather than one fixed note. The voice may change in quality or feel less stable around this area; this varies between singers and develops gradually through gentle, repeated practice, never by forcing a transition to disappear immediately.",
      guidedPractice: [
        "Recapped chest voice, head voice, connecting chest and head voice, and mixed coordination, learned what the passaggio means, practised six gentle guided exercises (humming glide, “oo” glide, lip trill, two-note and three-note patterns, and speech-to-song), worked through a progressive transition routine, and reflected on tension and comfort rather than forcing a perfect result.",
      ],
      assignment: {
        instructions: [
          "The recap listening exercise",
          "At least one of the six guided exercises",
          "The progressive transition routine, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 11 (interactive) ---------- */
  const controlledRangeDevelopmentClass = {
    number: 15, id: "L2C11", section: "Vocal Technique Development", title: "Controlled Range Development", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/controlledRangeDevelopment.js
    interactive: "controlled-range-development",
    subtitle: "Explore a few comfortable notes above and below a familiar starting note.",
    description: "An interactive lesson: vocal range as the span between lower and higher notes — explored gently in both directions from a comfortable reference note. A wider range is never the goal of one lesson; range develops from gradual coordination, not force.",
    content: {
      whatYoullLearn: "What vocal range means in simple terms, how to explore a few comfortable notes above and below a familiar starting note, how to notice when a note feels easy versus strained, that range development comes from gradual coordination and practice rather than forcing the voice, and how to record a simple observation about which notes felt comfortable.",
      whyItMatters: "Everyone's range is different — there's no universal starting note or required highest or lowest note. It's completely fine if only the starting note feels comfortable on a given day; that's still a successful lesson.",
      theory: "Vocal range is the span between the lower and higher notes a person can sing. A wider range is not automatically better singing, and singing louder does not mean you can sing higher — a comfortable starting note is a reference point, not a test.",
      guidedPractice: [
        "Found a comfortable starting note, explored one nearby higher note and one nearby lower note if comfortable, returned to the starting note each time, and reflected on which direction felt easier and whether any note felt tight or strained.",
      ],
      assignment: {
        instructions: [
          "Your comfortable starting note",
          "One nearby higher note, if comfortable",
          "One nearby lower note, if comfortable",
          "A return to the starting note",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 12 (interactive) ---------- */
  const sustainedNotesStabilityClass = {
    number: 16, id: "L2C12", section: "Vocal Technique Development", title: "Sustained Notes and Stability", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/sustainedNotesStability.js
    interactive: "sustained-notes-stability",
    subtitle: "Hold a short, comfortable note gently — without pushing for length or power.",
    description: "An interactive lesson: a sustained note is held continuously for a short duration, not louder or longer through extra effort. A brief, comfortable, reasonably steady note is already a real achievement — stability develops gradually through relaxed coordination, not force.",
    content: {
      whatYoullLearn: "What a sustained note is, how to begin and end a note gently, how to maintain a comfortable, reasonably steady sound, how to notice changes in pitch, volume, and tone, and why relaxed coordination matters more than holding a note for a long time.",
      whyItMatters: "A short, comfortable, steady note is a better achievement than a long note produced with tension. Natural variation while learning is completely normal, and stopping early is never a failure.",
      theory: "A sustained note is a note held continuously for a short duration. Singing it steadily does not mean making it louder or pushing more air — the aim is a comfortable, reasonably consistent sound, not maximum length.",
      guidedPractice: [
        "Relaxed the shoulders, jaw and neck, tried a short comfortable note on 'mmm' or 'oo', practised a gentle beginning and ending across a few attempts, listened back to two short recordings, and reflected on steadiness and tension rather than duration.",
      ],
      assignment: {
        instructions: [
          "One short, comfortable note (2-3 seconds, if comfortable)",
          "A first listen-back attempt",
          "A second listen-back attempt",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 13 (interactive) ---------- */
  const vocalDynamicsControlClass = {
    number: 17, id: "L2C13", section: "Vocal Technique Development", title: "Vocal Dynamics and Control", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/vocalDynamicsControl.js
    interactive: "vocal-dynamics-control",
    subtitle: "Explore soft, medium and slightly stronger singing on one comfortable note.",
    description: "An interactive lesson: vocal dynamics as variations in loudness and softness, not a test of power. Control is more important than volume — strong singing is never the same as shouting, and soft or medium singing alone is already enough to complete the class.",
    content: {
      whatYoullLearn: "What vocal dynamics means, the difference between soft, medium and stronger singing, how to change vocal intensity gradually, how to avoid confusing loudness with good singing, and how dynamics can communicate emotion and make a musical phrase interesting.",
      whyItMatters: "Strong singing does not mean shouting. A song doesn't need to be sung at the same volume throughout — dynamics help a phrase feel expressive, and control matters far more than raw volume.",
      theory: "Vocal dynamics refers to variations in loudness and softness while singing. Three beginner-friendly levels — soft, medium, and slightly stronger — are enough to explore the idea, with no exact decibel targets.",
      guidedPractice: [
        "Relaxed the jaw, shoulders and neck, explored a comfortable note softly and at medium intensity, optionally tried a little more intensity, practised a gentle soft-to-medium-to-soft transition, applied dynamics to a short phrase three ways, and reflected on control and comfort rather than loudness.",
      ],
      assignment: {
        instructions: [
          "A short phrase at a comfortable medium intensity",
          "The same phrase, soft to slightly stronger",
          "The same phrase, medium to soft",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 14 (interactive) ---------- */
  const expressiveSingingFoundationsClass = {
    number: 21, id: "L2C14", section: "Musical Expression and Song Application", title: "Expressive Singing Foundations", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/expressiveSingingFoundations.js
    interactive: "expressive-singing-foundations",
    subtitle: "Explore how tone, dynamics, timing and intention shape the feeling behind a phrase.",
    description: "An interactive lesson: singing as communication, not just correct notes. The same melody and the same words can sound completely different depending on the feeling behind them — and good expression never needs shouting, excessive vibrato, or dramatic effects.",
    content: {
      whatYoullLearn: "What expressive singing means, how emotion and intention influence the way a phrase is sung, how to communicate different feelings without changing the melody, how to use natural dynamics and phrasing to support expression, and why expression should feel genuine rather than exaggerated.",
      whyItMatters: "Singing is not only about producing correct notes — a singer also communicates a feeling, thought, or story. Expression comes from tone, dynamics, timing, phrasing and intention together.",
      theory: "The same melody can sound different depending on the emotion behind it. A learner who doesn't connect with a suggested feeling can always choose Neutral instead — exploring expression is always optional and personal.",
      guidedPractice: [
        "Explored a short emotion vocabulary, spoke a sentence naturally and with two different feelings, sang a phrase with three different intentions, connected dynamics to emotion from Class 13, gently emphasized one important word in a phrase, and reflected on which attempt felt most genuine.",
      ],
      assignment: {
        instructions: [
          "A sentence spoken naturally, happily, and gently",
          "A phrase sung with two different intentions",
          "A phrase with one word gently emphasized",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 15 (interactive) ---------- */
  const applyingVocalSkillsToSongClass = {
    number: 24, id: "L2C15", section: "Musical Expression and Song Application", title: "Applying Vocal Skills to a Song", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 18,
    // Rendered by the interactive lesson in js/lessons/applyingVocalSkillsToSong.js
    interactive: "applying-vocal-skills-to-song",
    subtitle: "Bring Level 2's skills together on a short practice phrase, one small section at a time.",
    description: "An interactive lesson: singing a song as several skills working together — pitch, rhythm, breathing, vocal stability, dynamics and expression. A beginner never needs to master all of them at once; this class breaks a short original practice phrase into small, manageable sections instead.",
    content: {
      whatYoullLearn: "How to listen to a phrase before attempting to sing it, how to identify its melody and basic phrase structure, where breathing may be needed, how to sing a short section at a comfortable pitch and intensity, how to apply pitch stability, dynamics and expression together, and how to evaluate your own practice without expecting perfection.",
      whyItMatters: "A song is many skills working together, and trying to master all of them at once is overwhelming for a beginner. Learning one small section at a time — and changing the key to suit a comfortable range — makes a song approachable.",
      theory: "A short phrase can be broken into smaller sections, each practiced on its own before being connected. Breathing between phrases is a musical decision, not something to force past.",
      guidedPractice: [
        "Chose a short original practice phrase, listened before singing, broke it into two small sections, reviewed how Classes 10-14 connect to singing a song, sang the phrase three ways (comfortable, technique-aware, expressive), tried connecting the two sections, and self-reviewed without expecting perfection.",
      ],
      assignment: {
        instructions: [
          "A short phrase, broken into two sections",
          "At least one of the three singing attempts",
          "The two sections connected, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 16 (interactive) ---------- */
  const phraseShapingInterpretationClass = {
    number: 22, id: "L2C16", section: "Musical Expression and Song Application", title: "Phrase Shaping and Musical Interpretation", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 18,
    // Rendered by the interactive lesson in js/lessons/phraseShapingInterpretation.js
    interactive: "phrase-shaping-interpretation",
    subtitle: "Shape a phrase's natural beginning, development and ending — one connected musical thought.",
    description: "An interactive lesson: a musical phrase as a group of notes forming one connected thought, not a list of separate words or notes. Builds on Class 15's practice phrase, shaping it with timing, emphasis, dynamics, breathing and emotion rather than treating every note equally.",
    content: {
      whatYoullLearn: "What a musical phrase is, why a phrase should feel connected rather than separate, how to identify an important word or note, how to use gentle dynamic changes to shape a phrase, how to create a natural beginning, development and ending, and how musical interpretation can differ between singers while still respecting the melody.",
      whyItMatters: "Individual notes matter, but their connection is what gives a phrase meaning — the same way a sentence means more than its individual words. Expression should feel natural, never forced or dramatic.",
      theory: "A phrase usually has a natural beginning, development and ending, with breathing happening at sensible musical points — never mid-word, never held past comfort.",
      guidedPractice: [
        "Listened to a familiar phrase, spoke it naturally and with feeling, identified one important word, reviewed the beginning/development/ending shape, sang the phrase three ways (natural, shaped, personal interpretation), identified a comfortable breathing point, and compared a natural take with a shaped one.",
      ],
      assignment: {
        instructions: [
          "The phrase spoken naturally and with feeling",
          "At least one of the three singing attempts",
          "A comfortable breathing point identified",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 17 (interactive) ---------- */
  const vocalAgilityDevelopmentClass = {
    number: 18, id: "L2C17", section: "Vocal Technique Development", title: "Vocal Agility Development", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/vocalAgilityDevelopment.js
    interactive: "vocal-agility-development",
    subtitle: "Move between nearby notes with control — smooth and slow, never fast and unclear.",
    description: "An interactive lesson: vocal agility as moving between notes comfortably and accurately, not singing fast. Starts with a simple two-note movement, then a three-note pattern, with an optional five-note pattern for anyone ready to explore further.",
    content: {
      whatYoullLearn: "What vocal agility means, how to move between nearby notes with control, how to practise simple ascending and descending melodic patterns, why accuracy and smoothness matter more than speed, and how to gradually improve coordination through repetition and listening.",
      whyItMatters: "A smooth and accurate slow pattern is more useful than a fast, unclear one. Speed comes later, after coordination improves — there's no benefit to rushing ahead of what feels comfortable.",
      theory: "Ascending means moving from lower notes to higher notes; descending means moving from higher notes to lower notes. A melodic pattern is a small group of notes arranged in a sequence.",
      guidedPractice: [
        "Prepared gently, practised a two-note movement ascending and descending, tried a slow three-note pattern, optionally explored a five-note pattern, reviewed why smoothness comes before speed, and reflected on which pattern and direction felt easiest.",
      ],
      assignment: {
        instructions: [
          "A two-note movement, ascending or descending",
          "The three-note pattern, if comfortable",
          "The five-note pattern, only if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 19 (interactive) ---------- */
  const toneConsistencyAcrossRangeClass = {
    number: 19, id: "L2C19", section: "Vocal Technique Development", title: "Tone Consistency and Vocal Endurance", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/toneConsistencyAcrossRange.js
    interactive: "tone-consistency-across-range",
    subtitle: "Consistency means comfortable coordination across your range — not making every note sound identical, and not pushing through tiredness.",
    description: "An interactive lesson: listening to how tone changes across nearby notes, recognising unnecessary tension versus natural variation, and carrying that same comfortable coordination across a slightly longer phrase. Compares a reference note with one nearby higher and lower note, the same vowel across pitches, and a short phrase built up gradually with real rest between attempts.",
    content: {
      whatYoullLearn: "What vocal tone means, why tone can change as pitch changes, the difference between natural register changes and unnecessary tension, how to maintain a comfortable, clear sound across nearby notes, what vocal endurance means and why gradually building phrase length beats suddenly attempting long songs, why breaks are part of good vocal practice, and why consistency does not mean making every note identical or singing for as long as possible.",
      whyItMatters: "Every voice has natural tonal variation across its range. Learning to notice that variation — rather than fighting it — is what allows comfortable coordination to develop over time. Endurance that comes from forcing volume, range, or duration tends to produce tension and fatigue rather than real progress; comfortable coordination, built gradually with real rest between attempts, is what actually develops.",
      theory: "Vocal tone is the quality or character of the sound a voice produces. Tone can change naturally with pitch, vowel, register, and coordination; descriptive words like clear, breathier, brighter, darker, lighter, and fuller are listening tools, not judgments. Vocal endurance is about managing effort and coordination comfortably across a phrase — not about singing loudly, reaching higher notes, or singing continuously for as long as possible.",
      guidedPractice: [
        "Prepared gently, found a comfortable reference tone, explored one nearby higher and lower note, compared the same vowel across those notes, optionally tried a short melodic pattern, practised a short phrase a few times and then a slightly longer version, compared how the voice felt before and after a short rest, and reflected on where tone felt most natural versus where it felt forced or tired.",
      ],
      assignment: {
        instructions: [
          "A comfortable reference note, one nearby higher note, and one nearby lower note",
          "The short phrase, repeated a few times",
          "The slightly longer phrase, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 20 (interactive) ---------- */
  const articulationAndStyleClass = {
    number: 20, id: "L2C20", section: "Musical Expression and Song Application", title: "Articulation and Style", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 15,
    // Rendered by the interactive lesson in js/lessons/articulationAndStyle.js
    interactive: "articulation-and-style",
    subtitle: "Clear words without interrupting the melody.",
    description: "An interactive lesson: pronouncing sung words clearly while keeping a smooth, comfortable tone. Practises simple syllables on a comfortable note, keeping words clear across nearby notes, a short original phrase, and a first look at musical style as natural choices, not imitation.",
    content: {
      whatYoullLearn: "How vowels and consonants work together while singing, how to make lyrics understandable without interrupting the melody, how to maintain vowel clarity across notes, how articulation and phrasing contribute to natural musical expression, and how to begin exploring personal singing style without imitating others.",
      whyItMatters: "A listener needs to understand your words, but chasing crisp consonants at the cost of a smooth, sustained vowel works against the music rather than for it. Balancing the two is what makes singing both clear and musical.",
      theory: "Vowels carry most of the sustained singing sound; consonants help a listener recognise the word. A consonant should never interrupt or cut off the vowel that follows it.",
      guidedPractice: [
        "Prepared gently, practised simple syllables on a comfortable note, tried keeping words clear while moving to nearby notes, sang a short original phrase, explored the difference between connected and gently separated notes, and reflected on where the melody felt most and least interrupted.",
      ],
      assignment: {
        instructions: [
          "The syllable practice on a comfortable note",
          "Keeping words clear across nearby notes, if comfortable",
          "The short practice phrase, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 22 (interactive) ---------- */
  const personalVocalStyleClass = {
    number: 23, id: "L2C22", section: "Musical Expression and Song Application", title: "Personal Vocal Style", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 18,
    // Rendered by the interactive lesson in js/lessons/personalVocalStyle.js
    interactive: "personal-vocal-style",
    subtitle: "Your voice already has a style — this lesson is about noticing it, not imitating anyone else's.",
    description: "An interactive lesson: a gentle first exploration of personal singing style. Compares the same short melody played two expressive ways, explores a natural reference tone, experiments with Gentle/Bright/Expressive approaches to a short phrase, and ends with an optional recording of a short connected-phrase exercise.",
    content: {
      whatYoullLearn: "That every voice has its own natural characteristics, how tone, pronunciation, phrasing, and expression contribute to singing style, that a song can be expressed many ways without changing its melody, why imitating other singers isn't the goal, and why personal style develops gradually through listening, practice, and experimentation.",
      whyItMatters: "There's no single correct voice. Noticing your own natural tone and expressive choices — rather than measuring them against someone else's — is what lets a personal style actually develop over time.",
      theory: "Personal vocal style is shaped by tone, pronunciation, phrasing, dynamics, and emotional expression working together, not by any one of them alone.",
      guidedPractice: [
        "Compared two expressive versions of the same melody, explored a natural reference tone, tried Gentle, Bright, and Expressive approaches to a short phrase, chose whichever felt most natural, and optionally recorded a short connected-phrase exercise.",
      ],
      assignment: {
        instructions: [
          "The natural-tone exploration on a comfortable note",
          "At least one expressive version of the short phrase",
          "The Personal Style Practice exercise, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 23 (interactive) ---------- */
  const songPracticeWorkshopClass = {
    number: 25, id: "L2C23", section: "Musical Expression and Song Application", title: "Song Practice Workshop", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 22,
    // Rendered by the interactive lesson in js/lessons/songPracticeWorkshop.js
    interactive: "song-practice-workshop",
    subtitle: "Putting breathing, pitch, rhythm, words, and feeling together into one complete song.",
    description: "An interactive workshop: learning a complete song phrase by phrase, using the existing Song Learning & Application practice song. Covers listening before singing, understanding song structure, phrase-by-phrase practice, rhythm practice, applying earlier Level 2 skills, connecting phrases, and a hand-off to the full tempo/highlighting/recording experience for complete-song practice.",
    content: {
      whatYoullLearn: "How to listen to and understand a song before singing it, how to identify its melody and rhythm, how to break a song into manageable phrases and practise them individually before connecting them, and how to bring breathing, pitch, rhythm, articulation, and expression together into one complete song.",
      whyItMatters: "A complete song can feel overwhelming all at once. Breaking it into short, familiar phrases — practised one at a time and then gently connected — is what actually makes a whole song approachable.",
      theory: "A song is built from lines, and each line from a small number of short phrases; some melodic shapes repeat, and each line usually ends with a natural place to breathe.",
      guidedPractice: [
        "Listened to the complete reference song, explored its structure, practised individual phrases, tried rhythm practice on the real beat grid, reviewed how earlier Level 2 skills apply to a complete song, connected phrases into full lines, and used the existing Song Learning page for complete-song practice with tempo and recording.",
      ],
      assignment: {
        instructions: [
          "At least one phrase, practised on its own",
          "The rhythm practice, if comfortable",
          "Connecting two or more phrases, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 24 (interactive) ---------- */
  const performancePreparationClass = {
    number: 26, id: "L2C24", section: "Musical Expression and Song Application", title: "Performance Preparation", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 20,
    // Rendered by the interactive lesson in js/lessons/performancePreparation.js
    interactive: "performance-preparation",
    subtitle: "Confidence comes from familiarity and practice, not perfection.",
    description: "An interactive lesson: a gentle, practical preparation routine before singing a complete song or presenting it to others. Covers a body/voice warm-up, preparing the song itself, finding a comfortable starting pitch, managing nervousness, a practical run-through, and a reusable pre-performance checklist.",
    content: {
      whatYoullLearn: "How to prepare your voice and body before singing, how to organise a short pre-performance warm-up, how to find a comfortable starting pitch, how to prepare lyrics and musical phrases, how to manage nervousness, how to practise a complete song with confidence, and how to review a performance constructively.",
      whyItMatters: "A short, gentle preparation routine reduces uncertainty and builds the kind of confidence that actually helps — the familiarity of having already warmed up, reviewed the song, and settled a nervous mind, not the pressure of trying to be flawless.",
      theory: "Preparation differs from casual practice because a performance is meant to be carried through from beginning to end, so reviewing the song's structure, a comfortable starting pitch, and one's own state of mind beforehand all genuinely help.",
      guidedPractice: [
        "Prepared the body and voice gently, reviewed the song's structure and starting note, explored a comfortable starting pitch, practised a short mental-preparation exercise for nervousness, ran through the song with the reference, and reflected using a reusable pre-performance checklist.",
      ],
      assignment: {
        instructions: [
          "The gentle warm-up routine",
          "A comfortable starting pitch, if comfortable",
          "The pre-performance checklist",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 2, Class 27 (interactive, final class) ---------- */
  const level2FinalAssessmentClass = {
    number: 27, id: "L2C25", section: "Musical Expression and Song Application", title: "Level 2 Final Assessment & Progress Recording", category: "Vocal Technique", skillTag: "vocal",
    difficulty: "Beginner–Intermediate", estMinutes: 28,
    // Rendered by the interactive lesson in js/lessons/level2FinalAssessment.js
    interactive: "level2-final-assessment",
    subtitle: "Review, practise, record a new progress sample, and reflect on the whole Level 2 journey.",
    description: "An interactive final assessment: a concise recap of all 24 preceding classes, a short technique review, practice on the existing Song Learning song, a new Level 2 final progress recording (compared with Level 1's own final recording, if available), a gentle 12-skill self-assessment, and a celebratory Level 2 completion screen.",
    content: {
      whatYoullLearn: "A concise review of the techniques developed throughout Level 2, how to practise a short selection of familiar exercises, how to sing a complete familiar song, how to record and reflect on a new progress sample, how to compare it honestly with an earlier recording, and how to identify personal strengths and areas for future practice.",
      whyItMatters: "A final progress recording — especially one that can be compared with where a learner started — makes gradual, otherwise invisible progress genuinely visible, without needing any automated scoring or analysis.",
      theory: "Progress across a wide set of vocal skills is rarely even — some techniques become comfortable faster than others, and that unevenness is normal, not a sign of a flawed approach.",
      guidedPractice: [
        "Reviewed the Level 2 journey, warmed up gently, tried a short selection of technique-review exercises, practised the song from the Song Practice Workshop, recorded a new Level 2 final progress recording, compared it with Level 1's own final recording where available, completed a gentle 12-skill self-assessment, and reflected on the whole journey.",
      ],
      assignment: {
        instructions: [
          "The technique review, or as much of it as feels comfortable",
          "At least one phrase of the practice song",
          "The Level 2 final progress recording, if comfortable",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 3, Class 1 (interactive) ---------- */
  const introductionToSongMasteryClass = {
    number: 1, title: "Introduction to Song Mastery", category: "Song Mastery", skillTag: "vocal",
    difficulty: "Intermediate", estMinutes: 22,
    // Rendered by the interactive lesson in js/lessons/introductionToSongMastery.js
    interactive: "introduction-to-song-mastery",
    subtitle: "Song mastery grows through listening, understanding, practice, and expression — not technique alone.",
    description: "An interactive introduction to studying a complete song before singing it: listening before singing, understanding a song's real structure, studying how the melody moves, reading lyrics for meaning, building a simple practice plan, and a first practical attempt — all on the existing Song Learning & Application practice song.",
    content: {
      whatYoullLearn: "Why a song is worth studying before singing it, how to identify its sections and phrases, how melody, rhythm, lyrics, and emotion work together, how to notice which portions feel difficult, and how to build a simple, reusable song-practice plan.",
      whyItMatters: "Treating a song as something to study, not just repeat, is what turns learning a song into genuinely understanding and expressing it.",
      theory: "Songs are commonly described using sections like an opening, a verse, a chorus or refrain, repeated phrases, and an ending — though not every song has all of these; the real structure is whatever the song itself actually has.",
      guidedPractice: [
        "Listened to the complete reference song, looked at its real structure, studied how its melody moves and repeats, read its lyrics for meaning, built a simple practice plan, and attempted one phrase with its words.",
      ],
      assignment: {
        instructions: [
          "Listening to the complete reference song",
          "Studying how the melody moves",
          "One phrase, sung with its words",
        ],
        questions: []
      }
    }
  };

  /* ---------- Level 3, Class 2 (interactive) ---------- */
  const melodyAnalysisPhraseMappingClass = {
    number: 2, title: "Melody Analysis and Phrase Mapping", category: "Song Mastery", skillTag: "vocal",
    difficulty: "Intermediate", estMinutes: 22,
    // Rendered by the interactive lesson in js/lessons/melodyAnalysisPhraseMapping.js
    interactive: "melody-analysis-phrase-mapping",
    subtitle: "Don't try to sing the entire song immediately — first understand how its melody is organised.",
    description: "An interactive lesson: breaking a song's melody into smaller phrases before singing it. Covers what a musical phrase is, ascending/descending/repeated melody movement, listening for rhythm separately from melody, a real computed phrase-mapping table for the practice song, a guided exercise, and a short beginner-friendly knowledge check.",
    content: {
      whatYoullLearn: "What a musical phrase is, how to identify where a phrase begins and ends, how to recognise repeated musical patterns, how to hear whether a melody moves upward, downward, or stays on the same note, how to notice long notes, short notes, and pauses, and how to break a song into smaller sections before practising it.",
      whyItMatters: "Trying to sing an entire song at once, without first understanding how it's organised, makes an approachable song feel much harder than it actually is.",
      theory: "A melody phrase is a short musical idea, similar to a sentence in speech. Melody describes which notes move higher or lower; rhythm describes when and for how long those notes are sung — two separate things worth noticing on their own.",
      guidedPractice: [
        "Listened to short melody phrases, practised identifying ascending, descending, and repeated movement, tapped rhythm separately from melody, built a phrase-mapping table for the practice song, worked through a guided phrase-by-phrase exercise, and completed a short knowledge check.",
      ],
      assignment: {
        instructions: [
          "Identifying a few phrase boundaries by listening",
          "Guessing a phrase's melodic movement before checking it",
          "Tapping the rhythm of one phrase separately from its melody",
        ],
        questions: []
      }
    }
  };

  const CLASSES = [
    ...[...level1, breathPhraseClass, pitchStabilityClass, smoothTransitionsClass, basicDynamicsClass, dictionClass, singingPhrasesClass, connectingPhrasesClass, musicalPhrasingClass, melodicPatternsClass, melodicMovementClass, vocalCoordinationClass, vocalAgilityClass, registerAwarenessClass, singingCompleteSongClass, foundationFinalAssessmentClass].map(c => ({ ...c, levelId: 1 })),
    ...[voicePlacementClass, resonanceClass, shrutiAndFindingYourSaClass, introductionToSaptaSwarasClass, arohanaAndAvarohanaClass, basicSwaraPatternsClass, chestVoiceFoundationsClass, headVoiceFoundationsClass, connectingChestHeadClass, introMixedCoordinationClass, vowelModificationClass, resonanceToneColourClass, projectionWithoutPushingClass, registerTransitionsClass, controlledRangeDevelopmentClass, sustainedNotesStabilityClass, vocalDynamicsControlClass, vocalAgilityDevelopmentClass, toneConsistencyAcrossRangeClass, articulationAndStyleClass, expressiveSingingFoundationsClass, phraseShapingInterpretationClass, personalVocalStyleClass, applyingVocalSkillsToSongClass, songPracticeWorkshopClass, performancePreparationClass, level2FinalAssessmentClass].map(c => ({ ...c, levelId: 2 })),
    ...[introductionToSongMasteryClass, melodyAnalysisPhraseMappingClass].map(c => ({ ...c, levelId: 3 })),
    ...Object.entries(levelClassDefs).flatMap(([levelId, def]) =>
      placeholderLevel(Number(levelId), def.category, def.skillTag, def.titles, def.difficulty, def.startNumber || 1)
        .map(c => ({ ...c, levelId: Number(levelId) }))
    ),
  // `id` is now PINNED per class wherever one is explicitly set (`c.id`) — this is what
  // lets a class's `number` (its display order) change without orphaning any progress
  // already recorded under its original id. Only falls back to the old levelId+number
  // formula for a class that's never had its own explicit id assigned yet.
  ].map(c => ({ ...c, id: c.id || `L${c.levelId}C${String(c.number).padStart(2, "0")}` }));

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
