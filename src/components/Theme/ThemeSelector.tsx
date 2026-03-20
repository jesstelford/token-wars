import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { THEMES } from '../../types/theme';
import type { ThemeId } from '../../types/theme';

export function ThemeSelector() {
  const { themeId, mode, setThemeId, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentTheme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      <button
        onClick={toggleMode}
        className="p-1.5 rounded-theme-sm transition-colors"
        style={{
          color: 'var(--color-text-muted)',
          borderRadius: 'var(--radius-sm)',
        }}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark'
          ? <Sun className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          : <Moon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        }
      </button>

      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-2 py-1.5 transition-colors"
        style={{
          background: 'var(--color-bg-muted)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
        aria-label="Change theme"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:inline uppercase tracking-widest">{currentTheme.label}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 min-w-[220px] overflow-hidden"
          style={{
            background: 'var(--modal-bg)',
            border: 'var(--modal-border-style)',
            borderRadius: 'var(--modal-radius)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{
              background: 'var(--panel-header-bg)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--panel-header-text)', fontFamily: 'var(--font-heading)' }}
            >
              Theme
            </span>
            <button
              onClick={toggleMode}
              className="flex items-center gap-1 text-xs px-2 py-0.5 transition-colors"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                letterSpacing: '0.06em',
              }}
            >
              {mode === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              <span className="ml-1 uppercase font-semibold">{mode === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <div className="py-1">
            {THEMES.map(theme => {
              const isActive = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setThemeId(theme.id as ThemeId);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 transition-all text-left"
                  style={{
                    background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--table-hover-bg)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex-none"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-bold leading-tight truncate"
                      style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '0.03em' }}
                    >
                      {theme.label}
                    </div>
                    <div
                      className="text-xs leading-tight truncate"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                    >
                      {theme.description}
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 flex-none" style={{ color: 'var(--color-accent)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
