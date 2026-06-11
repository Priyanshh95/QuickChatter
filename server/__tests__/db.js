const mongoose = require('mongoose');
const { __resetForTests } = require('../src/services/defaultRoom');

let mongod; // set only when using the in-memory server

// Use an external MongoDB (e.g. a CI service container) when MONGODB_URI_TEST
// is provided; otherwise spin up an isolated in-memory MongoDB for local runs.
async function connect() {
  const uri = process.env.MONGODB_URI_TEST;
  if (uri) {
    await mongoose.connect(uri);
    return;
  }
  const { MongoMemoryServer } = require('mongodb-memory-server');
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
