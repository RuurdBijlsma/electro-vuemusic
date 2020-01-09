import Vue from 'vue'
import App from './App.vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import './assets/vm3-theme-primary-on-dark.css'
import router from './router'
import store from './store';
import './registerServiceWorker'

import { RecycleScroller } from 'vue-virtual-scroller';
Vue.component('RecycleScroller', RecycleScroller);
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
Vue.config.productionTip = false;
Vue.use(VueMaterial);

import XMLHttpRequestInterceptor from "./js/XMLHttpRequestInterceptor";
window.XMLHttpRequest = XMLHttpRequestInterceptor;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
