import { writable } from 'svelte/store';
import type { AppMetadata } from '../../apps/types';
import { AppType } from '../../apps/types';

const WEB_APPS_STORAGE_KEY = 'graphite_web_apps';

const Browser = (async () => (await import('../../apps/Browser.svelte')).default)();

interface WebAppMetadata {
  id: string;
  name: string;
  icon: string;
  url: string;
}

function createWebAppsStore() {
  const storedWebApps = localStorage.getItem(WEB_APPS_STORAGE_KEY);
  const initialWebApps: WebAppMetadata[] = storedWebApps ? JSON.parse(storedWebApps) : [];

  const appsPromise = Promise.all(initialWebApps.map(async (webApp) => ({
    ...webApp,
    type: AppType.APPLICATION,
    component: await Browser,
  })));

  const { subscribe, update, set } = writable<AppMetadata[]>([]);

  appsPromise.then(set);

  subscribe(updatedApps => {
    const serializableApps = updatedApps
      .filter(app => app.url) // Ensure it's a web app
      .map(({ id, name, icon, url }) => ({ id, name, icon, url }));
    localStorage.setItem(WEB_APPS_STORAGE_KEY, JSON.stringify(serializableApps));
  });

  async function addWebApp(url: string) {
    try {
      const hostname = new URL(url).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

      const nameParts = hostname.replace(/^www\./, '').split('.');
      const name = nameParts.length > 1 ? nameParts[0] : nameParts[0];
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

      const newApp: AppMetadata = {
        id: `webapp-${Date.now()}`,
        name: capitalizedName,
        type: AppType.APPLICATION,
        component: await Browser,
        icon: faviconUrl,
        url: url,
      };

      update(currentApps => [...currentApps, newApp]);
    } catch (error) {
      console.error("Failed to add web app:", error);
    }
  }

  return {
    subscribe,
    addWebApp,
  };
}

export const webApps = createWebAppsStore();
