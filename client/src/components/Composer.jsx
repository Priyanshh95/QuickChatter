import { useRef, useState } from 'react';

const EMOJIS = ['😀', '😂', '😍', '😎', '👍', '🙏', '🎉', '😢', '🔥', '❤️', '🥳', '🤔', '😅', '🙌', '😜', '😭', '👀', '💯', '✅', '🚀'];

export default function Composer({ socket, roomId, disabled }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimer = useRef(null);

  function onChange(e) {
    setText(e.target.value);
    if (!socket || !roomId) return;
    socket.emit('typing', roomId);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('stop typing', roomId), 1200);
  }

  function submit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !socket || !roomId) return;
    socket.emit('chat message', { roomId, message: t });
    setText('');
    setShowEmoji(false);
    clearTimeout(typingTimer.current);
    socket.emit('stop typing', roomId);
  }

  return (
    <form className="composer" onSubmit={submit}>
      {showEmoji && (
        <div className="emoji-panel">
          {EMOJIS.map((em) => (
            <button type="button" key={em} onClick={() => setText((t) => t + em)}>{em}</button>
          ))}
        </div>
      )}
      <button type="button" className="icon-btn" onClick={() => setShowEmoji((s) => !s)} disabled={disabled} title="Emoji">
        😊
      </button>
      <input placeholder="Type a message…" value={text} onChange={onChange} disabled={disabled} />
      <button disabled={disabled || !text.trim()}>Send</button>
    </form>
  );
}
