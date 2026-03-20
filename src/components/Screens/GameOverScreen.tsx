import { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Pencil, Check } from 'lucide-react';
import type { GameState } from '../../types/game';
import { calculateScore, getScoreTier } from '../../utils/scoring';
import { formatCurrencyFull } from '../../utils/formatting';
import { Confetti } from './Confetti';
import { GEAR_MAP, RARITY_COLORS } from '../../constants/items';
import type { GearItemId } from '../../constants/items';
import { getAllGear } from '../../utils/gearEffects';
import { GearIcon } from '../Gear/GearIcon';
import { GearTooltip } from '../Gear/GearTooltip';
import { Header } from '../Header/Header';

interface GameOverScreenProps {
  state: GameState;
  onSubmitScore: (name: string, updateLatest?: boolean) => void;
  onNewGame: () => void;
}

export function GameOverScreen({ state, onSubmitScore, onNewGame }: GameOverScreenProps) {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [gearTooltip, setGearTooltip] = useState<{ id: GearItemId; rect: DOMRect } | null>(null);
  const submitted = useRef(false);

  const score = calculateScore(state);
  const tier = getScoreTier(score);
  const allGear = getAllGear(state);

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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg-root)' }}
    >
      <Header />
      {isWin && <Confetti />}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6">
        <div className="relative z-20 w-full max-w-md" style={!isWin ? { filter: 'grayscale(30%) brightness(0.9)' } : undefined}>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">
              {score >= 100000 ? '🏆' : score >= 0 ? '📊' : '💸'}
            </div>
            <h1
              className="text-3xl font-black mb-1"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-heading)' }}
            >
              Simulation Complete
            </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              Day {state.current_day} / 31 — {state.health <= 0 ? 'Vibes depleted' : 'Time expired'}
            </p>
          </div>

          <div
            className="overflow-hidden shadow-sm mb-5"
            style={{
              background: 'var(--color-bg-surface)',
              border: 'var(--modal-border-style)',
              borderRadius: 'var(--modal-radius)',
            }}
          >
            <div
              className="px-5 py-4 text-center"
              style={{
                background: isWin ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div
                className="text-4xl font-black mb-1"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: isWin ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {formatCurrencyFull(score)}
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{tier.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>{tier.description}</div>
            </div>

            <div className="px-5 py-4 space-y-2.5 text-sm">
              {[
                { label: 'Cash on hand', value: formatCurrencyFull(state.current_cash), color: 'var(--color-text-primary)' },
                { label: 'Bank savings', value: formatCurrencyFull(state.bank_savings), color: 'var(--color-bank)' },
                { label: 'Inventory value', value: formatCurrencyFull(inventoryValue), color: 'var(--color-text-secondary)' },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
              <div
                className="flex justify-between pt-2"
                style={{ borderTop: '1px solid var(--color-border-light)' }}
              >
                <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                  Unpaid debt <span style={{ color: 'var(--color-danger)' }}>(×2 penalty)</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-danger)' }}>
                  -{formatCurrencyFull(state.current_debt * 2)}
                </span>
              </div>
              <div
                className="flex justify-between pt-2"
                style={{ borderTop: '1px solid var(--color-border-light)' }}
              >
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>Final Score</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '1rem',
                    color: isWin ? 'var(--color-success)' : 'var(--color-danger)',
                  }}
                >
                  {formatCurrencyFull(score)}
                </span>
              </div>
            </div>
          </div>

          {allGear.length > 0 && (
            <div
              className="px-5 py-4 mb-5 shadow-sm"
              style={{
                background: 'var(--color-bg-surface)',
                border: 'var(--modal-border-style)',
                borderRadius: 'var(--modal-radius)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>Gear Collected</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{allGear.length} / 3</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allGear.map(id => {
                  const item = GEAR_MAP[id];
                  if (!item) return null;
                  const colors = RARITY_COLORS[item.rarity];
                  const isEquipped = state.equipped_gear?.includes(id);
                  return (
                    <div
                      key={id}
                      className={`flex items-center gap-2 px-2.5 py-1.5 border ${colors.border} ${colors.bg} cursor-default`}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      onMouseEnter={e => setGearTooltip({ id, rect: e.currentTarget.getBoundingClientRect() })}
                      onMouseLeave={() => setGearTooltip(null)}
                    >
                      <GearIcon name={item.icon} className={`w-3 h-3 ${colors.text}`} />
                      <span className={`text-xs font-semibold ${colors.text}`}>{item.name}</span>
                      {isEquipped && <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>start</span>}
                    </div>
                  );
                })}
              </div>
              {gearTooltip && (() => {
                const item = GEAR_MAP[gearTooltip.id];
                if (!item) return null;
                const isEquipped = state.equipped_gear?.includes(gearTooltip.id) ?? false;
                return <GearTooltip item={item} isEquipped={isEquipped} anchorRect={gearTooltip.rect} />;
              })()}
            </div>
          )}

          <div
            className="px-5 py-4 mb-5 shadow-sm"
            style={{
              background: 'var(--color-bg-surface)',
              border: 'var(--modal-border-style)',
              borderRadius: 'var(--modal-radius)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>Score Saved</span>
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
                  className="flex-1 px-3 py-2 text-sm"
                  style={{
                    background: 'var(--color-bg-input)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  onClick={handleNameConfirm}
                  className="theme-btn-primary px-4 py-2 text-sm flex items-center gap-1"
                  style={{ background: 'var(--color-warning)', color: '#000', borderColor: 'var(--color-warning)' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                  Saved as <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{name.trim() || 'Anon'}</span>
                </span>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs font-semibold hover:underline"
                  style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
                >
                  <Pencil className="w-3 h-3" />
                  Edit name
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onNewGame}
            className="theme-btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
