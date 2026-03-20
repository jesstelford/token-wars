import { AlertTriangle, X } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';

interface TheftModalProps {
  type: 'robbery' | 'bank_hack';
  amountLost: number;
  newTotal: number;
  onClose: () => void;
}

export function TheftModal({ type, amountLost, newTotal, onClose }: TheftModalProps) {
  const isRobbery = type === 'robbery';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div className={`px-6 py-4 flex items-center gap-3 ${isRobbery ? 'bg-red-600' : 'bg-slate-800 dark:bg-slate-700'}`}>
          <AlertTriangle className="w-6 h-6 text-white shrink-0" />
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">
              {isRobbery ? 'You Were Robbed' : 'Bank Account Hacked'}
            </h2>
            <p className={`text-xs ${isRobbery ? 'text-red-200' : 'text-slate-300'}`}>
              {isRobbery ? 'Cash stolen from your wallet' : 'Savings drained remotely'}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">Amount lost</span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400 text-lg">
                -{formatCurrencyFull(amountLost)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-red-200 dark:border-red-800 pt-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {isRobbery ? 'Cash remaining' : 'Savings remaining'}
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                {formatCurrencyFull(newTotal)}
              </span>
            </div>
          </div>

          {isRobbery && (
            <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 leading-snug">
              Tip: Cash on hand is always at risk. Keep your savings in the bank — robbers can't touch it.
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
