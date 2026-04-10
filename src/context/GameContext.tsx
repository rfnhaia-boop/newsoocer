'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, GameStatus, SubstitutionRecord, LoanRecord } from '@/types';
import { saveGlobalGoal } from '@/utils/statsStorage';

const initialState: GameState = {
  config: null,
  teams: [],
  teamQueue: [],
  goals: [],
  allGoals: [],
  status: 'setup',
  selectedPlayerId: null,
  elapsedSeconds: 0,
  matchNumber: 1,
  benchPlayers: [],
  substitutions: [],
  loanedPlayers: [],
};

function gameReducer(state: GameState, action: GameAction | { type: 'LOAD_STATE'; payload: GameState }): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SET_CONFIG':
      return { ...state, config: action.payload, status: 'ready' };

    case 'SET_TEAMS':
      return { ...state, teams: action.payload };

    case 'SET_QUEUE':
      return { ...state, teamQueue: action.payload };

    case 'SET_BENCH':
      return { ...state, benchPlayers: action.payload };

    case 'SELECT_PLAYER': {
      const newId =
        state.selectedPlayerId === action.payload ? null : action.payload;
      return { ...state, selectedPlayerId: newId };
    }

    case 'REGISTER_GOAL': {
      const goal = action.payload;
      const updatedTeams = state.teams.map((team) => {
        if (team.id !== goal.teamId) return team;
        return {
          ...team,
          score: team.score + 1,
          players: team.players.map((p) =>
            p.id === goal.scorerId
              ? { ...p, goalCount: p.goalCount + 1 }
              : p
          ),
        };
      });

      // Check if goal limit reached
      const scoringTeam = updatedTeams.find((t) => t.id === goal.teamId);
      const goalLimit = state.config?.goalLimit;
      const goalLimitReached = goalLimit && scoringTeam && scoringTeam.score >= goalLimit;

      return {
        ...state,
        teams: updatedTeams,
        goals: [...state.goals, goal],
        allGoals: [...state.allGoals, goal],
        selectedPlayerId: null,
        status: goalLimitReached ? 'finished' : state.status,
      };
    }

    case 'SET_STATUS':
      return { ...state, status: action.payload };

    case 'TICK':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'RESET_TIMER':
      return { ...state, elapsedSeconds: 0 };

    case 'SWAP_PLAYER': {
      const sub = action.payload;
      const newTeams = state.teams.map((team) => {
        if (team.id !== sub.teamId) return team;
        return {
          ...team,
          players: team.players.map((p) => {
            if (p.id !== sub.outPlayerId) return p;
            const incomingPlayer = state.benchPlayers.find(
              (bp) => bp.id === sub.inPlayerId
            );
            if (!incomingPlayer) return p;
            return { ...incomingPlayer, goalCount: 0 };
          }),
        };
      });

      const newQueue = state.teamQueue.map((team) => {
        if (team.id !== sub.teamId) return team;
        return {
          ...team,
          players: team.players.map((p) => {
            if (p.id !== sub.outPlayerId) return p;
            const incomingPlayer = state.benchPlayers.find(
              (bp) => bp.id === sub.inPlayerId
            );
            if (!incomingPlayer) return p;
            return { ...incomingPlayer, goalCount: 0 };
          }),
        };
      });

      const outgoingPlayer = [...state.teams, ...state.teamQueue]
        .flatMap((t) => t.players)
        .find((p) => p.id === sub.outPlayerId);

      const newBench = state.benchPlayers
        .filter((p) => p.id !== sub.inPlayerId)
        .concat(
          outgoingPlayer
            ? [{ ...outgoingPlayer, goalCount: 0, status: outgoingPlayer.status }]
            : []
        );

      return {
        ...state,
        teams: newTeams,
        teamQueue: newQueue,
        benchPlayers: newBench,
        substitutions: [...state.substitutions, sub],
      };
    }

    // LOAN_PLAYER: borrow a player from a queue team to fill an active team
    case 'LOAN_PLAYER': {
      const loan = action.payload;

      // Remove the player from their original team (in the queue)
      const newQueue = state.teamQueue.map((team) => {
        if (team.id !== loan.originalTeamId) return team;
        return {
          ...team,
          players: team.players.filter((p) => p.id !== loan.playerId),
        };
      });

      // Add the player to the team that needs completion
      const loanedPlayer = state.teamQueue
        .flatMap((t) => t.players)
        .find((p) => p.id === loan.playerId);

      if (!loanedPlayer) return state;

      const newTeams = state.teams.map((team) => {
        if (team.id !== loan.loanedToTeamId) return team;
        return {
          ...team,
          players: [...team.players, { ...loanedPlayer, goalCount: 0 }],
        };
      });

      return {
        ...state,
        teams: newTeams,
        teamQueue: newQueue,
        loanedPlayers: [...state.loanedPlayers, loan],
      };
    }

    // RETURN_LOANS: return all loaned players from a team back to their original teams
    case 'RETURN_LOANS': {
      const { teamId } = action.payload;
      const loansToReturn = state.loanedPlayers.filter(
        (l) => l.loanedToTeamId === teamId
      );

      if (loansToReturn.length === 0) return state;

      const loanedPlayerIds = new Set(loansToReturn.map((l) => l.playerId));

      // Remove loaned players from the active/queue team
      let updatedTeams = state.teams.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          players: team.players.filter((p) => !loanedPlayerIds.has(p.id)),
        };
      });

      let updatedQueue = [...state.teamQueue];

      // Also check queue (if the team already went to queue)
      updatedQueue = updatedQueue.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          players: team.players.filter((p) => !loanedPlayerIds.has(p.id)),
        };
      });

      // Return players to their original teams in the queue
      for (const loan of loansToReturn) {
        const player = [...state.teams, ...state.teamQueue]
          .flatMap((t) => t.players)
          .find((p) => p.id === loan.playerId);

        if (player) {
          updatedQueue = updatedQueue.map((team) => {
            if (team.id !== loan.originalTeamId) return team;
            // Only add back if not already there
            if (team.players.some((p) => p.id === loan.playerId)) return team;
            return {
              ...team,
              players: [...team.players, { ...player, goalCount: 0 }],
            };
          });
        }
      }

      // Remove returned loans from records
      const remainingLoans = state.loanedPlayers.filter(
        (l) => l.loanedToTeamId !== teamId
      );

      return {
        ...state,
        teams: updatedTeams,
        teamQueue: updatedQueue,
        loanedPlayers: remainingLoans,
      };
    }

    case 'UPDATE_GOAL_LIMIT': {
      if (!state.config) return state;
      const newGoalLimit = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          goalLimit: newGoalLimit,
          endCondition: newGoalLimit
            ? state.config.durationMinutes > 0
              ? 'time_or_goals'
              : 'goals'
            : 'time',
        },
      };
    }

    case 'UPDATE_DURATION': {
      if (!state.config) return state;
      return {
        ...state,
        config: {
          ...state.config,
          durationMinutes: action.payload,
        },
      };
    }

    case 'ROTATE_TEAMS': {
      const { winnerTeamId } = action.payload;
      const [teamA, teamB] = state.teams;
      if (!teamA || !teamB || state.teamQueue.length === 0) return state;

      const winner = teamA.id === winnerTeamId ? teamA : teamB;
      const loser = teamA.id === winnerTeamId ? teamB : teamA;

      // Next team from queue
      const [nextTeam, ...remainingQueue] = state.teamQueue;

      // === Return loaned players BEFORE rotation ===
      // For both teams, find loaned players and return them to original teams
      const allActiveLoans = state.loanedPlayers;
      const loserLoanedIds = new Set(
        allActiveLoans.filter((l) => l.loanedToTeamId === loser.id).map((l) => l.playerId)
      );
      const winnerLoanedIds = new Set(
        allActiveLoans.filter((l) => l.loanedToTeamId === winner.id).map((l) => l.playerId)
      );

      // Strip loaned players from loser and winner
      let cleanLoser = {
        ...loser,
        players: loser.players.filter((p) => !loserLoanedIds.has(p.id)),
      };
      let cleanWinner = {
        ...winner,
        players: winner.players.filter((p) => !winnerLoanedIds.has(p.id)),
      };

      // Return loaned players to their original teams in the queue
      let updatedRemainingQueue = [...remainingQueue];
      for (const loan of allActiveLoans) {
        const player = [...state.teams]
          .flatMap((t) => t.players)
          .find((p) => p.id === loan.playerId);
        if (player) {
          updatedRemainingQueue = updatedRemainingQueue.map((team) => {
            if (team.id !== loan.originalTeamId) return team;
            if (team.players.some((p) => p.id === loan.playerId)) return team;
            return {
              ...team,
              players: [...team.players, { ...player, goalCount: 0 }],
            };
          });
          // Also check if the nextTeam needs returning
          if (nextTeam.id === loan.originalTeamId && !nextTeam.players.some((p) => p.id === loan.playerId)) {
            nextTeam.players = [...nextTeam.players, { ...player, goalCount: 0 }];
          }
        }
      }

      // Revert temporary substitutions for the loser team
      const tempSubs = state.substitutions.filter(
        (s) => !s.isPermanent && s.teamId === loser.id
      );
      let revertedLoser = { ...cleanLoser };
      let updatedBench = [...state.benchPlayers];

      for (const sub of tempSubs) {
        const outPlayer = updatedBench.find((p) => p.id === sub.outPlayerId);
        if (outPlayer) {
          revertedLoser = {
            ...revertedLoser,
            players: revertedLoser.players.map((p) =>
              p.id === sub.inPlayerId
                ? { ...outPlayer, goalCount: 0 }
                : p
            ),
          };
          updatedBench = updatedBench
            .filter((p) => p.id !== sub.outPlayerId)
            .concat(
              revertedLoser.players
                .filter((p) => p.id === sub.inPlayerId)
                .map((p) => ({ ...p, goalCount: 0 }))
            );
        }
      }

      // Reset scores and goalCounts for the new match
      const resetTeam = (team: typeof winner) => ({
        ...team,
        score: 0,
        players: team.players.map((p) => ({ ...p, goalCount: 0 })),
      });

      // Loser goes to back of queue
      const updatedQueue = [...updatedRemainingQueue, resetTeam(revertedLoser)];

      // Clear temp subs for this rotation
      const remainingSubs = state.substitutions.filter(
        (s) => s.isPermanent || s.teamId !== loser.id
      );

      return {
        ...state,
        teams: [resetTeam(cleanWinner), resetTeam(nextTeam)],
        teamQueue: updatedQueue,
        benchPlayers: updatedBench,
        substitutions: remainingSubs,
        loanedPlayers: [], // all loans cleared after rotation
        goals: [],
        selectedPlayerId: null,
        elapsedSeconds: 0,
        status: 'ready',
        matchNumber: state.matchNumber + 1,
      };
    }

    case 'RESET_GAME':
      return { ...initialState };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction | { type: 'LOAD_STATE'; payload: GameState }>;
  selectPlayer: (id: string) => void;
  registerGoal: (directPlayerId?: string) => void;
  setStatus: (status: GameStatus) => void;
  rotateTeams: (winnerTeamId: string) => void;
  swapPlayer: (sub: SubstitutionRecord) => void;
  loanPlayer: (loan: LoanRecord) => void;
  returnLoans: (teamId: string) => void;
  updateGoalLimit: (limit: number | null) => void;
  updateDuration: (minutes: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('futsal_game_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.status && parsed.teams) {
           // Basic validation to see if it's a valid state object
           dispatch({ type: 'LOAD_STATE', payload: parsed });
        }
      }
    } catch (e) {
      console.error("Failed to load game state", e);
    }
  }, []);

  // Set state to localStorage on every change if not in setup
  useEffect(() => {
    try {
      if (state.status !== 'setup') {
        localStorage.setItem('futsal_game_state', JSON.stringify(state));
      } else {
        localStorage.removeItem('futsal_game_state');
      }
    } catch (e) {}
  }, [state]);

  const selectPlayer = (id: string) => {
    dispatch({ type: 'SELECT_PLAYER', payload: id });
  };

  const registerGoal = (directPlayerId?: string) => {
    const targetId = directPlayerId || state.selectedPlayerId;
    if (!targetId) return;

    const scorerTeam = state.teams.find((t) =>
      t.players.some((p) => p.id === targetId)
    );
    if (!scorerTeam) return;

    const scorer = scorerTeam.players.find(
      (p) => p.id === targetId
    );
    if (!scorer) return;

    const minutePlayed = Math.floor(state.elapsedSeconds / 60);

    const goal = {
      id: `goal-${Date.now()}`,
      scorerId: scorer.id,
      scorerName: scorer.name,
      teamId: scorerTeam.id,
      teamName: scorerTeam.name,
      timestamp: Date.now(),
      minute: minutePlayed,
    };

    dispatch({ type: 'REGISTER_GOAL', payload: goal });
    saveGlobalGoal(goal); // Save globally for the Estatísticas dashboard
  };

  const setStatus = (status: GameStatus) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  };

  const rotateTeams = (winnerTeamId: string) => {
    dispatch({ type: 'ROTATE_TEAMS', payload: { winnerTeamId } });
  };

  const swapPlayer = (sub: SubstitutionRecord) => {
    dispatch({ type: 'SWAP_PLAYER', payload: sub });
  };

  const loanPlayer = (loan: LoanRecord) => {
    dispatch({ type: 'LOAN_PLAYER', payload: loan });
  };

  const returnLoans = (teamId: string) => {
    dispatch({ type: 'RETURN_LOANS', payload: { teamId } });
  };

  const updateGoalLimit = (limit: number | null) => {
    dispatch({ type: 'UPDATE_GOAL_LIMIT', payload: limit });
  };

  const updateDuration = (minutes: number) => {
    dispatch({ type: 'UPDATE_DURATION', payload: minutes });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        selectPlayer,
        registerGoal,
        setStatus,
        rotateTeams,
        swapPlayer,
        loanPlayer,
        returnLoans,
        updateGoalLimit,
        updateDuration,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
