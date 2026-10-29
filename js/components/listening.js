/* ============================================================
   SELF-LISTENING TOOLS (Class 5 first; reusable anywhere a learner
   reviews their own recording).

     Waveform              amplitude peaks of a take — loudness / signal
                           shape over time. NOT pitch. (Pitch, where
                           shown elsewhere, is PitchAnalysis — a separate,
                           clearly labelled estimate.)
     WaveformPlayer        play / pause / seek / replay / replay a section,
                           marker pins on the waveform
     RecordingMarkers      "00:07 — word became unclear" notes on a take
     RecordingCard         record a take (VoiceRecorder) and review it in a
                           WaveformPlayer
     ListeningPasses       guided listens ("just listen", "only pitch", …)
     ObservationChecklist  multi-select "I noticed…" chips per category

   Future analysis seam: anything that needs the decoded audio of a take
   (volume envelope, timing, breath, spectral views, pitch curve) should
   start from PitchAnalysis.decode(blob) like Waveform.analyze does, and be
   shown as its own labelled panel — never presented as AI judgement unless
   it really is one.
   ============================================================ */

const Waveform = {
  /** -> { peaks: [0–1], duration } — peak loudness per slice of the recording. */
  async analyze(blob, buckets = 160) {
    const { samples, sampleRate } = await PitchAnalysis.decode(blob);
    const size = Math.max(1, Math.floor(samples.length / buckets));
    const peaks = [];
    let max = 0;
    for (let b = 0; b < buckets; b++) {
      let p = 0;
      const end = Math.min(samples.length, (b + 1) * size);
      for (let i = b * size; i < end; i++) { const v = Math.abs(samples[i]); if (v > p) p = v; }
      peaks.push(p);
      if (p > max) max = p;
    }
    return { peaks: peaks.map((p) => (max ? p / max : 0)), duration: samples.length / sampleRate };
  },

  svg(peaks) {
    const bw = 4, H = 80;
    return `<svg viewBox="0 0 ${peaks.length * bw} ${H}" preserveAspectRatio="none" class="w-full h-full" aria-hidden="true">
      ${peaks.map((p, i) => {
        const h = Math.max(1.5, p * (H - 8));
        return `<rect x="${i * bw + 0.6}" y="${(H - h) / 2}" width="${bw - 1.2}" height="${h}" rx="1.2" class="wf-bar"/>`;
      }).join("")}
    </svg>`;
  },
};

