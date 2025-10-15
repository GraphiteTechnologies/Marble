import { writable } from 'svelte/store';

export const dateTimeStore = writable({
	calendarVisible: false,
	time: new Date()
});
