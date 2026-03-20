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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="shadow-2xl max-w-sm w-full mx-4 overflow-hidden" style={{ background: 'var(--modal-bg)', border: '1px solid var(--color-danger)', borderRadius: 'var(--modal-radius)' }}>
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={isRobbery ? { background: '#dc2626' } : { background: 'var(--color-bg-raised)' }}
        >
          <AlertTriangle className="w-6 h-6 text-white shrink-0" />
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">
              {isRobbery ? 'You Were Robbed' : 'Bank Account Hacked'}
            </h2>
            <p className="text-xs" style={{ color: isRobbery ? '#fecaca' : 'var(--color-text-secondary)' }}>
              {isRobbery ? 'Cash stolen from your wallet' : 'Savings drained remotely'}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto transition-colors hover:opacity-80" style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="p-4 mb-5" style={{ background: 'var(--color-danger-muted)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Amount lost</span>
              <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>
                -{formatCurrencyFull(amountLost)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--color-danger)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {isRobbery ? 'Cash remaining' : 'Savings remaining'}
              </span>
              <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {formatCurrencyFull(newTotal)}
              </span>
            </div>
          </div>

          {isRobbery && (
            <div className="mb-4 text-xs px-3 py-2.5 leading-snug" style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              Tip: Cash on hand is always at risk. Keep your savings in the bank — robbers can't touch it.
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
