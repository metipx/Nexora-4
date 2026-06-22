import { useState, useCallback, useRef } from 'react';
import {
  supabase, Player, CategoryMastery, ChallengeSession, Achievement, InventoryItem, ShopItem,
  getOrCreatePlayer, updatePlayer, getCategoryMastery, getRecentSessions,
  getPlayerAchievements, checkDailyCompleted, getLeaderboard, getInventory,
  calculateRankScore, rankTierForScore, levelForXp, xpInCurrentLevel,
  XP_BY_DIFFICULTY, recordSpin,
} from '../lib/supabase';
import { CATEGORIES } from '../design-system/tokens';

// ── Types ─────────────────────────────────────────────────────────────────

export interface Question {
  text:        string;
  options:     string[];
  correct:     number;
  explanation: string;
  difficulty:  'easy' | 'medium' | 'hard' | 'very_hard';
}

export type GameScreen =
  | 'landing'
  | 'dashboard'
  | 'category_select'
  | 'challenge_start'
  | 'playing'
  | 'complete'
  | 'leaderboard'
  | 'shop'
  | 'profile'
  | 'achievements'
  | 'settings'
  | 'daily_spin'
  | 'premium_league'
  | 'boss_challenge'
  | 'oracle'
  | 'mentor'
  | 'weekly_report'
  | 'lore';

export type AnswerState = 'idle' | 'selected' | 'revealing' | 'correct' | 'wrong';

export interface GameState {
  screen:         GameScreen;
  walletAddress:  string | null;
  player:         Player | null;
  mastery:        CategoryMastery[];
  recentSessions: ChallengeSession[];
  achievements:   Achievement[];
  dailyDone:      boolean;
  leaderboard:    Player[];
  inventory:      InventoryItem[];
  shopItems:      ShopItem[];

  sessionId:      string | null;
  categoryId:     string | null;
  isBoss:         boolean;
  isDaily:        boolean;
  currentQ:       number;
  totalQ:         number;
  questions:      Question[];
  sessionScore:   number;
  sessionCorrect: number;
  startTime:      number | null;

  selectedOption: number | null;
  answerState:    AnswerState;
  xpGained:       number;
  pendingXp:      number;

  loading:        boolean;
  loadingQuestion:boolean;
  error:          string | null;
  toast:          { message: string; type: 'success' | 'error' | 'info' } | null;
}

const initialState: GameState = {
  screen:         'landing',
  walletAddress:  null,
  player:         null,
  mastery:        [],
  recentSessions: [],
  achievements:   [],
  dailyDone:      false,
  leaderboard:    [],
  inventory:      [],
  shopItems:      [],
  sessionId:      null,
  categoryId:     null,
  isBoss:         false,
  isDaily:        false,
  currentQ:       0,
  totalQ:         5,
  questions:      [],
  sessionScore:   0,
  sessionCorrect: 0,
  startTime:      null,
  selectedOption: null,
  answerState:    'idle',
  xpGained:       0,
  pendingXp:      0,
  loading:        false,
  loadingQuestion:false,
  error:          null,
  toast:          null,
};

// ── Fallback questions ────────────────────────────────────────────────────

