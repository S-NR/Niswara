/* ============================================================
   PROJECTS PAGE
   ============================================================ */

const ProjectsPage = {
  render() {
    const projects = Store.getState().projects;
    return `
    <section class="max-w-4xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Songs", "Projects", "Every finished song moves through the same checklist — from first lyric to final export.")}
      <div class="flex flex-col gap-6">
        ${projects.map(p => Components.ProjectCard(p)).join("")}
      </div>
    </section>`;
  },

  mount(container) {
    container.querySelectorAll('[data-action="toggleProjectItem"]').forEach(cb => {
      cb.addEventListener("change", () => {
        Store.toggleProjectItem(cb.dataset.project, cb.dataset.key);
        Router.softRefresh(container, ProjectsPage);
      });
    });
  },
};
