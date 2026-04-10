'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { FinanceState, FinanceAction, FinanceConfig, FinancePlayer } from '@/types';

const STORAGE_KEY = '@futsalmanager:finance_state';

const defaultState: FinanceState = {
  config: {
    courtCost: 500,
    mensalistaPrice: 53,
    avulsoPrice: 15,
  },
  players: [],
};

// Initialize with a function to read from localStorage immediately
const initializeState = (): FinanceState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse finance state from localStorage', e);
      }
    }
  }
  return defaultState;
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  let newState: FinanceState;

  switch (action.type) {
    case 'SET_STATE':
      newState = action.payload;
      break;

    case 'UPDATE_CONFIG':
      newState = { ...state, config: { ...state.config, ...action.payload } };
      break;

    case 'ADD_PLAYER':
      // Prevent duplicates
      if (state.players.some((p) => p.name.toLowerCase() === action.payload.name.toLowerCase())) {
        newState = state;
      } else {
        newState = { ...state, players: [...state.players, action.payload] };
      }
      break;

    case 'REMOVE_PLAYER':
      newState = { ...state, players: state.players.filter((p) => p.id !== action.payload) };
      break;

    case 'UPDATE_PLAYER':
      newState = {
        ...state,
        players: state.players.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };
      break;

    default:
      return state;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }
  return newState;
}

interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  addPlayer: (name: string, type: 'mensalista' | 'avulso') => void;
  togglePaid: (id: string, currentlyPaid: boolean) => void;
  removePlayer: (id: string) => void;
  updateConfig: (config: Partial<FinanceConfig>) => void;
  changePlayerType: (id: string, newType: 'mensalista' | 'avulso') => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, defaultState);

  // Load from localStorage on mount (to handle SSR hydration issues properly)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(saved) });
      } catch (e) {}
    }
  }, []);

  const addPlayer = (name: string, type: 'mensalista' | 'avulso') => {
    const price = type === 'mensalista' ? state.config.mensalistaPrice : state.config.avulsoPrice;
    dispatch({
      type: 'ADD_PLAYER',
      payload: {
        id: `fin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type,
        hasPaid: false,
        amountPaid: price,
      },
    });
  };

  const togglePaid = (id: string, currentlyPaid: boolean) => {
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: { id, hasPaid: !currentlyPaid },
    });
  };

  const removePlayer = (id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  };

  const updateConfig = (config: Partial<FinanceConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };

  const changePlayerType = (id: string, newType: 'mensalista' | 'avulso') => {
    const amountPaid = newType === 'mensalista' ? state.config.mensalistaPrice : state.config.avulsoPrice;
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: { id, type: newType, amountPaid },
    });
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        dispatch,
        addPlayer,
        togglePaid,
        removePlayer,
        updateConfig,
        changePlayerType,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
