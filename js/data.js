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
      difficulty: "Beginner", estMinutes: 25,
      description: "Practice listening to a reference note and matching it with your own voice.",
      content: {
        whatYoullLearn: "How to listen to a single reference pitch and reproduce it accurately with your own voice.",
        whyItMatters: "Note-matching is the core mechanical skill behind every in-tune performance — it's the bridge between hearing pitch and producing it.",
        theory: "Matching pitch is a feedback loop: sing, listen, adjust. The goal isn't to get it perfect instantly — it's to train the loop so adjustments get smaller and faster over time.",
        guidedPractice: [
          "Play a comfortable note and hum it back, holding for 5 seconds.",
          "Try again sliding gently into the note from slightly below.",
          "Try again sliding gently into the note from slightly above.",
          "Repeat with 3 different reference notes across your comfortable range."
        ],
        assignment: {
          instructions: [
            "Record yourself matching 5 different reference notes.",
            "Note which ones felt immediately accurate and which needed adjustment.",
          ],
          questions: [
            "Which notes did I match most easily?",
            "Did I tend to sing slightly above or below the target?",
            "Did my accuracy improve across the 5 attempts?",
          ]
        }
      }
    },
    {
      number: 5, title: "Listening to Your Own Voice", category: "Ear Training", skillTag: "ear",
      difficulty: "Beginner", estMinutes: 20,
      description: "Build the habit of objective self-listening — the most important long-term skill for a recording artist.",
      content: {
        whatYoullLearn: "How to listen back to your own recordings objectively, without the discomfort most beginners feel hearing their own voice.",
        whyItMatters: "Mixing and mastering engineers spend their entire career critically listening. Learning to do this calmly, about your own voice, starts that muscle early.",
        theory: "Most people feel their voice sounds 'wrong' on playback because they're used to hearing it through bone conduction, not air. That mismatch is normal — the recording is the more accurate version of what others hear.",
        guidedPractice: [
          "Play back your Class 1 baseline recording once, just listening.",
          "Play it again, listing 3 neutral observations (not judgements).",
          "Play it a third time, listening only for pitch accuracy.",
        ],
        assignment: {
          instructions: [
            "Listen back to your Class 1 recording three times as guided above.",
            "Write down your 3 neutral observations and 1 pitch observation.",
          ],
          questions: [
            "What surprised me about my own voice?",
            "Was it easier or harder than I expected to stay neutral?",
            "What's one specific thing I'd like to improve first?",
          ]
        }
      }
    },
    {
      number: 6, title: "Rhythm & Timing", category: "Rhythm", skillTag: "rhythm",
      difficulty: "Beginner", estMinutes: 20,
      description: "Develop a steady internal sense of tempo and learn to clap, tap and sing in time.",
      content: {
        whatYoullLearn: "How to feel a steady beat internally and keep time without rushing or dragging.",
        whyItMatters: "Rhythm is invisible when it's right and obvious when it's wrong — it's the skeleton every melody, recording and mix sits on.",
        theory: "A steady pulse ('tempo') is the grid everything else lines up against. Clapping along to a metronome trains your body to feel that grid, not just hear it.",
        guidedPractice: [
          "Clap along to a slow metronome (60 BPM) for 1 minute.",
          "Clap along to a moderate metronome (100 BPM) for 1 minute.",
          "Try singing a simple phrase while tapping your foot on the beat.",
        ],
        assignment: {
          instructions: [
            "Practice clapping with a metronome at 60 and 100 BPM, 2 minutes each.",
            "Record 20 seconds of yourself singing a line while tapping time.",
          ],
          questions: [
            "Did I rush, drag, or stay steady?",
            "Was it harder to keep time while singing versus just clapping?",
            "Which tempo felt more natural to me?",
          ]
        }
      }
    },
    {
      number: 7, title: "Basic Vocal Warm-Up", category: "Vocal Technique", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 15,
      description: "Learn a simple, repeatable warm-up routine to prepare your voice before every practice session.",
      content: {
        whatYoullLearn: "A short, repeatable vocal warm-up sequence you can use before every future practice session.",
        whyItMatters: "Professional singers never skip the warm-up — it reduces strain, improves range access and makes every practice session more productive.",
        theory: "Warming up gradually increases blood flow to the vocal folds and loosens surrounding muscles, the same way a runner stretches before sprinting.",
        guidedPractice: [
          "Gentle humming, sliding up and down comfortably, 1 minute.",
          "Lip trills ('brrr') sliding through your range, 1 minute.",
          "Soft 'ng' sound (like 'sing') sliding gently, 1 minute.",
          "Easy sirens from low to high and back, 1 minute."
        ],
        assignment: {
          instructions: [
            "Run through the full 4-step warm-up and record the final siren exercise.",
          ],
          questions: [
            "Did my voice feel looser after warming up?",
            "Which exercise felt most comfortable?",
            "Which exercise felt most challenging?",
          ]
        }
      }
    },
    {
      number: 8, title: "Vocal Relaxation", category: "Vocal Health", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 15,
      description: "Learn to recognize and release tension in the jaw, neck, shoulders and tongue before and during singing.",
      content: {
        whatYoullLearn: "How to spot physical tension that interferes with singing, and simple techniques to release it.",
        whyItMatters: "Tension is the enemy of tone, range and endurance. Professionals actively manage it in every session — it's a skill, not a personality trait.",
        theory: "The jaw, tongue root, neck and shoulders are the most common tension spots for beginners. Releasing them frees your voice instead of fighting through tightness.",
        guidedPractice: [
          "Gently massage your jaw hinge in small circles for 30 seconds.",
          "Roll your shoulders backward slowly 10 times.",
          "Stick your tongue out and let it hang loose for 10 seconds, repeat 3 times.",
          "Yawn-sigh: a big relaxed yawn followed by a loose sighed 'ahh'."
        ],
        assignment: {
          instructions: [
            "Do the full relaxation sequence, then sing a familiar line and notice any difference.",
          ],
          questions: [
            "Where did I notice the most tension before starting?",
            "Did my voice feel freer afterward?",
            "What tension spot should I keep an eye on in future sessions?",
          ]
        }
      }
    },
    {
      number: 9, title: "Basic Vocal Control", category: "Vocal Technique", skillTag: "vocal",
      difficulty: "Beginner", estMinutes: 25,
      description: "Practice sustaining a note evenly and controlling volume without straining.",
      content: {
        whatYoullLearn: "How to sustain a single note with a steady, even tone and controlled volume.",
        whyItMatters: "Control is what separates a shaky first attempt from a confident, professional-sounding note — it underpins every style and genre.",
        theory: "A controlled note stays level in pitch and volume for its full duration, supported by steady breath rather than throat tension.",
        guidedPractice: [
          "Sustain a comfortable note for 5 seconds, aiming for an even volume.",
          "Sustain the same note starting soft, growing louder, then softer again.",
          "Repeat on 3 different comfortable notes."
        ],
        assignment: {
          instructions: [
            "Record a 5-second sustained note, then a soft-loud-soft swell on another note.",
          ],
          questions: [
            "Did my pitch stay steady for the full sustain?",
            "Was the volume swell smooth or jumpy?",
            "What felt different compared to Class 1?",
          ]
        }
      }
    },
    {
      number: 10, title: "First Progress Recording", category: "Recording", skillTag: "recording",
      difficulty: "Beginner", estMinutes: 30,
      description: "Record your first structured check-in and compare it honestly against your Day-1 baseline.",
      content: {
        whatYoullLearn: "How to record a consistent, structured progress check-in — the same format you'll repeat throughout this journey.",
        whyItMatters: "This is the first entry in your Before/After story — a real, honest record of where Foundation level took you.",
        theory: "Consistent progress recordings (same format, same conditions) are the only reliable way to actually hear improvement rather than imagine it.",
        guidedPractice: [
          "Warm up using your Class 7 routine.",
          "Sing the same song line you used in Class 1.",
          "Sustain a comfortable note for 5 seconds.",
          "Speak the same sentence you used in Class 1."
        ],
        assignment: {
          instructions: [
            "Record: the same song line, a sustained note, and the same spoken sentence from Class 1.",
            "Upload this as your Day 30 (or current day) milestone on the Before/After timeline.",
          ],
          questions: [
            "What's clearly improved since Class 1?",
            "What still needs work?",
            "How did breathing, pitch and control each feel compared to Day 1?",
            "What am I most proud of from Foundation level?",
          ]
        }
      }
    },
  ];

  /* ---------- Placeholder classes for Levels 2–8 ---------- */
  function placeholderLevel(levelId, category, skillTag, titles, difficulty) {
    return titles.map((title, i) => ({
      number: i + 1,
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
    ...level1.map(c => ({ ...c, levelId: 1 })),
    ...Object.entries(levelClassDefs).flatMap(([levelId, def]) =>
      placeholderLevel(Number(levelId), def.category, def.skillTag, def.titles, def.difficulty)
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

  return { LEVELS, CLASSES, RESOURCE_TOPICS, MILESTONES, PROJECTS_SEED, ACHIEVEMENTS, QUOTES, PRACTICE_TASKS, SKILL_LABELS };
})();
