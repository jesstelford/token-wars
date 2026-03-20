import { useTheme } from '../../context/ThemeContext';
import { ThemeSelector } from '../Theme/ThemeSelector';

export function Header() {
  const { themeId } = useTheme();
  const isRetro = themeId === 'retro';

  return (
    <header
      className="flex-none w-full"
      style={{
        background: 'var(--color-bg-header)',
        borderBottom: '1px solid var(--header-border)',
        boxShadow: 'var(--header-shadow)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ maxWidth: '1024px', margin: '0 auto', width: '100%' }}
      >
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--logo-primary)',
            letterSpacing: isRetro ? '0.05em' : '-0.02em',
          }}
        >
          TOKEN<span style={{ color: 'var(--logo-accent)' }}>WARS</span>
        </span>
        <ThemeSelector />
      </div>
    </header>
  );
}
