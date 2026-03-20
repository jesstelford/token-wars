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
  const isSurge = isAnomaly && anomalyType === 'surge';
  const isCrash = isAnomaly && anomalyType === 'crash';

  const rowBg = isSurge
    ? 'var(--event-surge-bg)'
    : isCrash
    ? 'var(--event-crash-bg)'
    : isExternalHover
    ? 'var(--table-hover-bg)'
    : 'transparent';

  const nameColor = isSurge ? 'var(--color-warning)' : isCrash ? 'var(--color-danger)' : 'var(--color-text-primary)';
  const priceColor = isSurge ? 'var(--color-warning)' : isCrash ? 'var(--color-danger)' : 'var(--color-text-primary)';

  return (
    <tr
      onClick={() => onBuy(assetId)}
      onMouseEnter={e => {
        onMouseEnter();
        (e.currentTarget as HTMLTableRowElement).style.background = 'var(--table-hover-bg)';
      }}
      onMouseLeave={e => {
        onMouseLeave();
        (e.currentTarget as HTMLTableRowElement).style.background = rowBg;
      }}
      style={{
        background: rowBg,
        borderBottom: '1px solid var(--table-divider)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <td className="px-3 py-1.5">
        <span className="text-xs font-semibold" style={{ color: nameColor, fontFamily: 'var(--font-body)' }}>
          {asset.name}
        </span>
      </td>
      <td className="px-3 py-1.5 text-right">
        <div className="inline-flex items-center justify-end gap-1">
          {isSurge && <TrendingUp className="w-3 h-3 shrink-0" style={{ color: 'var(--color-warning)' }} />}
          {isCrash && <TrendingDown className="w-3 h-3 shrink-0" style={{ color: 'var(--color-danger)' }} />}
          <span className="font-bold text-xs" style={{ fontFamily: 'var(--font-mono)', color: priceColor }}>
            {formatCurrencyFull(price)}
          </span>
        </div>
      </td>
      <td className="px-2 py-1.5 text-right w-16">
        <span
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1"
          style={{
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent-muted)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <ShoppingCart className="w-3 h-3" />
          Buy
        </span>
      </td>
    </tr>
  );
}
