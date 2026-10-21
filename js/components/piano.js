/* ============================================================
   VIRTUAL PIANO
   Reusable interactive piano (Class 3 first; later scales,
   intervals, chords, warm-ups, ear training, keyboard lessons).

   Same pattern as Timer: render(id, opts) returns markup,
   wire(container, id, opts) attaches behaviour and returns a
   controller ({ destroy, playNote, reset, ... }).

   opts:
     startOctave  first C shown (default 3 -> C3)
     octaves      octaves shown on wide screens (default 2; phones show 1)
     range        { from, to } fixed MIDI range — disables octave selection
     controls     volume / sustain / octave / reset bar (default true)
     keyboard     computer-keyboard playing + help panel (default false;
                  enable on ONE piano per page)
     display      "Playing: C4 · 261.63 Hz" readout (default true)
     onNote       fn({ midi, name, freq, source }) on every key press
   ============================================================ */

const PianoKey = {
  /** One key. left/width are % positions (black keys only). */
  render(midi, { left, width } = {}) {
    const name = NoteUtils.name(midi);
    if (NoteUtils.isBlack(midi)) {
      return `<button type="button" class="pk pk-black" data-midi="${midi}" aria-label="${name}"
        style="left:${left}%;width:${width}%"><span class="pk-label">${name.slice(0, 2)}</span></button>`;
    }
    const letter = name[0];
    const octave = NoteUtils.octave(midi);
    return `<button type="button" class="pk pk-white" data-midi="${midi}" aria-label="${name}">
      <span class="pk-label ${letter === "C" ? "pk-label-c" : ""}">${letter}<sub>${octave}</sub></span></button>`;
  },
};

