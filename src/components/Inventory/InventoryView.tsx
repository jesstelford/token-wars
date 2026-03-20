import { Package } from 'lucide-react';
import type { GameState } from '../../types/game';
import { InventoryRow } from './InventoryRow';
import type { AssetId } from '../../constants/assets';

interface InventoryViewProps {
  state: GameState;
  hoveredAssetId: AssetId | null;
  onHoverAsset: (assetId: AssetId | null) => void;
  onSell: (assetId: AssetId) => void;
  effectiveCapacity?: number;
}

export function InventoryView({ state, hoveredAssetId, onHoverAsset, onSell, effectiveCapacity }: InventoryViewProps) {
  const usedCapacity = state.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const totalCapacity = effectiveCapacity ?? state.capacity;
  const availableSet = new Set(state.available_assets ?? []);

  return (
    <div className="flex flex-col min-w-0 border-0 sm:border border-slate-200 dark:border-slate-700 rounded-none sm:rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-none">
        <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Inventory</h2>
        <span className="ml-auto text-xs font-mono text-slate-500 dark:text-slate-400">{usedCapacity}/{totalCapacity}</span>
      </div>

      <div className="sm:flex-1 sm:overflow-y-auto">
        {state.inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-slate-400 dark:text-slate-600 text-sm">
            <Package className="w-5 h-5 mb-1 opacity-40" />
            <span className="text-xs">No holdings</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-3 py-1 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Token</th>
                <th className="px-3 py-1 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
                <th className="px-3 py-1 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg Cost</th>
                <th className="w-16 px-2 py-1"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.inventory.map(item => (
                <InventoryRow
                  key={item.assetId}
                  item={item}
                  currentPrice={state.market_prices[item.assetId]?.price ?? null}
                  isAvailable={availableSet.has(item.assetId)}
                  isExternalHover={hoveredAssetId === item.assetId}
                  onSell={onSell}
                  onMouseEnter={() => onHoverAsset(item.assetId)}
                  onMouseLeave={() => onHoverAsset(null)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
