import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import PlainContainer from './containers/PlainContainer.vue'

Vue.config.productionTip = false;
Vue.component('plain-container', PlainContainer);


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
