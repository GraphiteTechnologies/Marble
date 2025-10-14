<script lang="ts">
    import {onMount} from 'svelte';
    import {dateTimeStore} from '../store/dateTimeStore';

    let time = new Date();

    onMount(() => {
        const interval = setInterval(() => {
            time = new Date();
            dateTimeStore.update(store => ({...store, time}));
        }, 1000);

        return () => clearInterval(interval);
    });

    $: formattedDate = time.toLocaleDateString([], {month: 'short', day: 'numeric'});
    $: formattedTime = time.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(/ (AM|PM)$/, '');

    function toggleCalendar(event: MouseEvent) {
        event.stopPropagation();
        dateTimeStore.update(store => ({
            ...store,
            calendarVisible: !store.calendarVisible,
            clockDetailsVisible: false
        }));
    }

    function toggleClockDetails(event: MouseEvent) {
        event.stopPropagation();
        dateTimeStore.update(store => ({
            ...store,
            clockDetailsVisible: !store.clockDetailsVisible,
            calendarVisible: false
        }));
    }
</script>

<div class="pills">
    <button class="pill date" on:click={toggleCalendar}>{formattedDate}</button>
    <button class="pill time" on:click={toggleClockDetails}>{formattedTime}</button>
</div>

<style>
    .pills {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .pill {
        background-color: rgba(255, 255, 255, 0.1);
        height: 36px;
        width: 72px;
        padding: 0 12px;
        font-size: 14px;
        font-weight: 500;
        color: #e8eaed;
        transition: background-color 0.2s;
        cursor: pointer;
        border: none;
        font-family: var(--font-family);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pill:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .date {
        border-radius: 18px 0 0 18px;
    }

    .time {
        border-radius: 0 18px 18px 0;
    }
</style>
