const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Serve static files from public directory
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

// Serve a simple message at root
app.get('/', (req, res) => {
  res.send('Server is running!');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for chat messages and broadcast to all clients
  socket.on('chat message', (data) => {
    // data: { username, message, timestamp }
    // Store username on socket for disconnect notification
    if (!socket.username) {
      socket.username = data.username;
      io.emit('notification', `${data.username} joined the chat`);
    }
    io.emit('chat message', data);
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