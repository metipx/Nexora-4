import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Zap, Flame, Trophy, Crown, Sparkles, Star, TrendingUp, Target,
  Calendar, ChevronRight, Sword, ShoppingBag, Shield, Lock, Award,
  FlaskConical, Clock, Cpu, Calculator, BookOpen, Globe, Lightbulb,
  BarChart3, CheckCircle2, User, Film, Palette, Code2,
} from 'lucide-react';
import { CATEGORIES, RANK_TIERS } from '../design-system/tokens';
import type { Player, ChallengeSession, Achievement } from '../lib/supabase';
import type { GameState } from '../store/useGameStore';

interface DashboardProps {
  state: GameState;
  onStartChallenge: (categoryId: string, opts?: { isDaily?: boolean; isBoss?: boolean }) => void;
  onGoToCategorySelect: () => void;
  onGoToLeaderboard: () => void;
  onGoToShop: () => void;
  onGoToProfile: () => void;
  onGoToAchievements: () => void;
  onGoToSettings: () => void;
  onGoToDailyChallenge?: () => void;
  onGoToDailySpin?: () => void;
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  tech_ai:             <Cpu size={20} />,
  programming:         <Code2 size={20} />,
  history:             <Clock size={20} />,
  geography:           <Globe size={20} />,
  science_astronomy:   <FlaskConical size={20} />,
  business_economics:  <TrendingUp size={20} />,
  sports:              <Trophy size={20} />,
  cinema_entertainment:<Film size={20} />,
  english:             <BookOpen size={20} />,
  logic_problem:       <Lightbulb size={20} />,
  culture_art:         <Palette size={20} />,
  general_knowledge:   <Zap size={20} />,
};

const ACHIEVEMENT_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  first_login:        { label: 'First Login',    icon: <User size={16} />,         color: '#33DEFF' },
  first_correct:      { label: 'First Answer',   icon: <CheckCircle2 size={16} />, color: '#33E8B8' },
  first_spin:         { label: 'First Spin',     icon: <Star size={16} />,         color: '#FFB84D' },
  streak_3:           { label: '3-Day Streak',   icon: <Flame size={16} />,        color: '#FF7A50' },
  streak_7:           { label: '7-Day Streak',   icon: <Flame size={16} />,        color: '#FFB84D' },
  level_5:            { label: 'Level 5',        icon: <Zap size={16} />,          color: '#9B81FF' },
  level_10:           { label: 'Level 10',       icon: <Zap size={16} />,          color: '#7C5CFC' },
  level_20:           { label: 'Level 20',       icon: <Crown size={16} />,        color: '#FFD080' },
  correct_10:         { label: '10 Correct',     icon: <Star size={16} />,         color: '#33E8B8' },
  correct_50:         { label: '50 Correct',     icon: <Award size={16} />,        color: '#B9F2FF' },
  categories_3:       { label: '3 Categories',   icon: <Globe size={16} />,        color: '#8FCDDD' },
  first_purchase:     { label: 'First Purchase', icon: <ShoppingBag size={16} />,  color: '#FFB84D' },
  xp_boost_used:      { label: 'XP Boosted',     icon: <Zap size={16} />,          color: '#9B81FF' },
  streak_shield_used: { label: 'Shield Used',    icon: <Shield size={16} />,       color: '#33E8B8' },
  boss_participated:  { label: 'Boss Fighter',   icon: <Sword size={16} />,        color: '#B9F2FF' },
  rank_gold:          { label: 'Gold Rank',      icon: <Trophy size={16} />,       color: '#FFD080' },
  top10_weekly:       { label: 'Top 10 Weekly',  icon: <TrendingUp size={16} />,   color: '#9B81FF' },
};

function rankInfo(tier: string) { return RANK_TIERS.find(r => r.id === tier) ?? RANK_TIERS[0]; }

