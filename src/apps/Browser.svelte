<script lang="ts">
    import {onMount} from 'svelte';
    import {ArrowCircleRight, ArrowLeft, ArrowRight, DownloadSimple} from 'phosphor-svelte';
    import {webApps} from '../shell/store/webAppsStore';

    export let pwaUrl: string | null = null;

    let iframe: HTMLIFrameElement;
    let inputValue = pwaUrl || 'https://www.google.com';
    let loading = false;
    let historyStack: string[] = [];
    let currentIndex = -1;
    // @ts-ignore
    let scramjet;
    // @ts-ignore
    let connection;

    onMount(async() => {
        // @ts-ignore
        const { ScramjetController } = globalThis.$scramjetLoadController();
        scramjet = new ScramjetController({
            files: {
                wasm: '/scram/scramjet.wasm.wasm',
                all: '/scram/scramjet.all.js',
                sync: '/scram/scramjet.sync.js',
            },
        });
        await scramjet.init();

        // @ts-ignore
        connection = new BareMux.BareMuxConnection("/baremux/worker.js");

        loading = true;
        try {
            await registerSW();
            await navigate();
        } catch(error) {
            console.error('Scramjet initialization failed:', error);
        } finally {
            loading = false;
        }
    });

    async function registerSW() {
        if(!navigator.serviceWorker) {
            if(
                location.protocol !== "https:" &&
                !["localhost", "127.0.0.1"].includes(location.hostname)
            )
                throw new Error("Service workers cannot be registered without https.");

            throw new Error("Your browser doesn't support service workers.");
        }

        await navigator.serviceWorker.register('/sw.js');
    }

    // @ts-ignore
    function search(input, template) {
        try {
            return new URL(input).toString();
        } catch(err) {
        }

        try {
            const url = new URL(`http://${input}`);
            if(url.hostname.includes(".")) return url.toString();
        } catch(err) {
        }

        return template.replace("%s", encodeURIComponent(input));
    }

    async function navigate(urlOverride?: string) {
        loading = true;
        let url = (urlOverride || inputValue).trim();
        if(!url) {
            loading = false;
            return;
        }

        const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
        // @ts-ignore
        if((await connection.getTransport()) !== "/epoxy/index.mjs") {
            // @ts-ignore
            await connection.setTransport("/epoxy/index.mjs", [{wisp: wispUrl}]);
        }

        const finalUrl = search(url, "https://www.google.com/search?q=%s");
        if(iframe) {
            // @ts-ignore
            iframe.src = scramjet.encodeUrl(finalUrl);
        }

        if(currentIndex === -1 || historyStack[currentIndex] !== finalUrl) {
            historyStack = historyStack.slice(0, currentIndex + 1);
            historyStack.push(finalUrl);
            currentIndex = historyStack.length - 1;
        }

        inputValue = finalUrl;
        loading = false;
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
    {#if !pwaUrl}
        <div class="toolbar">
            <div class="nav-buttons">
                <button on:click={goBack} disabled={currentIndex <= 0} title="Back">
                    <ArrowLeft size={22} weight="bold"/>
                </button>
                <button on:click={goForward} disabled={currentIndex >= historyStack.length - 1} title="Forward">
                    <ArrowRight size={22} weight="bold"/>
                </button>
                <button on:click={async () => await webApps.addWebApp(inputValue)} title="Add to launcher">
                    <DownloadSimple size={22} weight="bold"/>
                </button>
            </div>

            <input
                    type="text"
                    bind:value={inputValue}
                    on:keydown={(e) => e.key === 'Enter' && navigate()}
                    placeholder="Search the web freely"
            />

            <button class="go" on:click={() => navigate()} disabled={loading}>
                {#if loading}
                    <span class="loader"></span>
                {:else}
                    <ArrowCircleRight size={22} weight="fill"/>
                {/if}
            </button>
        </div>
    {/if}

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