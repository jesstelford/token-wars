import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useGamepadInput } from './hooks/useGamepadInput';
import { useTheme } from './context/ThemeContext';
import {
  useTutorial,
  buildTutorialSellState,
  TUTORIAL_ASSET_ID,
  TUTORIAL_DEST_COMMUNITY,
  TUTORIAL_QUANTITY,
  TUTORIAL_BUY_PRICE,
  TUTORIAL_SELL_PRICE,
} from './hooks/useTutorial';

import { Header } from './components/Header/Header';
import { StatsPanel } from './components/Stats/StatsPanel';
import { MarketView } from './components/Market/MarketView';
import { InventoryView } from './components/Inventory/InventoryView';
import { TravelPanel } from './components/Travel/TravelPanel';
import { EventLog } from './components/EventLog/EventLog';
import { EncounterModal } from './components/Encounter/EncounterModal';
import { FinanceModal } from './components/Finance/FinanceModal';
import { BuyModal } from './components/Modals/BuyModal';
import { SellModal } from './components/Modals/SellModal';
import { TheftModal } from './components/Modals/TheftModal';
import { FreeTokenModal } from './components/Modals/FreeTokenModal';
import { ItemDropModal } from './components/Modals/ItemDropModal';
import { VendorModal } from './components/Modals/VendorModal';
import { TitleScreen } from './components/Screens/TitleScreen';
import { GameOverScreen } from './components/Screens/GameOverScreen';
import { GearLoadoutScreen } from './components/Screens/GearLoadoutScreen';
import { MiniGameArcadeScreen } from './components/Screens/MiniGameArcadeScreen';
import { GearPanel } from './components/Gear/GearPanel';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';

import type { AssetId } from './constants/assets';
import type { CommunityId } from './constants/communities';
import type { ModalType } from './types/game';
import type { GearItemId } from './constants/items';
import { fetchUnlockedGear, getPlayerId } from './lib/gearUnlocks';
import { computeGearEffects, getAllGear } from './utils/gearEffects';
import { getUnlockedMiniGames, type MiniGameId } from './lib/miniGameUnlocks';

