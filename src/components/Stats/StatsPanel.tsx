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
  const healthColor =
    state.health > 60 ? 'text-emerald-600 dark:text-emerald-400' :
    state.health > 30 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400';

  const healthBarColor =
    state.health > 60 ? 'bg-emerald-500' :
    state.health > 30 ? 'bg-amber-500' :
    'bg-red-500';

  const debtRatio = state.current_debt / Math.max(1, state.current_cash + state.bank_savings + state.current_debt);
  const debtColor = debtRatio > 0.5 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100';

  const bankRate = `+${(BANK_INTEREST_RATE * 100).toFixed(0)}%/turn`;
  const debtRate = `+${(DEBT_INTEREST_RATE * 100).toFixed(0)}%/turn`;

  return (
    <div className="flex flex-col border-0 sm:border border-slate-200 dark:border-slate-700 rounded-none sm:rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-none">
        <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Status</h2>
        <span className="ml-auto flex items-center gap-1 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
          <Calendar className="w-3 h-3" />
          Day {state.current_day}<span className="text-slate-300 dark:text-slate-600">/31</span>
        </span>
      </div>

      <div className="flex flex-col gap-px bg-slate-100 dark:bg-slate-800">
        <div className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800">
          <div className="bg-white dark:bg-slate-900 px-3 py-2">
            <div className="flex items-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cash</span>
            </div>
            <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">{formatCurrencyFull(state.current_cash)}</div>
          </div>

          <button
            onClick={onOpenBank}
            className="bg-sky-50 dark:bg-sky-900/20 px-3 py-2 text-left border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 active:bg-sky-200 dark:active:bg-sky-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-inset"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Landmark className="w-3 h-3 text-sky-500" />
              <span className="text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wide font-semibold">Bank</span>
              <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{bankRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-mono font-bold text-sm text-sky-700 dark:text-sky-300">{formatCurrencyFull(state.bank_savings)}</div>
              <span className="text-xs text-sky-500 dark:text-sky-400 font-medium">Manage →</span>
            </div>
          </button>

          <button
            onClick={onOpenDebt}
            className="bg-red-50 dark:bg-red-900/20 px-3 py-2 text-left border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 active:bg-red-200 dark:active:bg-red-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <CreditCard className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide font-semibold">Debt</span>
              <span className="ml-auto text-xs text-red-500 dark:text-red-400 font-mono font-semibold">{debtRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`font-mono font-bold text-sm ${debtColor}`}>{formatCurrencyFull(state.current_debt)}</div>
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">Pay →</span>
            </div>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vibes</span>
            </div>
            <span className={`font-mono font-bold text-xs ${healthColor}`}>{state.health}<span className="text-slate-400 dark:text-slate-500 font-normal">/100</span></span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${healthBarColor}`}
              style={{ width: `${state.health}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
