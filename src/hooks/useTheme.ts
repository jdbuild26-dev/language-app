"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_EVENT = "language-app:theme-change";

function resolveTheme(): Theme {
  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export function useTheme() {
  // Keep the server's initial light render deterministic. The mounted effect
  // resolves the persisted preference without a second hook instance resetting
  // the document back to light during navigation.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const syncTheme = (nextTheme: Theme) => {
      applyTheme(nextTheme);
      setTheme((currentTheme) => currentTheme === nextTheme ? currentTheme : nextTheme);
    };

    const syncFromStorage = () => syncTheme(resolveTheme());
    const onThemeChange = (event: Event) => {
      const nextTheme = event instanceof CustomEvent && (event.detail === "dark" || event.detail === "light")
        ? event.detail
        : resolveTheme();
      syncTheme(nextTheme);
    };
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === "theme") syncFromStorage();
    };

    syncFromStorage();
    window.addEventListener(THEME_EVENT, onThemeChange);
    window.addEventListener("storage", onStorageChange);

    return () => {
      window.removeEventListener(THEME_EVENT, onThemeChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  const setSharedTheme = useCallback((nextTheme: Theme) => {
    window.localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: nextTheme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSharedTheme(theme === "light" ? "dark" : "light");
  }, [setSharedTheme, theme]);

  return { theme, toggleTheme };
}
