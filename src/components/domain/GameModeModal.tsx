'use client';

import { motion } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';
import { GameMode } from '@/types';

interface GameModeModalProps {
  onSelect: (mode: GameMode) => void;
}

export default function GameModeModal({ onSelect }: GameModeModalProps) {
  const modes = [
    {
      id: 'ganhe_fique' as GameMode,
      title: 'Ganhe e Fique',
      description: 'Partidas dinâmicas. O time que vence continua na quadra, o próximo da fila entra.',
      icon: Zap,
      gradient: 'from-emerald-500 to-cyan-500',
      shadowColor: 'shadow-emerald-500/25',
      glowRule: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
      borderRule: 'group-hover:border-emerald-500/50',
    },
    {
      id: 'campeonato' as GameMode,
      title: 'Campeonato',
      description: 'Torneios estruturados com fases de grupo e mata-mata.',
      icon: Trophy,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      glowRule: '',
      borderRule: '',
      disabled: true,
    },
  ];

  return (
    <div className="grid gap-4">
      {modes.map((mode, i) => (
        <motion.button
          key={mode.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => !mode.disabled && onSelect(mode.id)}
          disabled={mode.disabled}
          className={`group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br from-white/[0.04] to-transparent p-6 text-center transition-all duration-300 sm:flex-row sm:text-left ${
            mode.disabled
              ? 'cursor-not-allowed border-white/5 opacity-50'
              : `cursor-pointer border-white/10 hover:bg-white/[0.08] hover:-translate-y-1 ${mode.borderRule} ${mode.glowRule}`
          }`}
        >
          {/* Animated background glow on hover */}
          {!mode.disabled && (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 opacity-0 transition-opacity duration-500 group-hover:from-emerald-500/5 group-hover:via-cyan-500/5 group-hover:to-emerald-500/5 group-hover:opacity-100" />
          )}

          <div
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${mode.gradient} ${mode.shadowColor} shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <mode.icon size={32} className="text-white" />
          </div>

          <div className="flex-1 relative z-10">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <h3 className="text-xl font-bold text-white tracking-wide">{mode.title}</h3>
              {mode.disabled && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Em breve
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto sm:mx-0">
              {mode.description}
            </p>
          </div>

          {!mode.disabled && (
            <div className="relative z-10 mx-auto mt-2 sm:mt-0 sm:ml-auto">
              <div className="flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25">
                Selecionar →
              </div>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
