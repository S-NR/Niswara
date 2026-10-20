/* ============================================================
   UTILS
   ============================================================ */

const Utils = {
  debounce(fn, wait = 400) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },

  readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  formatSeconds(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  },

  /** Reads a query-style param tacked onto a hash route, e.g. "#/login?next=%23%2Fdashboard" -> getHashQuery("next") -> "#/dashboard" */
  getHashQuery(key) {
    const qIndex = location.hash.indexOf("?");
    if (qIndex === -1) return null;
    const params = new URLSearchParams(location.hash.slice(qIndex + 1));
    return params.get(key);
  },

  escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },
};
