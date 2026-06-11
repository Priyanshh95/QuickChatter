import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

export default function Chat() {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('message history', (history) => setMessages(history));
    socket.on('chat message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('edit message', ({ id, newText }) =>
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, message: newText } : m)))
    );
    socket.on('delete message', (id) =>
      setMessages((prev) => prev.filter((m) => m.id !== id))
    );
    socket.on('user list', (list) => setUsers(list));
    socket.on('connect_error', () => {
      // Token invalid/expired — drop the session and return to login.
      logout();
      navigate('/login');
    });

    return () => {
      socket.off('message history');
      socket.off('chat message');
      socket.off('edit message');
      socket.off('delete message');
      socket.off('user list');
      socket.off('connect_error');
    };
  }, [socket, logout, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !socket) return;
    socket.emit('chat message', { message: t });
    setText('');
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <span className="brand">QuickChatter</span>
        <span className={`status ${connected ? 'on' : 'off'}`}>
          {connected ? 'connected' : 'connecting…'}
        </span>
        <span className="me">
          {user?.avatar} {user?.username}
        </span>
        <button className="link-btn" onClick={() => { logout(); navigate('/login'); }}>
          Log out
        </button>
      </header>

      <div className="chat-body">
        <aside className="sidebar">
          <h4>Online — {users.length}</h4>
          {users.map((u) => (
            <div key={u.username} className="user-row">
              <span>{u.avatar}</span> {u.username}
            </div>
          ))}
        </aside>

        <main className="main">
          <div className="messages">
            {messages.map((m) => (
              <div key={m.id} className={`message ${m.username === user?.username ? 'mine' : ''}`}>
                <div className="meta">
                  <span>{m.avatar} {m.username}</span>
                  <span className="time">{m.timestamp}</span>
                </div>
                <div className="text">{m.message}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form className="composer" onSubmit={send}>
            <input
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button disabled={!connected}>Send</button>
          </form>
        </main>
      </div>
    </div>
  );
}
