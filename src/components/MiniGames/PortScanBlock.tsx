import { useState, useEffect, useRef, useCallback } from 'react';
import { Wifi, WifiOff, Check } from 'lucide-react';
import { useMiniGameTimer } from '../../hooks/useMiniGameTimer';

interface NodeState {
  active: boolean;
  blocked: boolean;
  missed: boolean;
}

interface PortScanBlockProps {
  onComplete: (theftMultiplier: number) => void;
}

const TOTAL_EVENTS = 8;

export function PortScanBlock({ onComplete }: PortScanBlockProps) {
  const [nodes, setNodes] = useState<NodeState[]>(Array(6).fill(null).map(() => ({ active: false, blocked: false, missed: false })));
  const [blockedCount, setBlockedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedNode, setSelectedNode] = useState(0);
  const activationTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const deactivationTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const eventsFiredRef = useRef(0);
  const blockedRef = useRef(0);
  const gameOverRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleExpire = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    activationTimersRef.current.forEach(t => clearTimeout(t));
    deactivationTimersRef.current.forEach(t => clearTimeout(t));

    const count = blockedRef.current;
    let mult: number;
    if (count >= 7) mult = 0.0;
    else if (count >= 5) mult = 0.30;
    else if (count >= 3) mult = 0.60;
    else if (count >= 1) mult = 0.85;
    else mult = 1.0;

    setTimeout(() => onCompleteRef.current(mult), 1000);
  }, []);

  const { timeRemaining, progressFraction } = useMiniGameTimer(12, handleExpire);

  const blockNode = useCallback((idx: number) => {
    if (gameOverRef.current) return;
    setNodes(prev => {
      if (!prev[idx].active || prev[idx].blocked) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], active: false, blocked: true };
      setTimeout(() => {
        setNodes(n => {
          const r = [...n];
          r[idx] = { ...r[idx], blocked: false };
          return r;
        });
      }, 400);
      return next;
    });

    const existing = deactivationTimersRef.current.get(idx);
    if (existing !== undefined) {
      clearTimeout(existing);
      deactivationTimersRef.current.delete(idx);
    }

    blockedRef.current += 1;
    setBlockedCount(c => c + 1);
  }, []);

  useEffect(() => {
    const times: number[] = [];
    for (let i = 0; i < TOTAL_EVENTS; i++) {
      times.push(500 + (i / TOTAL_EVENTS) * 9500 + Math.random() * 800);
    }
    times.sort((a, b) => a - b);

    let activeCount = 0;

    times.forEach((t, eventIdx) => {
      const timer = setTimeout(() => {
        if (gameOverRef.current) return;
        if (activeCount >= 4) return;
        if (eventsFiredRef.current >= TOTAL_EVENTS) return;
        eventsFiredRef.current++;

        let nodeIdx = Math.floor(Math.random() * 6);
        let tries = 0;
        while (tries < 6) {
          let currentlyActive = false;
          setNodes(prev => {
            currentlyActive = prev[nodeIdx].active;
            return prev;
          });
          if (!currentlyActive) break;
          nodeIdx = (nodeIdx + 1) % 6;
          tries++;
        }

        const capturedNodeIdx = nodeIdx;
        activeCount++;
        setNodes(prev => {
          if (prev[capturedNodeIdx].active) return prev;
          const next = [...prev];
          next[capturedNodeIdx] = { ...next[capturedNodeIdx], active: true, blocked: false, missed: false };
          return next;
        });

        const windowMs = 1200 + Math.random() * 800;
        const deactTimer = setTimeout(() => {
          activeCount = Math.max(0, activeCount - 1);
          setNodes(prev => {
            if (!prev[capturedNodeIdx].active) return prev;
            const next = [...prev];
            next[capturedNodeIdx] = { ...next[capturedNodeIdx], active: false, missed: true };
            setTimeout(() => {
              setNodes(n => {
                const r = [...n];
                r[capturedNodeIdx] = { ...r[capturedNodeIdx], missed: false };
                return r;
              });
            }, 400);
            return next;
          });
          deactivationTimersRef.current.delete(capturedNodeIdx);
        }, windowMs);

        deactivationTimersRef.current.set(capturedNodeIdx, deactTimer);
      }, t);

      activationTimersRef.current.push(timer);
      void eventIdx;
    });

    return () => {
      activationTimersRef.current.forEach(t => clearTimeout(t));
      deactivationTimersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (gameOverRef.current) return;
      const key = e.key;
      if (key >= '1' && key <= '6') {
        e.preventDefault();
        blockNode(parseInt(key) - 1);
      }
      if (key === 'ArrowLeft') { e.preventDefault(); setSelectedNode(p => Math.max(0, p - 1)); }
      if (key === 'ArrowRight') { e.preventDefault(); setSelectedNode(p => Math.min(5, p + 1)); }
      if (key === 'ArrowUp') { e.preventDefault(); setSelectedNode(p => p >= 3 ? p - 3 : p); }
      if (key === 'ArrowDown') { e.preventDefault(); setSelectedNode(p => p < 3 ? p + 3 : p); }
      if (key === 'Enter' || key === ' ') { e.preventDefault(); blockNode(selectedNode); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [blockNode, selectedNode]);

  const nodeLabels = ['1', '2', '3', '4', '5', '6'];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Port Scan Block
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Block intrusion nodes as they light up
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono w-5 text-right" style={{ color: 'var(--color-text-muted)' }}>{timeRemaining}s</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressFraction * 100}%`,
              background: timeRemaining <= 3 ? 'var(--color-danger)' : 'var(--color-danger)',
              transition: 'width 1s linear',
            }}
          />
        </div>
        <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-success)', minWidth: 40, textAlign: 'right' }}>
          {blockedCount}/{TOTAL_EVENTS}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {nodes.map((node, idx) => (
          <button
            key={idx}
            onClick={() => blockNode(idx)}
            onTouchStart={(e) => { e.preventDefault(); blockNode(idx); }}
            className="relative flex flex-col items-center justify-center gap-1 py-4 transition-all select-none focus:outline-none"
            style={{
              borderRadius: 'var(--radius-sm)',
              border: node.active
                ? '2px solid var(--color-danger)'
                : node.blocked
                  ? '2px solid var(--color-success)'
                  : node.missed
                    ? '2px solid var(--color-warning)'
                    : selectedNode === idx
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
              background: node.active
                ? 'var(--color-danger-muted)'
                : node.blocked
                  ? 'var(--color-success-muted)'
                  : node.missed
                    ? 'var(--color-warning-muted)'
                    : 'var(--color-bg-raised)',
              boxShadow: node.active ? '0 0 12px var(--color-danger)' : 'none',
              animation: node.active ? 'port-scan-pulse 0.6s ease-in-out infinite' : 'none',
            }}
          >
            {node.blocked ? (
              <Check className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
            ) : node.active ? (
              <Wifi className="w-5 h-5" style={{ color: 'var(--color-danger)' }} />
            ) : (
              <WifiOff className="w-5 h-5" style={{ color: node.missed ? 'var(--color-warning)' : 'var(--color-text-muted)' }} />
            )}
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {nodeLabels[idx]}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        Keys 1–6 · Arrows + Enter · Tap to block
      </p>

      <style>{`
        @keyframes port-scan-pulse {
          0%, 100% { box-shadow: 0 0 8px var(--color-danger); }
          50%       { box-shadow: 0 0 20px var(--color-danger); }
        }
      `}</style>
    </div>
  );
}
