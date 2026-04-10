import { motion } from 'framer-motion';
import { Trophy, ArrowRight } from 'lucide-react';
import { Team } from '@/types';
import Modal from '@/components/ui/Modal';

interface MatchEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamA: Team;
  teamB: Team;
  onSelectWinner: (winnerId: string) => void;
  nextTeam?: Team;
}

export default function MatchEndModal({
  isOpen,
  onClose,
  teamA,
  teamB,
  onSelectWinner,
  nextTeam,
}: MatchEndModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fim de Jogo!"
      subtitle="Quem ganhou e continua na quadra para o próximo jogo?"
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        {[teamA, teamB].map((team) => (
          <motion.button
            key={team.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onSelectWinner(team.id);
              onClose();
            }}
            className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/50 hover:bg-emerald-500/10"
          >
            <div
              className="absolute inset-x-0 -bottom-px mx-auto h-px w-3/4 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${team.color}, transparent)`,
              }}
            />
            
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${team.color}, ${team.accentColor})`,
                boxShadow: `0 10px 20px -10px ${team.color}`,
              }}
            >
              <Trophy size={32} className="text-white" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white tracking-wide">{team.name}</h3>
              <p className="mt-1 text-sm font-semibold text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                Vencedor! Manter na quadra
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {nextTeam && (
        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
          <p className="text-sm font-semibold lowercase text-gray-400">
            Quem perder será substituído por:
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: nextTeam.accentColor, boxShadow: `0 0 10px ${nextTeam.accentColor}` }}
            />
            <span className="text-sm font-bold text-white tracking-wide uppercase">{nextTeam.name}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
