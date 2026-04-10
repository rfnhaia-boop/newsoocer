'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Swords, Users, Check, ClipboardCopy, X, RefreshCw } from 'lucide-react';
import { Team, Player } from '@/types';

interface MatchupScreenProps {
  team1: Team;
  team2: Team;
  queueTeams?: Team[];
  onUpdateTeams: (team1: Team, team2: Team, queue: Team[]) => void;
  onStartGame: () => void;
}


export default function MatchupScreen({ team1, team2, queueTeams = [], onUpdateTeams, onStartGame }: MatchupScreenProps) {
  const [arrivedPlayers, setArrivedPlayers] = useState<Set<string>>(new Set());
  
  // Modals
  const [selectedQueueTeam, setSelectedQueueTeam] = useState<Team | null>(null);

  // Swap State
  const [swapTarget, setSwapTarget] = useState<{ teamId: string, player: Player } | null>(null);

  const totalPlayers1 = team1.players.length;
  const totalPlayers2 = team2.players.length;

  const leftQueue = queueTeams.slice(0, Math.ceil(queueTeams.length / 2));
  const rightQueue = queueTeams.slice(Math.ceil(queueTeams.length / 2));

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleCopyTeams = () => {
    const allTeams = [team1, team2, ...queueTeams];
    let text = '🎮 *TIMES DEFINIDOS* 🎮\n\n';
    allTeams.forEach(t => {
      text += `🛡️ *${t.name}*\n`;
      t.players.forEach((p, i) => {
        text += `${i + 1}. ${p.name}\n`;
      });
      text += '\n';
    });

    const triggerSuccess = () => alert('Times copiados e prontos para enviar no WhatsApp!');

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(triggerSuccess)
        .catch(() => fallbackCopy(text, triggerSuccess));
    } else {
      fallbackCopy(text, triggerSuccess);
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.bottom = "0";
    textArea.style.right = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (err) {
      console.error('Falha no fallback de cópia', err);
      alert('Ops! O navegador bloqueou a cópia. Se estiver no celular, copie os nomes manualmente.');
    }
    textArea.remove();
  };

  const toggleArrival = (playerId: string) => {
    const next = new Set(arrivedPlayers);
    if (next.has(playerId)) next.delete(playerId);
    else next.add(playerId);
    setArrivedPlayers(next);
  };

  const handlePlayerClick = (teamId: string, player: Player) => {
    if (!swapTarget) {
      setSwapTarget({ teamId, player });
    } else {
      // Do swap
      if (swapTarget.player.id === player.id) {
        setSwapTarget(null); // Cancel
        return;
      }
      executeSwap(swapTarget.teamId, swapTarget.player, teamId, player);
      setSwapTarget(null);
    }
  };

  const executeSwap = (t1Id: string, p1: Player, t2Id: string, p2: Player) => {
    const allTeams = [team1, team2, ...queueTeams];
    
    const newTeams = allTeams.map(t => {
      if (t.id === t1Id) {
        return {
          ...t,
          players: t.players.map(p => p.id === p1.id ? p2 : p)
        };
      }
      if (t.id === t2Id) {
        return {
          ...t,
          players: t.players.map(p => p.id === p2.id ? p1 : p)
        };
      }
      return t;
    });

    onUpdateTeams(newTeams[0], newTeams[1], newTeams.slice(2));
  };

  const swapWholeTeam = (queueTeamId: string, mainTeamPosition: 1 | 2) => {
    const allTeams = [team1, team2, ...queueTeams];
    const qIndex = allTeams.findIndex(t => t.id === queueTeamId);
    if (qIndex < 0) return;

    const targetIndex = mainTeamPosition === 1 ? 0 : 1;
    
    // Swap na array geral
    const temp = allTeams[targetIndex];
    allTeams[targetIndex] = allTeams[qIndex];
    allTeams[qIndex] = temp;

    onUpdateTeams(allTeams[0], allTeams[1], allTeams.slice(2));
    setSelectedQueueTeam(null);
  };

  const renderPlayer = (team: Team, player: Player, index: number, isRevealed: boolean) => {
    if (!isRevealed) {
      return (
        <div key={`empty-${team.id}-${index}`} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 animate-pulse opacity-50">
          <div className="h-10 w-10 rounded-lg bg-gray-700/50" />
          <div className="h-5 w-32 rounded bg-gray-700/50" />
        </div>
      );
    }

    const isSwapping = swapTarget?.player.id === player.id;
    const isArrived = arrivedPlayers.has(player.id);

    return (
      <motion.div
        key={player.id}
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => toggleArrival(player.id)}
        className={`flex items-center gap-3 rounded-xl p-3 border shadow-sm cursor-pointer transition-all ${
          isSwapping ? 'ring-2 ring-emerald-400 bg-emerald-500/20' : 'bg-white/[0.03] hover:bg-white/10'
        }`}
        style={{ borderColor: hexToRgba(team.color, 0.2) }}
      >
        <button 
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold border transition-colors ${
            isArrived 
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
          style={{ 
            backgroundColor: isArrived ? undefined : hexToRgba(team.color, 0.1), 
            color: isArrived ? '#fff' : team.accentColor 
          }}
        >
          {isArrived ? <Check size={20} /> : <span className="opacity-80">{player.name[0].toUpperCase()}</span>}
        </button>
        <div className="flex-1 flex items-center justify-between min-w-0">
           <span className={`font-medium truncate ${isArrived ? 'text-white' : 'text-gray-300'}`}>{player.name}</span>
           <div className="flex items-center">
             {swapTarget && !isSwapping ? (
                <RefreshCw size={14} className="text-gray-500 animate-pulse ml-2 shrink-0" />
             ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlayerClick(team.id, player); }}
                  className="p-2 ml-2 bg-white/5 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-all border border-white/5"
                  title="Trocar Jogador"
                >
                  <RefreshCw size={14} />
                </button>
             )}
           </div>
        </div>
      </motion.div>
    );
  };

  const renderQueueTeamButton = (team: Team, index: number, delay: number) => (
    <motion.button
      key={team.id}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: delay + (index * 0.1), duration: 0.4 }}
      onClick={() => setSelectedQueueTeam(team)}
      className="flex flex-col items-center rounded-2xl border bg-white/5 px-4 py-4 backdrop-blur-sm shadow-sm transition-all hover:bg-white/10 hover:scale-105 w-full cursor-pointer"
      style={{ borderColor: hexToRgba(team.color, 0.3) }}
    >
      <div 
        className="flex h-10 w-10 items-center justify-center rounded-full mb-2 shadow-lg"
        style={{ backgroundColor: hexToRgba(team.color, 0.2), color: team.color, border: `1px solid ${hexToRgba(team.color, 0.4)}` }}
      >
        <Shield size={20} />
      </div>
      <span className="font-bold text-gray-200 text-center">{team.name}</span>
      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
        <Users size={12} />
        <span>{team.players.length} jog.</span>
      </div>
    </motion.button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 p-4 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-[1400px] flex flex-col min-h-full py-8">
        
        {/* Top Header Actions */}
        <div className="absolute top-0 right-0 flex gap-2">
           <button 
             onClick={handleCopyTeams}
             className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all shadow-lg backdrop-blur-md"
           >
             <ClipboardCopy size={16} /> Copiar P/ WhatsApp
           </button>
        </div>

        {/* Swap Mode Indicator */}
        <AnimatePresence>
          {swapTarget && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3"
            >
              <RefreshCw size={20} className="animate-spin-slow" />
              Selecione outro jogador para trocar por {swapTarget.player.name}
              <button 
                onClick={() => setSwapTarget(null)}
                className="ml-2 bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
                title="Cancelar Troca"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Título Centralizado no Topo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mt-12 text-center"
        >
          <div className="mb-2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-4 shadow-2xl shadow-emerald-500/20">
            <Swords size={40} className="text-emerald-400" />
          </div>
          <h2 className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            Partida Pronta
          </h2>
          <p className="mt-2 text-gray-400">Clique nos jogadores para conferir quem chegou</p>
        </motion.div>

        {/* Layout Principal: Fila Esq -> Jogo Centro -> Fila Dir */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 w-full flex-1">
          
          {/* Fila Lateral Esquerda */}
          {leftQueue.length > 0 && (
            <div className="hidden lg:flex flex-col gap-4 w-48 shrink-0 py-4 items-center justify-start">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 w-full text-center">Fila</h4>
              {leftQueue.map((t, idx) => renderQueueTeamButton(t, idx, 0))}
            </div>
          )}

          {/* Times Principais (Centro) */}
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full max-w-4xl shrink-1">
            
            {/* Time 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 rounded-3xl border bg-white/5 p-6 backdrop-blur-sm relative overflow-hidden"
              style={{ borderColor: hexToRgba(team1.color, 0.4) }}
            >
              {/* Glow background effect */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${team1.color}, transparent 70%)` }}
              />

              <div className="mb-6 flex flex-col items-center justify-center gap-2 border-b border-white/10 pb-4 relative z-10">
                <Shield style={{ color: team1.color }} size={28} />
                <h3 className="text-2xl font-bold text-white text-center">{team1.name}</h3>
              </div>
              
              <div className="space-y-3 relative z-10">
                {team1.players.map((player, index) => renderPlayer(team1, player, index, true))}
                
                {Array.from({ length: totalPlayers1 - team1.players.length }).map((_, i) => (
                  <div key={`empty1-extra-${i}`} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 opacity-50">
                    <div className="h-10 w-10 rounded-lg bg-gray-700/30" />
                    <div className="h-5 w-32 rounded bg-gray-700/30" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* VS */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-2xl font-black text-white shadow-2xl border border-white/10"
              >
                VS
              </motion.div>
            </div>

            {/* VS Mobile */}
            <div className="flex md:hidden items-center justify-center py-2">
              <div className="px-4 py-1 rounded-full bg-white/10 text-xl font-black text-gray-300">
                VS
              </div>
            </div>

            {/* Time 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 rounded-3xl border bg-white/5 p-6 backdrop-blur-sm relative overflow-hidden"
              style={{ borderColor: hexToRgba(team2.color, 0.4) }}
            >
              {/* Glow background effect */}
              <div 
                className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${team2.color}, transparent 70%)` }}
              />

              <div className="mb-6 flex flex-col items-center justify-center gap-2 border-b border-white/10 pb-4 relative z-10">
                <Shield style={{ color: team2.color }} size={28} />
                <h3 className="text-2xl font-bold text-white text-center">{team2.name}</h3>
              </div>
              
              <div className="space-y-3 relative z-10">
                {team2.players.map((player, index) => renderPlayer(team2, player, index, true))}
                
                {Array.from({ length: totalPlayers2 - team2.players.length }).map((_, i) => (
                  <div key={`empty2-extra-${i}`} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 opacity-50">
                    <div className="h-10 w-10 rounded-lg bg-gray-700/30" />
                    <div className="h-5 w-32 rounded bg-gray-700/30" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fila Lateral Direita */}
          {rightQueue.length > 0 && (
            <div className="hidden lg:flex flex-col gap-4 w-48 shrink-0 py-4 items-center justify-start">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 w-full text-center">Fila</h4>
              {rightQueue.map((t, idx) => renderQueueTeamButton(t, idx, 0))}
            </div>
          )}

          {/* Fila Mobile */}
          {queueTeams.length > 0 && (
            <div className="flex lg:hidden flex-wrap justify-center gap-4 mt-8 w-full">
              <div className="w-full text-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Aguardando na Fila</h4>
              </div>
              {queueTeams.map((team, idx) => (
                <div key={team.id} className="w-[140px]">
                  {renderQueueTeamButton(team, idx, 0)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center shrink-0 min-h-[60px]">
          <AnimatePresence>
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartGame}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-10 py-4 text-xl font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                <Zap size={24} />
                Começar Jogo
              </motion.button>
          </AnimatePresence>
        </div>
        
      </div>

      {/* Queue Team Modal */}
      <AnimatePresence>
        {selectedQueueTeam && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border p-6 rounded-3xl w-full max-w-md shadow-2xl relative"
              style={{ borderColor: hexToRgba(selectedQueueTeam.color, 0.3) }}
            >
               <button onClick={() => setSelectedQueueTeam(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                 <X size={20} />
               </button>

               <div className="flex items-center justify-center gap-3 mb-6">
                 <Shield size={24} style={{ color: selectedQueueTeam.color }} />
                 <h3 className="text-xl font-bold text-white">{selectedQueueTeam.name}</h3>
               </div>
               
               <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                  {selectedQueueTeam.players.map((player, idx) => renderPlayer(selectedQueueTeam, player, idx, true))}
                  {selectedQueueTeam.players.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">Nenhum jogador</div>
                  )}
               </div>

               <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                 <p className="text-sm text-gray-400 mb-3 text-center">Você quer colocar este time em quadra agora?</p>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => swapWholeTeam(selectedQueueTeam.id, 1)}
                     className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
                   >
                     Substituir {team1.name}
                   </button>
                   <button 
                     onClick={() => swapWholeTeam(selectedQueueTeam.id, 2)}
                     className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
                   >
                     Substituir {team2.name}
                   </button>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
