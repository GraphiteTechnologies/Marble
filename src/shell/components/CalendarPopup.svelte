<script lang="ts">
    import {fly} from 'svelte/transition';
    import {CaretLeft, CaretRight} from 'phosphor-svelte';
    import {dateTimeStore} from '../store/dateTimeStore';
    import {selectedDateStore} from '../store/selectedDateStore';
    import TodoList from './TodoList.svelte';
    import {onMount} from 'svelte';

    const today = new Date();
	let currentMonth = today.getMonth();
	let currentYear = today.getFullYear();

	let time: Date;
	dateTimeStore.subscribe((store) => {
		time = store.time;
	});

	$: formattedTimeWithSeconds = time.toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	});

	onMount(() => {
		return () => {
			selectedDateStore.set(null);
		};
	});

	$: monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
	$: calendarDays = (() => {
		const days = [];
        const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
        const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for(let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        for(let i = 1; i <= daysInCurrentMonth; i++) {
            days.push(i);
        }
        return days;
    })();

    function isToday(day: number | null): boolean {
        return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    }

    function handleDateClick(day: number | null) {
        if(!day) return;
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toISOString().split('T')[0];

        if($selectedDateStore === dateString) {
            selectedDateStore.set(null);
        } else {
            selectedDateStore.set(dateString);
        }
    }

    function isSelected(day: number | null): boolean {
        if(!day) return false;
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toISOString().split('T')[0];
        return $selectedDateStore === dateString;
    }

    function prevMonth() {
        currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        if(currentMonth === 11) currentYear--;
    }

    function nextMonth() {
        currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        if(currentMonth === 0) currentYear++;
    }
</script>

<div class="details-popup-scrim" on:click={() => dateTimeStore.update(s => ({...s, calendarVisible: false}))}>
    <div class="calendar-popup" transition:fly={{ y: 10, duration: 200 }} on:click|stopPropagation>
        <TodoList/>
        <div class="calendar-body">
            <div class="header">
                <div class="month-year">{monthName} {currentYear}</div>
                <div class="controls">
                    <button on:click={prevMonth} aria-label="Previous month">
                        <CaretLeft size={16}/>
                    </button>
                    <button on:click={nextMonth} aria-label="Next month">
                        <CaretRight size={16}/>
                    </button>
                </div>
            </div>
            <div class="days-of-week">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
            </div>
			<div class="days">
				{#each calendarDays as day}
					<div
						class="day"
						class:today={isToday(day)}
						class:selected={isSelected(day)}
						on:click={() => handleDateClick(day)}
						role="button"
						tabindex="0"
					>
						{day}
					</div>
				{/each}
			</div>
		</div>
		<div class="footer">
			<div class="time-display">{formattedTimeWithSeconds}</div>
		</div>
	</div>
</div>

<style>
	.time-display {
		font-size: 14px;
		text-align: left;
	}

	.footer {
		padding: 8px 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	.details-popup-scrim {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 11999;
	}

	.calendar-popup {
		position: absolute;
		bottom: 56px;
		right: 16px;
		width: 320px;
		background-color: var(--ui-transparent-background);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		color: var(--primary-text);
		font-family: var(--font-family);
		padding: 0;
	}

	.calendar-body {
		padding: 16px;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
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

	.days-of-week,
	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		text-align: center;
	}

	.days-of-week {
		color: var(--secondary-text);
		margin-bottom: 8px;
		font-size: 12px;
	}

	.days {
		gap: 2px;
	}

	.day {
		padding: 6px;
		border-radius: 50%;
		font-size: 13px;
		height: 28px;
		width: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		cursor: pointer;
	}

	.day:not(:empty):hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.day.today {
		background-color: var(--accent-color);
		color: white;
		font-weight: bold;
	}

	.day.selected {
		box-shadow: 0 0 0 2px var(--accent-color);
	}
</style>
