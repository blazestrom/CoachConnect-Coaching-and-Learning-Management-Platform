import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import RatingStars from '../components/RatingStars';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Video,
  FileText,
  ExternalLink,
  PlusCircle,
  Award,
  Calendar,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCoach, isAdmin } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Lesson creation modal for coach
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    resource_type: 'video',
    url: '',
    duration_minutes: 20,
    description: '',
    order: 1,
  });
  const [resourceSubmitting, setResourceSubmitting] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/${id}/`);
      setCourse(res);
    } catch (err) {
      setError(err.message || 'Course not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll/`);
      await fetchCourse();
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleResource = async (resourceId) => {
    try {
      const res = await api.post(`/courses/resources/${resourceId}/toggle-complete/`);
      // Update local state
      setCourse((prev) => {
        if (!prev) return prev;
        const updatedResources = prev.resources.map((r) =>
          r.id === resourceId ? { ...r, is_completed: res.is_completed } : r
        );
        return {
          ...prev,
          resources: updatedResources,
          user_progress: {
            ...prev.user_progress,
            progress_percentage: res.progress_percentage,
            status: res.status,
          },
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setResourceSubmitting(true);
    try {
      await api.post(`/courses/${id}/resources/`, resourceForm);
      setIsResourceModalOpen(false);
      setResourceForm({
        title: '',
        resource_type: 'video',
        url: '',
        duration_minutes: 20,
        description: '',
        order: (course?.resources?.length || 0) + 1,
      });
      fetchCourse();
    } catch (err) {
      alert(err.message || 'Failed to add lesson');
    } finally {
      setResourceSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading course syllabus...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--danger-text)' }}>{error || 'Course not found'}</h3>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  const isOwner = user && (course.coach?.id === user.id || isAdmin);
  const objectives = (course.learning_objectives || '')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <Link to="/courses" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> All Courses
        </Link>
      </div>

      {/* Main Course Header Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Details & Objectives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-primary">{course.category}</span>
              <span className="badge badge-secondary">{course.level}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> {course.duration_hours} hours total
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, color: 'var(--text-main)' }}>
              {course.title}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '1rem' }}>
              {course.description}
            </p>
          </div>

          {/* Learning Objectives Box */}
          <div className="card" style={{ backgroundColor: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--primary)" />
              What You Will Master
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {objectives.map((obj, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Enrollment Card & Coach Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <img
              src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
              alt={course.title}
              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}
            />

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                ${course.price > 0 ? course.price : 'Free'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Full lifetime access
              </span>
            </div>

            {/* Enrollment status / CTA */}
            {course.is_enrolled ? (
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Your Progress</span>
                  <span className={`badge badge-${course.user_progress?.status === 'completed' ? 'completed' : 'active'}`}>
                    {course.user_progress?.status} ({course.user_progress?.progress_percentage || 0}%)
                  </span>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.user_progress?.progress_percentage || 0}%` }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Check off lessons in the curriculum below to advance.
                </p>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1rem' }}
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            )}

            {/* Coach Preview Card */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Course Instructor
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={course.coach?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={course.coach?.full_name}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {course.coach?.full_name || 'Expert Coach'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {course.coach?.coach_profile?.headline || 'Tech Mentor'}
                  </div>
                  <div style={{ marginTop: '0.2rem' }}>
                    <RatingStars
                      rating={course.coach?.coach_profile?.rating}
                      totalReviews={course.coach?.coach_profile?.total_reviews}
                      size={13}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <Link to="/bookings" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                  <Calendar size={14} /> Book 1-on-1 Session with {course.coach?.first_name || 'Coach'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum & Lesson Materials Section */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--primary)" />
              Curriculum & Learning Resources
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {course.resources?.length || 0} modules • Hands-on practical assignments and lectures
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => setIsResourceModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} /> Add Lesson Module
            </button>
          )}
        </div>

        {(!course.resources || course.resources.length === 0) ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No lessons uploaded for this curriculum yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {course.resources.map((res, index) => (
              <div
                key={res.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: res.is_completed ? 'var(--success-light)' : 'var(--bg-main)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {course.is_enrolled ? (
                    <button
                      onClick={() => handleToggleResource(res.id)}
                      style={{ color: res.is_completed ? 'var(--success)' : 'var(--text-light)', display: 'flex', alignItems: 'center' }}
                      title={res.is_completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {res.is_completed ? (
                        <CheckCircle2 size={22} fill="var(--success)" color="#fff" />
                      ) : (
                        <Circle size={22} />
                      )}
                    </button>
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {index + 1}
                    </div>
                  )}

                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textDecoration: res.is_completed ? 'line-through' : 'none',
                      color: res.is_completed ? 'var(--text-muted)' : 'var(--text-main)',
                    }}>
                      {res.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                        {res.resource_type}
                      </span>
                      <span><Clock size={12} /> {res.duration_minutes} mins</span>
                    </div>
                  </div>
                </div>

                {res.url && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', gap: '0.3rem' }}
                  >
                    Open Resource <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Module Modal */}
      <Modal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        title="Add Curriculum Module"
      >
        <form onSubmit={handleAddResource}>
          <div className="form-group">
            <label className="form-label">Lesson Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Distributed Consensus & Raft Algorithm"
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Resource Format</label>
              <select
                className="form-select"
                value={resourceForm.resource_type}
                onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
              >
                <option value="video">Video Lesson</option>
                <option value="document">Reading Document</option>
                <option value="assignment">Assignment / Project</option>
                <option value="link">Reference Link</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                required
                className="form-input"
                value={resourceForm.duration_minutes}
                onChange={(e) => setResourceForm({ ...resourceForm, duration_minutes: parseInt(e.target.value) || 15 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Resource URL / Video Link</label>
            <input
              type="url"
              required
              className="form-input"
              placeholder="https://youtube.com/... or https://github.com/..."
              value={resourceForm.url}
              onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Instructions (Optional)</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Key notes, homework deliverables, or repository links..."
              value={resourceForm.description}
              onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsResourceModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={resourceSubmitting}
            >
              {resourceSubmitting ? 'Adding Lesson...' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
