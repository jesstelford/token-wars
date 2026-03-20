import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Header({ darkMode, onToggleDark }: HeaderProps) {
  return (
    <header className="flex-none border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-mono">
          TOKEN<span className="text-sky-600 dark:text-sky-400">WARS</span>
        </span>
        <button
          onClick={onToggleDark}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
