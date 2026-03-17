import { useState, useEffect } from 'react';
import { getDarkMode, setDarkMode as saveDarkMode } from '../utils/storageUtils';

export function useDarkMode() {
  const [darkMode, setDarkModeState] = useState(getDarkMode);

  useEffect(() => {
    saveDarkMode(darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return [darkMode, setDarkModeState];
}
