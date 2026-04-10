'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TeamSizeModalProps {
  selectedSize: number;
  onSelect: (size: number) => void;
  totalPlayers: number;
}

const sizes = [
  { value: 5, label: '5v5', desc: 'Futsal clássico' },
  { value: 6, label: '6v6', desc: 'Com goleiro-linha' },
  { value: 7, label: '7v7', desc: 'Society' },
  { value: 12, label: '12v12', desc: 'Campo' },
];

export default function TeamSizeModal({
  selectedSize,
  onSelect,
  totalPlayers,
}: TeamSizeModalProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {sizes.map((size, i) => {
        const active = selectedSize === size.value;
        const numTeams = Math.floor(totalPlayers / size.value);
        const canForm = numTeams >= 2;

        return (
          <motion.button
            key={size.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => canForm && onSelect(size.value)}
            disabled={!canForm}
            className={`group relative flex flex-col items-center rounded-xl border p-5 transition-all duration-300 ${
              !canForm
                ? 'cursor-not-allowed border-white/5 opacity-30'
                : active
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'cursor-pointer border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div
              className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              <Users size={22} />
            </div>
            <span
              className={`text-2xl font-bold ${
                active ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {size.label}
            </span>
            <span className="mt-1 text-xs text-gray-500">{size.desc}</span>
            {canForm && (
              <span className="mt-2 text-xs text-gray-500">
                {numTeams} times possíveis
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
