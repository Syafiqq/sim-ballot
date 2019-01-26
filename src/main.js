import Vue from 'vue'
import App from './App.vue'
import PlainContainer from './containers/PlainContainer.vue'
import BootstrapVue from 'bootstrap-vue'

require('./resources/js/bootstrap.js');

Vue.config.productionTip = false;
Vue.component('plain-container', PlainContainer);
Vue.use(BootstrapVue);


new Vue({
  render: h => h(App)
}).$mount('#app');