function XpBar({ pct }: { pct: number }) {
  const [d, setD] = useState(0);
  useEffect(() => { const t = setTimeout(() => setD(pct), 300); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="nx-xp-bar-track nx-xp-bar-track-lg">
      <div className="nx-xp-bar-fill" style={{ width: `${d}%`, transition: 'width 1.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  );
}

function RankBadge({ tier, size = 'md' }: { tier: string; size?: 'sm' | 'md' }) {
  const info = rankInfo(tier);
  return (
    <div className={`nx-rank ${info.cssClass}`} style={size === 'sm' ? { fontSize: '0.7rem', padding: '2px 8px' } : {}}>
      <Crown size={size === 'sm' ? 9 : 11} /> {info.label}
    </div>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Card({ children, index = 0, className = '' }: { children: React.ReactNode; index?: number; className?: string }) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  );
}

export default function Dashboard({ state, onStartChallenge, onGoToCategorySelect, onGoToLeaderboard, onGoToShop, onGoToProfile, onGoToAchievements, onGoToSettings, onGoToDailyChallenge, onGoToDailySpin }: DashboardProps) {
  const { player, mastery, recentSessions, achievements, dailyDone, leaderboard, walletAddress, inventory } = state;
  if (!player) return null;

  const rank = rankInfo(player.rank_tier);
  const thresholds = [0,150,400,750,1200,1800,2600,3500,4600,6000];
  const lv    = player.level;
  const start = lv <= thresholds.length ? thresholds[lv - 1] : Math.floor(1000 * Math.pow(lv - 1, 1.6));
  const end   = (lv + 1) <= thresholds.length ? thresholds[lv] : Math.floor(1000 * Math.pow(lv, 1.6));
  const xpPct = Math.min(100, Math.round((player.current_xp / Math.max(1, end - start)) * 100));
  const activeItems = inventory.filter(i => i.is_active && (!i.expires_at || new Date(i.expires_at) > new Date()));

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 pb-10">

      {/* Identity card */}
      <Card index={0}>
        <div
          className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(28,38,64,0.95) 0%, rgba(20,27,45,0.98) 100%)',
            border: `1px solid rgba(124,92,252,0.2)`,
            boxShadow: `0 0 40px rgba(124,92,252,0.08)`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${rank.color}12 0%, transparent 70%)`, transform: 'translate(30%,-30%)' }}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-title font-extrabold text-2xl flex-shrink-0 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${rank.color}30, rgba(28,38,64,0.9))`,
                border: `2px solid ${rank.color}60`,
                color: rank.color,
                boxShadow: `0 0 24px ${rank.color}25`,
              }}
              onClick={onGoToProfile}
            >
              {player.username.slice(0, 2).toUpperCase()}
            </motion.div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-title font-extrabold text-xl md:text-2xl" style={{ color: '#E6EDF7', letterSpacing: '-0.03em' }}>
                  {player.username}
                </h2>
                <RankBadge tier={player.rank_tier} />
                {activeItems.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-title font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.25)', color: '#33E8B8' }}>
                    <Zap size={9} /> Boosted
                  </span>
                )}
              </div>
              <div className="text-xs font-mono" style={{ color: 'rgba(230,237,247,0.3)' }}>
                {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-6)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-title font-semibold" style={{ color: 'rgba(230,237,247,0.4)' }}>Level {player.level}</span>
                  <span className="font-title font-semibold text-sm" style={{ color: '#9B81FF' }}>
                    {player.current_xp.toLocaleString()} / {(end - start).toLocaleString()} XP
                  </span>
                </div>
                <XpBar pct={xpPct} />
                <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.25)' }}>
                  {(end - start - player.current_xp).toLocaleString()} XP to Level {player.level + 1}
                </div>
              </div>
            </div>

            {/* Rank score */}
            <div className="flex-shrink-0 text-right">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="font-title font-extrabold text-3xl md:text-4xl leading-none"
                style={{ color: rank.color, letterSpacing: '-0.04em' }}
              >
                {player.rank_score.toLocaleString()}
              </motion.div>
              <div className="text-xs font-title mt-1" style={{ color: 'rgba(230,237,247,0.35)' }}>Rank Score</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <Card index={1}>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: <Target size={15} />,       color: '#33E8B8', label: 'Accuracy',   value: `${Math.round(player.accuracy_rate * 100)}%` },
            { icon: <Zap size={15} />,          color: '#9B81FF', label: 'Total XP',   value: player.total_xp.toLocaleString() },
            { icon: <CheckCircle2 size={15} />, color: '#33DEFF', label: 'Correct',    value: player.total_correct.toLocaleString() },
            { icon: <Flame size={15} />,        color: '#FFB84D', label: 'Streak',     value: `${player.streak_days}d` },
            { icon: <BarChart3 size={15} />,    color: '#FFD080', label: 'Challenges', value: player.total_answered.toLocaleString() },
            { icon: <Sword size={15} />,        color: '#B9F2FF', label: 'Boss Wins',  value: player.boss_wins.toString() },
          ].map((s, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl p-3 md:p-4 flex flex-col items-center gap-2 text-center"
              style={{
                background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                border: '1px solid rgba(230,237,247,0.07)',
              }}
            >
              <div style={{ color: s.color }}>{s.icon}</div>
              <div
                className="font-title font-extrabold leading-none"
                style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', letterSpacing: '-0.03em', color: '#E6EDF7' }}
              >
                {s.value}
              </div>
              <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Daily challenge + Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card index={2}><DailyChallengeCard player={player} dailyDone={dailyDone} onStart={() => onGoToDailyChallenge?.()} /></Card>
        <Card index={3}><StreakCard player={player} /></Card>
      </div>

      {/* Category mastery */}
      <Card index={4}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Category Mastery</h3>
            <button
              onClick={onGoToCategorySelect}
              className="flex items-center gap-1 text-xs font-title font-medium transition-colors"
              style={{ color: 'rgba(230,237,247,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
            >
              All Categories <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => {
              const m       = mastery.find(x => x.category_id === cat.id);
              const locked  = cat.unlockLevel > player.level;
              const mastLvl = m?.mastery_level ?? 0;
              const mastXp  = m?.mastery_xp ?? 0;
              const mastPct = Math.min(100, Math.round(((mastXp % 500) / 500) * 100));
              const acc     = m && m.total_answered > 0 ? Math.round((m.total_correct / m.total_answered) * 100) : 0;
              return (
                <motion.div
                  key={cat.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={!locked ? { y: -3, transition: { duration: 0.2 } } : {}}
                  className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer"
                  style={{
                    background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                    border: '1px solid rgba(230,237,247,0.07)',
                    filter: locked ? 'grayscale(0.7) opacity(0.45)' : 'none',
                  }}
                  onClick={() => !locked && onStartChallenge(cat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}28`, color: cat.color }}
                    >
                      {locked ? <Lock size={16} style={{ color: 'rgba(230,237,247,0.25)' }} /> : CAT_ICONS[cat.id]}
                    </div>
                    {locked ? (
                      <span className="text-2xs font-title font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(230,237,247,0.06)', color: 'rgba(230,237,247,0.3)', border: '1px solid rgba(230,237,247,0.08)' }}>Lv {cat.unlockLevel}</span>
                    ) : mastLvl > 0 ? (
                      <span className="text-2xs font-title font-bold" style={{ color: cat.color }}>Mastery {mastLvl}</span>
                    ) : (
                      <span className="text-2xs font-title px-2 py-1 rounded-md" style={{ background: 'rgba(230,237,247,0.05)', color: 'rgba(230,237,247,0.25)' }}>Unplayed</span>
                    )}
                  </div>
                  <div>
                    <div className="font-title font-semibold text-sm mb-0.5" style={{ color: '#E6EDF7' }}>{cat.label}</div>
                    {!locked && mastLvl > 0 && <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>{acc}% accuracy</div>}
                  </div>
                  {!locked && (
                    <div className="space-y-1">
                      <div className="rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(11,16,32,0.8)' }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${mastPct}%`, background: `linear-gradient(90deg, ${cat.color}70, ${cat.color})` }} />
                      </div>
                      <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.25)' }}>{mastLvl > 0 ? `Mastery ${mastLvl}/10` : 'Start to earn mastery'}</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* History + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card index={5} className="lg:col-span-3"><RecentHistory sessions={recentSessions} /></Card>
        <Card index={6} className="lg:col-span-2"><ActivitySummary player={player} /></Card>
      </div>

      {/* Leaderboard + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card index={7}><LeaderboardPreview leaderboard={leaderboard} walletAddress={walletAddress!} onViewAll={onGoToLeaderboard} /></Card>
        <Card index={8}><AchievementsPreview achievements={achievements} onViewAll={onGoToAchievements} /></Card>
      </div>

      {/* Shop / Boss / Premium row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card index={9}><ShopCard onGoToShop={onGoToShop} /></Card>
        <Card index={10}><BossCard player={player} onStart={() => onStartChallenge('science', { isBoss: true })} /></Card>
        <Card index={11}><PremiumCard player={player} /></Card>
      </div>

      {/* Daily spin */}
      <Card index={12}><DailySpin player={player} /></Card>

      {/* Quick start */}
      <Card index={13}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Quick Start</h3>
            <button
              onClick={onGoToCategorySelect}
              className="flex items-center gap-1 text-xs font-title font-medium transition-colors"
              style={{ color: 'rgba(230,237,247,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
            >
              All Categories <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.filter(c => c.unlockLevel <= player.level).slice(0, 4).map((cat, i) => (
              <motion.button
                key={cat.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center"
                style={{
                  background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                  border: `1px solid ${cat.color}22`,
                }}
                onClick={() => onStartChallenge(cat.id)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}28`, color: cat.color }}
                >
                  {CAT_ICONS[cat.id]}
                </div>
                <div className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>{cat.label}</div>
                <span
                  className="text-2xs font-title font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.22)', color: '#9B81FF' }}
                >
                  Play
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function getDailyCategory(player: Player) {
  const dayIndex = new Date().getDay();
  const unlocked = CATEGORIES.filter(c => c.unlockLevel <= player.level);
  return unlocked[dayIndex % unlocked.length] ?? unlocked[0] ?? CATEGORIES[0];
}

function DailyChallengeCard({ player, dailyDone, onStart }: { player: Player; dailyDone: boolean; onStart: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const cat = getDailyCategory(player);
  useEffect(() => {
    function tick() {
      const now = new Date(), midnight = new Date(now);
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      setTimeLeft(`${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col gap-4"
      style={{
        background: 'linear-gradient(145deg, rgba(0,200,150,0.08), rgba(28,38,64,0.9) 60%, rgba(20,27,45,0.95))',
        border: '1px solid rgba(0,200,150,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', color: '#33E8B8' }}>
            <Calendar size={18} />
          </div>
          <div>
            <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Daily Challenge</div>
            <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Resets in {timeLeft}</div>
          </div>
        </div>
        {dailyDone ? (
          <span className="inline-flex items-center gap-1 text-xs font-title font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.25)', color: '#33E8B8' }}>
            <CheckCircle2 size={10} /> Done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-title font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)', color: '#FFD080' }}>
            ×1.5 XP
          </span>
        )}
      </div>

      {/* Daily category preview */}
      {!dailyDone && (
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}25` }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${cat.color}15`, color: cat.color }}
          >
            {CAT_ICONS[cat.id] ?? <Zap size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-title font-semibold text-xs truncate" style={{ color: cat.color }}>{cat.label}</div>
            <div className="text-2xs truncate" style={{ color: 'rgba(230,237,247,0.4)' }}>{cat.desc}</div>
          </div>
        </div>
      )}

      <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(230,237,247,0.5)' }}>
        {dailyDone
          ? "You've completed today's Daily Challenge. Come back tomorrow!"
          : `Today's challenge is ${cat.label}. 5 AI-generated questions with a ×1.5 XP bonus and streak rewards!`}
      </p>
      <button
        className="nx-btn w-full gap-2"
        style={dailyDone ? {} : { background: 'linear-gradient(135deg, #00C896, #33E8B8)', color: '#0B1020', fontWeight: 700 }}
        disabled={dailyDone}
        onClick={onStart}
      >
        {dailyDone ? <><CheckCircle2 size={15} /> Completed Today</> : <><Calendar size={15} /> Start Daily Challenge</>}
      </button>
    </div>
  );
}

function StreakCard({ player }: { player: Player }) {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const today = new Date().getDay();
  const adj   = today === 0 ? 6 : today - 1;
  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col gap-4"
      style={{
        background: 'linear-gradient(145deg, rgba(255,184,77,0.07), rgba(28,38,64,0.9) 60%, rgba(20,27,45,0.95))',
        border: '1px solid rgba(255,184,77,0.18)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,77,0.15)', border: '1px solid rgba(255,184,77,0.3)', color: '#FFD080' }}>
            <Flame size={18} />
          </div>
          <div>
            <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Daily Streak</div>
            <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Keep the fire burning</div>
          </div>
        </div>
        {player.streak_shield && (
          <span className="inline-flex items-center gap-1 text-xs font-title font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.25)', color: '#33E8B8' }}>
            <Shield size={10} /> Protected
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255,184,77,0.7))' }}>🔥</div>
        <div>
          <div className="font-title font-extrabold text-3xl leading-none" style={{ color: '#FFD080' }}>{player.streak_days}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(230,237,247,0.4)' }}>
            {player.streak_days === 0
              ? 'Start your streak today'
              : player.streak_days >= 7
              ? `×${Math.min(4, Math.floor(player.streak_days / 7) + 1)} XP multiplier`
              : `${7 - player.streak_days} days to ×2 XP`}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const active = i <= adj && player.streak_days > (adj - i);
          return (
            <div key={d} className="flex flex-col items-center gap-1">
              <div
                className="w-full aspect-square rounded-lg flex items-center justify-center"
                style={{
                  background: active ? 'rgba(255,184,77,0.22)' : 'rgba(11,16,32,0.8)',
                  border:     active ? '1px solid rgba(255,184,77,0.45)' : '1px solid rgba(230,237,247,0.06)',
                  boxShadow:  active ? '0 0 6px rgba(255,184,77,0.25)' : 'none',
                }}
              >
                {active && <Flame size={10} style={{ color: '#FFD080' }} />}
              </div>
              <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.25)' }}>{d}</span>
            </div>
          );
        })}
      </div>
      {/* Streak milestone rewards */}
      <div className="space-y-2">
        <div className="text-2xs font-title font-semibold" style={{ color: 'rgba(230,237,247,0.35)' }}>Milestone Rewards</div>
        <div className="flex gap-2">
          {[
            { day: 3,  reward: '+50 XP',    active: player.streak_days >= 3 },
            { day: 7,  reward: '+100 XP',   active: player.streak_days >= 7 },
            { day: 14, reward: '+200 XP',   active: player.streak_days >= 14 },
            { day: 30, reward: '+500 XP',   active: player.streak_days >= 30 },
          ].map(m => (
            <div
              key={m.day}
              className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl"
              style={{
                background: m.active ? 'rgba(0,200,150,0.1)' : 'rgba(11,16,32,0.6)',
                border: m.active ? '1px solid rgba(0,200,150,0.25)' : '1px solid rgba(230,237,247,0.06)',
              }}
            >
              <span className="text-2xs font-title font-bold" style={{ color: m.active ? '#33E8B8' : 'rgba(230,237,247,0.25)' }}>{m.day}d</span>
              <span className="text-2xs" style={{ color: m.active ? '#33E8B8' : 'rgba(230,237,247,0.3)' }}>{m.reward}</span>
              {m.active && <CheckCircle2 size={10} style={{ color: '#33E8B8' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TrendingUp size={13} style={{ color: '#33E8B8' }} />
        <span className="text-xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Streak bonus: +10% XP per day, max +50%</span>
      </div>
    </div>
  );
}

function RecentHistory({ sessions }: { sessions: ChallengeSession[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden h-full"
      style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(11,16,32,0.5)', borderBottom: '1px solid rgba(230,237,247,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <BarChart3 size={15} style={{ color: '#33DEFF' }} />
          <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Recent Challenges</span>
        </div>
        <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>{sessions.length} sessions</span>
      </div>
      <div>
        {sessions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Zap size={32} className="mx-auto mb-3" style={{ color: 'rgba(230,237,247,0.15)' }} />
            <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>No challenges yet — play your first one!</div>
          </div>
        ) : sessions.slice(0, 6).map((s, i) => {
          const cat = CATEGORIES.find(c => c.id === s.category_id);
          const acc = s.total_questions > 0 ? Math.round((s.correct_count / s.total_questions) * 100) : 0;
          return (
            <div
              key={s.id}
              className="flex items-center gap-4 px-5 py-3"
              style={{ borderBottom: i < Math.min(sessions.length, 6) - 1 ? '1px solid rgba(230,237,247,0.04)' : 'none' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cat?.color ?? '#9B81FF'}15`, color: cat?.color ?? '#9B81FF' }}>
                {CAT_ICONS[s.category_id] ?? <Zap size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-title font-semibold text-sm truncate" style={{ color: '#E6EDF7' }}>{cat?.label ?? s.category_id}</div>
                <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>
                  {s.correct_count}/{s.total_questions} correct · {acc}%
                  {s.is_daily && <span className="ml-2" style={{ color: '#FFD080' }}>Daily</span>}
                  {s.is_boss && <span className="ml-2" style={{ color: '#B9F2FF' }}>Boss</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-title font-bold text-sm" style={{ color: '#9B81FF' }}>+{s.score} XP</div>
                <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>{new Date(s.completed_at).toLocaleDateString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivitySummary({ player }: { player: Player }) {
  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col gap-4"
      style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={15} style={{ color: '#33E8B8' }} />
        <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Activity Summary</span>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Total XP Earned',  value: player.total_xp.toLocaleString(),              color: '#9B81FF' },
          { label: 'Correct Answers',  value: player.total_correct.toLocaleString(),          color: '#33E8B8' },
          { label: 'Total Answered',   value: player.total_answered.toLocaleString(),         color: '#33DEFF' },
          { label: 'Accuracy Rate',    value: `${Math.round(player.accuracy_rate * 100)}%`,   color: '#FFD080' },
          { label: 'Current Streak',   value: `${player.streak_days}d`,                       color: '#FFB84D' },
          { label: 'Boss Wins',        value: player.boss_wins.toString(),                    color: '#B9F2FF' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'rgba(230,237,247,0.5)' }}>{item.label}</span>
            <span className="font-title font-bold text-sm" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardPreview({ leaderboard, walletAddress, onViewAll }: { leaderboard: Player[]; walletAddress: string; onViewAll: () => void }) {
  const POS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <div
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(11,16,32,0.5)', borderBottom: '1px solid rgba(230,237,247,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <Trophy size={15} style={{ color: '#FFD080' }} />
          <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Global Leaderboard</span>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-title transition-colors"
          style={{ color: 'rgba(230,237,247,0.4)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
        >
          Full Board <ChevronRight size={11} />
        </button>
      </div>
      <div className="flex-1">
        {leaderboard.slice(0, 5).map((p, i) => {
          const isMe = p.wallet_address === walletAddress?.toLowerCase();
          const ri   = rankInfo(p.rank_tier);
          return (
            <div
              key={p.wallet_address}
              className="flex items-center gap-3 px-5 py-3"
              style={{
                background:   isMe ? 'rgba(124,92,252,0.08)' : i < 3 ? 'rgba(28,38,64,0.4)' : 'transparent',
                borderBottom: i < 4 ? '1px solid rgba(230,237,247,0.04)' : 'none',
              }}
            >
              <div className="w-6 text-center text-sm font-title font-bold" style={{ color: 'rgba(230,237,247,0.25)' }}>{POS[i + 1] ?? i + 1}</div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-title font-bold flex-shrink-0" style={{ background: ri.color + '25', color: ri.color }}>
                {p.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-title font-semibold text-sm truncate" style={{ color: isMe ? '#9B81FF' : '#E6EDF7' }}>
                  {p.username}{isMe && <span className="text-xs ml-1" style={{ color: '#9B81FF' }}>(you)</span>}
                </div>
                <div className="text-2xs font-title font-semibold" style={{ color: ri.color }}>{ri.label}</div>
              </div>
              <div className="font-title font-extrabold text-sm" style={{ color: '#E6EDF7' }}>{p.rank_score.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementsPreview({ achievements, onViewAll }: { achievements: Achievement[]; onViewAll: () => void }) {
  const ALL_IDS = Object.keys(ACHIEVEMENT_META);
  const unlocked = new Set(achievements.map(a => a.achievement_id));
  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col gap-4"
      style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={15} style={{ color: '#9B81FF' }} />
          <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Achievements</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{achievements.length}/{ALL_IDS.length}</span>
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-title transition-colors"
            style={{ color: 'rgba(230,237,247,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
          >
            View All <ChevronRight size={11} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {ALL_IDS.slice(0, 8).map(id => {
          const meta = ACHIEVEMENT_META[id]!;
          const done = unlocked.has(id);
          return (
            <div key={id} className="flex flex-col items-center gap-1.5" title={meta.label}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                style={{
                  background: done ? `${meta.color}18` : 'rgba(11,16,32,0.8)',
                  border:     done ? `1px solid ${meta.color}35` : '1px solid rgba(230,237,247,0.07)',
                  color:      done ? meta.color : 'rgba(230,237,247,0.2)',
                  boxShadow:  done ? `0 0 8px ${meta.color}20` : 'none',
                }}
              >
                {meta.icon}
                {done && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#00C896', border: '1px solid #0B1020' }}
                  >
                    <CheckCircle2 size={9} style={{ color: '#0B1020' }} />
                  </div>
                )}
              </div>
              <div className="text-2xs text-center leading-tight" style={{ color: 'rgba(230,237,247,0.35)' }}>{meta.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShopCard({ onGoToShop }: { onGoToShop: () => void }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.25)', color: '#FFB84D' }}>
          <ShoppingBag size={16} />
        </div>
        <div>
          <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>RITUAL Shop</div>
          <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Spend your tokens</div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { name: 'XP Boost ×2',   price: '0.01', color: '#9B81FF', icon: <Zap size={13} /> },
          { name: 'Streak Shield', price: '0.02', color: '#33E8B8', icon: <Shield size={13} /> },
          { name: 'Boss Ticket',   price: '0.2',  color: '#B9F2FF', icon: <Sword size={13} /> },
        ].map(item => (
          <div key={item.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(11,16,32,0.5)', border: '1px solid rgba(230,237,247,0.05)' }}>
            <div className="flex items-center gap-2.5" style={{ color: item.color }}>{item.icon}<span className="text-sm font-medium" style={{ color: 'rgba(230,237,247,0.75)' }}>{item.name}</span></div>
            <span className="text-xs font-title font-bold" style={{ color: item.color }}>{item.price} RITUAL</span>
          </div>
        ))}
      </div>
      <button
        className="nx-btn nx-btn-sm w-full gap-2"
        style={{ border: '1px solid rgba(255,184,77,0.25)', color: '#FFB84D', background: 'rgba(255,184,77,0.07)' }}
        onClick={onGoToShop}
      >
        <ShoppingBag size={13} /> Visit Shop
      </button>
    </div>
  );
}

function BossCard({ player, onStart }: { player: Player; onStart: () => void }) {
  const unlocked = player.level >= 5;
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
        border: unlocked ? '1px solid rgba(185,242,255,0.2)' : '1px solid rgba(230,237,247,0.07)',
      }}
    >
      {unlocked && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(185,242,255,0.04), transparent 60%)' }} />}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: unlocked ? 'rgba(185,242,255,0.12)' : 'rgba(28,38,64,0.8)',
              border:     unlocked ? '1px solid rgba(185,242,255,0.3)' : '1px solid rgba(230,237,247,0.08)',
              color:      unlocked ? '#B9F2FF' : 'rgba(230,237,247,0.3)',
            }}
          >
            <Sword size={16} />
          </div>
          <div>
            <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Boss Challenge</div>
            <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Weekly · 10 questions</div>
          </div>
        </div>
        <span className="text-xs font-title font-bold px-2.5 py-1 rounded-full" style={{ background: unlocked ? 'rgba(185,242,255,0.1)' : 'rgba(230,237,247,0.06)', border: unlocked ? '1px solid rgba(185,242,255,0.25)' : '1px solid rgba(230,237,247,0.1)', color: unlocked ? '#B9F2FF' : 'rgba(230,237,247,0.3)' }}>
          {unlocked ? '×3 XP' : <><Lock size={9} style={{ display: 'inline' }} /> Lv 5</>}
        </span>
      </div>
      <p className="text-sm leading-relaxed relative z-10" style={{ color: 'rgba(230,237,247,0.5)' }}>
        {unlocked
          ? 'Face a brutal 10-question gauntlet for massive XP and exclusive rewards.'
          : `Unlock at Level 5. You're Level ${player.level}.`}
      </p>
      <button
        className="nx-btn nx-btn-sm w-full gap-2 relative z-10"
        style={unlocked ? { border: '1px solid rgba(185,242,255,0.3)', color: '#B9F2FF', background: 'rgba(185,242,255,0.07)' } : {}}
        disabled={!unlocked}
        onClick={onStart}
      >
        {unlocked ? <><Sword size={13} /> Start Boss Challenge</> : <><Lock size={13} /> Locked</>}
      </button>
    </div>
  );
}

function PremiumCard({ player }: { player: Player }) {
  const eligible = ['diamond', 'nexora'].includes(player.rank_tier);
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
        border: eligible ? '1px solid rgba(124,92,252,0.3)' : '1px solid rgba(230,237,247,0.07)',
      }}
    >
      {eligible && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(124,92,252,0.06), transparent 70%)' }} />}
      <div className="flex items-center gap-3 relative z-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: eligible ? 'rgba(124,92,252,0.18)' : 'rgba(28,38,64,0.8)',
            border:     eligible ? '1px solid rgba(124,92,252,0.35)' : '1px solid rgba(230,237,247,0.08)',
            color:      eligible ? '#9B81FF' : 'rgba(230,237,247,0.3)',
          }}
        >
          <Sparkles size={16} />
        </div>
        <div>
          <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Premium League</div>
          <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Diamond+ exclusive</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed relative z-10" style={{ color: 'rgba(230,237,247,0.5)' }}>
        {eligible
          ? "You're eligible for Premium League — exclusive ranked matches and prestige rewards."
          : 'Reach Diamond rank to unlock Premium League.'}
      </p>
      <div
        className="flex items-center gap-2 p-3 rounded-xl relative z-10"
        style={{ background: 'rgba(11,16,32,0.5)', border: '1px solid rgba(230,237,247,0.05)' }}
      >
        <Crown size={14} style={{ color: eligible ? '#9B81FF' : 'rgba(230,237,247,0.25)' }} />
        <span className="text-xs" style={{ color: 'rgba(230,237,247,0.4)' }}>
          {eligible ? 'You qualify — season starts soon' : `Current: ${player.rank_tier} · Need: Diamond`}
        </span>
      </div>
    </div>
  );
}

function DailySpin({ player }: { player: Player }) {
  const [spinning, setSpinning]   = useState(false);
  const [reward, setReward]       = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const alreadySpun = player.spin_last_date === today;

  function spin() {
    if (alreadySpun || spinning) return;
    setSpinning(true);
    const prizes = ['+25 XP', '+50 XP', '+100 XP', '+200 XP', 'Hint Token', 'Retry Ticket', 'Nothing'];
    setTimeout(() => {
      setReward(prizes[Math.floor(Math.random() * prizes.length)]);
      setSpinning(false);
    }, 1600);
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5"
      style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
    >
      <motion.div
        animate={spinning ? { rotate: 360 } : {}}
        transition={spinning ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : {}}
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,184,77,0.2), rgba(124,92,252,0.15))',
          border: '1px solid rgba(255,184,77,0.3)',
          boxShadow: spinning ? '0 0 20px rgba(255,184,77,0.4)' : 'none',
        }}
      >
        {spinning ? '✨' : (alreadySpun || reward) ? '🎁' : '🎡'}
      </motion.div>
      <div className="flex-1 text-center sm:text-left">
        <div className="font-title font-bold mb-1" style={{ color: '#E6EDF7' }}>Daily Spin</div>
        {reward ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sm font-semibold" style={{ color: '#33E8B8' }}>
            You won: <strong>{reward}</strong>!
          </motion.div>
        ) : (
          <div className="text-sm" style={{ color: 'rgba(230,237,247,0.5)' }}>
            {alreadySpun ? 'Come back tomorrow for another spin!' : 'Spin once per day for a random bonus reward.'}
          </div>
        )}
      </div>
      <motion.button
        whileTap={!alreadySpun && !spinning && !reward ? { scale: 0.95 } : {}}
        className="nx-btn nx-btn-sm flex-shrink-0 gap-2"
        style={!(alreadySpun || !!reward)
          ? { background: 'linear-gradient(135deg, #7C5CFC, #00D4FF)', color: '#fff', fontWeight: 700, border: 'none' }
          : {}}
        disabled={alreadySpun || spinning || !!reward}
        onClick={spin}
      >
        {spinning ? 'Spinning...' : (alreadySpun || reward) ? 'Spun Today' : 'Spin Now'}
      </motion.button>
    </div>
  );
}
