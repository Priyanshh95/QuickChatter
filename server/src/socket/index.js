const socketAuth = require('./auth');

// NOTE: message history is still kept in memory here; MongoDB-backed
// persistence + pagination arrives in the next commit. Identity and presence
// are now authoritative (derived from the authenticated socket.user).

const MAX_MESSAGE_LENGTH = 1000;

function registerSocketHandlers(io) {
  // Reject unauthenticated connections at the handshake.
  io.use(socketAuth);

  // Last 20 messages, replayed to newly-connected clients.
  const messageHistory = [];

  // Presence: username -> { username, avatar, sockets: Set<socketId> }
  // A Set of socket ids lets the same user have multiple tabs/devices without
  // duplicate entries or premature "left the chat" notifications.
  const online = new Map();

  const onlineList = () =>
    [...online.values()].map((u) => ({ username: u.username, avatar: u.avatar }));

  io.on('connection', (socket) => {
    const { username, avatar } = socket.user;

    // --- Presence: register this connection ---
    const existing = online.get(username);
    if (existing) {
      existing.sockets.add(socket.id);
    } else {
      online.set(username, { username, avatar, sockets: new Set([socket.id]) });
      io.emit('notification', `${username} joined the chat`);
    }
    io.emit('user list', onlineList());

    // Replay recent history to the newly connected client.
    socket.emit('message history', messageHistory);

    // --- Messaging (identity is trusted, never taken from the payload) ---
    socket.on('chat message', (data) => {
      const text = typeof data?.message === 'string' ? data.message : '';
      if (!text.trim()) return;
      if (text.length > MAX_MESSAGE_LENGTH) {
        socket.emit('message error', { reason: 'Message too long' });
        return;
      }

      const message = {
        id: data?.id,
        username, // from JWT, not the client payload
        avatar,
        message: text,
        timestamp: data?.timestamp,
      };
      messageHistory.push(message);
      if (messageHistory.length > 20) messageHistory.shift();
      io.emit('chat message', message);
    });

    socket.on('edit message', ({ id, newText } = {}) => {
      if (typeof newText !== 'string' || !newText.trim()) return;
      const msg = messageHistory.find((m) => m.id === id && m.username === username);
      if (msg) {
        msg.message = newText;
        io.emit('edit message', { id, newText });
      }
    });

    socket.on('delete message', (id) => {
      const idx = messageHistory.findIndex((m) => m.id === id && m.username === username);
      if (idx !== -1) {
        messageHistory.splice(idx, 1);
        io.emit('delete message', id);
      }
    });

    // --- Typing indicators (broadcast the trusted username) ---
    socket.on('typing', () => socket.broadcast.emit('typing', username));
    socket.on('stop typing', () => socket.broadcast.emit('stop typing', username));

    // --- Presence: clean up on disconnect ---
    socket.on('disconnect', () => {
      const entry = online.get(username);
      if (entry) {
        entry.sockets.delete(socket.id);
        if (entry.sockets.size === 0) {
          online.delete(username);
          io.emit('notification', `${username} left the chat`);
        }
      }
      io.emit('user list', onlineList());
    });
  });
}

module.exports = registerSocketHandlers;
