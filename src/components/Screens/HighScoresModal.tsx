import { X, Trophy } from 'lucide-react';
import type { HighScoreEntry } from '../../types/game';
import { formatCurrencyFull } from '../../utils/formatting';

interface HighScoresModalProps {
  scores: HighScoreEntry[];
  onClose: () => void;
}

export function HighScoresModal({ scores, onClose }: HighScoresModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-none">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">All-Time High Scores</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Trophy className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No scores yet. Start playing!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500 w-10">#</th>
                  <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Name</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Score</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Days</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scores.map((entry, i) => (
                  <tr key={i} className={i < 3 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{entry.name}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${entry.score >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrencyFull(entry.score)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{entry.days_survived}</td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">{entry.date}</td>
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
