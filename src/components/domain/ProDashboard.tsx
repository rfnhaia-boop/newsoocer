'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import TimerDisplay from './TimerDisplay';
import Scoreboard from './Scoreboard';
import TeamRoster from './TeamRoster';
import GoalButton from './GoalButton';
import GoalCelebration from './GoalCelebration';
import RealtimeGraph from './RealtimeGraph';
import MatchEndModal from './MatchEndModal';
import NextTeamCard from './NextTeamCard';
import PlayerSwapModal from './PlayerSwapModal';
import GameSettingsModal from './GameSettingsModal';
import { ArrowLeft, Flag, ArrowLeftRight, Settings, Target } from 'lucide-react';

interface ProDashboardProps {
  onNewGame: () => void;
}

export default function ProDashboard({ onNewGame }: ProDashboardProps) {
  const { state, dispatch, rotateTeams } = useGame();
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [teamA, teamB] = state.teams;

  // Auto-show end modal when goal limit is reached
  useEffect(() => {
    if (state.status === 'finished' && state.config?.goalLimit) {
      const maxScore = Math.max(teamA?.score || 0, teamB?.score || 0);
      if (maxScore >= state.config.goalLimit) {
        setShowEndModal(true);
      }
    }
  }, [state.status, state.config?.goalLimit, teamA?.score, teamB?.score]);

  const handleNewGame = () => {
    dispatch({ type: 'RESET_GAME' });
    onNewGame();
  };

  if (!teamA || !teamB) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col p-3 lg:p-5"
    >
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handleNewGame}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} />
          Novo Jogo
        </button>

        <div className="flex items-center gap-3">
          {/* Swap button */}
          <button
            onClick={() => setShowSwapModal(true)}
            className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-400 transition-all hover:bg-violet-500 hover:text-white hover:shadow-violet-500/25"
          >
            <ArrowLeftRight size={16} />
            Substituição
          </button>

          {/* Settings button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <Settings size={16} />
          </button>

          {state.config?.mode === 'ganhe_fique' && (
            <button
              onClick={() => setShowEndModal(true)}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all hover:bg-emerald-500 hover:text-white hover:shadow-emerald-500/25"
            >
              <Flag size={16} />
              Finalizar Partida
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              {state.config?.mode === 'ganhe_fique' ? '⚡ Ganhe e Fique' : '🏆 Campeonato'}
            </div>
            <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-500 border border-white/5">
              {state.config?.durationMinutes} min
            </div>
            {state.config?.goalLimit && (
              <div className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Target size={10} />
                {state.config.goalLimit} gols
              </div>
            )}
            {state.config?.mode === 'ganhe_fique' && (
              <div className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-gray-400 border border-white/5">
                Jogo {state.matchNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content — 3-column on desktop */}
      <style>{`
        @media (min-width: 1024px) {
          .dashboard-grid { grid-template-columns: 300px 1fr 300px; }
        }
        @media (min-width: 1440px) {
          .dashboard-grid { grid-template-columns: 340px 1fr 340px; }
        }
      `}</style>
      <div className="dashboard-grid grid flex-1 gap-4">
        
        {/* LEFT — Team A */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-4 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-4 backdrop-blur-sm">
            <TeamRoster team={teamA} onSwapRequest={() => setShowSwapModal(true)} />
          </div>
        </div>

        {/* CENTER — Scoreboard + Timer + Goal */}
        <div className="order-1 flex flex-col items-center gap-5 lg:order-2">
          {/* Scoreboard — big and dramatic */}
          <div className="w-full rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-6 backdrop-blur-sm">
            <Scoreboard />
          </div>

          {/* Goal limit progress indicator */}
          {state.config?.goalLimit && (
            <div className="w-full rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                  <Target size={12} className="text-amber-400" />
                  Limite: {state.config.goalLimit} gols
                </span>
                <span className="text-xs text-gray-600">
                  {Math.max(teamA.score, teamB.score)} / {state.config.goalLimit}
                </span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: state.config.goalLimit }).map((_, i) => {
                  const aHasGoal = i < teamA.score;
                  const bHasGoal = i < teamB.score;
                  return (
                    <div key={i} className="flex-1 flex gap-1">
                      <div
                        className="h-2 flex-1 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: aHasGoal ? teamA.color : 'rgba(255,255,255,0.06)',
                          boxShadow: aHasGoal ? `0 0 8px ${teamA.color}40` : 'none',
                        }}
                      />
                      <div
                        className="h-2 flex-1 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: bHasGoal ? teamB.color : 'rgba(255,255,255,0.06)',
                          boxShadow: bHasGoal ? `0 0 8px ${teamB.color}40` : 'none',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] font-semibold" style={{ color: teamA.color }}>
                  {teamA.name} ({teamA.score})
                </span>
                <span className="text-[10px] font-semibold" style={{ color: teamB.color }}>
                  {teamB.name} ({teamB.score})
                </span>
              </div>
            </div>
          )}

          {/* Timer */}
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-6 backdrop-blur-sm">
            <TimerDisplay />
          </div>

          {/* Goal Button */}
          <GoalButton />

          {/* Goals Log */}
          {state.goals.length > 0 && (
            <div className="w-full rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                ⚽ Gols da Partida
              </h3>
              <div className="flex flex-wrap gap-2">
                {state.goals.map((goal) => {
                  const team = state.teams.find(t => t.id === goal.teamId);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                      style={{ backgroundColor: `${team?.color}15`, border: `1px solid ${team?.color}30` }}
                    >
                      <span className="text-sm">⚽</span>
                      <span className="text-sm font-semibold text-white">{goal.scorerName}</span>
                      <span className="text-xs text-gray-500">{goal.minute}&apos;</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Substitutions Log */}
          {state.substitutions.length > 0 && (
            <div className="w-full rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                🔄 Substituições
              </h3>
              <div className="space-y-1.5">
                {state.substitutions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
                  >
                    <span className="text-red-400">{sub.outPlayerName}</span>
                    <ArrowLeftRight size={10} className="text-gray-600" />
                    <span className="text-emerald-400">{sub.inPlayerName}</span>
                    {sub.isPermanent && (
                      <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        Permanente
                      </span>
                    )}
                    {!sub.isPermanent && (
                      <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        Temporária
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximo Time Queue */}
          {state.config?.mode === 'ganhe_fique' && state.teamQueue.length > 0 && (
            <div className="w-full">
              <NextTeamCard queue={state.teamQueue} />
            </div>
          )}

          {/* Statistics Graph */}
          <div className="w-full">
            <RealtimeGraph />
          </div>
        </div>

        {/* RIGHT — Team B */}
        <div className="order-3">
          <div className="sticky top-4 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-4 backdrop-blur-sm">
            <TeamRoster team={teamB} onSwapRequest={() => setShowSwapModal(true)} />
          </div>
        </div>
      </div>

      {/* Overlays */}
      <GoalCelebration />
      <MatchEndModal 
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        teamA={teamA}
        teamB={teamB}
        onSelectWinner={(winnerId) => rotateTeams(winnerId)}
        nextTeam={state.teamQueue[0]}
      />
      <PlayerSwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />
      <GameSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </motion.div>
  );
}
