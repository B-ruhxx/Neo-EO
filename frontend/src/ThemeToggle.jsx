import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { getTheme, toggleTheme, THEMES } from "./themeManager";

export default function ThemeToggle({
  variant = "icon",
  showLabel = false,
  className = "",
}) {
  const [theme, setLocalTheme] = useState(getTheme());

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e?.detail?.theme) {
        setLocalTheme(e.detail.theme);
      } else {
        setLocalTheme(getTheme());
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);
    return () => {
      window.removeEventListener("themechange", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const handleToggle = () => {
    const updated = toggleTheme();
    setLocalTheme(updated);
  };

  const isLight = theme === THEMES.LIGHT;

  if (variant === "pill" || showLabel) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`theme-toggle-pill ${isLight ? "light" : "dark"} ${className}`}
        title={isLight ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
        aria-label={isLight ? "Activar Modo Oscuro" : "Activar Modo Claro"}
      >
        <span className="theme-toggle-icon-wrap">
          {isLight ? (
            <Sun size={15} className="theme-icon sun" />
          ) : (
            <Moon size={15} className="theme-icon moon" />
          )}
        </span>
        <span className="theme-toggle-label">
          {isLight ? "Modo Claro" : "Modo Oscuro"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`theme-toggle-btn ${isLight ? "light" : "dark"} ${className}`}
      title={isLight ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
      aria-label={isLight ? "Activar Modo Oscuro" : "Activar Modo Claro"}
    >
      {isLight ? (
        <Sun size={18} className="theme-icon sun" />
      ) : (
        <Moon size={18} className="theme-icon moon" />
      )}
    </button>
  );
}
