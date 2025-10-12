<script lang="ts">
</script>

<main class="desktop select-none">
  <slot></slot>
</main>

<style>
  .desktop {
    width: 100vw;
    height: 100vh;
    background-image: url('/wallpapers/shards.jpeg');
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }
</style>
