import { useState } from 'react';
import { Trophy, Play, RotateCcw, TrendingUp, BookOpen } from 'lucide-react';
import type { HighScoreEntry } from '../../types/game';
import { HighScoresModal } from './HighScoresModal';
import { formatCurrencyFull } from '../../utils/formatting';
import { Header } from '../Header/Header';
import { hasTutorialBeenSeen } from '../../hooks/useTutorial';

interface TitleScreenProps {
  scores: HighScoreEntry[];
  hasSave: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onTutorial: () => void;
}

export function TitleScreen({ scores, hasSave, onNewGame, onContinue, onTutorial }: TitleScreenProps) {
  const [showAllScores, setShowAllScores] = useState(false);
  const top5 = scores.slice(0, 5);
  const tutorialSeen = hasTutorialBeenSeen();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg-root)' }}
    >
      <Header />
      <div
        className="flex-1 flex flex-col items-center justify-center p-6"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TrendingUp className="w-10 h-10" style={{ color: 'var(--color-accent)' }} />
            </div>
            <h1
              className="text-5xl font-black mb-2"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text-heading)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              TOKEN<span style={{ color: 'var(--logo-accent)' }}>WARS</span>
            </h1>
            <p
              className="text-sm leading-relaxed max-w-xs mx-auto"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              A high-fidelity AI token arbitrage simulation. 31 days. 9 assets. 6 communities. Can you outrun your debt?
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {hasSave && (
              <button
                onClick={onContinue}
                className="theme-btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
              >
                <Play className="w-5 h-5" />
                Continue
              </button>
            )}
            <button
              onClick={onNewGame}
              className={hasSave ? 'theme-btn-secondary w-full flex items-center justify-center gap-2 py-3.5 text-base' : 'theme-btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base'}
            >
              <RotateCcw className="w-4 h-4" />
              {hasSave ? 'New Game' : 'Start Game'}
            </button>
            <button
              onClick={onTutorial}
              className={`theme-btn-secondary w-full flex items-center justify-center gap-2 py-3 text-sm${!tutorialSeen ? ' tutorial-pulse-btn' : ''}`}
            >
              <BookOpen className="w-4 h-4" />
              {tutorialSeen ? 'Replay Tutorial' : 'How to Play — Tutorial'}
            </button>
          </div>

          <div
            className="overflow-hidden shadow-sm"
            style={{
              background: 'var(--color-bg-surface)',
              border: 'var(--modal-border-style)',
              borderRadius: 'var(--modal-radius)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'var(--panel-header-bg)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--panel-header-text)', fontFamily: 'var(--font-heading)' }}
                >
                  Top Scores
                </span>
              </div>
              {scores.length > 0 && (
                <button
                  onClick={() => setShowAllScores(true)}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
                >
                  View All
                </button>
              )}
            </div>

            {top5.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Trophy className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm" style={{ fontFamily: 'var(--font-body)' }}>No scores yet</p>
                <p className="text-xs mt-1 opacity-60" style={{ fontFamily: 'var(--font-body)' }}>Complete a run to appear here</p>
              </div>
            ) : (
              <div style={{ borderTop: 'none' }}>
                {top5.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{ borderBottom: `1px solid var(--color-border-light)` }}
                  >
                    <span className="text-sm w-6 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{i + 1}</span>
                      )}
                    </span>
                    <span
                      className="flex-1 text-sm font-semibold truncate"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
                    >
                      {entry.name || 'Anon'}
                    </span>
                    <span
                      className="font-bold text-sm"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: entry.score >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      }}
                    >
                      {formatCurrencyFull(entry.score)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                    >
                      {entry.days_survived}d
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            All data stored locally. No accounts. No servers.
          </p>
        </div>

        {showAllScores && (
          <HighScoresModal scores={scores} onClose={() => setShowAllScores(false)} />
        )}
      </div>
    </div>
  );
}
