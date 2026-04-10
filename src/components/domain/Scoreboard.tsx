'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';

export default function Scoreboard() {
  const { state } = useGame();
  const [teamA, teamB] = state.teams;

  if (!teamA || !teamB) return null;

  return (
    <div className="flex items-center justify-center gap-8">
      {/* Team A */}
      <div className="flex flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shadow-lg"
            style={{ backgroundColor: teamA.color, boxShadow: `0 0 12px ${teamA.color}60` }}
          />
          <span className="text-base font-bold text-white uppercase tracking-widest">
            {teamA.name}
          </span>
        </div>
        <div
          className="h-1 w-20 rounded-full opacity-60"
          style={{ backgroundColor: teamA.color }}
        />
      </div>

      {/* Score */}
      <div className="flex items-center gap-5">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={`a-${teamA.score}`}
            initial={{ y: -30, opacity: 0, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="text-7xl font-black tabular-nums drop-shadow-lg lg:text-8xl"
            style={{ color: teamA.color, textShadow: `0 0 40px ${teamA.color}40` }}
          >
            {teamA.score}
          </motion.span>
        </AnimatePresence>

        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-bold text-gray-600">×</span>
          <div className="h-px w-8 bg-white/10" />
        </div>

        <AnimatePresence mode="popLayout">
          <motion.span
            key={`b-${teamB.score}`}
            initial={{ y: -30, opacity: 0, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="text-7xl font-black tabular-nums drop-shadow-lg lg:text-8xl"
            style={{ color: teamB.color, textShadow: `0 0 40px ${teamB.color}40` }}
          >
            {teamB.score}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Team B */}
      <div className="flex flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shadow-lg"
            style={{ backgroundColor: teamB.color, boxShadow: `0 0 12px ${teamB.color}60` }}
          />
          <span className="text-base font-bold text-white uppercase tracking-widest">
            {teamB.name}
          </span>
        </div>
        <div
          className="h-1 w-20 rounded-full opacity-60"
          style={{ backgroundColor: teamB.color }}
        />
      </div>
    </div>
  );
}
