import type {Writable} from 'svelte/store';
import {writable} from 'svelte/store';
import type {AppMetadata} from '../../apps/types';
import {appRegistry} from '../../apps/registry';

const PINNED_APPS_STORAGE_KEY = 'graphite_pinned_apps';

const defaultPinnedApps = ['Browser', 'Terminal', 'Settings'];

function createPinnedAppsStore(): Writable<string[]> {
    const storedPinnedApps = localStorage.getItem(PINNED_APPS_STORAGE_KEY);
    const initialPinnedApps = storedPinnedApps ? JSON.parse(storedPinnedApps) : defaultPinnedApps;

    const {subscribe, set, update} = writable<string[]>(initialPinnedApps);

    return {
        subscribe,
        set,
        update,
    };
}

export const pinnedApps = createPinnedAppsStore();

pinnedApps.subscribe(value => {
    localStorage.setItem(PINNED_APPS_STORAGE_KEY, JSON.stringify(value));
});

export function getPinnedAppMetadata(): AppMetadata[] {
    let apps: AppMetadata[] = [];
    const unsubscribe = pinnedApps.subscribe(pinnedAppNames => {
        apps = pinnedAppNames
            .map(name => appRegistry.find(app => app.name === name))
            .filter((app): app is AppMetadata => !!app);
    });
    unsubscribe();
    return apps;
}
