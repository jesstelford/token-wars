import { BarChart2 } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import type { AssetId } from '../../constants/assets';
import type { GameState } from '../../types/game';
import { AssetRow } from './AssetRow';

interface MarketViewProps {
  state: GameState;
  hoveredAssetId: AssetId | null;
  onHoverAsset: (assetId: AssetId | null) => void;
  onBuy: (assetId: AssetId) => void;
}

const SORTED_ASSETS = [...ASSETS].sort((a, b) => a.name.localeCompare(b.name));

export function MarketView({ state, hoveredAssetId, onHoverAsset, onBuy }: MarketViewProps) {
  const available = new Set(state.available_assets ?? ASSETS.map(a => a.id));
  const visibleAssets = SORTED_ASSETS.filter(a => available.has(a.id));

  return (
    <div
      className="flex flex-col min-w-0 border-0 sm:border overflow-hidden theme-panel"
      style={{ borderRadius: '0', borderColor: 'var(--color-border)' }}
    >
      <div
        className="theme-panel-header flex items-center gap-2 px-3 py-2 flex-none"
      >
        <BarChart2 className="w-4 h-4" style={{ color: 'var(--panel-header-text)' }} />
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--panel-header-text)', fontFamily: 'var(--font-heading)' }}
        >
          Market
        </h2>
      </div>

      <div className="sm:flex-1 sm:overflow-y-auto" style={{ background: 'var(--color-bg-surface)' }}>
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
                $/1M tok
              </th>
              <th className="w-16 px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {visibleAssets.map(asset => (
              <AssetRow
                key={asset.id}
                assetId={asset.id as AssetId}
                marketEntry={state.market_prices[asset.id as AssetId]}
                isExternalHover={hoveredAssetId === asset.id}
                onBuy={onBuy}
                onMouseEnter={() => onHoverAsset(asset.id as AssetId)}
                onMouseLeave={() => onHoverAsset(null)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
