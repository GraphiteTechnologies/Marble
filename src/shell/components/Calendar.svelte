<script lang="ts">
    import {fly} from 'svelte/transition';
    import {CaretLeft, CaretRight} from 'phosphor-svelte';

    export let visible = false;

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    $: daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    $: firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    $: monthName = new Date(currentYear, currentMonth).toLocaleString('default', {month: 'long'});

    function getWeeks() {
        const weeks = [];
        let week = [];
        for(let i = 0; i < firstDayOfMonth; i++) {
            week.push(null);
        }
        for(let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            if(week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }
        if(week.length > 0) {
            weeks.push(week);
        }
        return weeks;
    }

    function isToday(day: number) {
        return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    }

    function prevMonth() {
        currentMonth--;
        if(currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    }

    function nextMonth() {
        currentMonth++;
        if(currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }
</script>

{#if visible}
    <div class="calendar-container" transition:fly={{ y: 10, duration: 200 }}>
        <div class="header">
            <div class="month-year">{monthName} {currentYear}</div>
            <div class="controls">
                <button on:click={prevMonth}>
                    <CaretLeft size={16}/>
                </button>
                <button on:click={nextMonth}>
                    <CaretRight size={16}/>
                </button>
            </div>
        </div>
        <div class="days-of-week">
            {#each daysOfWeek as day}
                <div>{day}</div>
            {/each}
        </div>
        <div class="days">
            {#each getWeeks() as week}
                {#each week as day}
                    <div class="day" class:today={isToday(day ? day : 0)}>{day}</div>
                {/each}
            {/each}
        </div>
    </div>
{/if}

<style>
    .calendar-container {
        position: absolute;
        bottom: 56px;
        right: 16px;
        width: 280px;
        background-color: rgba(32, 33, 36, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: var(--spacing-medium);
        z-index: 12000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        color: var(--primary-text);
        font-family: var(--font-family);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-medium);
    }

    .month-year {
        font-size: var(--font-size-large);
        font-weight: 500;
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .controls button {
        background: none;
        border: none;
        color: var(--primary-text);
        cursor: pointer;
        padding: 6px;
        display: flex;
        align-items: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    .controls button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .days-of-week, .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
    }

    .days-of-week {
        color: var(--secondary-text);
        margin-bottom: var(--spacing-small);
        font-size: 12px;
    }

    .day {
        padding: var(--spacing-small);
        border-radius: 50%;
        font-size: 13px;
        height: 20px;
        width: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .day.today {
        background-color: var(--accent-color);
        color: var(--primary-background);
    }
</style>
