import { useState } from 'react';
import { UserX, ShoppingBag } from 'lucide-react';
import { GEAR_MAP, RARITY_COLORS } from '../../constants/items';
import type { GearItemId } from '../../constants/items';
import type { PendingVendor } from '../../types/game';
import { GearIcon } from '../Gear/GearIcon';
import { getAllGear } from '../../utils/gearEffects';
import type { GameState } from '../../types/game';
import { formatCurrencyFull } from '../../utils/formatting';

interface VendorModalProps {
  vendor: PendingVendor;
  state: GameState;
  onPurchase: (itemId: GearItemId, price: number) => void;
  onDecline: () => void;
}

export function VendorModal({ vendor, state, onPurchase, onDecline }: VendorModalProps) {
  const [selected, setSelected] = useState<GearItemId | null>(null);

  const allGear = getAllGear(state);
  const isFull = allGear.length >= 3;

  function handleBuy() {
    if (!selected) return;
    const price = vendor.prices[selected] ?? 0;
    if (price > state.current_cash) return;
    onPurchase(selected, price);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="w-full max-w-sm shadow-2xl overflow-hidden" style={{ background: 'var(--modal-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--modal-radius)' }}>
        <div className="px-5 py-4" style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center" style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <UserX className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Black Market Vendor</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>An anonymous figure slides into view...</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs italic mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            "I have exactly what you need. Don't ask where it came from."
          </p>

          {isFull ? (
            <div className="py-4 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Your gear slots are full (3/3).</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>You cannot purchase any more gear this run.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {vendor.offeredItems.map(id => {
                const item = GEAR_MAP[id];
                if (!item) return null;
                const colors = RARITY_COLORS[item.rarity];
                const price = vendor.prices[id] ?? 0;
                const canAfford = state.current_cash >= price;
                const alreadyOwned = allGear.includes(id);
                const isSelected = selected === id;

                return (
                  <button
                    key={id}
                    onClick={() => !alreadyOwned && canAfford && setSelected(isSelected ? null : id)}
                    disabled={alreadyOwned || !canAfford}
                    className="w-full flex items-center gap-3 p-3 text-left transition-all focus:outline-none"
                    style={
                      isSelected
                        ? { border: `1px solid var(--color-border)`, background: 'var(--color-bg-raised)', borderRadius: 'var(--radius-sm)', outline: `2px solid` }
                        : alreadyOwned || !canAfford
                        ? { border: '1px solid var(--color-border)', background: 'var(--modal-bg)', opacity: 0.5, cursor: 'not-allowed', borderRadius: 'var(--radius-sm)' }
                        : { border: '1px solid var(--color-border)', background: 'var(--modal-bg)', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }
                    }
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${isSelected ? colors.border : 'border-slate-700'} ${isSelected ? colors.bg : ''} shrink-0`} style={!isSelected ? { background: 'var(--color-bg-raised)' } : {}}>
                      <GearIcon name={item.icon} className={`w-4 h-4 ${isSelected ? colors.text : ''}`} style={!isSelected ? { color: 'var(--color-text-muted)' } : {}} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>{item.rarity}</span>
                        {alreadyOwned && <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>owned</span>}
                      </div>
                      <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.effectSummary}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-bold font-mono ${canAfford && !alreadyOwned ? 'text-emerald-400' : ''}`} style={!(canAfford && !alreadyOwned) ? { color: 'var(--color-text-muted)' } : {}}>
                        {formatCurrencyFull(price)}
                      </p>
                      {!canAfford && !alreadyOwned && (
                        <p className="text-xs text-red-500">Can't afford</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            <span>Your cash</span>
            <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{formatCurrencyFull(state.current_cash)}</span>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onDecline}
            className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-sm transition-colors"
            style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
          >
            Pass
          </button>
          {!isFull && (
            <button
              onClick={handleBuy}
              disabled={!selected}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-success)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              {selected ? `Buy for ${formatCurrencyFull(vendor.prices[selected] ?? 0)}` : 'Select an item'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
