<script lang="ts">
  import type { QuestType } from '$lib/types';
  import { quests, canAddMainQuest, activeMainQuests } from '$lib/stores/quests';
  import { QUEST_LIMITS } from '$lib/types';
  import { isValidTitle, isValidDescription, sanitizeString } from '$lib/utils/validation';
  import { fade, scale, fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    open = $bindable(false),
    questType = $bindable<QuestType>('side')
  }: {
    open?: boolean;
    questType?: QuestType;
  } = $props();

  let title = $state('');
  let description = $state('');
  let reward = $state('');
  let steps = $state<string[]>(['']);
  let errors = $state<{ title?: string; description?: string }>({});

  const mainQuestCount = $derived($activeMainQuests.length);
  const canCreateMainQuest = $derived($canAddMainQuest);

  function addStep() {
    steps = [...steps, ''];
  }

  function removeStep(index: number) {
    steps = steps.filter((_, i) => i !== index);
  }

  function updateStep(index: number, value: string) {
    steps = steps.map((step, i) => (i === index ? value : step));
  }

  function validate(): boolean {
    errors = {};
    let valid = true;

    if (!isValidTitle(title)) {
      errors.title = 'Title is required and must be less than 100 characters';
      valid = false;
    }

    if (!isValidDescription(description)) {
      errors.description = 'Description must be less than 2000 characters';
      valid = false;
    }

    if (questType === 'main' && !canCreateMainQuest) {
      errors.title = 'Maximum Main Quests reached. Complete or pause an existing one first.';
      valid = false;
    }

    return valid;
  }

  function handleSubmit() {
    if (!validate()) return;

    // Filter out empty steps
    const validSteps = steps.filter(s => s.trim().length > 0);

    const newQuest = quests.addQuest(
      sanitizeString(title, 100),
      sanitizeString(description, 2000),
      questType,
      reward.trim() || undefined,
      validSteps.map(s => sanitizeString(s, 200))
    );

    if (newQuest) {
      close();
    }
  }

  function close() {
    open = false;
    // Reset form
    title = '';
    description = '';
    reward = '';
    steps = [''];
    errors = {};
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

{#if open}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onclick={close}
    onkeydown={handleKeyDown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="bg-background-cream rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Header -->
      <div class="sticky top-0 bg-background-cream border-b border-gray-200 p-6 rounded-t-xl">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-background-brown">Create New Quest</h2>
          <button
            onclick={close}
            class="text-gray-500 hover:text-background-brown transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-6 space-y-6">
        <!-- Quest Type -->
        <div>
          <div class="block text-sm font-semibold text-background-brown mb-3">
            Quest Type
          </div>
          <div class="flex gap-4">
            <button
              type="button"
              class="flex-1 p-4 rounded-lg border-2 transition-all {questType === 'main'
                ? 'border-questMain bg-questMain bg-opacity-10'
                : 'border-gray-300 hover:border-questMain'}"
              onclick={() => (questType = 'main')}
            >
              <div class="text-2xl mb-1">⭐</div>
              <div class="font-bold text-questMain">Main Quest</div>
              <div class="text-xs text-gray-600 mt-1">Long-term, high-stakes goals</div>
            </button>

            <button
              type="button"
              class="flex-1 p-4 rounded-lg border-2 transition-all {questType === 'side'
                ? 'border-questSide bg-questSide bg-opacity-10'
                : 'border-gray-300 hover:border-questSide'}"
              onclick={() => (questType = 'side')}
            >
              <div class="text-2xl mb-1">📜</div>
              <div class="font-bold text-questSide">Side Quest</div>
              <div class="text-xs text-gray-600 mt-1">Short-term, exploratory goals</div>
            </button>
          </div>

          {#if questType === 'main'}
            <div class="mt-3 p-3 rounded-lg {canCreateMainQuest ? 'bg-blue-50' : 'bg-status-warning bg-opacity-20'}">
              <div class="text-sm font-semibold">
                {mainQuestCount} / {QUEST_LIMITS.MAX_MAIN_QUESTS} Main Quests Active
              </div>
              {#if !canCreateMainQuest}
                <div class="text-xs text-status-danger mt-1">
                  Maximum reached! Complete or pause an existing Main Quest first.
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Title -->
        <div>
          <label for="quest-title" class="block text-sm font-semibold text-background-brown mb-2">
            Title *
          </label>
          <input
            id="quest-title"
            type="text"
            bind:value={title}
            placeholder="What is your quest?"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-{questType === 'main' ? 'questMain' : 'questSide'} focus:outline-none transition-colors"
            maxlength="100"
          />
          {#if errors.title}
            <div class="text-sm text-status-danger mt-1">{errors.title}</div>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="quest-description" class="block text-sm font-semibold text-background-brown mb-2">
            Description *
          </label>
          <textarea
            id="quest-description"
            bind:value={description}
            placeholder="What do you want to achieve? Why does this matter? What constraints or context should you remember?"
            rows="4"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-{questType === 'main' ? 'questMain' : 'questSide'} focus:outline-none transition-colors resize-none"
            maxlength="2000"
          ></textarea>
          <div class="flex justify-between mt-1">
            {#if errors.description}
              <div class="text-sm text-status-danger">{errors.description}</div>
            {:else}
              <div class="text-xs text-gray-500">
                Be as detailed as possible to set clear direction
              </div>
            {/if}
            <div class="text-xs text-gray-500">
              {description.length} / 2000
            </div>
          </div>
        </div>

        <!-- Reward -->
        <div>
          <label for="quest-reward" class="block text-sm font-semibold text-background-brown mb-2">
            Reward <span class="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            id="quest-reward"
            type="text"
            bind:value={reward}
            placeholder="What will you celebrate with when you complete this?"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-{questType === 'main' ? 'questMain' : 'questSide'} focus:outline-none transition-colors"
            maxlength="200"
          />
          <div class="text-xs text-gray-500 mt-1">
            e.g., "Take a weekend trip" or "Buy that guitar"
          </div>
        </div>

        <!-- Initial Steps -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <div class="block text-sm font-semibold text-background-brown">
              Initial Steps <span class="text-gray-500 font-normal">(optional but recommended)</span>
            </div>
            <button
              type="button"
              onclick={addStep}
              class="text-sm text-{questType === 'main' ? 'questMain' : 'questSide'} hover:underline font-semibold"
            >
              + Add Step
            </button>
          </div>

          <div class="space-y-2">
            {#each steps as step, index (index)}
              <div class="flex gap-2" transition:fly={{ x: -20, duration: 200 }}>
                <input
                  type="text"
                  value={step}
                  oninput={(e) => updateStep(index, e.currentTarget.value)}
                  placeholder="Describe a concrete action step..."
                  class="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-{questType === 'main' ? 'questMain' : 'questSide'} focus:outline-none transition-colors"
                  maxlength="200"
                />
                {#if steps.length > 1}
                  <button
                    type="button"
                    onclick={() => removeStep(index)}
                    class="px-3 py-2 text-gray-500 hover:text-status-danger transition-colors"
                    aria-label="Remove step"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
          </div>

          <div class="text-xs text-gray-500 mt-2">
            Break down your quest into actionable steps. You can always add more later!
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onclick={close}
            class="px-6 py-3 rounded-lg bg-background-beige hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-3 rounded-lg bg-{questType === 'main' ? 'questMain' : 'questSide'} text-white hover:opacity-90 transition-opacity font-semibold shadow-lg"
            disabled={questType === 'main' && !canCreateMainQuest}
          >
            Create Quest
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
