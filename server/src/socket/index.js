const socketAuth = require('./auth');
const Message = require('../models/Message');
const { getDefaultRoom } = require('../services/defaultRoom');
const { createMessage, getMessages } = require('../services/messageService');
const { serialize, formatTime } = require('../utils/messageView');

const MAX_MESSAGE_LENGTH = 1000;

function registerSocketHandlers(io) {
  // Reject unauthenticated connections at the handshake.
  io.use(socketAuth);

  // Presence: username -> { username, avatar, sockets: Set<socketId> }
  const online = new Map();
  const onlineList = () =>
    [...online.values()].map((u) => ({ username: u.username, avatar: u.avatar }));

  io.on('connection', (socket) => {
    const { id: userId, username, avatar } = socket.user;

    // --- Presence: register this connection ---
    const existing = online.get(username);
    if (existing) {
      existing.sockets.add(socket.id);
    } else {
      online.set(username, { username, avatar, sockets: new Set([socket.id]) });
      io.emit('notification', `${username} joined the chat`);
    }
    io.emit('user list', onlineList());

    // --- Register event listeners synchronously (BEFORE any await) so a
    //     message the client fires immediately on connect is never missed. ---

    socket.on('chat message', async (data) => {
      const text = typeof data?.message === 'string' ? data.message.trim() : '';
      if (!text) return;
      if (text.length > MAX_MESSAGE_LENGTH) {
        socket.emit('message error', { reason: 'Message too long' });
        return;
      }
      try {
        const room = await getDefaultRoom();
        const msg = await createMessage({ roomId: room._id, senderId: userId, text });
        io.emit('chat message', {
          id: msg._id.toString(),
          username, // trusted identity from the JWT
          avatar,
          message: msg.text,
          timestamp: formatTime(msg.createdAt),
        });
      } catch (err) {
        console.error('save message error:', err.message);
        socket.emit('message error', { reason: 'Could not send message' });
      }
    });

    socket.on('edit message', async ({ id, newText } = {}) => {
      const text = typeof newText === 'string' ? newText.trim() : '';
      if (!text) return;
      try {
        const msg = await Message.findById(id);
        if (!msg || msg.deleted || msg.sender.toString() !== userId) return;
        msg.text = text;
        msg.editedAt = new Date();
        await msg.save();
        io.emit('edit message', { id, newText: text });
      } catch (err) {
        console.error('edit message error:', err.message);
      }
    });

    socket.on('delete message', async (id) => {
      try {
        const msg = await Message.findById(id);
        if (!msg || msg.deleted || msg.sender.toString() !== userId) return;
        msg.deleted = true;
        await msg.save();
        io.emit('delete message', id);
      } catch (err) {
        console.error('delete message error:', err.message);
      }
    });

    socket.on('typing', () => socket.broadcast.emit('typing', username));
    socket.on('stop typing', () => socket.broadcast.emit('stop typing', username));

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

    // --- Replay recent history from the database (async, after listeners) ---
    (async () => {
      try {
        const room = await getDefaultRoom();
        const { messages } = await getMessages({ roomId: room._id, limit: 20 });
        socket.emit('message history', messages.map(serialize));
      } catch (err) {
        console.error('history load error:', err.message);
        socket.emit('message history', []);
      }
    })();
  });
}

module.exports = registerSocketHandlers;
