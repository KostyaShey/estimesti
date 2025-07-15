import { createRouter, createWebHistory } from 'vue-router';
import WelcomeScreen from './components/WelcomeScreen.vue';
import CreateSession from './components/CreateSession.vue';
import JoinSession from './components/JoinSession.vue';
import CurrentSession from './components/CurrentSession.vue';

const routes = [
  { path: '/', component: WelcomeScreen },
  { path: '/create', component: CreateSession },
  { path: '/join', component: JoinSession },
  { path: '/session/:id', component: CurrentSession, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
