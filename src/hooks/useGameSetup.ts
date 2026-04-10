'use client';

import { useState, useCallback } from 'react';
import { Player, GameMode, GameConfig, EndCondition } from '@/types';
import { samplePlayers } from '@/data/samplePlayers';

export type SetupStep = 'mode' | 'players' | 'teamSize' | 'duration' | 'goalLimit' | 'done';

const STEPS: SetupStep[] = ['mode', 'players', 'teamSize', 'duration', 'goalLimit', 'done'];

export function useGameSetup() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('mode');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [duration, setDuration] = useState<number>(10);
  const [goalLimit, setGoalLimit] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const allPlayers = samplePlayers;

  const openSetup = useCallback(() => {
    setIsOpen(true);
    setCurrentStep('mode');
    setGameMode(null);
    setSelectedPlayers([]);
    setTeamSize(5);
    setDuration(10);
    setGoalLimit(null);
  }, []);

  const closeSetup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  }, [currentStep]);

  const togglePlayer = useCallback((player: Player) => {
    setSelectedPlayers((prev) => {
      const exists = prev.find((p) => p.id === player.id);
      if (exists) return prev.filter((p) => p.id !== player.id);
      return [...prev, player];
    });
  }, []);

  const selectAllPlayers = useCallback(() => {
    setSelectedPlayers([...allPlayers]);
  }, [allPlayers]);

  const clearPlayers = useCallback(() => {
    setSelectedPlayers([]);
  }, []);

  const setPlayersFromList = useCallback((players: Player[]) => {
    setSelectedPlayers(players);
  }, []);

  const getEndCondition = useCallback((): EndCondition => {
    if (goalLimit && duration > 0) return 'time_or_goals';
    if (goalLimit) return 'goals';
    return 'time';
  }, [goalLimit, duration]);

  const getConfig = useCallback((): GameConfig | null => {
    if (!gameMode) return null;
    return {
      mode: gameMode,
      teamSize,
      durationMinutes: duration,
      goalLimit,
      endCondition: getEndCondition(),
      playerIds: selectedPlayers.map((p) => p.id),
    };
  }, [gameMode, teamSize, duration, goalLimit, selectedPlayers, getEndCondition]);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 'mode':
        return gameMode !== null;
      case 'players':
        return selectedPlayers.length >= teamSize * 2;
      case 'teamSize':
        return teamSize > 0;
      case 'duration':
        return duration > 0;
      case 'goalLimit':
        return true; // goal limit is optional, always can proceed
      default:
        return false;
    }
  }, [currentStep, gameMode, selectedPlayers.length, teamSize, duration]);

  return {
    currentStep,
    gameMode,
    setGameMode,
    selectedPlayers,
    togglePlayer,
    selectAllPlayers,
    clearPlayers,
    setPlayersFromList,
    teamSize,
    setTeamSize,
    duration,
    setDuration,
    goalLimit,
    setGoalLimit,
    allPlayers,
    isOpen,
    openSetup,
    closeSetup,
    nextStep,
    prevStep,
    getConfig,
    canProceed,
  };
}
