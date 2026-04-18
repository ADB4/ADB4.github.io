
'use client';
import { useTheme } from 'next-themes';

export const ThemeToggle= () => {
  const { theme, setTheme } = useTheme();
  const themeToggleStyle: React.CSSProperties = {
    backgroundColor: 'var(--nav-item-secondary)',
    color: 'var(--nav-item-text)',
  };

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark':'light')
  }
  return (
      <button
        className="nav-theme-toggle liquid-glass"
        onClick={() => toggleTheme()}
        aria-label="Toggle theme"
        style={themeToggleStyle}
      >
          <p>THEME</p>
      </button>
  );
}
