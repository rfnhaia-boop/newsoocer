'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';

export default function GoalCelebration() {
  const { state } = useGame();
  const lastGoal = state.goals[state.goals.length - 1];

  const fireConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Big burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      zIndex: 9999,
    });

    frame();
  }, []);

  useEffect(() => {
    if (lastGoal) {
      fireConfetti();
    }
  }, [lastGoal?.id]);

  return (
    <AnimatePresence>
      {lastGoal && (
        <motion.div
          key={lastGoal.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: [30, 0, 0, -30], scale: [0.8, 1.1, 1, 0.9] }}
            transition={{ duration: 2.5, times: [0, 0.2, 0.7, 1] }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="text-8xl"
            >
              ⚽
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-4xl font-black text-white drop-shadow-2xl"
            >
              GOOOOL!
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-xl font-semibold text-emerald-400 drop-shadow-lg"
            >
              {lastGoal.scorerName} • {lastGoal.teamName}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
