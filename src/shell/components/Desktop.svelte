<script lang="ts">
    import { accounts } from '../store/accountStore';

    const currentUser = accounts.getCurrentUser();
    const wallpaper = currentUser?.wallpaper || 'shards.jpeg';

    $: background = wallpaper.startsWith('data:')
        ? `url(${wallpaper})`
        : `url(/wallpapers/${wallpaper})`;
</script>

<main class="desktop select-none" style="background-image: {background}">
    <slot></slot>
</main>

<style>
    .desktop {
        width: 100vw;
        height: 100vh;
        background-size: cover;
        background-position: center;
        overflow: hidden;
    }
</style>
