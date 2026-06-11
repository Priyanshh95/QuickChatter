# QuickChatter

![CI](https://github.com/Priyanshh95/QuickChatter/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

A full-stack, real-time chat application: **channels**, **direct messages**, presence, typing
indicators, emoji, and dark mode — built on the MERN stack with JWT-authenticated WebSockets.

> **Stack:** React (Vite) · Node.js · Express · Socket.IO · MongoDB (Mongoose) · JWT + bcrypt

## Screenshots

<!-- Add screenshots/GIFs here, e.g. ./docs/login.png and ./docs/chat.png -->
_Run it locally (below) to see the live UI — light & dark themes._

## Features

- 🔐 **Auth** — register/login with bcrypt-hashed passwords and JWTs
- 💬 **Real-time messaging** over authenticated Socket.IO
- #️⃣ **Channels** and 1:1 **direct messages** with access control
- 🟢 **Presence** — live online list, multi-tab aware
- ✍️ **Typing indicators**, per room
- ✏️ **Edit / delete** your own messages (soft delete)
- 🗄️ **Persistent history** in MongoDB with cursor pagination
- 😀 **Emoji picker** and 🌙 **dark mode**
- 📱 Responsive layout

## Architecture

```
QuickChatter/
├── server/             # Express + Socket.IO + MongoDB API
│   └── src/
│       ├── config/  models/  controllers/  routes/
│       ├── middleware/   # JWT auth, error handling
│       ├── services/     # rooms, messages, default room
│       ├── socket/       # authenticated realtime handlers
│       ├── app.js        # Express app (serves the built client in prod)
│       └── index.js      # entry point
├── client/             # React + Vite single-page app
│   └── src/
│       ├── context/  components/  hooks/  pages/  api/  lib/
├── Dockerfile          # multi-stage build (client → server runtime)
├── docker-compose.yml  # app + MongoDB
└── .github/workflows/  # CI (server tests, client build + tests)
```

## Getting Started (development)

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- A [MongoDB](https://www.mongodb.com/atlas) database (a free Atlas cluster works great)

### Setup
```sh
# 1. install backend deps
npm install

# 2. install client deps
cd client && npm install && cd ..

# 3. configure env
cp .env.example .env      # then set MONGODB_URI and JWT_SECRET
```

### Run (two terminals)
```sh
npm run dev               # backend → http://localhost:3000
cd client && npm run dev  # client  → http://localhost:5173
```
Open **http://localhost:5173**. The Vite dev server proxies `/api` and `/socket.io` to the backend.

## Run with Docker

Spins up the app **and** a MongoDB instance:
```sh
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```
Then open **http://localhost:3000** (Express serves the built React client in production).

## Testing

```sh
npm test                  # backend — Jest + supertest (in-memory MongoDB)
cd client && npm test     # client  — Vitest + Testing Library
```
CI runs both suites on every push and pull request.

## API

All `/api/*` routes except auth require `Authorization: Bearer <token>`.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in (returns a JWT) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/rooms` | List channels + your DMs |
| POST | `/api/rooms` | Create a public channel |
| POST | `/api/rooms/dm` | Start/reuse a DM (`{ username }`) |
| GET | `/api/rooms/:roomId/messages` | Paginated room history (`before`, `limit`) |
| GET | `/api/health` | Health check |

**Socket events:** `join room`, `leave room`, `chat message`, `edit message`,
`delete message`, `typing` / `stop typing` → server emits `room history`,
`chat message`, `user list`, `notification`, etc.

## Deployment

- **Docker host:** build the image (`docker build -t quickchatter .`) and run with
  `MONGODB_URI`, `JWT_SECRET`, and `PORT` set.
- **Render:** the included [`render.yaml`](./render.yaml) blueprint deploys the Docker
  image — set `MONGODB_URI` in the dashboard; `JWT_SECRET` is generated.

## License

ISC © Priyanshu Bansal
