<script lang="ts">
  import { onMount } from 'svelte';

  export let name: string;
  export let size = 28;

  let iconComponent: any;
  let loading = true;

  onMount(async () => {
    try {
      const iconModule = await import(`phosphor-svelte/lib/${name}.svelte`);
      iconComponent = iconModule.default;
    } catch (e) {
      console.error(`Could not load icon ${name}`, e);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="loading-indicator" style="width: {size}px; height: {size}px;" />
{:else if iconComponent}
  <svelte:component this={iconComponent} {size} />
{/if}

<style>
  .loading-indicator {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 2px solid #fff;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
