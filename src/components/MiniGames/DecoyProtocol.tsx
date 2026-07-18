import { useState, useEffect, useRef, useCallback } from 'react';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { useMiniGameTimer } from '../../hooks/useMiniGameTimer';

interface DecoyProtocolProps {
  onComplete: (theftMultiplier: number) => void;
}

type Phase = 'reveal' | 'hide' | 'shuffling' | 'pick' | 'done';

const TILE_WIDTH = 88;
const GAP = 12;
const SLOT_POSITIONS = [0, TILE_WIDTH + GAP, (TILE_WIDTH + GAP) * 2];

function computePixelPositions(order: number[]): number[] {
  const out = [0, 0, 0];
  for (let slot = 0; slot < 3; slot++) {
    out[order[slot]] = SLOT_POSITIONS[slot];
  }
  return out;
}

export function DecoyProtocol({ onComplete }: DecoyProtocolProps) {
  const [realWalletId] = useState(() => Math.floor(Math.random() * 3));
  const [phase, setPhase] = useState<Phase>('reveal');
  const [, setOrder] = useState([0, 1, 2]);
  const [pixelX, setPixelX] = useState(SLOT_POSITIONS);
  const [animating, setAnimating] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [focusedWallet, setFocusedWallet] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const doneRef = useRef(false);
  const phaseRef = useRef<Phase>('reveal');
  phaseRef.current = phase;

  const handleSelect = useCallback((walletId: number) => {
    if (phaseRef.current !== 'pick' || doneRef.current) return;
    doneRef.current = true;
    setSelected(walletId);
    setPhase('done');
    const isCorrect = walletId === realWalletId;
    const mult = isCorrect ? 0.0 : 1.0;
    setTimeout(() => onCompleteRef.current(mult), 1500);
  }, [realWalletId]);

  const handleExpire = useCallback(() => {
    if (doneRef.current) return;
    if (phaseRef.current === 'pick') {
      handleSelect(focusedWallet);
    } else {
      doneRef.current = true;
      setTimeout(() => onCompleteRef.current(1.0), 300);
    }
  }, [handleSelect, focusedWallet]);

  const { timeRemaining, progressFraction } = useMiniGameTimer(
    phase === 'pick' ? 4 : 999,
    handleExpire,
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setPhase('hide');
    }, 1400));

    timers.push(setTimeout(() => {
      setPhase('shuffling');
    }, 2000));

    const numSwaps = 5 + Math.floor(Math.random() * 3);
    let currentOrder = [0, 1, 2];
    let delay = 2400;

    for (let i = 0; i < numSwaps; i++) {
      const swapA = Math.floor(Math.random() * 3);
      let swapB = Math.floor(Math.random() * 2);
      if (swapB >= swapA) swapB++;

      const capturedA = swapA;
      const capturedB = swapB;
      const newOrder = [...currentOrder];
      const tmp = newOrder[capturedA];
      newOrder[capturedA] = newOrder[capturedB];
      newOrder[capturedB] = tmp;
      currentOrder = newOrder;

      const capturedOrder = [...newOrder];

      timers.push(setTimeout(() => {
        setAnimating(true);
        setOrder(capturedOrder);
        setPixelX(computePixelPositions(capturedOrder));
        setTimeout(() => setAnimating(false), 280);
      }, delay));

      delay += 380 + Math.random() * 100;
    }

    timers.push(setTimeout(() => {
      setPhase('pick');
    }, delay + 200));

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (phase !== 'pick') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); setFocusedWallet(p => Math.max(0, p - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setFocusedWallet(p => Math.min(2, p + 1)); }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(focusedWallet);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, focusedWallet, handleSelect]);

  const containerWidth = TILE_WIDTH * 3 + GAP * 2;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Decoy Protocol
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {phase === 'reveal' && 'Memorise the real wallet...'}
          {phase === 'hide' && 'Wallets hiding...'}
          {phase === 'shuffling' && 'Track the real wallet through the shuffle'}
          {phase === 'pick' && 'Which one is the real wallet?'}
          {phase === 'done' && 'Result'}
        </p>
      </div>

      {phase === 'pick' && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono w-5 text-right" style={{ color: 'var(--color-text-muted)' }}>{timeRemaining}s</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressFraction * 100}%`,
                background: timeRemaining <= 1 ? 'var(--color-danger)' : 'var(--color-warning)',
                transition: 'width 1s linear',
              }}
            />
          </div>
        </div>
      )}

      <div
        className="relative mx-auto"
        style={{ width: containerWidth, height: TILE_WIDTH + 24 }}
      >
        {[0, 1, 2].map((walletId) => {
          const x = pixelX[walletId];
          const isReal = walletId === realWalletId;
          const isReveal = phase === 'reveal';
          const isDone = phase === 'done';
          const isSelectedWallet = selected === walletId;
          const isFocused = phase === 'pick' && focusedWallet === walletId;

          let borderColor = 'var(--color-border)';
          let borderWidth = '1px';
          let bg = 'var(--color-bg-raised)';

          if (isReveal && isReal) {
            borderColor = 'var(--color-success)';
            borderWidth = '2px';
            bg = 'var(--color-success-muted)';
          } else if (isDone && isReal) {
            borderColor = 'var(--color-success)';
            borderWidth = '2px';
            bg = 'var(--color-success-muted)';
          } else if (isDone && isSelectedWallet && !isReal) {
            borderColor = 'var(--color-danger)';
            borderWidth = '2px';
            bg = 'var(--color-danger-muted)';
          } else if (isFocused) {
            borderColor = 'var(--color-accent)';
            borderWidth = '2px';
          }

          return (
            <button
              key={walletId}
              onClick={() => handleSelect(walletId)}
              onTouchEnd={(e) => { e.preventDefault(); handleSelect(walletId); }}
              disabled={phase !== 'pick'}
              className="absolute flex flex-col items-center justify-center gap-2 py-4 select-none focus:outline-none"
              style={{
                width: TILE_WIDTH,
                top: 0,
                left: x,
                height: TILE_WIDTH + 20,
                borderRadius: 'var(--radius-sm)',
                border: `${borderWidth} solid ${borderColor}`,
                background: bg,
                transform: animating ? 'scale(0.96)' : 'scale(1)',
                transition: animating
                  ? `left 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.14s`
                  : `left 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.14s, background 0.2s, border-color 0.2s`,
                cursor: phase === 'pick' ? 'pointer' : 'default',
              }}
            >
              {isDone ? (
                isReal ? (
                  <Eye className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                ) : (
                  <EyeOff className="w-6 h-6" style={{ color: 'var(--color-danger)' }} />
                )
              ) : isReveal && isReal ? (
                <Eye className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
              ) : (
                <Wallet
                  className="w-6 h-6"
                  style={{
                    color: isReveal && isReal
                      ? 'var(--color-success)'
                      : phase === 'pick' || phase === 'shuffling'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-muted)',
                  }}
                />
              )}
              {isDone && (
                <span className="text-xs font-semibold" style={{
                  color: isReal ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {isReal ? 'REAL' : 'DECOY'}
                </span>
              )}
              {isReveal && isReal && (
                <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
                  REAL
                </span>
              )}
            </button>
          );
        })}
      </div>

      {phase === 'shuffling' && (
        <div className="text-center py-1">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-warning)' }}>
            Shuffling...
          </span>
        </div>
      )}

      {phase === 'pick' && (
        <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          ← → to select · Enter / Tap to confirm
        </p>
      )}

      {phase === 'done' && selected !== null && (
        <div
          className="text-center text-sm font-bold py-2"
          style={{
            background: selected === realWalletId ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
            color: selected === realWalletId ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${selected === realWalletId ? 'var(--color-success)' : 'var(--color-danger)'}`,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {selected === realWalletId
            ? 'Correct — attacker hit the decoy!'
            : 'Wrong — real wallet compromised'}
        </div>
      )}
    </div>
  );
}
