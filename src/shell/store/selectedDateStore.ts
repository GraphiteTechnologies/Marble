import { writable } from 'svelte/store';

export const selectedDateStore = writable<string | null>(null);
