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
  | 'daily_challenge'
  | 'premium_league'
  | 'boss_challenge'
  | 'oracle'
  | 'mentor'
  | 'weekly_report'
  | 'lore';

export type AnswerState = 'idle' | 'selected' | 'revealing' | 'correct' | 'wrong';

export interface GameState {
  screen:          GameScreen;
  walletAddress:   string | null;
  player:          Player | null;
  mastery:         CategoryMastery[];
  recentSessions:  ChallengeSession[];
  achievements:    Achievement[];
  dailyDone:       boolean;
  leaderboard:     Player[];
  inventory:       InventoryItem[];
  shopItems:       ShopItem[];

  sessionId:       string | null;
  categoryId:      string | null;
  isBoss:          boolean;
  isDaily:         boolean;
  currentQ:        number;
  totalQ:          number;
  questions:       Question[];
  sessionScore:    number;
  sessionCorrect:  number;
  startTime:       number | null;

  selectedOption:  number | null;
  answerState:     AnswerState;
  xpGained:        number;
  pendingXp:       number;
  xpBurst:         number;
  xpBurstKey:      number;

  // Progression events for animations
  leveledUp:       boolean;
  rankUp:          boolean;
  newRankTier:     string | null;
  streakContinued: boolean;
  masteryUp:       boolean;
  newMasteryLevel: number;

  loading:         boolean;
  loadingQuestion: boolean;
  error:           string | null;
  toast:           { message: string; type: 'success' | 'error' | 'info' } | null;
}

const initialState: GameState = {
  screen:          'landing',
  walletAddress:   null,
  player:          null,
  mastery:         [],
  recentSessions:  [],
  achievements:    [],
  dailyDone:       false,
  leaderboard:     [],
  inventory:       [],
  shopItems:       [],
  sessionId:       null,
  categoryId:      null,
  isBoss:          false,
  isDaily:         false,
  currentQ:        0,
  totalQ:          5,
  questions:       [],
  sessionScore:    0,
  sessionCorrect:  0,
  startTime:       null,
  selectedOption:  null,
  answerState:     'idle',
  xpGained:        0,
  pendingXp:       0,
  xpBurst:         0,
  xpBurstKey:      0,
  leveledUp:       false,
  rankUp:          false,
  newRankTier:     null,
  streakContinued: false,
  masteryUp:       false,
  newMasteryLevel: 0,
  loading:         false,
  loadingQuestion: false,
  error:           null,
  toast:           null,
};

// ── Fallback questions ────────────────────────────────────────────────────

