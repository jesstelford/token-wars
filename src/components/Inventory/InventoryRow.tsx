import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';
import type { InventoryItem } from '../../types/game';
import { ASSET_MAP } from '../../constants/assets';
import type { AssetId } from '../../constants/assets';

interface InventoryRowProps {
  item: InventoryItem;
  currentPrice: number | null;
  isAvailable: boolean;
  isExternalHover: boolean;
  onSell: (assetId: AssetId) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function InventoryRow({ item, currentPrice, isAvailable, isExternalHover, onSell, onMouseEnter, onMouseLeave }: InventoryRowProps) {
  const asset = ASSET_MAP[item.assetId];
  if (!asset) return null;

  const roundedAvg = Math.round(item.avgPurchasePrice);
  const roundedPrice = currentPrice != null ? Math.round(currentPrice) : null;
  const isAtParity = isAvailable && currentPrice != null && item.avgPurchasePrice > 0 && roundedAvg === roundedPrice;

  const diff = isAvailable && currentPrice != null && item.avgPurchasePrice > 0 && !isAtParity
    ? currentPrice - item.avgPurchasePrice
    : 0;

  const isProfit = isAvailable && diff > 0;
  const isLoss = isAvailable && diff < 0;

  const badgeClass = !isAvailable
    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
    : isProfit
    ? 'bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white dark:bg-emerald-900/40 dark:text-emerald-300 dark:group-hover:bg-emerald-600 dark:group-hover:text-white'
    : isLoss
    ? 'bg-red-100 group-hover:bg-red-600 text-red-700 group-hover:text-white dark:bg-red-900/40 dark:text-red-300 dark:group-hover:bg-red-600 dark:group-hover:text-white'
    : 'bg-slate-100 group-hover:bg-slate-500 text-slate-500 group-hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-500 dark:group-hover:text-white';

  const Icon = isProfit ? TrendingUp : isLoss ? TrendingDown : Minus;

  const rowHoverClass = isAvailable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'cursor-not-allowed';
  const externalHoverClass = isExternalHover ? 'bg-slate-50 dark:bg-slate-800/50' : '';

  return (
    <tr
      onClick={() => isAvailable && onSell(item.assetId)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group transition-colors ${rowHoverClass} ${externalHoverClass}`}
    >
      <td className="px-3 py-1.5">
        <span className={`text-xs font-semibold ${isAvailable ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
          {asset.name}
        </span>
      </td>
      <td className="px-3 py-1.5 text-right">
        <span className={`font-mono text-xs ${isAvailable ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
          {item.quantity}
        </span>
      </td>
      <td className="px-3 py-1.5 text-right">
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {item.avgPurchasePrice > 0 ? formatCurrencyFull(item.avgPurchasePrice) : '—'}
        </span>
      </td>
      <td className="px-2 py-1.5 text-right w-16">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${badgeClass}`}>
          <Icon className="w-3 h-3" />
          Sell
        </span>
      </td>
    </tr>
  );
}
