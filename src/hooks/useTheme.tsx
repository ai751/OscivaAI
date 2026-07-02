import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "osciva-theme";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  /** Internal: pages that must render light (marketing site) register a lock. */
  __lockLight: () => () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  __lockLight: () => () => {},
});

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  // Default to light. Users can switch to dark from the toggle; the choice persists.
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);
  // While > 0, the dark class is suppressed regardless of the saved theme.
  // Used by the fixed-light marketing pages; the user's choice is untouched.
  const [lightLocks, setLightLocks] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark" && lightLocks === 0);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, lightLocks]);

  const value: ThemeContextValue = {
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    __lockLight: () => {
      setLightLocks((n) => n + 1);
      return () => setLightLocks((n) => Math.max(0, n - 1));
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Forces the light theme while the calling component is mounted. */
export function useForceLightTheme() {
  const { __lockLight } = useContext(ThemeContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => __lockLight(), []);
}