const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  tech_ai: [
    { text: 'What does "LLM" stand for in AI?', options: ['Large Language Model', 'Long Learning Machine', 'Linear Logic Module', 'Local Learning Matrix'], correct: 0, explanation: 'LLM stands for Large Language Model, like GPT-4 or Claude.', difficulty: 'easy' },
    { text: 'Which company created ChatGPT?', options: ['Google', 'Meta', 'OpenAI', 'Anthropic'], correct: 2, explanation: 'ChatGPT was created by OpenAI and launched in November 2022.', difficulty: 'easy' },
    { text: 'What is the main purpose of a transformer architecture?', options: ['Image recognition', 'Sequential data processing with attention', 'Database indexing', 'Network routing'], correct: 1, explanation: 'Transformers use self-attention to process sequential data, powering most modern LLMs.', difficulty: 'medium' },
    { text: 'What is "overfitting" in machine learning?', options: ['Model too simple', 'Model memorizes training data, poor generalization', 'Too much training data', 'Slow training speed'], correct: 1, explanation: 'Overfitting occurs when a model learns training data too well, including noise, and performs poorly on new data.', difficulty: 'medium' },
    { text: 'Which neural network architecture is best for image classification?', options: ['RNN', 'LSTM', 'CNN', 'Transformer'], correct: 2, explanation: 'CNNs (Convolutional Neural Networks) excel at spatial feature extraction in images.', difficulty: 'medium' },
  ],
  programming: [
    { text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2, explanation: 'Binary search halves the search space each step, giving O(log n).', difficulty: 'easy' },
    { text: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Heap', 'Linked List'], correct: 1, explanation: 'Stack uses Last In, First Out (LIFO) ordering.', difficulty: 'easy' },
    { text: 'What is a "deadlock" in operating systems?', options: ['Memory leak', 'Two processes waiting for each other\'s resources', 'CPU overheating', 'Disk full'], correct: 1, explanation: 'Deadlock occurs when two or more processes are blocked forever, each waiting for a resource held by another.', difficulty: 'medium' },
    { text: 'What is the difference between TCP and UDP?', options: ['Speed vs security', 'Reliable vs unreliable delivery', 'IPv4 vs IPv6', 'HTTP vs HTTPS'], correct: 1, explanation: 'TCP guarantees delivery with acknowledgments; UDP is faster but best-effort with no guarantees.', difficulty: 'medium' },
    { text: 'In a binary tree, what is the maximum number of nodes at level k?', options: ['k', '2^k', '2^(k-1)', 'k²'], correct: 2, explanation: 'Level k can have at most 2^(k-1) nodes in a full binary tree.', difficulty: 'hard' },
  ],
  history: [
    { text: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2, explanation: 'WWII ended in 1945 with the surrender of Japan.', difficulty: 'easy' },
    { text: 'Who was the first President of the United States?', options: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'], correct: 2, explanation: 'George Washington served 1789–1797.', difficulty: 'easy' },
    { text: 'The Great Wall was primarily built during which dynasty?', options: ['Han', 'Tang', 'Ming', 'Qin'], correct: 2, explanation: 'Most surviving wall was built during the Ming Dynasty (1368–1644).', difficulty: 'medium' },
    { text: 'The Berlin Wall fell in?', options: ['1987', '1989', '1991', '1993'], correct: 1, explanation: 'The Berlin Wall fell November 9, 1989.', difficulty: 'easy' },
    { text: 'Who wrote the Declaration of Independence?', options: ['Franklin', 'Adams', 'Jefferson', 'Madison'], correct: 2, explanation: 'Thomas Jefferson was the principal author in 1776.', difficulty: 'easy' },
  ],
  geography: [
    { text: 'Capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2, explanation: 'Canberra is the capital, not Sydney.', difficulty: 'easy' },
    { text: 'Largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2, explanation: 'Pacific Ocean covers more than 30% of Earth.', difficulty: 'easy' },
    { text: 'Amazon River primarily located in?', options: ['Peru', 'Colombia', 'Brazil', 'Venezuela'], correct: 2, explanation: 'Most of the Amazon flows through Brazil.', difficulty: 'easy' },
    { text: 'Longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1, explanation: 'The Nile at ~6,650 km.', difficulty: 'easy' },
    { text: 'Country with most natural lakes?', options: ['Russia', 'United States', 'Canada', 'Finland'], correct: 2, explanation: 'Canada has ~879,000 lakes.', difficulty: 'hard' },
  ],
  science_astronomy: [
    { text: 'What is the chemical formula for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], correct: 0, explanation: 'Water consists of two hydrogen atoms bonded to one oxygen atom.', difficulty: 'easy' },
    { text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2, explanation: 'Mars appears red due to iron oxide (rust) on its surface.', difficulty: 'easy' },
    { text: 'What is the speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '200,000 km/s'], correct: 0, explanation: 'Light travels at approximately 299,792 km/s in a vacuum.', difficulty: 'medium' },
    { text: 'Which element has the atomic number 79?', options: ['Silver', 'Gold', 'Platinum', 'Copper'], correct: 1, explanation: 'Gold (Au) has atomic number 79 on the periodic table.', difficulty: 'medium' },
    { text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correct: 2, explanation: 'Mitochondria produce ATP through cellular respiration.', difficulty: 'easy' },
  ],
  business_economics: [
    { text: 'What does GDP stand for?', options: ['Gross Domestic Product', 'Global Development Plan', 'General Debt Portfolio', 'Gross Dividend Payment'], correct: 0, explanation: 'GDP measures the total value of goods and services produced in a country.', difficulty: 'easy' },
    { text: 'What is inflation?', options: ['Rise in prices over time', 'Increase in wages', 'Stock market crash', 'Currency devaluation'], correct: 0, explanation: 'Inflation is the sustained increase in the general price level of goods and services.', difficulty: 'easy' },
    { text: 'What is a bear market?', options: ['Rising prices', 'Falling prices (20%+ decline)', 'Sideways trading', 'High volatility'], correct: 1, explanation: 'A bear market is defined as a 20% or more drop from recent highs.', difficulty: 'medium' },
    { text: 'What does IPO stand for?', options: ['Initial Public Offering', 'International Portfolio Option', 'Internal Profit Objective', 'Investor Purchase Order'], correct: 0, explanation: 'An IPO is when a private company first sells shares to the public.', difficulty: 'easy' },
    { text: 'What is the Federal Reserve?', options: ['US Treasury', 'Central bank of the US', 'Stock exchange', 'Investment bank'], correct: 1, explanation: 'The Federal Reserve is the central banking system of the United States.', difficulty: 'easy' },
  ],
  sports: [
    { text: 'How many players are on a soccer team on the field?', options: ['9', '10', '11', '12'], correct: 2, explanation: 'A soccer team fields 11 players.', difficulty: 'easy' },
    { text: 'In which city were the first modern Olympics held?', options: ['Paris', 'London', 'Athens', 'Rome'], correct: 2, explanation: 'The first modern Olympics were held in Athens, Greece in 1896.', difficulty: 'medium' },
    { text: 'What is the maximum score in a single dart throw?', options: ['50', '60', '100', '180'], correct: 1, explanation: 'The triple-20 is worth 60 points.', difficulty: 'hard' },
    { text: 'How many Grand Slam tennis tournaments exist?', options: ['3', '4', '5', '6'], correct: 1, explanation: 'Australian Open, French Open, Wimbledon, and US Open.', difficulty: 'easy' },
    { text: 'Which country has won the most FIFA World Cups?', options: ['Germany', 'Argentina', 'Italy', 'Brazil'], correct: 3, explanation: 'Brazil has won 5 FIFA World Cups.', difficulty: 'easy' },
  ],
  cinema_entertainment: [
    { text: 'Who directed "Inception"?', options: ['Christopher Nolan', 'Steven Spielberg', 'James Cameron', 'Martin Scorsese'], correct: 0, explanation: 'Christopher Nolan directed Inception (2010).', difficulty: 'easy' },
    { text: 'Which film won the first Academy Award for Best Picture?', options: ['Gone with the Wind', 'Wings', 'Citizen Kane', 'The Jazz Singer'], correct: 1, explanation: 'Wings won the first Best Picture Oscar in 1929.', difficulty: 'hard' },
    { text: 'Who played Iron Man in the MCU?', options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'], correct: 2, explanation: 'Robert Downey Jr. portrayed Tony Stark / Iron Man.', difficulty: 'easy' },
    { text: 'What is the highest-grossing film of all time?', options: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars'], correct: 0, explanation: 'Avatar (2009) is the highest-grossing film worldwide.', difficulty: 'easy' },
    { text: 'Which band wrote "Bohemian Rhapsody"?', options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'], correct: 2, explanation: 'Queen released Bohemian Rhapsody in 1975.', difficulty: 'easy' },
  ],
  english: [
    { text: 'What is the past tense of "go"?', options: ['Goed', 'Went', 'Gone', 'Going'], correct: 1, explanation: '"Went" is the simple past tense of "go".', difficulty: 'easy' },
    { text: 'Which word is a synonym for "ephemeral"?', options: ['Permanent', 'Fleeting', 'Massive', 'Ancient'], correct: 1, explanation: 'Ephemeral means lasting for a very short time.', difficulty: 'medium' },
    { text: 'What figure of speech is "time is money"?', options: ['Simile', 'Metaphor', 'Personification', 'Hyperbole'], correct: 1, explanation: '"Time is money" directly equates time to money without "like" or "as".', difficulty: 'medium' },
    { text: 'Which sentence uses the subjunctive mood?', options: ['I was there', 'If I were rich', 'She walks daily', 'They had gone'], correct: 1, explanation: '"If I were" uses the subjunctive for hypothetical situations.', difficulty: 'hard' },
    { text: 'What is the longest word in the English language?', options: ['Antidisestablishmentarianism', 'Pneumonoultramicroscopicsilicovolcanoconiosis', 'Supercalifragilisticexpialidocious', 'Hippopotomonstrosesquippedaliophobia'], correct: 1, explanation: 'Pneumonoultramicroscopicsilicovolcanoconiosis refers to lung disease from silica dust.', difficulty: 'hard' },
  ],
  logic_problem: [
    { text: 'If all A are B, and all B are C, then:', options: ['Some A are C', 'All A are C', 'No A are C', 'Cannot determine'], correct: 1, explanation: 'If A⊆B and B⊆C, then A⊆C.', difficulty: 'easy' },
    { text: 'Next in sequence: 2, 4, 8, 16, __?', options: ['24', '28', '32', '36'], correct: 2, explanation: 'Each number doubles: 16 × 2 = 32.', difficulty: 'easy' },
    { text: 'Most sides: hexagon, octagon, pentagon, heptagon?', options: ['Hexagon (6)', 'Octagon (8)', 'Pentagon (5)', 'Heptagon (7)'], correct: 1, explanation: 'An octagon has 8 sides.', difficulty: 'easy' },
    { text: 'Tom is father of Sam. Sam is brother of Alice. What is Tom to Alice?', options: ['Uncle', 'Grandfather', 'Father', 'Brother'], correct: 2, explanation: 'Tom is Alice\'s father.', difficulty: 'easy' },
    { text: '3L jug and 5L jug — measure exactly 4L?', options: ['Fill 5L, pour into 3L; empty 3L; pour 2L into 3L; fill 5L; pour 1L to 3L — 4L remains', 'Fill 3L twice', 'Fill 5L, pour 1L out', 'Impossible'], correct: 0, explanation: 'Classic water pouring puzzle.', difficulty: 'hard' },
  ],
  culture_art: [
    { text: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'], correct: 2, explanation: 'Leonardo da Vinci painted the Mona Lisa around 1503–1519.', difficulty: 'easy' },
    { text: 'Which art movement includes Monet and Renoir?', options: ['Cubism', 'Impressionism', 'Surrealism', 'Baroque'], correct: 1, explanation: 'Monet and Renoir were leading Impressionist painters.', difficulty: 'easy' },
    { text: 'The Sistine Chapel ceiling was painted by?', options: ['Leonardo', 'Raphael', 'Michelangelo', 'Botticelli'], correct: 2, explanation: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512.', difficulty: 'easy' },
    { text: 'What architectural style features flying buttresses?', options: ['Romanesque', 'Gothic', 'Renaissance', 'Brutalist'], correct: 1, explanation: 'Gothic architecture is known for flying buttresses, pointed arches, and stained glass.', difficulty: 'medium' },
    { text: 'Which museum houses the Starry Night?', options: ['Louvre', 'Metropolitan', 'MoMA', 'Uffizi'], correct: 2, explanation: 'Van Gogh\'s The Starry Night is at the Museum of Modern Art (MoMA) in New York.', difficulty: 'medium' },
  ],
  general_knowledge: [
    { text: 'What is the tallest mountain in the world?', options: ['K2', 'Mount Kilimanjaro', 'Mount Everest', 'Denali'], correct: 2, explanation: 'Mount Everest is 8,849 meters (29,032 feet) above sea level.', difficulty: 'easy' },
    { text: 'Who invented the telephone?', options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Guglielmo Marconi'], correct: 2, explanation: 'Alexander Graham Bell is credited with inventing the telephone in 1876.', difficulty: 'easy' },
    { text: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correct: 1, explanation: 'Vatican City is 0.44 km², the smallest internationally recognized state.', difficulty: 'easy' },
    { text: 'How many bones are in the adult human body?', options: ['206', '208', '210', '212'], correct: 0, explanation: 'An adult human has 206 bones.', difficulty: 'medium' },
    { text: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], correct: 2, explanation: 'Diamond is rated 10 on the Mohs hardness scale.', difficulty: 'easy' },
  ],
};

function getFallbackQuestions(categoryId: string, count: number): Question[] {
  const pool = FALLBACK_QUESTIONS[categoryId] ?? FALLBACK_QUESTIONS.general_knowledge;
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
  if (stats.total_correct >= 100 && c('correct_100'))       toUnlock.push('correct_100');
  if (stats.streak_days  >= 3   && c('streak_3'))           toUnlock.push('streak_3');
  if (stats.streak_days  >= 7   && c('streak_7'))           toUnlock.push('streak_7');
  if (stats.streak_days  >= 30  && c('streak_30'))          toUnlock.push('streak_30');
  if (stats.level        >= 5   && c('level_5'))            toUnlock.push('level_5');
  if (stats.level        >= 10  && c('level_10'))           toUnlock.push('level_10');
  if (stats.level        >= 20  && c('level_20'))           toUnlock.push('level_20');
  if (stats.boss_wins    >= 1   && c('boss_participated'))  toUnlock.push('boss_participated');
  if (stats.boss_wins    >= 5   && c('boss_veteran'))       toUnlock.push('boss_veteran');
  if (stats.categoriesPlayed >= 3 && c('categories_3'))     toUnlock.push('categories_3');
  if (stats.categoriesPlayed >= 6 && c('categories_6'))     toUnlock.push('categories_6');
  if (stats.categoriesPlayed >= 12 && c('categories_all'))  toUnlock.push('categories_all');
  if (stats.hasPurchased       && c('first_purchase'))      toUnlock.push('first_purchase');
  if (stats.hasSpun            && c('first_spin'))          toUnlock.push('first_spin');
  if (['gold','platinum','diamond'].includes(stats.rank_tier) && c('rank_gold')) {
    toUnlock.push('rank_gold');
  }
  if (['platinum','diamond'].includes(stats.rank_tier) && c('rank_platinum')) {
    toUnlock.push('rank_platinum');
  }
  if (stats.rank_tier === 'diamond' && c('rank_diamond')) {
    toUnlock.push('rank_diamond');
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

  // Daily challenge: picks category based on day-of-week + player level
  const startDailyChallenge = useCallback(async () => {
    const { walletAddress, player } = stateRef.current;
    if (!walletAddress || !player) return;
    const today = new Date().toISOString().slice(0, 10);
    if (player.spin_last_date === today) { /* not already done check */ }
    // Pick category deterministically by day of week, cycling through unlocked
    const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
    const unlocked = CATEGORIES.filter(c => c.unlockLevel <= player.level);
    const cat = unlocked[dayIndex % unlocked.length];
    if (!cat) return;
    set({ screen: 'challenge_start', categoryId: cat.id, isDaily: true, isBoss: false, totalQ: 5 });
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
    set({ loadingQuestion: true, currentQ: 0, questions: [], sessionScore: 0, sessionCorrect: 0, leveledUp: false, rankUp: false, newRankTier: null, streakContinued: false, masteryUp: false, newMasteryLevel: 0 });
    try {
      const { data: sessionData, error: sessionErr } = await supabase
        .from('challenge_sessions')
        .insert({ wallet_address: walletAddress, category_id: categoryId, difficulty: 'medium', total_questions: totalQ, is_daily: isDaily, is_boss: isBoss })
        .select('id')
        .single();
      if (sessionErr) throw sessionErr;
      const questions = await loadQuestions(categoryId, player.level, totalQ);
      set({ sessionId: sessionData.id, questions, screen: 'playing', startTime: Date.now(), loadingQuestion: false, selectedOption: null, answerState: 'idle', xpGained: 0, pendingXp: 0 });
    } catch {
      const questions = getFallbackQuestions(categoryId, totalQ);
      const { data: sessionData } = await supabase
        .from('challenge_sessions')
        .insert({ wallet_address: walletAddress, category_id: categoryId, difficulty: 'medium', total_questions: totalQ, is_daily: isDaily, is_boss: isBoss })
        .select('id')
        .single();
      set({ sessionId: sessionData?.id ?? null, questions, screen: 'playing', startTime: Date.now(), loadingQuestion: false, selectedOption: null, answerState: 'idle', xpGained: 0, pendingXp: 0 });
    }
  }, [set]);

  const submitAnswer = useCallback(async (optionIndex: number) => {
    const s = stateRef.current;
    if (s.answerState !== 'idle' || !s.player || !s.walletAddress) return;
    const question = s.questions[s.currentQ];
    if (!question) return;
    const isCorrect = optionIndex === question.correct;

    // XP calculation with difficulty, streak bonus, and accuracy bonus
    let xp = 0;
    if (isCorrect) {
      xp = XP_BY_DIFFICULTY[question.difficulty] ?? 100;
      // Streak bonus: +10% per streak day, max +50%
      const streakBonus = Math.min(0.5, s.player.streak_days * 0.1);
      xp = Math.round(xp * (1 + streakBonus));
      // Accuracy bonus for 80%+ accuracy
      if (s.player.accuracy_rate >= 0.8) {
        xp = Math.round(xp * 1.1);
      }
    }

    const timeTaken = s.startTime ? Date.now() - s.startTime : 0;
    set({ selectedOption: optionIndex, answerState: 'selected' });
    await sleep(350);
    set({ answerState: 'revealing' });
    await sleep(500);
    set({ answerState: isCorrect ? 'correct' : 'wrong', pendingXp: xp, xpBurst: xp, xpBurstKey: Date.now() });
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
    set({ screen: 'dashboard', selectedOption: null, answerState: 'idle', sessionId: null, questions: [], currentQ: 0, sessionScore: 0, sessionCorrect: 0, xpGained: 0, pendingXp: 0, leveledUp: false, rankUp: false, newRankTier: null, streakContinued: false, masteryUp: false, newMasteryLevel: 0 });
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
    // All 6 outcomes: XP, Hint Token, Streak Shield, XP Boost, Mystery Box, Nothing
    const prizes = [
      { type: 'xp',           value: '25',           weight: 22, label: '+25 XP' },
      { type: 'xp',           value: '50',           weight: 18, label: '+50 XP' },
      { type: 'xp',           value: '100',          weight: 10, label: '+100 XP' },
      { type: 'xp',           value: '200',          weight: 5,  label: '+200 XP' },
      { type: 'hint_token',   value: '1',            weight: 12, label: 'Hint Token' },
      { type: 'streak_shield', value: '1',           weight: 8,  label: 'Streak Shield' },
      { type: 'xp_boost',     value: '2x_24h',       weight: 8,  label: 'XP Boost ×2 (24h)' },
      { type: 'mystery_box',  value: 'mystery',      weight: 7,  label: 'Mystery Box' },
      { type: 'nothing',      value: 'nothing',      weight: 10, label: 'Nothing' },
    ];
    const total = prizes.reduce((a, b) => a + b.weight, 0);
    let rand = Math.random() * total;
    const prize = prizes.find(p => (rand -= p.weight) <= 0) ?? prizes[0];

    // Record spin
    await recordSpin(walletAddress, prize.type, prize.value);

    // Apply reward
    if (prize.type === 'xp') {
      const xp = parseInt(prize.value);
      const newTotalXp = player.total_xp + xp;
      await updatePlayer(walletAddress, { total_xp: newTotalXp, level: levelForXp(newTotalXp), current_xp: xpInCurrentLevel(newTotalXp) });
    } else if (prize.type === 'hint_token') {
      await supabase.from('inventory_items').insert({ wallet_address: walletAddress, item_slug: 'hint_token', quantity: 1 });
    } else if (prize.type === 'streak_shield') {
      await updatePlayer(walletAddress, { streak_shield: true });
    } else if (prize.type === 'xp_boost') {
      const expiresAt = new Date(Date.now() + 24 * 3600000).toISOString();
      await supabase.from('inventory_items').insert({ wallet_address: walletAddress, item_slug: 'xp_boost_2x', quantity: 1, activated_at: new Date().toISOString(), expires_at: expiresAt, is_active: true });
    } else if (prize.type === 'mystery_box') {
      // Mystery box gives a random bonus: XP 50-500 or a rare item
      const mysteryRoll = Math.random();
      if (mysteryRoll < 0.5) {
        const bonusXp = [50, 100, 150, 200, 500][Math.floor(Math.random() * 5)];
        const newTotalXp = player.total_xp + bonusXp;
        await updatePlayer(walletAddress, { total_xp: newTotalXp, level: levelForXp(newTotalXp), current_xp: xpInCurrentLevel(newTotalXp) });
        prize.value = `${bonusXp}`;
        prize.label = `+${bonusXp} XP (Mystery!)`;
      } else if (mysteryRoll < 0.8) {
        await supabase.from('inventory_items').insert({ wallet_address: walletAddress, item_slug: 'hint_token', quantity: 3 });
        prize.label = '3× Hint Tokens (Mystery!)';
      } else {
        await supabase.from('inventory_items').insert({ wallet_address: walletAddress, item_slug: 'retry_ticket', quantity: 2 });
        prize.label = '2× Retry Tickets (Mystery!)';
      }
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

  const prevLevel       = s.player.level;
  const prevRankTier    = s.player.rank_tier;
  const prevMastery     = s.mastery.find(m => m.category_id === s.categoryId);
  const prevMastLvl     = prevMastery?.mastery_level ?? 0;

  const newTotalXp       = s.player.total_xp + s.sessionScore;
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
  let streakContinued = false;
  if (lastDay !== today) {
    if (lastDay === yesterday) {
      newStreak = s.player.streak_days + 1;
      streakContinued = true;
    } else {
      newStreak = 1;
    }
  }

  await updatePlayer(s.walletAddress, {
    total_xp: newTotalXp, current_xp: newCurrentXp, level: newLevel,
    rank_score: newRankScore, rank_tier: newRankTier,
    accuracy_rate: newAccuracy, total_correct: newTotalCorrect, total_answered: newTotalAnswered,
    streak_days: newStreak, last_activity_date: today, boss_wins: bossWins,
  });

  let newMasteryLevel = 0;
  let masteryUp = false;
  if (s.categoryId) {
    const existing = s.mastery.find(m => m.category_id === s.categoryId);
    const mastXp   = (existing?.mastery_xp ?? 0) + s.sessionScore;
    const mastLvl  = Math.min(10, Math.floor(mastXp / 500) + 1);
    newMasteryLevel = mastLvl;
    masteryUp = mastLvl > prevMastLvl;
    if (existing) {
      await supabase.from('category_mastery').update({
        mastery_xp: mastXp, mastery_level: mastLvl,
        total_correct: existing.total_correct + s.sessionCorrect,
        total_answered: existing.total_answered + s.questions.length,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('category_mastery').insert({
        wallet_address: s.walletAddress, category_id: s.categoryId,
        mastery_xp: mastXp, mastery_level: mastLvl,
        total_correct: s.sessionCorrect, total_answered: s.questions.length,
      });
    }
  }

  if (s.isDaily) {
    await supabase.from('daily_challenge_completions').upsert(
      { wallet_address: s.walletAddress, challenge_date: today, xp_awarded: s.sessionScore },
      { onConflict: 'wallet_address,challenge_date' }
    );
  }

  const categoriesPlayed = new Set([...s.mastery.map(m => m.category_id), s.categoryId ?? '']).size;
  const existingAchievement = s.achievements.map(a => a.achievement_id);
  await checkAndUnlockAchievements(s.walletAddress, {
    total_xp: newTotalXp, total_correct: newTotalCorrect, streak_days: newStreak,
    boss_wins: bossWins, level: newLevel, rank_tier: newRankTier,
    categoriesPlayed, hasPurchased: false, hasSpun: false, topWeekly: false,
  }, existingAchievement);

  await refreshPlayer();

  set({
    screen: 'complete',
    leveledUp: newLevel > prevLevel,
    rankUp: newRankTier !== prevRankTier,
    newRankTier: newRankTier !== prevRankTier ? newRankTier : null,
    streakContinued,
    masteryUp,
    newMasteryLevel,
  });
}

// suppress unused warning – CATEGORIES used in store for category count
void CATEGORIES;
