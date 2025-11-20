# QuickChatter

A modern, real-time chat application built with Node.js, Express, and Socket.IO, featuring a clean, responsive HTML/CSS/JS frontend.

## Features

- **Real-time messaging** with Socket.IO
- **User authentication** (Sign Up, Login, Logout)
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
- **No browser autofill** on auth/chat forms
- **Persistent user accounts** (stored in `users.json`)
- **In-memory message storage** (reset on server restart)


## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+ recommended)

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
   - For security features:
   ```sh
   npm install bcryptjs
   ```

### Running the App
```sh
node server.js
```

- The app will be available at [http://localhost:3000](http://localhost:3000)

### File Structure
- `server.js` — Main backend (Express + Socket.IO)
- `public/` — Frontend HTML, CSS, JS
- `users.json` — User credentials (auto-created)

## Usage
- **Sign Up** with a unique username and email
- **Login** with your username or email
- **Chat** in real time with all connected users
- **Edit/Delete** your own messages
- **See who is online** in the sidebar
- **Use emojis** and see typing indicators

## Technology Stack
- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** HTML, CSS, JavaScript (no frameworks)
- **Storage:**
  - User accounts: `users.json` (local file)
  - Messages: In-memory (not persistent)

## Security improvements added
- Passwords are now hashed with bcrypt (via bcryptjs) before being saved to users.json.
- Basic input validation added to auth endpoints.
- Messages are sanitized/escaped on the server and rendered as plain text on the client to prevent XSS; a maximum message length is enforced.

## Notes
- **No database required** — user data is stored in a local file
- **Messages are not saved** after server restarts
- **For development/demo use** (not production-ready)

## Customization
- You can change the emoji set, UI colors, or add new features easily in `public/index.html` and `server.js`.

