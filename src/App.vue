<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, computed } from 'vue';
const router = useRouter();
const route = useRoute();
const sessionCreator = ref('');

const isCreator = computed(() => {
  const sessionId = route.params.id;
  if (!sessionId) return false;
  const userName = localStorage.getItem(`session-user-name-${sessionId}`);
  const creator = localStorage.getItem(`session-creator-${sessionId}`);
  return userName === creator;
});

const goHome = () => {
  router.push('/');
};
const removeSessionData = async () => {
  const sessionId = route.params.id;
  if (sessionId) {
    // Remove local session data
    localStorage.removeItem(`session-user-name-${sessionId}`);
    localStorage.removeItem(`session-items-${sessionId}`);
    localStorage.removeItem(`session-users-${sessionId}`);
    localStorage.removeItem(`session-creator-${sessionId}`);
    // Remove session from backend
    await fetch(`http://localhost:3001/api/session/${sessionId}`, {
      method: 'DELETE',
    });
    router.push('/');
  } else {
    alert('No session to remove.');
  }
};
</script>

<template>
  <div class="app-container">
    <button
      v-if="isCreator"
      class="remove-session-btn danger"
      @click="removeSessionData"
    >
      Remove Session
    </button>
    <button class="home-btn primary" @click="goHome">Home</button>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}
.remove-session-btn {
  position: fixed;
  top: 16px;
  right: 120px;
  z-index: 100;
}
.home-btn {
  position: fixed;
  top: 16px;
  right: 24px;
  z-index: 100;
}
.content {
  padding-top: 64px;
}
</style>
