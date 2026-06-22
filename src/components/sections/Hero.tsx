import { useEffect, useRef, useState } from 'react';
import { Wallet, ArrowRight, Zap, Trophy, Flame, Sparkles, Loader2 } from 'lucide-react';
import { NexoraWatermark } from '../../design-system/Logo';

interface HeroSectionProps {
  onConnectWallet: () => void;
  isConnecting?: boolean;
}

const HERO_STATS = [
  { value: '12,847+', label: 'Active Players',        color: '#7C5CFC' },
  { value: '4.2M+',   label: 'XP Earned',             color: '#FFB84D' },
  { value: '8',       label: 'Knowledge Domains',     color: '#00D4FF' },
  { value: 'S1',      label: 'Season 1 Live',         color: '#00C896' },
];

export default function HeroSection({ onConnectWallet, isConnecting = false }: HeroSectionProps) {
  const [visible, setVisible] = useState(false);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Violet orb — top-left, slow drift */}
        <div
          ref={orb1Ref}
          className="absolute"
          style={{
            top: '-15%', left: '-10%',
            width: '700px', height: '700px',
            background: 'radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 65%)',
            filter: 'blur(60px)',
            animation: 'mesh-drift-1 22s ease-in-out infinite',
          }}
        />
        {/* Cyan orb — bottom-right */}
        <div
          ref={orb2Ref}
          className="absolute"
          style={{
            bottom: '-10%', right: '-5%',
            width: '550px', height: '550px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 65%)',
            filter: 'blur(70px)',
            animation: 'mesh-drift-2 18s ease-in-out infinite',
          }}
        />
        {/* Amber orb — center-bottom pulse */}
        <div
          className="absolute"
          style={{
            bottom: '5%', left: '50%',
            transform: 'translateX(-50%)',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(255,184,77,0.07) 0%, transparent 65%)',
            filter: 'blur(80px)',
            animation: 'float 14s ease-in-out infinite reverse',
          }}
        />
        {/* Top center radial for hero glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{
            background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(124,92,252,0.14) 0%, transparent 65%)',
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* Logo watermark */}
      <NexoraWatermark
        size={760}
        opacity={0.05}
        blur={1}
        top="50%"
        left="50%"
        className="-translate-x-1/2 -translate-y-1/2"
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-20 flex flex-col items-center text-center">

        {/* Eyebrow pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{
            background:  'rgba(124,92,252,0.1)',
            border:      '1px solid rgba(124,92,252,0.28)',
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(12px)',
            transition:   'opacity 0.5s ease, transform 0.5s ease',
            transitionDelay: '0ms',
          }}
        >
          <Sparkles size={11} style={{ color: '#9B81FF' }} />
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: '#9B81FF' }}>
            AI-Powered · Web3 Native · Season 1 Live
          </span>
          <Sparkles size={11} style={{ color: '#9B81FF' }} />
        </div>

        {/* H1 Headline */}
        <h1
          className="font-title font-extrabold leading-none mb-6"
          style={{
            fontSize:    'clamp(3rem, 8.5vw, 6rem)',
            letterSpacing: '-0.04em',
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(20px)',
            transition:   'opacity 0.6s ease, transform 0.6s ease',
            transitionDelay: '120ms',
          }}
        >
          <span className="block" style={{ color: '#E6EDF7' }}>Master Every Domain.</span>
          <span
            className="block"
            style={{
              background:           'linear-gradient(135deg, #9B81FF 0%, #7C5CFC 40%, #00D4FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}
          >
            Earn Your Rank.
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          style={{
            color:        'rgba(230,237,247,0.58)',
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(16px)',
            transition:   'opacity 0.6s ease, transform 0.6s ease',
            transitionDelay: '240ms',
          }}
        >
          Nexora is the world's first AI-generated knowledge arena.
          Compete across 8 domains, climb the global leaderboard, and earn on-chain.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          style={{
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(16px)',
            transition:   'opacity 0.6s ease, transform 0.6s ease',
            transitionDelay: '360ms',
          }}
        >
          <button
            onClick={onConnectWallet}
            disabled={isConnecting}
            className="nx-btn nx-btn-primary nx-btn-lg gap-3 min-w-[220px]"
            style={{ fontSize: '1.0625rem', opacity: isConnecting ? 0.7 : 1 }}
          >
            {isConnecting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Wallet size={18} />
            )}
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          <a
            href="#categories"
            className="nx-btn nx-btn-ghost nx-btn-lg gap-3 min-w-[200px]"
            style={{ fontSize: '1.0625rem' }}
          >
            Explore Categories
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Live stat strip */}
        <div
          className="flex flex-wrap justify-center gap-6 md:gap-10"
          style={{
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(12px)',
            transition:   'opacity 0.6s ease, transform 0.6s ease',
            transitionDelay: '480ms',
          }}
        >
          {HERO_STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="font-title font-extrabold leading-none"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.03em', color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="nx-stat-label mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Floating mini-cards */}
        <div
          className="hidden lg:flex items-center gap-4 mt-16"
          style={{
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(16px)',
            transition:   'opacity 0.6s ease, transform 0.6s ease',
            transitionDelay: '600ms',
          }}
        >
          {[
            { icon: <Zap size={14} style={{ color: '#9B81FF' }} />,       text: '+150 XP',       sub: 'Correct answer',  delay: '0s' },
            { icon: <Flame size={14} style={{ color: '#FFB84D' }} />,      text: '21-Day Streak', sub: '×2 XP Active',   delay: '0.4s' },
            { icon: <Trophy size={14} style={{ color: '#FFB84D' }} />,     text: 'Rank #47',      sub: 'Global board',   delay: '0.8s' },
          ].map((pill, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{
                background:     'rgba(28,38,64,0.8)',
                border:         '1px solid rgba(230,237,247,0.1)',
                backdropFilter: 'blur(12px)',
                animation:      `float ${5 + i}s ease-in-out ${pill.delay} infinite`,
              }}
            >
              {pill.icon}
              <div>
                <div className="font-title font-bold text-sm leading-tight" style={{ color: '#E6EDF7' }}>{pill.text}</div>
                <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>{pill.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="text-2xs tracking-widest uppercase font-title" style={{ color: 'rgba(230,237,247,0.2)' }}>Scroll</div>
        <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: '1px solid rgba(230,237,247,0.15)' }}>
          <div
            className="w-1 h-1.5 rounded-full"
            style={{ background: 'rgba(230,237,247,0.35)', animation: 'float 1.5s ease-in-out infinite' }}
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0B1020)' }}
      />
    </section>
  );
}