const WaveformPlayer = (() => {
  function render(id, { section = false } = {}) {
    return `
      <div class="wf-player" data-wf="${id}">
        <div class="wf-stage relative h-20 sm:h-24 rounded-xl bg-ink-950/70 border border-white/5 overflow-hidden cursor-pointer select-none"
             data-wf-stage tabindex="0" role="slider" aria-label="Position in your recording" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">
          <div class="absolute inset-0 px-1 py-2" data-wf-bars><p class="text-xs text-ink-500 p-3">Loading your recording…</p></div>
          <div class="wf-section absolute top-0 bottom-0" data-wf-section hidden></div>
          <div class="absolute inset-0 pointer-events-none" data-wf-markers></div>
          <div class="wf-playhead absolute top-0 bottom-0" data-wf-playhead style="left:0"></div>
        </div>
        <div class="flex flex-wrap items-center gap-2 mt-3">
          <button type="button" data-wf-toggle class="vr-btn vr-btn-gold" disabled>${icon("play", "w-4 h-4")} <span>Play</span></button>
          <button type="button" data-wf-replay class="vr-btn" disabled>↺ Replay</button>
          <span class="text-xs text-ink-400 tabular-nums ml-1" data-wf-time>00:00 / 00:00</span>
        </div>
        <p class="text-[11px] text-ink-600 mt-2">Basic audio visualization: the waveform shows how <em>loud</em> your sound is over time — it does not show pitch. Tap it to jump to a moment.</p>
        ${section ? `
        <div class="rounded-xl border border-white/5 bg-white/[0.02] p-3 mt-3" data-wf-section-tools>
          <p class="text-xs text-ink-300 mb-2">Replay a section — pick a few seconds and listen closely.</p>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span class="inline-flex items-center gap-1.5">
              <span class="text-ink-500 w-8">From</span>
              <button type="button" data-wf-nudge="start:-1" class="piano-ctl w-7" aria-label="Start earlier">−</button>
              <span class="tabular-nums text-ink-100 w-11 text-center" data-wf-start>00:00</span>
              <button type="button" data-wf-nudge="start:1" class="piano-ctl w-7" aria-label="Start later">+</button>
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="text-ink-500 w-8">to</span>
              <button type="button" data-wf-nudge="end:-1" class="piano-ctl w-7" aria-label="End earlier">−</button>
              <span class="tabular-nums text-ink-100 w-11 text-center" data-wf-end>00:05</span>
              <button type="button" data-wf-nudge="end:1" class="piano-ctl w-7" aria-label="End later">+</button>
            </span>
            <span class="inline-flex items-center gap-1.5">
              <button type="button" data-wf-set="start" class="piano-ctl px-2.5">Start here</button>
              <button type="button" data-wf-set="end" class="piano-ctl px-2.5">End here</button>
            </span>
            <button type="button" data-wf-play-section class="vr-btn sm:ml-auto">${icon("play", "w-3.5 h-3.5")} Play Section</button>
          </div>
        </div>` : ""}
      </div>`;
  }

  /** opts: mediaId, markers. Returns api { ready, on(evt, fn), play, pause, playFrom, getTime, getDuration, setMarkers, getSection, destroy } */
  function wire(container, id, { mediaId, markers = [] } = {}) {
    const root = container.querySelector(`[data-wf="${id}"]`);
    const listeners = { time: [], ended: [], play: [] };
    const emit = (e, d) => listeners[e].forEach((fn) => { try { fn(d); } catch (err) { console.error(err); } });
    if (!root) return { ready: Promise.resolve(false), on() {}, destroy() {} };
    const $ = (s) => root.querySelector(s);
    const stage = $("[data-wf-stage]"), bars = $("[data-wf-bars]"), head = $("[data-wf-playhead]");
    const toggle = $("[data-wf-toggle]"), replay = $("[data-wf-replay]"), timeEl = $("[data-wf-time]");
    const sectionEl = $("[data-wf-section]"), markersEl = $("[data-wf-markers]");

    let audio = null, duration = 0, raf = null, stopAt = null, fromStart = false, destroyed = false;
    let section = { start: 0, end: 5 };
    let marks = markers.slice();
    const token = `wf:${id}:${Math.random().toString(36).slice(2, 6)}`;

    const fmt = (s) => Utils.formatSeconds(Math.max(0, Math.round(s)));
    const pos = () => (audio ? Math.min(duration, audio.currentTime) : 0);

    function paint() {
      const t = pos();
      head.style.left = duration ? `${(t / duration) * 100}%` : "0";
      timeEl.textContent = `${fmt(t)} / ${fmt(duration)}`;
      stage.setAttribute("aria-valuenow", String(Math.round(t)));
      stage.setAttribute("aria-valuetext", fmt(t));
    }
    function paintSection() {
      if (!$("[data-wf-section-tools]")) return;
      $("[data-wf-start]").textContent = fmt(section.start);
      $("[data-wf-end]").textContent = fmt(section.end);
      sectionEl.hidden = false;
      sectionEl.style.left = `${(section.start / duration) * 100}%`;
      sectionEl.style.width = `${((section.end - section.start) / duration) * 100}%`;
    }
    function paintMarkers() {
      markersEl.innerHTML = duration ? marks.map((m) => `<span class="wf-pin" style="left:${(m.t / duration) * 100}%" title="${fmt(m.t)} — ${Utils.escapeHtml(m.note || "")}"></span>`).join("") : "";
    }
    function setPlayingUi(on) {
      toggle.innerHTML = `${icon(on ? "pause" : "play", "w-4 h-4")} <span>${on ? "Pause" : "Play"}</span>`;
    }
    function loop() {
      paint();
      emit("time", pos());
      if (stopAt !== null && pos() >= stopAt) { pause(); stopAt = null; return; }
      if (audio && !audio.paused) raf = requestAnimationFrame(loop);
    }

    function play() {
      if (!audio) return;
      VoiceRecorder.announce(token);
      PianoSynth.stopAll();
      if (stopAt === null && pos() < 0.05) fromStart = true; // Play pressed at 0:00 counts as a full listen
      audio.play().then(() => { setPlayingUi(true); emit("play", pos()); loop(); }).catch((err) => {
        console.warn("[WaveformPlayer] couldn't play this recording:", err);
        timeEl.textContent = "Couldn't play this recording" + (err && err.name ? ` (${err.name})` : "");
      });
    }
    function pause() {
      if (!audio) return;
      audio.pause();
      cancelAnimationFrame(raf);
      setPlayingUi(false);
      paint();
    }
    function seek(t) {
      if (!audio) return;
      audio.currentTime = Math.max(0, Math.min(duration - 0.05, t));
      fromStart = false;
      paint();
      emit("time", pos());
    }
    /** Play from t; until = stop time (a section) or null for to-the-end. */
    function playFrom(t, until = null) {
      seek(t);
      fromStart = t === 0 && until === null;
      stopAt = until;
      play();
    }

    // Seek by tapping / dragging on the waveform, or with the keyboard
    let dragging = false;
    const seekToEvent = (e) => {
      const r = stage.getBoundingClientRect();
      seek(((e.clientX - r.left) / r.width) * duration);
    };
    stage.addEventListener("pointerdown", (e) => { if (!audio) return; dragging = true; stage.setPointerCapture(e.pointerId); seekToEvent(e); });
    stage.addEventListener("pointermove", (e) => { if (dragging) seekToEvent(e); });
    stage.addEventListener("pointerup", () => { dragging = false; });
    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { seek(pos() - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { seek(pos() + 1); e.preventDefault(); }
      if (e.key === " ") { audio && audio.paused ? play() : pause(); e.preventDefault(); }
    });

    function onClick(e) {
      if (e.target.closest("[data-wf-toggle]")) { audio.paused ? play() : pause(); return; }
      if (e.target.closest("[data-wf-replay]")) { playFrom(0); return; }
      const nudge = e.target.closest("[data-wf-nudge]");
      if (nudge) {
        const [which, d] = nudge.dataset.wfNudge.split(":");
        section[which] = Math.max(0, Math.min(duration, section[which] + Number(d)));
        if (section.end - section.start < 1) {
          if (which === "start") section.end = Math.min(duration, section.start + 1); else section.start = Math.max(0, section.end - 1);
        }
        paintSection();
        return;
      }
      const set = e.target.closest("[data-wf-set]");
      if (set) {
        const t = pos();
        if (set.dataset.wfSet === "start") { section.start = t; if (section.end <= t + 0.5) section.end = Math.min(duration, t + 3); }
        else { section.end = Math.max(t, section.start + 0.5); }
        paintSection();
        return;
      }
      if (e.target.closest("[data-wf-play-section]")) playFrom(section.start, section.end);
    }
    root.addEventListener("click", onClick);

    const onOtherAudio = (e) => { if (e.detail.source !== token && audio && !audio.paused) pause(); };
    window.addEventListener("niswara:audio-start", onOtherAudio);

    const ready = (async () => {
      const url = await Media.getUrl(mediaId).catch(() => null);
      if (destroyed) return false;
      if (!url) { bars.innerHTML = `<p class="text-xs text-ink-500 p-3">This recording isn't available on this device yet.</p>`; return false; }
      try {
        const wave = await Waveform.analyze(await (await fetch(url)).blob());
        if (destroyed) return false;
        duration = wave.duration;
        bars.innerHTML = Waveform.svg(wave.peaks);
      } catch (e) {
        bars.innerHTML = `<p class="text-xs text-ink-500 p-3">Couldn't draw this recording, but you can still play it.</p>`;
      }
      audio = new Audio(url);
      audio.preload = "auto";
      audio.addEventListener("ended", () => {
        cancelAnimationFrame(raf);
        setPlayingUi(false);
        paint();
        emit("ended", { fromStart });
        fromStart = false;
      });
      audio.addEventListener("pause", () => setPlayingUi(false));
      if (!duration) duration = await new Promise((r) => audio.addEventListener("loadedmetadata", () => r(isFinite(audio.duration) ? audio.duration : 0), { once: true }));
      section = { start: 0, end: Math.min(duration, 5) };
      stage.setAttribute("aria-valuemax", String(Math.round(duration)));
      toggle.disabled = false;
      replay.disabled = false;
      paint();
      paintSection();
      paintMarkers();
      return true;
    })();

    return {
      ready,
      on(evt, fn) { listeners[evt].push(fn); },
      play, pause, playFrom, seek,
      getTime: pos,
      getDuration: () => duration,
      getSection: () => ({ ...section }),
      setMarkers(list) { marks = list.slice(); paintMarkers(); },
      destroy() {
        destroyed = true;
        if (audio) audio.pause();
        cancelAnimationFrame(raf);
        root.removeEventListener("click", onClick);
        window.removeEventListener("niswara:audio-start", onOtherAudio);
      },
    };
  }

  return { render, wire };
})();

