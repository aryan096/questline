<script lang="ts">
  import type { Quest } from '$lib/types';
  import QuestCard from './QuestCard.svelte';
  import { goto } from '$app/navigation';
  import { flip } from 'svelte/animate';
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    quests,
    title,
    emptyMessage = 'No quests yet'
  }: {
    quests: Quest[];
    title: string;
    emptyMessage?: string;
  } = $props();

  function navigateToQuest(questId: string) {
    goto(`/quests/${questId}`);
  }
</script>

<div class="mb-8">
  <h2 class="text-2xl font-bold text-background-brown mb-4">
    {title}
    <span class="text-gray-500 text-lg ml-2">({quests.length})</span>
  </h2>

  {#if quests.length === 0}
    <div class="text-center py-12 text-gray-500" transition:fade={{ duration: 200 }}>
      {emptyMessage}
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each quests as quest (quest.id)}
        <div animate:flip={{ duration: 300, easing: backOut }} transition:scale={{ duration: 200, start: 0.95 }}>
          <QuestCard {quest} onclick={() => navigateToQuest(quest.id)} />
        </div>
      {/each}
    </div>
  {/if}
</div>
