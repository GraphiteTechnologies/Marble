<script lang="ts">
  import { fly } from 'svelte/transition';

  export let x: number;
  export let y: number;
</script>

<div
  class="context-menu select-none"
  style:top="{y}px"
  style:left="{x}px"
  in:fly={{ y: 10, duration: 100, opacity: 0 }}
>
  <ul>
    <li>Change Wallpaper</li>
    <li>Settings</li>
    <li class="separator"></li>
    <li>About Graphite OS</li>
  </ul>
</div>

<style>
  .context-menu {
    position: absolute;
    background-color: rgba(45, 46, 48, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    padding: 6px;
    z-index: 12000;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 8px 16px;
    font-size: 13px;
    color: #e8eaed;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  li:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .separator {
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 4px 0;
    padding: 0;
  }
</style>
