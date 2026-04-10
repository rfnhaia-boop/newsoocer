'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Users, Play, Settings, Wallet, RotateCcw, BarChart } from 'lucide-react';
import Link from 'next/link';
import { GameProvider, useGame } from '@/context/GameContext';
import { distributeTeams } from '@/utils/teamDistribution';

import Modal from '@/components/ui/Modal';
import PlayerSelectionModal from '@/components/domain/PlayerSelectionModal';
import ProDashboard from '@/components/domain/ProDashboard';
import MatchupScreen from '@/components/domain/MatchupScreen';
import TeamDrawAnimation from '@/components/domain/TeamDrawAnimation';
import HomeHub from '@/components/layout/HomeHub';

import { Player, GameMode } from '@/types';
import { samplePlayers } from '@/data/samplePlayers';

function FutsalApp() {
  const { state, dispatch } = useGame();
  
  // Flow states
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMatchup, setShowMatchup] = useState(false);
  const [showDraw, setShowDraw] = useState(false);

  // Setup states
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  
  // Custom Rules
  const [teamSize, setTeamSize] = useState(5);
  const [duration, setDuration] = useState(10);
  const [goalLimit, setGoalLimit] = useState<number | null>(null);

  useEffect(() => {
    const rules = localStorage.getItem('futsal_custom_rules');
    if (rules) {
      try {
        const parsed = JSON.parse(rules);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.goalLimit !== undefined) setGoalLimit(parsed.goalLimit);
      } catch (e) {}
    }
  }, []);

  const saveSettings = (newSize: number, newDur: number, newGoal: number | null) => {
    setTeamSize(newSize);
    setDuration(newDur);
    setGoalLimit(newGoal);
    localStorage.setItem('futsal_custom_rules', JSON.stringify({
      teamSize: newSize,
      duration: newDur,
      goalLimit: newGoal
    }));
    setShowSettings(false);
  };

  const handleStartGame = useCallback(() => {
    if (selectedPlayers.length < teamSize * 2) {
      alert(`Selecione ao menos ${teamSize * 2} jogadores para formar 2 times completos.`);
      return;
    }

    const config = {
      mode: 'mensalista' as GameMode,
      teamSize,
      durationMinutes: duration,
      goalLimit,
      endCondition: goalLimit ? (duration > 0 ? 'time_or_goals' : 'goals') : 'time',
      playerIds: selectedPlayers.map(p => p.id)
    };

    // @ts-ignore
    dispatch({ type: 'SET_CONFIG', payload: config });

    const allTeams = distributeTeams(
      selectedPlayers,
      teamSize,
      true
    );

    const activeTeams = allTeams.slice(0, 2);
    const queueTeams = allTeams.slice(2);

    dispatch({ type: 'SET_TEAMS', payload: activeTeams });
    dispatch({ type: 'SET_QUEUE', payload: queueTeams });
    dispatch({ type: 'SET_BENCH', payload: [] });

    setShowPlayerSelect(false);
    setShowDraw(true);
  }, [selectedPlayers, teamSize, duration, goalLimit, dispatch]);

  const handleNewGame = () => {
    setShowDashboard(false);
    dispatch({ type: 'RESET_GAME' });
  };

  const resumeGame = () => {
    setShowDashboard(true);
  };

  if (showDraw && state.teams.length >= 2) {
    return (
      <TeamDrawAnimation
        team1={state.teams[0]}
        team2={state.teams[1]}
        queueTeams={state.teamQueue}
        onComplete={() => {
          setShowDraw(false);
          setShowMatchup(true);
        }}
      />
    );
  }

  if (showMatchup && state.teams.length >= 2) {
    return (
      <MatchupScreen 
        team1={state.teams[0]} 
        team2={state.teams[1]} 
        queueTeams={state.teamQueue}
        onUpdateTeams={(newTeam1: any, newTeam2: any, newQueue: any) => {
          dispatch({ type: 'SET_TEAMS', payload: [newTeam1, newTeam2] });
          dispatch({ type: 'SET_QUEUE', payload: newQueue });
        }}
        onStartGame={() => {
          setShowMatchup(false);
          setShowDashboard(true);
        }} 
      />
    );
  }

  if (showDashboard && state.teams.length >= 2) {
    return <ProDashboard onNewGame={handleNewGame} />;
  }

  const isGameInProgress = state.status !== 'setup' && state.teams.length > 0;

  if (!showPlayerSelect && !showSettings) {
    return (
      <HomeHub 
        onStartMatch={() => setShowDashboard(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenPlayerSelect={() => {
          if (selectedPlayers.length === 0) setSelectedPlayers(samplePlayers as Player[]);
          setShowPlayerSelect(true);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0f16] flex flex-col items-center justify-center p-4">

      {/* Player Select Modal (FAST FLOW) */}
      <AnimatePresence>
        {showPlayerSelect && (
          <Modal
            isOpen={showPlayerSelect}
            onClose={() => setShowPlayerSelect(false)}
            title="Quem vai jogar?"
            subtitle="Selecione os jogadores presentes ou cole uma lista nova"
            footer={
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => setShowPlayerSelect(false)}
                  className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartGame}
                  disabled={selectedPlayers.length < teamSize * 2}
                  className={`flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold shadow-lg transition-all ${
                    selectedPlayers.length >= teamSize * 2
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Zap size={16} />
                  Sortear Times!
                </button>
              </div>
            }
          >
             <PlayerSelectionModal
                players={samplePlayers}
                selectedPlayers={selectedPlayers}
                onToggle={(p) => {
                  setSelectedPlayers(prev => {
                    if(prev.find(x => x.id === p.id)) return prev.filter(x => x.id !== p.id);
                    return [...prev, p];
                  });
                }}
                onSelectAll={() => setSelectedPlayers(samplePlayers)}
                onSetFromList={(pl) => {
                  setSelectedPlayers(prev => {
                    const newSelection = [...prev];
                    pl.forEach(p => {
                       const exists = newSelection.find(x => x.name.toLowerCase() === p.name.toLowerCase());
                       if(!exists) {
                         newSelection.push(p);
                       }
                    });
                    return newSelection;
                  });
                }}
                onClearAll={() => setSelectedPlayers([])}
                minPlayers={teamSize * 2}
              />
          </Modal>
        )}
      </AnimatePresence>

      {/* Default Rules Modal */}
      <AnimatePresence>
        {showSettings && (
          <HomeSettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
            currentSize={teamSize}
            currentDuration={duration}
            currentGoals={goalLimit}
            onSave={saveSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeSettingsModal({ isOpen, onClose, currentSize, currentDuration, currentGoals, onSave }: any) {
  const [size, setSize] = useState(currentSize);
  const [dur, setDur] = useState(currentDuration);
  const [goals, setGoals] = useState<number | null>(currentGoals);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Regras Padrão" subtitle="Defina as regras para as suas peladas">
       <div className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Jogadores por Time</label>
            <div className="grid grid-cols-4 gap-2">
               {[4,5,6,7].map(n => (
                 <button key={n} onClick={() => setSize(n)} className={`py-3 rounded-xl border font-bold text-sm ${size === n ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-gray-400'}`}>{n}x{n}</button>
               ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 block">Duração (Minutos)</label>
            <div className="grid grid-cols-5 gap-2">
               {[7,10,15,30,45].map(n => (
                 <button key={n} onClick={() => setDur(n)} className={`py-3 rounded-xl border font-bold text-sm ${dur === n ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-white/10 text-gray-400'}`}>{n}</button>
               ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 block">Limite de Gols (Opcional)</label>
            <div className="grid grid-cols-4 gap-2">
               {[{v:null,l:'Nenhum'},{v:2,l:'2'},{v:3,l:'3'},{v:5,l:'5'}].map(o => (
                 <button key={o.l} onClick={() => setGoals(o.v)} className={`py-3 rounded-xl border font-bold text-sm ${goals === o.v ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-white/10 text-gray-400'}`}>{o.l}</button>
               ))}
            </div>
          </div>
          <button 
            onClick={() => onSave(size, dur, goals)}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white py-4 font-bold transition-all shadow-lg"
          >
            Salvar Regras
          </button>
       </div>
    </Modal>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <FutsalApp />
    </GameProvider>
  );
}
