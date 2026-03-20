import { ArrowRight, X, ShoppingCart, MapPin, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';
import type { TutorialStep } from '../../types/game';
import { formatCurrencyFull } from '../../utils/formatting';
import {
  TUTORIAL_QUANTITY,
  TUTORIAL_BUY_PRICE,
  TUTORIAL_SELL_PRICE,
} from '../../hooks/useTutorial';

interface TutorialStepConfig {
  icon: React.ReactNode;
  title: string;
  instruction: string;
  highlight: string;
}

const STEP_CONFIGS: Record<Exclude<TutorialStep, 'complete'>, TutorialStepConfig> = {
  buy: {
    icon: <ShoppingCart className="w-5 h-5" />,
    title: 'Step 1 of 4 — Buy',
    instruction: `Buy ${TUTORIAL_QUANTITY} Grok tokens at ${formatCurrencyFull(TUTORIAL_BUY_PRICE)} each`,
    highlight: 'market',
  },
  travel: {
    icon: <MapPin className="w-5 h-5" />,
    title: 'Step 2 of 4 — Travel',
    instruction: 'Travel to Reddit to sell for a higher price',
    highlight: 'travel',
  },
  sell: {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Step 3 of 4 — Sell',
    instruction: `Sell your Grok tokens at ${formatCurrencyFull(TUTORIAL_SELL_PRICE)} each`,
    highlight: 'inventory',
  },
  pay_debt: {
    icon: <CreditCard className="w-5 h-5" />,
    title: 'Step 4 of 4 — Pay Debt',
    instruction: 'Click Debt to open the finance panel and pay it down',
    highlight: 'debt',
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
          border: 'var(--modal-border-style) var(--color-accent)',
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
            style={{ background: 'var(--color-accent)', opacity: 0.95 }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-inverse)', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
              Buy low. Travel. Sell high. Pay debt. Repeat.
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

  const positionClass =
    step === 'buy' || step === 'sell'
      ? 'bottom-[calc(50%+2rem)] left-1/2 -translate-x-1/2'
      : step === 'travel'
      ? 'top-[calc(50%+2rem)] right-4'
      : 'top-[8.5rem] left-4';

  return (
    <div
      className={`fixed z-[101] ${positionClass} pointer-events-auto`}
      style={{ animation: 'tutorialSlideUp 0.25s ease-out' }}
    >
      <div
        className="shadow-2xl w-72"
        style={{
          background: 'var(--modal-bg)',
          border: '2px solid var(--color-accent)',
          borderRadius: 'var(--modal-radius)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
            {config.icon}
            <span className="text-xs font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
              {config.title}
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-xs hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm leading-snug" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
            {config.instruction}
          </p>
          <div className="flex items-center gap-1 mt-2" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>
            <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-xs" style={{ fontFamily: 'var(--font-body)' }}>Click the highlighted element below</span>
          </div>
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
        className="fixed inset-0 z-[99] pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.45)' }}
      />
      <TutorialCallout step={step} onSkip={onSkip} />
    </>
  );
}
