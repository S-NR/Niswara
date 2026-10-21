/* ============================================================
   ROUTER
   Minimal hash router. Each page module exposes:
     render(params) -> HTML string
     mount(container, params) -> optional cleanup fn
   ============================================================ */

const Router = (() => {
  let currentUnmount = null;
  let started = false;
  const routes = [];

  function add(pattern, page, opts = {}) {
    // pattern like "#/classes/:id"
    const keys = [];
    const regex = new RegExp("^" + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return "([^/]+)"; }) + "$");
    routes.push({ regex, keys, page, requiresAuth: !!opts.requiresAuth });
  }

  function match(hash) {
    for (const r of routes) {
      const m = hash.match(r.regex);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { page: r.page, params, requiresAuth: r.requiresAuth };
      }
    }
    return null;
  }

  function currentHash() {
    return location.hash && location.hash !== "#" ? location.hash : "#/";
  }

  function render() {
    const hash = currentHash().split("?")[0];
    const found = match(hash) || match("#/404");
    const container = document.getElementById("app");

    if (typeof currentUnmount === "function") {
      try { currentUnmount(); } catch (e) { /* noop */ }
      currentUnmount = null;
    }

    if (!found) {
      container.innerHTML = Components.EmptyState("map", "Page not found", "Let's get you back on the journey.");
      updateChrome(hash);
      return;
    }

    if (found.requiresAuth && !Auth.isLoggedIn()) {
      location.hash = `#/login?next=${encodeURIComponent(hash)}`;
      return;
    }

    container.innerHTML = found.page.render(found.params);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    if (typeof found.page.mount === "function") {
      currentUnmount = found.page.mount(container, found.params) || null;
    }
    updateChrome(hash);
  }

  function updateChrome(hash) {
    document.getElementById("navbar").innerHTML = Components.Navbar(hash);
    document.getElementById("mobile-nav").innerHTML = Components.MobileNav(hash);
    document.getElementById("mobile-fab").innerHTML = hash.startsWith("#/classes") ? "" : Components.ContinueFab();
  }

  /** Re-run routing for the current hash (re-applies the requiresAuth guard). No-op until start(). */
  function rerender() { if (started) render(); }

  function currentRequiresAuth() {
    const found = match(currentHash().split("?")[0]);
    return !!(found && found.requiresAuth);
  }

  /** Re-renders just the navbar/mobile-nav/FAB — used when auth state changes without a navigation. */
  function refreshChrome() { updateChrome(currentHash()); }

  /** Re-render the current page's markup in place, preserving scroll position. */
  function softRefresh(container, page, params) {
    const scrollY = window.scrollY;
    if (typeof currentUnmount === "function") {
      try { currentUnmount(); } catch (e) { /* noop */ }
    }
    container.innerHTML = page.render(params);
    currentUnmount = typeof page.mount === "function" ? page.mount(container, params) || null : null;
    window.scrollTo(0, scrollY);
    updateChrome(currentHash());
  }

  function start() {
    started = true;
    window.addEventListener("hashchange", render);
    render();
  }

  return { add, start, rerender, softRefresh, refreshChrome, currentRequiresAuth };
})();
