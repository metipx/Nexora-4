import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, Zap, CheckCircle2, XCircle, Lightbulb,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '../design-system/tokens';
import type { Question, AnswerState } from '../store/useGameStore';
import type { Player } from '../lib/supabase';
import { supabase, updatePlayer, levelForXp, xpInCurrentLevel, calculateRankScore, rankTierForScore } from '../lib/supabase';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface Props {
  player: Player;
  onBack: () => void;
  onComplete: (result: DailyResult) => void;
}

export interface DailyResult {
  score: number;
  correct: number;
  total: number;
  categoryId: string;
  categoryLabel: string;
  leveledUp: boolean;
  rankUp: boolean;
  newRankTier: string | null;
  streakContinued: boolean;
}

function ProgressRing({ pct, size, color }: { pct: number; size: number; color: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(28,38,64,0.8)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}

// Pick daily category deterministically by day of week
function getDailyCategory(player: Player) {
  const dayIndex = new Date().getDay();
  const unlocked = CATEGORIES.filter(c => c.unlockLevel <= player.level);
  return unlocked[dayIndex % unlocked.length] ?? unlocked[0] ?? CATEGORIES[0];
}

export default function DailyChallengePage({ player, onBack, onComplete }: Props) {
  const cat = getDailyCategory(player);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [pendingXp, setPendingXp] = useState(0);
  const [xpVisible, setXpVisible] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const prevXp = useRef(0);

  const totalQ = 5;

  // Load questions
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase
          .from('challenge_sessions')
          .insert({
            wallet_address: player.wallet_address,
            category_id: cat.id,
            difficulty: 'medium',
            total_questions: totalQ,
            is_daily: true,
            is_boss: false,
          })
          .select('id')
          .single();
        if (!cancelled) setSessionId(sessionData?.id ?? null);

        const qs = await loadDailyQuestions(cat.id, player.level, totalQ);
        if (!cancelled) { setQuestions(qs); setLoading(false); }
      } catch {
        if (!cancelled) { setError('Failed to load daily challenge'); setLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [player.wallet_address, cat.id, player.level]);

  const question = questions[currentQ];

  useEffect(() => {
    if (answerState === 'correct' && pendingXp > 0 && pendingXp !== prevXp.current) {
      prevXp.current = pendingXp;
      setXpVisible(true);
      setTimeout(() => setXpVisible(false), 900);
    }
  }, [answerState, pendingXp]);

  useEffect(() => { setShowHint(false); }, [currentQ]);

  const isRevealed   = ['correct', 'wrong', 'revealing'].includes(answerState);
  const isCorrect    = answerState === 'correct';
  const isWrong      = answerState === 'wrong';
  const canProceed   = isCorrect || isWrong;

  const handleSubmit = useCallback(async (idx: number) => {
    if (answerState !== 'idle' || !question) return;
    const correct = idx === question.correct;

    // XP: base + streak bonus + daily bonus
    let xp = 0;
    if (correct) {
      const baseXp = { easy: 50, medium: 100, hard: 175, very_hard: 275 }[question.difficulty] ?? 100;
      const streakBonus = Math.min(0.5, player.streak_days * 0.1);
      xp = Math.round(baseXp * (1 + streakBonus) * 1.5); // 1.5x daily bonus
    }

    const timeTaken = Date.now() - startTimeRef.current;
    setSelectedOption(idx);
    setAnswerState('selected');
    await sleep(350);
    setAnswerState('revealing');
    await sleep(500);
    setAnswerState(correct ? 'correct' : 'wrong');
    setPendingXp(xp);

    if (sessionId) {
      await supabase.from('challenge_questions').insert({
        session_id: sessionId,
        wallet_address: player.wallet_address,
        category_id: cat.id,
        difficulty: question.difficulty,
        question_text: question.text,
        correct_answer: question.options[question.correct],
        player_answer: question.options[idx],
        is_correct: correct,
        time_taken_ms: timeTaken,
        xp_awarded: xp,
      });
    }

    setSessionScore(prev => prev + xp);
    setSessionCorrect(prev => prev + (correct ? 1 : 0));
  }, [answerState, question, player, cat.id, sessionId]);

  const handleNext = useCallback(async () => {
    const next = currentQ + 1;
    if (next >= totalQ) {
      await finalizeDaily(player, cat.id, sessionScore, sessionCorrect, totalQ, sessionId, onComplete);
    } else {
      setCurrentQ(next);
      setSelectedOption(null);
      setAnswerState('idle');
      setPendingXp(0);
      startTimeRef.current = Date.now();
    }
  }, [currentQ, player, cat.id, sessionScore, sessionCorrect, totalQ, sessionId, onComplete]);

  function getOptionStyle(idx: number): React.CSSProperties {
    const isSel  = selectedOption === idx;
    const isCorr = idx === question?.correct;
    if (!isRevealed) return isSel
      ? { background: 'rgba(124,92,252,0.18)', border: '2px solid rgba(124,92,252,0.6)', color: '#E6EDF7' }
      : { background: 'rgba(20,27,45,0.6)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.8)' };
    if (isCorr) return { background: 'rgba(0,200,150,0.12)', border: '2px solid rgba(0,200,150,0.5)', color: '#33E8B8' };
    if (isSel)  return { background: 'rgba(224,85,85,0.1)',   border: '2px solid rgba(224,85,85,0.45)', color: 'rgba(224,85,85,0.9)' };
    return { background: 'rgba(11,16,32,0.5)', border: '1px solid rgba(230,237,247,0.05)', color: 'rgba(230,237,247,0.3)' };
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 60%, #0B1020 100%)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', color: '#33E8B8' }}
        >
          <Sparkles size={28} />
        </motion.div>
        <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Preparing Daily Challenge...</div>
        <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>AI is generating questions for {cat.label}</div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 60%, #0B1020 100%)' }}>
        <XCircle size={32} style={{ color: '#FF7A50' }} />
        <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>{error ?? 'Something went wrong'}</div>
        <button className="nx-btn gap-2" onClick={onBack}><ChevronRight size={15} /> Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 60%, #0B1020 100%)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center gap-4"
        style={{ background: 'rgba(11,16,32,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(230,237,247,0.07)' }}
      >
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.08)', color: 'rgba(230,237,247,0.45)' }}
          onClick={onBack}
        >
          <X size={14} />
        </button>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-title font-bold" style={{ color: '#E6EDF7' }}>Q{currentQ + 1}</span>
              <span style={{ color: 'rgba(230,237,247,0.35)' }}>of {totalQ}</span>
              <span className="text-xs font-title font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,200,150,0.1)', color: '#33E8B8', border: '1px solid rgba(0,200,150,0.2)' }}>Daily</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={11} style={{ color: '#33E8B8' }} />
              <span className="font-title font-semibold" style={{ color: 'rgba(230,237,247,0.5)' }}>{sessionCorrect}/{currentQ}</span>
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(28,38,64,0.8)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(currentQ / totalQ) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #33E8B880, #33E8B8)', borderRadius: 2 }}
            />
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)' }}
        >
          <Zap size={11} style={{ color: '#9B81FF' }} />
          <span className="font-title font-bold text-xs" style={{ color: '#9B81FF' }}>{sessionScore}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 gap-6 max-w-2xl mx-auto w-full">
        {/* Category + XP burst */}
        <div className="flex items-center gap-3 w-full">
          <ProgressRing pct={((currentQ + 1) / totalQ) * 100} size={44} color="#33E8B8" />
          <div>
            <div className="text-xs font-semibold" style={{ color: '#33E8B8' }}>{cat.label}</div>
            <div className="text-xs" style={{ color: 'rgba(230,237,247,0.35)' }}>
              {question.difficulty.replace('_', ' ')} · Daily Bonus ×1.5
            </div>
          </div>
          <div className="ml-auto relative h-8 flex items-center">
            <AnimatePresence>
              {xpVisible && (
                <motion.span
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -28 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute font-title font-extrabold text-lg pointer-events-none"
                  style={{ color: '#9B81FF', textShadow: '0 0 12px rgba(124,92,252,0.8)' }}
                >
                  +{pendingXp} XP
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-2xl p-6 md:p-7 relative overflow-hidden"
            style={{
              background: isCorrect
                ? 'linear-gradient(145deg, rgba(0,200,150,0.07), rgba(28,38,64,0.95))'
                : isWrong
                ? 'linear-gradient(145deg, rgba(224,85,85,0.06), rgba(28,38,64,0.95))'
                : 'linear-gradient(145deg, rgba(28,38,64,0.95), rgba(20,27,45,0.98))',
              border: isCorrect
                ? '1px solid rgba(0,200,150,0.2)'
                : isWrong
                ? '1px solid rgba(224,85,85,0.2)'
                : '1px solid #33E8B825',
              boxShadow: '0 0 40px #33E8B808',
            }}
          >
            <p className="font-title font-semibold leading-relaxed" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', letterSpacing: '-0.01em', color: '#E6EDF7' }}>
              {question.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="w-full space-y-3">
          {question.options.map((opt, idx) => {
            const isCorr = idx === question.correct;
            const isSel  = idx === selectedOption;
            return (
              <motion.button
                key={idx}
                whileHover={answerState === 'idle' ? { x: 4, transition: { duration: 0.15 } } : {}}
                whileTap={answerState === 'idle' ? { scale: 0.98 } : {}}
                disabled={answerState !== 'idle'}
                onClick={() => answerState === 'idle' && handleSubmit(idx)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left"
                style={{
                  ...getOptionStyle(idx),
                  cursor: answerState !== 'idle' ? 'default' : 'pointer',
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-title font-bold text-sm flex-shrink-0"
                  style={
                    isRevealed && isCorr
                      ? { background: 'rgba(0,200,150,0.2)', color: '#33E8B8' }
                      : isRevealed && isSel && !isCorr
                      ? { background: 'rgba(224,85,85,0.15)', color: 'rgba(224,85,85,0.9)' }
                      : { background: 'rgba(11,16,32,0.7)', color: 'rgba(230,237,247,0.45)' }
                  }
                >
                  {isRevealed && isCorr ? <CheckCircle2 size={16} /> : isRevealed && isSel && !isCorr ? <XCircle size={16} /> : OPTION_LABELS[idx]}
                </div>
                <span className="flex-1 text-sm md:text-base font-medium leading-snug">{opt}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full rounded-2xl p-5 space-y-2"
              style={{
                background: isCorrect ? 'rgba(0,200,150,0.08)' : 'rgba(224,85,85,0.07)',
                border: `1px solid ${isCorrect ? 'rgba(0,200,150,0.25)' : 'rgba(224,85,85,0.2)'}`,
              }}
            >
              <div className="flex items-center gap-2.5">
                {isCorrect
                  ? <CheckCircle2 size={16} style={{ color: '#33E8B8', flexShrink: 0 }} />
                  : <XCircle size={16} style={{ color: 'rgba(224,85,85,0.9)', flexShrink: 0 }} />
                }
                <span className="font-title font-bold text-sm" style={{ color: isCorrect ? '#33E8B8' : 'rgba(224,85,85,0.9)' }}>
                  {isCorrect ? `Correct! +${pendingXp} XP` : 'Incorrect'}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(230,237,247,0.6)' }}>{question.explanation}</p>
              {isWrong && !showHint && (
                <button
                  className="flex items-center gap-1.5 text-xs transition-colors mt-1"
                  style={{ color: 'rgba(230,237,247,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#33DEFF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
                  onClick={() => setShowHint(true)}
                >
                  <Lightbulb size={12} /> Show correct answer
                </button>
              )}
              {showHint && isWrong && (
                <div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#33E8B8' }}>
                  <CheckCircle2 size={12} /> Correct: <strong>{question.options[question.correct]}</strong>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        <AnimatePresence>
          {canProceed && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full h-14 rounded-xl font-title font-bold text-base flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #00C896, #33E8B8)', color: '#0B1020' }}
              onClick={handleNext}
            >
              {currentQ + 1 >= totalQ ? 'See Results' : 'Next Question'} <ChevronRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function loadDailyQuestions(categoryId: string, level: number, count: number): Promise<Question[]> {
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

function getFallbackQuestions(categoryId: string, count: number): Question[] {
  const all: Record<string, Question[]> = {
    tech_ai: [
      { text: 'What does "LLM" stand for in AI?', options: ['Large Language Model', 'Long Learning Machine', 'Linear Logic Module', 'Local Learning Matrix'], correct: 0, explanation: 'LLM stands for Large Language Model.', difficulty: 'easy' },
      { text: 'Which company created ChatGPT?', options: ['Google', 'Meta', 'OpenAI', 'Anthropic'], correct: 2, explanation: 'ChatGPT was created by OpenAI.', difficulty: 'easy' },
      { text: 'What is the main purpose of a transformer architecture?', options: ['Image recognition', 'Sequential data processing with attention', 'Database indexing', 'Network routing'], correct: 1, explanation: 'Transformers use self-attention for sequential data.', difficulty: 'medium' },
      { text: 'What is "overfitting" in ML?', options: ['Model too simple', 'Model memorizes training data', 'Too much data', 'Slow training'], correct: 1, explanation: 'Overfitting means poor generalization to new data.', difficulty: 'medium' },
      { text: 'Best for image classification?', options: ['RNN', 'LSTM', 'CNN', 'Transformer'], correct: 2, explanation: 'CNNs excel at spatial feature extraction.', difficulty: 'medium' },
    ],
    programming: [
      { text: 'Time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2, explanation: 'Binary search halves the search space each step.', difficulty: 'easy' },
      { text: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Heap', 'Linked List'], correct: 1, explanation: 'Stack uses Last In, First Out.', difficulty: 'easy' },
      { text: 'What is a "deadlock"?', options: ['Memory leak', 'Two processes waiting forever', 'CPU overheating', 'Disk full'], correct: 1, explanation: 'Deadlock: processes block each other forever.', difficulty: 'medium' },
      { text: 'TCP vs UDP difference?', options: ['Speed vs security', 'Reliable vs unreliable', 'IPv4 vs IPv6', 'HTTP vs HTTPS'], correct: 1, explanation: 'TCP guarantees delivery; UDP is best-effort.', difficulty: 'medium' },
      { text: 'Max nodes at level k in binary tree?', options: ['k', '2^k', '2^(k-1)', 'k²'], correct: 2, explanation: 'Level k has at most 2^(k-1) nodes.', difficulty: 'hard' },
    ],
    history: [
      { text: 'In what year did WWII end?', options: ['1943', '1944', '1945', '1946'], correct: 2, explanation: 'WWII ended in 1945.', difficulty: 'easy' },
      { text: 'First US President?', options: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'], correct: 2, explanation: 'George Washington served 1789-1797.', difficulty: 'easy' },
      { text: 'Great Wall primarily built during which dynasty?', options: ['Han', 'Tang', 'Ming', 'Qin'], correct: 2, explanation: 'Most surviving wall is from the Ming Dynasty.', difficulty: 'medium' },
      { text: 'Berlin Wall fell in?', options: ['1987', '1989', '1991', '1993'], correct: 1, explanation: 'The Berlin Wall fell November 9, 1989.', difficulty: 'easy' },
      { text: 'Who wrote the Declaration of Independence?', options: ['Franklin', 'Adams', 'Jefferson', 'Madison'], correct: 2, explanation: 'Thomas Jefferson was the principal author.', difficulty: 'easy' },
    ],
    geography: [
      { text: 'Capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2, explanation: 'Canberra is the capital.', difficulty: 'easy' },
      { text: 'Largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2, explanation: 'Pacific covers 30%+ of Earth.', difficulty: 'easy' },
      { text: 'Amazon River primarily in?', options: ['Peru', 'Colombia', 'Brazil', 'Venezuela'], correct: 2, explanation: 'Most of the Amazon is in Brazil.', difficulty: 'easy' },
      { text: 'Longest river?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1, explanation: 'The Nile is ~6,650 km.', difficulty: 'easy' },
      { text: 'Country with most natural lakes?', options: ['Russia', 'United States', 'Canada', 'Finland'], correct: 2, explanation: 'Canada has ~879,000 lakes.', difficulty: 'hard' },
    ],
    science_astronomy: [
      { text: 'Chemical formula for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], correct: 0, explanation: 'Water is H₂O.', difficulty: 'easy' },
      { text: 'Which planet is the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2, explanation: 'Mars appears red from iron oxide.', difficulty: 'easy' },
      { text: 'Speed of light in vacuum?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '200,000 km/s'], correct: 0, explanation: '~299,792 km/s.', difficulty: 'medium' },
      { text: 'Element with atomic number 79?', options: ['Silver', 'Gold', 'Platinum', 'Copper'], correct: 1, explanation: 'Gold (Au) is element 79.', difficulty: 'medium' },
      { text: 'Powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correct: 2, explanation: 'Mitochondria produce ATP.', difficulty: 'easy' },
    ],
    business_economics: [
      { text: 'What does GDP stand for?', options: ['Gross Domestic Product', 'Global Development Plan', 'General Debt Portfolio', 'Gross Dividend Payment'], correct: 0, explanation: 'GDP measures total goods/services produced.', difficulty: 'easy' },
      { text: 'What is inflation?', options: ['Rise in prices over time', 'Increase in wages', 'Stock market crash', 'Currency devaluation'], correct: 0, explanation: 'Sustained increase in general price level.', difficulty: 'easy' },
      { text: 'What is a bear market?', options: ['Rising prices', 'Falling prices (20%+ decline)', 'Sideways trading', 'High volatility'], correct: 1, explanation: 'Bear market = 20%+ drop from highs.', difficulty: 'medium' },
      { text: 'What does IPO stand for?', options: ['Initial Public Offering', 'International Portfolio Option', 'Internal Profit Objective', 'Investor Purchase Order'], correct: 0, explanation: 'IPO = first public share sale.', difficulty: 'easy' },
      { text: 'What is the Federal Reserve?', options: ['US Treasury', 'Central bank of the US', 'Stock exchange', 'Investment bank'], correct: 1, explanation: 'The Fed is the US central bank.', difficulty: 'easy' },
    ],
    sports: [
      { text: 'Players on a soccer team?', options: ['9', '10', '11', '12'], correct: 2, explanation: 'A soccer team fields 11 players.', difficulty: 'easy' },
      { text: 'First modern Olympics city?', options: ['Paris', 'London', 'Athens', 'Rome'], correct: 2, explanation: 'Athens, Greece in 1896.', difficulty: 'medium' },
      { text: 'Max score in single dart throw?', options: ['50', '60', '100', '180'], correct: 1, explanation: 'Triple-20 = 60 points.', difficulty: 'hard' },
      { text: 'How many Grand Slam tournaments?', options: ['3', '4', '5', '6'], correct: 1, explanation: 'Australian, French, Wimbledon, US Open.', difficulty: 'easy' },
      { text: 'Most FIFA World Cup wins?', options: ['Germany', 'Argentina', 'Italy', 'Brazil'], correct: 3, explanation: 'Brazil has won 5 World Cups.', difficulty: 'easy' },
    ],
    cinema_entertainment: [
      { text: 'Who directed "Inception"?', options: ['Christopher Nolan', 'Steven Spielberg', 'James Cameron', 'Martin Scorsese'], correct: 0, explanation: 'Christopher Nolan directed Inception (2010).', difficulty: 'easy' },
      { text: 'First Best Picture Oscar winner?', options: ['Gone with the Wind', 'Wings', 'Citizen Kane', 'The Jazz Singer'], correct: 1, explanation: 'Wings won in 1929.', difficulty: 'hard' },
      { text: 'Who played Iron Man in MCU?', options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'], correct: 2, explanation: 'RDJ portrayed Tony Stark.', difficulty: 'easy' },
      { text: 'Highest-grossing film?', options: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars'], correct: 0, explanation: 'Avatar (2009) is highest-grossing.', difficulty: 'easy' },
      { text: 'Band that wrote "Bohemian Rhapsody"?', options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'], correct: 2, explanation: 'Queen released it in 1975.', difficulty: 'easy' },
    ],
    english: [
      { text: 'Past tense of "go"?', options: ['Goed', 'Went', 'Gone', 'Going'], correct: 1, explanation: '"Went" is the simple past.', difficulty: 'easy' },
      { text: 'Synonym for "ephemeral"?', options: ['Permanent', 'Fleeting', 'Massive', 'Ancient'], correct: 1, explanation: 'Ephemeral = lasting a very short time.', difficulty: 'medium' },
      { text: 'Figure of speech: "time is money"?', options: ['Simile', 'Metaphor', 'Personification', 'Hyperbole'], correct: 1, explanation: 'Direct equation without "like" or "as".', difficulty: 'medium' },
      { text: 'Which uses subjunctive mood?', options: ['I was there', 'If I were rich', 'She walks daily', 'They had gone'], correct: 1, explanation: '"If I were" is subjunctive.', difficulty: 'hard' },
      { text: 'Longest English word?', options: ['Antidisestablishmentarianism', 'Pneumonoultramicroscopicsilicovolcanoconiosis', 'Supercalifragilisticexpialidocious', 'Hippopotomonstrosesquippedaliophobia'], correct: 1, explanation: '45 letters: a lung disease.', difficulty: 'hard' },
    ],
    logic_problem: [
      { text: 'If all A are B, and all B are C, then?', options: ['Some A are C', 'All A are C', 'No A are C', 'Cannot determine'], correct: 1, explanation: 'A⊆B and B⊆C implies A⊆C.', difficulty: 'easy' },
      { text: 'Next: 2, 4, 8, 16, __?', options: ['24', '28', '32', '36'], correct: 2, explanation: 'Each doubles: 16×2=32.', difficulty: 'easy' },
      { text: 'Most sides: hexagon, octagon, pentagon, heptagon?', options: ['Hexagon (6)', 'Octagon (8)', 'Pentagon (5)', 'Heptagon (7)'], correct: 1, explanation: 'Octagon has 8 sides.', difficulty: 'easy' },
      { text: 'Tom is father of Sam. Sam is brother of Alice. Tom to Alice?', options: ['Uncle', 'Grandfather', 'Father', 'Brother'], correct: 2, explanation: 'Tom is Alice\'s father.', difficulty: 'easy' },
      { text: '3L and 5L jugs to measure 4L?', options: ['Fill 5L, pour into 3L; empty 3L; pour 2L into 3L; fill 5L; pour 1L to 3L — 4L remains', 'Fill 3L twice', 'Fill 5L, pour 1L out', 'Impossible'], correct: 0, explanation: 'Classic water pouring puzzle.', difficulty: 'hard' },
    ],
    culture_art: [
      { text: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'], correct: 2, explanation: 'Leonardo, c.1503-1519.', difficulty: 'easy' },
      { text: 'Art movement with Monet and Renoir?', options: ['Cubism', 'Impressionism', 'Surrealism', 'Baroque'], correct: 1, explanation: 'They were leading Impressionists.', difficulty: 'easy' },
      { text: 'Sistine Chapel ceiling by?', options: ['Leonardo', 'Raphael', 'Michelangelo', 'Botticelli'], correct: 2, explanation: 'Michelangelo, 1508-1512.', difficulty: 'easy' },
      { text: 'Style with flying buttresses?', options: ['Romanesque', 'Gothic', 'Renaissance', 'Brutalist'], correct: 1, explanation: 'Gothic architecture feature.', difficulty: 'medium' },
      { text: 'Museum housing The Starry Night?', options: ['Louvre', 'Metropolitan', 'MoMA', 'Uffizi'], correct: 2, explanation: 'At MoMA in New York.', difficulty: 'medium' },
    ],
    general_knowledge: [
      { text: 'Tallest mountain?', options: ['K2', 'Mount Kilimanjaro', 'Mount Everest', 'Denali'], correct: 2, explanation: 'Everest is 8,849m.', difficulty: 'easy' },
      { text: 'Who invented the telephone?', options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Guglielmo Marconi'], correct: 2, explanation: 'Bell in 1876.', difficulty: 'easy' },
      { text: 'Smallest country?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correct: 1, explanation: 'Vatican City is 0.44 km².', difficulty: 'easy' },
      { text: 'Bones in adult human body?', options: ['206', '208', '210', '212'], correct: 0, explanation: '206 bones.', difficulty: 'medium' },
      { text: 'Hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], correct: 2, explanation: 'Diamond = 10 on Mohs scale.', difficulty: 'easy' },
    ],
  };
  const pool = all[categoryId] ?? all.general_knowledge;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

async function finalizeDaily(
  player: Player,
  categoryId: string,
  sessionScore: number,
  sessionCorrect: number,
  totalQ: number,
  sessionId: string | null,
  onComplete: (result: DailyResult) => void,
) {
  const duration = Math.floor((Date.now() - Date.now()) / 1000);
  if (sessionId) {
    await supabase.from('challenge_sessions').update({ score: sessionScore, correct_count: sessionCorrect, duration_seconds: duration }).eq('id', sessionId);
  }

  const prevLevel = player.level;
  const prevRankTier = player.rank_tier;

  const newTotalXp = player.total_xp + sessionScore;
  const newTotalAnswered = player.total_answered + totalQ;
  const newTotalCorrect = player.total_correct + sessionCorrect;
  const newAccuracy = newTotalAnswered > 0 ? newTotalCorrect / newTotalAnswered : 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastDay = player.last_activity_date;
  let newStreak = player.streak_days;
  let streakContinued = false;
  if (lastDay !== today) {
    if (lastDay === yesterday) {
      newStreak = player.streak_days + 1;
      streakContinued = true;
    } else {
      newStreak = 1;
    }
  }

  // Streak milestone bonus XP
  let streakBonusXp = 0;
  if (newStreak === 3) streakBonusXp = 100;
  else if (newStreak === 7) streakBonusXp = 300;
  else if (newStreak === 14) streakBonusXp = 750;
  else if (newStreak === 30) streakBonusXp = 2000;

  const finalTotalXp = newTotalXp + streakBonusXp;
  const finalLevel = levelForXp(finalTotalXp);

  const newRankScore = calculateRankScore({ total_xp: finalTotalXp, accuracy_rate: newAccuracy, total_correct: newTotalCorrect, streak_days: newStreak, boss_wins: player.boss_wins });
  const newRankTier = rankTierForScore(newRankScore);

  await updatePlayer(player.wallet_address, {
    total_xp: finalTotalXp, current_xp: xpInCurrentLevel(finalTotalXp), level: finalLevel,
    rank_score: newRankScore, rank_tier: newRankTier,
    accuracy_rate: newAccuracy, total_correct: newTotalCorrect, total_answered: newTotalAnswered,
    streak_days: newStreak, last_activity_date: today,
  });

  // Mark daily done
  await supabase.from('daily_challenge_completions').upsert(
    { wallet_address: player.wallet_address, challenge_date: today, xp_awarded: sessionScore + streakBonusXp },
    { onConflict: 'wallet_address,challenge_date' }
  );

  // Category mastery update
  const { data: existingMastery } = await supabase
    .from('category_mastery')
    .select('*')
    .eq('wallet_address', player.wallet_address)
    .eq('category_id', categoryId)
    .maybeSingle();

  if (existingMastery) {
    const mastXp = existingMastery.mastery_xp + sessionScore;
    const mastLvl = Math.min(10, Math.floor(mastXp / 500) + 1);
    await supabase.from('category_mastery').update({
      mastery_xp: mastXp, mastery_level: mastLvl,
      total_correct: existingMastery.total_correct + sessionCorrect,
      total_answered: existingMastery.total_answered + totalQ,
      updated_at: new Date().toISOString(),
    }).eq('id', existingMastery.id);
  } else {
    await supabase.from('category_mastery').insert({
      wallet_address: player.wallet_address, category_id: categoryId,
      mastery_xp: sessionScore, mastery_level: 1,
      total_correct: sessionCorrect, total_answered: totalQ,
    });
  }

  const cat = CATEGORIES.find(c => c.id === categoryId);
  onComplete({
    score: sessionScore + streakBonusXp,
    correct: sessionCorrect,
    total: totalQ,
    categoryId,
    categoryLabel: cat?.label ?? categoryId,
    leveledUp: finalLevel > prevLevel,
    rankUp: newRankTier !== prevRankTier,
    newRankTier: newRankTier !== prevRankTier ? newRankTier : null,
    streakContinued,
  });
}
