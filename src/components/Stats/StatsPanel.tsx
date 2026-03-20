import { Activity, DollarSign, Calendar, Landmark, CreditCard } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';
import type { GameState } from '../../types/game';
import { BANK_INTEREST_RATE, DEBT_INTEREST_RATE } from '../../constants/assets';

interface StatsPanelProps {
  state: GameState;
  onOpenBank: () => void;
  onOpenDebt: () => void;
}

export function StatsPanel({ state, onOpenBank, onOpenDebt }: StatsPanelProps) {
  const healthPct = state.health;
  const healthColor =
    healthPct > 60 ? 'var(--color-success)' :
    healthPct > 30 ? 'var(--color-warning)' :
    'var(--color-danger)';

  const debtRatio = state.current_debt / Math.max(1, state.current_cash + state.bank_savings + state.current_debt);
  const debtTextColor = debtRatio > 0.5 ? 'var(--color-danger)' : 'var(--color-text-primary)';

  const bankRate = `+${(BANK_INTEREST_RATE * 100).toFixed(0)}%/turn`;
  const debtRate = `+${(DEBT_INTEREST_RATE * 100).toFixed(0)}%/turn`;

  return (
    <div
      className="theme-panel flex flex-col border-0 sm:border overflow-hidden"
      style={{ borderRadius: '0', borderColor: 'var(--color-border)' }}
    >
      <div
        className="theme-panel-header flex items-center gap-2 px-3 py-2 flex-none"
      >
        <Activity className="w-4 h-4" style={{ color: 'var(--panel-header-text)' }} />
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--panel-header-text)', fontFamily: 'var(--font-heading)' }}
        >
          Status
        </h2>
        <span
          className="ml-auto flex items-center gap-1 text-xs font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          <Calendar className="w-3 h-3" />
          Day {state.current_day}
          <span style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>/31</span>
        </span>
      </div>

      <div className="flex flex-col gap-px" style={{ background: 'var(--color-border)' }}>
        <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--color-border)' }}>
          <div className="px-3 py-2" style={{ background: 'var(--color-bg-surface)' }}>
            <div className="flex items-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
              <span
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem' }}
              >
                Cash
              </span>
            </div>
            <div
              className="font-bold text-sm"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
            >
              {formatCurrencyFull(state.current_cash)}
            </div>
          </div>

          <button
            onClick={onOpenBank}
            className="px-3 py-2 text-left transition-all focus:outline-none"
            style={{
              background: 'var(--color-bank-muted)',
              borderLeft: '1px solid var(--color-bank-border)',
              borderRight: '1px solid var(--color-bank-border)',
            }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Landmark className="w-3 h-3" style={{ color: 'var(--color-bank)' }} />
              <span
                className="text-xs uppercase tracking-wide font-semibold"
                style={{ color: 'var(--color-bank)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem' }}
              >
                Bank
              </span>
              <span
                className="ml-auto text-xs font-semibold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontSize: '0.65rem' }}
              >
                {bankRate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div
                className="font-bold text-sm"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-bank)' }}
              >
                {formatCurrencyFull(state.bank_savings)}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-bank)', fontFamily: 'var(--font-body)', opacity: 0.8 }}
              >
                Manage →
              </span>
            </div>
          </button>

          <button
            onClick={onOpenDebt}
            className="px-3 py-2 text-left transition-all focus:outline-none"
            style={{
              background: 'var(--color-danger-muted)',
              borderLeft: '1px solid rgba(var(--color-danger), 0.3)',
            }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <CreditCard className="w-3 h-3" style={{ color: 'var(--color-danger)' }} />
              <span
                className="text-xs uppercase tracking-wide font-semibold"
                style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem' }}
              >
                Debt
              </span>
              <span
                className="ml-auto text-xs font-semibold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontSize: '0.65rem' }}
              >
                {debtRate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div
                className="font-bold text-sm"
                style={{ fontFamily: 'var(--font-mono)', color: debtTextColor }}
              >
                {formatCurrencyFull(state.current_debt)}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-body)', opacity: 0.8 }}
              >
                Pay →
              </span>
            </div>
          </button>
        </div>

        <div className="px-3 py-2" style={{ background: 'var(--color-bg-surface)' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
              <span
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem' }}
              >
                Vibes
              </span>
            </div>
            <span
              className="font-bold text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: healthColor }}
            >
              {state.health}
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/100</span>
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--health-bar-track)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${healthPct}%`, background: healthColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
