export type PlayerPosition = 'Goleiro' | 'Fixo' | 'Ala' | 'Pivô';

export interface PlayerStats {
  goals: number;
  assists: number;
  defenses: number;
  matchesPlayed: number;
}

export interface Player {
  id: string;
  name: string;
  level?: number;
  position?: PlayerPosition;
  rating?: number;
  stats?: PlayerStats;
  goalCount: number;
  status: 'active' | 'injured' | 'out';
}

export interface Team {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  players: Player[];
  score: number;
}

export interface Goal {
  id: string;
  scorerId: string;
  scorerName: string;
  teamId: string;
  teamName: string;
  timestamp: number;
  minute: number;
}

export interface SubstitutionRecord {
  id: string;
  outPlayerId: string;
  outPlayerName: string;
  inPlayerId: string;
  inPlayerName: string;
  teamId: string;
  matchNumber: number;
  isPermanent: boolean;
  reason: 'injury' | 'voluntary' | 'tactical';
}

// Tracks a player temporarily borrowed from another team to fill roster
export interface LoanRecord {
  playerId: string;
  playerName: string;
  originalTeamId: string;
  loanedToTeamId: string;
  matchNumber: number;
}

export type GameStatus = 'setup' | 'ready' | 'active' | 'paused' | 'finished';
export type GameMode = 'ganhe_fique' | 'campeonato';
export type EndCondition = 'time' | 'goals' | 'time_or_goals';

export interface GameConfig {
  mode: GameMode;
  teamSize: number;
  durationMinutes: number;
  goalLimit: number | null;
  endCondition: EndCondition;
  playerIds: string[];
}

export interface GameState {
  config: GameConfig | null;
  teams: Team[];
  teamQueue: Team[];
  goals: Goal[];
  allGoals: Goal[];
  status: GameStatus;
  selectedPlayerId: string | null;
  elapsedSeconds: number;
  matchNumber: number;
  benchPlayers: Player[];
  substitutions: SubstitutionRecord[];
  loanedPlayers: LoanRecord[];
}

export type GameAction =
  | { type: 'SET_CONFIG'; payload: GameConfig }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'SET_QUEUE'; payload: Team[] }
  | { type: 'SET_BENCH'; payload: Player[] }
  | { type: 'SELECT_PLAYER'; payload: string | null }
  | { type: 'REGISTER_GOAL'; payload: Goal }
  | { type: 'SET_STATUS'; payload: GameStatus }
  | { type: 'ROTATE_TEAMS'; payload: { winnerTeamId: string } }
  | { type: 'SWAP_PLAYER'; payload: SubstitutionRecord }
  | { type: 'LOAN_PLAYER'; payload: LoanRecord }
  | { type: 'RETURN_LOANS'; payload: { teamId: string } }
  | { type: 'UPDATE_GOAL_LIMIT'; payload: number | null }
  | { type: 'UPDATE_DURATION'; payload: number }
  | { type: 'TICK' }
  | { type: 'RESET_GAME' }
  | { type: 'RESET_TIMER' };

// Finance Module Types
export type PlayerFinanceType = 'mensalista' | 'avulso';

export interface FinancePlayer {
  id: string;
  name: string;
  type: PlayerFinanceType;
  hasPaid: boolean;
  amountPaid: number;
}

export interface FinanceConfig {
  courtCost: number;
  mensalistaPrice: number;
  avulsoPrice: number;
}

export interface FinanceState {
  config: FinanceConfig;
  players: FinancePlayer[];
}

export type FinanceAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<FinanceConfig> }
  | { type: 'ADD_PLAYER'; payload: FinancePlayer }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: Partial<FinancePlayer> & { id: string } }
  | { type: 'SET_STATE'; payload: FinanceState };
