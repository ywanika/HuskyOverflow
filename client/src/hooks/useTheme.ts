import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

/**
 * Custom hook to access the current theme and toggle function from ThemeContext.
 *
 * @returns theme - The current theme mode ('light' or 'dark').
 * @returns toggleTheme - Function to toggle between light and dark themes.
 */

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { useTheme };
export default useTheme;
