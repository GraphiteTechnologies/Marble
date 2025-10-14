import { writable } from 'svelte/store';

export const dateTimeStore = writable({
    calendarVisible: false,
    clockDetailsVisible: false,
    time: new Date()
});
