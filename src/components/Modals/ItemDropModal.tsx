import { Sparkles, X } from 'lucide-react';
import { GEAR_MAP, RARITY_COLORS } from '../../constants/items';
import type { GearItemId } from '../../constants/items';
import type { PendingItemDrop } from '../../types/game';
import { GearIcon } from '../Gear/GearIcon';
import { getScrapValue, getAllGear } from '../../utils/gearEffects';
import type { GameState } from '../../types/game';

interface ItemDropModalProps {
  drop: PendingItemDrop;
  state: GameState;
  onCollect: (itemId: GearItemId) => void;
  onDismiss: () => void;
}

const SOURCE_LABELS: Record<PendingItemDrop['source'], string> = {
  travel: 'Scavenged during travel',
  ftc_win: 'Spoils of victory',
  milestone: 'Milestone reward',
};

export function ItemDropModal({ drop, state, onCollect, onDismiss }: ItemDropModalProps) {
  const item = GEAR_MAP[drop.itemId];
  if (!item) return null;

  const colors = RARITY_COLORS[item.rarity];
  const allGear = getAllGear(state);
  const isDuplicate = allGear.includes(drop.itemId);
  const isFull = !isDuplicate && allGear.length >= 3;
  const scrapValue = getScrapValue(drop.itemId);

  const rarityLabel = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in">
        <div className="relative px-5 pt-6 pb-4">
          <div className="absolute top-4 right-4">
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${colors.badge}`}>
              {rarityLabel}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 ${colors.border} ${colors.bg} shrink-0`}>
              <GearIcon name={item.icon} className={`w-7 h-7 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">
                  {SOURCE_LABELS[drop.source]}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
            </div>
          </div>

          <p className="text-slate-400 text-sm mt-3 leading-relaxed">{item.description}</p>

          <div className={`mt-3 px-3 py-2 rounded-lg border ${colors.border} ${colors.bg}`}>
            <p className={`text-sm font-semibold ${colors.text}`}>{item.effectSummary}</p>
          </div>

          {isDuplicate && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-700/50">
              <p className="text-sm text-amber-300 font-semibold">Already owned</p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                This gear will be scrapped for <span className="font-bold text-amber-300">${scrapValue.toLocaleString()}</span>.
              </p>
            </div>
          )}

          {isFull && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 font-semibold">Gear slots full (3/3)</p>
              <p className="text-xs text-slate-400 mt-0.5">This item cannot be added. It will be discarded.</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          {isDuplicate ? (
            <button
              onClick={() => onCollect(drop.itemId)}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors"
            >
              Scrap for ${scrapValue.toLocaleString()}
            </button>
          ) : isFull ? (
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm transition-colors"
            >
              Dismiss
            </button>
          ) : (
            <>
              <button
                onClick={onDismiss}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold text-sm transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Skip
              </button>
              <button
                onClick={() => onCollect(drop.itemId)}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-colors"
              >
                Collect
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
