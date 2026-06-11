import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      await login(form.username, form.password); // auto-login after signup
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="brand">QuickChatter</h1>
        <h2>Create your account</h2>
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} autoFocus />
        <input placeholder="Username" value={form.username} onChange={set('username')} />
        <input type="password" placeholder="Password" value={form.password} onChange={set('password')} />
        <input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={set('confirmPassword')} />
        {error && <div className="auth-error">{error}</div>}
        <button disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
