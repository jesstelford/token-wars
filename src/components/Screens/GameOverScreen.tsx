import { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Pencil, Check } from 'lucide-react';
import type { GameState } from '../../types/game';
import { calculateScore } from '../../utils/scoring';
import { getScoreTier } from '../../utils/scoring';
import { formatCurrencyFull } from '../../utils/formatting';
import { Confetti } from './Confetti';

interface GameOverScreenProps {
  state: GameState;
  onSubmitScore: (name: string, updateLatest?: boolean) => void;
  onNewGame: () => void;
}

export function GameOverScreen({ state, onSubmitScore, onNewGame }: GameOverScreenProps) {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const submitted = useRef(false);

  const score = calculateScore(state);
  const tier = getScoreTier(score);

  useEffect(() => {
    if (!submitted.current) {
      submitted.current = true;
      onSubmitScore('');
    }
  }, []);

  function handleNameConfirm() {
    onSubmitScore(name.trim(), true);
    setEditing(false);
  }

  const inventoryValue = state.inventory.reduce((sum, item) => {
    const mp = state.market_prices[item.assetId];
    return sum + (mp ? mp.price * item.quantity : 0);
  }, 0);

  const isWin = score >= 0;

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center p-6 ${isWin ? 'bg-slate-50 dark:bg-slate-950' : 'bg-slate-200 dark:bg-slate-950'}`}>
      {isWin && <Confetti />}
      {!isWin && (
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ backdropFilter: 'grayscale(85%) brightness(0.75) contrast(0.9)' }} />
      )}
      <div className="relative z-20 w-full max-w-md" style={!isWin ? { filter: 'grayscale(60%) contrast(0.85) brightness(0.9)' } : undefined}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">
            {score >= 100000 ? '🏆' : score >= 0 ? '📊' : '💸'}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
            Simulation Complete
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Day {state.current_day} / 31 — {state.health <= 0 ? 'Health depleted' : 'Time expired'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm mb-5">
          <div className={`px-5 py-4 text-center border-b border-slate-200 dark:border-slate-700 ${
            score >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className={`text-4xl font-black font-mono mb-1 ${score >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrencyFull(score)}
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">{tier.label}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{tier.description}</div>
          </div>

          <div className="px-5 py-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Cash on hand</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatCurrencyFull(state.current_cash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Bank savings</span>
              <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{formatCurrencyFull(state.bank_savings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Inventory value</span>
              <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">{formatCurrencyFull(inventoryValue)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-slate-500 dark:text-slate-400">Unpaid debt <span className="text-red-500">(×2 penalty)</span></span>
              <span className="font-mono font-semibold text-red-600 dark:text-red-400">-{formatCurrencyFull(state.current_debt * 2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Final Score</span>
              <span className={`font-mono font-black text-base ${score >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrencyFull(score)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Score Saved</span>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleNameConfirm(); if (e.key === 'Escape') setEditing(false); }}
                placeholder="Enter your name (optional)"
                maxLength={24}
                autoFocus
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={handleNameConfirm}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Saved as <span className="font-semibold text-slate-800 dark:text-slate-100">{name.trim() || 'Anon'}</span>
              </span>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                <Pencil className="w-3 h-3" />
                Edit name
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onNewGame}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          <RotateCcw className="w-4 h-4" />
          Play Again
        </button>
      </div>
    </div>
  );
}
