'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Plus, Star, Trophy, BookOpen, Play } from 'lucide-react';
import Link from 'next/link';

import { useGame } from '@/context/GameContext';
import { useFinance } from '@/context/FinanceContext';
import { samplePlayers } from '@/data/samplePlayers';
import PlayerProfileModal from '@/components/domain/PlayerProfileModal';
import AddPlayerModal from '@/components/domain/AddPlayerModal';

const positionColors: Record<string, string> = {
  Goleiro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Fixo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Ala: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Pivô: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function HomeHub({ onStartMatch, onOpenSettings, onOpenPlayerSelect }: any) {
  const { state } = useGame();
  const { addPlayer: addFinancePlayer } = useFinance();
  const isGameActive = state.status !== 'setup' && state.teams.length > 0;
  
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [roster, setRoster] = useState<any[]>(samplePlayers);

  useEffect(() => {
    const saved = localStorage.getItem('futsal_roster');
    if (saved) {
      try {
        setRoster(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleAddPlayer = (name: string, position: string, rating: number, isMensalista: boolean) => {
    const newPlayer = {
      id: `pl-${Date.now()}`,
      name,
      position,
      rating,
      goalCount: 0,
      stats: { goals: 0, assists: 0, defenses: 0, matchesPlayed: 0 }
    };
    
    const newRoster = [...roster, newPlayer];
    setRoster(newRoster);
    localStorage.setItem('futsal_roster', JSON.stringify(newRoster));
    
    // Auto register in finance
    addFinancePlayer(name, isMensalista ? 'mensalista' : 'avulso');
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-50">
      {/* Efeitos de Brilho no Fundo (Glows) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto p-6 pt-12 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header className="flex justify-between items-center mb-12" variants={itemVariants}>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
              Futsal <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
              Organize. Jogue. Estatísticas.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-xl cursor-default hover:bg-white/10 transition-colors">
            <User className="text-slate-300" size={20} />
          </div>
        </motion.header>

        {/* Botão Principal CTA */}
        <motion.div className="mb-10" variants={itemVariants}>
          <motion.button
            onClick={isGameActive ? onStartMatch : onOpenPlayerSelect}
            className={`w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r p-[1px] shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] ${isGameActive ? 'from-amber-500 to-orange-500' : 'from-emerald-600 to-teal-500'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${isGameActive ? 'from-amber-400/0 via-white/20 to-amber-400/0' : 'from-emerald-400/0 via-white/20 to-emerald-400/0'} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
            <div className={`relative flex items-center justify-between bg-gradient-to-r ${isGameActive ? 'from-amber-600 to-orange-500' : 'from-emerald-600 to-teal-500'} px-8 py-6 rounded-2xl`}>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {isGameActive ? 'Partida Ativa' : 'Nova Pelada'}
                </h2>
                <p className={`${isGameActive ? 'text-amber-100/80' : 'text-emerald-100/80'} text-sm`}>
                  {isGameActive ? 'Toque para voltar à quadra' : 'Configurar times e iniciar cronômetro'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Play className="text-white fill-white ml-1" size={20} />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Cards de Gestão (Financeiro e Regras) */}
        <motion.div className="grid grid-cols-2 gap-4 mb-12" variants={itemVariants}>
          {/* Card Financeiro */}
          <Link href="/financeiro" className="block outline-none">
            <div className="relative overflow-hidden rounded-2xl bg-white/5 p-5 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 cursor-pointer group h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/20">
                <Trophy size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">Financeiro</h3>
              <p className="text-xs text-slate-400 mt-1">Caixa e pagamentos</p>
            </div>
          </Link>

          {/* Card Regras */}
          <div onClick={onOpenSettings} className="relative overflow-hidden rounded-2xl bg-white/5 p-5 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 cursor-pointer group h-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-4 border border-blue-500/20">
              <BookOpen size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Regras</h3>
            <p className="text-xs text-slate-400 mt-1">Configurações do jogo</p>
          </div>
        </motion.div>

        {/* Seção de Jogadores (Craques Confirmados) */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white">Craques Confirmados</h2>
            <Link href="/estatisticas" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <Trophy size={14} /> Ranking
            </Link>
          </div>

          {/* Carrossel Horizontal */}
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x hide-scrollbar">
            
            {/* Card: Adicionar Novo Craque */}
            <motion.div
              className="min-w-[140px] snap-start flex flex-col items-center justify-center rounded-2xl bg-emerald-500/5 border-2 border-dashed border-emerald-500/30 p-4 cursor-pointer hover:bg-emerald-500/10 transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="text-emerald-400" size={24} />
              </div>
              <p className="text-sm font-semibold text-emerald-400">Novo Craque</p>
            </motion.div>

            {/* Cards dos Jogadores */}
            {[...roster].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10).map((player) => (
              <motion.div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="min-w-[140px] snap-start relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex flex-col items-center hover:bg-white/10 transition-colors cursor-pointer"
                whileHover={{ y: -5 }}
              >
                {/* Rating (Estrela) */}
                <div className="absolute top-3 left-3 flex items-center gap-1 text-amber-400 font-bold text-sm">
                  <Star size={12} className="fill-amber-400" />
                  {player.rating}
                </div>

                {/* Avatar Placeholder (Iniciais) */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-white/10 flex items-center justify-center mt-6 mb-3 shadow-inner">
                  <span className="text-xl font-bold text-slate-300">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Nome e Posição */}
                <h3 className="text-white font-semibold text-sm mb-2 text-center truncate w-full">
                  {player.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${positionColors[player.position] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                  {player.position}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <PlayerProfileModal 
         player={selectedPlayer} 
         isOpen={!!selectedPlayer} 
         onClose={() => setSelectedPlayer(null)} 
      />
      <AddPlayerModal 
         isOpen={showAddModal}
         onClose={() => setShowAddModal(false)}
         onConfirm={handleAddPlayer}
      />

      {/* CSS para esconder a barra de rolagem no carrossel */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
