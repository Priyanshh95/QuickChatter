const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Serve static files from public directory
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

// Store last 20 messages
const messageHistory = [];

// Serve a simple message at root
app.get('/', (req, res) => {
  res.send('Server is running!');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send message history to the newly connected user
  socket.emit('message history', messageHistory);

  // Listen for chat messages and broadcast to all clients
  socket.on('chat message', (data) => {
    // data: { username, message, timestamp, avatar }
    if (!socket.username) {
      socket.username = data.username;
      socket.avatar = data.avatar;
      io.emit('notification', `${data.username} joined the chat`);
    }
    // Add message to history and keep only last 20
    messageHistory.push(data);
    if (messageHistory.length > 20) messageHistory.shift();
    io.emit('chat message', data);
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
      io.emit('notification', `${socket.username} left the chat`);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
}); 