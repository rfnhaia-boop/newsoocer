import { Goal } from '@/types';

const STORAGE_KEY = 'futsal_global_goals';

export interface GlobalGoal extends Goal {
  // Extending in case we need more fields in the future
}

// Ler todos os gols globais
export function getGlobalGoals(): GlobalGoal[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Falha ao ler gols globais', e);
    return [];
  }
}

// Salvar um gol global 
export function saveGlobalGoal(goal: Goal): void {
  if (typeof window === 'undefined') return;
  try {
    const goals = getGlobalGoals();
    goals.push(goal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Falha ao salvar gol global', e);
  }
}

// Limpar todo o histórico de gols (opcional para o admin)
export function clearGlobalGoals(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
