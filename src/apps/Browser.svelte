<script lang="ts">
    import {BareMuxConnection} from '@mercuryworkshop/bare-mux';
    import {onMount} from 'svelte';
    import {ArrowCircleRight, ArrowLeft, ArrowRight} from 'phosphor-svelte';

    let iframe: HTMLIFrameElement;
    let inputValue = 'https://www.qwant.com';
    let loading = false;
    let connection;
    let historyStack: string[] = [];
    let currentIndex = -1;

    onMount(async() => {
        loading = true;
        try {
            await navigator.serviceWorker.register('/uv.sw.js');
            await navigator.serviceWorker.ready;
            console.log('Ultraviolet service worker is active.');
            await navigate();
        } catch(error) {
            console.error('Ultraviolet initialization failed:', error);
        } finally {
            loading = false;
        }
    });

    async function navigate(urlOverride?: string) {
        loading = true;
        let url = (urlOverride || inputValue).trim();
        if(!url) {
            loading = false;
            return;
        }

        if(!/^(https?:\/\/)/.test(url)) {
            url = 'https://' + url;
        }

        try {
            connection = new BareMuxConnection("/baremux/worker.js");
            const wispUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/wisp/';

            if(await connection.getTransport() !== "/epoxy/index.mjs")
                await connection.setTransport("/epoxy/index.mjs", [{wisp: wispUrl}]);

            if(iframe) {
                // @ts-ignore
                iframe.src = window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
            }

            // update history
            if(currentIndex === -1 || historyStack[currentIndex] !== url) {
                historyStack = historyStack.slice(0, currentIndex + 1);
                historyStack.push(url);
                currentIndex = historyStack.length - 1;
            }

            inputValue = url;
        } catch(err) {
            console.log(err);
        }
    }

    function onIframeLoad() {
        loading = false;
    }

    function goBack() {
        if(currentIndex > 0) {
            currentIndex--;
            navigate(historyStack[currentIndex]);
        }
    }

    function goForward() {
        if(currentIndex < historyStack.length - 1) {
            currentIndex++;
            navigate(historyStack[currentIndex]);
        }
    }
</script>

<div class="app-container browser-app">
    <div class="toolbar">
        <div class="nav-buttons">
            <button on:click={goBack} disabled={currentIndex <= 0} title="Back">
                <ArrowLeft size={22} weight="bold"/>
            </button>
            <button on:click={goForward} disabled={currentIndex >= historyStack.length - 1} title="Forward">
                <ArrowRight size={22} weight="bold"/>
            </button>
        </div>

        <input
                type="text"
                bind:value={inputValue}
                on:keydown={(e) => e.key === 'Enter' && navigate()}
                placeholder="Search or enter address"
        />

        <button class="go" on:click={navigate} disabled={loading}>
            {#if loading}
                <span class="loader"></span>
            {:else}
                <ArrowCircleRight size={22} weight="fill"/>
            {/if}
        </button>
    </div>

    <div class="content">
        <iframe
                src="about:blank"
                bind:this={iframe}
                title="Browser"
                sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
                on:load={onIframeLoad}
        ></iframe>
    </div>
</div>

<style>
    @import '../shell/AppKit.css';

    .browser-app {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
    }

    .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--secondary-background);
        border-bottom: 1px solid var(--border-color);
    }

    .nav-buttons {
        display: flex;
        gap: 4px;
    }

    .nav-buttons button {
        background: transparent;
        border: none;
        color: var(--secondary-text);
        cursor: pointer;
        padding: 6px;
        border-radius: var(--border-radius);
        transition: background 0.2s, color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .nav-buttons button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.08);
        color: var(--primary-text);
    }

    .nav-buttons button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .toolbar input {
        flex: 1;
        height: 36px;
        padding: 0 12px;
        font-size: var(--font-size-base);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        background: var(--primary-background);
        color: var(--primary-text);
        transition: border 0.2s, box-shadow 0.2s;
    }

    .toolbar input::placeholder {
        color: var(--secondary-text);
    }

    .toolbar input:focus {
        outline: none;
        border-color: var(--accent-color);
    }

    .go {
        height: 36px;
        width: 40px;
        border: none;
        background: var(--secondary-background);
        color: white;
        border-radius: 50%;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }

    .go:hover:not(:disabled) {
        background: var(--accent-color);
    }

    .go:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .loader {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid white;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .content {
        flex: 1;
        position: relative;
    }

    .content iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
    }
</style>
