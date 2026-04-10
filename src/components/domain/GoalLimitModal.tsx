'use client';

import { motion } from 'framer-motion';
import { Target, Infinity as InfinityIcon } from 'lucide-react';

interface GoalLimitModalProps {
  selectedLimit: number | null;
  onSelect: (limit: number | null) => void;
  duration: number;
}

const goalOptions = [
  { value: null, label: 'Sem limite', desc: 'Jogo acaba só pelo tempo', icon: '∞' },
  { value: 2, label: '2 gols', desc: 'Rápido e decisivo', icon: '⚽' },
  { value: 3, label: '3 gols', desc: 'Equilibrado', icon: '⚽' },
  { value: 5, label: '5 gols', desc: 'Partida completa', icon: '⚽' },
];

export default function GoalLimitModal({
  selectedLimit,
  onSelect,
  duration,
}: GoalLimitModalProps) {
  const getEndConditionText = () => {
    if (selectedLimit === null) {
      return `A partida acaba em ${duration} minutos`;
    }
    return `A partida acaba em ${duration} min OU quando um time fizer ${selectedLimit} gols`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {goalOptions.map((opt, i) => {
          const active = selectedLimit === opt.value;
          return (
            <motion.button
              key={opt.value ?? 'none'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(opt.value)}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
                active
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-white/5 hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors ${
                  active
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {opt.icon}
              </div>
              <div className="text-left flex-1">
                <span
                  className={`text-lg font-bold ${
                    active ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="ml-2 text-sm text-gray-500">{opt.desc}</span>
              </div>
              {active && (
                <motion.div
                  layoutId="goal-limit-check"
                  className="ml-auto h-3 w-3 rounded-full bg-amber-500"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          <Target size={12} className="text-emerald-400" />
          Condição de Fim
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {getEndConditionText()}
        </p>
        {selectedLimit !== null && (
          <p className="mt-1 text-xs text-amber-400/80">
            ⚡ O que acontecer primeiro encerra a partida
          </p>
        )}
      </motion.div>
    </div>
  );
}
