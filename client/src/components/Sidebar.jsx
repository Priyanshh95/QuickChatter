export default function Sidebar({
  rooms,
  activeRoomId,
  onSelect,
  onCreateChannel,
  users,
  me,
  onStartDM,
  unread,
}) {
  const channels = rooms.filter((r) => !r.isDirect);
  const dms = rooms.filter((r) => r.isDirect);

  const Badge = ({ id }) =>
    unread[id] > 0 ? <span className="badge">{unread[id]}</span> : null;

  return (
    <aside className="sidebar">
      <div className="side-section">
        <div className="side-head">
          <span>Channels</span>
          <button className="mini" onClick={onCreateChannel} title="New channel">+</button>
        </div>
        {channels.map((r) => (
          <button
            key={r.id}
            className={`room-row ${r.id === activeRoomId ? 'active' : ''}`}
            onClick={() => onSelect(r.id)}
          >
            <span># {r.name}</span>
            <Badge id={r.id} />
          </button>
        ))}
      </div>

      <div className="side-section">
        <div className="side-head"><span>Direct messages</span></div>
        {dms.length === 0 && <div className="hint">Click a user below to start a DM</div>}
        {dms.map((r) => (
          <button
            key={r.id}
            className={`room-row ${r.id === activeRoomId ? 'active' : ''}`}
            onClick={() => onSelect(r.id)}
          >
            <span>{r.avatar} {r.name}</span>
            <Badge id={r.id} />
          </button>
        ))}
      </div>

      <div className="side-section">
        <div className="side-head"><span>Online — {users.length}</span></div>
        {users.map((u) => (
          <button
            key={u.username}
            className="room-row"
            onClick={() => onStartDM(u.username)}
            disabled={u.username === me}
            title={u.username === me ? 'This is you' : `Message ${u.username}`}
          >
            <span>{u.avatar} {u.username}{u.username === me ? ' (you)' : ''}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
