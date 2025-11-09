
'use client';
import { useTheme } from 'next-themes';

const ThemeToggle: React.FC = () => {
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
        <p>α</p>
    </button>
  );
}
export default ThemeToggle;