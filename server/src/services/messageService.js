const Message = require('../models/Message');

/** Persist a new message. */
function createMessage({ roomId, senderId, text }) {
  return Message.create({ room: roomId, sender: senderId, text });
}

/**
 * Fetch a page of (non-deleted) messages for a room, newest-first internally
 * but returned in chronological order. Cursor-based: pass `before` (a date /
 * ISO string) to load older messages. Returns { messages, hasMore }.
 */
async function getMessages({ roomId, before, limit = 20 }) {
  const query = { room: roomId, deleted: false };
  if (before) {
    const d = new Date(before);
    if (!Number.isNaN(d.getTime())) query.createdAt = { $lt: d };
  }

  // Fetch one extra to determine whether more pages exist.
  const docs = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate('sender', 'username avatar');

  const hasMore = docs.length > limit;
  const page = docs.slice(0, limit).reverse(); // chronological order
  return { messages: page, hasMore };
}

module.exports = { createMessage, getMessages };
