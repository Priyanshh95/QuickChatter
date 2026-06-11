const express = require('express');
const requireAuth = require('../middleware/auth');
const { listMessages } = require('../controllers/messageController');

const router = express.Router();

router.get('/', requireAuth, listMessages);

module.exports = router;