export default function App() {
  const { themeId } = useTheme();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId | null>(null);
  const [financeTab, setFinanceTab] = useState<'debt' | 'deposit' | 'withdraw'>('debt');
  const [screenPhase, setScreenPhase] = useState<'title' | 'loadout' | 'game' | 'arcade'>('title');
  const [hoveredAssetId, setHoveredAssetId] = useState<AssetId | null>(null);
  const [unlockedGear, setUnlockedGear] = useState<GearItemId[]>([]);
  const [unlockedMiniGames, setUnlockedMiniGames] = useState<MiniGameId[]>([]);

  const {
    state,
    scores,
    hasSave,
    startNewGame,
    travel,
    dismissFreeToken,
    dismissTheft,
    collectItem,
    dismissItemDrop,
    purchaseFromVendor,
    declineVendor,
    finishGame,
    resolveEncounterRun,
    resolveEncounterFight,
    buyAsset,
    sellAsset,
    payDebt,
    deposit,
    withdraw,
    submitScore,
    clearSave,
  } = useGameState();

  const {
    tutorialStep,
    tutorialState,
    setTutorialState,
    startTutorial,
    advanceTutorial,
    completeTutorial,
    skipTutorial,
  } = useTutorial();

  const isTutorialActive = tutorialStep !== null;
  const displayState = isTutorialActive && tutorialState ? tutorialState : state;

  useKeyboardNav(screenPhase === 'game' && !isTutorialActive);
  useGamepadInput(screenPhase === 'game' && !isTutorialActive);

  useEffect(() => {
    const playerId = getPlayerId();
    fetchUnlockedGear(playerId).then(setUnlockedGear);
    setUnlockedMiniGames(getUnlockedMiniGames());
  }, []);

  useEffect(() => {
    if (screenPhase === 'title') {
      setUnlockedMiniGames(getUnlockedMiniGames());
    }
  }, [screenPhase]);

  function handleNewGame() {
    clearSave();
    if (unlockedGear.length > 0) {
      setScreenPhase('loadout');
    } else {
      startNewGame([], 0);
      setScreenPhase('game');
      setActiveModal(null);
    }
  }

  function handleTutorial() {
    startTutorial();
    setScreenPhase('game');
    setActiveModal(null);
  }

  function handleLoadoutStart(selectedGear: GearItemId[], extraDebt: number) {
    startNewGame(selectedGear, extraDebt);
    setScreenPhase('game');
    setActiveModal(null);
  }

  function handleLoadoutSkip() {
    startNewGame([], 0);
    setScreenPhase('game');
    setActiveModal(null);
  }

  function handleContinue() {
    setUnlockedMiniGames(getUnlockedMiniGames());
    setScreenPhase('game');
  }

  function handleOpenBank() {
    setFinanceTab('deposit');
    setActiveModal('finance');
  }

  function handleOpenDebt() {
    setFinanceTab('debt');
    setActiveModal('finance');
  }

  function handleTravel(communityId: CommunityId) {
    setActiveModal(null);
    if (isTutorialActive && tutorialState) {
      if (tutorialStep === 'travel' && communityId === TUTORIAL_DEST_COMMUNITY) {
        const newState = buildTutorialSellState(tutorialState);
        advanceTutorial('sell', newState);
      }
      return;
    }
    travel(communityId);
  }

  function handleTutorialBuy(assetId: AssetId, quantity: number) {
    if (!tutorialState) return;
    const price = tutorialState.market_prices[assetId]?.price ?? TUTORIAL_BUY_PRICE;
    const totalCost = price * quantity;
    const newInventory = [{ assetId, quantity, avgPurchasePrice: price }];
    const updated = {
      ...tutorialState,
      current_cash: tutorialState.current_cash - totalCost,
      inventory: newInventory,
    };
    advanceTutorial('travel', updated);
    setActiveModal(null);
  }

  function handleTutorialSell(_assetId: AssetId, quantity: number) {
    if (!tutorialState) return;
    const price = TUTORIAL_SELL_PRICE;
    const totalRevenue = price * quantity;
    const updated = {
      ...tutorialState,
      current_cash: tutorialState.current_cash + totalRevenue,
      inventory: [],
    };
    advanceTutorial('pay_debt', updated);
    setActiveModal(null);
  }

  function handleTutorialPayDebt(amount: number) {
    if (!tutorialState) return;
    const payment = Math.min(amount, tutorialState.current_debt, tutorialState.current_cash);
    if (payment <= 0) return;
    const updated = {
      ...tutorialState,
      current_cash: tutorialState.current_cash - payment,
      current_debt: Math.max(0, tutorialState.current_debt - payment),
    };
    setTutorialState(updated);
    advanceTutorial('complete', updated);
    setActiveModal(null);
  }

  function handleTutorialStartGame() {
    completeTutorial();
    clearSave();
    startNewGame([], 0);
    setScreenPhase('game');
    setActiveModal(null);
  }

  function handleTutorialSkip() {
    skipTutorial();
    setScreenPhase('title');
    setActiveModal(null);
  }

  const allGear = getAllGear(displayState);
  const gearEffects = computeGearEffects(allGear);
  const effectiveCapacity = displayState.capacity + gearEffects.capacityBonus;
  const usedCapacity = displayState.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const isGameOver = state.game_phase === 'gameover' && !isTutorialActive;

  const firstAssetId = Object.keys(displayState.market_prices)[0] as AssetId | undefined;
  const buyAssetId: AssetId = selectedAssetId ?? firstAssetId ?? 'grok';
  const buyMarketEntry = displayState.market_prices[buyAssetId];

  const pendingTheft = !isTutorialActive ? (state.pending_thefts?.[0] ?? null) : null;
  const pendingFreeToken = !isTutorialActive ? (state.pending_free_tokens?.[0] ?? null) : null;
  const pendingItemDrop = !isTutorialActive ? (state.pending_item_drop ?? null) : null;
  const pendingVendor = !isTutorialActive ? (state.pending_vendor ?? null) : null;

  const hasBlockingModal = pendingTheft || pendingFreeToken || pendingItemDrop || pendingVendor;

  const hasScanlines = ['retro', 'terminal', 'crypto', 'neon'].includes(themeId);

  const tutorialProfit = tutorialState
    ? TUTORIAL_QUANTITY * (TUTORIAL_SELL_PRICE - TUTORIAL_BUY_PRICE)
    : 0;
  const tutorialStartingDebt = 5500;

  if (screenPhase === 'loadout') {
    return (
      <GearLoadoutScreen
        unlockedGearIds={unlockedGear}
        onStart={handleLoadoutStart}
        onSkip={handleLoadoutSkip}
      />
    );
  }

  if (screenPhase === 'arcade') {
    return (
      <MiniGameArcadeScreen
        unlockedGames={unlockedMiniGames}
        onBack={() => {
          setUnlockedMiniGames(getUnlockedMiniGames());
          setScreenPhase('title');
        }}
      />
    );
  }

  if (screenPhase === 'title' && !isGameOver) {
    return (
      <TitleScreen
        scores={scores}
        hasSave={hasSave()}
        unlockedGameCount={unlockedMiniGames.length}
        onNewGame={handleNewGame}
        onContinue={handleContinue}
        onTutorial={handleTutorial}
        onArcade={() => {
          setUnlockedMiniGames(getUnlockedMiniGames());
          setScreenPhase('arcade');
        }}
      />
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen
        state={state}
        onSubmitScore={(name, updateLatest) => submitScore(name, updateLatest)}
        onNewGame={() => {
          clearSave();
          if (unlockedGear.length > 0) {
            setScreenPhase('loadout');
          } else {
            startNewGame([], 0);
            setScreenPhase('game');
            setActiveModal(null);
          }
        }}
      />
    );
  }

  const travelHighlight = isTutorialActive && tutorialStep === 'travel';
  const marketHighlight = isTutorialActive && tutorialStep === 'buy';
  const inventoryHighlight = isTutorialActive && tutorialStep === 'sell';
  const debtHighlight = isTutorialActive && tutorialStep === 'pay_debt';

  return (
    <div
      className={hasScanlines ? 'theme-scanlines' : ''}
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-root)' }}
    >
      <Header />
      <div
        className="flex flex-col flex-1 sm:overflow-hidden"
        style={{ maxWidth: '1024px', margin: '0 auto', width: '100%' }}
      >
        <div className="flex-1 flex flex-col gap-px sm:gap-2 sm:p-2 sm:min-h-0 overflow-y-auto sm:overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-px sm:gap-2 flex-none">
            <div className={`flex-1${debtHighlight ? ' tutorial-highlight-ring' : ''}`}>
              <StatsPanel
                state={displayState}
                onOpenBank={handleOpenBank}
                onOpenDebt={() => {
                  if (isTutorialActive && tutorialStep === 'pay_debt') {
                    setFinanceTab('debt');
                    setActiveModal('finance');
                  } else if (!isTutorialActive) {
                    handleOpenDebt();
                  }
                }}
              />
            </div>
            <div className={`flex-1${travelHighlight ? ' tutorial-highlight-ring' : ''}`}>
              <TravelPanel
                currentCommunity={displayState.current_community}
                currentDay={displayState.current_day}
                onTravel={handleTravel}
                onFinish={isTutorialActive ? () => {} : finishGame}
              />
            </div>
          </div>

          {!isTutorialActive && (
            <GearPanel
              equippedGear={displayState.equipped_gear ?? []}
              foundGear={displayState.found_gear ?? []}
            />
          )}

          <div className="flex flex-col sm:flex-1 sm:grid sm:grid-cols-2 gap-px sm:gap-2 sm:min-h-0">
            <div className={marketHighlight ? 'tutorial-highlight-ring' : ''}>
              <MarketView
                state={displayState}
                hoveredAssetId={hoveredAssetId}
                onHoverAsset={setHoveredAssetId}
                onBuy={(assetId) => {
                  setSelectedAssetId(assetId);
                  setActiveModal('buy');
                }}
              />
            </div>
            <div className={inventoryHighlight ? 'tutorial-highlight-ring' : ''}>
              <InventoryView
                state={displayState}
                hoveredAssetId={hoveredAssetId}
                onHoverAsset={setHoveredAssetId}
                onSell={(assetId) => {
                  setSelectedAssetId(assetId);
                  setActiveModal('sell');
                }}
                effectiveCapacity={effectiveCapacity}
              />
            </div>
          </div>
        </div>

        <EventLog events={displayState.event_log} />

        {!isTutorialActive && state.game_phase === 'encounter' && state.encounter_state && !pendingTheft && (
          <EncounterModal
            encounter={state.encounter_state}
            inventory={state.inventory}
            gearEffects={gearEffects}
            onRun={(success, precomputedInventory, lostItems) => resolveEncounterRun(success, precomputedInventory, lostItems)}
            onFight={(success, healthLost) => resolveEncounterFight(success, healthLost)}
          />
        )}

        {pendingTheft && (
          <TheftModal
            type={pendingTheft.type}
            amountLost={pendingTheft.amountLost}
            newTotal={pendingTheft.newTotal}
            onClose={(adjustedAmountLost, adjustedNewTotal) => dismissTheft(adjustedAmountLost, adjustedNewTotal)}
          />
        )}

        {pendingFreeToken && !pendingTheft && (
          <FreeTokenModal
            assetId={pendingFreeToken.assetId}
            quantity={pendingFreeToken.quantity}
            communityName={pendingFreeToken.communityName}
            onClose={dismissFreeToken}
          />
        )}

        {pendingItemDrop && !pendingTheft && !pendingFreeToken && (
          <ItemDropModal
            drop={pendingItemDrop}
            state={state}
            onCollect={collectItem}
            onDismiss={dismissItemDrop}
          />
        )}

        {pendingVendor && !pendingTheft && !pendingFreeToken && !pendingItemDrop && (
          <VendorModal
            vendor={pendingVendor}
            state={state}
            onPurchase={purchaseFromVendor}
            onDecline={declineVendor}
          />
        )}

        {activeModal === 'buy' && buyMarketEntry && !hasBlockingModal && (
          <BuyModal
            assetId={buyAssetId}
            marketEntry={buyMarketEntry}
            cash={displayState.current_cash}
            bankSavings={displayState.bank_savings}
            usedCapacity={usedCapacity}
            totalCapacity={effectiveCapacity}
            onBuy={(id, qty) => {
              if (isTutorialActive && tutorialStep === 'buy' && id === TUTORIAL_ASSET_ID) {
                handleTutorialBuy(id, qty);
              } else if (!isTutorialActive) {
                buyAsset(id, qty);
                setActiveModal(null);
              }
            }}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'sell' && selectedAssetId && !hasBlockingModal && (() => {
          const invItem = displayState.inventory.find(i => i.assetId === selectedAssetId);
          const mp = displayState.market_prices[selectedAssetId];
          if (!invItem || !mp) return null;
          return (
            <SellModal
              assetId={selectedAssetId}
              marketEntry={mp}
              inventoryItem={invItem}
              onSell={(id, qty) => {
                if (isTutorialActive && tutorialStep === 'sell' && id === TUTORIAL_ASSET_ID) {
                  handleTutorialSell(id, qty);
                } else if (!isTutorialActive) {
                  sellAsset(id, qty);
                  setActiveModal(null);
                }
              }}
              onClose={() => setActiveModal(null)}
            />
          );
        })()}

        {activeModal === 'finance' && !hasBlockingModal && (
          <FinanceModal
            cash={displayState.current_cash}
            bankSavings={displayState.bank_savings}
            debt={displayState.current_debt}
            initialTab={financeTab}
            onClose={() => setActiveModal(null)}
            onPayDebt={amount => {
              if (isTutorialActive && tutorialStep === 'pay_debt') {
                handleTutorialPayDebt(amount);
              } else if (!isTutorialActive) {
                payDebt(amount);
                setActiveModal(null);
              }
            }}
            onDeposit={amount => { if (!isTutorialActive) deposit(amount); }}
            onWithdraw={amount => { if (!isTutorialActive) withdraw(amount); }}
          />
        )}

        {isTutorialActive && tutorialStep && (
          <TutorialOverlay
            step={tutorialStep}
            startingDebt={tutorialStartingDebt}
            currentDebt={tutorialState?.current_debt ?? tutorialStartingDebt}
            profit={tutorialProfit}
            onStartGame={handleTutorialStartGame}
            onSkip={handleTutorialSkip}
          />
        )}
      </div>
    </div>
  );
}
