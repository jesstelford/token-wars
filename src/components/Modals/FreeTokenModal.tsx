import { Gift, X } from 'lucide-react';
import { ASSET_MAP } from '../../constants/assets';
import type { AssetId } from '../../constants/assets';

interface FreeTokenModalProps {
  assetId: AssetId;
  quantity: number;
  communityName: string;
  onClose: () => void;
}

export function FreeTokenModal({ assetId, quantity, communityName, onClose }: FreeTokenModalProps) {
  const asset = ASSET_MAP[assetId];

  const tierLabels: Record<number, string> = {
    1: 'Tier 1 — Premium',
    2: 'Tier 2 — Standard',
    3: 'Tier 3 — Common',
    4: 'Tier 4 — Basic',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--modal-backdrop)' }}>
      <div className="shadow-2xl max-w-sm w-full mx-4 overflow-hidden" style={{ background: 'var(--modal-bg)', border: 'var(--modal-border-style) var(--modal-border)', borderRadius: 'var(--modal-radius)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--modal-header-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Free Tokens Received</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }} className="transition-colors hover:opacity-80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex flex-col items-center gap-3 py-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--color-success-muted)' }}>
              <Gift className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
                +{quantity}
              </div>
              <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {asset?.name}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {tierLabels[asset?.tier ?? 4]}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2 text-sm" style={{ background: 'var(--color-bg-raised)', borderRadius: 'var(--radius-sm)' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Source</span>
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{communityName}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Market value each</span>
              <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>—</span>
            </div>
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--color-border-light)' }}>
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Added to inventory</span>
              <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>+{quantity} units</span>
            </div>
          </div>

          <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            These tokens were acquired at no cost. They'll show a $0 average purchase price in your inventory.
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 font-bold text-sm transition-colors"
            style={{ background: 'var(--color-success)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-sm)' }}
          >
            Collect Tokens
          </button>
        </div>
      </div>
    </div>
  );
}
