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
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 shadow-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>{item.rarity}</span>
          {isEquipped && <span className="text-xs text-slate-500 italic">equipped</span>}
        </div>
        <p className="text-xs font-semibold text-white mb-1">{item.name}</p>
        <p className="text-xs text-slate-400 leading-snug">{item.effectSummary}</p>
      </div>
    </div>,
    document.body
  );
}
