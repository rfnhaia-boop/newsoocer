import { Player, Team } from '@/types';
import { teamNames, teamColors } from '@/data/samplePlayers';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function distributeTeams(
  players: Player[],
  teamSize: number,
  balanced: boolean = true
): Team[] {
  const numTeams = Math.ceil(players.length / teamSize);

  if (balanced) {
    return balancedDistribution(players, numTeams, teamSize);
  }

  return randomDistribution(players, numTeams, teamSize);
}

function randomDistribution(
  players: Player[],
  numTeams: number,
  teamSize: number
): Team[] {
  const shuffled = shuffleArray(players);
  const teams: Team[] = [];

  const shuffledNames = shuffleArray(teamNames);
  const shuffledColors = shuffleArray(teamColors);

  for (let i = 0; i < numTeams; i++) {
    const start = i * teamSize;
    const end = Math.min(start + teamSize, shuffled.length);
    teams.push({
      id: `team-${i + 1}`,
      name: shuffledNames[i % shuffledNames.length],
      color: shuffledColors[i % shuffledColors.length].color,
      accentColor: shuffledColors[i % shuffledColors.length].accent,
      players: shuffled.slice(start, end).map((p) => ({ ...p, goalCount: 0, status: 'active' as const })),
      score: 0,
    });
  }

  return teams;
}

function balancedDistribution(
  players: Player[],
  numTeams: number,
  teamSize: number
): Team[] {
  const shuffledNames = shuffleArray(teamNames);
  const shuffledColors = shuffleArray(teamColors);

  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    name: shuffledNames[i % shuffledNames.length],
    color: shuffledColors[i % shuffledColors.length].color,
    accentColor: shuffledColors[i % shuffledColors.length].accent,
    players: [],
    score: 0,
  }));

  const teamRatings = new Array(numTeams).fill(0);

  // Position priority
  const positionOrder = ['Goleiro', 'Fixo', 'Ala', 'Pivô', 'Unknown'];
  
  const playersByPos: Record<string, Player[]> = {};
  for (const p of players) {
    const pos = p.position || 'Unknown';
    if (!playersByPos[pos]) playersByPos[pos] = [];
    playersByPos[pos].push(p);
  }

  for (const pos of positionOrder) {
    if (!playersByPos[pos]) continue;
    
    // Sort players in this position by rating
    const sortedGroup = [...playersByPos[pos]].sort((a, b) => {
      const valA = a.rating ?? a.level ?? 50;
      const valB = b.rating ?? b.level ?? 50;
      return valB - valA;
    });

    for (const player of sortedGroup) {
      let minIdx = 0;
      let minLevel = Infinity;
      for (let i = 0; i < numTeams; i++) {
        if (teams[i].players.length < teamSize && teamRatings[i] < minLevel) {
          minLevel = teamRatings[i];
          minIdx = i;
        }
      }
      teams[minIdx].players.push({ ...player, goalCount: 0, status: 'active' as const });
      teamRatings[minIdx] += player.rating ?? player.level ?? 50;
    }
  }

  return teams;
}