const RecordingMarkers = (() => {
  const QUICK = ["Word became unclear", "Pitch changed", "Breath noise", "Transition felt rough", "Got louder", "Got softer", "Sounded comfortable"];

  function render(id, { title = "Mark a moment" } = {}) {
    return `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4" data-mk="${id}">
        <p class="text-sm text-ink-100 mb-1">${title}</p>
        <p class="text-xs text-ink-500 mb-3">Pause where you noticed something (or tap the waveform), write a short note and add it. Only you can see these.</p>
        <div class="flex flex-wrap gap-1.5 mb-2">${QUICK.map((q) => `<button type="button" data-mk-quick="${q}" class="ex-chip !py-1 !px-2.5 !text-xs">${q}</button>`).join("")}</div>
        <div class="flex gap-2">
          <input type="text" data-mk-text maxlength="120" class="field !py-2" placeholder="Short note, e.g. “Word became unclear”">
          <button type="button" data-mk-add class="vr-btn vr-btn-gold shrink-0">Add at <span data-mk-time class="tabular-nums">00:00</span></button>
        </div>
        <ul class="flex flex-col gap-1.5 mt-3" data-mk-list></ul>
      </div>`;
  }

  /** opts: player (WaveformPlayer api), list, onChange(list) */
  function wire(container, id, { player, list = [], onChange }) {
    const root = container.querySelector(`[data-mk="${id}"]`);
    if (!root) return { destroy() {} };
    let marks = list.slice().sort((a, b) => a.t - b.t);
    const input = root.querySelector("[data-mk-text]");
    const timeEl = root.querySelector("[data-mk-time]");
    const listEl = root.querySelector("[data-mk-list]");
    const fmt = (s) => Utils.formatSeconds(Math.max(0, Math.round(s)));

    function paint() {
      listEl.innerHTML = marks.length
        ? marks.map((m) => `
          <li class="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
            <button type="button" data-mk-go="${m.id}" class="tabular-nums text-gold-300 hover:text-gold-200" title="Listen from just before this moment">${fmt(m.t)}</button>
            <span class="text-ink-600">—</span>
            <span class="text-ink-200 flex-1 min-w-0 break-words">${Utils.escapeHtml(m.note)}</span>
            <button type="button" data-mk-del="${m.id}" class="text-ink-600 hover:text-ink-300" aria-label="Remove marker">${icon("close", "w-3.5 h-3.5")}</button>
          </li>`).join("")
        : `<li class="text-xs text-ink-600">No moments marked yet.</li>`;
      player.setMarkers(marks);
    }
    function save() { if (onChange) onChange(marks.slice()); paint(); }

    player.on("time", (t) => { timeEl.textContent = fmt(t); });

    function onClick(e) {
      const q = e.target.closest("[data-mk-quick]");
      if (q) { input.value = q.dataset.mkQuick; input.focus(); return; }
      if (e.target.closest("[data-mk-add]")) {
        const note = input.value.trim();
        if (!note) { input.focus(); input.placeholder = "Write a few words first, e.g. “Breath noise”"; return; }
        marks.push({ id: "mk" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Math.round(player.getTime() * 10) / 10, note });
        marks.sort((a, b) => a.t - b.t);
        input.value = "";
        save();
        return;
      }
      const go = e.target.closest("[data-mk-go]");
      if (go) { const m = marks.find((x) => x.id === go.dataset.mkGo); if (m) player.playFrom(Math.max(0, m.t - 1.5)); return; }
      const del = e.target.closest("[data-mk-del]");
      if (del) { marks = marks.filter((x) => x.id !== del.dataset.mkDel); save(); }
    }
    root.addEventListener("click", onClick);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); root.querySelector("[data-mk-add]").click(); } });
    player.ready.then(paint);

    return { getMarkers: () => marks.slice(), destroy() { root.removeEventListener("click", onClick); } };
  }

  return { render, wire };
})();

