'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useGame } from '@/context/GameContext';

export function useTimer() {
  const { state, dispatch, setStatus } = useGame();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = (state.config?.durationMinutes || 10) * 60;
  const remaining = Math.max(0, totalSeconds - state.elapsedSeconds);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalSeconds > 0 ? state.elapsedSeconds / totalSeconds : 0;
  const isLastThirtySeconds = remaining <= 30 && remaining > 0;

  const start = useCallback(() => {
    if (state.status === 'finished') return;
    setStatus('active');
  }, [state.status, setStatus]);

  const pause = useCallback(() => {
    setStatus('paused');
  }, [setStatus]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    dispatch({ type: 'RESET_TIMER' });
    setStatus('ready');
  }, [dispatch, setStatus]);

  useEffect(() => {
    if (state.status === 'active') {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status, dispatch]);

  useEffect(() => {
    if (remaining <= 0 && state.status === 'active') {
      setStatus('finished');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [remaining, state.status, setStatus]);

  return {
    minutes,
    seconds,
    remaining,
    progress,
    isLastThirtySeconds,
    isRunning: state.status === 'active',
    isPaused: state.status === 'paused',
    isFinished: state.status === 'finished',
    start,
    pause,
    reset,
  };
}
