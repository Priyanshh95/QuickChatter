const Room = require('../models/Room');

/** All public channels + the direct-message rooms this user belongs to. */
function listRoomsForUser(userId) {
  return Room.find({
    $or: [{ isDirect: false }, { isDirect: true, members: userId }],
  })
    .populate('members', 'username avatar')
    .sort({ isDirect: 1, name: 1 });
}

/** Create a public channel (unique name enforced by a partial index). */
function createChannel({ name, description, userId }) {
  return Room.create({
    name,
    description: description || '',
    isDirect: false,
    createdBy: userId,
    members: [userId],
  });
}

/** Find or create the 1:1 direct room shared by exactly these two users. */
async function getOrCreateDM(userId, otherUserId) {
  let room = await Room.findOne({
    isDirect: true,
    members: { $all: [userId, otherUserId], $size: 2 },
  });
  if (!room) {
    room = await Room.create({ name: 'dm', isDirect: true, members: [userId, otherUserId] });
  }
  return room.populate('members', 'username avatar');
}

function getRoomById(roomId) {
  return Room.findById(roomId).populate('members', 'username avatar');
}

/** Public channels are open; direct rooms are restricted to their members. */
function canAccess(room, userId) {
  if (!room) return false;
  if (!room.isDirect) return true;
  return room.members.some((m) => (m._id ? m._id.toString() : m.toString()) === userId.toString());
}

module.exports = { listRoomsForUser, createChannel, getOrCreateDM, getRoomById, canAccess };
