<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { quests } from '$lib/stores/quests';
  import Step from '$lib/components/Step.svelte';
  import EditQuestModal from '$lib/components/EditQuestModal.svelte';
  import type { Quest } from '$lib/types';
  import { fade, fly, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let quest = $state<Quest | undefined>(undefined);
  let newStepTitle = $state('');
  let showAddStep = $state(false);
  let showEditModal = $state(false);

  $effect(() => {
    const questId = $page.params.id;
    quest = $quests.find(q => q.id === questId);
  });

  onMount(() => {
    quests.init();
  });

  function handleAddStep() {
    if (!quest || !newStepTitle.trim()) return;
    
    quests.addStep(quest.id, newStepTitle.trim());
    newStepTitle = '';
    showAddStep = false;
  }

  function goBack() {
    goto('/');
  }

  const questTypeColor = $derived(
    quest?.type === 'main' ? 'questMain' : 'questSide'
  );

  const completedSteps = $derived(
    quest?.steps.filter(s => s.completed).length ?? 0
  );
  const totalSteps = $derived(quest?.steps.length ?? 0);
  const progressPercentage = $derived(
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  );
  const allStepsComplete = $derived(totalSteps > 0 && completedSteps === totalSteps);
  const canCompleteQuest = $derived(allStepsComplete && quest?.status === 'active');
  const isLocked = $derived(quest?.status === 'completed' || quest?.status === 'abandoned');

  function handleCompleteQuest() {
    if (!quest || !canCompleteQuest) return;
    quests.updateQuestStatus(quest.id, 'completed');
  }
</script>

<svelte:head>
  <title>{quest?.title ?? 'Quest'} - Questline</title>
</svelte:head>

<div class="min-h-screen bg-background-cream">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if !quest}
      <div class="text-center py-12">
        <p class="text-gray-500 mb-4">Quest not found</p>
        <button
          onclick={goBack}
          class="px-6 py-3 bg-background-brown text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </button>
      </div>
    {:else}
      <!-- Back Button -->
      <button
        onclick={goBack}
        class="flex items-center gap-2 text-gray-600 hover:text-background-brown transition-colors mb-6"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <!-- Quest Header -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-8" transition:fade={{ duration: 200 }}>
        <div class="h-3 bg-{questTypeColor}"></div>
        
        <div class="p-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">
                {quest.type === 'main' ? '⭐' : '📜'}
              </span>
              <span class="text-sm font-semibold uppercase tracking-wide text-{questTypeColor}">
                {quest.type === 'main' ? 'Main Quest' : 'Side Quest'}
              </span>
              <span class="px-3 py-1 text-sm rounded-full bg-background-beige text-background-brown capitalize">
                {quest.status}
              </span>
            </div>
            
            <!-- Edit Button -->
            <button
              onclick={() => showEditModal = true}
              class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-background-brown hover:bg-background-beige rounded-lg transition-all duration-200"
              aria-label="Edit quest"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="font-medium">Edit</span>
            </button>
          </div>

          <h1 class="text-4xl font-bold text-background-brown mb-4">
            {quest.title}
          </h1>

          <p class="text-gray-700 text-lg mb-6 whitespace-pre-wrap">
            {quest.description}
          </p>

          {#if quest.reward}
            <div class="flex items-center gap-3 p-4 bg-xp-gold bg-opacity-10 rounded-lg border-2 border-xp-gold mb-6">
              <span class="text-2xl">🎁</span>
              <div>
                <div class="text-sm font-semibold text-background-brown">Reward</div>
                <div class="text-gray-700">{quest.reward}</div>
              </div>
            </div>
          {/if}

          <!-- Progress -->
          <div class="mb-6">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span class="font-semibold">Progress: {completedSteps} / {totalSteps} steps</span>
              <span class="text-xp-gold font-medium">+{quest.xpValue} XP on completion</span>
            </div>
            <div class="w-full h-4 bg-background-beige rounded-full overflow-hidden">
              <div
                class="h-full bg-{questTypeColor} transition-all duration-500 ease-out"
                style="width: {progressPercentage}%"
              ></div>
            </div>
            {#if canCompleteQuest}
              <div class="mt-4 p-4 bg-status-success bg-opacity-10 rounded-lg border-2 border-status-success" transition:scale={{ duration: 300, easing: backOut }}>
                <p class="text-center text-white font-semibold mb-3">✨ All steps complete! Ready to claim your reward!</p>
                <button
                  onclick={handleCompleteQuest}
                  class="w-full py-3 px-6 bg-status-success text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >Complete Quest & Claim +{quest.xpValue} XP</button>
              </div>
            {/if}
          </div>

          <div class="text-sm text-gray-500">
            Created {new Date(quest.createdAt).toLocaleDateString()} • 
            Last updated {new Date(quest.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <!-- Steps Section -->
      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-background-brown">Steps</h2>
          {#if !isLocked}
            <button
              onclick={() => (showAddStep = true)}
              class="px-4 py-2 bg-{questTypeColor} text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              + Add Step
            </button>
          {/if}
        </div>

        {#if showAddStep && !isLocked}
          <div class="mb-6 p-4 bg-background-beige rounded-lg">
            <input
              type="text"
              bind:value={newStepTitle}
              placeholder="What needs to be done?"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-{questTypeColor} focus:outline-none mb-3"
              maxlength="200"
              onkeydown={(e) => e.key === 'Enter' && handleAddStep()}
            />
            <div class="flex gap-2">
              <button
                onclick={handleAddStep}
                class="px-4 py-2 bg-{questTypeColor} text-white rounded-lg hover:opacity-90 transition-opacity"
                disabled={!newStepTitle.trim()}
              >
                Add
              </button>
              <button
                onclick={() => {
                  showAddStep = false;
                  newStepTitle = '';
                }}
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        {/if}

        {#if quest.steps.length === 0}
          <div class="text-center py-12 text-gray-500">
            No steps yet. Add your first step to get started!
          </div>
        {:else}
          <div class="space-y-2">
            {#each quest.steps as step (step.id)}
              <Step {step} questId={quest.id} questStatus={quest.status} />
            {/each}
          </div>
        {/if}

        {#if quest.steps.length > 0}
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center gap-2 text-sm text-blue-900">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Check off steps as you complete them to earn XP!</span>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Edit Quest Modal -->
      <EditQuestModal bind:open={showEditModal} {quest} />
    {/if}
  </div>
</div>
