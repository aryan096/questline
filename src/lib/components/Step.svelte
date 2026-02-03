<script lang="ts">
  import type { Step as StepType, QuestStatus } from '$lib/types';
  import { quests } from '$lib/stores/quests';
  import { scale, fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let { step, questId, questStatus = 'active' }: { step: StepType; questId: string; questStatus?: QuestStatus } = $props();

  let showConfirmDelete = $state(false);
  let justCompleted = $state(false);

  const isLocked = $derived(questStatus === 'completed' || questStatus === 'abandoned');

  function handleToggle() {
    if (isLocked) return;
    
    const wasCompleted = step.completed;
    quests.toggleStep(questId, step.id);
    
    // Show completion animation
    if (!wasCompleted) {
      justCompleted = true;
      setTimeout(() => {
        justCompleted = false;
      }, 600);
    }
  }

  function handleDelete() {
    quests.deleteStep(questId, step.id);
    showConfirmDelete = false;
  }
</script>

<div 
  class="flex items-start gap-3 p-3 rounded-lg bg-white hover:bg-background-beige transition-all duration-200 group relative"
  class:bg-status-success={justCompleted}
  class:bg-opacity-20={justCompleted}
  transition:fly={{ x: -20, duration: 300 }}
>
  <!-- Checkbox with animation -->
  <div class="relative mt-1">
    <input
      type="checkbox"
      checked={step.completed}
      onchange={handleToggle}
      disabled={isLocked}
      class="w-5 h-5 rounded border-2 border-background-brown text-xp-gold focus:ring-2 focus:ring-xp-gold focus:ring-offset-2 transition-transform duration-200 {isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'}"
      id={`step-${step.id}`}
    />
    {#if justCompleted}
      <div 
        class="absolute -top-1 -right-1 text-xp-gold text-xs font-bold"
        transition:scale={{ duration: 400, easing: backOut }}
      >
        +{step.xpValue}
      </div>
    {/if}
  </div>
  
  <label for={`step-${step.id}`} class="flex-1 cursor-pointer">
    <span 
      class="text-base transition-all duration-300"
      class:line-through={step.completed} 
      class:text-gray-500={step.completed}
    >
      {step.title}
    </span>
    <div class="text-sm text-gray-600 mt-1 flex items-center gap-2">
      <span class="text-xp-gold font-medium">+{step.xpValue} XP</span>
      {#if step.completedAt}
        <span class="text-gray-400">
          • Completed {new Date(step.completedAt).toLocaleDateString()}
        </span>
      {/if}
    </div>
  </label>

  <!-- Delete Button (hidden when quest is completed/abandoned) -->
  {#if !isLocked}
    {#if !showConfirmDelete}
      <button
        onclick={() => showConfirmDelete = true}
        class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-status-danger transition-all duration-200 rounded-lg hover:bg-status-danger hover:bg-opacity-10"
        aria-label="Delete step"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    {:else}
      <div class="flex items-center gap-1" transition:scale={{ duration: 150 }}>
        <button
          onclick={handleDelete}
          class="p-2 text-white bg-status-danger rounded-lg hover:opacity-90 transition-opacity"
          aria-label="Confirm delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          onclick={() => showConfirmDelete = false}
          class="p-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          aria-label="Cancel delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/if}
  {/if}
</div>