const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  science: [
    { text: 'What is the chemical formula for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], correct: 0, explanation: 'Water consists of two hydrogen atoms bonded to one oxygen atom.', difficulty: 'easy' },
    { text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2, explanation: 'Mars appears red due to iron oxide (rust) on its surface.', difficulty: 'easy' },
    { text: 'What is the speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '200,000 km/s'], correct: 0, explanation: 'Light travels at approximately 299,792 km/s in a vacuum.', difficulty: 'medium' },
    { text: 'Which element has the atomic number 79?', options: ['Silver', 'Gold', 'Platinum', 'Copper'], correct: 1, explanation: 'Gold (Au) has atomic number 79 on the periodic table.', difficulty: 'medium' },
    { text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correct: 2, explanation: 'Mitochondria produce ATP through cellular respiration.', difficulty: 'easy' },
  ],
  technology: [
    { text: "What does 'HTTP' stand for?", options: ['HyperText Transfer Protocol', 'High Tech Transfer Process', 'Hyperlink Text Tool Protocol', 'High Transfer Technology Protocol'], correct: 0, explanation: 'HTTP is the foundation of data communication on the web.', difficulty: 'easy' },
    { text: "What does 'CPU' stand for?", options: ['Core Processing Unit', 'Central Processing Unit', 'Computer Performance Unit', 'Central Program Utility'], correct: 1, explanation: 'CPU stands for Central Processing Unit.', difficulty: 'easy' },
    { text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2, explanation: 'Binary search halves the search space each step, giving O(log n).', difficulty: 'hard' },
    { text: "What does 'API' stand for?", options: ['Application Programming Interface', 'Applied Program Integration', 'Automated Process Input', 'Application Protocol Interface'], correct: 0, explanation: 'An API is a set of protocols allowing software applications to communicate.', difficulty: 'easy' },
    { text: 'Which company created Python?', options: ['Microsoft', 'Google', 'Guido van Rossum (independently)', 'Apple'], correct: 2, explanation: 'Python was created by Guido van Rossum, first released in 1991.', difficulty: 'medium' },
  ],
  mathematics: [
    { text: "What is the value of π to 4 decimal places?", options: ['3.1416', '3.1214', '3.1592', '3.1459'], correct: 0, explanation: 'Pi ≈ 3.14159265...', difficulty: 'easy' },
    { text: 'What is the derivative of x²?', options: ['x', '2x', 'x²', '2'], correct: 1, explanation: 'Using the power rule: d/dx(x²) = 2x.', difficulty: 'medium' },
    { text: "Sum of angles in a triangle?", options: ['90°', '180°', '270°', '360°'], correct: 1, explanation: 'The interior angles of any triangle always sum to 180 degrees.', difficulty: 'easy' },
    { text: 'Square root of 144?', options: ['11', '12', '13', '14'], correct: 1, explanation: '12 × 12 = 144.', difficulty: 'easy' },
    { text: 'If f(x) = 3x + 7, what is f(4)?', options: ['15', '16', '18', '19'], correct: 3, explanation: 'f(4) = 3(4) + 7 = 19.', difficulty: 'medium' },
  ],
  history: [
    { text: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2, explanation: 'WWII ended in 1945.', difficulty: 'easy' },
    { text: 'Who was the first President of the United States?', options: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'], correct: 2, explanation: 'George Washington served 1789–1797.', difficulty: 'easy' },
    { text: 'The Great Wall was primarily built during which dynasty?', options: ['Han', 'Tang', 'Ming', 'Qin'], correct: 2, explanation: 'Most surviving wall was built during the Ming Dynasty (1368–1644).', difficulty: 'medium' },
    { text: 'The Berlin Wall fell in?', options: ['1987', '1989', '1991', '1993'], correct: 1, explanation: 'The Berlin Wall fell November 9, 1989.', difficulty: 'easy' },
    { text: 'Who wrote the Declaration of Independence?', options: ['Franklin', 'Adams', 'Jefferson', 'Madison'], correct: 2, explanation: 'Thomas Jefferson was the principal author in 1776.', difficulty: 'easy' },
  ],
  logic: [
    { text: 'If all A are B, and all B are C, then:', options: ['Some A are C', 'All A are C', 'No A are C', 'Cannot determine'], correct: 1, explanation: 'If A⊆B and B⊆C, then A⊆C.', difficulty: 'medium' },
    { text: "Next in sequence: 2, 4, 8, 16, __?", options: ['24', '28', '32', '36'], correct: 2, explanation: 'Each number doubles: 16 × 2 = 32.', difficulty: 'easy' },
    { text: 'Most sides: hexagon, octagon, pentagon, heptagon?', options: ['Hexagon (6)', 'Octagon (8)', 'Pentagon (5)', 'Heptagon (7)'], correct: 1, explanation: 'An octagon has 8 sides.', difficulty: 'easy' },
    { text: 'Tom is father of Sam. Sam is brother of Alice. What is Tom to Alice?', options: ['Uncle', 'Grandfather', 'Father', 'Brother'], correct: 2, explanation: 'Tom is Alice\'s father.', difficulty: 'easy' },
    { text: '3L jug and 5L jug — measure exactly 4L?', options: ['Fill 5L, pour into 3L; empty 3L; pour 2L into 3L; fill 5L; pour 1L to 3L — 4L remains', 'Fill 3L twice', 'Fill 5L, pour 1L out', 'Impossible'], correct: 0, explanation: 'Classic water pouring puzzle.', difficulty: 'hard' },
  ],
  literature: [
    { text: 'Who wrote "Romeo and Juliet"?', options: ['Dickens', 'Shakespeare', 'Austen', 'Twain'], correct: 1, explanation: 'Shakespeare wrote it around 1594–1596.', difficulty: 'easy' },
    { text: 'Where is Atticus Finch from?', options: ['The Great Gatsby', 'Of Mice and Men', 'To Kill a Mockingbird', '1984'], correct: 2, explanation: 'Atticus Finch is in Harper Lee\'s To Kill a Mockingbird.', difficulty: 'easy' },
    { text: 'Who wrote "1984"?', options: ['Huxley', 'Bradbury', 'Orwell', 'Kafka'], correct: 2, explanation: 'George Orwell published 1984 in 1949.', difficulty: 'easy' },
    { text: 'First line of A Tale of Two Cities?', options: ['"Call me Ishmael."', '"It was the best of times..."', '"In the beginning..."', '"Happy families are all alike"'], correct: 1, explanation: 'Dickens\'s famous opening.', difficulty: 'medium' },
    { text: 'Who wrote "The Odyssey"?', options: ['Virgil', 'Sophocles', 'Homer', 'Plato'], correct: 2, explanation: 'The Odyssey is attributed to Homer.', difficulty: 'easy' },
  ],
  geography: [
    { text: 'Capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2, explanation: 'Canberra is the capital, not Sydney.', difficulty: 'medium' },
    { text: 'Largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2, explanation: 'Pacific Ocean covers more than 30% of Earth.', difficulty: 'easy' },
    { text: 'Amazon River primarily located in?', options: ['Peru', 'Colombia', 'Brazil', 'Venezuela'], correct: 2, explanation: 'Most of the Amazon flows through Brazil.', difficulty: 'easy' },
    { text: 'Longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1, explanation: 'The Nile at ~6,650 km.', difficulty: 'easy' },
    { text: 'Country with most natural lakes?', options: ['Russia', 'United States', 'Canada', 'Finland'], correct: 2, explanation: 'Canada has ~879,000 lakes.', difficulty: 'hard' },
  ],
  crypto_web3: [
    { text: 'What consensus mechanism does Ethereum use?', options: ['Proof of Work', 'Proof of Stake', 'Delegated Proof of Stake', 'Proof of Authority'], correct: 1, explanation: 'Ethereum switched to Proof of Stake in The Merge (Sept 2022).', difficulty: 'easy' },
    { text: "What does 'NFT' stand for?", options: ['New Financial Token', 'Non-Fungible Token', 'Network File Transfer', 'No Fiat Transaction'], correct: 1, explanation: 'NFT = Non-Fungible Token.', difficulty: 'easy' },
    { text: 'Who created Bitcoin?', options: ['Vitalik Buterin', 'Craig Wright', 'Satoshi Nakamoto', 'Nick Szabo'], correct: 2, explanation: 'Satoshi Nakamoto published the whitepaper in 2008.', difficulty: 'easy' },
    { text: 'What is a smart contract?', options: ['A legal PDF', 'Self-executing code on a blockchain', 'An encrypted email', 'A 2FA system'], correct: 1, explanation: 'Smart contracts execute when predetermined conditions are met.', difficulty: 'medium' },
    { text: 'Max supply of Bitcoin?', options: ['10M BTC', '21M BTC', '100M BTC', 'Unlimited'], correct: 1, explanation: 'Bitcoin has a hard cap of 21 million coins.', difficulty: 'easy' },
  ],
};

function getFallbackQuestions(categoryId: string, count: number): Question[] {
  const pool = FALLBACK_QUESTIONS[categoryId] ?? FALLBACK_QUESTIONS.technology;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

// ── Achievement unlock checks ─────────────────────────────────────────────

export async function checkAndUnlockAchievements(
  walletAddress: string,
  stats: { total_xp: number; total_correct: number; streak_days: number; boss_wins: number; level: number; rank_tier: string; categoriesPlayed: number; hasPurchased: boolean; hasSpun: boolean; topWeekly: boolean },
  existing: string[],
) {
  const toUnlock: string[] = [];
  const c = (id: string) => !existing.includes(id);

  if (stats.total_correct >= 1   && c('first_correct'))     toUnlock.push('first_correct');
  if (stats.total_correct >= 10  && c('correct_10'))        toUnlock.push('correct_10');
  if (stats.total_correct >= 50  && c('correct_50'))        toUnlock.push('correct_50');
  if (stats.streak_days  >= 3   && c('streak_3'))           toUnlock.push('streak_3');
  if (stats.streak_days  >= 7   && c('streak_7'))           toUnlock.push('streak_7');
  if (stats.level        >= 5   && c('level_5'))            toUnlock.push('level_5');
  if (stats.level        >= 10  && c('level_10'))           toUnlock.push('level_10');
  if (stats.level        >= 20  && c('level_20'))           toUnlock.push('level_20');
  if (stats.boss_wins    >= 1   && c('boss_participated'))  toUnlock.push('boss_participated');
  if (stats.categoriesPlayed >= 3 && c('categories_3'))     toUnlock.push('categories_3');
  if (stats.hasPurchased       && c('first_purchase'))      toUnlock.push('first_purchase');
  if (stats.hasSpun            && c('first_spin'))          toUnlock.push('first_spin');
  if (stats.rank_tier === 'gold' || ['platinum','diamond','nexora'].includes(stats.rank_tier)) {
    if (c('rank_gold')) toUnlock.push('rank_gold');
  }
  if (stats.topWeekly && c('top10_weekly'))                 toUnlock.push('top10_weekly');

  if (toUnlock.length > 0) {
    await supabase.from('achievements').upsert(
      toUnlock.map(id => ({ wallet_address: walletAddress, achievement_id: id })),
      { onConflict: 'wallet_address,achievement_id' }
    );
  }
}

// ── Main hook ─────────────────────────────────────────────────────────────

export function useGameStore() {
  const [state, setState] = useState<GameState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const set = useCallback((patch: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : patch;
      return { ...prev, ...next };
    });
  }, []);

  const connectWallet = useCallback(async (wallet: string) => {
    const addr = wallet.toLowerCase();
    set({ loading: true, error: null });
    try {
      const player = await getOrCreatePlayer(addr);
      const [mastery, sessions, achievs, dailyDone, lb, inventory] = await Promise.all([
        getCategoryMastery(addr),
        getRecentSessions(addr, 15),
        getPlayerAchievements(addr),
        checkDailyCompleted(addr),
        getLeaderboard(25),
        getInventory(addr),
      ]);
      set({
        walletAddress:  addr,
        player,
        mastery:        mastery as CategoryMastery[],
        recentSessions: sessions,
        achievements:   achievs,
        dailyDone,
        leaderboard:    lb,
        inventory,
        screen:         'dashboard',
        loading:        false,
      });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  }, [set]);

  const refreshPlayer = useCallback(async () => {
    const { walletAddress } = stateRef.current;
    if (!walletAddress) return;
    try {
      const player = await getOrCreatePlayer(walletAddress);
      const [mastery, sessions, achievs, dailyDone, lb, inventory] = await Promise.all([
        getCategoryMastery(walletAddress),
        getRecentSessions(walletAddress, 15),
        getPlayerAchievements(walletAddress),
        checkDailyCompleted(walletAddress),
        getLeaderboard(25),
        getInventory(walletAddress),
      ]);
      set({ player, mastery: mastery as CategoryMastery[], recentSessions: sessions, achievements: achievs, dailyDone, leaderboard: lb, inventory });
    } catch { /* silent */ }
  }, [set]);

  const startChallenge = useCallback(async (categoryId: string, opts?: { isDaily?: boolean; isBoss?: boolean }) => {
    const { walletAddress, player } = stateRef.current;
    if (!walletAddress || !player) return;
    const isDaily = opts?.isDaily ?? false;
    const isBoss  = opts?.isBoss  ?? false;
    const totalQ  = isBoss ? 10 : 5;
    set({ screen: 'challenge_start', categoryId, isDaily, isBoss, totalQ });
  }, [set]);

  const beginPlaying = useCallback(async () => {
    const { walletAddress, player, categoryId, isBoss, totalQ, isDaily } = stateRef.current;
    if (!walletAddress || !player || !categoryId) return;
    set({ loadingQuestion: true, currentQ: 0, questions: [], sessionScore: 0, sessionCorrect: 0 });
    try {
      const { data: sessionData, error: sessionErr } = await supabase
        .from('challenge_sessions')
        .insert({ wallet_address: walletAddress, category_id: categoryId, difficulty: 'medium', total_questions: totalQ, is_daily: isDaily, is_boss: isBoss })
        .select('id')
        .single();
      if (sessionErr) throw sessionErr;
      const questions = await loadQuestions(categoryId, player.level, totalQ);
      set({ sessionId: sessionData.id, questions, screen: 'playing', startTime: Date.now(), loadingQuestion: false, selectedOption: null, answerState: 'idle', xpGained: 0 });
    } catch {
      const questions = getFallbackQuestions(categoryId, totalQ);
      const { data: sessionData } = await supabase
        .from('challenge_sessions')
        .insert({ wallet_address: walletAddress, category_id: categoryId, difficulty: 'medium', total_questions: totalQ, is_daily: isDaily, is_boss: isBoss })
        .select('id')
        .single();
      set({ sessionId: sessionData?.id ?? null, questions, screen: 'playing', startTime: Date.now(), loadingQuestion: false, selectedOption: null, answerState: 'idle', xpGained: 0 });
    }
  }, [set]);

  const submitAnswer = useCallback(async (optionIndex: number) => {
    const s = stateRef.current;
    if (s.answerState !== 'idle' || !s.player || !s.walletAddress) return;
    const question = s.questions[s.currentQ];
    if (!question) return;
    const isCorrect = optionIndex === question.correct;
    const xp        = isCorrect ? XP_BY_DIFFICULTY[question.difficulty] ?? 100 : 0;
    const timeTaken = s.startTime ? Date.now() - s.startTime : 0;
    set({ selectedOption: optionIndex, answerState: 'selected' });
    await sleep(350);
    set({ answerState: 'revealing' });
    await sleep(500);
    set({ answerState: isCorrect ? 'correct' : 'wrong', pendingXp: xp });
    if (s.sessionId) {
      await supabase.from('challenge_questions').insert({
        session_id: s.sessionId, wallet_address: s.walletAddress,
        category_id: s.categoryId!, difficulty: question.difficulty,
        question_text: question.text, correct_answer: question.options[question.correct],
        player_answer: question.options[optionIndex], is_correct: isCorrect,
        time_taken_ms: timeTaken, xp_awarded: xp,
      });
    }
    set(prev => ({ sessionScore: prev.sessionScore + xp, sessionCorrect: prev.sessionCorrect + (isCorrect ? 1 : 0), xpGained: prev.xpGained + xp }));
  }, [set]);

  const nextQuestion = useCallback(async () => {
    const s = stateRef.current;
    const next = s.currentQ + 1;
    if (next >= s.questions.length) {
      await finalizeSession(s, set, refreshPlayer);
    } else {
      set({ currentQ: next, selectedOption: null, answerState: 'idle', startTime: Date.now() });
    }
  }, [set, refreshPlayer]);

  const goToDashboard = useCallback(() => {
    set({ screen: 'dashboard', selectedOption: null, answerState: 'idle', sessionId: null, questions: [], currentQ: 0, sessionScore: 0, sessionCorrect: 0, xpGained: 0, pendingXp: 0 });
  }, [set]);

  const goToCategorySelect = useCallback(() => set({ screen: 'category_select' }), [set]);
  const goToLeaderboard    = useCallback(() => set({ screen: 'leaderboard' }), [set]);
  const goToShop           = useCallback(() => set({ screen: 'shop' }), [set]);
  const goToProfile        = useCallback(() => set({ screen: 'profile' }), [set]);
  const goToAchievements   = useCallback(() => set({ screen: 'achievements' }), [set]);
  const goToSettings       = useCallback(() => set({ screen: 'settings' }), [set]);
  const goToDailySpin      = useCallback(() => set({ screen: 'daily_spin' }), [set]);
  const goToPremiumLeague  = useCallback(() => set({ screen: 'premium_league' }), [set]);
  const goToBossChallenge  = useCallback(() => set({ screen: 'boss_challenge' }), [set]);
  const goToOracle         = useCallback(() => set({ screen: 'oracle' }), [set]);
  const goToMentor         = useCallback(() => set({ screen: 'mentor' }), [set]);
  const goToWeeklyReport   = useCallback(() => set({ screen: 'weekly_report' }), [set]);
  const goToLore            = useCallback(() => set({ screen: 'lore' }), [set]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  }, [set]);

  const handleSpin = useCallback(async () => {
    const { walletAddress, player } = stateRef.current;
    if (!walletAddress || !player) return null;
    const today = new Date().toISOString().slice(0, 10);
    if (player.spin_last_date === today) return null;
    const prizes = [
      { type: 'xp',    value: '25',           weight: 30 },
      { type: 'xp',    value: '50',           weight: 25 },
      { type: 'xp',    value: '100',          weight: 15 },
      { type: 'xp',    value: '200',          weight: 8  },
      { type: 'item',  value: 'hint_token',   weight: 10 },
      { type: 'item',  value: 'retry_ticket', weight: 7  },
      { type: 'empty', value: 'nothing',      weight: 5  },
    ];
    const total = prizes.reduce((a, b) => a + b.weight, 0);
    let rand = Math.random() * total;
    const prize = prizes.find(p => (rand -= p.weight) <= 0) ?? prizes[0];
    await recordSpin(walletAddress, prize.type, prize.value);
    if (prize.type === 'xp') {
      const xp = parseInt(prize.value);
      const newTotalXp = player.total_xp + xp;
      await updatePlayer(walletAddress, { total_xp: newTotalXp, level: levelForXp(newTotalXp), current_xp: 0 });
    }
    await refreshPlayer();
    return prize;
  }, [set, refreshPlayer]);

  const purchaseShopItem = useCallback(async (itemSlug: string, _priceRitual: number) => {
    const { walletAddress, player } = stateRef.current;
    if (!walletAddress || !player) return false;
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({ wallet_address: walletAddress, item_slug: itemSlug, quantity: 1, transaction_hash: `testnet_${Date.now()}` })
        .select('*')
        .single();
      if (error) throw error;
      set(prev => ({ inventory: [data as InventoryItem, ...prev.inventory] }));
      // Check first_purchase achievement
      const existingIds = stateRef.current.achievements.map(a => a.achievement_id);
      if (!existingIds.includes('first_purchase')) {
        await supabase.from('achievements').upsert([{ wallet_address: walletAddress, achievement_id: 'first_purchase' }], { onConflict: 'wallet_address,achievement_id' });
        await refreshPlayer();
      }
      return true;
    } catch { return false; }
  }, [set, refreshPlayer]);

  return {
    state,
    connectWallet,
    refreshPlayer,
    startChallenge,
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
    handleSpin,
    purchaseShopItem,
    set,
  };
}

// ── Module-level helpers (no state access) ────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadQuestions(categoryId: string, level: number, count: number): Promise<Question[]> {
  const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/generate-question`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${supabaseAnon}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, level, count }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('empty');
    return data.questions as Question[];
  } catch {
    return getFallbackQuestions(categoryId, count);
  }
}

async function finalizeSession(s: GameState, set: (p: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => void, refreshPlayer: () => Promise<void>) {
  if (!s.walletAddress || !s.player || !s.sessionId) return;
  const duration = s.startTime ? Math.floor((Date.now() - s.startTime) / 1000) : 0;

  await supabase.from('challenge_sessions').update({ score: s.sessionScore, correct_count: s.sessionCorrect, duration_seconds: duration }).eq('id', s.sessionId);

  const newTotalXp      = s.player.total_xp + s.sessionScore;
  const newTotalAnswered = s.player.total_answered + s.questions.length;
  const newTotalCorrect  = s.player.total_correct + s.sessionCorrect;
  const newAccuracy      = newTotalAnswered > 0 ? newTotalCorrect / newTotalAnswered : 0;
  const newLevel         = levelForXp(newTotalXp);
  const newCurrentXp     = xpInCurrentLevel(newTotalXp);
  const bossWins         = s.player.boss_wins + (s.isBoss && s.sessionCorrect > s.questions.length / 2 ? 1 : 0);
  const newRankScore     = calculateRankScore({ total_xp: newTotalXp, accuracy_rate: newAccuracy, total_correct: newTotalCorrect, streak_days: s.player.streak_days, boss_wins: bossWins });
  const newRankTier      = rankTierForScore(newRankScore);

  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastDay   = s.player.last_activity_date;
  let newStreak   = s.player.streak_days;
  if (lastDay !== today) newStreak = lastDay === yesterday ? s.player.streak_days + 1 : 1;

  await updatePlayer(s.walletAddress, { total_xp: newTotalXp, current_xp: newCurrentXp, level: newLevel, rank_score: newRankScore, rank_tier: newRankTier, accuracy_rate: newAccuracy, total_correct: newTotalCorrect, total_answered: newTotalAnswered, streak_days: newStreak, last_activity_date: today, boss_wins: bossWins });

  if (s.categoryId) {
    const existing = s.mastery.find(m => m.category_id === s.categoryId);
    const mastXp   = (existing?.mastery_xp ?? 0) + s.sessionScore;
    const mastLvl  = Math.min(10, Math.floor(mastXp / 500) + 1);
    if (existing) {
      await supabase.from('category_mastery').update({ mastery_xp: mastXp, mastery_level: mastLvl, total_correct: existing.total_correct + s.sessionCorrect, total_answered: existing.total_answered + s.questions.length, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('category_mastery').insert({ wallet_address: s.walletAddress, category_id: s.categoryId, mastery_xp: mastXp, mastery_level: mastLvl, total_correct: s.sessionCorrect, total_answered: s.questions.length });
    }
  }

  if (s.isDaily) {
    await supabase.from('daily_challenge_completions').upsert({ wallet_address: s.walletAddress, challenge_date: today, xp_awarded: s.sessionScore }, { onConflict: 'wallet_address,challenge_date' });
  }

  const categoriesPlayed = new Set([...s.mastery.map(m => m.category_id), s.categoryId ?? '']).size;
  const existingAchievement = s.achievements.map(a => a.achievement_id);
  await checkAndUnlockAchievements(s.walletAddress, {
    total_xp: newTotalXp, total_correct: newTotalCorrect, streak_days: newStreak,
    boss_wins: bossWins, level: newLevel, rank_tier: newRankTier,
    categoriesPlayed, hasPurchased: false, hasSpun: false, topWeekly: false,
  }, existingAchievement);

  await refreshPlayer();
  set({ screen: 'complete' });
}

// suppress unused warning – CATEGORIES used in store for category count
void CATEGORIES;
