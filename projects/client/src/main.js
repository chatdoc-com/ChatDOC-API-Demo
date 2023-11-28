import { createApp } from 'vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'virtual:svg-icons-register';
import 'element-plus/dist/index.css';
import 'github-markdown-css/github-markdown-light.css';
import './style.scss';
import App from './App.vue';

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
