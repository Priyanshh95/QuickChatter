const request = require('supertest');
const app = require('../src/app');
const db = require('./db');

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

const VALID = { email: 'alice@example.com', username: 'alice', password: 'secret1', confirmPassword: 'secret1' };

describe('auth API', () => {
  test('register -> login -> me happy path', async () => {
    const reg = await request(app).post('/api/auth/register').send(VALID);
    expect(reg.status).toBe(201);

    const login = await request(app).post('/api/auth/login').send({ identifier: 'alice', password: 'secret1' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('alice');
    expect(me.body.user.passwordHash).toBeUndefined(); // never leak the hash
  });

  test('login with a wrong password is rejected', async () => {
    await request(app).post('/api/auth/register').send(VALID);
    const res = await request(app).post('/api/auth/login').send({ identifier: 'alice', password: 'nope' });
    expect(res.status).toBe(401);
  });

  test('/me requires a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('duplicate registration is a conflict', async () => {
    await request(app).post('/api/auth/register').send(VALID);
    const res = await request(app).post('/api/auth/register').send(VALID);
    expect(res.status).toBe(409);
  });

  test('weak password is rejected', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...VALID, password: '123', confirmPassword: '123' });
    expect(res.status).toBe(400);
  });
});
