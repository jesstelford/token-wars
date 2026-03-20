import { Sparkles, X, TrendingUp, TrendingDown } from 'lucide-react';
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

function isPositiveEffect(summary: string): boolean {
  return summary.startsWith('+');
}

export function ItemDropModal({ drop, state, onCollect, onDismiss }: ItemDropModalProps) {
  const item = GEAR_MAP[drop.itemId];
  if (!item) return null;

  const colors = RARITY_COLORS[item.rarity];
  const allGear = getAllGear(state);
  const isDuplicate = allGear.includes(drop.itemId);
  const isFull = !isDuplicate && allGear.length >= 3;
  const scrapValue = getScrapValue(drop.itemId);

  const rarityLabel = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
  const isPositive = isPositiveEffect(item.effectSummary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="w-full max-w-sm shadow-2xl overflow-hidden animate-in" style={{ background: 'var(--modal-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--modal-radius)' }}>
        <div className="px-5 pt-6 pb-4">
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
              <h3 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{item.name}</h3>
            </div>
          </div>

          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {item.description}{' '}
            <span className={`text-xs font-medium ${colors.text} opacity-70`}>{rarityLabel}</span>
          </p>

          <div className="mt-3 flex items-center gap-1.5">
            {isPositive
              ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              : <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
            }
            <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.effectSummary}
            </span>
          </div>

          {isDuplicate && (
            <div className="mt-3 px-3 py-2" style={{ background: 'var(--color-warning-muted)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>Already owned</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-warning)' }}>
                This gear will be scrapped for <span className="font-bold">${scrapValue.toLocaleString()}</span>.
              </p>
            </div>
          )}

          {isFull && (
            <div className="mt-3 px-3 py-2" style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Gear slots full (3/3)</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>This item cannot be added. It will be discarded.</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-2 flex gap-2">
          {isDuplicate ? (
            <button
              onClick={() => onCollect(drop.itemId)}
              className="flex-1 py-2.5 font-bold text-sm transition-colors"
              style={{ background: 'var(--color-warning)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }}
            >
              Scrap for ${scrapValue.toLocaleString()}
            </button>
          ) : isFull ? (
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 font-bold text-sm transition-colors"
              style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' }}
            >
              Dismiss
            </button>
          ) : (
            <>
              <button
                onClick={onDismiss}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 font-semibold text-sm transition-colors"
                style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
              >
                <X className="w-3.5 h-3.5" />
                Skip
              </button>
              <button
                onClick={() => onCollect(drop.itemId)}
                className="flex-1 py-2.5 font-bold text-sm transition-colors"
                style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }}
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
