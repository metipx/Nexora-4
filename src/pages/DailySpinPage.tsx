import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dices, Zap, Shield, Lightbulb, Gift, XCircle, Sparkles,
  Trophy, Flame, TrendingUp, Star, X,
} from 'lucide-react';
import type { Player } from '../lib/supabase';

interface Props {
  player: Player;
  onBack: () => void;
  onSpinComplete?: () => void;
}

interface SpinOutcome {
  type: string;
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

const OUTCOMES: SpinOutcome[] = [
  { type: 'xp',          value: '25',      label: '+25 XP',        color: '#9B81FF', icon: <Zap size={20} />,        description: 'Small XP boost to keep you moving.' },
  { type: 'xp',          value: '50',      label: '+50 XP',        color: '#7C5CFC', icon: <Zap size={20} />,        description: 'A solid chunk of XP toward your next level.' },
  { type: 'xp',          value: '100',     label: '+100 XP',       color: '#33DEFF', icon: <Zap size={20} />,        description: 'Nice! That\'s a full easy question worth.' },
  { type: 'xp',          value: '200',     label: '+200 XP',       color: '#FFD080', icon: <Zap size={20} />,        description: 'Huge XP drop! Almost a hard question worth.' },
  { type: 'hint_token',  value: '1',       label: 'Hint Token',    color: '#33E8B8', icon: <Lightbulb size={20} />,  description: 'Reveal one option during any challenge.' },
  { type: 'streak_shield', value: '1',     label: 'Streak Shield', color: '#FF6B6B', icon: <Shield size={20} />,     description: 'Protects your streak for one missed day.' },
  { type: 'xp_boost',    value: '2x_24h',  label: 'XP Boost ×2',   color: '#FFB84D', icon: <TrendingUp size={20} />, description: 'Double XP on all answers for 24 hours.' },
  { type: 'mystery_box', value: 'mystery', label: 'Mystery Box',   color: '#B9F2FF', icon: <Gift size={20} />,       description: 'Could be anything from 50-500 XP or rare items!' },
  { type: 'nothing',     value: 'nothing', label: 'Nothing',       color: 'rgba(230,237,247,0.25)', icon: <XCircle size={20} />, description: 'Better luck tomorrow!' },
];

// Wheel segment colors
const SEGMENT_COLORS = [
  '#9B81FF', '#7C5CFC', '#33DEFF', '#FFD080',
  '#33E8B8', '#FF6B6B', '#FFB84D', '#B9F2FF',
  'rgba(230,237,247,0.15)',
];

export default function DailySpinPage({ player, onBack, onSpinComplete }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const alreadySpun = player.spin_last_date === today;

  const [spinning, setSpinning]   = useState(false);
  const [rotation, setRotation]   = useState(0);
  const [result, setResult]       = useState<SpinOutcome | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);
  const [streakBonus, setStreakBonus] = useState(0);

  // Streak milestone check
  useEffect(() => {
    if (player.streak_days >= 30) setStreakBonus(500);
    else if (player.streak_days >= 14) setStreakBonus(200);
    else if (player.streak_days >= 7) setStreakBonus(100);
    else if (player.streak_days >= 3) setStreakBonus(50);
  }, [player.streak_days]);

  const spin = useCallback(async () => {
    if (alreadySpun || spinning || result) return;
    setSpinning(true);
    setShowResult(false);

    // Random outcome weighted
    const weights = [22, 18, 10, 5, 12, 8, 8, 7, 10];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let outcomeIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { outcomeIndex = i; break; }
    }

    const outcome = OUTCOMES[outcomeIndex];

    // Calculate rotation to land on segment
    const segmentAngle = 360 / OUTCOMES.length;
    const targetAngle = 360 * 5 + (outcomeIndex * segmentAngle) + Math.random() * (segmentAngle - 5) + 2.5;
    const finalRotation = rotation + targetAngle + 360 * 3; // at least 3 extra spins

    setRotation(finalRotation);

    // Wait for spin animation
    await new Promise(r => setTimeout(r, 4200));

    setSpinning(false);
    setResult(outcome);
    setShowResult(true);

    // Particles for good outcomes
    if (outcome.type !== 'nothing') {
      const newParticles = Array.from({ length: 24 }).map((_, i) => ({
        id: Date.now() + i,
        x: 50 + (Math.random() - 0.5) * 60,
        y: 50 + (Math.random() - 0.5) * 40,
        color: outcome.color,
        delay: i * 0.03,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 3000);
    }

    // Call the store's handleSpin via parent
    if (onSpinComplete) {
      onSpinComplete();
    }
  }, [alreadySpun, spinning, result, rotation, onSpinComplete]);

  const canSpin = !alreadySpun && !spinning && !result;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 50%, #0B1020 100%)' }}
    >
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
        <div className="flex-1">
          <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Daily Spin</div>
          <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>One spin every 24 hours</div>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.2)' }}
        >
          <Flame size={11} style={{ color: '#FFD080' }} />
          <span className="font-title font-bold text-xs" style={{ color: '#FFD080' }}>{player.streak_days}d</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 gap-8 max-w-xl mx-auto w-full relative">

