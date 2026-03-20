import { ArrowRight, X, ShoppingCart, MapPin, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';
import type { TutorialStep } from '../../types/game';
import { formatCurrencyFull } from '../../utils/formatting';
import {
  TUTORIAL_BUY_PRICE,
  TUTORIAL_SELL_PRICE,
} from '../../hooks/useTutorial';

interface TutorialStepConfig {
  icon: React.ReactNode;
  title: string;
  instruction: string;
  subInstruction: string;
}

const STEP_CONFIGS: Record<Exclude<TutorialStep, 'complete'>, TutorialStepConfig> = {
  buy: {
    icon: <ShoppingCart className="w-4 h-4" />,
    title: 'Step 1 of 4 — Buy Low',
    instruction: `Buy Grok tokens at ${formatCurrencyFull(TUTORIAL_BUY_PRICE)} each`,
    subInstruction: 'Click the Buy button in the Market panel below',
  },
  travel: {
    icon: <MapPin className="w-4 h-4" />,
    title: 'Step 2 of 4 — Travel',
    instruction: 'Travel to Reddit',
    subInstruction: 'Click Reddit in the Travel panel to move there',
  },
  sell: {
    icon: <TrendingUp className="w-4 h-4" />,
    title: 'Step 3 of 4 — Sell High',
    instruction: `Sell Grok at ${formatCurrencyFull(TUTORIAL_SELL_PRICE)} each`,
    subInstruction: 'Click Sell in the Inventory panel below',
  },
  pay_debt: {
    icon: <CreditCard className="w-4 h-4" />,
    title: 'Step 4 of 4 — Pay Debt',
    instruction: 'Pay down some debt',
    subInstruction: 'Click the Debt button in the Stats panel above',
  },
};

interface TutorialCompleteProps {
  startingDebt: number;
  currentDebt: number;
  profit: number;
  onStartGame: () => void;
  onSkip: () => void;
}

function TutorialComplete({ startingDebt, currentDebt, profit, onStartGame, onSkip }: TutorialCompleteProps) {
  const debtReduced = startingDebt - currentDebt;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.82)' }}
    >
      <div
        className="max-w-sm w-full mx-4 overflow-hidden shadow-2xl"
        style={{
          background: 'var(--modal-bg)',
          border: '2px solid var(--color-accent)',
          borderRadius: 'var(--modal-radius)',
          animation: 'tutorialSlideUp 0.35s ease-out',
        }}
      >
        <div
          className="flex flex-col items-center px-6 py-5 gap-1"
          style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}
        >
          <CheckCircle className="w-8 h-8 mb-1" style={{ color: 'var(--color-success)' }} />
          <h2 className="text-xl font-black" style={{ color: 'var(--color-text-heading)', fontFamily: 'var(--font-heading)' }}>
            You've got it!
          </h2>
          <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            That's the entire game loop.
          </p>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div
            className="rounded-lg p-4 space-y-2"
            style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border-light)' }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Profit earned</span>
              <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
                +{formatCurrencyFull(profit)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Debt reduced</span>
              <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>
                -{formatCurrencyFull(debtReduced)}
              </span>
            </div>
            <div
              className="pt-2 mt-1"
              style={{ borderTop: '1px solid var(--color-border-light)' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Debt remaining</span>
                <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                  {formatCurrencyFull(currentDebt)}
                </span>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg px-4 py-3 text-center"
            style={{
              background: 'var(--color-bg-raised)',
              border: '1px solid var(--color-border)',
              borderLeft: '3px solid var(--color-accent)',
            }}
          >
            <p
              className="text-sm font-semibold italic"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              "Buy low. Travel. Sell high. Pay debt. Repeat."
            </p>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            You have 31 days before debt crushes you. Good luck.
          </p>

          <button
            onClick={onStartGame}
            className="theme-btn-primary w-full flex items-center justify-center gap-2 py-3 font-bold"
          >
            <ArrowRight className="w-4 h-4" />
            Start Playing
          </button>

          <button
            onClick={onSkip}
            className="w-full text-sm py-1"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Back to main menu
          </button>
        </div>
      </div>
    </div>
  );
}

interface TutorialCalloutProps {
  step: Exclude<TutorialStep, 'complete'>;
  onSkip: () => void;
}

function TutorialCallout({ step, onSkip }: TutorialCalloutProps) {
  const config = STEP_CONFIGS[step];

  const positionStyles: React.CSSProperties =
    step === 'buy' || step === 'sell'
      ? { top: '4.5rem', left: '50%', transform: 'translateX(-50%)' }
      : { bottom: '5rem', left: '50%', transform: 'translateX(-50%)' };

  return (
    <div
      className="fixed z-[51] pointer-events-auto"
      style={{ ...positionStyles, animation: 'tutorialSlideUp 0.25s ease-out' }}
    >
      <div
        className="shadow-2xl w-64"
        style={{
          background: 'var(--modal-bg)',
          border: '2px solid var(--color-accent)',
          borderRadius: 'var(--modal-radius)',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
            {config.icon}
            <span className="text-xs font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
              {config.title}
            </span>
          </div>
          <button
            onClick={onSkip}
            className="hover:opacity-70 transition-opacity ml-1"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Skip tutorial"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-3 py-2.5 space-y-1.5">
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
            {config.instruction}
          </p>
          <p className="text-xs leading-snug flex items-start gap-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
            {config.subInstruction}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TutorialOverlayProps {
  step: TutorialStep;
  startingDebt: number;
  currentDebt: number;
  profit: number;
  onStartGame: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ step, startingDebt, currentDebt, profit, onStartGame, onSkip }: TutorialOverlayProps) {
  if (step === 'complete') {
    return (
      <TutorialComplete
        startingDebt={startingDebt}
        currentDebt={currentDebt}
        profit={profit}
        onStartGame={onStartGame}
        onSkip={onSkip}
      />
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.45)', zIndex: 48 }}
      />
      <TutorialCallout step={step} onSkip={onSkip} />
    </>
  );
}
