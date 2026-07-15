import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-icon">☀️</span>
        <span className="theme-toggle-icon">🌙</span>
        <span className={`theme-toggle-thumb${isDark ? " is-dark" : ""}`} />
      </span>
    </button>
  );
}
