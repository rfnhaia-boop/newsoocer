'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, position: string, rating: number, isMensalista: boolean) => void;
}

export default function AddPlayerModal({ isOpen, onClose, onConfirm }: AddPlayerModalProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Goleiro');
  const [rating, setRating] = useState('75');
  const [isMensalista, setIsMensalista] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onConfirm(name, position, parseInt(rating) || 75, isMensalista);
    // Reset
    setName('');
    setPosition('Goleiro');
    setRating('75');
    setIsMensalista(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#0a0f16] border border-[#1e293b] rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
             
             <button 
               onClick={onClose}
               className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 rounded-full p-2 transition-colors z-10"
             >
               <X size={20} />
             </button>

             <h2 className="text-2xl font-black text-white mb-6">Confirmar Craque</h2>

             <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
               <div>
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nome do Jogador</label>
                 <input 
                   type="text"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-[#111827] border border-[#1f2937] rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                   placeholder="Ex: Falcão"
                   required
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Posição</label>
                   <select 
                     value={position}
                     onChange={(e) => setPosition(e.target.value)}
                     className="w-full bg-[#111827] border border-[#1f2937] rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                   >
                     <option value="Goleiro">Goleiro</option>
                     <option value="Fixo">Fixo</option>
                     <option value="Ala">Ala</option>
                     <option value="Pivô">Pivô</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Rating (0-100)</label>
                   <input 
                     type="number"
                     min="1"
                     max="99"
                     value={rating}
                     onChange={(e) => setRating(e.target.value)}
                     className="w-full bg-[#111827] border border-[#1f2937] rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                   />
                 </div>
               </div>

               <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-center justify-between cursor-pointer mt-2" onClick={() => setIsMensalista(!isMensalista)}>
                  <div>
                    <h3 className="text-sm font-bold text-white">É Mensalista?</h3>
                    <p className="text-xs text-slate-400">Registra direto no painel financeiro.</p>
                  </div>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isMensalista ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-slate-600'}`}>
                    {isMensalista && <Check size={16} className="text-white" />}
                  </div>
               </div>

               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 type="submit"
                 className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors"
               >
                 Adicionar ao Elenco
               </motion.button>
             </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
