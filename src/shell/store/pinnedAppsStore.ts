import { writable } from 'svelte/store';

const PINNED_APPS_STORAGE_KEY = 'graphite_pinned_apps';

const defaultPinnedApps = ['browser', 'terminal', 'settings'];

function createPinnedAppsStore() {
    const storedPinnedApps = localStorage.getItem(PINNED_APPS_STORAGE_KEY);
    const initialPinnedApps = storedPinnedApps ? JSON.parse(storedPinnedApps) : defaultPinnedApps;

    const store = writable<string[]>(initialPinnedApps);

    store.subscribe(value => {
        localStorage.setItem(PINNED_APPS_STORAGE_KEY, JSON.stringify(value));
    });

    return store;
}

export const pinnedApps = createPinnedAppsStore();
