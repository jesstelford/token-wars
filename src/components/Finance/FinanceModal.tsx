import { useState } from 'react';
import { X, Landmark, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';

interface FinanceModalProps {
  cash: number;
  bankSavings: number;
  debt: number;
  initialTab?: 'debt' | 'deposit' | 'withdraw';
  onClose: () => void;
  onPayDebt: (amount: number) => void;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

type BankTab = 'deposit' | 'withdraw';

export function FinanceModal({ cash, bankSavings, debt, initialTab = 'debt', onClose, onPayDebt, onDeposit, onWithdraw }: FinanceModalProps) {
  const isDebtMode = initialTab === 'debt';
  const [bankTab, setBankTab] = useState<BankTab>(initialTab === 'withdraw' ? 'withdraw' : 'deposit');
  const [inputValue, setInputValue] = useState('');

  const numericValue = parseFloat(inputValue.replace(/,/g, '')) || 0;

  const activeTab = isDebtMode ? 'debt' : bankTab;
  const rawMax = activeTab === 'debt' ? Math.min(cash, debt) : activeTab === 'deposit' ? cash : bankSavings;
  const maxForTab = activeTab === 'debt' ? Math.floor(rawMax) : rawMax;
  const isValid = numericValue > 0 && numericValue <= maxForTab;

  function handleAction() {
    if (numericValue <= 0) return;
    if (activeTab === 'debt') {
      onPayDebt(numericValue);
      onClose();
    } else if (activeTab === 'deposit') {
      onDeposit(numericValue);
    } else {
      onWithdraw(numericValue);
    }
    setInputValue('');
  }

  function setMax() {
    setInputValue(String(maxForTab));
  }

  const actionLabel = activeTab === 'debt' ? 'Pay Debt' : activeTab === 'deposit' ? 'Deposit' : 'Withdraw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {isDebtMode
              ? <CreditCard className="w-5 h-5 text-red-500" />
              : <Landmark className="w-5 h-5 text-sky-600" />
            }
            <h2 className="font-bold text-slate-900 dark:text-white">
              {isDebtMode ? 'Pay Debt' : 'Bank'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          {!isDebtMode && (
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-5">
              <button
                onClick={() => { setBankTab('deposit'); setInputValue(''); }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  bankTab === 'deposit'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ArrowDownCircle className="w-3.5 h-3.5" /> Deposit
              </button>
              <button
                onClick={() => { setBankTab('withdraw'); setInputValue(''); }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  bankTab === 'withdraw'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ArrowUpCircle className="w-3.5 h-3.5" /> Withdraw
              </button>
            </div>
          )}

          <div className="space-y-2.5 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Cash on hand</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatCurrencyFull(cash)}</span>
            </div>
            {!isDebtMode && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Bank savings <span className="text-emerald-600 dark:text-emerald-400 text-xs">(+3%/turn)</span></span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{formatCurrencyFull(bankSavings)}</span>
              </div>
            )}
            {isDebtMode && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Outstanding debt <span className="text-red-500 dark:text-red-400 text-xs">(+10%/turn)</span></span>
                <span className="font-mono font-semibold text-red-600 dark:text-red-400">{formatCurrencyFull(debt)}</span>
              </div>
            )}
          </div>

          {!isDebtMode && bankTab === 'deposit' && (
            <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md px-3 py-2 mb-4">
              Bank earns 3% interest per turn. 4% chance of being hacked (up to 80% loss).
            </p>
          )}

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              min="0"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Enter amount"
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={setMax}
              className="px-3 py-2 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
            >
              MAX
            </button>
          </div>

          <button
            onClick={handleAction}
            disabled={!isValid}
            className={`w-full py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors ${
              isDebtMode
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {actionLabel}
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">Free action — does not use a turn</p>
        </div>
      </div>
    </div>
  );
}
