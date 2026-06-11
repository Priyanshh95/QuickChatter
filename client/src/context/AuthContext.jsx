import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, clearToken, getToken } from '../api/http';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: if a token is stored, fetch the current user.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier, password) {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { identifier, password },
      auth: false,
    });
    setToken(data.token);
    setUser({ username: data.username, avatar: data.avatar });
    return data;
  }

  function register(payload) {
    return api('/auth/register', { method: 'POST', body: payload, auth: false });
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
