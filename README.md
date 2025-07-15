# Real-Time Scrum Poker Web App

This project is a web application for story point estimation using scrum poker. It allows users to join a session from different devices and participate in real-time. Sessions are ephemeral and close when the host leaves.

## Tech Stack
- **Frontend:** Vue.js (Vite)
- **Backend:** Node.js/Express with WebSocket (to be added)

## Features
- Create and join estimation sessions
- Real-time voting and results
- No persistent storage; session closes when host leaves

## Getting Started
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Next Steps
- Implement backend server for session management and WebSocket communication
- Connect frontend to backend for real-time updates

---
For workspace-specific Copilot instructions, see `.github/copilot-instructions.md`.
