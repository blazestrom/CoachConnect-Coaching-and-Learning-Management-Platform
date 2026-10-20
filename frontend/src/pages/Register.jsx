import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, AlertCircle, Sparkles } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    phone: '',
    bio: '',
    headline: '',
    expertise: '',
    hourly_rate: 60,
    education_level: '',
    learning_goals: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 580, margin: '2rem auto', width: '100%' }}>
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
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Join CoachConnect</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create your account as a student learner or expert coach
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
          {/* Role selector buttons */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Select Your Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'student' }))}
                className={`btn ${formData.role === 'student' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.75rem' }}
              >
                Student / Learner
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'coach' }))}
                className={`btn ${formData.role === 'coach' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.75rem' }}
              >
                Coach / Mentor
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                required
                name="first_name"
                className="form-input"
                placeholder="Alex"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                required
                name="last_name"
                className="form-input"
                placeholder="Rivera"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              name="email"
              className="form-input"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              name="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Conditional coach fields */}
          {formData.role === 'coach' ? (
            <>
              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  name="headline"
                  className="form-input"
                  placeholder="e.g. Senior Cloud Architect & Tech Mentor"
                  value={formData.headline}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Core Technical Expertise</label>
                <input
                  type="text"
                  name="expertise"
                  className="form-input"
                  placeholder="e.g. Distributed Systems, Kubernetes, Python"
                  value={formData.expertise}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hourly Coaching Rate ($ USD)</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  name="hourly_rate"
                  className="form-input"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Current Experience / Education</label>
                <input
                  type="text"
                  name="education_level"
                  className="form-input"
                  placeholder="e.g. Mid-Level Developer, Computer Science Student"
                  value={formData.education_level}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Learning Goal</label>
                <input
                  type="text"
                  name="learning_goals"
                  className="form-input"
                  placeholder="e.g. Master backend architecture & prepare for lead role"
                  value={formData.learning_goals}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register & Enter Platform'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
