<script lang="ts">
  import { onMount } from 'svelte';

  let time = new Date();

  onMount(() => {
    const interval = setInterval(() => {
      time = new Date();
    }, 1000);

    return () => clearInterval(interval);
  });

  $: formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
</script>

<div class="time-pill select-none">
  {formattedTime}
</div>

<style>
  .time-pill {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    color: #e8eaed;
    transition: background-color 0.2s;
  }
  .time-pill:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
