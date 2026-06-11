const asyncHandler = require('../utils/asyncHandler');
const { getDefaultRoom } = require('../services/defaultRoom');
const { getMessages } = require('../services/messageService');
const { serialize } = require('../utils/messageView');

/**
 * GET /api/messages?before=<ISO date>&limit=<n>
 * Paginated history for the default room (newest page first via the `before`
 * cursor). Used by the client to lazy-load older messages.
 */
const listMessages = asyncHandler(async (req, res) => {
  const room = await getDefaultRoom();
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const { messages, hasMore } = await getMessages({
    roomId: room._id,
    before: req.query.before,
    limit,
  });
  res.json({ messages: messages.map(serialize), hasMore });
});

module.exports = { listMessages };
