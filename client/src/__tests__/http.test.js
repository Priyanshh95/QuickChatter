import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, setToken, getToken, clearToken } from '../api/http';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('token storage', () => {
  it('sets, reads, and clears the token', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe('api()', () => {
  it('attaches the bearer token and returns parsed JSON', async () => {
    setToken('tok');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hello: 'world' }),
    });

    const data = await api('/thing');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/thing',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      })
    );
    expect(data).toEqual({ hello: 'world' });
  });

  it('throws with the server error message on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'bad input' }),
    });

    await expect(api('/thing', { auth: false })).rejects.toThrow('bad input');
  });
});
