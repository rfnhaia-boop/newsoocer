'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Play, Activity, BarChart, Clock, ChevronRight, Trophy } from 'lucide-react';
import { Player } from '@/types';

interface PlayerProfileModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerProfileModal({ player, isOpen, onClose }: PlayerProfileModalProps) {
  if (!player) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          {/* Backdrop Escuro Super Imersivo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          {/* Off-canvas Panel (Abre pela direita) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full sm:w-[450px] lg:w-[500px] h-full bg-slate-900 border-l border-white/5 flex flex-col shadow-2xl overflow-y-auto z-10"
          >
             {/* Header Hero Image - Imersivo de Quadra ou Estádio */}
             <div className="relative h-64 w-full bg-slate-800 shrink-0">
               <img 
                 src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1000&auto=format&fit=crop" 
                 alt="Stadium background" 
                 className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
               <button 
                 onClick={onClose}
                 className="absolute top-6 right-6 z-50 text-white/70 hover:text-white bg-slate-950/40 rounded-full p-2 backdrop-blur-md transition-colors"
               >
                 <X size={20} />
               </button>
             </div>

             {/* Conteúdo Principal do Perfil */}
             <div className="px-8 -mt-24 relative z-10 flex-1 pb-12">
                
                {/* Avatar & Identidade */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer inline-block">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                      {/* Avatar placeholder moderno, que simula o usuário real com mais naturalidade que apenas cubos */}
                      <img 
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=1e293b`} 
                        alt={player.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Hover (Edição de Foto) */}
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>

                  <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">{player.name}</h2>
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1 rounded-full mt-2 border border-emerald-500/20">
                     {player.position}
                  </span>
                </div>

                {/* Estatísticas e Desempenho Desportivo */}
                <div className="mt-10">
                   <div className="flex items-center justify-between mb-5">
                     <h3 className="text-lg font-semibold text-slate-100">Performance</h3>
                     <button className="text-xs font-semibold text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
                       Ver Histórico <ChevronRight size={14}/>
                     </button>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     {/* Gols */}
                     <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 flex flex-col justify-between group hover:bg-slate-800 transition-colors">
                       <div className="text-slate-400 mb-3"><Activity size={20} className="group-hover:text-amber-400 transition-colors"/></div>
                       <div>
                         <div className="text-4xl font-black text-white">{player.stats?.goals || 0}</div>
                         <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mt-1">Gols Marcados</div>
                       </div>
                     </div>
                     
                     {/* Assistências */}
                     <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 flex flex-col justify-between group hover:bg-slate-800 transition-colors">
                       <div className="text-slate-400 mb-3"><BarChart size={20} className="group-hover:text-blue-400 transition-colors"/></div>
                       <div>
                         <div className="text-4xl font-black text-white">{player.stats?.assists || 0}</div>
                         <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mt-1">Assistências</div>
                       </div>
                     </div>

                     {/* Partidas */}
                     <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 flex flex-col justify-between group hover:bg-slate-800 transition-colors">
                       <div className="text-slate-400 mb-3"><Clock size={20} className="group-hover:text-white transition-colors"/></div>
                       <div>
                         <div className="text-4xl font-black text-white">{player.stats?.matchesPlayed || 0}</div>
                         <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mt-1">Partidas Realizadas</div>
                       </div>
                     </div>
                     
                     {/* Aproveitamento/Win Rate */}
                     <div className="bg-gradient-to-br from-emerald-900/40 to-slate-800/50 rounded-2xl p-5 border border-emerald-500/20 flex flex-col justify-between text-emerald-400 group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full blur-xl pointer-events-none" />
                       <div className="mb-3 relative z-10"><Trophy size={20} /></div>
                       <div className="relative z-10">
                         <div className="text-4xl font-black text-emerald-400">75%</div>
                         <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-500/70 mt-1">Aproveitamento</div>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Melhores Lances (Highlights) */}
                <div className="mt-12">
                   <div className="flex items-center justify-between mb-5">
                     <div>
                        <h3 className="text-lg font-semibold text-slate-100">Melhores Lances</h3>
                        <p className="text-xs text-slate-400">Momentos registrados nas peladas</p>
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                     {/* Simulação de um Vídeo Vertical / Horizontal */}
                     {[1, 2].map((v) => (
                       <div key={v} className="group relative w-full h-40 rounded-[20px] overflow-hidden bg-slate-800 border border-white/5 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-black/50 transition-all">
                         <img 
                           src={`https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1000&auto=format&fit=crop&sig=${v}`} 
                           alt="Video thumbnail" 
                           className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
                         />
                         
                         {/* Play Button Overlay */}
                         <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                             <Play className="text-white fill-white ml-1" size={24} />
                           </div>
                         </div>

                         {/* Duração & Metadata na parte inferior */}
                         <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-white leading-tight">Golaço contra Amigos FC</span>
                              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold mt-1">Há 2 dias</span>
                           </div>
                           <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md font-mono">
                             1:04
                           </span>
                         </div>
                       </div>
                     ))}

                     {/* Upload Placeholder */}
                     <button className="w-full py-5 mt-2 rounded-[20px] border-2 border-dashed border-slate-700 text-slate-400 font-semibold hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2">
                       <Camera size={18} />
                       Adicionar Lance Mítico
                     </button>
                   </div>
                </div>

             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
