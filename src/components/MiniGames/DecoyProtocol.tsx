import { useState, useEffect, useRef, useCallback } from 'react';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { useMiniGameTimer } from '../../hooks/useMiniGameTimer';

interface DecoyProtocolProps {
  onComplete: (theftMultiplier: number) => void;
}

export function DecoyProtocol({ onComplete }: DecoyProtocolProps) {
  const [realWalletIndex] = useState(() => Math.floor(Math.random() * 3));
  const [positions, setPositions] = useState([0, 1, 2]);
  const [shuffling, setShuffling] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [focusedTile, setFocusedTile] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const doneRef = useRef(false);

  const realPositionRef = useRef<number>(realWalletIndex);

  const handleSelect = useCallback((tileIndex: number) => {
    if (!shuffling && !revealed && selected === null) {
      setSelected(tileIndex);
      setRevealed(true);
      doneRef.current = true;

      const isCorrect = positions[tileIndex] === realWalletIndex;
      const mult = isCorrect ? 0.0 : 1.0;
      setTimeout(() => onCompleteRef.current(mult), 1500);
    }
  }, [shuffling, revealed, selected, positions, realWalletIndex]);

  const handleExpire = useCallback(() => {
    if (!doneRef.current && !shuffling) {
      handleSelect(focusedTile);
    } else if (!doneRef.current) {
      doneRef.current = true;
      setTimeout(() => onCompleteRef.current(1.0), 500);
    }
  }, [shuffling, handleSelect, focusedTile]);

  const { timeRemaining, progressFraction } = useMiniGameTimer(shuffling ? 999 : 4, handleExpire);

  useEffect(() => {
    realPositionRef.current = realWalletIndex;
    let current = [0, 1, 2];
    const numSwaps = 5 + Math.floor(Math.random() * 3);
    const swapPairs: Array<[0 | 1, 1 | 2]> = [[0, 1], [1, 2]];

    let delay = 400;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < numSwaps; i++) {
      const pair = swapPairs[Math.floor(Math.random() * 2)];
      const [a, b] = pair;
      const newCurrent = [...current] as [number, number, number];
      const tmp = newCurrent[a];
      newCurrent[a] = newCurrent[b];
      newCurrent[b] = tmp;
      current = newCurrent;

      const capturedCurrent = [...newCurrent];
      const t = setTimeout(() => {
        setPositions(capturedCurrent);
        if (i === numSwaps - 1) {
          setTimeout(() => setShuffling(false), 300);
        }
      }, delay);
      timers.push(t);
      delay += 310;
    }

    return () => timers.forEach(clearTimeout);
  }, [realWalletIndex]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (shuffling || revealed) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); setFocusedTile(p => Math.max(0, p - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setFocusedTile(p => Math.min(2, p + 1)); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(focusedTile); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shuffling, revealed, focusedTile, handleSelect]);

  const tileLabels = ['A', 'B', 'C'];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Decoy Protocol
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {shuffling ? 'Track the real wallet...' : 'Which one is the real wallet?'}
        </p>
      </div>

      {!shuffling && (
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

      <div className="flex gap-3 justify-center">
        {[0, 1, 2].map((tileIndex) => {
          const originalWalletId = positions[tileIndex];
          const isReal = originalWalletId === realWalletIndex;
          const isSelected = selected === tileIndex;
          const isCorrectReveal = revealed && isSelected && isReal;
          const isWrongReveal = revealed && isSelected && !isReal;
          const isRevealedReal = revealed && isReal && !isSelected;

          return (
            <button
              key={tileIndex}
              onClick={() => handleSelect(tileIndex)}
              onTouchEnd={(e) => { e.preventDefault(); handleSelect(tileIndex); }}
              disabled={shuffling || revealed}
              className="flex flex-col items-center gap-2 py-5 transition-all select-none focus:outline-none"
              style={{
                width: 88,
                borderRadius: 'var(--radius-sm)',
                border: isCorrectReveal
                  ? '2px solid var(--color-success)'
                  : isWrongReveal
                    ? '2px solid var(--color-danger)'
                    : isRevealedReal
                      ? '2px solid var(--color-success)'
                      : focusedTile === tileIndex && !shuffling && !revealed
                        ? '2px solid var(--color-accent)'
                        : shuffling
                          ? '1px solid var(--color-border)'
                          : '1px solid var(--color-border)',
                background: isCorrectReveal
                  ? 'var(--color-success-muted)'
                  : isWrongReveal
                    ? 'var(--color-danger-muted)'
                    : isRevealedReal
                      ? 'var(--color-success-muted)'
                      : 'var(--color-bg-raised)',
                transform: shuffling ? undefined : 'none',
                transition: 'left 0.2s ease, background 0.2s, border-color 0.2s',
              }}
            >
              {revealed ? (
                isReal ? (
                  <Eye className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                ) : (
                  <EyeOff className="w-6 h-6" style={{ color: 'var(--color-danger)' }} />
                )
              ) : (
                <Wallet className="w-6 h-6" style={{ color: shuffling ? 'var(--color-text-muted)' : 'var(--color-accent)' }} />
              )}
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                {tileLabels[tileIndex]}
              </span>
              {revealed && (
                <span className="text-xs font-semibold" style={{
                  color: isReal ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {isReal ? 'REAL' : 'DECOY'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!shuffling && !revealed && (
        <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          ← → to select · Enter / Tap to confirm
        </p>
      )}

      {revealed && (
        <div
          className="text-center text-sm font-bold py-2 rounded-lg"
          style={{
            background: positions[selected!] === realWalletIndex ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
            color: positions[selected!] === realWalletIndex ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${positions[selected!] === realWalletIndex ? 'var(--color-success)' : 'var(--color-danger)'}`,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {positions[selected!] === realWalletIndex
            ? 'Correct — attacker hit the decoy!'
            : 'Wrong — real wallet compromised'}
        </div>
      )}

      {shuffling && (
        <div className="text-center py-1">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-warning)' }}>
            Shuffling...
          </span>
        </div>
      )}
    </div>
  );
}
