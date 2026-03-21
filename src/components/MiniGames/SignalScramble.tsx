import { useEffect, useRef, useState, useCallback } from 'react';
import { useMiniGameTimer } from '../../hooks/useMiniGameTimer';

interface SignalScrambleProps {
  onComplete: (performanceScore: number) => void;
}

export function SignalScramble({ onComplete }: SignalScrambleProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<'perfect' | 'good' | 'edge' | 'miss' | null>(null);
  const [safeZoneStart] = useState(() => 0.10 + Math.random() * 0.64);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const safeZoneWidth = 0.16;
  const safeZoneCenter = safeZoneStart + safeZoneWidth / 2;

  const handleExpire = useCallback(() => {
    if (!locked) {
      setLocked(true);
      setResult('miss');
      setTimeout(() => onCompleteRef.current(0.0), 1200);
    }
  }, [locked]);

  const { timeRemaining, progressFraction, stop } = useMiniGameTimer(6, handleExpire);

  const handleLock = useCallback(() => {
    if (locked) return;
    if (!trackRef.current || !indicatorRef.current) return;

    stop();
    setLocked(true);

    const trackRect = trackRef.current.getBoundingClientRect();
    const indicatorRect = indicatorRef.current.getBoundingClientRect();
    const indicatorCenter = indicatorRect.left + indicatorRect.width / 2;
    const normalizedPos = (indicatorCenter - trackRect.left) / trackRect.width;
    const distance = Math.abs(normalizedPos - safeZoneCenter);

    let score: number;
    let res: 'perfect' | 'good' | 'edge' | 'miss';
    if (distance <= 0.04) { score = 1.0; res = 'perfect'; }
    else if (distance <= 0.08) { score = 0.65; res = 'good'; }
    else if (distance <= 0.13) { score = 0.30; res = 'edge'; }
    else { score = 0.0; res = 'miss'; }

    setResult(res);
    setTimeout(() => onCompleteRef.current(score), 1200);
  }, [locked, safeZoneCenter, stop]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleLock();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLock]);

  const resultColors: Record<string, string> = {
    perfect: 'var(--color-success)',
    good: 'var(--color-success)',
    edge: 'var(--color-warning)',
    miss: 'var(--color-danger)',
  };

  const resultLabels: Record<string, string> = {
    perfect: 'Perfect — 95% escape chance',
    good: 'Good — 83% escape chance',
    edge: 'Edge — 71% escape chance',
    miss: 'Missed — 25% escape chance',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Signal Scramble
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Lock in when the bar hits the green zone
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono w-5 text-right" style={{ color: 'var(--color-text-muted)' }}>{timeRemaining}s</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${progressFraction * 100}%`,
              background: timeRemaining <= 2 ? 'var(--color-danger)' : 'var(--color-accent)',
              transition: 'width 1s linear',
            }}
          />
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-8 rounded-lg overflow-hidden select-none"
        style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="absolute top-0 bottom-0 rounded"
          style={{
            left: `${safeZoneStart * 100}%`,
            width: `${safeZoneWidth * 100}%`,
            background: locked && result
              ? (result === 'miss' ? 'var(--color-danger-muted)' : 'var(--color-success-muted)')
              : 'var(--color-success-muted)',
            border: `1px solid ${locked && result ? (result === 'miss' ? 'var(--color-danger)' : 'var(--color-success)') : 'var(--color-success)'}`,
          }}
        />

        {!locked && (
          <div
            ref={indicatorRef}
            className="absolute top-1 bottom-1 w-3.5 rounded-sm"
            style={{
              background: 'var(--color-text-primary)',
              animation: 'signal-scramble-bounce 1.8s linear infinite',
              boxShadow: '0 0 6px var(--color-accent)',
            }}
          />
        )}

        {locked && result && (
          <div
            className="absolute top-0 bottom-0 w-1 rounded"
            style={{
              left: `calc(${safeZoneCenter * 100}% - 2px)`,
              background: resultColors[result],
            }}
          />
        )}
      </div>

      {result && (
        <div
          className="text-center text-sm font-bold py-2 rounded-lg"
          style={{
            color: resultColors[result],
            background: result === 'miss' ? 'var(--color-danger-muted)' : 'var(--color-success-muted)',
            border: `1px solid ${resultColors[result]}`,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {resultLabels[result]}
        </div>
      )}

      {!locked && (
        <button
          onClick={handleLock}
          onTouchEnd={(e) => { e.preventDefault(); handleLock(); }}
          className="w-full py-3 font-bold text-sm tracking-wide transition-colors focus:outline-none focus:ring-2"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-accent)',
            focusRingColor: 'var(--color-accent)',
          }}
        >
          LOCK IN — Space / Enter / Tap
        </button>
      )}

      <style>{`
        @keyframes signal-scramble-bounce {
          0%   { left: 2%; }
          50%  { left: calc(96% - 14px); }
          100% { left: 2%; }
        }
      `}</style>
    </div>
  );
}
