'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Target, Clock, Save } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import Modal from '@/components/ui/Modal';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const goalOptions = [
  { value: null as number | null, label: 'Sem limite' },
  { value: 2, label: '2 gols' },
  { value: 3, label: '3 gols' },
  { value: 5, label: '5 gols' },
];

const durationOptions = [
  { value: 7, label: '7 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
];

export default function GameSettingsModal({
  isOpen,
  onClose,
}: GameSettingsModalProps) {
  const { state, updateGoalLimit, updateDuration } = useGame();

  const [newGoalLimit, setNewGoalLimit] = useState<number | null>(
    state.config?.goalLimit ?? null
  );
  const [newDuration, setNewDuration] = useState<number>(
    state.config?.durationMinutes ?? 10
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateGoalLimit(newGoalLimit);
    updateDuration(newDuration);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const hasChanges =
    newGoalLimit !== (state.config?.goalLimit ?? null) ||
    newDuration !== (state.config?.durationMinutes ?? 10);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações"
      subtitle="Altere as regras para o próximo jogo"
    >
      <div className="space-y-6">
        {/* Goal Limit Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Limite de Gols
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {goalOptions.map((opt) => {
              const active = newGoalLimit === opt.value;
              return (
                <motion.button
                  key={opt.value ?? 'none'}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setNewGoalLimit(opt.value)}
                  className={`rounded-xl border py-3 text-center text-sm font-bold transition-all ${
                    active
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                      : 'border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Duration Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Duração da Partida
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {durationOptions.map((opt) => {
              const active = newDuration === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setNewDuration(opt.value)}
                  className={`rounded-xl border py-3 text-center text-sm font-bold transition-all ${
                    active
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-400'
                      : 'border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            <Settings size={12} className="text-emerald-400" />
            Resumo
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {newGoalLimit
              ? `Próximo jogo: ${newDuration} min ou ${newGoalLimit} gols (o que ocorrer primeiro)`
              : `Próximo jogo: ${newDuration} minutos`}
          </p>
          {hasChanges && (
            <p className="mt-1 text-xs text-emerald-400/80">
              ✨ Alterações serão aplicadas no próximo jogo
            </p>
          )}
        </div>

        {/* Save button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={!hasChanges && !saved}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : hasChanges
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
        >
          {saved ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <Save size={16} />
              </motion.div>
              Salvo!
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar Configurações
            </>
          )}
        </motion.button>
      </div>
    </Modal>
  );
}
