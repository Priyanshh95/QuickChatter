// Socket.IO event handlers.
//
// NOTE: presence and message history are still kept in memory here, and
// sockets are not yet authenticated. Database-backed message persistence
// (Commit 5) and JWT-authenticated sockets + real presence (Commit 6)
// build on top of this structure. This commit only moves the existing
// behavior into a module — it is intentionally behavior-preserving.

const MAX_MESSAGE_LENGTH = 1000;

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

function registerSocketHandlers(io) {
  // Last 20 messages, replayed to newly-connected clients
  const messageHistory = [];
  // Currently connected users
  let users = [];

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('register user', ({ username, avatar }) => {
      socket.username = username;
      socket.avatar = avatar;
      if (!users.some((u) => u.id === socket.id)) {
        users.push({ id: socket.id, username, avatar });
        io.emit('user list', users.map((u) => ({ username: u.username, avatar: u.avatar })));
        io.emit('notification', `${username} joined the chat`);
      }
    });

    // Replay history to the newly connected user
    socket.emit('message history', messageHistory);

    socket.on('chat message', (data) => {
      // data: { username, message, timestamp, avatar, id }
      if (!socket.username) {
        socket.username = data.username;
        socket.avatar = data.avatar;
        users.push({ id: socket.id, username: data.username, avatar: data.avatar });
        io.emit('user list', users.map((u) => ({ username: u.username, avatar: u.avatar })));
        io.emit('notification', `${data.username} joined the chat`);
      }
      messageHistory.push(data);
      if (messageHistory.length > 20) messageHistory.shift();
      io.emit('chat message', data);
    });

    socket.on('delete message', (id) => {
      const idx = messageHistory.findIndex((m) => m.id === id && m.username === socket.username);
      if (idx !== -1) {
        messageHistory.splice(idx, 1);
        io.emit('delete message', id);
      }
    });

    socket.on('edit message', ({ id, newText }) => {
      const msg = messageHistory.find((m) => m.id === id && m.username === socket.username);
      if (msg) {
        msg.message = newText;
        io.emit('edit message', { id, newText });
      }
    });

    // Typing indicators
    socket.on('typing', (username) => socket.broadcast.emit('typing', username));
    socket.on('stop typing', (username) => socket.broadcast.emit('stop typing', username));

    socket.on('disconnect', () => {
      if (socket.username) {
        users = users.filter((u) => u.id !== socket.id);
        io.emit('user list', users.map((u) => ({ username: u.username, avatar: u.avatar })));
        io.emit('notification', `${socket.username} left the chat`);
      }
      console.log('User disconnected:', socket.id);
    });

    // Sanitized broadcast variant (kept from the original server; unused by
    // the current frontend, slated for cleanup when sockets are refactored).
    socket.on('sendMessage', (msg) => {
      const text = msg && msg.text ? String(msg.text).trim() : '';
      if (!text) return;
      if (text.length > MAX_MESSAGE_LENGTH) {
        socket.emit('messageError', { reason: 'Message too long' });
        return;
      }
      const message = {
        id: Date.now(),
        user: msg.user,
        text: escapeHtml(text),
        ts: Date.now(),
      };
      io.emit('message', message);
    });
  });
}

module.exports = registerSocketHandlers;
