const request = require('supertest');
const app = require('../src/app');
const db = require('./db');

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

async function makeUser(username) {
  await request(app)
    .post('/api/auth/register')
    .send({ email: `${username}@example.com`, username, password: 'secret1', confirmPassword: 'secret1' });
  const login = await request(app).post('/api/auth/login').send({ identifier: username, password: 'secret1' });
  return login.body.token;
}
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

describe('rooms API', () => {
  test('lists the default room and creates a channel', async () => {
    const token = await makeUser('alice');
    // Touch the default-room endpoint so "General" is materialized.
    await request(app).get('/api/messages').set(bearer(token));

    const list = await request(app).get('/api/rooms').set(bearer(token));
    expect(list.status).toBe(200);
    expect(list.body.rooms.some((r) => r.name === 'General')).toBe(true);

    const created = await request(app).post('/api/rooms').set(bearer(token)).send({ name: 'team' });
    expect(created.status).toBe(201);

    const list2 = await request(app).get('/api/rooms').set(bearer(token));
    expect(list2.body.rooms.some((r) => r.id === created.body.room.id)).toBe(true);
  });

  test('DM access control: members can read, others get 403', async () => {
    const alice = await makeUser('alice');
    const bob = await makeUser('bob');
    const carol = await makeUser('carol');

    const dm = await request(app).post('/api/rooms/dm').set(bearer(alice)).send({ username: 'bob' });
    expect(dm.status).toBe(201);
    const dmId = dm.body.room.id;

    // Bob (a member) presented as "alice" on his side
    expect(dm.body.room.isDirect).toBe(true);

    const okBob = await request(app).get(`/api/rooms/${dmId}/messages`).set(bearer(bob));
    expect(okBob.status).toBe(200);

    const deniedCarol = await request(app).get(`/api/rooms/${dmId}/messages`).set(bearer(carol));
    expect(deniedCarol.status).toBe(403);
  });

  test('rooms endpoints require auth', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(401);
  });
});
