import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  BookOpen,
  Calendar,
  Users,
  Award,
  Video,
  Clock,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function Dashboard() {
  const { user, isCoach, isAdmin, isStudent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick slot creation modal for coach
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('10:00');
  const [slotEndTime, setSlotEndTime] = useState('11:00');
  const [slotSubmitting, setSlotSubmitting] = useState(false);
  const [slotError, setSlotError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats/');
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSlotSubmitting(true);
    setSlotError('');
    try {
      await api.post('/slots/', {
        date: slotDate,
        start_time: slotStartTime,
        end_time: slotEndTime,
      });
      setIsSlotModalOpen(false);
      fetchDashboardStats();
    } catch (err) {
      setSlotError(err.message || 'Failed to create slot.');
    } finally {
      setSlotSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-text)', backgroundColor: 'var(--danger-light)' }}>
        {error}
      </div>
    );
  }

  const role = data?.role || user?.role;
  const metrics = data?.metrics || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Welcome back, {user?.first_name || user?.email.split('@')[0]}!
            </h1>
            <span className={`badge badge-${role === 'admin' ? 'danger' : role === 'coach' ? 'primary' : 'active'}`}>
              {role} portal
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            {role === 'admin' && 'Platform-wide oversight, user management, and health metrics.'}
            {role === 'coach' && 'Manage your mentorship schedule, courses, and student bookings.'}
            {role === 'student' && 'Track course progression, upcoming 1-on-1 coaching, and learning goals.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isCoach && (
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="btn btn-primary"
            >
              <PlusCircle size={16} /> Add Availability Slot
            </button>
          )}
          {isStudent && (
            <Link to="/courses" className="btn btn-primary">
              <BookOpen size={16} /> Browse Courses
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/users" className="btn btn-primary">
              <Users size={16} /> Manage Users
            </Link>
          )}
        </div>
      </div>

      {/* Role-Specific Metrics Grid */}
      {role === 'admin' && (
        <div className="stats-grid">
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Users</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>
              {metrics.total_users || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              {metrics.total_coaches} Coaches • {metrics.total_students} Students
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Courses Hosted</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>
              {metrics.total_courses || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              {metrics.total_enrollments} student enrollments
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Coaching Sessions</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
              {metrics.total_bookings || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              {metrics.completed_bookings} completed sessions
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Open Slots Available</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--secondary)' }}>
              {metrics.active_slots || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Ready for booking
            </div>
          </div>
        </div>
      )}

      {role === 'coach' && (
        <div className="stats-grid">
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Active Courses</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>
              {metrics.total_courses || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Author & Instructor
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Enrolled Students</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--secondary)' }}>
              {metrics.total_students || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Across all courses
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Upcoming 1-on-1s</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
              {metrics.upcoming_sessions || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Confirmed appointments
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Open Slots Configured</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--warning-text)' }}>
              {metrics.available_slots || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Ready for student reservation
            </div>
          </div>
        </div>
      )}

      {role === 'student' && (
        <div className="stats-grid">
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Enrolled Programs</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>
              {metrics.total_enrolled || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              {metrics.completed_courses || 0} Completed
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>In-Progress Learning</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--secondary)' }}>
              {metrics.in_progress_courses || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Active curricula
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Upcoming Sessions</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
              {metrics.upcoming_sessions || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Scheduled 1-on-1 video calls
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Curriculum Hours</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--warning-text)' }}>
              {metrics.total_learning_hours || 0}h
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
              Curated material access
            </div>
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Upcoming Sessions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" />
              Upcoming Coaching Sessions
            </h2>
            <Link to="/bookings" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {(!data?.upcoming_bookings || data.upcoming_bookings.length === 0) ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No upcoming sessions scheduled.
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/coaches" className="btn btn-sm btn-primary">
                    Book a Mentorship Session
                  </Link>
                </div>
              </div>
            ) : (
              data.upcoming_bookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {booking.topic}
                    </div>
                    <span className="badge badge-confirmed">
                      {booking.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {role === 'coach' ? `Student: ${booking.student?.full_name || booking.student?.email}` : `Coach: ${booking.coach?.full_name || booking.coach?.email}`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{booking.slot?.date} at {booking.slot?.start_time?.slice(0, 5)}</span>
                    </div>

                    <a
                      href={booking.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-primary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Video size={13} /> Join Call
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Courses Progress / Coach Courses / Admin Activity */}
        {role === 'student' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--primary)" />
                My Enrolled Courses & Progress
              </h2>
              <Link to="/courses" className="btn btn-sm btn-outline">
                Browse
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {(!data?.recent_enrollments || data.recent_enrollments.length === 0) ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  You are not currently enrolled in any courses.
                  <div style={{ marginTop: '0.75rem' }}>
                    <Link to="/courses" className="btn btn-sm btn-primary">
                      Explore Course Catalog
                    </Link>
                  </div>
                </div>
              ) : (
                data.recent_enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="badge badge-primary">{enr.course?.category}</span>
                      <span className={`badge badge-${enr.status === 'completed' ? 'completed' : 'active'}`}>
                        {enr.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.3rem 0' }}>
                      {enr.course?.title}
                    </h4>

                    {/* Progress Bar */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        <span>Progress</span>
                        <span>{enr.progress_percentage}%</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-fill" style={{ width: `${enr.progress_percentage}%` }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <Link
                        to={`/courses/${enr.course?.id}`}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {enr.progress_percentage === 100 ? 'Review Lessons' : 'Continue Learning'} <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {role === 'coach' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--primary)" />
                My Authored Courses
              </h2>
              <Link to="/courses" className="btn btn-sm btn-outline">
                All Courses
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {(!data?.my_courses || data.my_courses.length === 0) ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  You haven't published any courses yet.
                  <div style={{ marginTop: '0.75rem' }}>
                    <Link to="/courses" className="btn btn-sm btn-primary">
                      Create a Course
                    </Link>
                  </div>
                </div>
              ) : (
                data.my_courses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{course.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {course.total_enrollments} students enrolled • {course.total_resources} lessons
                      </div>
                    </div>
                    <Link to={`/courses/${course.id}`} className="btn btn-sm btn-outline">
                      Manage
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--primary)" />
                Recently Registered Users
              </h2>
              <Link to="/admin/users" className="btn btn-sm btn-outline">
                Full User Directory
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {(data?.recent_users || []).map((u) => (
                <div
                  key={u.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.full_name || u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span className={`badge badge-${u.role === 'coach' ? 'primary' : u.role === 'admin' ? 'danger' : 'active'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal for Coach Availability Slot Creation */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Add Reservable Coaching Slot"
      >
        {slotError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            {slotError}
          </div>
        )}
        <form onSubmit={handleCreateSlot}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              required
              className="form-input"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                required
                className="form-input"
                value={slotStartTime}
                onChange={(e) => setSlotStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                required
                className="form-input"
                value={slotEndTime}
                onChange={(e) => setSlotEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsSlotModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={slotSubmitting}
            >
              {slotSubmitting ? 'Creating Slot...' : 'Create Availability Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
