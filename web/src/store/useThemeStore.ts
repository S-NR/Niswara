import { create } from "zustand";

type Mode = "light" | "dark" | "system";

interface ThemeState {
  mode: Mode;
  setMode: (m: Mode) => void;
}

function apply(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("mla:theme", mode);
}

const initial = (localStorage.getItem("mla:theme") as Mode) || "system";

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initial,
  setMode: (mode) => {
    apply(mode);
    set({ mode });
  }
}));