        {/* Streak bonus banner */}
        {streakBonus > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}
          >
            <Flame size={18} style={{ color: '#FFD080' }} />
            <div className="flex-1">
              <div className="font-title font-bold text-xs" style={{ color: '#FFD080' }}>Streak Bonus Active</div>
              <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>+{streakBonus} bonus XP on all spins</div>
            </div>
          </motion.div>
        )}

        {/* Wheel */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex-shrink-0">
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: spinning ? 'radial-gradient(circle, rgba(124,92,252,0.15), transparent 70%)' : 'none',
              filter: 'blur(20px)',
              transition: 'all 0.5s',
            }}
          />

          {/* Wheel */}
          <motion.div
            className="w-full h-full rounded-full relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {OUTCOMES.map((_outcome, i) => {
              const angle = (360 / OUTCOMES.length) * i;
              return (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 360 / OUTCOMES.length - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 360 / OUTCOMES.length - 90) * Math.PI / 180)}%)`,
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      background: SEGMENT_COLORS[i],
                      opacity: 0.18,
                    }}
                  />
                </div>
              );
            })}
            {/* Segment labels */}
            {OUTCOMES.map((outcome, i) => {
              const angle = (360 / OUTCOMES.length) * i + (360 / OUTCOMES.length) / 2;
              const rad = (angle - 90) * Math.PI / 180;
              const x = 50 + 32 * Math.cos(rad);
              const y = 50 + 32 * Math.sin(rad);
              return (
                <div
                  key={`label-${i}`}
                  className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: outcome.color,
                  }}
                >
                  <div style={{ transform: `rotate(${angle}deg)`, fontSize: '10px' }}>{outcome.icon}</div>
                  <span className="text-2xs font-title font-bold" style={{ transform: `rotate(${angle}deg)`, whiteSpace: 'nowrap' }}>
                    {outcome.label}
                  </span>
                </div>
              );
            })}
          </motion.div>

          {/* Center hub */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center z-10"
            style={{
              background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)',
              border: '3px solid rgba(230,237,247,0.15)',
              boxShadow: '0 0 30px rgba(124,92,252,0.4)',
            }}
          >
            <Dices size={24} style={{ color: '#fff' }} />
          </div>

          {/* Pointer */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '16px solid #FFD080',
              }}
            />
          </div>
        </div>

        {/* Spin button */}
        <div className="flex flex-col items-center gap-4 w-full">
          <motion.button
            whileHover={canSpin ? { scale: 1.03 } : {}}
            whileTap={canSpin ? { scale: 0.97 } : {}}
            className="w-full max-w-sm h-14 rounded-xl font-title font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden"
            style={{
              background: canSpin
                ? 'linear-gradient(135deg, #7C5CFC, #00D4FF)'
                : 'rgba(28,38,64,0.8)',
              color: canSpin ? '#fff' : 'rgba(230,237,247,0.3)',
              border: canSpin ? 'none' : '1px solid rgba(230,237,247,0.08)',
              boxShadow: canSpin ? '0 0 30px rgba(124,92,252,0.35)' : 'none',
              cursor: canSpin ? 'pointer' : 'not-allowed',
            }}
            disabled={!canSpin}
            onClick={spin}
          >
            {spinning ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={18} />
                </motion.div>
                Spinning...
              </>
            ) : alreadySpun ? (
              <><Star size={18} /> Already Spun Today</>
            ) : result ? (
              <><Star size={18} /> Spun Today</>
            ) : (
              <><Dices size={18} /> Spin the Wheel</>
            )}
          </motion.button>

          {alreadySpun && !result && (
            <div className="text-sm text-center" style={{ color: 'rgba(230,237,247,0.4)' }}>
              Come back tomorrow for another spin!
            </div>
          )}
        </div>

        {/* Result card */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center relative overflow-hidden"
              style={{
                background: result.type === 'nothing'
                  ? 'rgba(28,38,64,0.9)'
                  : `${result.color}12`,
                border: `1px solid ${result.type === 'nothing' ? 'rgba(230,237,247,0.1)' : result.color + '35'}`,
                boxShadow: result.type === 'nothing' ? 'none' : `0 0 40px ${result.color}15`,
              }}
            >
              {result.type !== 'nothing' && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${result.color}08, transparent 70%)` }} />
              )}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center relative z-10"
                style={{
                  background: result.type === 'nothing' ? 'rgba(11,16,32,0.8)' : `${result.color}18`,
                  border: `2px solid ${result.type === 'nothing' ? 'rgba(230,237,247,0.1)' : result.color + '40'}`,
                  color: result.type === 'nothing' ? 'rgba(230,237,247,0.3)' : result.color,
                }}
              >
                {result.icon}
              </motion.div>

              <div className="font-title font-extrabold text-2xl mb-1 relative z-10" style={{ color: result.type === 'nothing' ? 'rgba(230,237,247,0.4)' : result.color }}>
                {result.label}
              </div>
              <div className="text-sm relative z-10" style={{ color: 'rgba(230,237,247,0.5)' }}>
                {result.description}
              </div>

              {result.type !== 'nothing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 flex items-center justify-center gap-1.5 text-xs"
                  style={{ color: '#33E8B8' }}
                >
                  <Trophy size={12} /> Added to your inventory!
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outcomes legend */}
        <div className="w-full max-w-sm space-y-2">
          <div className="font-title font-bold text-xs mb-2" style={{ color: 'rgba(230,237,247,0.4)' }}>Possible Outcomes</div>
          <div className="grid grid-cols-2 gap-2">
            {OUTCOMES.map((o, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-xl"
                style={{ background: 'rgba(28,38,64,0.6)', border: '1px solid rgba(230,237,247,0.05)' }}
              >
                <div style={{ color: o.color }}>{o.icon}</div>
                <span className="text-2xs font-medium" style={{ color: 'rgba(230,237,247,0.6)' }}>{o.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.8],
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200 - 100,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' }}
              className="fixed pointer-events-none z-50"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 8px ${p.color}`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
