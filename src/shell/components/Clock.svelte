<script lang="ts">
    import {onMount} from 'svelte';
    import Calendar from './Calendar.svelte';
    import ClockDetails from './ClockDetails.svelte';

    let time = new Date();
    let calendarVisible = false;
    let clockDetailsVisible = false;

    onMount(() => {
        const interval = setInterval(() => {
            time = new Date();
        }, 1000);

        // Hide popups on outside click
        const handleClickOutside = (event: MouseEvent) => {
            if(!(event.target as HTMLElement).closest('.clock-container, .calendar-container, .clock-details-container')) {
                calendarVisible = false;
                clockDetailsVisible = false;
            }
        };
        window.addEventListener('click', handleClickOutside);

        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleClickOutside);
        };
    });

    $: formattedDate = time.toLocaleDateString([], {month: 'short', day: 'numeric'});
    $: formattedTime = time.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(/ (AM|PM)$/, '');

    function toggleCalendar(event: MouseEvent) {
        event.stopPropagation();
        clockDetailsVisible = false;
        calendarVisible = !calendarVisible;
    }

    function toggleClockDetails(event: MouseEvent) {
        event.stopPropagation();
        calendarVisible = false;
        clockDetailsVisible = !clockDetailsVisible;
    }
</script>

<div class="clock-container">
    <button class="pill date" on:click={toggleCalendar}>{formattedDate}</button>
    <button class="pill time" on:click={toggleClockDetails}>{formattedTime}</button>
</div>

<Calendar bind:visible={calendarVisible}/>
<ClockDetails bind:visible={clockDetailsVisible} {time}/>

<style>
    .clock-container {
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
