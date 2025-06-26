import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextProps {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  setLightMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("isDarkMode");
    if (stored) setIsDarkMode(JSON.parse(stored));
  }, []);

  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem("isDarkMode", JSON.stringify(value));
  };

  const setLightMode = () => {
    setIsDarkMode(false);
    localStorage.setItem("isDarkMode", "false");
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setDarkMode, setLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
