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
      onClose();
    } else {
      onWithdraw(numericValue);
      onClose();
    }
    setInputValue('');
  }

  function setMax() {
    setInputValue(String(maxForTab));
  }

  const actionLabel = activeTab === 'debt' ? 'Pay Debt' : activeTab === 'deposit' ? 'Deposit' : 'Withdraw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="shadow-2xl max-w-sm w-full mx-4 overflow-hidden" style={{ background: 'var(--modal-bg)', border: 'var(--modal-border-style) var(--modal-border)', borderRadius: 'var(--modal-radius)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            {isDebtMode
              ? <CreditCard className="w-5 h-5" style={{ color: 'var(--color-danger)' }} />
              : <Landmark className="w-5 h-5" style={{ color: 'var(--color-bank)' }} />
            }
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {isDebtMode ? 'Pay Debt' : 'Bank'}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }} className="transition-colors hover:opacity-80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          {!isDebtMode && (
            <div className="grid grid-cols-2 gap-1 p-1 mb-5" style={{ background: 'var(--color-bg-raised)', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => { setBankTab('deposit'); setInputValue(''); }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors"
                style={
                  bankTab === 'deposit'
                    ? { background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }
                    : { color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' }
                }
              >
                <ArrowDownCircle className="w-3.5 h-3.5" /> Deposit
              </button>
              <button
                onClick={() => { setBankTab('withdraw'); setInputValue(''); }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors"
                style={
                  bankTab === 'withdraw'
                    ? { background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }
                    : { color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' }
                }
              >
                <ArrowUpCircle className="w-3.5 h-3.5" /> Withdraw
              </button>
            </div>
          )}

          <div className="space-y-2.5 mb-5">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Cash on hand</span>
              <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{formatCurrencyFull(cash)}</span>
            </div>
            {!isDebtMode && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Bank savings <span className="text-xs" style={{ color: 'var(--color-success)' }}>(+3%/turn)</span></span>
                <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-bank)' }}>{formatCurrencyFull(bankSavings)}</span>
              </div>
            )}
            {isDebtMode && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Outstanding debt <span className="text-xs" style={{ color: 'var(--color-danger)' }}>(+10%/turn)</span></span>
                <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>{formatCurrencyFull(debt)}</span>
              </div>
            )}
          </div>

          {!isDebtMode && bankTab === 'deposit' && (
            <p className="text-xs px-3 py-2 mb-4" style={{ color: 'var(--color-warning)', background: 'var(--color-warning-muted)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)' }}>
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
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border-focus)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-sm)' }}
            />
            <button
              onClick={setMax}
              className="px-3 py-2 text-xs font-bold transition-colors hover:opacity-80"
              style={{ color: 'var(--color-accent)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)' }}
            >
              MAX
            </button>
          </div>

          <button
            onClick={handleAction}
            disabled={!isValid}
            className="w-full py-2.5 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              isDebtMode
                ? { background: 'var(--color-danger)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }
                : { background: 'var(--color-accent)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }
            }
          >
            {actionLabel}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>Free action — does not use a turn</p>
        </div>
      </div>
    </div>
  );
}
