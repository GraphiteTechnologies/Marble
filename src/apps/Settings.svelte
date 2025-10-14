<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { Kernel } from '../kernel/Kernel';

    export let section: string | null = null;

    let wallpapers: string[] = [];
    let selectedWallpaper: string = '';
    let activeSection = section || 'appearance';

    onMount(async () => {
        const kernel = getContext<Kernel>('kernel');
        const vfs = kernel.vfs;
        const wallpaperFiles = vfs.readDir('/usr/share/wallpapers');
        wallpapers = wallpaperFiles.map(file => file.name);

        const savedWallpaper = localStorage.getItem('wallpaper');
        if (savedWallpaper) {
            if (savedWallpaper.startsWith('data:')) {
                selectedWallpaper = 'custom';
            } else {
                selectedWallpaper = savedWallpaper;
            }
        } else {
            selectedWallpaper = 'shards.jpeg';
        }
    });

    function changeWallpaper() {
        if (selectedWallpaper !== 'custom') {
            localStorage.setItem('wallpaper', selectedWallpaper);
            const desktop = document.querySelector('.desktop') as HTMLElement;
            if (desktop) {
                desktop.style.backgroundImage = `url(/wallpapers/${selectedWallpaper})`;
            }
        }
    }

    function handleWallpaperUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                localStorage.setItem('wallpaper', dataUrl);
                const desktop = document.querySelector('.desktop') as HTMLElement;
                if (desktop) {
                    desktop.style.backgroundImage = `url(${dataUrl})`;
                }
                selectedWallpaper = 'custom';
            };
            reader.readAsDataURL(file);
        }
    }
</script>

<div class="app-container settings-container">
    <div class="sidebar">
        <h2>Settings</h2>
        <nav>
            <button class:active={activeSection === 'appearance'} on:click={() => activeSection = 'appearance'}>
                Appearance
            </button>
            <button class:active={activeSection === 'about'} on:click={() => activeSection = 'about'}>
                About
            </button>
        </nav>
    </div>
    <div class="content">
        {#if activeSection === 'appearance'}
            <section>
                <h2>Appearance</h2>
                <div class="form-group">
                    <label for="wallpaper-select">Wallpaper</label>
                    <select id="wallpaper-select" bind:value={selectedWallpaper} on:change={changeWallpaper}>
                        {#each wallpapers as wallpaper}
                            <option value={wallpaper}>{wallpaper}</option>
                        {/each}
                        <option value="custom" disabled={!localStorage.getItem('wallpaper')?.startsWith('data:')}>Custom</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="wallpaper-upload">Upload Custom Wallpaper</label>
                    <div class="file-input-wrapper">
                        <button class="btn">Choose File</button>
                        <input id="wallpaper-upload" type="file" accept="image/*" on:change={handleWallpaperUpload}/>
                    </div>
                </div>
            </section>
        {:else if activeSection === 'about'}
            <section>
                <h2>About</h2>
                <p>Graphite is a modern, web-based operating system.</p>
            </section>
        {/if}
    </div>
</div>

<style>
    @import '../shell/AppKit.css';

    .settings-container {
        display: flex;
        height: 100%;
    }

    .sidebar {
        width: 200px;
        background: var(--secondary-background);
        padding: 20px;
        border-right: 1px solid var(--border-color);
    }

    .sidebar h2 {
        margin-top: 0;
    }

    .sidebar nav {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .sidebar nav button {
        background: none;
        border: none;
        color: var(--primary-text);
        padding: 10px;
        text-align: left;
        cursor: pointer;
        border-radius: var(--border-radius);
    }

    .sidebar nav button.active {
        background: var(--accent-color);
        color: white;
    }

    .content {
        flex: 1;
        padding: 20px;
    }
</style>
