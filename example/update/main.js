// vue3 
import { createApp } from '../../lib/guide-mini-vue.esm.js'
import { App } from './App.js'


const rootContainer = document.querySelector('#app');
// App = { render (), setup() }
createApp(App).mount(rootContainer);