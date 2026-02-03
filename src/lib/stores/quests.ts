// Quest store with CRUD operations

import { writable, derived, get } from 'svelte/store';
import type { Quest, QuestStatus, QuestType, Step } from '$lib/types';
import { QUEST_LIMITS, XP_VALUES } from '$lib/types';
import { generateUUID } from '$lib/utils/uuid';
import { getQuestXPValue, getStepXPValue } from '$lib/utils/xp';
import { user } from './user';
import { saveToLocalStorage, loadFromLocalStorage, getInitialAppData } from './persistence';

function createQuestStore() {
  const { subscribe, set, update } = writable<Quest[]>([]);

  /**
   * Persist current state to LocalStorage
   */
  function persist(quests: Quest[]) {
    const userState = get(user);
    const appData = {
      ...getInitialAppData(),
      user: userState,
      quests
    };
    saveToLocalStorage(appData);
  }

  return {
    subscribe,

    /**
     * Initialize store from LocalStorage
     */
    init: () => {
      const data = loadFromLocalStorage();
      if (data) {
        set(data.quests);
        user.set(data.user);
      } else {
        set([]);
      }
    },

    /**
     * Add a new quest
     */
    addQuest: (
      title: string,
      description: string,
      type: QuestType,
      reward?: string,
      initialSteps: string[] = []
    ): Quest | null => {
      let newQuest: Quest | null = null;

      update(quests => {
        // Check Main Quest limit
        if (type === 'main') {
          const activeMainQuests = quests.filter(
            q => q.type === 'main' && q.status === 'active'
          );
          if (activeMainQuests.length >= QUEST_LIMITS.MAX_MAIN_QUESTS) {
            console.warn('Maximum active Main Quests reached');
            return quests;
          }
        }

        const now = Date.now();
        const steps: Step[] = initialSteps.map(stepTitle => ({
          id: generateUUID(),
          title: stepTitle,
          completed: false,
          xpValue: getStepXPValue()
        }));

        newQuest = {
          id: generateUUID(),
          title,
          description,
          type,
          status: 'active',
          createdAt: now,
          updatedAt: now,
          steps,
          reward,
          xpValue: getQuestXPValue(type)
        };

        const updated = [...quests, newQuest];
        persist(updated);
        return updated;
      });

      return newQuest;
    },

    /**
     * Update quest status
     */
    updateQuestStatus: (questId: string, status: QuestStatus) => {
      update(quests => {
        const updated = quests.map(quest => {
          if (quest.id !== questId) return quest;

          const now = Date.now();
          const updatedQuest = {
            ...quest,
            status,
            updatedAt: now,
            completedAt: status === 'completed' ? now : quest.completedAt
          };

          // Award XP if quest is being completed
          if (status === 'completed' && quest.status !== 'completed') {
            user.awardXP(quest.xpValue);
            user.incrementQuestCount();
          }

          return updatedQuest;
        });

        persist(updated);
        return updated;
      });
    },

    /**
     * Update quest details
     */
    updateQuest: (questId: string, updates: Partial<Quest>) => {
      update(quests => {
        const updated = quests.map(quest => {
          if (quest.id !== questId) return quest;

          return {
            ...quest,
            ...updates,
            updatedAt: Date.now(),
            // Prevent overwriting certain fields
            id: quest.id,
            createdAt: quest.createdAt
          };
        });

        persist(updated);
        return updated;
      });
    },

    /**
     * Delete a quest
     */
    deleteQuest: (questId: string) => {
      update(quests => {
        const updated = quests.filter(q => q.id !== questId);
        persist(updated);
        return updated;
      });
    },

    /**
     * Add a step to a quest
     */
    addStep: (questId: string, stepTitle: string) => {
      update(quests => {
        const updated = quests.map(quest => {
          if (quest.id !== questId) return quest;

          const newStep: Step = {
            id: generateUUID(),
            title: stepTitle,
            completed: false,
            xpValue: getStepXPValue()
          };

          return {
            ...quest,
            steps: [...quest.steps, newStep],
            updatedAt: Date.now()
          };
        });

        persist(updated);
        return updated;
      });
    },

    /**
     * Toggle step completion
     */
    toggleStep: (questId: string, stepId: string) => {
      update(quests => {
        const updated = quests.map(quest => {
          if (quest.id !== questId) return quest;

          const steps = quest.steps.map(step => {
            if (step.id !== stepId) return step;

            const nowCompleted = !step.completed;

            // Award or remove XP
            if (nowCompleted) {
              user.awardXP(step.xpValue);
            } else {
              user.awardXP(-step.xpValue);
            }

            return {
              ...step,
              completed: nowCompleted,
              completedAt: nowCompleted ? Date.now() : undefined
            };
          });

          return {
            ...quest,
            steps,
            updatedAt: Date.now()
          };
        });

        persist(updated);
        return updated;
      });
    },

    /**
     * Update step title
     */
    updateStep: (questId: string, stepId: string, title: string) => {
      update(quests => {
        const updated = quests.map(quest => {
          if (quest.id !== questId) return quest;

          const steps = quest.steps.map(step =>
            step.id === stepId ? { ...step, title } : step
          );

          return {
            ...quest,
            steps,
            updatedAt: Date.now()
          };
        });

        persist(updated);
        return updated;
      });
    },

    /**
     * Delete a step
     */
    deleteStep: (questId: string, stepId: string) => {
      update(quests => {
        const updated = quests.map(quest => {
          if (quest.id !== questId) return quest;

          // Remove XP if step was completed
          const stepToDelete = quest.steps.find(s => s.id === stepId);
          if (stepToDelete?.completed) {
            user.awardXP(-stepToDelete.xpValue);
          }

          return {
            ...quest,
            steps: quest.steps.filter(s => s.id !== stepId),
            updatedAt: Date.now()
          };
        });

        persist(updated);
        return updated;
      });
    },

    /**
     * Clear all quests
     */
    clear: () => {
      set([]);
      persist([]);
    }
  };
}

export const quests = createQuestStore();

// Derived stores for filtered quest lists

export const activeMainQuests = derived(
  quests,
  $quests => $quests.filter(q => q.type === 'main' && q.status === 'active')
);

export const activeSideQuests = derived(
  quests,
  $quests => $quests.filter(q => q.type === 'side' && q.status === 'active')
);

export const pausedQuests = derived(
  quests,
  $quests => $quests.filter(q => q.status === 'paused')
);

export const completedQuests = derived(
  quests,
  $quests => $quests.filter(q => q.status === 'completed')
);

export const abandonedQuests = derived(
  quests,
  $quests => $quests.filter(q => q.status === 'abandoned')
);

/**
 * Derived store to check if Main Quest limit is reached
 */
export const canAddMainQuest = derived(
  activeMainQuests,
  $activeMainQuests => $activeMainQuests.length < QUEST_LIMITS.MAX_MAIN_QUESTS
);