const RecordingCard = (() => {
  function render(id, { title, hint, minSeconds = 0, maxSeconds = 30, section = true, extraTop = "" }) {
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7" data-rc="${id}">
        <div class="flex items-start justify-between gap-3 flex-wrap mb-1">
          <h3 class="font-display text-xl text-ink-50">${title}</h3>
          <span class="text-[11px] uppercase tracking-wider text-ink-500">${minSeconds ? `${minSeconds}–${maxSeconds} seconds` : `up to ${maxSeconds} seconds`}</span>
        </div>
        ${hint ? `<p class="text-sm text-ink-400 leading-relaxed mb-4">${hint}</p>` : ""}
        ${extraTop}
        <div class="flex flex-wrap items-center gap-2.5">
          <button type="button" data-rc-record class="vr-btn vr-btn-primary"><span class="vr-rec-dot"></span> <span data-rc-record-label>Record</span></button>
          <button type="button" data-rc-stop class="vr-btn" disabled>■ Stop</button>
          <div class="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden" aria-hidden="true"><div class="h-full bg-gold-400/80 w-0 transition-[width] duration-75" data-rc-level></div></div>
          <span class="text-sm text-ink-400 tabular-nums" data-rc-status aria-live="polite"></span>
        </div>
        <div class="mt-5" data-rc-player></div>
        <input type="hidden" data-rc-section="${section ? 1 : 0}">
      </div>`;
  }

  /**
   * opts: classId, take ({ mediaId, seconds } | null), minSeconds, maxSeconds, meta ({ name, exercise }),
   *       onSaved(take), onPlayer(player, take) — called whenever a player is (re)created.
   *       onBeforeRecord() — optional; return false to stop a RE-record before it starts (first recording is never gated).
   */
  function wire(container, id, opts) {
    const root = container.querySelector(`[data-rc="${id}"]`);
    if (!root) return { destroy() {} };
    const $ = (s) => root.querySelector(s);
    const recBtn = $("[data-rc-record]"), stopBtn = $("[data-rc-stop]"), status = $("[data-rc-status]"), level = $("[data-rc-level]");
    const playerHost = $("[data-rc-player]");
    const withSection = $("[data-rc-section]").dataset.rcSection === "1";
    const { classId, minSeconds = 0, maxSeconds = 30 } = opts;
    let take = opts.take || null, session = null, player = null;

    if (!VoiceRecorder.isSupported()) { recBtn.disabled = true; status.textContent = "Recording isn't supported in this browser."; }

    function mountPlayer() {
      if (player) player.destroy();
      player = null;
      if (!take) { playerHost.innerHTML = ""; return; }
      playerHost.innerHTML = WaveformPlayer.render(`${id}-wf`, { section: withSection });
      player = WaveformPlayer.wire(playerHost, `${id}-wf`, { mediaId: take.mediaId, markers: [] });
      $("[data-rc-record-label]").textContent = "Record again";
      if (opts.onPlayer) opts.onPlayer(player, take);
    }

    async function record() {
      if (take && opts.onBeforeRecord && opts.onBeforeRecord() === false) return; // e.g. "replace your baseline?" (Class 10)
      try {
        session = await VoiceRecorder.start({
          maxSeconds,
          onTick: (s) => { status.textContent = `Recording… ${Utils.formatSeconds(s)}${minSeconds && s < minSeconds ? ` (aim for ${minSeconds}s+)` : ""}`; },
          onLevel: (v) => { level.style.width = `${Math.round(v * 100)}%`; },
        });
      } catch (e) {
        status.textContent = e.reason === "unsupported" ? "Recording isn't supported in this browser." : "Microphone access was blocked. Allow it in your browser's site settings, then try again.";
        return;
      }
      if (player) player.pause();
      recBtn.disabled = true; stopBtn.disabled = false;
      recBtn.classList.add("is-recording");
      status.textContent = "Recording…";
      const res = await session.ended;
      session = null;
      recBtn.disabled = false; stopBtn.disabled = true;
      recBtn.classList.remove("is-recording");
      if (!res || !res.blob.size) { status.textContent = res ? "Nothing was recorded — try again." : ""; return; }
      const upload = await VoiceRecorder.saveToClass(classId, res, opts.meta || {});
      if (!upload) { status.textContent = "Couldn't save the recording on this device."; return; }
      take = { mediaId: upload.mediaId, seconds: res.seconds, at: upload.date };
      status.textContent = minSeconds && res.seconds < minSeconds
        ? `Saved (${res.seconds}s). That's a little short — aim for ${minSeconds}–${maxSeconds} seconds; you can record again.`
        : `Saved (${res.seconds}s).`;
      if (opts.onSaved) opts.onSaved(take);
      mountPlayer();
    }

    function onClick(e) {
      if (e.target.closest("[data-rc-record]")) { record(); return; }
      if (e.target.closest("[data-rc-stop]") && session) session.stop();
    }
    root.addEventListener("click", onClick);
    if (take) { status.textContent = `Your recording (${take.seconds || "?"}s) is saved.`; mountPlayer(); }

    return {
      getTake: () => take,
      getPlayer: () => player,
      destroy() {
        root.removeEventListener("click", onClick);
        if (session) session.cancel();
        if (player) player.destroy();
      },
    };
  }

  return { render, wire };
})();

