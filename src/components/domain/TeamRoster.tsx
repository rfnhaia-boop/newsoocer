'use client';

import { ArrowLeftRight } from 'lucide-react';
import { Team } from '@/types';
import { useGame } from '@/context/GameContext';
import PlayerCard from './PlayerCard';
import TeamCompletionPanel from './TeamCompletionPanel';

interface TeamRosterProps {
  team: Team;
  onSwapRequest?: () => void;
}

export default function TeamRoster({ team, onSwapRequest }: TeamRosterProps) {
  const { state } = useGame();
  const totalGoals = team.players.reduce((sum, p) => sum + p.goalCount, 0);
  const teamSize = state.config?.teamSize || team.players.length;

  // Find which players are loaned to this team
  const loanedPlayerIds = new Set(
    state.loanedPlayers
      .filter((l) => l.loanedToTeamId === team.id)
      .map((l) => l.playerId)
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-3.5 w-3.5 rounded-md shadow-md"
            style={{ backgroundColor: team.color, boxShadow: `0 0 10px ${team.color}50` }}
          />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            {team.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onSwapRequest && (
            <button
              onClick={onSwapRequest}
              className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold text-gray-500 transition-all hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-400"
              title="Substituir jogador"
            >
              <ArrowLeftRight size={10} />
              Trocar
            </button>
          )}
          {totalGoals > 0 && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: `${team.color}20`, color: team.color }}>
              {totalGoals} gols
            </span>
          )}
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-500">
            {team.players.length}/{teamSize}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full" style={{ background: `linear-gradient(to right, ${team.color}30, transparent)` }} />

      {/* Player cards */}
      <div className="space-y-1.5">
        {team.players.map((player) => (
          <div key={player.id} className="relative">
            <PlayerCard
              player={player}
              teamColor={team.color}
              teamAccent={team.accentColor}
            />
            {/* Loan indicator */}
            {loanedPlayerIds.has(player.id) && (
              <div
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] shadow-sm"
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold',
                }}
                title="Emprestado — volta no próximo jogo"
              >
                ↩
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Team Completion Panel — appears when team is incomplete */}
      <TeamCompletionPanel team={team} teamSize={teamSize} />
    </div>
  );
}
