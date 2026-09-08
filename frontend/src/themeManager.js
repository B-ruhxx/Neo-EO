// ==========================================================================
// THEME MANAGER — NEO BANK
// Controlador centralizado y reactivo del tema visual (Dark / Light)
// ==========================================================================

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

export function getTheme() {
  if (typeof window === "undefined") return THEMES.DARK;
  const saved = localStorage.getItem("theme");
  return saved === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
}

export function applyThemeToDOM(theme) {
  if (typeof document === "undefined") return;
  const isLight = theme === THEMES.LIGHT;
  
  if (isLight) {
    document.documentElement.classList.add("light-mode");
    document.body.classList.add("light-mode");
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.classList.remove("light-mode");
    document.body.classList.remove("light-mode");
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

export function setTheme(theme) {
  const targetTheme = theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  localStorage.setItem("theme", targetTheme);
  applyThemeToDOM(targetTheme);

  // Disparar evento personalizado para actualizar cualquier componente suscripto
  window.dispatchEvent(
    new CustomEvent("themechange", { detail: { theme: targetTheme } })
  );
  return targetTheme;
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  return setTheme(next);
}

// Inicializar inmediatamente al importar
if (typeof window !== "undefined") {
  applyThemeToDOM(getTheme());
}
