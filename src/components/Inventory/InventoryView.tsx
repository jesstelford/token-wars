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
    <div
      className="flex flex-col min-w-0 border-0 sm:border overflow-hidden theme-panel"
      style={{ borderRadius: '0', borderColor: 'var(--color-border)' }}
    >
      <div className="theme-panel-header flex items-center gap-2 px-3 py-2 flex-none">
        <Package className="w-4 h-4" style={{ color: 'var(--panel-header-text)' }} />
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--panel-header-text)', fontFamily: 'var(--font-heading)' }}
        >
          Inventory
        </h2>
        <span
          className="ml-auto text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          {usedCapacity}/{totalCapacity}
        </span>
      </div>

      <div className="sm:flex-1 sm:overflow-y-auto" style={{ background: 'var(--color-bg-surface)' }}>
        {state.inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Package className="w-5 h-5 mb-1 opacity-40" />
            <span className="text-xs">No holdings</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th
                  className="px-3 py-1 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  Token
                </th>
                <th
                  className="px-3 py-1 text-right text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  Qty
                </th>
                <th
                  className="px-3 py-1 text-right text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  Avg Cost
                </th>
                <th className="w-16 px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
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
