const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const roomService = require('../services/roomService');
const { getMessages } = require('../services/messageService');
const { serialize } = require('../utils/messageView');

// Shape a room for the client. DMs are presented as the *other* participant.
function viewRoom(room, userId) {
  if (room.isDirect) {
    const other = room.members.find(
      (m) => (m._id ? m._id.toString() : m.toString()) !== userId.toString()
    );
    return {
      id: room._id.toString(),
      isDirect: true,
      name: other?.username || 'Direct message',
      avatar: other?.avatar || '👤',
      members: room.members.map((m) => ({ username: m.username, avatar: m.avatar })),
    };
  }
  return {
    id: room._id.toString(),
    isDirect: false,
    name: room.name,
    description: room.description,
  };
}

/** GET /api/rooms — channels + this user's DMs. */
const listRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.listRoomsForUser(req.user.id);
  res.json({ rooms: rooms.map((r) => viewRoom(r, req.user.id)) });
});

/** POST /api/rooms — create a public channel. */
const createRoom = asyncHandler(async (req, res) => {
  const name = (req.body?.name || '').trim();
  if (name.length < 2) throw new ApiError(400, 'Room name must be at least 2 characters');
  const room = await roomService.createChannel({
    name,
    description: req.body?.description,
    userId: req.user.id,
  });
  res.status(201).json({ room: viewRoom(room, req.user.id) });
});

/** POST /api/rooms/dm — start (or reuse) a DM with another user. */
const createDM = asyncHandler(async (req, res) => {
  const username = (req.body?.username || '').trim();
  if (!username) throw new ApiError(400, 'username is required');
  if (username === req.user.username) throw new ApiError(400, 'Cannot start a DM with yourself');

  const other = await User.findOne({ username });
  if (!other) throw new ApiError(404, 'User not found');

  const room = await roomService.getOrCreateDM(req.user.id, other._id.toString());
  res.status(201).json({ room: viewRoom(room, req.user.id) });
});

/** GET /api/rooms/:roomId/messages — paginated history (access-checked). */
const listRoomMessages = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.roomId);
  if (!room) throw new ApiError(404, 'Room not found');
  if (!roomService.canAccess(room, req.user.id)) throw new ApiError(403, 'Access denied');

  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const { messages, hasMore } = await getMessages({
    roomId: room._id,
    before: req.query.before,
    limit,
  });
  res.json({ messages: messages.map(serialize), hasMore });
});

module.exports = { listRooms, createRoom, createDM, listRoomMessages };
