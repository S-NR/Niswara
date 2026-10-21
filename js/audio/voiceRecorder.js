/* ============================================================
   VOICE RECORDER — the shared recording engine.
   Microphone access, MediaRecorder, a live input-level meter,
   saving a take (file -> Media/IndexedDB and, via CloudSync, the
   account; metadata -> Store uploads) and playback.

   Used by Class 3's VocalRecording and Class 4's PitchMatchExercise.
   Only one recording and one playback run at a time page-wide.
   ============================================================ */

const VoiceRecorder = (() => {
  let active = null;  // current recording session
  let player = null;  // current playback <audio>

  function isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  /**
   * Starts recording. opts: maxSeconds, onTick(seconds), onLevel(0–1).
   * Resolves to a session { ended, stop() -> Promise<{ blob, type, seconds }>, cancel() }.
   * Rejects with { reason: "unsupported" | "denied" }.
   */
  async function start({ maxSeconds = 30, onTick, onLevel } = {}) {
    if (!isSupported()) throw { reason: "unsupported" };
    if (active) active.cancel();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      throw { reason: "denied", error };
    }
    PianoSynth.stopAll();
    stopPlayback();

    const chunks = [];
    const recorder = new MediaRecorder(stream);
    const startedAt = Date.now();
    let discarded = false, timer = null, meterCtx = null, raf = null;

    // Live level meter — confirms the microphone is hearing you; it is not a pitch judgement
    if (onLevel) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        meterCtx = new AC();
        const analyser = meterCtx.createAnalyser();
        analyser.fftSize = 512;
        meterCtx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let peak = 0;
          for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
          onLevel(Math.min(1, (peak / 128) * 1.6));
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) { /* the meter is a nicety; recording still works */ }
    }

    function release() {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      if (meterCtx) meterCtx.close().catch(() => {});
      if (onLevel) onLevel(0);
      stream.getTracks().forEach((t) => t.stop());
    }

    const stopped = new Promise((resolve) => {
      recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = () => {
        release();
        if (active === session) active = null;
        const type = recorder.mimeType || "audio/webm";
        resolve(discarded ? null : { blob: new Blob(chunks, { type }), type, seconds: Math.round((Date.now() - startedAt) / 1000) });
      };
    });

    const session = {
      /** Resolves when the take ends (stop(), time limit) with { blob, type, seconds }, or null if cancelled. */
      ended: stopped,
      stop() {
        if (recorder.state !== "inactive") recorder.stop();
        return stopped;
      },
      cancel() {
        discarded = true;
        if (recorder.state !== "inactive") recorder.stop();
      },
    };

    recorder.start();
    active = session;
    timer = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      if (onTick) onTick(s);
      if (s >= maxSeconds) session.stop();
    }, 250);
    return session;
  }

  function extFor(type) {
    return type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
  }

  /**
   * Keeps a take: file -> Media (synced to the account by CloudSync), metadata -> the class's uploads.
   * meta: { name, exercise, ... } Resolves to the upload record, or null if the device couldn't store it.
   */
  async function saveToClass(classId, { blob, type, seconds }, meta = {}) {
    const mediaId = await Media.save(blob).catch(() => null);
    if (!mediaId) {
      window.dispatchEvent(new CustomEvent("store:persist-failed"));
      return null;
    }
    const upload = {
      type, date: new Date().toISOString(), mediaId, seconds,
      ...meta,
      name: `${meta.name || "Recording"}.${extFor(type)}`,
    };
    Store.addUpload(classId, upload);
    return upload;
  }

  /** Plays a saved take (downloads it from the account if it was recorded on another device). Resolves to true if it started. */
  async function play(mediaId, { onEnded } = {}) {
    const url = await Media.getUrl(mediaId).catch(() => null);
    if (!url) return false;
    stopPlayback();
    PianoSynth.stopAll();
    const audio = new Audio(url);
    player = audio;
    audio.onended = () => { if (player === audio) player = null; if (onEnded) onEnded(); };
    try { await audio.play(); } catch (e) { return false; }
    return true;
  }

  function stopPlayback() {
    if (player) { player.pause(); player = null; }
  }

  function isPlaying() { return !!(player && !player.paused); }

  function isRecording() { return !!active; }

  return { isSupported, start, saveToClass, play, stopPlayback, isPlaying, isRecording, extFor };
})();
