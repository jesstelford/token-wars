import { ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';
import type { MarketPrice } from '../../types/game';
import type { AssetId } from '../../constants/assets';
import { ASSET_MAP } from '../../constants/assets';

interface AssetRowProps {
  assetId: AssetId;
  marketEntry: MarketPrice;
  isExternalHover: boolean;
  onBuy: (assetId: AssetId) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function AssetRow({ assetId, marketEntry, isExternalHover, onBuy, onMouseEnter, onMouseLeave }: AssetRowProps) {
  const asset = ASSET_MAP[assetId];
  if (!asset) return null;

  const { price, isAnomaly, anomalyType } = marketEntry;

  const rowBg = isAnomaly
    ? anomalyType === 'surge'
      ? 'bg-amber-50/60 dark:bg-amber-900/10'
      : 'bg-red-50/60 dark:bg-red-900/10'
    : '';

  const externalHoverClass = isExternalHover ? 'bg-slate-50 dark:bg-slate-800/50' : '';

  return (
    <tr
      onClick={() => onBuy(assetId)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${rowBg} ${externalHoverClass}`}
    >
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          {isAnomaly && (
            anomalyType === 'surge'
              ? <TrendingUp className="w-3 h-3 text-amber-500 shrink-0" />
              : <TrendingDown className="w-3 h-3 text-red-500 shrink-0" />
          )}
          <span className={`text-xs font-semibold ${isAnomaly ? (anomalyType === 'surge' ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300') : 'text-slate-800 dark:text-slate-100'}`}>
            {asset.name}
          </span>
        </div>
      </td>
      <td className="px-3 py-1.5 text-right">
        <span className={`font-mono text-xs font-bold ${
          isAnomaly
            ? anomalyType === 'surge'
              ? 'text-amber-600 dark:text-amber-300'
              : 'text-red-600 dark:text-red-400'
            : 'text-slate-700 dark:text-slate-200'
        }`}>
          {formatCurrencyFull(price)}
        </span>
      </td>
      <td className="px-2 py-1.5 text-right w-16">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 ${
            isExternalHover
              ? ''
              : 'group-hover:bg-sky-600 group-hover:text-white dark:group-hover:bg-sky-600 dark:group-hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3 h-3" />
          Buy
        </span>
      </td>
    </tr>
  );
}
