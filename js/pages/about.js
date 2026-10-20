/* ============================================================
   ABOUT PAGE
   ============================================================ */

const AboutPage = {
  render() {
    const values = [
      { icon: "target", title: "Discipline", text: "Showing up for every practice session, especially the ones that feel uneventful." },
      { icon: "chart", title: "Progress", text: "Small, honest, measurable steps — tracked instead of assumed." },
      { icon: "note", title: "Music", text: "Every exercise serves the same goal: music that moves people." },
      { icon: "sliders", title: "Craft", text: "Singing, producing, mixing and mastering treated as serious, learnable crafts." },
      { icon: "timer", title: "Patience", text: "Professional-level skill is built over years, not weeks." },
      { icon: "trophy", title: "Professionalism", text: "Holding every recording to the standard I want to reach, not just today's level." },
    ];
    return `
    <section class="max-w-3xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("About this project", "Why this exists", "")}
      <p class="text-ink-300 leading-relaxed text-base mb-6">
        "From First Note to Professional" is my personal, public journey from a complete beginner to a working
        singer, musician, recording artist, producer, mixing engineer and mastering engineer. I'm not assuming
        any prior knowledge — including my own. Every class starts at the beginning of that specific skill and
        builds gradually, the way serious contemporary music education actually works.
      </p>
      <p class="text-ink-300 leading-relaxed text-base mb-10">
        This website is both my curriculum and my record: a place to follow the plan class-by-class, practice
        consistently, document what's working and what isn't, and eventually look back at a real, honest
        before-and-after.
      </p>

      <div class="grid sm:grid-cols-2 gap-4 mb-12">
        ${values.map(v => `
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div class="w-9 h-9 rounded-full bg-gold-500/10 text-gold-300 flex items-center justify-center mb-3">${icon(v.icon, "w-5 h-5")}</div>
            <h4 class="font-display text-base text-ink-50 mb-1">${v.title}</h4>
            <p class="text-xs text-ink-500 leading-relaxed">${v.text}</p>
          </div>`).join("")}
      </div>

      <div class="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p class="text-sm text-ink-300">Following along publicly?</p>
          <p class="text-xs text-ink-500">Every completed class generates a clean, shareable summary.</p>
        </div>
        <a href="#/classes" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors shrink-0">Browse Classes ${icon("arrowRight", "w-3.5 h-3.5")}</a>
      </div>
    </section>`;
  },
  mount() {},
};
