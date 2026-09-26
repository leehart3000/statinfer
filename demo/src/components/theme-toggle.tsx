"use client";

/**
 * Switches between light and dark mode, and remembers the choice.
 * The button's label is chosen by CSS, so it's correct from the very first
 * paint, without waiting for JavaScript.
 */
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable, e.g. in private browsing. The toggle still works for this visit.
    }
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle}>
      <span className="to-dark">
        <span aria-hidden="true">🌙</span> Dark
      </span>
      <span className="to-light">
        <span aria-hidden="true">☀️</span> Light
      </span>
    </button>
  );
}