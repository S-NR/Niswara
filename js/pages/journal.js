/* ============================================================
   JOURNAL PAGE — modern digital music notebook
   ============================================================ */

const JournalPage = {
  render() {
    const entries = Store.getState().journal;
    return `
    <section class="max-w-3xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Journal", "My Learning Journal", "A personal record of what's sinking in, what's hard, and what's starting to click.")}

      <form id="journal-form" class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-10 flex flex-col gap-4">
        <h3 class="font-display text-lg text-ink-50 mb-1">New entry</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <textarea name="learned" rows="2" placeholder="What I learned" class="field"></textarea>
          <textarea name="struggled" rows="2" placeholder="What I struggled with" class="field"></textarea>
          <textarea name="improved" rows="2" placeholder="What improved" class="field"></textarea>
          <textarea name="toPractice" rows="2" placeholder="What I need to practice" class="field"></textarea>
        </div>
        <textarea name="thoughts" rows="2" placeholder="My thoughts" class="field"></textarea>
        <button type="submit" class="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Save Entry ${icon("book", "w-4 h-4")}</button>
      </form>

      <div id="journal-list" class="flex flex-col gap-5">
        ${entries.length ? entries.map(e => Components.JournalEntry(e)).join("") :
          Components.EmptyState("book", "No entries yet", "Complete a class or write a free entry above — your first page is waiting.")}
      </div>
    </section>`;
  },

  mount(container) {
    const form = container.querySelector("#journal-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!Object.values(data).some(v => v.trim())) return;
      Store.addJournalEntry(data);
      Router.softRefresh(container, JournalPage);
    });

    container.querySelectorAll('[data-action="deleteJournalEntry"]').forEach(btn => {
      btn.addEventListener("click", () => {
        Store.deleteJournalEntry(btn.dataset.id);
        Router.softRefresh(container, JournalPage);
      });
    });
  },
};
