<script lang="ts">
  import { fly } from 'svelte/transition';

  export let visible = false;
  export let time: Date;

  $: formattedTime = time.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
</script>

{#if visible}
  <div class="clock-details-container" transition:fly={{ y: 10, duration: 200 }}>
    <div class="time-display">{formattedTime}</div>
  </div>
{/if}

<style>
  .clock-details-container {
    position: absolute;
    bottom: 56px;
    right: 16px;
    background-color: rgba(32, 33, 36, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-medium);
    z-index: 12000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    color: var(--primary-text);
    font-family: var(--font-family);
  }
  .time-display {
    font-size: var(--font-size-large);
    font-weight: 500;
  }
</style>
