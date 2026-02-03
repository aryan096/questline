// Data validation utilities

import type { Quest, Step, AppData, QuestType, QuestStatus } from '$lib/types';
import { SCHEMA_VERSION } from '$lib/types';

/**
 * Validate quest type
 */
export function isValidQuestType(type: string): type is QuestType {
  return type === 'main' || type === 'side';
}

/**
 * Validate quest status
 */
export function isValidQuestStatus(status: string): status is QuestStatus {
  return ['active', 'paused', 'completed', 'abandoned'].includes(status);
}

/**
 * Validate a Step object
 */
export function isValidStep(step: unknown): step is Step {
  if (typeof step !== 'object' || step === null) return false;
  
  const s = step as Partial<Step>;
  
  return (
    typeof s.id === 'string' &&
    typeof s.title === 'string' &&
    typeof s.completed === 'boolean' &&
    typeof s.xpValue === 'number' &&
    (s.completedAt === undefined || typeof s.completedAt === 'number')
  );
}

/**
 * Validate a Quest object
 */
export function isValidQuest(quest: unknown): quest is Quest {
  if (typeof quest !== 'object' || quest === null) return false;
  
  const q = quest as Partial<Quest>;
  
  return (
    typeof q.id === 'string' &&
    typeof q.title === 'string' &&
    typeof q.description === 'string' &&
    isValidQuestType(q.type as string) &&
    isValidQuestStatus(q.status as string) &&
    typeof q.createdAt === 'number' &&
    typeof q.updatedAt === 'number' &&
    (q.completedAt === undefined || typeof q.completedAt === 'number') &&
    Array.isArray(q.steps) &&
    q.steps.every(isValidStep) &&
    (q.reward === undefined || typeof q.reward === 'string') &&
    typeof q.xpValue === 'number'
  );
}

/**
 * Validate AppData structure
 */
export function isValidAppData(data: unknown): data is AppData {
  if (typeof data !== 'object' || data === null) return false;
  
  const d = data as Partial<AppData>;
  
  return (
    typeof d.version === 'string' &&
    typeof d.user === 'object' &&
    d.user !== null &&
    typeof d.user.totalXP === 'number' &&
    typeof d.user.level === 'number' &&
    typeof d.user.completedQuestCount === 'number' &&
    Array.isArray(d.quests) &&
    d.quests.every(isValidQuest) &&
    (d.exportedAt === undefined || typeof d.exportedAt === 'number')
  );
}

/**
 * Check if schema version is compatible
 */
export function isCompatibleVersion(version: string): boolean {
  // For Phase 1, only accept exact match
  // Future versions can implement more sophisticated migration logic
  return version === SCHEMA_VERSION;
}

/**
 * Sanitize string input (trim and limit length)
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Validate quest title (non-empty, reasonable length)
 */
export function isValidTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}

/**
 * Validate quest description (reasonable length)
 */
export function isValidDescription(description: string): boolean {
  return description.trim().length <= 2000;
}