const VirtualPiano = (() => {
  // Computer keys -> semitones above the keyboard octave's C (two rows, like a DAW)
  const KEYMAP = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", "k"];
  const PREFS_KEY = "niswara.piano.prefs";
  const MIN_OCTAVE = 2, MAX_OCTAVE = 5;

  function loadPrefs() {
    try { return { volume: 0.7, sustain: false, showFreq: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; }
    catch (e) { return { volume: 0.7, sustain: false, showFreq: true }; }
  }
  function savePrefs(p) {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (e) { /* per-viewer convenience only */ }
  }

  function render(id, { controls = true, keyboard = false, display = true } = {}) {
    return `
    <div class="piano" data-piano="${id}">
      ${display ? `
      <div class="flex items-end justify-between gap-4 mb-4 min-h-[64px]">
        <div aria-live="polite">
          <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1" data-piano-status>Press any key</p>
          <div class="flex items-baseline gap-3">
            <span class="font-display text-4xl text-ink-50 leading-none piano-note-readout" data-piano-note>—</span>
            <span class="text-xs text-ink-500 tabular-nums" data-piano-freq></span>
          </div>
        </div>
        ${controls ? `<label class="text-xs text-ink-500 flex items-center gap-2 cursor-pointer select-none shrink-0">
          <input type="checkbox" data-piano-showfreq class="accent-amber-400"> Show frequency</label>` : ""}
      </div>` : ""}

      ${controls ? `
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4 text-xs text-ink-400">
        <div class="flex items-center gap-1.5" data-piano-octave-group>
          <button type="button" data-piano-octave="-1" class="piano-ctl w-8" aria-label="Lower octave">‹</button>
          <span class="tabular-nums text-ink-200 min-w-[72px] text-center" data-piano-range-label></span>
          <button type="button" data-piano-octave="1" class="piano-ctl w-8" aria-label="Higher octave">›</button>
        </div>
        <label class="flex items-center gap-2">Volume
          <input type="range" min="0" max="100" data-piano-volume class="piano-range w-24 sm:w-28" aria-label="Volume">
        </label>
        <button type="button" data-piano-sustain aria-pressed="false" class="piano-ctl px-3">Sustain <span data-piano-sustain-state>Off</span></button>
        <button type="button" data-piano-reset class="piano-ctl px-3">Reset</button>
      </div>` : ""}

      <div class="piano-case">
        <div class="piano-felt"></div>
        <div class="piano-octave-labels" data-piano-octave-labels></div>
        <div class="piano-bed" data-piano-bed></div>
      </div>

      ${keyboard ? `
      <details class="piano-kbd-help mt-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-ink-400">
        <summary class="cursor-pointer text-ink-300 select-none">Keyboard Controls</summary>
        <p class="mt-3 mb-2">Play with your computer keyboard (not while typing in a text box):</p>
        <div class="flex flex-wrap gap-1.5" data-piano-kbd-map></div>
        <p class="mt-3"><span class="kbd">Z</span> / <span class="kbd">X</span> move the keyboard one octave down / up.</p>
      </details>` : ""}
    </div>`;
  }

  function wire(container, id, opts = {}) {
    const root = container.querySelector(`[data-piano="${id}"]`);
    if (!root) return { destroy() {} };
    const {
      startOctave: defaultStart = 3, octaves = 2, range = null,
      keyboard = false, onNote,
    } = opts;

    const bed = root.querySelector("[data-piano-bed]");
    const octaveLabels = root.querySelector("[data-piano-octave-labels]");
    const noteEl = root.querySelector("[data-piano-note]");
    const freqEl = root.querySelector("[data-piano-freq]");
    const statusEl = root.querySelector("[data-piano-status]");
    const rangeLabel = root.querySelector("[data-piano-range-label]");
    const volumeEl = root.querySelector("[data-piano-volume]");
    const sustainBtn = root.querySelector("[data-piano-sustain]");
    const showFreqEl = root.querySelector("[data-piano-showfreq]");
    const kbdMap = root.querySelector("[data-piano-kbd-map]");
    const octaveGroup = root.querySelector("[data-piano-octave-group]");

    const prefs = loadPrefs();
    let startOctave = defaultStart;
    let visibleOctaves = octaves;
    let kbdOctave = 4;
    let lastMidi = null;
    const sounding = new Map();   // midi -> synth handle
    const pointers = new Map();   // pointerId -> midi
    const keysDown = new Map();   // computer key -> midi

    if (range && octaveGroup) octaveGroup.hidden = true;

    function bounds() {
      if (range) return { from: range.from, to: range.to };
      const from = (startOctave + 1) * 12;
      return { from, to: from + visibleOctaves * 12 };
    }

    function renderKeys() {
      const { from, to } = bounds();
      const whites = [];
      for (let m = from; m <= to; m++) if (!NoteUtils.isBlack(m)) whites.push(m);
      const w = 100 / whites.length;
      let html = whites.map((m) => PianoKey.render(m)).join("");
      let labels = "";
      for (let m = from; m <= to; m++) {
        const whiteIndex = whites.filter((x) => x < m).length;
        if (NoteUtils.isBlack(m)) {
          html += PianoKey.render(m, { left: whiteIndex * w - w * 0.31, width: w * 0.62 });
        } else if (m % 12 === 0 && m + 12 <= to + 1 && m < to) {
          const span = Math.min(7, whites.length - whiteIndex);
          labels += `<span style="left:${whiteIndex * w}%;width:${span * w}%">Octave ${NoteUtils.octave(m)}</span>`;
        }
      }
      bed.innerHTML = html;
      octaveLabels.innerHTML = labels;
      if (rangeLabel) rangeLabel.textContent = `${NoteUtils.name(from)} – ${NoteUtils.name(to)}`;
      const firstOct = NoteUtils.octave(from), lastOct = NoteUtils.octave(to - 1);
      kbdOctave = Math.min(Math.max(kbdOctave, firstOct), lastOct);
      renderKbdMap();
      sounding.forEach((_, m) => setDown(m, true));
    }

    function renderKbdMap() {
      if (!kbdMap) return;
      const base = (kbdOctave + 1) * 12;
      kbdMap.innerHTML = KEYMAP.map((k, i) =>
        `<span class="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2 py-1"><span class="kbd">${k.toUpperCase()}</span><span class="text-ink-300">${NoteUtils.name(base + i)}</span></span>`
      ).join("");
    }

    function keyEl(midi) { return bed.querySelector(`[data-midi="${midi}"]`); }
    function setDown(midi, down) { const el = keyEl(midi); if (el) el.classList.toggle("is-down", down); }

    function showNote(midi) {
      if (!noteEl) return;
      noteEl.textContent = NoteUtils.name(midi);
      noteEl.classList.remove("is-fresh"); void noteEl.offsetWidth; noteEl.classList.add("is-fresh");
      if (statusEl) statusEl.textContent = "Playing";
      if (freqEl) freqEl.textContent = prefs.showFreq ? NoteUtils.formatFreq(midi) : "";
    }

    function press(midi, source = "pointer") {
      if (sounding.has(midi)) sounding.get(midi).release(false); // re-strike
      sounding.set(midi, PianoSynth.noteOn(midi));
      setDown(midi, true);
      lastMidi = midi;
      showNote(midi);
      if (onNote) onNote({ midi, name: NoteUtils.name(midi), freq: NoteUtils.freq(midi), source });
    }

    function release(midi) {
      const h = sounding.get(midi);
      if (!h) return;
      h.release(prefs.sustain);
      sounding.delete(midi);
      setDown(midi, false);
    }

    function releaseAll() {
      [...sounding.keys()].forEach(release);
      pointers.clear();
      keysDown.clear();
    }

    /* ---- Pointer: mouse, touch, pen; slide across keys like a glissando ---- */
    function midiAt(x, y) {
      const el = document.elementFromPoint(x, y);
      const key = el && el.closest("[data-midi]");
      return key && bed.contains(key) ? Number(key.dataset.midi) : null;
    }
    function onPointerDown(e) {
      const key = e.target.closest("[data-midi]");
      if (!key) return;
      e.preventDefault();
      if (key.hasPointerCapture && key.hasPointerCapture(e.pointerId)) key.releasePointerCapture(e.pointerId);
      const midi = Number(key.dataset.midi);
      pointers.set(e.pointerId, midi);
      press(midi);
    }
    function onPointerMove(e) {
      if (!pointers.has(e.pointerId)) return;
      const midi = midiAt(e.clientX, e.clientY);
      const prev = pointers.get(e.pointerId);
      if (midi === null || midi === prev) return;
      release(prev);
      pointers.set(e.pointerId, midi);
      press(midi);
    }
    function onPointerUp(e) {
      if (!pointers.has(e.pointerId)) return;
      release(pointers.get(e.pointerId));
      pointers.delete(e.pointerId);
    }

    /* ---- Computer keyboard ---- */
    function isTyping(target) {
      return !!(target && target.closest && target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']"));
    }
    function onKeyDown(e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === "z" || k === "x") {
        const { from, to } = bounds();
        const next = kbdOctave + (k === "z" ? -1 : 1);
        if (next >= NoteUtils.octave(from) && next <= NoteUtils.octave(to - 1)) { kbdOctave = next; renderKbdMap(); }
        e.preventDefault();
        return;
      }
      const i = KEYMAP.indexOf(k);
      if (i === -1) return;
      e.preventDefault();
      if (e.repeat || keysDown.has(k)) return;
      const midi = (kbdOctave + 1) * 12 + i;
      keysDown.set(k, midi);
      press(midi, "keyboard");
    }
    function onKeyUp(e) {
      const k = e.key.toLowerCase();
      if (!keysDown.has(k)) return;
      release(keysDown.get(k));
      keysDown.delete(k);
    }

    /* ---- Responsive: one octave on phones ---- */
    let ro = null;
    if (!range && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => {
        const want = root.clientWidth < 560 ? 1 : octaves;
        if (want !== visibleOctaves) {
          visibleOctaves = want;
          startOctave = want === 1 ? 4 : defaultStart; // phones start on middle C
          releaseAll();
          renderKeys();
        }
      });
      ro.observe(root);
    }

    /* ---- Controls ---- */
    function syncControls() {
      if (volumeEl) volumeEl.value = Math.round(prefs.volume * 100);
      if (sustainBtn) {
        sustainBtn.setAttribute("aria-pressed", String(prefs.sustain));
        sustainBtn.classList.toggle("is-on", prefs.sustain);
        sustainBtn.querySelector("[data-piano-sustain-state]").textContent = prefs.sustain ? "On" : "Off";
      }
      if (showFreqEl) showFreqEl.checked = prefs.showFreq;
      if (freqEl) freqEl.textContent = prefs.showFreq && lastMidi !== null ? NoteUtils.formatFreq(lastMidi) : "";
      PianoSynth.setVolume(prefs.volume);
    }

    function onClick(e) {
      const oct = e.target.closest("[data-piano-octave]");
      if (oct) {
        const next = startOctave + Number(oct.dataset.pianoOctave);
        if (next >= MIN_OCTAVE && next + visibleOctaves <= MAX_OCTAVE + 2) {
          releaseAll();
          startOctave = next;
          renderKeys();
        }
      }
      if (e.target.closest("[data-piano-sustain]")) {
        prefs.sustain = !prefs.sustain;
        savePrefs(prefs);
        syncControls();
      }
      if (e.target.closest("[data-piano-reset]")) reset();
    }

    function reset() {
      releaseAll();
      PianoSynth.stopAll();
      startOctave = root.clientWidth < 560 && !range ? 4 : defaultStart;
      kbdOctave = 4;
      prefs.volume = 0.7; prefs.sustain = false;
      savePrefs(prefs);
      lastMidi = null;
      if (noteEl) noteEl.textContent = "—";
      if (statusEl) statusEl.textContent = "Press any key";
      renderKeys();
      syncControls();
    }

    const onVolume = () => { prefs.volume = Number(volumeEl.value) / 100; savePrefs(prefs); PianoSynth.setVolume(prefs.volume); };
    const onShowFreq = () => { prefs.showFreq = showFreqEl.checked; savePrefs(prefs); syncControls(); };
    const onBlur = () => releaseAll();

    if (!range && root.clientWidth && root.clientWidth < 560) { visibleOctaves = 1; startOctave = 4; }
    renderKeys();
    syncControls();

    bed.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    bed.addEventListener("contextmenu", (e) => e.preventDefault());
    root.addEventListener("click", onClick);
    if (volumeEl) volumeEl.addEventListener("input", onVolume);
    if (showFreqEl) showFreqEl.addEventListener("change", onShowFreq);
    if (keyboard) {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    }
    window.addEventListener("blur", onBlur);

    return {
      /** Plays a note with key animation (for demos driven by the lesson). */
      playNote(midi, duration = 0.8) {
        press(midi, "demo");
        setTimeout(() => release(midi), duration * 1000);
      },
      reset,
      getRange: bounds,
      destroy() {
        releaseAll();
        if (ro) ro.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("blur", onBlur);
        if (keyboard) {
          document.removeEventListener("keydown", onKeyDown);
          document.removeEventListener("keyup", onKeyUp);
        }
      },
    };
  }

  return { render, wire };
})();
