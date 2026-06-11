# QuickChatter

A modern, real-time chat application built with Node.js, Express, Socket.IO, and MongoDB, featuring a clean, responsive frontend. *(A React client is on the way.)*

## Features

- **Real-time messaging** with Socket.IO
- **User authentication** (Sign Up, Login, Logout) backed by MongoDB
- **Passwords hashed with bcrypt**
- **Session management** (sessionStorage)
- **User avatars** (random emoji)
- **Emoji picker** for messages
- **Typing indicator**
- **Join/leave notifications**
- **Message timestamps** (12-hour am/pm)
- **Message editing and deletion** (for your own messages)
- **User list** sidebar (shows online users)
- **Message history** (last 20 messages shown to new users)
- **Responsive, modern UI** (mobile and desktop)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [MongoDB](https://www.mongodb.com/atlas) database (a free Atlas cluster works great)

### Installation
1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd QuickChatter
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   ```sh
   cp .env.example .env
   ```
   Then edit `.env` and set your `MONGODB_URI` (see `.env.example` for all values).

### Running the App
```sh
npm run dev    # development (auto-reload via nodemon)
npm start      # production
```
- The app will be available at [http://localhost:3000](http://localhost:3000)

### Project Structure
```
server/
  src/
    config/       # MongoDB connection
    models/       # Mongoose schemas (User, Room, Message)
    controllers/  # request handlers (auth)
    routes/       # Express routers (/api/auth)
    socket/       # Socket.IO event handlers
    utils/        # helpers (avatar)
    app.js        # Express app setup
    index.js      # entry point
public/           # frontend (HTML/CSS/JS — React client coming soon)
.env.example      # environment variable template
```

## API
- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — log in (returns a session token)
- `GET  /api/health` — health check

## Usage
- **Sign Up** with a unique username and email
- **Login** with your username or email
- **Chat** in real time with all connected users
- **Edit/Delete** your own messages
- **See who is online** in the sidebar
- **Use emojis** and see typing indicators

## Technology Stack
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB (Mongoose)
- **Frontend:** HTML, CSS, JavaScript *(React client in progress)*

## Security
- Passwords are hashed with bcrypt (via bcryptjs) before being stored in MongoDB.
- Input validation on auth endpoints.
- Secrets live in `.env` (gitignored) and are never committed.

## Notes
- **User accounts persist in MongoDB.**
- **Messages are currently in-memory** and reset on server restart (database persistence is in progress).
- **For development/demo use** (not production-ready yet).

## Customization
- You can change the emoji set, UI colors, or add features in `public/index.html` and the modules under `server/src/`.
