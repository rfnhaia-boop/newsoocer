'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  teamColor: string;
  teamAccent: string;
}

export default function PlayerCard({
  player,
  teamColor,
  teamAccent,
}: PlayerCardProps) {
  const { state, selectPlayer, registerGoal } = useGame();
  const isSelected = state.selectedPlayerId === player.id;
  const isActive = state.status === 'active' || state.status === 'paused';

  return (
    <motion.button
      layout
      whileHover={isActive ? { scale: 1.02, y: -1 } : {}}
      whileTap={isActive ? { scale: 0.98 } : {}}
      onClick={() => isActive && selectPlayer(player.id)}
      disabled={!isActive}
      className={`relative flex items-center gap-3 w-full rounded-xl border px-3 py-2.5 transition-all duration-200 group ${
        isSelected
          ? 'border-white/20 bg-white/10'
          : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10'
      } ${!isActive ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
      style={
        isSelected
          ? {
              borderColor: `${teamColor}80`,
              background: `linear-gradient(135deg, ${teamColor}15, ${teamColor}05)`,
              boxShadow: `0 0 20px ${teamColor}20, inset 0 1px 0 ${teamColor}20`,
            }
          : {}
      }
    >
      {/* Avatar circle */}
      <div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white transition-all duration-200"
        style={{
          backgroundColor: isSelected ? teamColor : `${teamColor}25`,
          boxShadow: isSelected ? `0 0 14px ${teamColor}40` : 'none',
        }}
      >
        {player.name.slice(0, 2).toUpperCase()}
        {isSelected && (
          <motion.div
            className="absolute -inset-0.5 rounded-full"
            style={{ border: `2px solid ${teamColor}` }}
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Name */}
      <span className={`flex-1 truncate text-left text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
        {player.name}
      </span>

      {/* Goal count */}
      {player.goalCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white mr-1"
          style={{ backgroundColor: teamColor, boxShadow: `0 0 8px ${teamColor}40` }}
        >
          {player.goalCount}
        </motion.div>
      )}

      {/* Quick Goal Action Spacer */}
      {isActive && (
         <div className="w-8 shrink-0 relative flex items-center justify-center">
            {/* Direct Goal Button */}
            <motion.button
               whileHover={{ scale: 1.2 }}
               whileTap={{ scale: 0.9 }}
               onClick={(e) => {
                 e.stopPropagation();
                 if (isActive) {
                   registerGoal(player.id);
                 }
               }}
               className="pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 absolute right-0 transition-opacity drop-shadow-md"
               title="Marcar Gol Rápido"
            >
               ⚽
            </motion.button>
         </div>
      )}
    </motion.button>
  );
}
