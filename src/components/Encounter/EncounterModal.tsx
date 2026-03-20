import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import type { EncounterState } from '../../types/game';
import type { GearItemId } from '../../constants/items';
import { GEAR_MAP, RARITY_COLORS } from '../../constants/items';
import { GearIcon } from '../Gear/GearIcon';

interface EncounterModalProps {
  encounter: EncounterState;
  onRun: (success: boolean) => void;
  onFight: (success: boolean, healthLost: number) => void;
}

type Decision = 'run' | 'fight' | null;

interface Result {
  success: boolean;
  message: string;
  healthLost?: number;
  itemDrop?: GearItemId;
}

const RUN_SUCCESS_RATE = 0.60;
const FIGHT_SUCCESS_RATE = 0.30;

export function EncounterModal({ encounter, onRun, onFight }: EncounterModalProps) {
  const [decision, setDecision] = useState<Decision>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [resolvedSuccess, setResolvedSuccess] = useState<boolean>(false);

  function handleRun() {
    const success = Math.random() < RUN_SUCCESS_RATE;
    setDecision('run');
    setResolvedSuccess(success);
    setResult({
      success,
      message: success
        ? 'You slipped away before they could catch you. Close call.'
        : 'They caught you. Some of your inventory was seized and you took 20 health damage.',
    });
  }

  function handleFight() {
    const success = Math.random() < FIGHT_SUCCESS_RATE;
    const healthLost = success ? 0 : 40 + Math.floor(Math.random() * 11);
    const itemDrop = encounter.pendingItemDrop;
    setDecision('fight');
    setResolvedSuccess(success);
    setResult({
      success,
      healthLost,
      message: success
        ? 'You outmaneuvered them legally. Assets retained, no damage taken.'
        : `You lost the fight. You took ${healthLost} health damage.`,
      itemDrop: success ? itemDrop : undefined,
    });
  }

  function handleContinue() {
    if (decision === 'run') {
      onRun(resolvedSuccess);
    } else if (decision === 'fight') {
      onFight(resolvedSuccess, result?.healthLost ?? 0);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-white shrink-0" />
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">Regulator Alert</h2>
            <p className="text-red-200 text-xs">Encounter in {encounter.communityName}</p>
          </div>
        </div>

        <div className="px-6 py-5">
          {!result ? (
            <>
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-6">{encounter.message}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRun}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <span className="text-2xl">🏃</span>
                  <span className="font-bold text-sky-700 dark:text-sky-300">Run</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-center">60% success. Fail: lose 50–100% of some inventory + 20 health</span>
                </button>

                <button
                  onClick={handleFight}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <span className="text-2xl">⚖️</span>
                  <span className="font-bold text-red-700 dark:text-red-300">Fight</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-center">30% success. Fail: 40–50 health or terminated</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
                result.success
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                {result.success
                  ? <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`font-bold text-sm mb-0.5 ${result.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                    {result.success ? 'Success' : 'Failed'}
                    {' — '}
                    {decision === 'run' ? 'Run' : 'Fight'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.message}</p>
                </div>
              </div>

              {result.success && result.itemDrop && (() => {
                const item = GEAR_MAP[result.itemDrop];
                if (!item) return null;
                const colors = RARITY_COLORS[item.rarity];
                return (
                  <div className="mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors.border} ${colors.bg} shrink-0`}>
                      <GearIcon name={item.icon} className={`w-3.5 h-3.5 ${colors.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-semibold">Spoils of victory</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.effectSummary}</p>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={handleContinue}
                className="w-full py-2.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
