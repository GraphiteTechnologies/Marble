<script lang="ts">
    import {onMount} from 'svelte';

    onMount(() => {
        const savedWallpaper = localStorage.getItem('wallpaper');
        if(!savedWallpaper)
            return;

        const desktop = document.querySelector('.desktop') as HTMLElement;
        if(!desktop)
            return;

        if(savedWallpaper.startsWith('data:')) {
            desktop.style.backgroundImage = `url(${savedWallpaper})`;
        } else {
            desktop.style.backgroundImage = `url(/wallpapers/${savedWallpaper})`;
        }
    });
</script>

<main class="desktop select-none">
    <slot></slot>
</main>

<style>
    .desktop {
        width: 100vw;
        height: 100vh;
        background-image: url('/wallpapers/shards.jpeg');
        background-size: cover;
        background-position: center;
        overflow: hidden;
    }
</style>
