const socketAuth = require('./auth');
const Message = require('../models/Message');
const { getDefaultRoom } = require('../services/defaultRoom');
const { createMessage, getMessages } = require('../services/messageService');
const roomService = require('../services/roomService');
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

    // --- Presence (global) ---
    const existing = online.get(username);
    if (existing) {
      existing.sockets.add(socket.id);
    } else {
      online.set(username, { username, avatar, sockets: new Set([socket.id]) });
      io.emit('notification', `${username} joined the chat`);
    }
    io.emit('user list', onlineList());

    // --- Listeners (registered synchronously, before any await) ---

    // Open a room: validate access, join its socket.io room, send its history.
    socket.on('join room', async (roomId, ack) => {
      try {
        const room = await roomService.getRoomById(roomId);
        if (!room || !roomService.canAccess(room, userId)) {
          if (typeof ack === 'function') ack({ error: 'Access denied' });
          return;
        }
        socket.join(room._id.toString());
        const { messages } = await getMessages({ roomId: room._id, limit: 20 });
        socket.emit('room history', { roomId: room._id.toString(), messages: messages.map(serialize) });
        if (typeof ack === 'function') ack({ ok: true });
      } catch (err) {
        console.error('join room error:', err.message);
        if (typeof ack === 'function') ack({ error: 'Could not join room' });
      }
    });

    socket.on('leave room', (roomId) => {
      if (roomId) socket.leave(roomId.toString());
    });

    // New message: validate access, persist, broadcast to that room only.
    socket.on('chat message', async (data) => {
      const text = typeof data?.message === 'string' ? data.message.trim() : '';
      if (!text) return;
      if (text.length > MAX_MESSAGE_LENGTH) {
        socket.emit('message error', { reason: 'Message too long' });
        return;
      }
      try {
        let room;
        if (data?.roomId) {
          room = await roomService.getRoomById(data.roomId);
          if (!room || !roomService.canAccess(room, userId)) {
            socket.emit('message error', { reason: 'Access denied' });
            return;
          }
        } else {
          room = await getDefaultRoom();
        }
        const msg = await createMessage({ roomId: room._id, senderId: userId, text });
        io.to(room._id.toString()).emit('chat message', {
          id: msg._id.toString(),
          roomId: room._id.toString(),
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

    // Edit (author only) — broadcast to the message's room.
    socket.on('edit message', async ({ id, newText } = {}) => {
      const text = typeof newText === 'string' ? newText.trim() : '';
      if (!text) return;
      try {
        const msg = await Message.findById(id);
        if (!msg || msg.deleted || msg.sender.toString() !== userId) return;
        msg.text = text;
        msg.editedAt = new Date();
        await msg.save();
        io.to(msg.room.toString()).emit('edit message', { id, newText: text });
      } catch (err) {
        console.error('edit message error:', err.message);
      }
    });

    // Delete (soft, author only) — broadcast to the message's room.
    socket.on('delete message', async (id) => {
      try {
        const msg = await Message.findById(id);
        if (!msg || msg.deleted || msg.sender.toString() !== userId) return;
        msg.deleted = true;
        await msg.save();
        io.to(msg.room.toString()).emit('delete message', id);
      } catch (err) {
        console.error('delete message error:', err.message);
      }
    });

    // Typing indicators, scoped to the room the user is typing in.
    socket.on('typing', (roomId) => {
      if (roomId) socket.to(roomId.toString()).emit('typing', { username, roomId: roomId.toString() });
    });
    socket.on('stop typing', (roomId) => {
      if (roomId) socket.to(roomId.toString()).emit('stop typing', { username, roomId: roomId.toString() });
    });

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

    // --- Initial: auto-join General + this user's DM rooms, replay General. ---
    (async () => {
      try {
        const general = await getDefaultRoom();
        socket.join(general._id.toString());

        const rooms = await roomService.listRoomsForUser(userId);
        rooms.forEach((r) => {
          if (r.isDirect) socket.join(r._id.toString());
        });

        const { messages } = await getMessages({ roomId: general._id, limit: 20 });
        socket.emit('message history', messages.map(serialize));
      } catch (err) {
        console.error('init rooms error:', err.message);
        socket.emit('message history', []);
      }
    })();
  });
}

module.exports = registerSocketHandlers;
