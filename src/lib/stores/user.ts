// User state store

import { writable, derived } from 'svelte/store';
import type { UserState } from '$lib/types';
import { calculateLevel } from '$lib/utils/xp';

function createUserStore() {
  const { subscribe, set, update } = writable<UserState>({
    totalXP: 0,
    level: 0,
    completedQuestCount: 0
  });

  return {
    subscribe,
    
    /**
     * Set the entire user state
     */
    set,
    
    /**
     * Award XP and recalculate level
     */
    awardXP: (xp: number) => update(state => {
      const newTotalXP = state.totalXP + xp;
      const newLevel = calculateLevel(newTotalXP);
      
      return {
        ...state,
        totalXP: newTotalXP,
        level: newLevel
      };
    }),
    
    /**
     * Increment completed quest count
     */
    incrementQuestCount: () => update(state => ({
      ...state,
      completedQuestCount: state.completedQuestCount + 1
    })),
    
    /**
     * Reset user state to initial values
     */
    reset: () => set({
      totalXP: 0,
      level: 0,
      completedQuestCount: 0
    })
  };
}

export const user = createUserStore();
