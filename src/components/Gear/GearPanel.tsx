import { useState } from 'react';
import { Shield } from 'lucide-react';
import { GEAR_MAP, RARITY_COLORS, MAX_GEAR_SLOTS } from '../../constants/items';
import type { GearItemId } from '../../constants/items';
import { GearIcon } from './GearIcon';

interface GearPanelProps {
  equippedGear: GearItemId[];
  foundGear: GearItemId[];
}

export function GearPanel({ equippedGear, foundGear }: GearPanelProps) {
  const [tooltip, setTooltip] = useState<GearItemId | null>(null);
  const allGear = [...equippedGear, ...foundGear].slice(0, MAX_GEAR_SLOTS);
  const emptySlots = MAX_GEAR_SLOTS - allGear.length;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-0 sm:border border-slate-200 dark:border-slate-700 rounded-none sm:rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
      <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
      <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 shrink-0">Gear</span>

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
              onMouseEnter={() => setTooltip(id)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center border-2 ${colors.border} ${colors.bg} cursor-default ${isEquipped ? 'opacity-100' : 'opacity-90'}`}>
                <GearIcon name={item.icon} className={`w-3.5 h-3.5 ${colors.text}`} />
              </div>
              {tooltip === id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 pointer-events-none">
                  <div className="bg-slate-900 dark:bg-slate-800 border border-slate-700 rounded-lg p-2.5 shadow-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>{item.rarity}</span>
                      {isEquipped && <span className="text-xs text-slate-500 italic">equipped</span>}
                    </div>
                    <p className="text-xs font-semibold text-white mb-1">{item.name}</p>
                    <p className="text-xs text-slate-400 leading-snug">{item.effectSummary}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="w-7 h-7 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
            <span className="text-slate-300 dark:text-slate-700 text-xs">+</span>
          </div>
        ))}
      </div>

      <span className="ml-auto text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
        {allGear.length}/{MAX_GEAR_SLOTS}
      </span>
    </div>
  );
}
