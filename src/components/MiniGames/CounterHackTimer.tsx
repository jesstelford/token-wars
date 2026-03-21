import { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface CounterHackTimerProps {
  onComplete: (theftMultiplier: number) => void;
}

export function CounterHackTimer({ onComplete }: CounterHackTimerProps) {
  const [holding, setHolding] = useState(false);
  const [fillPercent, setFillPercent] = useState(0);
  const [released, setReleased] = useState(false);
  const [outcome, setOutcome] = useState<'full' | 'near' | 'partial' | 'miss' | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const releasedRef = useRef(false);

  const FILL_DURATION_MS = 5000;
  const ZONE_BOTTOM = 0.65;
  const ZONE_TOP = 0.85;

  const resolveRelease = useCallback((fill: number) => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    setReleased(true);
    setFillPercent(fill);

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (totalTimerRef.current !== null) clearTimeout(totalTimerRef.current);

    let mult: number;
    let res: 'full' | 'near' | 'partial' | 'miss';
    if (fill >= ZONE_BOTTOM && fill <= ZONE_TOP) { mult = 0.0; res = 'full'; }
    else if (fill >= 0.55 && fill <= 0.90) { mult = 0.35; res = 'near'; }
    else if (fill >= 0.45 && fill <= 0.95) { mult = 0.65; res = 'partial'; }
    else { mult = 1.0; res = 'miss'; }

    setOutcome(res);
    setTimeout(() => onCompleteRef.current(mult), 1400);
  }, []);

  const startHold = useCallback(() => {
    if (released) return;
    holdStartRef.current = performance.now();
    setHolding(true);

    function animate() {
      if (holdStartRef.current === null) return;
      const elapsed = performance.now() - holdStartRef.current;
      const pct = Math.min(elapsed / FILL_DURATION_MS, 1.0);
      setFillPercent(pct);
      if (pct < 1.0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        resolveRelease(1.0);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [released, resolveRelease]);

  const endHold = useCallback(() => {
    if (released || holdStartRef.current === null) return;
    const elapsed = performance.now() - holdStartRef.current;
    const pct = Math.min(elapsed / FILL_DURATION_MS, 1.0);
    holdStartRef.current = null;
    setHolding(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    resolveRelease(pct);
  }, [released, resolveRelease]);

  useEffect(() => {
    totalTimerRef.current = setTimeout(() => {
      if (!releasedRef.current) resolveRelease(fillPercent);
    }, 7000);

    return () => {
      if (totalTimerRef.current !== null) clearTimeout(totalTimerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        startHold();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        endHold();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [startHold, endHold]);

  const zoneBottomPct = ZONE_BOTTOM * 100;
  const zoneHeightPct = (ZONE_TOP - ZONE_BOTTOM) * 100;
  const fillPct = fillPercent * 100;

  const inZone = fillPercent >= ZONE_BOTTOM && fillPercent <= ZONE_TOP;

  const outcomeLabels: Record<string, string> = {
    full: 'Counter complete — breach blocked',
    near: 'Near miss — 65% of funds protected',
    partial: 'Partial counter — 35% of funds protected',
    miss: 'Counter failed — full breach',
  };
  const outcomeColors: Record<string, string> = {
    full: 'var(--color-success)',
    near: 'var(--color-success)',
    partial: 'var(--color-warning)',
    miss: 'var(--color-danger)',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Counter-Hack Timer
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Hold and release when the bar reaches the amber zone
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative" style={{ width: 72, height: 200 }}>
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="absolute inset-x-0 bottom-0 transition-none"
              style={{
                height: `${fillPct}%`,
                background: inZone
                  ? 'var(--color-success)'
                  : holding
                    ? 'var(--color-accent)'
                    : 'var(--color-bg-muted)',
                transition: released ? 'none' : undefined,
              }}
            />

            <div
              className="absolute inset-x-0"
              style={{
                bottom: `${zoneBottomPct}%`,
                height: `${zoneHeightPct}%`,
                background: 'var(--color-warning-muted)',
                border: '1px solid var(--color-warning)',
                opacity: 0.8,
              }}
            />

            <div
              className="absolute inset-x-0 flex items-center justify-center"
              style={{
                bottom: `${(ZONE_BOTTOM + (ZONE_TOP - ZONE_BOTTOM) / 2) * 100}%`,
                transform: 'translateY(50%)',
              }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--color-warning)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                ZONE
              </span>
            </div>
          </div>
        </div>
      </div>

      {outcome ? (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm font-bold"
          style={{
            background: outcome === 'miss' ? 'var(--color-danger-muted)' : 'var(--color-success-muted)',
            border: `1px solid ${outcomeColors[outcome]}`,
            borderRadius: 'var(--radius-sm)',
            color: outcomeColors[outcome],
          }}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {outcomeLabels[outcome]}
        </div>
      ) : (
        <button
          onPointerDown={(e) => { e.preventDefault(); startHold(); }}
          onPointerUp={(e) => { e.preventDefault(); endHold(); }}
          onPointerLeave={() => { if (holding) endHold(); }}
          onPointerCancel={() => { if (holding) endHold(); }}
          className="w-full py-4 font-bold text-sm tracking-wide select-none focus:outline-none focus:ring-2 transition-colors"
          style={{
            background: holding ? 'var(--color-accent)' : 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            borderRadius: 'var(--radius-sm)',
            border: `2px solid ${holding ? 'var(--color-accent)' : 'var(--btn-primary-bg)'}`,
            userSelect: 'none',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            {holding ? 'HOLDING...' : 'HOLD to charge — Space / Hold button'}
          </div>
        </button>
      )}
    </div>
  );
}
