<script lang="ts">
	import { onMount } from 'svelte';
	import { dateTimeStore } from '../store/dateTimeStore';

	let time = new Date();

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
			dateTimeStore.update((store) => ({ ...store, time }));
		}, 1000);

		return () => clearInterval(interval);
	});

	$: formattedDate = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
	$: formattedTime = time
		.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(/ (AM|PM)$/, '');

	function toggle(event: MouseEvent) {
		event.stopPropagation();
		dateTimeStore.update((store) => ({
			...store,
			calendarVisible: !store.calendarVisible
		}));
	}
</script>

<button class="date-time-container" on:click={toggle}>
	<span class="time">{formattedTime}</span>
	<span class="date">{formattedDate}</span>
</button>

<style>
	.date-time-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		height: 36px;
		width: 72px;
		padding: 0 12px;
		font-size: 14px;
		font-weight: 500;
		color: #e8eaed;
		transition: background-color 0.2s;
		cursor: pointer;
		border: none;
		font-family: var(--font-family);
		background-color: transparent;
		border-radius: 18px;
	}

	.date-time-container:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.time {
		line-height: 1;
	}

	.date {
		font-size: 12px;
		line-height: 1;
	}
</style>
