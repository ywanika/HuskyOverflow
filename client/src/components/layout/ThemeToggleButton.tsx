import { IconButton } from '@chakra-ui/react';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggleButton component that allows users to switch between light and dark modes.
 * Uses the ThemeContext to manage theme state.
 */
const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      onClick={toggleTheme}
      variant='ghost'
      size='md'
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? '🌙' : '☀️'}
    </IconButton>
  );
};

export default ThemeToggleButton;
