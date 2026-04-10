import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { Team } from '@/types';

interface NextTeamCardProps {
  queue: Team[];
}

export default function NextTeamCard({ queue }: NextTeamCardProps) {
  if (queue.length === 0) return null;

  const nextTeam = queue[0];
  const remaining = queue.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          <ArrowRight size={16} className="text-emerald-400" />
          Próximo Time
        </h3>
        {remaining > 0 && (
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-500">
            +{remaining} na fila
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${nextTeam.color}, ${nextTeam.accentColor})`,
            boxShadow: `0 10px 20px -10px ${nextTeam.color}`,
          }}
        >
          <Users size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-bold text-white" style={{ color: nextTeam.accentColor }}>
            {nextTeam.name}
          </h4>
          <p className="truncate text-sm text-gray-400">
            {nextTeam.players.map((p) => p.name).join(', ')}
          </p>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${nextTeam.color}, transparent)` }} />
    </motion.div>
  );
}
