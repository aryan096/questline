<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { quests, completedQuests } from '$lib/stores/quests';
  import XPBar from '$lib/components/XPBar.svelte';
  import LevelBadge from '$lib/components/LevelBadge.svelte';
  import { xpProgress, xpForLevel } from '$lib/utils/xp';

  onMount(() => {
    quests.init();
  });

  const progress = $derived(xpProgress($user.totalXP));
  const nextLevelXP = $derived(xpForLevel(progress.nextLevel));

  function goBack() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Profile - Questline</title>
</svelte:head>

<div class="min-h-screen bg-background-cream">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

    <!-- Profile Header -->
    <div class="bg-gradient-to-r from-xp-gold to-xp-purple rounded-xl shadow-2xl p-8 mb-8 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold mb-2">Your Profile</h1>
          <p class="text-white text-opacity-90">Track your progress and achievements</p>
        </div>
        <LevelBadge />
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Total XP -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-xp-gold rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold text-background-brown">
              {$user.totalXP.toLocaleString()}
            </div>
            <div class="text-sm text-gray-600">Total XP</div>
          </div>
        </div>
      </div>

      <!-- Level -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-xp-purple rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold text-background-brown">
              {$user.level}
            </div>
            <div class="text-sm text-gray-600">Current Level</div>
          </div>
        </div>
      </div>

      <!-- Completed Quests -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-status-success rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold text-background-brown">
              {$user.completedQuestCount}
            </div>
            <div class="text-sm text-gray-600">Quests Completed</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Level Progress -->
    <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 class="text-2xl font-bold text-background-brown mb-6">Level Progress</h2>
      
      <div class="mb-6">
        <XPBar showLabel={true} />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-background-beige rounded-lg">
          <div class="text-sm text-gray-600 mb-1">Next Level</div>
          <div class="text-2xl font-bold text-background-brown">
            {progress.nextLevel}
          </div>
          <div class="text-sm text-gray-600 mt-1">
            {nextLevelXP.toLocaleString()} total XP needed
          </div>
        </div>

        <div class="p-4 bg-background-beige rounded-lg">
          <div class="text-sm text-gray-600 mb-1">XP Until Level Up</div>
          <div class="text-2xl font-bold text-background-brown">
            {(progress.requiredXP - progress.currentXP).toLocaleString()}
          </div>
          <div class="text-sm text-gray-600 mt-1">
            {Math.round(progress.percentage)}% complete
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Quests -->
    {#if $completedQuests.length > 0}
      <div class="bg-white rounded-xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-background-brown mb-6">
          Completed Quests ({$completedQuests.length})
        </h2>
        
        <div class="space-y-3">
          {#each $completedQuests as quest (quest.id)}
            <div class="p-4 bg-status-success bg-opacity-10 rounded-lg border-2 border-status-success">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">
                      {quest.type === 'main' ? '⭐' : '📜'}
                    </span>
                    <h3 class="font-bold text-background-brown">
                      {quest.title}
                    </h3>
                  </div>
                  <p class="text-sm text-gray-600 line-clamp-1">
                    {quest.description}
                  </p>
                  {#if quest.completedAt}
                    <div class="text-xs text-gray-500 mt-2">
                      Completed {new Date(quest.completedAt).toLocaleDateString()}
                    </div>
                  {/if}
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-status-success">
                    +{quest.xpValue} XP
                  </div>
                  <div class="text-xs text-gray-600">
                    {quest.steps.length} steps
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">🎯</div>
        <h3 class="text-xl font-bold text-background-brown mb-2">
          No Completed Quests Yet
        </h3>
        <p class="text-gray-600">
          Complete your first quest to start building your achievement history!
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
