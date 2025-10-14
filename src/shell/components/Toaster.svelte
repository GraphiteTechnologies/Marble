<script lang="ts">
  import { toasts } from '../store/toasterStore';
  import { fly } from 'svelte/transition';
</script>

<div class="toaster-container">
  {#each $toasts as toast (toast.id)}
    <div
      in:fly={{ y: 20, duration: 300 }}
      out:fly={{ y: 20, duration: 300 }}
      class="toast toast-{toast.type}"
    >
      {toast.message}
    </div>
  {/each}
</div>

<style>
  .toaster-container {
    position: fixed;
    bottom: 72px;
    right: 16px;
    display: flex;
    flex-direction: column-reverse;
    gap: var(--spacing-medium);
    z-index: 10000;
  }

  .toast {
    padding: var(--spacing-medium);
    border-radius: var(--border-radius);
    color: var(--primary-text);
    background-color: rgba(32, 33, 36, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border-left-width: 4px;
  }
</style>
