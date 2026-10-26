/* ============================================================
   PIANO SYNTH
   Web Audio piano tone + note helpers. No audio files: each note
   is a few tuned oscillators (fundamental + soft overtones)
   through a closing low-pass filter and a piano-like envelope —
   bright attack, quick settle, natural decay.

   Shared by VirtualPiano, the ear-training exercises and the
   vocal reference player, so all of them sound the same and use
   one volume setting.
   ============================================================ */

const NoteUtils = {
  NAMES: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],

  /** MIDI number -> "C4" (60 = C4 = middle C). */
  name(midi) { return this.NAMES[midi % 12] + (Math.floor(midi / 12) - 1); },

  /** "C4" / "F#3" -> MIDI number. */
  fromName(name) {
    const m = /^([A-G]#?)(-?\d)$/.exec(name);
    return (Number(m[2]) + 1) * 12 + this.NAMES.indexOf(m[1]);
  },

  /** Equal temperament, A4 = 440 Hz. */
  freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); },

  formatFreq(midi) { return `${this.freq(midi).toFixed(2)} Hz`; },

  isBlack(midi) { return [1, 3, 6, 8, 10].includes(midi % 12); },

  octave(midi) { return Math.floor(midi / 12) - 1; },
};

const PianoSynth = (() => {
  let ctx = null;
  let master = null;
  let volume = 0.7;
  const active = new Set();

  /** Lazily creates the AudioContext (browsers only allow it after a user gesture). */
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.ratio.value = 3;
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(compressor);
      compressor.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
  }

  function getVolume() { return volume; }

  /**
   * Starts a note. velocity 0–1 sets loudness (used by the pitch-vs-loudness demo).
   * Returns a handle: release(sustain) — with sustain the note rings out naturally.
   */
  function noteOn(midi, { velocity = 0.85 } = {}) {
    const ac = ensure();
    if (!ac) return { release() {} };
    const f = NoteUtils.freq(midi);
    const t = ac.currentTime;
    // Low notes ring longer than high ones, like real strings
    const decay = Math.max(1.4, 5 - (midi - 48) * 0.07);
    const peak = 0.3 * Math.max(0.05, velocity);

    const out = ac.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    out.gain.exponentialRampToValueAtTime(peak * 0.4, t + 0.3);
    out.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    // Bright hammer attack that mellows as the note sustains
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.4;
    filter.frequency.setValueAtTime(Math.min(f * 9, 14000), t);
    filter.frequency.exponentialRampToValueAtTime(Math.min(f * 3, 7000), t + 0.8);
    filter.connect(out);
    out.connect(master);

    // [harmonic, level, waveform, detune cents]
    const partials = [[1, 1, "triangle", 0], [1, 0.25, "sine", 4], [2, 0.28, "sine", -3], [3, 0.1, "sine", 2], [4, 0.04, "sine", 0]];
    const oscs = partials.map(([mult, level, type, detune]) => {
      const osc = ac.createOscillator();
      osc.type = type;
      osc.frequency.value = f * mult;
      osc.detune.value = detune;
      const g = ac.createGain();
      g.gain.value = level;
      osc.connect(g);
      g.connect(filter);
      osc.start(t);
      osc.stop(t + decay + 0.05);
      return osc;
    });

    let released = false;
    const handle = {
      release(sustain = false) {
        if (released) return;
        released = true;
        active.delete(handle);
        if (sustain) return; // let the natural decay ring out
        const now = ac.currentTime;
        if (out.gain.cancelAndHoldAtTime) out.gain.cancelAndHoldAtTime(now);
        else { out.gain.cancelScheduledValues(now); out.gain.setValueAtTime(out.gain.value || 0.0001, now); }
        out.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        oscs.forEach((o) => { try { o.stop(now + 0.2); } catch (e) { /* already stopped */ } });
      },
    };
    active.add(handle);
    oscs[0].onended = () => active.delete(handle);
    return handle;
  }

  /** Plays one note for a fixed time. Resolves when it has finished sounding. */
  function play(midi, { duration = 0.9, velocity } = {}) {
    const h = noteOn(midi, { velocity });
    return new Promise((resolve) => setTimeout(() => { h.release(); resolve(); }, duration * 1000));
  }

  /**
   * Plays notes one after another. onNote(index, midi) fires as each starts (for highlighting).
   * Returns a promise; call the returned promise's cancel() to stop early.
   */
  function playSequence(notes, { duration = 0.85, gap = 0.25, velocity, onNote } = {}) {
    let cancelled = false;
    let current = null;
    const p = (async () => {
      for (let i = 0; i < notes.length && !cancelled; i++) {
        const n = notes[i];
        const midi = typeof n === "number" ? n : n.midi;
        const vel = typeof n === "number" ? velocity : (n.velocity ?? velocity);
        const dur = typeof n === "number" ? duration : (n.duration ?? duration);
        if (onNote) onNote(i, midi);
        current = noteOn(midi, { velocity: vel });
        await new Promise((r) => setTimeout(r, dur * 1000));
        current.release();
        if (i < notes.length - 1) await new Promise((r) => setTimeout(r, gap * 1000));
      }
      if (onNote) onNote(-1, null);
    })();
    p.cancel = () => { cancelled = true; if (current) current.release(); };
    return p;
  }

  function stopAll() {
    [...active].forEach((h) => h.release(false));
  }

  /**
   * A soft, voice-like sustained tone (not a piano) that can glide smoothly from one pitch to
   * another — used for listening examples ("smooth transition"). Resolves when finished.
   */
  function tone(fromMidi, toMidi = fromMidi, { duration = 1.2, glideAt = 0.35, glideTime = 0.4, velocity = 0.7 } = {}) {
    const ac = ensure();
    if (!ac) return Promise.resolve();
    const t = ac.currentTime;
    const out = ac.createGain();
    const peak = 0.22 * velocity;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(peak, t + 0.08);
    out.gain.setValueAtTime(peak, t + duration - 0.15);
    out.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    filter.connect(out);
    out.connect(master);
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(NoteUtils.freq(fromMidi), t);
    osc.frequency.setValueAtTime(NoteUtils.freq(fromMidi), t + duration * glideAt);
    osc.frequency.linearRampToValueAtTime(NoteUtils.freq(toMidi), t + duration * glideAt + glideTime);
    const vib = ac.createOscillator();
    const vibGain = ac.createGain();
    vib.frequency.value = 5;
    vibGain.gain.value = 2.5;
    vib.connect(vibGain);
    vibGain.connect(osc.frequency);
    osc.connect(filter);
    osc.start(t); vib.start(t);
    osc.stop(t + duration + 0.05); vib.stop(t + duration + 0.05);
    return new Promise((r) => setTimeout(r, duration * 1000));
  }

  /** A short breath-like noise (filtered noise burst) — for the "breath sound" listening example. */
  function breath({ duration = 0.6, velocity = 0.5 } = {}) {
    const ac = ensure();
    if (!ac) return Promise.resolve();
    const t = ac.currentTime;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * duration), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1500;
    band.Q.value = 0.6;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18 * velocity, t + duration * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(band); band.connect(g); g.connect(master);
    src.start(t);
    return new Promise((r) => setTimeout(r, duration * 1000));
  }

  return { isSupported, ensure, noteOn, play, playSequence, stopAll, setVolume, getVolume, tone, breath };
})();
