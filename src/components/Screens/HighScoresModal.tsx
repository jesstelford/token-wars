import { X, Trophy } from 'lucide-react';
import type { HighScoreEntry } from '../../types/game';
import { formatCurrencyFull } from '../../utils/formatting';

interface HighScoresModalProps {
  scores: HighScoreEntry[];
  onClose: () => void;
}

export function HighScoresModal({ scores, onClose }: HighScoresModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="shadow-2xl max-w-lg w-full mx-4 overflow-hidden max-h-[80vh] flex flex-col" style={{ background: 'var(--modal-bg)', border: 'var(--modal-border-style) var(--modal-border)', borderRadius: 'var(--modal-radius)' }}>
        <div className="flex items-center justify-between px-5 py-4 flex-none" style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>All-Time High Scores</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }} className="transition-colors hover:opacity-80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <Trophy className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No scores yet. Start playing!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ background: 'var(--color-bg-raised)', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide w-10" style={{ color: 'var(--color-text-muted)' }}>#</th>
                  <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Name</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Score</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Days</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, i) => (
                  <tr key={i} style={{ background: i < 3 ? 'var(--color-warning-muted)' : undefined, borderBottom: '1px solid var(--table-divider, var(--color-border-light))' }}>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{entry.name || 'Anon'}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ fontFamily: 'var(--font-mono)', color: entry.score >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {formatCurrencyFull(entry.score)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: 'var(--color-text-muted)' }}>{entry.days_survived}</td>
                    <td className="px-4 py-3 text-right text-xs" style={{ color: 'var(--color-text-muted)' }}>{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
