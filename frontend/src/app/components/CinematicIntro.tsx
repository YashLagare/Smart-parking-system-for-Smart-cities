'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import SmartCityScene from './SmartCityScene';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── TYPEWRITER HOOK ────────────────────────────────────────────────
function useTypewriter(text: string, speed: number = 45, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayed('');
      setDone(false);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
}

// ─── STAGE STATUS SEQUENCES ─────────────────────────────────────────
// Each stage has a header, a list of sequential sub-statuses, and optionally metadata
interface StageConfig {
  header: string;
  subheader: string;
  statuses: string[];
  meta?: { label: string; value: string }[];
}

const STAGE_CONFIGS: Record<number, StageConfig> = {
  1: {
    header: 'System Initialization',
    subheader: 'Activating aerial surveillance module',
    statuses: [
      'Drone diagnostics active',
      'Terrain mapping in progress',
      'Aerial scan complete',
    ],
  },
  2: {
    header: 'Vehicle Systems Online',
    subheader: 'Preparing autonomous driving interface',
    statuses: [
      'Sensor array calibrated',
      'Navigation module linked',
      'Vehicle ready',
    ],
  },
  3: {
    header: 'Scanning Parking Zones',
    subheader: 'Analyzing real-time slot availability',
    statuses: [
      'Zone D scanning initiated',
      'Occupancy data received',
      'Available slots identified',
    ],
  },
  4: {
    header: 'Reservation Confirmed',
    subheader: 'Optimal parking slot secured',
    statuses: [
      'Slot A-17 reserved',
      'Navigation route calculated',
      'Estimated arrival 2 min',
    ],
    meta: [
      { label: 'Slot', value: 'A-17' },
      { label: 'Type', value: 'EV Charging' },
      { label: 'Rate', value: '$5.00 / hr' },
    ],
  },
  5: {
    header: 'Autonomous Navigation',
    subheader: 'Vehicle en route to parking facility',
    statuses: [
      'Route guidance active',
      'Speed optimized for efficiency',
      'Approaching destination',
    ],
  },
  6: {
    header: 'Gate Access',
    subheader: 'Authenticating vehicle credentials',
    statuses: [
      'Authenticating vehicle access',
      'Parking reservation verified',
      'Security check complete',
      'Entry barrier opening',
    ],
  },
  7: {
    header: 'Autonomous Parking',
    subheader: 'Vehicle maneuvering to assigned slot',
    statuses: [
      'Parking facility reached',
      'Analyzing available path',
      'Autonomous parking initiated',
      'Aligning to slot A-17',
    ],
  },
  8: {
    header: 'Parking Complete',
    subheader: 'Vehicle secured successfully',
    statuses: [
      'Vehicle parked',
      'Engine powered down',
      'Session recorded',
    ],
    meta: [
      { label: 'Slot', value: 'A-17' },
      { label: 'Time', value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { label: 'Occupancy', value: '78%' },
    ],
  },
};

// ─── SEQUENTIAL STATUS COMPONENT ────────────────────────────────────
function SequentialStatuses({ statuses, stage }: { statuses: string[]; stage: number }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    setCurrentIdx(0);
  }, [stage]);

  useEffect(() => {
    if (currentIdx < statuses.length - 1) {
      const timer = setTimeout(() => setCurrentIdx((i) => i + 1), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, statuses.length]);

  return (
    <div className="relative h-5 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${stage}-${currentIdx}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.6, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center"
        >
          <TypewriterLine text={statuses[currentIdx]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── TYPEWRITER LINE COMPONENT ──────────────────────────────────────
function TypewriterLine({ text }: { text: string }) {
  const { displayed, done } = useTypewriter(text, 40, true);
  return (
    <span className="text-[13px] font-medium tracking-wide text-white/65" style={{ fontFamily: "'Inter', sans-serif" }}>
      {displayed}
      {!done && (
        <motion.span
          className="inline-block w-[1px] h-[14px] bg-white/40 ml-[2px] align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}
    </span>
  );
}

// ─── PROGRESS BAR ───────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-semibold tracking-widest uppercase text-white/40"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Progress
        </span>
        <span
          className="text-[10px] font-semibold tracking-wider text-white/50"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white/30 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ─── METADATA ROW ───────────────────────────────────────────────────
function MetadataRow({ meta }: { meta: { label: string; value: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-6 mt-4"
    >
      {meta.map((item, i) => (
        <div key={i} className="flex flex-col">
          <span
            className="text-[9px] font-semibold tracking-widest uppercase text-white/25"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {item.label}
          </span>
          <span
            className="text-[13px] font-semibold text-white/70 mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [stage, setStage] = useState(0);

  // Automatic sequence manager
  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => setStage(1), 3500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleStageTransition = useCallback((nextStage: number) => {
    setStage(nextStage);
  }, []);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Triggers final transition to dashboard after logo reveal
  useEffect(() => {
    if (stage === 9) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  const stageConfig = STAGE_CONFIGS[stage];
  const progress = (stage / 9) * 100;

  return (
    <div
      className="fixed inset-0 w-full h-full bg-[#0a0c12] z-50 overflow-hidden flex flex-col select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* 3D R3F Canvas Container */}
      {stage > 0 && stage < 9 && (
        <div className="absolute inset-0 w-full h-full z-10">
          <Canvas shadows camera={{ position: [-70, 95, 95], fov: 45 }}>
            <color attach="background" args={['#0a0c12']} />
            <fog attach="fog" args={['#0a0c12', 50, 160]} />
            <React.Suspense fallback={null}>
              <SmartCityScene stage={stage} onStageTransition={handleStageTransition} />
            </React.Suspense>
          </Canvas>
        </div>
      )}

      {/* ── PROFESSIONAL HUD OVERLAY ─────────────────────────────── */}
      <AnimatePresence>
        {stage > 0 && stage < 9 && stageConfig && (
          <div className="absolute inset-0 w-full h-full z-20 pointer-events-none flex flex-col justify-between">

            {/* Gradient backdrop for text readability */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(8,10,16,0.92) 0%, rgba(8,10,16,0.7) 40%, rgba(8,10,16,0.3) 70%, transparent 100%)',
              }}
            />

            {/* ── TOP BAR ──────────────────────────────────────────── */}
            <div className="flex justify-between items-start w-full px-8 pt-6">
              {/* SmartPark wordmark */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3"
              >
                <div className="w-[3px] h-5 bg-white/20 rounded-full" />
                <span className="text-[13px] font-semibold tracking-[0.2em] uppercase text-white/40">
                  SmartPark
                </span>
              </motion.div>

              {/* Skip */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] text-[11px] font-medium tracking-wider text-white/40 hover:text-white/70 transition-all duration-300 uppercase"
                onClick={handleSkip}
              >
                <span>Skip</span>
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>

            {/* ── CENTER STATUS AREA ───────────────────────────────── */}
            <div className="flex-grow" />

            {/* ── BOTTOM STATUS PANEL ──────────────────────────────── */}
            <div className="w-full px-8 pb-10 relative z-10">
              <div className="max-w-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-1"
                  >
                    {/* Header */}
                    <h2
                      className="text-[22px] font-bold tracking-wide text-white leading-tight"
                      style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                    >
                      {stageConfig.header}
                    </h2>

                    {/* Subheader */}
                    <p className="text-[14px] font-medium tracking-wide text-white/55 mt-1">
                      {stageConfig.subheader}
                    </p>

                    {/* Divider line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="w-20 h-[1px] bg-white/25 origin-left mt-4 mb-4"
                    />

                    {/* Sequential status updates with typewriter */}
                    <SequentialStatuses statuses={stageConfig.statuses} stage={stage} />

                    {/* Metadata (only on certain stages) */}
                    {stageConfig.meta && <MetadataRow meta={stageConfig.meta} />}
                  </motion.div>
                </AnimatePresence>

                {/* Progress */}
                <div className="mt-6">
                  <ProgressBar progress={progress} />
                </div>

                {/* Stage indicator */}
                <div className="flex items-center gap-1.5 mt-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      animate={{
                        width: i + 1 === stage ? 20 : 4,
                        height: 4,
                        backgroundColor: i + 1 <= stage ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)',
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── STAGE 0: SYSTEM BOOT ─────────────────────────────────── */}
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full z-40 bg-[#0a0c12] flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-sm w-full flex flex-col items-center text-center gap-6">
              {/* Minimal icon */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-[18px] font-semibold text-white/80 tracking-wide"
                >
                  SmartPark AI
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-[12px] font-medium text-white/30 tracking-wider"
                >
                  Initializing autonomous parking system
                </motion.p>
              </div>

              {/* Minimal progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-48"
              >
                <div className="w-full h-[1.5px] bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/25 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.8, ease: 'linear' }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STAGE 9: COMPLETION ───────────────────────────────────── */}
      <AnimatePresence>
        {stage === 9 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full z-50 bg-[#0a0c12] flex flex-col items-center justify-center p-6"
          >
            {/* Soft ambient glow */}
            <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)]" />

            <div className="text-center z-10 flex flex-col items-center gap-8">
              {/* Logo mark */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              {/* Title */}
              <div className="space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="text-3xl md:text-4xl font-semibold tracking-[0.15em] text-white/90 uppercase"
                >
                  SmartPark AI
                </motion.h1>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-12 h-[1px] bg-white/20 mx-auto"
                />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-[12px] tracking-[0.25em] text-white/30 uppercase font-medium"
                >
                  Smart Parking for Smart Cities
                </motion.p>
              </div>

              {/* Entering dashboard */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.5 }}
                className="flex items-center gap-3 mt-4"
              >
                <span className="text-[10px] tracking-[0.2em] text-white/25 uppercase font-medium">
                  Entering Dashboard
                </span>
                <motion.div
                  className="w-1 h-1 rounded-full bg-white/30"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
