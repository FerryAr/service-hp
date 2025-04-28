import { createApp } from 'vue'

import App from './App.vue'
import router from './router/router'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import VueViewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

const pinia = createPinia ()
pinia.use(piniaPluginPersistedState)

createApp(App).use(pinia).use(router).use(VueViewer).mount('#app')
