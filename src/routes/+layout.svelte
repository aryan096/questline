<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { quests } from '$lib/stores/quests';
	import XPBar from '$lib/components/XPBar.svelte';
	import LevelBadge from '$lib/components/LevelBadge.svelte';

	let { children } = $props();

	onMount(() => {
		quests.init();
	});

	function navigateToProfile() {
		goto('/profile');
	}

	function navigateHome() {
		goto('/');
	}

	const isProfilePage = $derived($page.url.pathname === '/profile');
</script>

<!-- Navigation Bar -->
<nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<button
				onclick={navigateHome}
				class="text-2xl font-bold text-background-brown hover:text-questMain transition-colors"
			>
				⚔️ Questline
			</button>

			<div class="flex items-center gap-6">
				<div class="hidden md:block w-64">
					<XPBar showLabel={true} />
				</div>
				
				<button
					onclick={navigateToProfile}
					class="flex items-center gap-2 hover:opacity-80 transition-opacity"
				>
					<LevelBadge />
				</button>
			</div>
		</div>

		<!-- Mobile XP Bar -->
		<div class="md:hidden pb-3">
			<XPBar showLabel={true} />
		</div>
	</div>
</nav>

{@render children()}
