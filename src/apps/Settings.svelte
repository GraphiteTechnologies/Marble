<script lang="ts">
    import {getContext, onMount} from 'svelte';
    import type {Kernel} from '../kernel/Kernel';

    let wallpapers: string[] = [];
    let selectedWallpaper: string = '';

    onMount(async() => {
        const kernel = getContext<Kernel>('kernel');
        const vfs = kernel.vfs;
        const wallpaperFiles = vfs.readDir('/usr/share/wallpapers');
        wallpapers = wallpaperFiles.map(file => file.name);

        const savedWallpaper = localStorage.getItem('wallpaper');
        if(savedWallpaper) {
            if(savedWallpaper.startsWith('data:')) {
                selectedWallpaper = 'custom';
            } else {
                selectedWallpaper = savedWallpaper;
            }
        } else {
            selectedWallpaper = 'shards.jpeg';
        }
    });

    function changeWallpaper() {
        if(selectedWallpaper !== 'custom') {
            localStorage.setItem('wallpaper', selectedWallpaper);
            const desktop = document.querySelector('.desktop') as HTMLElement;
            if(desktop) {
                desktop.style.backgroundImage = `url(/wallpapers/${selectedWallpaper})`;
            }
        }
    }

    function handleWallpaperUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                localStorage.setItem('wallpaper', dataUrl);
                const desktop = document.querySelector('.desktop') as HTMLElement;
                if(desktop) {
                    desktop.style.backgroundImage = `url(${dataUrl})`;
                }
                selectedWallpaper = 'custom';
            };
            reader.readAsDataURL(file);
        }
    }
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
    <h1>Settings</h1>
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
</div>

<style>
    @import '../shell/AppKit.css';
</style>
