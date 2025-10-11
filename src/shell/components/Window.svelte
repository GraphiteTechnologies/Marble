<script lang="ts">
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import type { Kernel } from '../../kernel/Kernel';
  import type { WindowState } from '../../kernel/services/windowManager.types';
  import { appRegistry } from '../../apps/registry';
  import { X, Square, Minus } from 'phosphor-svelte';

  export let window: WindowState;

  const kernel = getContext<Kernel>('kernel');
  const app = appRegistry.find(app => app.id === window.appId);

  let width = window.size.width;
  let height = window.size.height;
  let transform = '';
  let isDragging = false;

  $: if (window.position && !isDragging) {
    transform = '';
  }

  function onDragStart(e: MouseEvent) {
    if (window.isMaximized || (e.target as HTMLElement).closest('.window-control') || (e.target as HTMLElement).closest('.resizer')) {
      return;
    }
    isDragging = true;
    let shiftX = e.clientX - window.position.x;
    let shiftY = e.clientY - window.position.y;

    function onMouseMove(e: MouseEvent) {
      const newX = e.clientX - shiftX;
      const newY = e.clientY - shiftY;
      transform = `translate(${newX - window.position.x}px, ${newY - window.position.y}px)`;
    }

    function onMouseUp(e: MouseEvent) {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      const finalX = e.clientX - shiftX;
      const finalY = e.clientY - shiftY;
      kernel.windowManager.setPosition(window.id, { x: finalX, y: finalY });
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onResizeStart(event: MouseEvent) {
    event.preventDefault();
    isDragging = true;
    const initialX = event.clientX;
    const initialY = event.clientY;
    const initialWidth = width;
    const initialHeight = height;

    function onMouseMove(event$1: MouseEvent) {
      const newWidth = initialWidth + (event$1.clientX - initialX);
      const newHeight = initialHeight + (event$1.clientY - initialY);
      transform = `scale(${newWidth / width}, ${newHeight / height})`;
    }

    function onMouseUp(event$1: MouseEvent) {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      width = initialWidth + (event$1.clientX - initialX);
      height = initialHeight + (event$1.clientY - initialY);
      kernel.windowManager.resize(window.id, { width, height });
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onClose(event: MouseEvent) {
    event.stopPropagation();
    kernel.windowManager.close(window.id);
  }

  function onFocus() {
    kernel.windowManager.focus(window.id);
  }

  function onMinimize() {
    kernel.windowManager.minimize(window.id);
  }

  function onToggleMaximize() {
    kernel.windowManager.toggleMaximize(window.id);
  }
</script>

{#if !window.isMinimized}
<div
  class="window"
  class:maximized="{window.isMaximized}"
  style:top="{window.position.y}px"
  style:left="{window.position.x}px"
  style:width="{width}px"
  style:height="{height}px"
  style:z-index="{window.zIndex}"
  style:transform="{transform}"
  class:focused="{window.isFocused}"
  on:mousedown={onFocus}
  in:fly={{ y: 10, duration: 150, opacity: 0 }}
>
  <div class="title-bar" on:mousedown={onDragStart} on:dblclick={onToggleMaximize}>
    <div class="title-info">
      {#if app}
        <div class="app-icon">
          <svelte:component this={app.icon} size={16} />
        </div>
      {/if}
      <span class="title">{window.title}</span>
    </div>
    <div class="window-controls">
      <button class="window-control" on:click|stopPropagation={onMinimize}>
        <Minus size={14} />
      </button>
      <button class="window-control" on:click|stopPropagation={onToggleMaximize}>
        <Square size={14} />
      </button>
      <button class="window-control close" on:click={onClose}>
        <X size={14} />
      </button>
    </div>
  </div>
  <div class="content">
    {#if app}
      <svelte:component this={app.component} />
    {/if}
  </div>
  <div class="resizer" on:mousedown={onResizeStart}></div>
</div>
{/if}

<style>
  .window {
    position: absolute;
    background: #202124;
    color: #e8eaed;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    transition: border-color 0.2s, width 0.2s, height 0.2s;
    min-width: 200px;
    min-height: 150px;
    transform-origin: top left;
  }
  .window.maximized {
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: calc(100% - 48px) !important;
    border-radius: 0;
    transition: width 0.2s, height 0.2s;
  }
  .title-bar {
    height: 36px;
    flex-shrink: 0;
    cursor: move;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 0 12px;
    user-select: none;
  }
  .title-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .app-icon {
    color: #9aa0a6;
  }
  .title {
    font-size: 13px;
    font-weight: 500;
  }
  .window-controls {
    display: flex;
    align-items: center;
  }
  .window-control {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: none;
    border: none;
    color: #e8eaed;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  .window-control:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .window-control.close:hover {
    background-color: #e81123;
  }
  .content {
    flex-grow: 1;
    padding: 10px;
    background-color: #2d2e30;
  }
  .resizer {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    cursor: se-resize;
  }
</style>
