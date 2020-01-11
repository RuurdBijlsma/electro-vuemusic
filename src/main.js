import Vue from 'vue'
import App from './renderer/App.vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import './assets/vm3-theme-primary-on-dark.css'
// import 'vue-material/dist/theme/default.css';
import router from './renderer/router'
import store from './renderer/store';
import './renderer/registerServiceWorker'
import {RecycleScroller} from 'vue-virtual-scroller';
Vue.component('RecycleScroller', RecycleScroller);
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

Vue.config.productionTip = false;
Vue.use(VueMaterial);

import XMLHttpRequestInterceptor from "./renderer/js/XMLHttpRequestInterceptor";

window.XMLHttpRequest = XMLHttpRequestInterceptor;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
