<script lang="ts">
    import {getContext, onMount} from 'svelte';
    import type {Kernel} from '../kernel/Kernel';

    const kernel = getContext<Kernel>('kernel');
    let history: string[] = ['Welcome to Graphite Terminal. Type "help" for a list of commands.'];
    let inputValue = '';
    let inputEl: HTMLInputElement;

  onMount(() => {
    inputEl.focus();
  });

  function focusInput() {
    inputEl.focus();
  }

  async function handleCommand() {
    const commandToExecute = inputValue.trim();
    if (!commandToExecute) {
      return;
    }

    const fullCommand = `> ${commandToExecute}`;
    let output = '';

    // Check if we are running inside the C++ webview host
    // @ts-ignore
    if (typeof window.executeCommand === 'function') {
      // Call the C++-bound function and wait for the result.
      // @ts-ignore
      output = await window.executeCommand(commandToExecute);
    } else {
      // Fallback to original commands if not in the C++ host
      const [command, ...args] = commandToExecute.split(' ');
      switch (command.toLowerCase()) {
        case 'help':
          output = 'Available commands: help, echo, clear, ls. (Running in standalone mode)';
          break;
        case 'echo':
          output = args.join(' ');
          break;
        case 'clear':
          history = [fullCommand]; // Keep the clear command in history
          inputValue = '';
          return;
        case 'ls':
          try {
            const path = args[0] || '/';
            const files = kernel.vfs.ls(path);
            output = files.join('\n');
          } catch (e: any) {
            output = e.message;
          }
          break;
        default:
          output = `Command not found: ${command}`;
      }
    }

    history = [...history, fullCommand, output];
    inputValue = '';
  }
</script>

<div
  role="textbox"
  aria-multiline="true"
  tabindex="0"
  class="terminal-container select-allow"
  on:click={focusInput}
  on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && focusInput()}
>
    <div class="history">
        {#each history as line}
            <pre>{line}</pre>
        {/each}
    </div>
    <div class="prompt">
        <span>&gt;</span>
        <input
                bind:this={inputEl}
                bind:value={inputValue}
                on:keydown={(e) => e.key === 'Enter' && handleCommand()}
                spellcheck="false"
        />
    </div>
</div>

<style>
    .terminal-container {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-family: 'Courier New', Courier, monospace;
        overflow-y: auto;
        cursor: text;
    }

    .history {
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    pre {
        margin: 0;
        line-height: 1.4;
    }

    .prompt {
        display: flex;
    }

    .prompt span {
        margin-right: 8px;
    }

    input {
        flex-grow: 1;
        background: none;
        border: none;
        outline: none;
        color: #d4d4d4;
        font-family: inherit;
        font-size: inherit;
    }
</style>