const ListeningPasses = (() => {
  function render(id, passes) {
    return `
      <div class="grid sm:grid-cols-3 gap-3" data-lp="${id}">
        ${passes.map((p, i) => `
          <div class="lp-card rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2" data-lp-card="${i}">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-[0.18em] text-gold-400/80">Listen ${i + 1}</span>
              <span class="text-[11px] text-emerald-300" data-lp-done-badge hidden>${icon("check", "w-3 h-3 inline-flex align-[-1px]")} Done</span>
            </div>
            <p class="font-display text-lg text-ink-50 leading-snug">${p.title}</p>
            <p class="text-xs text-ink-400 flex-1">${p.prompt}</p>
            <button type="button" data-lp-play="${i}" class="vr-btn self-start">${icon("play", "w-3.5 h-3.5")} Listen</button>
            <button type="button" data-lp-manual="${i}" class="text-[11px] text-ink-500 underline self-start" hidden>I've listened to the whole recording</button>
          </div>`).join("")}
      </div>`;
  }

  /** opts: getPlayer(), done ({ i: true }), onDone(i). Passes unlock one at a time — no overload. */
  function wire(container, id, { getPlayer, done = {}, onDone }) {
    const root = container.querySelector(`[data-lp="${id}"]`);
    if (!root) return { destroy() {} };
    const state = { ...done };
    let active = null;
    const hooked = new WeakSet();

    function paint() {
      root.querySelectorAll("[data-lp-card]").forEach((card) => {
        const i = Number(card.dataset.lpCard);
        const isDone = !!state[i];
        const unlocked = i === 0 || state[i - 1];
        card.classList.toggle("is-done", isDone);
        card.classList.toggle("opacity-50", !unlocked);
        card.querySelector("[data-lp-done-badge]").hidden = !isDone;
        card.querySelector("[data-lp-play]").disabled = !unlocked || !getPlayer();
        card.querySelector("[data-lp-manual]").hidden = isDone || active !== i;
      });
    }
    function complete(i) {
      if (state[i]) return;
      state[i] = true;
      active = null;
      if (onDone) onDone(i);
      paint();
    }
    function hook(player) {
      if (!player || hooked.has(player)) return;
      hooked.add(player);
      player.on("ended", ({ fromStart }) => { if (active !== null && fromStart) complete(active); });
    }
    function onClick(e) {
      const play = e.target.closest("[data-lp-play]");
      if (play && !play.disabled) {
        const player = getPlayer();
        hook(player);
        active = Number(play.dataset.lpPlay);
        player.playFrom(0);
        paint();
        return;
      }
      const manual = e.target.closest("[data-lp-manual]");
      if (manual) complete(Number(manual.dataset.lpManual));
    }
    root.addEventListener("click", onClick);
    paint();

    return {
      refresh() { paint(); },
      reset() { Object.keys(state).forEach((k) => delete state[k]); active = null; paint(); },
      destroy() { root.removeEventListener("click", onClick); },
    };
  }

  return { render, wire };
})();

