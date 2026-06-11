const Room = require('../models/Room');

// QuickChatter currently has a single public lobby. This finds-or-creates it
// (upsert avoids a race on first boot) and caches the document. Multi-room and
// direct messages are added in the next commit.
let cached = null;

async function getDefaultRoom() {
  if (cached) return cached;
  cached = await Room.findOneAndUpdate(
    { name: 'General', isDirect: false },
    { $setOnInsert: { name: 'General', description: 'Public lobby', isDirect: false } },
    { upsert: true, new: true }
  );
  return cached;
}

// Test helper: clear the cached room so the suite can reset between cases.
function __resetForTests() {
  cached = null;
}

module.exports = { getDefaultRoom, __resetForTests };
