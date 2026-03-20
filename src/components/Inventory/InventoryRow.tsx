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
  const isFreeToken = item.avgPurchasePrice === 0;
  const isAtParity = isAvailable && currentPrice != null && !isFreeToken && roundedAvg === roundedPrice;

  const diff = isAvailable && currentPrice != null && !isAtParity
    ? currentPrice - item.avgPurchasePrice
    : 0;

  const isProfit = isAvailable && diff > 0;
  const isLoss = isAvailable && diff < 0;

  const Icon = isProfit ? TrendingUp : isLoss ? TrendingDown : Minus;

  const badgeBg = !isAvailable
    ? 'var(--color-bg-muted)'
    : isProfit
    ? 'var(--color-success-muted)'
    : isLoss
    ? 'var(--color-danger-muted)'
    : 'var(--color-bg-muted)';

  const badgeColor = !isAvailable
    ? 'var(--color-text-muted)'
    : isProfit
    ? 'var(--color-success)'
    : isLoss
    ? 'var(--color-danger)'
    : 'var(--color-text-muted)';

  const nameColor = isAvailable ? 'var(--color-text-primary)' : 'var(--color-text-muted)';
  const qtyColor = isAvailable ? 'var(--color-text-secondary)' : 'var(--color-text-muted)';

  return (
    <tr
      onClick={() => isAvailable && onSell(item.assetId)}
      onMouseEnter={e => {
        onMouseEnter();
        if (isAvailable) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--table-hover-bg)';
      }}
      onMouseLeave={e => {
        onMouseLeave();
        (e.currentTarget as HTMLTableRowElement).style.background = isExternalHover ? 'var(--table-hover-bg)' : 'transparent';
      }}
      style={{
        background: isExternalHover ? 'var(--table-hover-bg)' : 'transparent',
        borderBottom: '1px solid var(--table-divider)',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        transition: 'background 0.15s',
      }}
    >
      <td className="px-3 py-1.5">
        <span className="text-xs font-semibold" style={{ color: nameColor, fontFamily: 'var(--font-body)' }}>
          {asset.name}
        </span>
      </td>
      <td className="px-3 py-1.5 text-right">
        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: qtyColor }}>
          {item.quantity}
        </span>
      </td>
      <td className="px-3 py-1.5 text-right">
        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          {formatCurrencyFull(item.avgPurchasePrice)}
        </span>
      </td>
      <td className="px-2 py-1.5 text-right w-16">
        <span
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1"
          style={{
            borderRadius: 'var(--radius-sm)',
            background: badgeBg,
            color: badgeColor,
            fontFamily: 'var(--font-body)',
            cursor: isAvailable ? 'pointer' : 'not-allowed',
          }}
        >
          <Icon className="w-3 h-3" />
          Sell
        </span>
      </td>
    </tr>
  );
}
