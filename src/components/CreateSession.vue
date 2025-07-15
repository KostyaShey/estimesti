<template>
  <div class="create-session">
    <h2>Create Session</h2>
    <form @submit.prevent="createSession">
      <div>
        <label for="yourName">Your Name</label><br />
        <input id="yourName" v-model="yourName" type="text" required />
      </div>
      <div style="margin-top: 1rem">
        <label for="sessionName">Session Name</label><br />
        <input id="sessionName" v-model="sessionName" type="text" required />
      </div>
      <div style="margin-top: 1rem">
        <label>Session Items</label>
        <ul>
          <li
            v-for="(item, idx) in sessionItems"
            :key="idx"
            style="margin-bottom: 0.5rem"
          >
            <input
              v-model="sessionItems[idx]"
              type="text"
              placeholder="Item description"
            />
            <button type="button" class="danger" @click="removeItem(idx)">
              Remove
            </button>
          </li>
        </ul>
        <button type="button" class="primary" @click="addItem">Add Item</button>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem">
        <button type="submit" class="primary">Create Session</button>
        <button type="button" @click="goBack">Back</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import socket from '../socket';

const router = useRouter();
const yourName = ref('');
const sessionName = ref('');
const sessionItems = ref(['']);

const addItem = () => {
  sessionItems.value.push('');
};
const removeItem = (idx) => {
  sessionItems.value.splice(idx, 1);
};
const createSession = async () => {
  // Generate a random session id
  const sessionId = Math.random().toString(36).substr(2, 8);
  const items = sessionItems.value.filter((item) => item.trim() !== '');
  // Call backend to create session and wait for response
  const res = await fetch('http://localhost:3001/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      sessionName: sessionName.value,
      items,
      creator: yourName.value,
    }),
  });
  if (!res.ok) {
    alert('Failed to create session.');
    return;
  }
  // Store user name for this session so redirect does not happen
  localStorage.setItem(`session-user-name-${sessionId}`, yourName.value);
  // Store creator name for this session
  localStorage.setItem(`session-creator-${sessionId}`, yourName.value);
  // Join session room via socket
  socket.emit('join-session', { sessionId, name: yourName.value });
  // Wait for backend to initialize session before navigating
  setTimeout(() => {
    router.push(`/session/${sessionId}`);
  }, 200);
};
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.create-session {
  max-width: 400px;
  margin: 2rem auto;
}
</style>
