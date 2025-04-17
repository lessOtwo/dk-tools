import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import { Buffer } from 'buffer'
import process from 'process'
import './assets/tailwind.css'

createApp(App)
  .use(router)
  .use(createPinia())
  .mount('#app');

window.Buffer = Buffer
window.process = process