<script lang="ts">
    import { fly } from 'svelte/transition';
    import { dateTimeStore } from '../store/dateTimeStore';

    let time: Date;
    dateTimeStore.subscribe(store => {
        time = store.time;
    });

    $: formattedTimeWithSeconds = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
</script>

<div class="details-popup-scrim" on:click={() => dateTimeStore.update(s => ({...s, clockDetailsVisible: false}))}>
    <div class="clock-details-popup" transition:fly={{ y: 10, duration: 200 }} on:click|stopPropagation>
        <div class="time-display">{formattedTimeWithSeconds}</div>
    </div>
</div>

<style>
    .details-popup-scrim {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 11999;
    }
    .clock-details-popup {
        position: absolute;
        bottom: 56px;
        right: 16px;
        background-color: rgba(45, 46, 48, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        color: var(--primary-text);
        font-family: var(--font-family);
    }
    .time-display {
        font-size: var(--font-size-large);
        font-weight: 500;
        text-align: center;
    }
</style>
