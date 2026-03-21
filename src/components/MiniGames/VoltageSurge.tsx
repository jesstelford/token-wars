import { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Zap } from 'lucide-react';
import { useMiniGameTimer } from '../../hooks/useMiniGameTimer';

interface VoltageSurgeProps {
  onComplete: (evadePoints: number, counterPoints: number) => void;
}

export function VoltageSurge({ onComplete }: VoltageSurgeProps) {
  const [evade, setEvade] = useState(0);
  const [counter, setCounter] = useState(0);
  const [committed, setCommitted] = useState(false);
  const [focusedStat, setFocusedStat] = useState<'evade' | 'counter'>('evade');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const remaining = 5 - evade - counter;

  const handleCommit = useCallback(() => {
    if (committed) return;
    setCommitted(true);
    onCompleteRef.current(evade, counter);
  }, [committed, evade, counter]);

  const handleExpire = useCallback(() => {
    if (!committed) {
      setCommitted(true);
      onCompleteRef.current(evade, counter);
    }
  }, [committed, evade, counter]);

  const { timeRemaining, progressFraction, stop } = useMiniGameTimer(10, handleExpire);

  const adjustEvade = useCallback((delta: number) => {
    if (committed) return;
    setEvade(prev => {
      const next = prev + delta;
      if (next < 0) return prev;
      if (next > 5) return prev;
      if (next + counter > 5) return prev;
      return next;
    });
  }, [committed, counter]);

  const adjustCounter = useCallback((delta: number) => {
    if (committed) return;
    setCounter(prev => {
      const next = prev + delta;
      if (next < 0) return prev;
      if (next > 5) return prev;
      if (next + evade > 5) return prev;
      return next;
    });
  }, [committed, evade]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (committed) return;
      if (e.key === 'ArrowLeft') { setFocusedStat('evade'); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setFocusedStat('counter'); e.preventDefault(); }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedStat === 'evade') adjustEvade(1);
        else adjustCounter(1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusedStat === 'evade') adjustEvade(-1);
        else adjustCounter(-1);
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        stop();
        handleCommit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [committed, focusedStat, adjustEvade, adjustCounter, handleCommit, stop]);

  const evadeDmgReduction = Math.round((evade / 5) * 60);
  const winChance = Math.round(Math.min(75, (0.30 + (counter / 5) * 0.45) * 100));

  const COUNTER_COLOR = 'var(--color-text-primary)';
  const COUNTER_FOCUS_COLOR = 'var(--color-text-primary)';

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Voltage Surge
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Distribute 5 points between Evade and Counter
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono w-5 text-right" style={{ color: 'var(--color-text-muted)' }}>{timeRemaining}s</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressFraction * 100}%`,
              background: timeRemaining <= 3 ? 'var(--color-danger)' : 'var(--color-warning)',
              transition: 'width 1s linear',
            }}
          />
        </div>
      </div>

      <div
        className="text-center py-1.5 rounded text-sm font-bold"
        style={{
          background: remaining > 0 ? 'var(--color-warning-muted)' : 'var(--color-success-muted)',
          color: remaining > 0 ? 'var(--color-warning)' : 'var(--color-success)',
          border: `1px solid ${remaining > 0 ? 'var(--color-warning)' : 'var(--color-success)'}`,
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {remaining} point{remaining !== 1 ? 's' : ''} remaining
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all"
          style={{
            border: `2px solid ${focusedStat === 'evade' && !committed ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-raised)',
          }}
        >
          <Shield className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Evade</span>

          <div className="flex items-center gap-2 w-full justify-between">
            <button
              onClick={() => { adjustEvade(-1); setFocusedStat('evade'); }}
              disabled={committed || evade === 0}
              className="w-8 h-8 flex items-center justify-center text-base font-bold transition-colors focus:outline-none focus:ring-1 disabled:opacity-40"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)' }}
            >−</button>
            <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', minWidth: 24, textAlign: 'center' }}>{evade}</span>
            <button
              onClick={() => { adjustEvade(1); setFocusedStat('evade'); }}
              disabled={committed || remaining === 0}
              className="w-8 h-8 flex items-center justify-center text-base font-bold transition-colors focus:outline-none focus:ring-1 disabled:opacity-40"
              style={{ background: 'var(--color-accent)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-inverse)' }}
            >+</button>
          </div>

          <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
            {evade > 0 ? `-${evadeDmgReduction}%` : '—'}
          </p>
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            dmg if lose
          </p>
        </div>

        <div
          className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all"
          style={{
            border: `2px solid ${focusedStat === 'counter' && !committed ? COUNTER_FOCUS_COLOR : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-raised)',
          }}
        >
          <Zap className="w-5 h-5" style={{ color: COUNTER_COLOR }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Counter</span>

          <div className="flex items-center gap-2 w-full justify-between">
            <button
              onClick={() => { adjustCounter(-1); setFocusedStat('counter'); }}
              disabled={committed || counter === 0}
              className="w-8 h-8 flex items-center justify-center text-base font-bold transition-colors focus:outline-none focus:ring-1 disabled:opacity-40"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)' }}
            >−</button>
            <span className="text-xl font-bold tabular-nums" style={{ color: COUNTER_COLOR, fontFamily: 'var(--font-mono)', minWidth: 24, textAlign: 'center' }}>{counter}</span>
            <button
              onClick={() => { adjustCounter(1); setFocusedStat('counter'); }}
              disabled={committed || remaining === 0}
              className="w-8 h-8 flex items-center justify-center text-base font-bold transition-colors focus:outline-none focus:ring-1 disabled:opacity-40"
              style={{ background: 'var(--color-bg-surface)', border: `1px solid ${COUNTER_COLOR}`, borderRadius: 'var(--radius-sm)', color: COUNTER_COLOR }}
            >+</button>
          </div>

          <p className="text-2xl font-black tabular-nums" style={{ color: COUNTER_COLOR, fontFamily: 'var(--font-mono)' }}>
            {winChance}%
          </p>
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            win chance
          </p>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        ← → to switch · ↑ ↓ to adjust · Enter to commit
      </p>

      <button
        onClick={() => { stop(); handleCommit(); }}
        disabled={committed}
        className="w-full py-3 font-bold text-sm tracking-wide transition-colors focus:outline-none focus:ring-2 disabled:opacity-50"
        style={{
          background: committed ? 'var(--color-bg-raised)' : 'var(--btn-primary-bg)',
          color: committed ? 'var(--color-text-muted)' : 'var(--btn-primary-text)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        {committed ? 'Committed' : 'COMMIT'}
      </button>
    </div>
  );
}
