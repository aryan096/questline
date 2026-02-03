<script lang="ts">
  import { onMount } from 'svelte';
  import { quests, activeMainQuests, activeSideQuests } from '$lib/stores/quests';
  import QuestList from '$lib/components/QuestList.svelte';
  import QuestModal from '$lib/components/QuestModal.svelte';
  import type { QuestType } from '$lib/types';

  let showModal = $state(false);
  let modalQuestType = $state<QuestType>('side');

  onMount(() => {
    quests.init();
  });

  function openModal(type: QuestType) {
    modalQuestType = type;
    showModal = true;
  }
</script>

<svelte:head>
  <title>Questline - Your Quest Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-background-cream">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl font-bold text-background-brown">Your Quests</h1>
      </div>
      
      <div class="flex gap-3">
        <button
          onclick={() => openModal('main')}
          class="px-6 py-3 bg-questMain text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg font-semibold"
        >
          ⭐ New Main Quest
        </button>
        <button
          onclick={() => openModal('side')}
          class="px-6 py-3 bg-questSide text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg font-semibold"
        >
          📜 New Side Quest
        </button>
      </div>
    </div>

    <!-- Main Quests -->
    <QuestList
      quests={$activeMainQuests}
      title="⭐ Main Quests"
      emptyMessage="No active Main Quests. Create one to start your journey!"
    />

    <!-- Side Quests -->
    <QuestList
      quests={$activeSideQuests}
      title="📜 Side Quests"
      emptyMessage="No active Side Quests. Add some exploratory goals!"
    />
  </div>
</div>

<QuestModal bind:open={showModal} bind:questType={modalQuestType} />
