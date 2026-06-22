import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/useGameStore';
import { useWallet } from './hooks/useWallet';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CategorySelect from './pages/game/CategorySelect';
import ChallengeStart from './pages/game/ChallengeStart';
import Playing from './pages/game/Playing';
import ChallengeComplete from './pages/game/ChallengeComplete';
import LeaderboardPage from './pages/LeaderboardPage';
import ShopPage from './pages/ShopPage';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import DailySpinPage from './pages/DailySpinPage';
import DailyChallengePage from './pages/DailyChallengePage';
import PremiumLeaguePage from './pages/PremiumLeaguePage';
import BossChallengePage from './pages/BossChallengePage';
import OraclePage from './pages/OraclePage';
import MentorPage from './pages/MentorPage';
import WeeklyReportPage from './pages/WeeklyReportPage';
import LorePage from './pages/LorePage';
import WrongNetworkOverlay from './components/WrongNetworkOverlay';

const FULLSCREEN_SCREENS = ['playing'];

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function App() {
  const wallet = useWallet();
  const {
    state,
    connectWallet,
    startChallenge,
    startDailyChallenge,
    beginPlaying,
    submitAnswer,
    nextQuestion,
    goToDashboard,
    goToCategorySelect,
    goToLeaderboard,
    goToShop,
    goToProfile,
    goToAchievements,
    goToSettings,
    goToDailySpin,
    goToPremiumLeague,
    goToBossChallenge,
    goToOracle,
    goToMentor,
    goToWeeklyReport,
    goToLore,
    showToast,
    purchaseShopItem,
    handleSpin,
    refreshPlayer,
  } = useGameStore();

  const prevRankRef = useRef<string>(state.player?.rank_tier ?? 'bronze');

  if (state.screen === 'playing' && state.player) {
    prevRankRef.current = state.player.rank_tier;
  }

  // Auto-connect wallet to game store when wallet state changes
  useEffect(() => {
    if (wallet.status === 'connected' && wallet.address && !state.walletAddress) {
      connectWallet(wallet.address);
    }
    if (wallet.status === 'disconnected' && state.walletAddress) {
      window.location.reload();
    }
  }, [wallet.status, wallet.address, state.walletAddress, connectWallet]);

  function handleNavigate(screen: string) {
    switch (screen) {
      case 'dashboard':        goToDashboard();      break;
      case 'category_select':  goToCategorySelect();  break;
      case 'leaderboard':      goToLeaderboard();     break;
      case 'shop':             goToShop();            break;
      case 'profile':          goToProfile();         break;
      case 'achievements':     goToAchievements();    break;
      case 'settings':         goToSettings();        break;
      case 'daily_spin':       goToDailySpin();       break;
      case 'daily_challenge':  startDailyChallenge(); break;
      case 'premium_league':   goToPremiumLeague();   break;
      case 'boss_challenge':   goToBossChallenge();   break;
      case 'oracle':           goToOracle();          break;
      case 'mentor':           goToMentor();          break;
      case 'weekly_report':    goToWeeklyReport();    break;
      case 'lore':             goToLore();            break;
    }
  }

  function handleDisconnect() {
    wallet.disconnect();
    showToast('Wallet disconnected', 'info');
    window.location.reload();
  }

  // Show landing if no wallet connected or no player data yet
  if (state.screen === 'landing' || !state.player || !state.walletAddress) {
    return (
      <Landing
        walletStatus={wallet.status}
        walletError={wallet.error}
        onConnectWallet={() => wallet.connect()}
      />
    );
  }

  const screen = state.screen;
  const isFullscreen = FULLSCREEN_SCREENS.includes(screen);

  const pageContent = (() => {
    switch (state.screen) {
      case 'dashboard':
        return (
          <Dashboard
            state={state}
            onStartChallenge={startChallenge}
            onGoToCategorySelect={goToCategorySelect}
            onGoToLeaderboard={goToLeaderboard}
            onGoToShop={goToShop}
            onGoToProfile={goToProfile}
            onGoToAchievements={goToAchievements}
            onGoToSettings={goToSettings}
            onGoToDailyChallenge={startDailyChallenge}
            onGoToDailySpin={goToDailySpin}
          />
        );

      case 'category_select':
        return (
          <CategorySelect
            player={state.player!}
            mastery={state.mastery}
            onSelect={(id) => startChallenge(id)}
            onBack={goToDashboard}
          />
        );

      case 'challenge_start':
        if (!state.categoryId) return null;
        return (
          <ChallengeStart
            player={state.player!}
            categoryId={state.categoryId}
            isBoss={state.isBoss}
            isDaily={state.isDaily}
            totalQ={state.totalQ}
            onBegin={beginPlaying}
            onBack={goToDashboard}
          />
        );

      case 'playing':
        if (!state.categoryId) return null;
        return (
          <Playing
            player={state.player!}
            categoryId={state.categoryId}
            questions={state.questions}
            currentQ={state.currentQ}
            totalQ={state.totalQ}
            selectedOption={state.selectedOption}
            answerState={state.answerState}
            sessionCorrect={state.sessionCorrect}
            sessionScore={state.sessionScore}
            pendingXp={state.pendingXp}
            isBoss={state.isBoss}
            isDaily={state.isDaily}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            onQuit={() => {
              showToast('Challenge abandoned', 'info');
              goToDashboard();
            }}
          />
        );

      case 'complete':
        if (!state.categoryId) return null;
        return (
          <ChallengeComplete
            player={state.player!}
            categoryId={state.categoryId}
            totalQ={state.totalQ}
            sessionCorrect={state.sessionCorrect}
            sessionScore={state.sessionScore}
            isBoss={state.isBoss}
            isDaily={state.isDaily}
            prevRankTier={prevRankRef.current}
            leveledUp={state.leveledUp}
            rankUp={state.rankUp}
            newRankTier={state.newRankTier}
            streakContinued={state.streakContinued}
            masteryUp={state.masteryUp}
            newMasteryLevel={state.newMasteryLevel}
            onPlayAgain={() => startChallenge(state.categoryId!)}
            onDashboard={goToDashboard}
          />
        );

      case 'daily_challenge':
        return (
          <DailyChallengePage
            player={state.player!}
            onBack={goToDashboard}
            onComplete={(_result) => {
              refreshPlayer();
              goToDashboard();
            }}
          />
        );

      case 'leaderboard':
        return (
          <LeaderboardPage
            walletAddress={state.walletAddress!}
            allTimeLb={state.leaderboard}
            onBack={goToDashboard}
          />
        );

      case 'shop':
        return (
          <ShopPage
            player={state.player!}
            inventory={state.inventory}
            onPurchase={purchaseShopItem}
            onBack={goToDashboard}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            player={state.player!}
            mastery={state.mastery}
            sessions={state.recentSessions}
            achievements={state.achievements}
            inventory={state.inventory}
            walletAddress={state.walletAddress!}
            onBack={goToDashboard}
            onGoToAchievements={goToAchievements}
          />
        );

      case 'achievements':
        return (
          <AchievementsPage
            achievements={state.achievements}
            onBack={goToDashboard}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            player={state.player!}
            walletAddress={state.walletAddress!}
            onBack={goToDashboard}
            onDisconnect={handleDisconnect}
          />
        );

      case 'daily_spin':
        return (
          <DailySpinPage
            player={state.player!}
            onBack={goToDashboard}
            onSpinComplete={async () => {
              await handleSpin();
              await refreshPlayer();
            }}
          />
        );

      case 'premium_league':
        return <PremiumLeaguePage player={state.player!} onBack={goToDashboard} />;

      case 'boss_challenge':
        return <BossChallengePage player={state.player!} onBack={goToDashboard} />;

      case 'oracle':
        return <OraclePage player={state.player!} onBack={goToDashboard} />;

      case 'mentor':
        return <MentorPage player={state.player!} onBack={goToDashboard} />;

      case 'weekly_report':
        return <WeeklyReportPage player={state.player!} onBack={goToDashboard} />;

      case 'lore':
        return <LorePage player={state.player!} onBack={goToDashboard} />;

      default:
        return (
          <Dashboard
            state={state}
            onStartChallenge={startChallenge}
            onGoToCategorySelect={goToCategorySelect}
            onGoToLeaderboard={goToLeaderboard}
            onGoToShop={goToShop}
            onGoToProfile={goToProfile}
            onGoToAchievements={goToAchievements}
            onGoToSettings={goToSettings}
            onGoToDailyChallenge={startDailyChallenge}
            onGoToDailySpin={goToDailySpin}
          />
        );
    }
  })();

  // Fullscreen screens render without the shell's main padding wrapper
  if (isFullscreen && state.screen === 'playing') {
    return (
      <>
        <AppShell
          player={state.player}
          walletAddress={state.walletAddress}
          currentScreen={screen}
          onNavigate={handleNavigate}
          onDisconnect={handleDisconnect}
        >
          {pageContent}
        </AppShell>
        {wallet.status === 'wrong_network' && (
          <WrongNetworkOverlay onSwitch={wallet.switchToRitual} />
        )}
      </>
    );
  }

  return (
    <>
      <AppShell
        player={state.player}
        walletAddress={state.walletAddress}
        currentScreen={screen}
        onNavigate={handleNavigate}
        onDisconnect={handleDisconnect}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state.screen}
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {pageContent}
          </motion.div>
        </AnimatePresence>
      </AppShell>
      {wallet.status === 'wrong_network' && (
        <WrongNetworkOverlay onSwitch={wallet.switchToRitual} />
      )}
    </>
  );
}
