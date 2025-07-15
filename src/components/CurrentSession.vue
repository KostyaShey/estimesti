<template>
  <div class="current-session">
    <div class="session-items">
      <h2>Session ID: {{ sessionId }}</h2>
      <div v-if="sessionItems.length">
        <h3>Items</h3>
        <ul>
          <li
            v-for="(item, idx) in sessionItems"
            :key="idx"
            :class="{ 'current-item': item === currentItem }"
          >
            {{ item }}
            <!-- Show vote results if voting is completed for this item -->
            <div v-if="completedVotes[item]" class="item-results">
              <div class="vote-summary">
                <span
                  v-for="(vote, user) in completedVotes[item]"
                  :key="user"
                  class="vote-badge"
                >
                  {{ votingCards.find((c) => c.value === vote)?.emoji }}
                </span>
              </div>
            </div>
            <!-- Show select button only if no votes completed for this item -->
            <button
              v-else-if="isCreator"
              class="primary"
              @click="setCurrentItem(item)"
              :disabled="item === currentItem"
            >
              {{ item === currentItem ? 'Current' : 'Select' }}
            </button>
          </li>
        </ul>
        <div v-if="currentItem" class="current-estimation">
          <h3>Currently Estimating: {{ currentItem }}</h3>

          <!-- Voting Cards -->
          <div v-if="!showResults" class="voting-section">
            <h4>Cast your vote:</h4>
            <div v-if="!userVote" class="voting-cards">
              <button
                v-for="card in votingCards"
                :key="card.value"
                class="voting-card"
                @click="vote(card)"
              >
                <div class="card-emoji">{{ card.emoji }}</div>
                <div class="card-label">{{ card.label }}</div>
              </button>
            </div>
            <div v-else class="vote-cast">
              <p>
                ✅ You voted:
                {{ votingCards.find((c) => c.value === userVote)?.label }}
              </p>
              <p>
                Waiting for others... ({{ votedUsers }}/{{ totalUsers }} voted)
              </p>
            </div>
          </div>

          <!-- Results -->
          <div v-if="showResults" class="results-section">
            <h4>Voting Results:</h4>
            <div class="results">
              <div
                v-for="(vote, user) in votes"
                :key="user"
                class="result-item"
              >
                <span class="user-name">{{ user }}:</span>
                <span class="vote-result">
                  {{ votingCards.find((c) => c.value === vote)?.emoji }}
                  {{ votingCards.find((c) => c.value === vote)?.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <em>No items found for this session.</em>
      </div>
      <div class="session-users" style="margin-top: 2rem">
        <h3>Users</h3>
        <ul>
          <li v-for="(user, idx) in sessionUsers" :key="idx">{{ user }}</li>
        </ul>
      </div>
    </div>
    <!-- Other session content can go here -->
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import socket from '../socket';

const route = useRoute();
const router = useRouter();
const sessionId = route.params.id;

const sessionItems = ref([]);
const sessionUsers = ref([]);
const currentItem = ref('');
const isCreator = ref(false);
const userVote = ref('');
const showResults = ref(false);
const votes = ref({});
const votedUsers = ref(0);
const totalUsers = ref(0);
const completedVotes = ref({}); // Track completed votes per item

const votingCards = [
  { value: 'mosquito', emoji: '🦟', label: 'Mosquito' },
  { value: 'rat', emoji: '🐀', label: 'Rat' },
  { value: 'cat', emoji: '🐱', label: 'Cat' },
  { value: 'dog', emoji: '🐶', label: 'Dog' },
  { value: 'horse', emoji: '🐴', label: 'Horse' },
  { value: 'elephant', emoji: '🐘', label: 'Elephant' },
  { value: 'whale', emoji: '🐋', label: 'Whale' },
  { value: 'your-mom', emoji: '👩', label: 'Your Mom' },
];

onMounted(() => {
  // Check for user name in localStorage
  const userName = localStorage.getItem(`session-user-name-${sessionId}`);
  if (!userName) {
    // Redirect to join session page with prefilled sessionId
    router.replace({ path: '/join', query: { id: sessionId } });
    return;
  }
  // Fetch session data from backend
  fetch(`http://localhost:3001/api/session/${sessionId}`)
    .then((res) => {
      if (!res.ok) throw new Error('Session not found');
      return res.json();
    })
    .then((data) => {
      sessionItems.value = data.items || [];
      sessionUsers.value = data.users || [];
      currentItem.value = data.currentItem || '';
      // Load all completed votes from backend
      completedVotes.value = data.votes || {};
      // Check if current user is creator
      const creator = localStorage.getItem(`session-creator-${sessionId}`);
      const userName = localStorage.getItem(`session-user-name-${sessionId}`);
      isCreator.value = userName === creator;
    })
    .catch((err) => {
      sessionItems.value = [];
      sessionUsers.value = [];
      alert('Session not found or was removed.');
      router.push('/');
    });
  // Listen for real-time updates
  socket.emit('join-session', { sessionId, name: userName });
  socket.on('session-data', (data) => {
    // Update with fresh session data including vote history
    sessionItems.value = data.items || [];
    sessionUsers.value = data.users || [];
    currentItem.value = data.currentItem || '';
    completedVotes.value = data.votes || {};
  });
  socket.on('user-joined', ({ name }) => {
    if (!sessionUsers.value.includes(name)) {
      sessionUsers.value.push(name);
    }
  });
  socket.on('current-item-changed', ({ item }) => {
    currentItem.value = item;
    userVote.value = '';
    showResults.value = false;
    votes.value = {};
  });
  socket.on('votes-reset', () => {
    userVote.value = '';
    showResults.value = false;
    votes.value = {};
    votedUsers.value = 0;
  });
  socket.on(
    'vote-cast',
    ({ userName, votedUsers: voted, totalUsers: total }) => {
      votedUsers.value = voted;
      totalUsers.value = total;
    }
  );
  socket.on('voting-complete', ({ votes: finalVotes }) => {
    votes.value = finalVotes;
    showResults.value = true;
    // Store the completed votes for this item
    if (currentItem.value) {
      completedVotes.value[currentItem.value] = finalVotes;
    }
  });
});

const setCurrentItem = (item) => {
  socket.emit('set-current-item', { sessionId, item });
  currentItem.value = item;
};

const vote = (card) => {
  if (!userVote.value && currentItem.value) {
    userVote.value = card.value;
    const userName = localStorage.getItem(`session-user-name-${sessionId}`);
    socket.emit('vote', { sessionId, userName, vote: card.value });
  }
};
</script>

<style scoped>
.current-session {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.session-items {
  margin-left: 5vw;
  min-width: 220px;
}
.current-item {
  background-color: #e8f5e8;
  font-weight: bold;
}
.current-estimation {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f8ff;
  border-radius: 6px;
}
.voting-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}
.voting-card {
  min-width: 80px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.voting-card:hover {
  border-color: #42b983;
  background-color: #f0f8f0;
  transform: translateY(-2px);
}
.card-emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.card-label {
  font-size: 0.9rem;
  font-weight: bold;
}
.vote-cast {
  margin-top: 1rem;
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 6px;
}
.results-section {
  margin-top: 1rem;
}
.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f9f9f9;
  border-radius: 4px;
}
.user-name {
  font-weight: bold;
}
.vote-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.item-results {
  margin-left: 1rem;
  display: inline-block;
}
.vote-summary {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}
.vote-badge {
  font-size: 1.2rem;
  padding: 0.1rem 0.3rem;
  background: #f0f8ff;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
