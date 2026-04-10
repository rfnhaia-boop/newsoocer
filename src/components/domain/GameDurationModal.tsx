'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface GameDurationModalProps {
  selectedDuration: number;
  onSelect: (duration: number) => void;
}

const durations = [
  { value: 7, label: '7 min', desc: 'Relâmpago' },
  { value: 10, label: '10 min', desc: 'Rápido' },
  { value: 15, label: '15 min', desc: 'Normal' },
  { value: 30, label: '30 min', desc: 'Longo' },
  { value: 45, label: '45 min', desc: 'Completo' },
];

export default function GameDurationModal({
  selectedDuration,
  onSelect,
}: GameDurationModalProps) {
  return (
    <div className="space-y-2">
      {durations.map((d, i) => {
        const active = selectedDuration === d.value;
        return (
          <motion.button
            key={d.value}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(d.value)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
              active
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-white/5 hover:border-white/10 hover:bg-white/5'
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              <Clock size={20} />
            </div>
            <div className="text-left">
              <span
                className={`text-lg font-bold ${
                  active ? 'text-emerald-400' : 'text-white'
                }`}
              >
                {d.label}
              </span>
              <span className="ml-2 text-sm text-gray-500">{d.desc}</span>
            </div>
            {active && (
              <motion.div
                layoutId="duration-check"
                className="ml-auto h-3 w-3 rounded-full bg-emerald-500"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
