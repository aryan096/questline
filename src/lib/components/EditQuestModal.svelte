<script lang="ts">
  import type { Quest, QuestType } from '$lib/types';
  import { quests } from '$lib/stores/quests';
  import { isValidTitle, isValidDescription, sanitizeString } from '$lib/utils/validation';
  import { fade, scale } from 'svelte/transition';

  let {
    open = $bindable(false),
    quest
  }: {
    open?: boolean;
    quest: Quest;
  } = $props();

  let title = $state('');
  let description = $state('');
  let reward = $state('');
  let errors = $state<{ title?: string; description?: string }>({});

  // Update local state when modal opens or quest changes
  $effect(() => {
    if (open) {
      title = quest.title;
      description = quest.description;
      reward = quest.reward ?? '';
    }
  });

  const questTypeColor = $derived(quest.type === 'main' ? 'questMain' : 'questSide');

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

    return valid;
  }

  function handleSubmit() {
    if (!validate()) return;

    quests.updateQuest(quest.id, {
      title: sanitizeString(title, 100),
      description: sanitizeString(description, 2000),
      reward: reward.trim() || undefined
    });

    close();
  }

  function close() {
    open = false;
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
          <h2 class="text-2xl font-bold text-background-brown">Edit Quest</h2>
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
        <!-- Quest Type Display -->
        <div class="flex items-center gap-3 p-4 bg-{questTypeColor} bg-opacity-10 rounded-lg border-2 border-{questTypeColor}">
          <span class="text-2xl">{quest.type === 'main' ? '⭐' : '📜'}</span>
          <div>
            <div class="font-bold text-{questTypeColor}">
              {quest.type === 'main' ? 'Main Quest' : 'Side Quest'}
            </div>
            <div class="text-xs text-gray-600">Quest type cannot be changed</div>
          </div>
        </div>

        <!-- Title -->
        <div>
          <label for="edit-quest-title" class="block text-sm font-semibold text-background-brown mb-2">
            Title *
          </label>
          <input
            id="edit-quest-title"
            type="text"
            bind:value={title}
            placeholder="What is your quest?"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-{questTypeColor} focus:outline-none transition-colors"
            maxlength="100"
          />
          {#if errors.title}
            <div class="text-sm text-status-danger mt-1">{errors.title}</div>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="edit-quest-description" class="block text-sm font-semibold text-background-brown mb-2">
            Description *
          </label>
          <textarea
            id="edit-quest-description"
            bind:value={description}
            placeholder="What do you want to achieve? Why does this matter?"
            rows="4"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-{questTypeColor} focus:outline-none transition-colors resize-none"
            maxlength="2000"
          ></textarea>
          {#if errors.description}
            <div class="text-sm text-status-danger mt-1">{errors.description}</div>
          {/if}
          <div class="text-xs text-gray-500 mt-1">{description.length}/2000 characters</div>
        </div>

        <!-- Reward -->
        <div>
          <label for="edit-quest-reward" class="block text-sm font-semibold text-background-brown mb-2">
            Reward (optional) 🎁
          </label>
          <input
            id="edit-quest-reward"
            type="text"
            bind:value={reward}
            placeholder="How will you celebrate completion?"
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-xp-gold focus:outline-none transition-colors"
            maxlength="200"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            class="flex-1 py-3 px-6 bg-{questTypeColor} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
          <button
            type="button"
            onclick={close}
            class="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
