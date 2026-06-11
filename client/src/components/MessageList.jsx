import { useEffect, useRef } from 'react';

export default function MessageList({ messages, me, socket }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function edit(m) {
    const next = window.prompt('Edit message:', m.message);
    if (next && next.trim() && next.trim() !== m.message) {
      socket.emit('edit message', { id: m.id, newText: next.trim() });
    }
  }

  function remove(m) {
    if (window.confirm('Delete this message?')) {
      socket.emit('delete message', m.id);
    }
  }

  return (
    <div className="messages">
      {messages.map((m) => (
        <div key={m.id} className={`message ${m.username === me ? 'mine' : ''}`}>
          <div className="meta">
            <span>{m.avatar} {m.username}</span>
            <span className="time">
              {m.timestamp}
              {m.editedAt ? ' (edited)' : ''}
            </span>
          </div>
          <div className="text">{m.message}</div>
          {m.username === me && (
            <div className="msg-actions">
              <button onClick={() => edit(m)}>edit</button>
              <button onClick={() => remove(m)}>delete</button>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
