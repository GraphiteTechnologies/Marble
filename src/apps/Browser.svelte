<script lang="ts">
    import {ArrowClockwise, ArrowLeft, ArrowRight, Lock} from 'phosphor-svelte';

    let iframeEl: HTMLIFrameElement;
    let iframeSrc = '';
    let inputValue = 'https://www.google.com';

    async function navigate() {
        if (!inputValue.startsWith('http')) {
            inputValue = `https://${inputValue}`;
        }

        // @ts-ignore
        iframeSrc = await window.proxyRequest(inputValue);
    }

    function back() {
        iframeEl?.contentWindow?.history.back();
    }

    function forward() {
        iframeEl?.contentWindow?.history.forward();
    }

    function refresh() {
        iframeEl?.contentWindow?.location.reload();
    }

    navigate();
</script>

<div class="browser-container dark">
    <div class="header">
        <div class="nav-controls">
            <button on:click={back}>
                <ArrowLeft size={20}/>
            </button>
            <button on:click={forward}>
                <ArrowRight size={20}/>
            </button>
            <button on:click={refresh}>
                <ArrowClockwise size={20}/>
            </button>
        </div>
        <div class="address-bar">
            <Lock size={16}/>
            <input
                    type="text"
                    bind:value={inputValue}
                    on:keydown={(e) => e.key === 'Enter' && navigate()}
                    placeholder="Search Google or type a URL"
            />
        </div>
    </div>
    <div class="content-area">
        <iframe
                bind:this={iframeEl}
                title="Browser Content"
                srcdoc={iframeSrc}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation"
        ></iframe>
    </div>
</div>

<style>
    .browser-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #fff;
        color: #202124;
    }

    .header {
        display: flex;
        align-items: center;
        padding: 8px;
        background-color: #f1f3f4;
        border-bottom: 1px solid #d1d1d1;
    }

    .nav-controls {
        display: flex;
        gap: 4px;
    }

    .nav-controls button {
        background: none;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #5f6368;
        transition: background-color 0.2s;
    }

    .nav-controls button:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .address-bar {
        flex-grow: 1;
        display: flex;
        align-items: center;
        background-color: #e8eaed;
        border-radius: 24px;
        padding: 0 16px;
        margin-left: 12px;
        height: 36px;
        color: #5f6368;
    }

    .address-bar input {
        flex-grow: 1;
        border: none;
        background: none;
        outline: none;
        margin-left: 8px;
        font-size: 14px;
        color: #202124;
    }

    .content-area {
        flex-grow: 1;
        background-color: #fff;
    }

    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }

    .dark {
        background-color: #2d2e30;
        color: #e8eaed;
    }

    .dark .header {
        background-color: #202124;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dark .nav-controls button {
        color: #9aa0a6;
    }

    .dark .nav-controls button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .dark .address-bar {
        background-color: #3c4043;
        color: #9aa0a6;
    }

    .dark .address-bar input {
        color: #e8eaed;
    }
</style>
