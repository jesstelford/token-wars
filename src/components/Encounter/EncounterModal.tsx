import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import type { EncounterState, InventoryItem } from '../../types/game';
import type { GearItemId } from '../../constants/items';
import { GEAR_MAP, RARITY_COLORS } from '../../constants/items';
import { GearIcon } from '../Gear/GearIcon';
import { buildDetailedInventoryLoss, type LostInventoryEntry } from '../../utils/encounters';
import type { ActiveEffects } from '../../utils/gearEffects';
import { SignalScramble } from '../MiniGames/SignalScramble';
import { VoltageSurge } from '../MiniGames/VoltageSurge';

interface EncounterModalProps {
  encounter: EncounterState;
  inventory: InventoryItem[];
  gearEffects?: ActiveEffects;
  onRun: (success: boolean, precomputedInventory?: InventoryItem[], lostItems?: LostInventoryEntry[]) => void;
  onFight: (success: boolean, healthLost: number) => void;
}

type Decision = 'run' | 'fight' | null;
type MiniGamePhase = 'choose' | 'minigame' | 'result';

interface Result {
  success: boolean;
  message: string;
  healthLost?: number;
  itemDrop?: GearItemId;
  lostItems?: LostInventoryEntry[];
  precomputedInventory?: InventoryItem[];
}

export function EncounterModal({ encounter, inventory, gearEffects, onRun, onFight }: EncounterModalProps) {
  const [decision, setDecision] = useState<Decision>(null);
  const [phase, setPhase] = useState<MiniGamePhase>('choose');
  const [result, setResult] = useState<Result | null>(null);
  const [resolvedSuccess, setResolvedSuccess] = useState<boolean>(false);

  function handleRunStart() {
    setDecision('run');
    setPhase('minigame');
  }

  function handleFightStart() {
    setDecision('fight');
    setPhase('minigame');
  }

  function handleSignalScrambleComplete(performanceScore: number) {
    const effectiveRate = performanceScore === 0.0
      ? 0.25
      : 0.60 + performanceScore * 0.35;
    const capped = Math.min(0.95, effectiveRate);
    const success = Math.random() < capped;
    setResolvedSuccess(success);

    if (success) {
      setResult({ success, message: 'You slipped away before they could catch you. Close call.' });
    } else {
      const { newInventory, lostItems } = buildDetailedInventoryLoss(inventory, gearEffects);
      const lostSummary = lostItems.length > 0
        ? lostItems.map(l => `${l.quantityLost}x ${l.name}`).join(', ')
        : null;
      setResult({
        success,
        message: lostSummary
          ? `They caught you. Seized: ${lostSummary}. -20 vibes.`
          : `They caught you. Nothing seized. -20 vibes.`,
        lostItems: lostItems.length > 0 ? lostItems : undefined,
        precomputedInventory: newInventory,
      });
    }
    setPhase('result');
  }

  function handleVoltageSurgeComplete(evadePoints: number, counterPoints: number) {
    const counterRatio = counterPoints / 5;
    const evadeRatio = evadePoints / 5;
    const adjustedSuccessRate = Math.min(0.75, 0.30 + counterRatio * 0.45);
    const success = Math.random() < adjustedSuccessRate;

    const baseHealthLoss = 40 + Math.floor(Math.random() * 11);
    const evadeReduction = evadeRatio * 0.60;
    const gearReduction = gearEffects?.fightHealthLossReduction ?? 0;
    const healthLost = success ? 0 : Math.round(baseHealthLoss * (1 - evadeReduction) * (1 - gearReduction));

    const itemDrop = encounter.pendingItemDrop;
    setResolvedSuccess(success);
    setResult({
      success,
      healthLost,
      message: success
        ? 'You outmaneuvered them legally. Assets retained, no damage taken.'
        : `You lost the fight. -${healthLost} vibes.`,
      itemDrop: success ? itemDrop : undefined,
    });
    setPhase('result');
  }

  function handleContinue() {
    if (decision === 'run') {
      onRun(resolvedSuccess, result?.precomputedInventory, result?.lostItems);
    } else if (decision === 'fight') {
      onFight(resolvedSuccess, result?.healthLost ?? 0);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="shadow-2xl max-w-md w-full mx-4 overflow-hidden" style={{ background: 'var(--modal-bg)', border: '1px solid var(--color-danger)', borderRadius: 'var(--modal-radius)' }}>
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'var(--color-danger)' }}>
          <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: 'var(--color-text-inverse)' }} />
          <div>
            <h2 className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-text-inverse)' }}>Regulator Alert</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-inverse)', opacity: 0.8 }}>Encounter in {encounter.communityName}</p>
          </div>
        </div>

        <div className="px-6 py-5">
          {phase === 'choose' && (
            <>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>{encounter.message}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRunStart}
                  className="flex flex-col items-center gap-2 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 hover:opacity-80"
                  style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-raised)' }}
                >
                  <span className="text-2xl">🏃</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent)' }}>Run</span>
                  <span className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>Timing mini-game. Base 60% escape — skill improves odds</span>
                </button>

                <button
                  onClick={handleFightStart}
                  className="flex flex-col items-center gap-2 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 hover:opacity-80"
                  style={{ border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', background: 'var(--color-danger-muted)' }}
                >
                  <span className="text-2xl">⚖️</span>
                  <span className="font-bold" style={{ color: 'var(--color-danger)' }}>Fight</span>
                  <span className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>Allocate points. Counter raises win chance, Evade reduces damage</span>
                </button>
              </div>
            </>
          )}

          {phase === 'minigame' && decision === 'run' && (
            <SignalScramble onComplete={handleSignalScrambleComplete} />
          )}

          {phase === 'minigame' && decision === 'fight' && (
            <VoltageSurge onComplete={handleVoltageSurgeComplete} />
          )}

          {phase === 'result' && result && (
            <>
              <div
                className="flex items-start gap-3 p-4 mb-4"
                style={
                  result.success
                    ? { background: 'var(--color-success-muted)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)' }
                    : { background: 'var(--color-danger-muted)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)' }
                }
              >
                {result.success
                  ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                  : <XCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-danger)' }} />
                }
                <div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: result.success ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {result.success ? 'Success' : 'Failed'}
                    {' — '}
                    {decision === 'run' ? 'Run' : 'Fight'}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{result.message}</p>
                </div>
              </div>

              {result.success && result.itemDrop && (() => {
                const item = GEAR_MAP[result.itemDrop];
                if (!item) return null;
                const colors = RARITY_COLORS[item.rarity];
                return (
                  <div className="mb-4 p-3 flex items-center gap-3" style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors.border} ${colors.bg} shrink-0`}>
                      <GearIcon name={item.icon} className={`w-3.5 h-3.5 ${colors.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-semibold">Spoils of victory</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.effectSummary}</p>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={handleContinue}
                className="w-full py-2.5 font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' }}
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
