import { ShoppingCart, Tag, Landmark } from 'lucide-react';

interface ControlConsoleProps {
  onOpenBuy: () => void;
  onOpenSell: () => void;
  onOpenFinance: () => void;
  hasSellableInventory: boolean;
  gameOver: boolean;
}

export function ControlConsole({ onOpenBuy, onOpenSell, onOpenFinance, hasSellableInventory, gameOver }: ControlConsoleProps) {
  if (gameOver) return null;

  return (
    <footer className="flex-none border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-16 flex items-center justify-around px-4 gap-3">
      <ConsoleButton
        onClick={onOpenBuy}
        icon={<ShoppingCart className="w-4 h-4" />}
        label="Buy"
        color="sky"
      />
      <ConsoleButton
        onClick={onOpenSell}
        icon={<Tag className="w-4 h-4" />}
        label="Sell"
        color="emerald"
        disabled={!hasSellableInventory}
      />
      <ConsoleButton
        onClick={onOpenFinance}
        icon={<Landmark className="w-4 h-4" />}
        label="Finance"
        color="slate"
      />
    </footer>
  );
}

function ConsoleButton({
  onClick,
  icon,
  label,
  color,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'sky' | 'emerald' | 'slate';
  disabled?: boolean;
}) {
  const colorMap = {
    sky: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white',
    slate: 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 focus:ring-slate-500 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed ${colorMap[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}
