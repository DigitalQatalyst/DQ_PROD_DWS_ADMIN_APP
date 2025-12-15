import React, { useEffect, useState, createContext, useContext } from 'react';
type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};
const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {}
});
export const useDarkMode = () => useContext(DarkModeContext);
type DarkModeProviderProps = {
  children: React.ReactNode;
};
export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({
  children
}) => {
  // Check if user has a preference in localStorage or prefers dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  // Update the data-theme attribute on the document when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return <DarkModeContext.Provider value={{
    darkMode,
    toggleDarkMode
  }}>
      {children}
    </DarkModeContext.Provider>;
};