import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    avatar: '',
    coach_profile: {
      headline: '',
      expertise: '',
      hourly_rate: 50.0,
      qualifications: '',
    },
    student_profile: {
      education_level: '',
      learning_goals: '',
      interests: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        coach_profile: {
          headline: user.coach_profile?.headline || '',
          expertise: user.coach_profile?.expertise || '',
          hourly_rate: user.coach_profile?.hourly_rate || 50.0,
          qualifications: user.coach_profile?.qualifications || '',
        },
        student_profile: {
          education_level: user.student_profile?.education_level || '',
          learning_goals: user.student_profile?.learning_goals || '',
          interests: user.student_profile?.interests || '',
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <img
            src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=4f46e5&color=fff`}
            alt={user.email}
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-border)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.full_name || user.email}</h2>
              <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'coach' ? 'primary' : 'active'}`}>
                {user.role}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {user.email}
            </div>
          </div>
        </div>

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar Photo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Biography</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="A brief introduction..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          {/* Coach Specific Fields */}
          {user.role === 'coach' && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                Coach Mentorship Settings
              </h3>

              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.coach_profile.headline}
                  onChange={(e) => setFormData({
                    ...formData,
                    coach_profile: { ...formData.coach_profile, headline: e.target.value },
                  })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Specialization / Expertise</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.coach_profile.expertise}
                    onChange={(e) => setFormData({
                      ...formData,
                      coach_profile: { ...formData.coach_profile, expertise: e.target.value },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    className="form-input"
                    value={formData.coach_profile.hourly_rate}
                    onChange={(e) => setFormData({
                      ...formData,
                      coach_profile: { ...formData.coach_profile, hourly_rate: parseFloat(e.target.value) || 0 },
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Student Specific Fields */}
          {user.role === 'student' && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                Student Learning Goals
              </h3>

              <div className="form-group">
                <label className="form-label">Education / Experience Level</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.student_profile.education_level}
                  onChange={(e) => setFormData({
                    ...formData,
                    student_profile: { ...formData.student_profile, education_level: e.target.value },
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Learning Goals</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={formData.student_profile.learning_goals}
                  onChange={(e) => setFormData({
                    ...formData,
                    student_profile: { ...formData.student_profile, learning_goals: e.target.value },
                  })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
