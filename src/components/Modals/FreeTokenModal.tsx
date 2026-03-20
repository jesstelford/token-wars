import { Gift, X } from 'lucide-react';
import { ASSET_MAP } from '../../constants/assets';
import type { AssetId } from '../../constants/assets';
import { formatCurrencyFull } from '../../utils/formatting';

interface FreeTokenModalProps {
  assetId: AssetId;
  quantity: number;
  communityName: string;
  onClose: () => void;
}

export function FreeTokenModal({ assetId, quantity, communityName, onClose }: FreeTokenModalProps) {
  const asset = ASSET_MAP[assetId];

  const tierLabels: Record<number, string> = {
    1: 'Tier 1 — Premium',
    2: 'Tier 2 — Standard',
    3: 'Tier 3 — Common',
    4: 'Tier 4 — Basic',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Free Tokens Received</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex flex-col items-center gap-3 py-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Gift className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                +{quantity}
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {asset?.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {tierLabels[asset?.tier ?? 4]}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Source</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{communityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Market value each</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">—</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Added to inventory</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{quantity} units</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            These tokens were acquired at no cost. They'll show a $0 average purchase price in your inventory.
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
          >
            Collect Tokens
          </button>
        </div>
      </div>
    </div>
  );
}
