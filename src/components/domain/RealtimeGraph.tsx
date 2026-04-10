'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useGame } from '@/context/GameContext';
import { useState } from 'react';
import { motion } from 'framer-motion';

type ChartView = 'radar' | 'bar';

export default function RealtimeGraph() {
  const { state } = useGame();
  const [view, setView] = useState<ChartView>('bar');

  const [teamA, teamB] = state.teams;
  if (!teamA || !teamB) return null;

  // Bar chart: goals per player
  const allPlayers = [...teamA.players, ...teamB.players]
    .filter((p) => p.goalCount > 0)
    .sort((a, b) => b.goalCount - a.goalCount)
    .slice(0, 8);

  const barData = allPlayers.map((p) => {
    const team = teamA.players.find((tp) => tp.id === p.id) ? teamA : teamB;
    return {
      name: p.name,
      gols: p.goalCount,
      color: team.color,
    };
  });

  // Radar chart
  const radarData = [
    { stat: 'Gols', A: teamA.score, B: teamB.score },
    { stat: 'Jogadores', A: teamA.players.length, B: teamB.players.length },
    {
      stat: 'Artilheiro',
      A: Math.max(...teamA.players.map((p) => p.goalCount), 0),
      B: Math.max(...teamB.players.map((p) => p.goalCount), 0),
    },
    {
      stat: 'Média',
      A: teamA.players.length > 0 ? +(teamA.score / teamA.players.length).toFixed(1) : 0,
      B: teamB.players.length > 0 ? +(teamB.score / teamB.players.length).toFixed(1) : 0,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-4">
      {/* Toggle */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Estatísticas</h3>
        <div className="flex rounded-lg bg-white/[0.04] p-0.5">
          {(['bar', 'radar'] as ChartView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                view === v
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {v === 'bar' ? '📊 Artilheiros' : '🎯 Comparativo'}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="h-56"
      >
        {view === 'bar' ? (
          barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1729',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="gols" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <span className="text-3xl opacity-20">📊</span>
              <span className="text-xs text-gray-600">Nenhum gol registrado ainda</span>
            </div>
          )
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar
                name={teamA.name}
                dataKey="A"
                stroke={teamA.color}
                fill={teamA.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name={teamB.name}
                dataKey="B"
                stroke={teamB.color}
                fill={teamB.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ color: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1729',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
