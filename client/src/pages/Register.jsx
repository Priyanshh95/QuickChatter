import { Link } from 'react-router-dom';

// Placeholder — the real registration form is built in the next commit.
export default function Register() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Create your account</h1>
      <p>The registration form is coming in the next commit.</p>
      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}
