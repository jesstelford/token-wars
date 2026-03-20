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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <UserX className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Black Market Vendor</h3>
              <p className="text-xs text-slate-500">An anonymous figure slides into view...</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-slate-400 italic mb-4 leading-relaxed">
            "I have exactly what you need. Don't ask where it came from."
          </p>

          {isFull ? (
            <div className="py-4 text-center">
              <p className="text-slate-400 text-sm">Your gear slots are full (3/3).</p>
              <p className="text-xs text-slate-500 mt-1">You cannot purchase any more gear this run.</p>
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all focus:outline-none ${
                      isSelected
                        ? `${colors.border} bg-slate-800`
                        : alreadyOwned || !canAfford
                        ? 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600 hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${isSelected ? colors.border : 'border-slate-700'} ${isSelected ? colors.bg : 'bg-slate-800'} shrink-0`}>
                      <GearIcon name={item.icon} className={`w-4 h-4 ${isSelected ? colors.text : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>{item.rarity}</span>
                        {alreadyOwned && <span className="text-xs text-slate-500 italic">owned</span>}
                      </div>
                      <p className="text-sm font-semibold text-white leading-tight">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.effectSummary}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-bold font-mono ${canAfford && !alreadyOwned ? 'text-emerald-400' : 'text-slate-500'}`}>
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

          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span>Your cash</span>
            <span className="font-mono font-semibold text-slate-300">{formatCurrencyFull(state.current_cash)}</span>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onDecline}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold text-sm transition-colors"
          >
            Pass
          </button>
          {!isFull && (
            <button
              onClick={handleBuy}
              disabled={!selected}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm transition-colors"
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
