'use client';

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { useGame } from '@/context/GameContext';

export default function GoalButton() {
  const { state, registerGoal } = useGame();
  const isEnabled = state.selectedPlayerId !== null && (state.status === 'active' || state.status === 'paused');

  const selectedPlayer = state.selectedPlayerId
    ? state.teams
        .flatMap((t) => t.players)
        .find((p) => p.id === state.selectedPlayerId)
    : null;

  const selectedTeam = state.selectedPlayerId
    ? state.teams.find((t) => t.players.some((p) => p.id === state.selectedPlayerId))
    : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        whileHover={isEnabled ? { scale: 1.08 } : {}}
        whileTap={isEnabled ? { scale: 0.92 } : {}}
        onClick={() => isEnabled && registerGoal()}
        disabled={!isEnabled}
        className="relative flex items-center justify-center rounded-2xl text-white transition-all duration-300"
        style={{
          width: isEnabled ? '200px' : '160px',
          height: '64px',
          background: isEnabled
            ? `linear-gradient(135deg, ${selectedTeam?.color || '#10b981'}, ${selectedTeam?.accentColor || '#34d399'})`
            : 'rgba(255,255,255,0.05)',
          boxShadow: isEnabled
            ? `0 8px 32px ${selectedTeam?.color || '#10b981'}40, 0 0 60px ${selectedTeam?.color || '#10b981'}15`
            : 'none',
          cursor: isEnabled ? 'pointer' : 'not-allowed',
          opacity: isEnabled ? 1 : 0.4,
        }}
      >
        {/* Pulse ring */}
        {isEnabled && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: `2px solid ${selectedTeam?.color || '#10b981'}` }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <div className="relative z-10 flex items-center gap-2">
          <Target size={22} />
          <span className="text-lg font-black uppercase tracking-wider">
            {isEnabled ? 'GOL!' : 'GOL'}
          </span>
        </div>
      </motion.button>

      {/* Label below */}
      <motion.span
        animate={{ opacity: isEnabled ? 1 : 0.5 }}
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: isEnabled ? selectedTeam?.color || '#10b981' : '#6b7280' }}
      >
        {isEnabled ? `⚽ ${selectedPlayer?.name}` : 'Selecione um jogador'}
      </motion.span>
    </div>
  );
}
