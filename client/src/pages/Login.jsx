import { Link } from 'react-router-dom';

// Placeholder — the real login form is built in the next commit.
export default function Login() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Log in</h1>
      <p>The login form is coming in the next commit.</p>
      <p>
        <Link to="/register">Create an account</Link> · <Link to="/">Chat</Link>
      </p>
    </div>
  );
}
