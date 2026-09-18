import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "until.theme.v1";

/**
 * Runs before paint (inlined in `__root.tsx`) so the first frame already wears
 * the stored theme — no white flash for dark-theme users, no dark flash for
 * light ones.
 */
export const themeBootstrapScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=s==="light"||s==="dark"?s:(m?"dark":"light");var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.dataset.theme=t;r.style.colorScheme=t;}catch(e){document.documentElement.classList.remove("dark");}})();`;

export function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

/**
 * Theme state: stored choice wins, otherwise follow the OS. `theme` starts as
 * the default and is corrected on mount, so SSR output stays stable.
 */
export function useTheme(): { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initial = readStoredTheme() ?? systemTheme();
    setThemeState(initial);
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme()) return;
      const next: Theme = event.matches ? "dark" : "light";
      setThemeState(next);
      applyTheme(next);
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode) — the in-memory choice still applies
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return { theme, setTheme, toggle };
}
