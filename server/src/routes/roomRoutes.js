const express = require('express');
const requireAuth = require('../middleware/auth');
const {
  listRooms,
  createRoom,
  createDM,
  listRoomMessages,
} = require('../controllers/roomController');

const router = express.Router();

router.use(requireAuth);
router.get('/', listRooms);
router.post('/', createRoom);
router.post('/dm', createDM);
router.get('/:roomId/messages', listRoomMessages);

module.exports = router;
