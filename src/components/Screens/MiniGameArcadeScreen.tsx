import { useState } from 'react';
import { ArrowLeft, RefreshCw, Gamepad2, ChevronRight } from 'lucide-react';
import { Header } from '../Header/Header';
import { SignalScramble } from '../MiniGames/SignalScramble';
import { VoltageSurge } from '../MiniGames/VoltageSurge';
import { CounterHackTimer } from '../MiniGames/CounterHackTimer';
import { PortScanBlock } from '../MiniGames/PortScanBlock';
import { DecoyProtocol } from '../MiniGames/DecoyProtocol';

interface MiniGameDef {
  id: string;
  name: string;
  description: string;
  context: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const MINI_GAMES: MiniGameDef[] = [
  {
    id: 'signal_scramble',
    name: 'Signal Scramble',
    description: 'Lock in the timing bar within the green zone to escape regulators.',
    context: 'Used when running from an encounter',
    difficulty: 'Easy',
  },
  {
    id: 'voltage_surge',
    name: 'Voltage Surge',
    description: 'Distribute 5 points between Evade and Counter to shape your fight odds.',
    context: 'Used when fighting an encounter',
    difficulty: 'Medium',
  },
  {
    id: 'port_scan',
    name: 'Port Scan Block',
    description: 'Block intrusion nodes as they light up to limit robbery losses.',
    context: 'Used during a robbery',
    difficulty: 'Hard',
  },
  {
    id: 'counter_hack',
    name: 'Counter-Hack Timer',
    description: 'Hold and release the button in the amber zone to counter a bank hack.',
    context: 'Used during a bank hack',
    difficulty: 'Medium',
  },
  {
    id: 'decoy',
    name: 'Decoy Protocol',
    description: 'Track the real wallet through the shuffle to protect your savings.',
    context: 'Used during a bank hack',
    difficulty: 'Easy',
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'var(--color-success)',
  Medium: 'var(--color-warning)',
  Hard: 'var(--color-danger)',
};

const DIFFICULTY_MUTED: Record<string, string> = {
  Easy: 'var(--color-success-muted)',
  Medium: 'var(--color-warning-muted)',
  Hard: 'var(--color-danger-muted)',
};

type Phase = 'menu' | 'playing' | 'result';

interface ResultEntry {
  label: string;
  outcomeLabel: string;
  isGood: boolean;
}

function scoreSignalScramble(perf: number): ResultEntry {
  let label: string;
  let isGood: boolean;
  if (perf >= 1.0) { label = 'Perfect'; isGood = true; }
  else if (perf >= 0.65) { label = 'Good'; isGood = true; }
  else if (perf >= 0.30) { label = 'Edge'; isGood = false; }
  else { label = 'Miss'; isGood = false; }
  const escapeChance = perf === 0 ? 25 : Math.round(Math.min(95, (0.60 + perf * 0.35) * 100));
  return { label, outcomeLabel: `${escapeChance}% escape chance`, isGood };
}

function scoreVoltage(evade: number, counter: number): ResultEntry {
  const winChance = Math.round(Math.min(75, (0.30 + (counter / 5) * 0.45) * 100));
  const dmgReduction = Math.round((evade / 5) * 60);
  return {
    label: `Evade ${evade} / Counter ${counter}`,
    outcomeLabel: `${winChance}% win · ${dmgReduction}% dmg reduction`,
    isGood: winChance >= 50,
  };
}

function scoreTheft(mult: number): ResultEntry {
  const pct = Math.round((1 - mult) * 100);
  return {
    label: pct === 100 ? 'Fully Blocked' : pct === 0 ? 'Failed' : `${pct}% Blocked`,
    outcomeLabel: pct === 100 ? 'No funds lost' : pct === 0 ? 'Full exposure' : `${pct}% of funds protected`,
    isGood: pct >= 50,
  };
}

interface MiniGameArcadeScreenProps {
  onBack: () => void;
}

export function MiniGameArcadeScreen({ onBack }: MiniGameArcadeScreenProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('menu');
  const [result, setResult] = useState<ResultEntry | null>(null);
  const [playKey, setPlayKey] = useState(0);

  const gameDef = MINI_GAMES.find(g => g.id === selectedGame);

  function startGame(id: string) {
    setSelectedGame(id);
    setPhase('playing');
    setResult(null);
    setPlayKey(k => k + 1);
  }

  function handleReplay() {
    setPhase('playing');
    setResult(null);
    setPlayKey(k => k + 1);
  }

  function handleBack() {
    setPhase('menu');
    setSelectedGame(null);
    setResult(null);
  }

  function renderGame() {
    if (!selectedGame) return null;
    switch (selectedGame) {
      case 'signal_scramble':
        return (
          <SignalScramble
            key={playKey}
            onComplete={(perf) => { setResult(scoreSignalScramble(perf)); setPhase('result'); }}
          />
        );
      case 'voltage_surge':
        return (
          <VoltageSurge
            key={playKey}
            onComplete={(evade, counter) => { setResult(scoreVoltage(evade, counter)); setPhase('result'); }}
          />
        );
      case 'port_scan':
        return (
          <PortScanBlock
            key={playKey}
            onComplete={(mult) => { setResult(scoreTheft(mult)); setPhase('result'); }}
          />
        );
      case 'counter_hack':
        return (
          <CounterHackTimer
            key={playKey}
            onComplete={(mult) => { setResult(scoreTheft(mult)); setPhase('result'); }}
          />
        );
      case 'decoy':
        return (
          <DecoyProtocol
            key={playKey}
            onComplete={(mult) => { setResult(scoreTheft(mult)); setPhase('result'); }}
          />
        );
    }
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-root)' }}>
      <Header />

      <div className="flex-1 flex flex-col items-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={phase === 'menu' ? onBack : handleBack}
              className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70 focus:outline-none focus:ring-2"
              style={{ color: 'var(--color-accent)', borderRadius: 'var(--radius-sm)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              {phase === 'menu' ? 'Main Menu' : 'Back to Arcade'}
            </button>
          </div>

          {phase === 'menu' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Gamepad2 className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                <div>
                  <h1 className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-heading)', letterSpacing: '-0.01em' }}>
                    Mini-Game Arcade
                  </h1>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Practice the mini-games from Token Wars
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {MINI_GAMES.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => startGame(game.id)}
                    className="w-full text-left p-4 flex items-start gap-4 transition-all hover:opacity-90 focus:outline-none focus:ring-2 group"
                    style={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
                          {game.name}
                        </span>
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{
                            color: DIFFICULTY_COLORS[game.difficulty],
                            background: DIFFICULTY_MUTED[game.difficulty],
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {game.difficulty}
                        </span>
                      </div>
                      <p className="text-xs leading-snug mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {game.description}
                      </p>
                      <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                        {game.context}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                ))}
              </div>
            </>
          )}

          {(phase === 'playing' || phase === 'result') && gameDef && (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-heading)' }}>
                    {gameDef.name}
                  </h2>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      color: DIFFICULTY_COLORS[gameDef.difficulty],
                      background: DIFFICULTY_MUTED[gameDef.difficulty],
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {gameDef.difficulty}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  {gameDef.context}
                </p>
              </div>

              <div
                className="p-5"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {phase === 'playing' && renderGame()}

                {phase === 'result' && result && (
                  <div className="flex flex-col gap-4">
                    <div
                      className="p-4 flex flex-col items-center text-center gap-2"
                      style={{
                        background: result.isGood ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
                        border: `1px solid ${result.isGood ? 'var(--color-success)' : 'var(--color-danger)'}`,
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <span className="text-2xl font-black" style={{ color: result.isGood ? 'var(--color-success)' : 'var(--color-danger)', fontFamily: 'var(--font-heading)' }}>
                        {result.label}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: result.isGood ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
                        {result.outcomeLabel}
                      </span>
                    </div>

                    <button
                      onClick={handleReplay}
                      className="w-full py-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 theme-btn-primary"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Play Again
                    </button>

                    <button
                      onClick={handleBack}
                      className="w-full py-2.5 font-bold text-sm transition-colors focus:outline-none focus:ring-2 theme-btn-secondary"
                    >
                      Choose Another Game
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
