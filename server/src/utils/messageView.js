// Formats a Date as a 12-hour "h:mm am/pm" string for display.
function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// Maps a (sender-populated) Message document to the shape the client expects.
function serialize(msg) {
  return {
    id: msg._id.toString(),
    username: msg.sender?.username || 'unknown',
    avatar: msg.sender?.avatar || '👤',
    message: msg.text,
    timestamp: formatTime(msg.createdAt),
    editedAt: msg.editedAt || null,
    createdAt: msg.createdAt, // ISO cursor for pagination
  };
}

module.exports = { formatTime, serialize };
