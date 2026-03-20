import { useState } from 'react';
import { X, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';
import type { AssetId } from '../../constants/assets';
import { ASSET_MAP } from '../../constants/assets';
import type { MarketPrice, InventoryItem } from '../../types/game';

interface SellModalProps {
  assetId: AssetId;
  marketEntry: MarketPrice;
  inventoryItem: InventoryItem;
  onSell: (assetId: AssetId, quantity: number) => void;
  onClose: () => void;
}

export function SellModal({ assetId, marketEntry, inventoryItem, onSell, onClose }: SellModalProps) {
  const asset = ASSET_MAP[assetId];
  const price = marketEntry.price;
  const maxQty = inventoryItem.quantity;
  const avgPurchasePrice = inventoryItem.avgPurchasePrice ?? 0;

  const [inputStr, setInputStr] = useState(String(maxQty));
  const quantity = parseInt(inputStr) || 0;
  const totalRevenue = price * quantity;
  const totalCost = avgPurchasePrice * quantity;
  const profitLoss = avgPurchasePrice > 0 ? totalRevenue - totalCost : null;
  const isValid = quantity > 0 && quantity <= maxQty;

  function handleDecrement() {
    setInputStr(String(Math.max(1, quantity - 1)));
  }

  function handleIncrement() {
    setInputStr(String(Math.min(maxQty, quantity + 1)));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val === '') { setInputStr(''); return; }
    const parsed = parseInt(val);
    if (isNaN(parsed)) return;
    if (parsed > maxQty) {
      setInputStr(inputStr === '' ? String(maxQty) : inputStr);
      return;
    }
    setInputStr(String(Math.max(1, parsed)));
  }

  function handleSell() {
    if (!isValid) return;
    onSell(assetId, quantity);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="shadow-2xl max-w-sm w-full mx-4 overflow-hidden" style={{ background: 'var(--modal-bg)', border: 'var(--modal-border-style) var(--modal-border)', borderRadius: 'var(--modal-radius)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Sell {asset?.name}</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }} className="transition-colors hover:opacity-80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {marketEntry.isAnomaly && (
            <div
              className="text-xs px-3 py-2 font-semibold"
              style={
                marketEntry.anomalyType === 'surge'
                  ? { background: 'var(--color-warning-muted)', color: 'var(--color-warning)', borderRadius: 'var(--radius-sm)' }
                  : { background: 'var(--color-danger-muted)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)' }
              }
            >
              {marketEntry.anomalyType === 'surge' ? 'SURGE — Great time to sell!' : 'CRASH — Low sell price'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Unit price</span>
              <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{formatCurrencyFull(price)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Held quantity</span>
              <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{maxQty} units</div>
            </div>
            {avgPurchasePrice > 0 && (
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Avg buy price</span>
                <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{formatCurrencyFull(avgPurchasePrice)}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              className="w-9 h-9 flex items-center justify-center font-bold transition-colors hover:opacity-80"
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-raised)' }}
            >-</button>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={inputStr}
              onChange={handleInputChange}
              className="flex-1 text-center px-3 py-2 text-sm font-bold focus:outline-none"
              style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border-focus)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            />
            <button
              onClick={handleIncrement}
              className="w-9 h-9 flex items-center justify-center font-bold transition-colors hover:opacity-80"
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-raised)' }}
            >+</button>
            <button
              onClick={() => setInputStr(String(maxQty))}
              className="px-3 py-2 text-xs font-bold transition-colors hover:opacity-80"
              style={{ color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)' }}
            >MAX</button>
          </div>

          <div className="space-y-2 py-2" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Total revenue</span>
              <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
                {formatCurrencyFull(totalRevenue)}
              </span>
            </div>
            {profitLoss !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  {profitLoss >= 0
                    ? <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                    : <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />
                  }
                  {profitLoss >= 0 ? 'Profit' : 'Loss'}
                </span>
                <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-mono)', color: profitLoss >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {profitLoss >= 0 ? '+' : ''}{formatCurrencyFull(profitLoss)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleSell}
            disabled={!isValid}
            className="w-full py-2.5 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-success)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }}
          >
            Sell {quantity || 0} unit{quantity !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
