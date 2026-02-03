// XP calculation utilities

import { XP_VALUES } from '$lib/types';

/**
 * Calculate level from total XP
 * Formula: level = floor(sqrt(totalXP / 100))
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}

/**
 * Calculate XP required for a specific level
 */
export function xpForLevel(level: number): number {
  return level * level * 100;
}

/**
 * Calculate XP progress to next level
 * Returns { current: number, required: number, percentage: number }
 */
export function xpProgress(totalXP: number): {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  requiredXP: number;
  percentage: number;
} {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = currentLevel + 1;
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(nextLevel);
  const currentXP = totalXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const percentage = (currentXP / requiredXP) * 100;

  return {
    currentLevel,
    nextLevel,
    currentXP,
    requiredXP,
    percentage
  };
}

/**
 * Get XP value for a quest based on type
 */
export function getQuestXPValue(type: 'main' | 'side'): number {
  return type === 'main' ? XP_VALUES.MAIN_QUEST : XP_VALUES.SIDE_QUEST;
}

/**
 * Get XP value for a step
 */
export function getStepXPValue(): number {
  return XP_VALUES.STEP;
}
