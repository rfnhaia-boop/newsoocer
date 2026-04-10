'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Check, AlertCircle } from 'lucide-react';
import { Team, Player, LoanRecord } from '@/types';
import { useGame } from '@/context/GameContext';

interface TeamCompletionPanelProps {
  team: Team;
  teamSize: number;
}

export default function TeamCompletionPanel({ team, teamSize }: TeamCompletionPanelProps) {
  const { state, loanPlayer } = useGame();
  const [expanded, setExpanded] = useState(true);

  const missingCount = teamSize - team.players.length;

  // No completion needed
  if (missingCount <= 0) return null;

  // Get available players from queue teams to borrow
  const availableFromQueue: { player: Player; team: Team }[] = [];
  for (const queueTeam of state.teamQueue) {
    // Only offer players from teams that have MORE than they need to play
    // (don't strip a queue team to 0 players)
    for (const player of queueTeam.players) {
      // Don't offer already-loaned players
      const alreadyLoaned = state.loanedPlayers.some((l) => l.playerId === player.id);
      if (!alreadyLoaned) {
        availableFromQueue.push({ player, team: queueTeam });
      }
    }
  }

  const handleLoan = (player: Player, fromTeam: Team) => {
    const loan: LoanRecord = {
      playerId: player.id,
      playerName: player.name,
      originalTeamId: fromTeam.id,
      loanedToTeamId: team.id,
      matchNumber: state.matchNumber,
    };
    loanPlayer(loan);
  };

  // Get loaned players currently in this team
  const currentLoans = state.loanedPlayers.filter((l) => l.loanedToTeamId === team.id);
  const remainingMissing = missingCount - currentLoans.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-amber-500/10"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
          {remainingMissing > 0 ? (
            <AlertCircle size={14} className="text-amber-400" />
          ) : (
            <Check size={14} className="text-emerald-400" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-400">
            {remainingMissing > 0
              ? `Faltam ${remainingMissing} jogador${remainingMissing > 1 ? 'es' : ''}`
              : 'Time completo!'}
          </p>
          <p className="text-[10px] text-gray-500">
            {remainingMissing > 0
              ? 'Selecione da fila para completar'
              : `${currentLoans.length} emprestado${currentLoans.length > 1 ? 's' : ''} (voltam no próximo jogo)`}
          </p>
        </div>
        <span className="text-xs text-gray-600">
          {team.players.length}/{teamSize}
        </span>
      </button>

      {/* Loaned players badges */}
      {currentLoans.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {currentLoans.map((loan) => {
              const originalTeam = state.teamQueue.find((t) => t.id === loan.originalTeamId)
                || state.teams.find((t) => t.id === loan.originalTeamId);
              return (
                <div
                  key={loan.playerId}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1"
                >
                  <UserPlus size={10} className="text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {loan.playerName}
                  </span>
                  {originalTeam && (
                    <span className="text-[10px] text-gray-500">
                      ← {originalTeam.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available players to borrow */}
      <AnimatePresence>
        {expanded && remainingMissing > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-amber-500/10"
          >
            <div className="p-3 space-y-2">
              {state.teamQueue.map((qTeam) => {
                const availablePlayers = qTeam.players.filter(
                  (p) => !state.loanedPlayers.some((l) => l.playerId === p.id)
                );
                if (availablePlayers.length === 0) return null;

                return (
                  <div key={qTeam.id}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: qTeam.color }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {qTeam.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {availablePlayers.map((player) => (
                        <motion.button
                          key={player.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleLoan(player, qTeam)}
                          disabled={remainingMissing <= 0}
                          className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2 text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            style={{ backgroundColor: `${qTeam.color}30` }}
                          >
                            {player.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[11px] font-medium text-gray-300 truncate">
                            {player.name}
                          </span>
                          <UserPlus size={10} className="ml-auto text-gray-600 shrink-0" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {availableFromQueue.length === 0 && (
                <p className="text-center text-xs text-gray-600 py-2">
                  Nenhum jogador disponível na fila
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
