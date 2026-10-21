/* ============================================================
   VOCAL RECORDING — "Sing the Note"
   Choose a comfortable note -> hear the reference -> sing ->
   record -> play back and self-evaluate.

   Class 3 is purely "Self Evaluation" by design — the learner is
   only just meeting pitch. Recording itself is VoiceRecorder;
   pitch estimates (PitchAnalysis) are introduced in Class 4.
   ============================================================ */

const VocalRecording = (() => {
  const MAX_SECONDS = 30;

  function render(id, { notes }) {
    return `
    <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7" data-vocal="${id}">
      <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.06] px-4 py-3 text-sm text-teal-300 mb-6 flex gap-3">
        <span class="mt-0.5">${icon("mic", "w-4 h-4")}</span>
        <span><strong class="font-medium">Choose a comfortable note. Do not strain to reach a note.</strong>
        Sing gently, at speaking volume. If anything feels tight, scratchy or painful, stop and choose a lower or easier note — there's no prize for high notes today.</span>
      </div>

      <p class="text-xs text-ink-500 uppercase tracking-wide mb-2">1 · Choose a comfortable note</p>
      <div class="flex flex-wrap gap-2 mb-2" data-vocal-notes>
        ${notes.map((m) => `<button type="button" data-vocal-note="${m}" class="ex-chip tabular-nums">${NoteUtils.name(m)}</button>`).join("")}
      </div>
      <p class="text-xs text-ink-500 mb-6">Deeper voices usually find C3–G3 easy; lighter voices often prefer C4–G4. Hum a few — pick the one that feels effortless.</p>

      <p class="text-xs text-ink-500 uppercase tracking-wide mb-3">2 – 5 · Listen, sing, record</p>
      <div class="flex flex-wrap gap-2.5 mb-4">
        <button type="button" data-vocal-ref disabled class="vr-btn">${icon("play", "w-4 h-4")} Play Reference</button>
        <button type="button" data-vocal-record disabled class="vr-btn vr-btn-primary"><span class="vr-rec-dot"></span> Record</button>
        <button type="button" data-vocal-stop disabled class="vr-btn">■ Stop</button>
        <button type="button" data-vocal-playback disabled class="vr-btn">${icon("waveform", "w-4 h-4")} Play My Recording</button>
      </div>
      <div class="flex items-center gap-3 min-h-[1.5rem] mb-1">
        <div class="h-1.5 w-28 rounded-full bg-white/5 overflow-hidden" aria-hidden="true"><div class="h-full bg-gold-400/80 w-0 transition-[width] duration-75" data-vocal-level></div></div>
        <p class="text-sm text-ink-400" data-vocal-status aria-live="polite">Pick a note to begin.</p>
      </div>
      <p class="text-xs text-ink-600 mb-6">Tip: play the reference, hum it quietly once, then press Record and sing it on "ah" or "mm" for 3–5 seconds.</p>

      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4" data-vocal-eval hidden>
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-1">Self Evaluation</p>
        <p class="text-sm text-ink-300 mb-1">Play the reference, then your recording. How did they compare?</p>
        <p class="text-xs text-ink-500 mb-3">Niswara doesn't analyse your pitch automatically yet — this is about training your own ears, which is exactly the skill this class builds.</p>
        <div class="flex flex-wrap gap-2" data-vocal-eval-options>
          ${[["same", "Sounded the same"], ["higher", "My voice was higher"], ["lower", "My voice was lower"], ["unsure", "Not sure yet"]]
            .map(([v, l]) => `<button type="button" data-vocal-eval-choice="${v}" class="ex-chip">${l}</button>`).join("")}
        </div>
        <p class="text-xs text-ink-400 mt-3" data-vocal-eval-note></p>
      </div>

      <p class="text-xs text-ink-600 mt-5">No microphone right now? <button type="button" data-vocal-skip class="underline hover:text-ink-300">I sang along without recording</button></p>
    </div>`;
  }

  /**
   * opts: classId, exerciseId, lastRecording (upload or null), lastNote (midi or null), lastEvaluation,
   *       onRecorded(upload), onEvaluate(choice, note), onSkip()
   */
  function wire(container, id, opts) {
    const root = container.querySelector(`[data-vocal="${id}"]`);
    if (!root) return { destroy() {} };
    const { classId, lastRecording, lastNote, lastEvaluation, onRecorded, onEvaluate, onSkip } = opts;
    const $ = (s) => root.querySelector(s);
    const refBtn = $("[data-vocal-ref]"), recBtn = $("[data-vocal-record]"), stopBtn = $("[data-vocal-stop]"), playBtn = $("[data-vocal-playback]");
    const statusEl = $("[data-vocal-status]"), levelEl = $("[data-vocal-level]");
    const evalBox = $("[data-vocal-eval]"), evalNote = $("[data-vocal-eval-note]");

    let note = lastNote ?? null;
    let recording = lastRecording || null;
    let session = null;   // VoiceRecorder session while recording
    let playing = false;

    const supportsRecording = VoiceRecorder.isSupported();

    function setStatus(text) { statusEl.textContent = text; }

    function syncButtons() {
      const isRec = !!session;
      refBtn.disabled = note === null || isRec;
      recBtn.disabled = note === null || isRec || !supportsRecording;
      stopBtn.disabled = !isRec && !playing;
      playBtn.disabled = !recording || isRec;
      recBtn.classList.toggle("is-recording", isRec);
      root.querySelectorAll("[data-vocal-note]").forEach((b) => b.classList.toggle("is-selected", Number(b.dataset.vocalNote) === note));
      evalBox.hidden = !recording;
    }

    function chooseNote(m) {
      note = m;
      setStatus(`${NoteUtils.name(m)} selected. Play the reference and listen.`);
      PianoSynth.play(m, { duration: 1.2 });
      syncButtons();
    }

    async function startRecording() {
      if (!supportsRecording) { setStatus("Recording isn't supported in this browser."); return; }
      try {
        session = await VoiceRecorder.start({
          maxSeconds: MAX_SECONDS,
          onTick: (s) => setStatus(`Recording… ${Utils.formatSeconds(s)} — sing ${NoteUtils.name(note)} gently`),
          onLevel: (v) => { levelEl.style.width = `${Math.round(v * 100)}%`; },
        });
      } catch (e) {
        setStatus("Microphone access was blocked. Allow it in your browser's site settings, or use “I sang along without recording”.");
        return;
      }
      playing = false;
      setStatus(`Recording… sing ${NoteUtils.name(note)} gently`);
      syncButtons();
      const take = await session.ended; // resolves when the recording ends (Stop or time limit); null if cancelled
      session = null;
      if (take) await keep(take);
      else syncButtons();
    }

    async function keep(take) {
      if (!take.blob.size) { setStatus("Nothing was recorded — try again."); syncButtons(); return; }
      const upload = await VoiceRecorder.saveToClass(classId, take, {
        name: `Sing the note — ${NoteUtils.name(note)}`,
        exercise: "sing-the-note", referenceNote: NoteUtils.name(note),
      });
      if (!upload) { setStatus("Couldn't save the recording on this device."); syncButtons(); return; }
      recording = upload;
      evalNote.textContent = "";
      root.querySelectorAll("[data-vocal-eval-choice]").forEach((b) => b.classList.remove("is-selected"));
      setStatus(`Saved (${take.seconds}s). Now compare: Play Reference, then Play My Recording.`);
      syncButtons();
      if (onRecorded) onRecorded(upload);
    }

    async function playRecording() {
      if (!recording) return;
      const ok = await VoiceRecorder.play(recording.mediaId, {
        onEnded: () => { playing = false; setStatus("Playback finished."); syncButtons(); },
      });
      if (!ok) { setStatus("That recording isn't stored on this device any more."); return; }
      playing = true;
      setStatus(`Playing your recording${recording.referenceNote ? ` (reference ${recording.referenceNote})` : ""}…`);
      syncButtons();
    }

    function onClick(e) {
      const n = e.target.closest("[data-vocal-note]");
      if (n) { chooseNote(Number(n.dataset.vocalNote)); return; }
      if (e.target.closest("[data-vocal-ref]") && note !== null) {
        setStatus(`Listen to ${NoteUtils.name(note)}… then hum it quietly.`);
        PianoSynth.play(note, { duration: 1.6 }).then(() => { if (!session) setStatus(`When you're ready, press Record and sing ${NoteUtils.name(note)}.`); });
        return;
      }
      if (e.target.closest("[data-vocal-record]")) { startRecording(); return; }
      if (e.target.closest("[data-vocal-stop]")) {
        if (session) session.stop();
        else if (playing) { VoiceRecorder.stopPlayback(); playing = false; setStatus("Stopped."); syncButtons(); }
        return;
      }
      if (e.target.closest("[data-vocal-playback]")) { playRecording(); return; }
      const ev = e.target.closest("[data-vocal-eval-choice]");
      if (ev) {
        root.querySelectorAll("[data-vocal-eval-choice]").forEach((b) => b.classList.toggle("is-selected", b === ev));
        const tips = {
          same: "Lovely. Matching a note by ear is the core singing skill — keep doing this daily.",
          higher: "Useful to notice! Next time, start the note a little lower and slide up gently until it matches.",
          lower: "Useful to notice! Try thinking the note slightly higher before you start, without pushing.",
          unsure: "Completely normal at this stage. Play them back-to-back a few times — the difference gets easier to hear.",
        };
        evalNote.textContent = tips[ev.dataset.vocalEvalChoice];
        if (onEvaluate) onEvaluate(ev.dataset.vocalEvalChoice, recording && recording.referenceNote);
        return;
      }
      if (e.target.closest("[data-vocal-skip]")) {
        setStatus("Marked as sung without recording. You can still record later.");
        if (onSkip) onSkip();
      }
    }

    root.addEventListener("click", onClick);
    if (recording) {
      setStatus(`Your last recording (reference ${recording.referenceNote || "—"}) is saved on this device.`);
      if (lastEvaluation) {
        const b = root.querySelector(`[data-vocal-eval-choice="${lastEvaluation}"]`);
        if (b) b.classList.add("is-selected");
      }
    } else if (note !== null) {
      setStatus(`${NoteUtils.name(note)} selected. Play the reference and listen.`);
    }
    if (!supportsRecording) setStatus("Recording isn't supported in this browser — you can still sing along with the reference.");
    syncButtons();

    return {
      destroy() {
        root.removeEventListener("click", onClick);
        if (session) { session.cancel(); session = null; }
        if (playing) VoiceRecorder.stopPlayback();
      },
    };
  }

  return { render, wire };
})();
