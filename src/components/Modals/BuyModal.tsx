import { useState } from 'react';
import { X, ShoppingCart, Minus, Plus } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';
import type { AssetId } from '../../constants/assets';
import { ASSET_MAP } from '../../constants/assets';
import type { MarketPrice } from '../../types/game';

interface BuyModalProps {
  assetId: AssetId;
  marketEntry: MarketPrice;
  cash: number;
  usedCapacity: number;
  totalCapacity: number;
  onBuy: (assetId: AssetId, quantity: number) => void;
  onClose: () => void;
}

export function BuyModal({ assetId, marketEntry, cash, usedCapacity, totalCapacity, onBuy, onClose }: BuyModalProps) {
  const asset = ASSET_MAP[assetId];
  const price = marketEntry.price;
  const maxByCapacity = totalCapacity - usedCapacity;
  const maxByFunds = Math.floor(cash / price);
  const maxQty = Math.min(maxByCapacity, maxByFunds);

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
    if (!isNaN(parsed)) setInputStr(String(Math.min(maxQty, Math.max(1, parsed))));
  }

  function handleBuy() {
    if (!canAfford) return;
    onBuy(assetId, quantity);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-600" />
            <h2 className="font-bold text-slate-900 dark:text-white">Buy {asset?.name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {marketEntry.isAnomaly && (
            <div className={`text-xs px-3 py-2 rounded-md font-semibold ${
              marketEntry.anomalyType === 'surge'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
            }`}>
              {marketEntry.anomalyType === 'surge' ? 'SURGE ACTIVE — Price elevated' : 'CRASH ACTIVE — Price depressed'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Unit price</span>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{formatCurrencyFull(price)}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Your cash</span>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{formatCurrencyFull(cash)}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Space available</span>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{maxByCapacity} units</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Max affordable</span>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{maxByFunds} units</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={atMin}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold transition-colors ${
                atMin
                  ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={inputStr}
              onChange={handleInputChange}
              className="flex-1 text-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={handleIncrement}
              disabled={atMax}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold transition-colors ${
                atMax
                  ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setInputStr(String(maxQty))}
              disabled={atMax}
              className={`px-3 py-2 text-xs font-bold border rounded-lg transition-colors ${
                atMax
                  ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/30'
              }`}
            >
              MAX
            </button>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Total cost</span>
            <span className={`font-mono font-bold text-lg ${canAfford ? 'text-slate-800 dark:text-slate-100' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrencyFull(totalCost)}
            </span>
          </div>

          <button
            onClick={handleBuy}
            disabled={!canAfford || maxQty <= 0}
            className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
          >
            {maxQty <= 0 ? 'Cannot Afford / No Space' : `Buy ${quantity || 0} unit${quantity !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
