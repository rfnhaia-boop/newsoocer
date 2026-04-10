'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Calendar, Clock, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { getGlobalGoals, GlobalGoal } from '@/utils/statsStorage';

type TimeFilter = 'hoje' | 'semana' | 'mes' | 'todos';

interface PlayerStat {
  id: string;
  name: string;
  goals: number;
}

export default function EstatisticasPage() {
  const [goals, setGoals] = useState<GlobalGoal[]>([]);
  const [filter, setFilter] = useState<TimeFilter>('mes');

  useEffect(() => {
    // Carrega os gols globais do storage local
    const savedGoals = getGlobalGoals();
    setGoals(savedGoals);
  }, []);

  const filteredGoals = useMemo(() => {
    const now = Date.now();
    return goals.filter(goal => {
      const diff = now - goal.timestamp;
      switch (filter) {
        case 'hoje':
          return diff <= 24 * 60 * 60 * 1000;
        case 'semana':
          return diff <= 7 * 24 * 60 * 60 * 1000;
        case 'mes':
          return diff <= 30 * 24 * 60 * 60 * 1000;
        case 'todos':
        default:
          return true;
      }
    });
  }, [goals, filter]);

  const leaderboard = useMemo(() => {
    const statsMap = new Map<string, PlayerStat>();

    filteredGoals.forEach((g) => {
      if (!statsMap.has(g.scorerId)) {
        statsMap.set(g.scorerId, { id: g.scorerId, name: g.scorerName, goals: 0 });
      }
      const p = statsMap.get(g.scorerId)!;
      p.goals += 1;
    });

    return Array.from(statsMap.values()).sort((a, b) => b.goals - a.goals);
  }, [filteredGoals]);

  const topScorer = leaderboard.length > 0 ? leaderboard[0] : null;

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl relative z-10">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 border border-white/10 text-gray-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-3">
            <Trophy className="text-purple-400" size={24} />
            <h1 className="text-2xl font-black text-white tracking-tight">Estatísticas (Mensalistas)</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { id: 'hoje', label: 'Neste Jogo (24h)', icon: Clock },
            { id: 'semana', label: 'Nesta Semana', icon: Calendar },
            { id: 'mes', label: 'Neste Mês', icon: BarChart2 },
            { id: 'todos', label: 'Sempre', icon: Trophy }
          ].map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as TimeFilter)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-lg ${
                  isActive
                    ? 'bg-purple-500 text-white shadow-purple-500/25 border border-purple-400'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Highlights */}
        {topScorer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/30 p-8 shadow-2xl flex flex-col md:flex-row items-center gap-6"
          >
            <div className="h-20 w-20 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-cyan-400 text-3xl shadow-inner border border-white/20">
              👑
            </div>
            <div className="text-center md:text-left">
              <span className="text-sm font-bold uppercase tracking-widest text-purple-300">Artilheiro do Período</span>
              <h2 className="text-4xl font-black text-white mt-1 mb-2">
                {topScorer.name}
              </h2>
              <p className="text-lg text-gray-300">
                <strong className="text-purple-400 text-2xl">{topScorer.goals}</strong> Gols Marcados
              </p>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-1 shadow-2xl overflow-hidden backdrop-blur-md"
        >
          <div className="bg-neutral-900/90 rounded-[22px] min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 relative">
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-widest text-gray-400 w-16 text-center">Pos</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-widest text-gray-400">Jogador</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-widest text-gray-400 text-right">Gols</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-gray-500 font-bold">
                      Nenhum gol registrado para este período.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((player, index) => (
                    <tr 
                      key={player.id} 
                      className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                        index < 3 ? 'bg-purple-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-center font-black">
                        {index === 0 ? <span className="text-amber-400">1º</span> : 
                         index === 1 ? <span className="text-gray-300">2º</span> : 
                         index === 2 ? <span className="text-amber-600">3º</span> : 
                         <span className="text-gray-600">{index + 1}º</span>}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-white">
                        {player.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-center min-w-[3rem] h-8 rounded-lg bg-purple-500/20 text-purple-300 font-black border border-purple-500/30">
                          {player.goals}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
      
      {/* Decorative Gradients */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-cyan-600/20 blur-[100px]" />
      </div>
    </div>
  );
}
