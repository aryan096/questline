// Core data types for Questline application

export type QuestType = 'main' | 'side';

export type QuestStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface Step {
  id: string;                    // UUID
  title: string;
  completed: boolean;
  completedAt?: number;          // Unix timestamp
  xpValue: number;               // 10 base XP
}

export interface Quest {
  id: string;                    // UUID
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
  completedAt?: number;          // Unix timestamp
  steps: Step[];
  reward?: string;               // User-defined reward text
  xpValue: number;               // XP earned on completion (50 for side, 200 for main)
}

export interface UserState {
  totalXP: number;
  level: number;
  completedQuestCount: number;
  currentTheme?: string;         // Future: unlockable themes
}

export interface AppData {
  version: string;               // Schema version for migrations (e.g., "1.0.0")
  user: UserState;
  quests: Quest[];
  exportedAt?: number;           // Unix timestamp for export files
}

// XP Constants
export const XP_VALUES = {
  STEP: 10,                      // XP per step completion
  SIDE_QUEST: 50,                // XP per Side Quest completion
  MAIN_QUEST: 200                // XP per Main Quest completion
} as const;

// Quest Limits
export const QUEST_LIMITS = {
  MAX_MAIN_QUESTS: 3             // Maximum active Main Quests
} as const;

// Schema Version
export const SCHEMA_VERSION = '1.0.0';
