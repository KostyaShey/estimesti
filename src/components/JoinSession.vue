<template>
  <div class="join-session">
    <h2>Join Session</h2>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <form @submit.prevent="joinSession">
      <div>
        <label for="name">Name</label><br />
        <input id="name" v-model="name" type="text" required />
      </div>
      <div style="margin-top: 1rem">
        <label for="sessionId">Session ID</label><br />
        <input id="sessionId" v-model="sessionId" type="text" required />
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem">
        <button type="submit" class="primary">Join Session</button>
        <button type="button" @click="goBack">Back</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import socket from '../socket';

const router = useRouter();
const route = useRoute();
const name = ref('');
const sessionId = ref('');
const errorMessage = ref('');

onMounted(() => {
  if (route.query.id) {
    sessionId.value = route.query.id;
  }
});

const joinSession = async () => {
  if (!name.value.trim() || !sessionId.value.trim()) {
    errorMessage.value = 'Please enter your name and session ID.';
    return;
  }
  // Check if session exists
  const res = await fetch(
    `http://localhost:3001/api/session/${sessionId.value}`
  );
  if (res.status === 404) {
    errorMessage.value = 'Session ID does not exist.';
    return;
  }
  // Call backend to join session
  await fetch('http://localhost:3001/api/session/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId.value,
      name: name.value.trim(),
    }),
  });
  // Store user name for this session
  localStorage.setItem(
    `session-user-name-${sessionId.value}`,
    name.value.trim()
  );
  // Join session room via socket
  socket.emit('join-session', {
    sessionId: sessionId.value,
    name: name.value.trim(),
  });
  router.push(`/session/${sessionId.value}`);
};
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.join-session {
  max-width: 400px;
  margin: 2rem auto;
}
.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
}
</style>
