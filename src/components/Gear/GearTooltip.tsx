import { createPortal } from 'react-dom';
import { RARITY_COLORS } from '../../constants/items';
import type { GearItem } from '../../constants/items';

interface GearTooltipProps {
  item: GearItem;
  isEquipped: boolean;
  anchorRect: DOMRect;
}

export function GearTooltip({ item, isEquipped, anchorRect }: GearTooltipProps) {
  const colors = RARITY_COLORS[item.rarity];

  const left = anchorRect.left + anchorRect.width / 2;
  const top = anchorRect.top - 8;

  return createPortal(
    <div
      className="fixed z-[9999] w-52 pointer-events-none"
      style={{
        left,
        top,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="p-2.5 shadow-xl" style={{ background: 'var(--modal-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>{item.rarity}</span>
          {isEquipped && <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>equipped</span>}
        </div>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{item.name}</p>
        <p className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>{item.effectSummary}</p>
      </div>
    </div>,
    document.body
  );
}
