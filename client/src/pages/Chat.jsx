import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/http';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import Composer from '../components/Composer';

export default function Chat() {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocketContext();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const [unread, setUnread] = useState({});

  // Keep the active room available inside socket callbacks without re-binding.
  const activeRef = useRef(null);
  useEffect(() => { activeRef.current = activeRoomId; }, [activeRoomId]);

  async function loadRooms() {
    const data = await api('/rooms');
    setRooms(data.rooms);
    return data.rooms;
  }

  useEffect(() => {
    loadRooms()
      .then((rs) => {
        const general = rs.find((r) => !r.isDirect && r.name === 'General') || rs[0];
        if (general) setActiveRoomId(general.id);
      })
      .catch(() => {});
  }, []);

  // Socket event wiring
  useEffect(() => {
    if (!socket) return;

    const onRoomHistory = ({ roomId, messages: msgs }) => {
      if (roomId === activeRef.current) setMessages(msgs);
    };
    const onMessage = (m) => {
      if (m.roomId === activeRef.current) setMessages((prev) => [...prev, m]);
      else setUnread((u) => ({ ...u, [m.roomId]: (u[m.roomId] || 0) + 1 }));
    };
    const onEdit = ({ id, newText }) =>
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, message: newText, editedAt: true } : m)));
    const onDelete = (id) => setMessages((prev) => prev.filter((m) => m.id !== id));
    const onUsers = (list) => setUsers(list);
    const onTyping = ({ username, roomId }) => {
      if (roomId === activeRef.current && username !== user.username)
        setTyping((t) => (t.includes(username) ? t : [...t, username]));
    };
    const onStopTyping = ({ username, roomId }) => {
      if (roomId === activeRef.current) setTyping((t) => t.filter((n) => n !== username));
    };
    const onErr = () => { logout(); navigate('/login'); };

    socket.on('room history', onRoomHistory);
    socket.on('chat message', onMessage);
    socket.on('edit message', onEdit);
    socket.on('delete message', onDelete);
    socket.on('user list', onUsers);
    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);
    socket.on('connect_error', onErr);

    return () => {
      socket.off('room history', onRoomHistory);
      socket.off('chat message', onMessage);
      socket.off('edit message', onEdit);
      socket.off('delete message', onDelete);
      socket.off('user list', onUsers);
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
      socket.off('connect_error', onErr);
    };
  }, [socket, user.username, logout, navigate]);

  // Join the active room (server replies with its history)
  useEffect(() => {
    if (!socket || !activeRoomId) return;
    setMessages([]);
    setTyping([]);
    setUnread((u) => ({ ...u, [activeRoomId]: 0 }));
    socket.emit('join room', activeRoomId);
  }, [socket, activeRoomId]);

  async function createChannel() {
    const name = window.prompt('New channel name:');
    if (!name || !name.trim()) return;
    try {
      const { room } = await api('/rooms', { method: 'POST', body: { name: name.trim() } });
      await loadRooms();
      setActiveRoomId(room.id);
    } catch (e) {
      alert(e.message);
    }
  }

  async function startDM(username) {
    if (username === user.username) return;
    try {
      const { room } = await api('/rooms/dm', { method: 'POST', body: { username } });
      await loadRooms();
      setActiveRoomId(room.id);
    } catch (e) {
      alert(e.message);
    }
  }

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const title = activeRoom ? (activeRoom.isDirect ? `@ ${activeRoom.name}` : `# ${activeRoom.name}`) : '';

  return (
    <div className="chat">
      <header className="chat-header">
        <span className="brand">QuickChatter</span>
        <span className={`status ${connected ? 'on' : 'off'}`}>{connected ? 'online' : 'connecting…'}</span>
        <span className="room-title">{title}</span>
        <button className="icon-btn" onClick={toggle} title="Toggle theme">{dark ? '☀️' : '🌙'}</button>
        <span className="me">{user?.avatar} {user?.username}</span>
        <button className="link-btn" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
      </header>

      <div className="chat-body">
        <Sidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelect={setActiveRoomId}
          onCreateChannel={createChannel}
          users={users}
          me={user.username}
          onStartDM={startDM}
          unread={unread}
        />
        <main className="main">
          <MessageList messages={messages} me={user.username} socket={socket} />
          <div className="typing-row">
            {typing.length > 0 && `${typing.join(', ')} ${typing.length === 1 ? 'is' : 'are'} typing…`}
          </div>
          <Composer socket={socket} roomId={activeRoomId} disabled={!connected} />
        </main>
      </div>
    </div>
  );
}
