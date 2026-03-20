import { useState } from 'react';
import { X, Tag } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(maxQty);
  const totalRevenue = price * quantity;
  const isValid = quantity > 0 && quantity <= maxQty;

  function handleSell() {
    if (!isValid) return;
    onSell(assetId, quantity);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 dark:text-white">Sell {asset?.name}</h2>
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
              {marketEntry.anomalyType === 'surge' ? 'SURGE — Great time to sell!' : 'CRASH — Low sell price'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Unit price</span>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{formatCurrencyFull(price)}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Held quantity</span>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{maxQty} units</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-colors"
            >-</button>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={e => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
              className="flex-1 text-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
              className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-colors"
            >+</button>
            <button
              onClick={() => setQuantity(maxQty)}
              className="px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
            >MAX</button>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Total revenue</span>
            <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
              {formatCurrencyFull(totalRevenue)}
            </span>
          </div>

          <button
            onClick={handleSell}
            disabled={!isValid}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
          >
            Sell {quantity} unit{quantity !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
