import { useState } from 'react';
import { Trophy, Play, RotateCcw, TrendingUp, Sun, Moon } from 'lucide-react';
import type { HighScoreEntry } from '../../types/game';
import { HighScoresModal } from './HighScoresModal';
import { formatCurrencyFull } from '../../utils/formatting';

interface TitleScreenProps {
  scores: HighScoreEntry[];
  hasSave: boolean;
  darkMode: boolean;
  onToggleDark: () => void;
  onNewGame: () => void;
  onContinue: () => void;
}

export function TitleScreen({ scores, hasSave, darkMode, onToggleDark, onNewGame, onContinue }: TitleScreenProps) {
  const [showAllScores, setShowAllScores] = useState(false);
  const top5 = scores.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <button
        onClick={onToggleDark}
        className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <TrendingUp className="w-10 h-10 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            TOKEN<span className="text-sky-600 dark:text-sky-400">WARS</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            A high-fidelity AI token arbitrage simulation. 31 days. 9 assets. 6 communities. Can you outrun your debt?
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {hasSave && (
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              <Play className="w-5 h-5" />
              Continue
            </button>
          )}
          <button
            onClick={onNewGame}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${
              hasSave
                ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-400'
                : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {hasSave ? 'New Game' : 'Start Game'}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Top Scores</span>
            </div>
            {scores.length > 0 && (
              <button
                onClick={() => setShowAllScores(true)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                View All
              </button>
            )}
          </div>

          {top5.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-600">
              <Trophy className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No scores yet</p>
              <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">Complete a run to appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {top5.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-sm w-6 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="font-mono text-slate-400">{i + 1}</span>}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{entry.name || 'Anon'}</span>
                  <span className={`font-mono font-bold text-sm ${entry.score >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrencyFull(entry.score)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{entry.days_survived}d</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          All data stored locally. No accounts. No servers.
        </p>
      </div>

      {showAllScores && (
        <HighScoresModal scores={scores} onClose={() => setShowAllScores(false)} />
      )}
    </div>
  );
}
