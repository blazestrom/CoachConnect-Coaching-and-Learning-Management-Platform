import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { GraduationCap, Sparkles, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (key) => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(key);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '2rem auto', width: '100%' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            color: '#fff',
            marginBottom: '1rem',
          }}>
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to access your coaching dashboard & sessions
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="name@coachconnect.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Or Quick Login As Demo Persona</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {Object.entries(DEMO_USERS).map(([key, demo]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDemoClick(key)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', textAlign: 'center' }}
                disabled={loading}
              >
                {demo.label.split(' ')[0]} {demo.label.split(' ')[1]}
              </button>
            ))}
          </div>

          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
