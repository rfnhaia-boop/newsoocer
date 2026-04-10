import { Player } from '@/types';

export const mensalistaPlayers: Player[] = [
  { id: '1', name: 'Reis', goalCount: 0, status: 'active', position: 'Goleiro', rating: 86, stats: { goals: 1, assists: 5, defenses: 45, matchesPlayed: 12 } },
  { id: '2', name: 'Trabuco', goalCount: 0, status: 'active', position: 'Fixo', rating: 89, stats: { goals: 4, assists: 12, defenses: 38, matchesPlayed: 12 } },
  { id: '3', name: 'Guto', goalCount: 0, status: 'active', position: 'Ala', rating: 85, stats: { goals: 15, assists: 20, defenses: 10, matchesPlayed: 11 } },
  { id: '4', name: 'Miguel Dias', goalCount: 0, status: 'active', position: 'Pivô', rating: 91, stats: { goals: 28, assists: 8, defenses: 5, matchesPlayed: 12 } },
  { id: '5', name: 'Jorge', goalCount: 0, status: 'active', position: 'Ala', rating: 84, stats: { goals: 10, assists: 15, defenses: 12, matchesPlayed: 10 } },
  { id: '6', name: 'Gabriel Ramos', goalCount: 0, status: 'active', position: 'Fixo', rating: 87, stats: { goals: 3, assists: 8, defenses: 25, matchesPlayed: 9 } },
  { id: '7', name: 'Artur', goalCount: 0, status: 'active', position: 'Goleiro', rating: 83, stats: { goals: 0, assists: 2, defenses: 40, matchesPlayed: 10 } },
  { id: '8', name: 'Ricardo', goalCount: 0, status: 'active', position: 'Pivô', rating: 88, stats: { goals: 22, assists: 5, defenses: 4, matchesPlayed: 8 } },
  { id: '9', name: 'Rafael', goalCount: 0, status: 'active', position: 'Ala', rating: 94, stats: { goals: 30, assists: 25, defenses: 15, matchesPlayed: 12 } },
  { id: '10', name: 'João', goalCount: 0, status: 'active', position: 'Ala', rating: 82, stats: { goals: 8, assists: 10, defenses: 8, matchesPlayed: 7 } },
  { id: '11', name: 'Marcelo', goalCount: 0, status: 'active', position: 'Fixo', rating: 80, stats: { goals: 2, assists: 6, defenses: 20, matchesPlayed: 8 } },
  { id: '12', name: 'Murilo', goalCount: 0, status: 'active', position: 'Pivô', rating: 85, stats: { goals: 18, assists: 4, defenses: 2, matchesPlayed: 11 } },
];

// samplePlayers kept for backward compatibility
export const samplePlayers = mensalistaPlayers;

export const teamNames = [
  'City', 'Galácticos', 'Paris', 'Real',
  'Inter', 'Milan', 'Titãs', 'Spartans',
];

export const teamColors = [
  { color: '#3b82f6', accent: '#60a5fa' }, // blue
  { color: '#ef4444', accent: '#f87171' }, // red
  { color: '#22c55e', accent: '#4ade80' }, // green
  { color: '#f59e0b', accent: '#fbbf24' }, // amber
  { color: '#8b5cf6', accent: '#a78bfa' }, // violet
  { color: '#ec4899', accent: '#f472b6' }, // pink
  { color: '#06b6d4', accent: '#22d3ee' }, // cyan
  { color: '#f97316', accent: '#fb923c' }, // orange
];
