'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Forward } from 'lucide-react';
import { Team } from '@/types';

interface TeamDrawAnimationProps {
  team1: Team;
  team2: Team;
  queueTeams: Team[];
  onComplete: () => void;
}

export default function TeamDrawAnimation({ team1, team2, queueTeams, onComplete }: TeamDrawAnimationProps) {
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 5000),
      setTimeout(() => setPhase(3), 8000),
      setTimeout(() => {
        setPhase(4);
        onComplete();
      }, 11000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderTeamCard = (team: Team, title: string, delay: number = 0) => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 150, delay }}
      className="relative flex flex-col items-center justify-center rounded-2xl border bg-white/5 p-4 backdrop-blur-md shadow-xl overflow-hidden w-full max-w-sm shrink-0"
      style={{ borderColor: hexToRgba(team.color, 0.5) }}
    >
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${team.color}, transparent 70%)` }}
      />
      
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3 }}
        className="text-sm font-bold uppercase tracking-widest mb-4"
        style={{ color: team.accentColor }}
      >
        {title}
      </motion.p>
      
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: delay + 0.1 }}
        className="mb-2 rounded-full p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2"
        style={{ backgroundColor: hexToRgba(team.color, 0.2), borderColor: team.color, color: team.accentColor }}
      >
        <Shield size={32} />
      </motion.div>
      
      <motion.h2 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
        className="text-3xl font-black text-white text-center mb-4 drop-shadow-md"
      >
        {team.name}
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-2">
        {team.players.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.6 + (idx * 0.1), type: 'spring' }}
            className="px-3 py-1 rounded-full text-sm font-medium border"
            style={{ 
              backgroundColor: hexToRgba(team.color, 0.1), 
              borderColor: hexToRgba(team.color, 0.3),
              color: '#f3f4f6'
            }}
          >
            {p.name}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900/95 p-4 backdrop-blur-3xl overflow-hidden">
      
      <button 
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-sm font-bold"
      >
        Pular Animação <Forward size={16} />
      </button>

      {/* Título Persistente após Phase 0 */}
      {phase >= 1 && (
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black text-white mb-6 uppercase tracking-widest"
        >
          Sorteio de Times
        </motion.h1>
      )}

      {/* Div de rolagem e acumulação dos times */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-6 overflow-y-auto pb-20 no-scrollbar">
        
        {/* Phase 0 */}
        <AnimatePresence>
          {phase === 0 && (
            <motion.div 
              key="phase0"
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="mb-6 p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              >
                <Sparkles size={48} />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse text-center">
                Sorteando Equipes...
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1 e 2 - Times Principais acumulando na tela lado a lado (em telas grandes) */}
        {phase >= 1 && (
          <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
            {phase >= 1 && renderTeamCard(team1, "Primeiro Time Escolhido")}
            {phase >= 2 && renderTeamCard(team2, "Segundo Time Escolhido", 0.3)}
          </div>
        )}

        {/* Phase 3 - Fila acumulando embaixo */}
        {phase >= 3 && queueTeams.length > 0 && (
          <motion.div 
            key="phase3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center mt-6"
          >
            <h2 className="text-xl font-bold text-gray-400 mb-4 text-center uppercase tracking-widest">
              Fila Formada
            </h2>
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {queueTeams.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex flex-col items-center border p-4 rounded-2xl w-[160px] relative overflow-hidden"
                  style={{ borderColor: hexToRgba(team.color, 0.4), backgroundColor: hexToRgba(team.color, 0.05) }}
                >
                  <Shield size={32} style={{ color: team.color }} className="mb-2" />
                  <span className="font-bold text-white text-center mb-1">{team.name}</span>
                  <span className="text-xs text-gray-400">{team.players.length} jogadores</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
