import { createHead } from '@unhead/vue/client'
import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import './styles/main.css'

const head = createHead()

createApp(App)
  .use(head)
  .mount('#app')
