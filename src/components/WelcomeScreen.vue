<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    "
  >
    <h1>Welcome to estimesti</h1>
    <div style="margin-top: 2rem; display: flex; gap: 1rem">
      <button class="primary" @click="onCreateSession">Create Session</button>
      <button class="primary" @click="onJoinSession">Join Session</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const onCreateSession = () => {
  router.push('/create');
};
const onJoinSession = () => {
  router.push('/join');
};
</script>
