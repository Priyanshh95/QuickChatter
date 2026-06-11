import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/http';

// Scaffold page: confirms the toolchain runs and the dev proxy reaches the
// backend. The real chat UI replaces this in the following commits.
export default function Chat() {
  const [health, setHealth] = useState('checking…');

  useEffect(() => {
    api('/health', { auth: false })
      .then((d) => setHealth(d.status || 'unknown'))
      .catch(() => setHealth('unreachable'));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>QuickChatter</h1>
      <p>React client scaffold is running. 🎉</p>
      <p>
        Backend <code>/api/health</code>: <strong>{health}</strong>
      </p>
      <p>
        <Link to="/login">Log in</Link> · <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
