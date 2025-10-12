import './shell/app.css'
import { Kernel } from './kernel/Kernel'
import { mount } from 'svelte'
import App from './shell/App.svelte'

const kernel = new Kernel();

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
}, 3000);

appHost.classList.remove('hidden');

export default app
