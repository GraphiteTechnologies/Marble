import './shell/app.css'
import { Kernel } from './kernel/Kernel'
import { mount } from 'svelte'
import App from './shell/App.svelte'

async function main() {
  const kernel = new Kernel();
  await kernel.init();

  function createApp() {
    return mount(App, {
      target: document.getElementById('app')!,
      props: {
        kernel: kernel
      }
    })
  }

  const app = createApp();
  const splash = document.getElementById('splash')!;
  const appHost = document.getElementById('app')!;

  splash.style.opacity = '0';

  setTimeout(() => {
      splash.parentNode!.removeChild(splash);
  }, 1000);

  appHost.classList.remove('hidden');

  return app;
}

export default main();
