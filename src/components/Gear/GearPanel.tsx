import { useState, useRef } from 'react';
import { Shield } from 'lucide-react';
import { GEAR_MAP, RARITY_COLORS, MAX_GEAR_SLOTS } from '../../constants/items';
import type { GearItemId } from '../../constants/items';
import { GearIcon } from './GearIcon';
import { GearTooltip } from './GearTooltip';

interface GearPanelProps {
  equippedGear: GearItemId[];
  foundGear: GearItemId[];
}

export function GearPanel({ equippedGear, foundGear }: GearPanelProps) {
  const [tooltip, setTooltip] = useState<{ id: GearItemId; rect: DOMRect } | null>(null);
  const allGear = [...equippedGear, ...foundGear].slice(0, MAX_GEAR_SLOTS);
  const emptySlots = MAX_GEAR_SLOTS - allGear.length;

  function handleMouseEnter(id: GearItemId, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    setTooltip({ id, rect });
  }

  return (
    <div
      className="theme-panel flex items-center gap-2 px-3 py-2 border-0 sm:border"
      style={{ borderRadius: '0', borderColor: 'var(--color-border)' }}
    >
      <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      <span
        className="text-xs font-bold uppercase tracking-widest shrink-0"
        style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)' }}
      >
        Gear
      </span>

      <div className="flex items-center gap-1.5 ml-2 flex-1">
        {allGear.map(id => {
          const item = GEAR_MAP[id];
          if (!item) return null;
          const colors = RARITY_COLORS[item.rarity];
          const isEquipped = equippedGear.includes(id);

          return (
            <div
              key={id}
              className="relative"
              onMouseEnter={e => handleMouseEnter(id, e.currentTarget)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center border-2 ${colors.border} ${colors.bg} cursor-default ${isEquipped ? 'opacity-100' : 'opacity-90'}`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <GearIcon name={item.icon} className={`w-3.5 h-3.5 ${colors.text}`} />
              </div>
            </div>
          );
        })}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-7 h-7 border-2 border-dashed flex items-center justify-center"
            style={{ borderRadius: 'var(--radius-sm)', borderColor: 'var(--gear-empty-border)' }}
          >
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>+</span>
          </div>
        ))}
      </div>

      <span
        className="ml-auto text-xs shrink-0"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
      >
        {allGear.length}/{MAX_GEAR_SLOTS}
      </span>

      {tooltip && (() => {
        const item = GEAR_MAP[tooltip.id];
        if (!item) return null;
        const isEquipped = equippedGear.includes(tooltip.id);
        return <GearTooltip item={item} isEquipped={isEquipped} anchorRect={tooltip.rect} />;
      })()}
    </div>
  );
}