const ObservationChecklist = {
  /** categories: [{ key, title, prompt, options: [str], note: bool }], selected: { key: [values] }, notes: { key: text } */
  render(id, categories, selected = {}, notes = {}) {
    return `
      <div class="grid md:grid-cols-2 gap-4" data-obs-root="${id}">
        ${categories.map((c) => `
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4" data-obs-cat="${c.key}">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h4 class="font-display text-lg text-ink-50">${c.title}</h4>
              <span class="text-[11px] text-emerald-300" data-obs-done ${(selected[c.key] || []).length ? "" : "hidden"}>${icon("check", "w-3 h-3 inline-flex align-[-1px]")} Noted</span>
            </div>
            <p class="text-xs text-ink-500 mb-3">${c.prompt}</p>
            <div class="flex flex-wrap gap-1.5">
              ${c.options.map((o) => `<button type="button" data-obs="${c.key}" data-obs-value="${Utils.escapeHtml(o)}" aria-pressed="${(selected[c.key] || []).includes(o)}" class="ex-chip !text-xs !py-1.5 ${(selected[c.key] || []).includes(o) ? "is-selected" : ""}">${o}</button>`).join("")}
            </div>
            ${c.note ? `<input type="text" data-obs-note="${c.key}" class="field !py-2 mt-3 !text-xs" placeholder="Optional: where or when? e.g. “around 00:12”" value="${Utils.escapeHtml(notes[c.key] || "")}">` : ""}
          </div>`).join("")}
      </div>`;
  },

  /** onChange(key, values) on chip toggles; onNote(key, text) debounced. Returns cleanup. */
  wire(container, id, { selected = {}, onChange, onNote }) {
    const root = container.querySelector(`[data-obs-root="${id}"]`);
    if (!root) return () => {};
    const sel = JSON.parse(JSON.stringify(selected));
    function onClick(e) {
      const chip = e.target.closest("[data-obs]");
      if (!chip) return;
      const k = chip.dataset.obs, v = chip.dataset.obsValue;
      const list = sel[k] = sel[k] || [];
      const i = list.indexOf(v);
      if (i >= 0) list.splice(i, 1); else list.push(v);
      chip.classList.toggle("is-selected", i < 0);
      chip.setAttribute("aria-pressed", String(i < 0));
      root.querySelector(`[data-obs-cat="${k}"] [data-obs-done]`).hidden = !list.length;
      if (onChange) onChange(k, list.slice());
    }
    root.addEventListener("click", onClick);
    const savers = {};
    root.querySelectorAll("[data-obs-note]").forEach((inp) => {
      const k = inp.dataset.obsNote;
      savers[k] = Utils.debounce((v) => onNote && onNote(k, v), 500);
      inp.addEventListener("input", () => savers[k](inp.value));
    });
    return () => root.removeEventListener("click", onClick);
  },
};
