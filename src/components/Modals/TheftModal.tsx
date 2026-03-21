import { useState, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatCurrencyFull } from '../../utils/formatting';
import { PortScanBlock } from '../MiniGames/PortScanBlock';
import { CounterHackTimer } from '../MiniGames/CounterHackTimer';
import { DecoyProtocol } from '../MiniGames/DecoyProtocol';

type MiniGameType = 'port_scan' | 'counter_hack' | 'decoy';

function pickBankHackGame(): MiniGameType {
  return Math.random() < 0.5 ? 'counter_hack' : 'decoy';
}

interface TheftModalProps {
  type: 'robbery' | 'bank_hack';
  amountLost: number;
  newTotal: number;
  onClose: (adjustedAmountLost?: number, adjustedNewTotal?: number) => void;
}

type Phase = 'minigame' | 'result';

export function TheftModal({ type, amountLost, newTotal, onClose }: TheftModalProps) {
  const isRobbery = type === 'robbery';
  const [miniGame] = useState<MiniGameType>(() => isRobbery ? 'port_scan' : pickBankHackGame());
  const [phase, setPhase] = useState<Phase>('minigame');
  const [finalAmountLost, setFinalAmountLost] = useState(amountLost);
  const [finalNewTotal, setFinalNewTotal] = useState(newTotal);
  const [multiplierUsed, setMultiplierUsed] = useState(1.0);
  const originalRef = useRef({ amountLost, newTotal });

  const originalAmountLost = originalRef.current.amountLost;
  const originalNewTotal = originalRef.current.newTotal;

  function handleMiniGameComplete(theftMultiplier: number) {
    const savedAmount = originalAmountLost - Math.floor(originalAmountLost * theftMultiplier);
    const newAmt = Math.floor(originalAmountLost * theftMultiplier);
    const newTot = originalNewTotal + savedAmount;
    setFinalAmountLost(newAmt);
    setFinalNewTotal(newTot);
    setMultiplierUsed(theftMultiplier);
    setPhase('result');
  }

  function handleContinue() {
    onClose(finalAmountLost, finalNewTotal);
  }

  const percentBlocked = Math.round((1 - multiplierUsed) * 100);

  const miniGameTitles: Record<MiniGameType, string> = {
    port_scan: 'Incoming Breach',
    counter_hack: 'Intrusion Detected',
    decoy: 'Social Engineering Attack',
  };

  const miniGameSubtitles: Record<MiniGameType, string> = {
    port_scan: 'Block the intrusion nodes before they drain your wallet',
    counter_hack: 'Counter the hack to protect your bank savings',
    decoy: 'Track the real wallet to protect your savings',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="shadow-2xl max-w-sm w-full mx-4 overflow-hidden" style={{ background: 'var(--modal-bg)', border: '1px solid var(--color-danger)', borderRadius: 'var(--modal-radius)' }}>
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{
            background: isRobbery ? 'var(--color-danger)' : 'var(--color-bg-raised)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: isRobbery ? 'var(--color-text-inverse)' : 'var(--color-warning)' }} />
          <div>
            <h2 className="font-bold text-lg tracking-tight" style={{ color: isRobbery ? 'var(--color-text-inverse)' : 'var(--color-text-primary)' }}>
              {phase === 'minigame' ? miniGameTitles[miniGame] : (isRobbery ? 'You Were Robbed' : 'Bank Account Hacked')}
            </h2>
            <p className="text-xs" style={{ color: isRobbery ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)', opacity: isRobbery ? 0.85 : 1 }}>
              {phase === 'minigame' ? miniGameSubtitles[miniGame] : (isRobbery ? 'Cash stolen from your wallet' : 'Savings drained remotely')}
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          {phase === 'minigame' && (
            <>
              {miniGame === 'port_scan' && (
                <PortScanBlock onComplete={handleMiniGameComplete} />
              )}
              {miniGame === 'counter_hack' && (
                <CounterHackTimer onComplete={handleMiniGameComplete} />
              )}
              {miniGame === 'decoy' && (
                <DecoyProtocol onComplete={handleMiniGameComplete} />
              )}
            </>
          )}

          {phase === 'result' && (
            <>
              {percentBlocked > 0 && (
                <div
                  className="flex items-center gap-2 p-3 mb-4 text-sm font-bold"
                  style={{
                    background: percentBlocked === 100 ? 'var(--color-success-muted)' : 'var(--color-warning-muted)',
                    border: `1px solid ${percentBlocked === 100 ? 'var(--color-success)' : 'var(--color-warning)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: percentBlocked === 100 ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  {percentBlocked === 100
                    ? `Fully blocked — ${isRobbery ? 'cash' : 'savings'} protected`
                    : `${percentBlocked}% blocked — partial protection`}
                </div>
              )}

              <div className="p-4 mb-5" style={{ background: 'var(--color-danger-muted)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Amount lost</span>
                  <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-mono)', color: finalAmountLost === 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {finalAmountLost === 0 ? '$0' : `-${formatCurrencyFull(finalAmountLost)}`}
                  </span>
                </div>
                {percentBlocked > 0 && percentBlocked < 100 && (
                  <div className="flex justify-between items-center mb-2" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Original exposure</span>
                    <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                      -{formatCurrencyFull(originalAmountLost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--color-danger)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {isRobbery ? 'Cash remaining' : 'Savings remaining'}
                  </span>
                  <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {formatCurrencyFull(finalNewTotal)}
                  </span>
                </div>
              </div>

              {isRobbery && finalAmountLost > 0 && (
                <div className="mb-4 text-xs px-3 py-2.5 leading-snug" style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  Tip: Cash on hand is always at risk. Keep your savings in the bank — robbers can't touch it.
                </div>
              )}

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
