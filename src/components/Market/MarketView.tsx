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
    <div className="flex flex-col min-w-0 border-0 sm:border border-slate-200 dark:border-slate-700 rounded-none sm:rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-none">
        <BarChart2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Market</h2>
      </div>

      <div className="sm:flex-1 sm:overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Token</th>
              <th className="px-3 py-1 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">$/1M tok</th>
              <th className="w-16 px-2 py-1"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
