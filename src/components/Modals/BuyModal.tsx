import { useState } from 'react';
import { X, ShoppingCart, Minus, Plus, Landmark } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';
import type { AssetId } from '../../constants/assets';
import { ASSET_MAP } from '../../constants/assets';
import type { MarketPrice } from '../../types/game';

interface BuyModalProps {
  assetId: AssetId;
  marketEntry: MarketPrice;
  cash: number;
  bankSavings: number;
  usedCapacity: number;
  totalCapacity: number;
  onBuy: (assetId: AssetId, quantity: number) => void;
  onClose: () => void;
}

export function BuyModal({ assetId, marketEntry, cash, bankSavings, usedCapacity, totalCapacity, onBuy, onClose }: BuyModalProps) {
  const asset = ASSET_MAP[assetId];
  const price = marketEntry.price;
  const maxByCapacity = totalCapacity - usedCapacity;
  const maxByFunds = Math.floor(cash / price);
  const maxQty = Math.min(maxByCapacity, maxByFunds);

  const maxWithBank = Math.min(maxByCapacity, Math.floor((cash + bankSavings) / price));
  const extraAffordable = maxWithBank - maxQty;
  const showBankHint = bankSavings > 0 && extraAffordable > 0;

  const [inputStr, setInputStr] = useState('1');
  const quantity = parseInt(inputStr) || 0;
  const totalCost = price * quantity;
  const canAfford = quantity > 0 && totalCost <= cash && quantity <= maxByCapacity;

  const atMin = quantity <= 1;
  const atMax = quantity >= maxQty;

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
      setInputStr(inputStr === '' ? '1' : inputStr);
      return;
    }
    setInputStr(String(Math.max(1, parsed)));
  }

  function handleBuy() {
    if (!canAfford) return;
    onBuy(assetId, quantity);
    onClose();
  }

  return (
    <div className="theme-modal fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--modal-backdrop)' }}>
      <div
        className="max-w-sm w-full mx-4 overflow-hidden shadow-2xl"
        style={{
          background: 'var(--modal-bg)',
          border: 'var(--modal-border-style) var(--modal-border)',
          borderRadius: 'var(--modal-radius)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
              Buy {asset?.name}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }} className="transition-colors hover:opacity-70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {marketEntry.isAnomaly && (
            <div
              className="text-xs px-3 py-2 font-semibold"
              style={{
                borderRadius: 'var(--radius-sm)',
                background: marketEntry.anomalyType === 'surge' ? 'var(--event-surge-bg)' : 'var(--event-crash-bg)',
                color: marketEntry.anomalyType === 'surge' ? 'var(--color-warning)' : 'var(--color-danger)',
                border: `1px solid ${marketEntry.anomalyType === 'surge' ? 'var(--event-surge-border)' : 'var(--event-crash-border)'}`,
              }}
            >
              {marketEntry.anomalyType === 'surge' ? 'SURGE ACTIVE — Price elevated' : 'CRASH ACTIVE — Price depressed'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Unit price</span>
              <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{formatCurrencyFull(price)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Your cash</span>
              <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{formatCurrencyFull(cash)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Space available</span>
              <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{maxByCapacity} units</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={atMin}
              className="w-9 h-9 flex items-center justify-center font-bold transition-colors"
              style={{
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: atMin ? 'var(--color-bg-muted)' : 'var(--color-bg-raised)',
                color: atMin ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                cursor: atMin ? 'not-allowed' : 'pointer',
              }}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={inputStr}
              onChange={handleInputChange}
              className="flex-1 text-center px-3 py-2 text-sm font-bold focus:outline-none"
              style={{
                border: '1px solid var(--color-border-focus)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-input)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <button
              onClick={handleIncrement}
              disabled={atMax}
              className="w-9 h-9 flex items-center justify-center font-bold transition-colors"
              style={{
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: atMax ? 'var(--color-bg-muted)' : 'var(--color-bg-raised)',
                color: atMax ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                cursor: atMax ? 'not-allowed' : 'pointer',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setInputStr(String(maxQty))}
              disabled={atMax}
              className="px-3 py-2 text-xs font-bold transition-colors"
              style={{
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-accent)',
                color: atMax ? 'var(--color-text-muted)' : 'var(--color-accent)',
                background: 'transparent',
                cursor: atMax ? 'not-allowed' : 'pointer',
              }}
            >
              MAX
            </button>
          </div>

          {showBankHint && (
            <div
              className="flex items-start gap-2 px-3 py-2.5"
              style={{
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bank-muted)',
                border: '1px solid var(--color-bank-border)',
              }}
            >
              <Landmark className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-bank)' }} />
              <p className="text-xs leading-snug" style={{ color: 'var(--color-bank)', fontFamily: 'var(--font-body)' }}>
                You have {formatCurrencyFull(bankSavings)} in the bank. Withdraw first to afford {extraAffordable} more unit{extraAffordable !== 1 ? 's' : ''}.
              </p>
            </div>
          )}

          <div
            className="flex justify-between items-center py-2"
            style={{ borderTop: '1px solid var(--color-border-light)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Total cost</span>
            <span
              className="font-bold text-lg"
              style={{ fontFamily: 'var(--font-mono)', color: canAfford ? 'var(--color-text-primary)' : 'var(--color-danger)' }}
            >
              {formatCurrencyFull(totalCost)}
            </span>
          </div>

          <button
            onClick={handleBuy}
            disabled={!canAfford || maxQty <= 0}
            className="theme-btn-primary w-full py-2.5 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {maxQty <= 0 ? 'Cannot Afford / No Space' : `Buy ${quantity || 0} unit${quantity !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
