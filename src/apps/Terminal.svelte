<script lang="ts">
    import {getContext, onMount} from 'svelte';
    import type {Kernel} from '../kernel/Kernel';

    type HistoryItem = {
        type: 'text' | 'image';
        content: string;
    };

    const kernel = getContext<Kernel>('kernel');
    let history: HistoryItem[] = [{type: 'text', content: 'Welcome to Graphite Terminal. Type "help" for a list of commands.'}];
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
        if(!commandToExecute) {
            return;
        }

        const fullCommand = `> ${commandToExecute}`;
        let output: HistoryItem[] = [];

        // @ts-ignore
        if(typeof window.executeCommand === 'function') {
            // @ts-ignore
            const result = await window.executeCommand(commandToExecute);
            output = [{type: 'text', content: result}];
        } else {
            const [command, ...args] = commandToExecute.split(' ');
            switch(command.toLowerCase()) {
                case 'help':
                    output = [{type: 'text', content: 'Available commands: help, echo, clear, ls, nekofetch.'}];
                    break;
                case 'echo':
                    output = [{type: 'text', content: args.join(' ')}];
                    break;
                case 'clear':
                    history = [];
                    inputValue = '';
                    return;
                case 'ls':
                    try {
                        const path = args[0] || '/';
                        const files = kernel.vfs.ls(path);
                        output = [{type: 'text', content: files.join('\n')}];
                    } catch(e: any) {
                        output = [{type: 'text', content: e.message}];
                    }
                    break;
                case 'nekofetch':
                    const catUrl = `https://cataas.com/cat?t=${Date.now()}`;
                    output = [{type: 'image', content: catUrl}];
                    break;
                default:
                    output = [{type: 'text', content: `Command not found: ${command}`}];
            }
        }

        history = [...history, {type: 'text', content: fullCommand}, ...output];
        inputValue = '';
    }
</script>

<div
        role="textbox"
        aria-multiline="true"
        tabindex="0"
        class="app-container terminal-container select-allow"
        on:click={focusInput}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && focusInput()}
>
    <div class="history">
        {#each history as item}
            {#if item.type === 'image'}
                <img src={item.content} alt="nekofetch result" style="max-width: 250px; border-radius: 4px; margin-top: 4px;" />
            {:else}
                <pre>{item.content}</pre>
            {/if}
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
    @import '../shell/AppKit.css';

    .terminal-container {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        color: var(--primary-text);
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
        color: var(--primary-text);
        font-family: inherit;
        font-size: inherit;
    }
</style>
