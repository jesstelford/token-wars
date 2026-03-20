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
    <footer
      className="flex-none h-16 flex items-center justify-around px-4 gap-3"
      style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}
    >
      <ConsoleButton
        onClick={onOpenBuy}
        icon={<ShoppingCart className="w-4 h-4" />}
        label="Buy"
        color="accent"
      />
      <ConsoleButton
        onClick={onOpenSell}
        icon={<Tag className="w-4 h-4" />}
        label="Sell"
        color="success"
        disabled={!hasSellableInventory}
      />
      <ConsoleButton
        onClick={onOpenFinance}
        icon={<Landmark className="w-4 h-4" />}
        label="Finance"
        color="neutral"
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
  color: 'accent' | 'success' | 'neutral';
  disabled?: boolean;
}) {
  const styleMap: Record<string, React.CSSProperties> = {
    accent: { background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' },
    success: { background: 'var(--color-success)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' },
    neutral: { background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-5 py-2 font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
      style={styleMap[color]}
    >
      {icon}
      {label}
    </button>
  );
}
