import { useEffect, useRef } from 'react';
import { Clock, Play, X } from 'lucide-react';

export interface MiniGameInfo {
  name: string;
  description: string;
  objective: string;
  timeLimitSeconds: number;
  timedNote?: string;
  urgencyLabel?: string;
}

interface MiniGameConfirmDialogProps {
  game: MiniGameInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MiniGameConfirmDialog({ game, onConfirm, onCancel }: MiniGameConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="minigame-confirm-title"
      aria-describedby="minigame-confirm-desc"
      className="flex flex-col gap-0"
    >
      <div
        className="px-5 pt-5 pb-4 flex flex-col gap-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            {game.urgencyLabel && (
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--color-danger)' }}
              >
                {game.urgencyLabel}
              </span>
            )}
            <h3
              id="minigame-confirm-title"
              className="text-base font-black leading-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-heading)', letterSpacing: '-0.01em' }}
            >
              {game.name}
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="p-1 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 shrink-0"
            style={{ color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p
          id="minigame-confirm-desc"
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {game.description}
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {game.objective}
        </p>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        <div
          className="flex items-center gap-2.5 px-3 py-2.5"
          style={{
            background: 'var(--color-warning-muted)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-sm)',
          }}
          role="note"
          aria-label="Time limit"
        >
          <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--color-warning)' }} />
          <div className="flex flex-col gap-0.5">
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}
            >
              Time Limit: {game.timeLimitSeconds} seconds
            </span>
            {game.timedNote && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {game.timedNote}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-bold transition-colors focus:outline-none focus:ring-2 theme-btn-secondary"
            aria-label="Cancel and go back"
          >
            Go Back
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 theme-btn-primary"
            aria-label={`Start ${game.name}`}
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
