const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5174', 'https://estimesti.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

app.use(
  cors({
    origin: ['http://localhost:5174', 'https://estimesti.vercel.app'],
    credentials: true,
  })
);
app.use(express.json());

// In-memory session store
const sessions = {};

// REST endpoint to create a session
app.post('/api/session', (req, res) => {
  const { sessionId, sessionName, items, creator } = req.body;
  if (!sessionId || !creator)
    return res.status(400).json({ error: 'Missing sessionId or creator' });
  sessions[sessionId] = {
    sessionName,
    items,
    users: [creator],
    currentItem: '',
    votes: {},
  };
  res.json({ success: true });
});

// REST endpoint to join a session
app.post('/api/session/join', (req, res) => {
  const { sessionId, name } = req.body;
  if (!sessions[sessionId])
    return res.status(404).json({ error: 'Session not found' });
  if (!sessions[sessionId].users.includes(name)) {
    sessions[sessionId].users.push(name);
    io.to(sessionId).emit('user-joined', { name });
  }
  res.json({ success: true });
});

// REST endpoint to get session data
app.get('/api/session/:id', (req, res) => {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// REST endpoint to delete a session
app.delete('/api/session/:id', (req, res) => {
  const sessionId = req.params.id;
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    io.to(sessionId).emit('session-removed');
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  socket.on('join-session', ({ sessionId, name }) => {
    socket.join(sessionId);
    if (sessions[sessionId]) {
      socket.emit('session-data', sessions[sessionId]);
    }
  });

  socket.on('set-current-item', ({ sessionId, item }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].currentItem = item;
      sessions[sessionId].votes = {}; // Reset votes when new item is selected
      io.to(sessionId).emit('current-item-changed', { item });
      io.to(sessionId).emit('votes-reset');
    }
  });

  socket.on('vote', ({ sessionId, userName, vote }) => {
    if (sessions[sessionId] && sessions[sessionId].currentItem) {
      if (!sessions[sessionId].votes[sessions[sessionId].currentItem]) {
        sessions[sessionId].votes[sessions[sessionId].currentItem] = {};
      }
      sessions[sessionId].votes[sessions[sessionId].currentItem][userName] =
        vote;

      // Check if all users have voted
      const totalUsers = sessions[sessionId].users.length;
      const votes = sessions[sessionId].votes[sessions[sessionId].currentItem];
      const votedUsers = Object.keys(votes).length;

      if (votedUsers === totalUsers) {
        io.to(sessionId).emit('voting-complete', { votes });
      } else {
        io.to(sessionId).emit('vote-cast', {
          userName,
          votedUsers,
          totalUsers,
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
