
<script lang="ts">
  import { BareMuxConnection } from '@mercuryworkshop/bare-mux';
    import { onMount } from 'svelte';

    let iframe: HTMLIFrameElement;
    let inputValue = 'https://www.google.com';
    let loading = false;
    let connection;

    onMount(async () => {
        loading = true;
        try {
            await navigator.serviceWorker.register('/uv.sw.js');

            await navigator.serviceWorker.ready;
            console.log('Ultraviolet service worker is active.');
            
            await navigate();

        } catch (error) {
            console.error('Ultraviolet initialization failed:', error);
        } finally {
            loading = false;
        }
    });

    async function navigate() {
        loading = true;        
        let url = inputValue.trim();
        if (!url) {
            loading = false;
            return;
        };

        if (!/^(https?:\/\/)/.test(url)) {
            url = 'https://' + url;
        }
        try {            
            connection = new BareMuxConnection("/baremux/worker.js");
            const wispUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/wisp/';

            if(await connection.getTransport() !== "/epoxy/index.mjs") {
                await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
            }

        if (iframe) {
            // @ts-ignore
            iframe.src = window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
        }
        } catch(err) {
            console.log(err);
        }
        
    }

    function onIframeLoad() {
        loading = false;
    }
</script>

<div class="browser-app">
    <div class="toolbar">
        <input type="text" bind:value={inputValue} on:keydown={(e) => e.key === 'Enter' && navigate()} placeholder="Enter URL"/>
        <button on:click={navigate} disabled={loading}>
            {#if loading}
                <span>Loading...</span>
            {:else}
                <span>Go</span>
            {/if}
        </button>
    </div>
    <div class="content">
        <iframe src="about:blank" bind:this={iframe} title="Browser" sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts" on:load={onIframeLoad}></iframe>
    </div>
</div>

<style>
    .browser-app {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #f0f0f0;
    }
    .toolbar {
        display: flex;
        padding: 8px;
        background-color: #fff;
        border-bottom: 1px solid #ccc;
    }
    .toolbar input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .toolbar button {
        margin-left: 8px;
        padding: 8px 12px;
        border: none;
        background-color: #007bff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }
    .toolbar button:disabled {
        background-color: #ccc;
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
