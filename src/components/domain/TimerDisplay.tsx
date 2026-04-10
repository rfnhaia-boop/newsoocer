'use client';

import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

export default function TimerDisplay() {
  const {
    minutes,
    seconds,
    progress,
    isLastThirtySeconds,
    isRunning,
    isPaused,
    isFinished,
    start,
    pause,
    reset,
  } = useTimer();

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const ringColor = isFinished
    ? '#6b7280'
    : isLastThirtySeconds
    ? '#ef4444'
    : isRunning
    ? '#10b981'
    : '#3b82f6';

  const timerColor = isFinished
    ? 'text-gray-500'
    : isLastThirtySeconds
    ? 'text-red-400'
    : isRunning
    ? 'text-emerald-400'
    : 'text-blue-400';

  const statusText = isFinished
    ? '🏁 Finalizado'
    : isRunning
    ? '▶ Em jogo'
    : isPaused
    ? '⏸ Pausado'
    : '● Pronto';

  const size = 180;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular timer */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transition={{ duration: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${ringColor}60)` }}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <motion.span
            className={`font-mono text-4xl font-black tracking-wider ${timerColor} transition-colors duration-300`}
            animate={
              isLastThirtySeconds && isRunning
                ? { scale: [1, 1.04, 1], opacity: [1, 0.6, 1] }
                : {}
            }
            transition={
              isLastThirtySeconds && isRunning
                ? { repeat: Infinity, duration: 0.8 }
                : {}
            }
          >
            {formattedTime}
          </motion.span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-gray-500">
            {statusText}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isRunning && !isFinished && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={start}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400"
          >
            <Play size={16} fill="white" />
            {isPaused ? 'Retomar' : 'Iniciar'}
          </motion.button>
        )}
        {isRunning && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={pause}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400"
          >
            <Pause size={16} />
            Pausar
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={reset}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={14} />
          Reset
        </motion.button>
      </div>
    </div>
  );
}
