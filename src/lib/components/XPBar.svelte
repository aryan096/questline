<script lang="ts">
  import { user } from '$lib/stores/user';
  import { xpProgress } from '$lib/utils/xp';
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let { showLabel = true }: { showLabel?: boolean } = $props();

  const progress = $derived(xpProgress($user.totalXP));
  
  // Track XP changes for animation
  let previousXP = $state($user.totalXP);
  let xpGain = $state(0);
  let showXPGain = $state(false);
  
  $effect(() => {
    const currentXP = $user.totalXP;
    if (currentXP !== previousXP) {
      xpGain = currentXP - previousXP;
      if (xpGain > 0) {
        showXPGain = true;
        setTimeout(() => {
          showXPGain = false;
        }, 1500);
      }
      previousXP = currentXP;
    }
  });
</script>

<div class="w-full relative">
  {#if showLabel}
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-semibold text-background-brown">
        Level {progress.currentLevel}
      </span>
      <span class="text-xs text-gray-600 flex items-center gap-2">
        {progress.currentXP} / {progress.requiredXP} XP
        {#if showXPGain && xpGain > 0}
          <span 
            class="text-xp-gold font-bold"
            transition:scale={{ duration: 400, easing: backOut }}
          >
            +{xpGain}
          </span>
        {/if}
      </span>
    </div>
  {/if}
  
  <div class="w-full h-3 bg-background-beige rounded-full overflow-hidden shadow-inner">
    <div
      class="h-full bg-gradient-to-r from-xp-gold to-xp-purple rounded-full transition-all duration-500 ease-out"
      style="width: {progress.percentage}%"
    ></div>
  </div>
</div>
