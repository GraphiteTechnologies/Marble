<script lang="ts">
    import {onMount} from 'svelte';
    import {Info} from 'phosphor-svelte';

    let gitHash = 'Loading...';
    let systemInfo = {
        os: 'Unknown',
        browser: 'Unknown',
        cpuCores: 'Unknown',
        memory: 'Unknown'
    };

    onMount(async() => {
        try {
            const response = await fetch('/api/github/commits');
            if(!response.ok) {
                console.error("failed to fetch github: ", response.ok)
            }
            const data = await response.json();
            if(data && data.length > 0 && data[0].sha) {
                gitHash = data[0].sha.substring(0, 7);
            } else {
                gitHash = 'Unknown';
            }
        } catch(error) {
            console.error('Failed to fetch git hash:', error);
            gitHash = 'Unknown';
        }

        systemInfo = {
            // todo: fix deprecation
            os: navigator.platform,
            // @ts-ignore
            browser: typeof window.executeCommand === 'function' ? 'Marble Renderer' : getBrowserName(navigator.userAgent),
            cpuCores: navigator.hardwareConcurrency?.toString() || 'N/A',
            memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'N/A'
        };
    });

    function getBrowserName(userAgent: string): string {
        if(userAgent.includes("Firefox")) return "Firefox";
        if(userAgent.includes("SamsungBrowser")) return "Samsung Internet";
        if(userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
        if(userAgent.includes("Edge")) return "Edge";
        if(userAgent.includes("Chrome")) return "Chrome";
        if(userAgent.includes("Safari")) return "Safari";
        return "Unknown";
    }
</script>

<div class="app-container about-container">
    <div class="header">
        <Info size={48}/>
        <h1>Graphite OS</h1>
    </div>
    <p>This is a modern, web-based operating system designed for performance and simplicity.</p>

    <div class="system-info">
        <h3>System Information</h3>
        <ul>
            <li><strong>OS:</strong> {systemInfo.os}</li>
            <li><strong>Browser:</strong> {systemInfo.browser}</li>
            <li><strong>CPU Cores:</strong> {systemInfo.cpuCores}</li>
            <li><strong>Memory:</strong> {systemInfo.memory}</li>
        </ul>
    </div>

    <div class="version-info">
        <strong>Version:</strong> v1 ({gitHash})
    </div>
</div>

<style>
    @import '../shell/AppKit.css';

    .about-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 40px;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }

    .system-info {
        margin-top: 20px;
        text-align: left;
        width: 100%;
        max-width: 300px;
    }

    .system-info h3 {
        text-align: center;
        margin-bottom: 10px;
    }

    .system-info ul {
        list-style: none;
        padding: 0;
    }

    .system-info li {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
    }

    .version-info {
        margin-top: 30px;
        font-size: 14px;
        color: var(--secondary-text);
    }
</style>
