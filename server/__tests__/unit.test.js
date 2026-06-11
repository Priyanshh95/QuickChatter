const { signToken, verifyToken } = require('../src/utils/token');
const { formatTime, serialize } = require('../src/utils/messageView');
const { canAccess } = require('../src/services/roomService');

describe('token util', () => {
  test('sign then verify round-trips the payload', () => {
    const token = signToken({ id: '123', username: 'alice' });
    const decoded = verifyToken(token);
    expect(decoded.id).toBe('123');
    expect(decoded.username).toBe('alice');
  });

  test('verify rejects a tampered token', () => {
    expect(() => verifyToken('not.a.real.token')).toThrow();
  });
});

describe('messageView', () => {
  test('formatTime renders 12-hour am/pm', () => {
    expect(formatTime(new Date('2026-01-01T13:05:00'))).toBe('1:05 pm');
    expect(formatTime(new Date('2026-01-01T00:30:00'))).toBe('12:30 am');
  });

  test('serialize maps a populated message', () => {
    const out = serialize({
      _id: { toString: () => 'mid' },
      text: 'hi',
      createdAt: new Date('2026-01-01T09:00:00'),
      sender: { username: 'bob', avatar: '🐶' },
      editedAt: null,
    });
    expect(out).toMatchObject({ id: 'mid', message: 'hi', username: 'bob', avatar: '🐶' });
  });
});

describe('roomService.canAccess', () => {
  test('public channels are open to anyone', () => {
    expect(canAccess({ isDirect: false }, 'u1')).toBe(true);
  });

  test('direct rooms are restricted to their members', () => {
    const dm = { isDirect: true, members: [{ _id: { toString: () => 'u1' } }] };
    expect(canAccess(dm, 'u1')).toBe(true);
    expect(canAccess(dm, 'u2')).toBe(false);
  });
});
