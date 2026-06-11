const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { __resetForTests } = require('../src/services/defaultRoom');

let mongod;

// Spin up an isolated in-memory MongoDB for the test run.
async function connect() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

async function clear() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  __resetForTests(); // the cached "General" room was just deleted
}

async function disconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

module.exports = { connect, clear, disconnect };
