<script lang="ts">
  import type { Quest } from '$lib/types';
  import { quests } from '$lib/stores/quests';
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    quest,
    onclick
  }: {
    quest: Quest;
    onclick?: () => void;
  } = $props();

  let showStatusMenu = $state(false);
  let confirmingAction: 'abandon' | null = $state(null);

  const questTypeColor = $derived(
    quest.type === 'main' ? 'questMain' : 'questSide'
  );

  const statusLabel = $derived({
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    abandoned: 'Abandoned'
  }[quest.status]);

  function handleStatusChange(newStatus: typeof quest.status) {
    if (newStatus === 'abandoned') {
      confirmingAction = 'abandon';
      showStatusMenu = false;
    } else {
      quests.updateQuestStatus(quest.id, newStatus);
      showStatusMenu = false;
    }
  }

  function confirmAbandon() {
    quests.updateQuestStatus(quest.id, 'abandoned');
    confirmingAction = null;
  }

  function cancelAction() {
    confirmingAction = null;
  }

  const completedSteps = $derived(quest.steps.filter(s => s.completed).length);
  const totalSteps = $derived(quest.steps.length);
  const progressPercentage = $derived(
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  );
  const allStepsComplete = $derived(totalSteps > 0 && completedSteps === totalSteps);
  const canCompleteQuest = $derived(allStepsComplete || totalSteps === 0);
</script>

<div
  class="quest-card-shadow hover:quest-card-shadow-hover transition-all duration-200 rounded-lg bg-white overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
  onclick={onclick}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onclick?.()}
  role="button"
  tabindex="0"
>
  <!-- Quest Type Banner -->
  <div class="h-2 bg-{questTypeColor}"></div>

  <div class="p-4">
    <!-- Header -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold uppercase tracking-wide text-{questTypeColor}">
            {quest.type === 'main' ? '⭐ Main Quest' : '📜 Side Quest'}
          </span>
        </div>
        <h3 class="text-xl font-bold text-background-brown">
          {quest.title}
        </h3>
      </div>

      <!-- Status Menu -->
      <div class="relative">
        <button
          class="px-3 py-1 text-sm rounded-full bg-background-beige hover:bg-background-brown hover:text-white transition-colors"
          onclick={(e) => {
            e.stopPropagation();
            showStatusMenu = !showStatusMenu;
          }}
        >
          {statusLabel}
        </button>

        {#if showStatusMenu}
          <div
            class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="menu"
            tabindex="-1"
          >
            {#if quest.status !== 'active'}
              <button
                class="w-full text-left px-4 py-2 hover:bg-background-beige transition-colors"
                onclick={() => handleStatusChange('active')}
              >
                Resume
              </button>
            {/if}
            {#if quest.status === 'active'}
              <button
                class="w-full text-left px-4 py-2 hover:bg-background-beige transition-colors"
                onclick={() => handleStatusChange('paused')}
              >
                Pause
              </button>
            {/if}
            {#if quest.status !== 'completed'}
              {#if canCompleteQuest}
                <button
                  class="w-full text-left px-4 py-2 hover:bg-status-success hover:text-white transition-colors"
                  onclick={() => handleStatusChange('completed')}
                >
                  Complete
                </button>
              {:else}
                <div class="px-4 py-2 text-gray-400 text-sm cursor-not-allowed">
                  Complete all steps first
                </div>
              {/if}
            {/if}
            {#if quest.status !== 'abandoned'}
              <button
                class="w-full text-left px-4 py-2 hover:bg-status-danger hover:text-white transition-colors"
                onclick={() => handleStatusChange('abandoned')}
              >
                Abandon
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-700 mb-4 line-clamp-2">
      {quest.description}
    </p>

    <!-- Progress Bar -->
    {#if totalSteps > 0}
      <div class="mb-3">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>{completedSteps} / {totalSteps} steps</span>
          <span>+{quest.xpValue} XP</span>
        </div>
        <div class="w-full h-2 bg-background-beige rounded-full overflow-hidden">
          <div
            class="h-full bg-{questTypeColor} transition-all duration-300"
            style="width: {progressPercentage}%"
          ></div>
        </div>
      </div>
    {:else}
      <div class="text-xs text-gray-500 mb-3">
        No steps yet • +{quest.xpValue} XP
      </div>
    {/if}

    <!-- Reward -->
    {#if quest.reward}
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span>🎁</span>
        <span class="italic">{quest.reward}</span>
      </div>
    {/if}
  </div>
</div>

<!-- Confirmation Dialog -->
{#if confirmingAction === 'abandon'}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onclick={cancelAction}
    onkeydown={(e) => e.key === 'Escape' && cancelAction()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
      transition:scale={{ duration: 200, start: 0.95, easing: backOut }}
    >
      <h3 class="text-xl font-bold text-background-brown mb-3">
        Abandon Quest?
      </h3>
      <p class="text-gray-700 mb-6">
        Are you sure you want to abandon "{quest.title}"? This action cannot be undone.
      </p>
      <div class="flex gap-3 justify-end">
        <button
          class="px-4 py-2 rounded-lg bg-background-beige hover:bg-gray-300 transition-colors"
          onclick={cancelAction}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-status-danger text-white hover:bg-red-700 transition-colors"
          onclick={confirmAbandon}
        >
          Abandon
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
