const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const registerSocketHandlers = require('./socket');

const server = http.createServer(app);
const io = new Server(server);
registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;

connectDB();

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
