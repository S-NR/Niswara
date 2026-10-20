import { useThemeStore } from "../store/useThemeStore";

export default function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
  const label = mode === "light" ? "☀️" : mode === "dark" ? "🌙" : "🖥️";
  return (
    <button
      onClick={() => setMode(next)}
      title={`Theme: ${mode} (click for ${next})`}
      className="w-9 h-9 rounded-md bg-muted flex items-center justify-center"
    >
      {label}
    </button>
  );
}