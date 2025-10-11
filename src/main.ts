// src/main.ts
import './shell/app.css'
import { Kernel } from './kernel/Kernel'
import { mount } from 'svelte'
import App from './shell/App.svelte'

const kernel = new Kernel();

const app = mount(App, {
  target: document.getElementById('app')!,
  props: {
    kernel: kernel
  }
})

export default app