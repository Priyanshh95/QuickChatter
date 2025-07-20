const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');

const app = express();

// Serve static files from public directory
app.use(express.static('public'));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server);

// Store last 20 messages
const messageHistory = [];

// Track connected users
let users = [];

// In-memory user store: { username: { email, password, avatar } }
const USERS_FILE = 'users.json';
// Load users from file if exists
let usersDB = {};
if (fs.existsSync(USERS_FILE)) {
  try {
    usersDB = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to load users.json:', e);
    usersDB = {};
  }
}
// In-memory session store: { token: username }
const sessions = {};

// Register endpoint
app.post('/register', (req, res) => {
  const { email, username, password, confirmPassword } = req.body;
  if (!email || !username || !password || !confirmPassword) return res.status(400).json({ error: 'All fields are required' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  if (usersDB[username] || Object.values(usersDB).some(u => u.email === email)) return res.status(409).json({ error: 'Username or email already exists' });
  // Assign a random avatar
  const avatarEmojis = ['🦁','🐯','🐶','🐱','🐸','🐵','🐼','🐧','🐦','🐤','🦊','🐻','🐨','🐰','🦄','🐮','🐷','🐔','🐙','🦉','🐢','🐍','🐳','🐬','🦋','🐝','🐞','🦀','🦕','🦖'];
  const avatar = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
  usersDB[username] = { email, password, avatar };
  // Save users to file
  fs.writeFileSync(USERS_FILE, JSON.stringify(usersDB, null, 2));
  res.json({ success: true });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or email
  if (!identifier || !password) return res.status(400).json({ error: 'All fields are required' });
  let userEntry = Object.entries(usersDB).find(([uname, user]) => uname === identifier || user.email === identifier);
  if (!userEntry) return res.status(401).json({ error: 'Invalid credentials' });
  const [username, user] = userEntry;
  if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  // Generate a session token
  const token = crypto.randomBytes(16).toString('hex');
  sessions[token] = username;
  res.json({ success: true, token, username, avatar: user.avatar });
});

// Serve a simple message at root
app.get('/', (req, res) => {
  res.send('Server is running!');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // New: Register user event
  socket.on('register user', ({ username, avatar }) => {
    socket.username = username;
    socket.avatar = avatar;
    if (!users.some(u => u.id === socket.id)) {
      users.push({ id: socket.id, username, avatar });
      io.emit('user list', users.map(u => ({ username: u.username, avatar: u.avatar })));
      io.emit('notification', `${username} joined the chat`);
    }
  });

  // Send message history to the newly connected user
  socket.emit('message history', messageHistory);

  // Prompt for username and avatar on first message
  socket.on('chat message', (data) => {
    // data: { username, message, timestamp, avatar, id }
    if (!socket.username) {
      socket.username = data.username;
      socket.avatar = data.avatar;
      users.push({ id: socket.id, username: data.username, avatar: data.avatar });
      io.emit('user list', users.map(u => ({ username: u.username, avatar: u.avatar })));
      io.emit('notification', `${data.username} joined the chat`);
    }
    // Add message to history and keep only last 20
    messageHistory.push(data);
    if (messageHistory.length > 20) messageHistory.shift();
    io.emit('chat message', data);
  });

  socket.on('delete message', (id) => {
    // Remove from history
    const idx = messageHistory.findIndex(m => m.id === id && m.username === socket.username);
    if (idx !== -1) {
      messageHistory.splice(idx, 1);
      io.emit('delete message', id);
    }
  });

  socket.on('edit message', ({ id, newText }) => {
    // Edit in history
    const msg = messageHistory.find(m => m.id === id && m.username === socket.username);
    if (msg) {
      msg.message = newText;
      io.emit('edit message', { id, newText });
    }
  });

  // Typing indicator events
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });
  socket.on('stop typing', (username) => {
    socket.broadcast.emit('stop typing', username);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      users = users.filter(u => u.id !== socket.id);
      io.emit('user list', users.map(u => ({ username: u.username, avatar: u.avatar })));
      io.emit('notification', `${socket.username} left the chat`);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
}); 