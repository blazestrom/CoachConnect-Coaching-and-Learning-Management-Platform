import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  Users,
  Award,
  Video,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, quickLogin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, coachRes] = await Promise.all([
          api.get('/courses/', { page_size: 3 }),
          api.get('/coaches/', { page_size: 3 }),
        ]);
        setCourses(cRes.results || cRes || []);
        setCoaches(coachRes.results || coachRes || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a8a 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '4.5rem 2.5rem',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ maxWidth: 760, position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Sparkles size={16} color="#38bdf8" />
            <span>Next-Generation Mentorship & Learning Management</span>
          </div>

          <h1 style={{
            fontSize: '2.8rem',
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem'
          }}>
            Accelerate your mastery with 1-on-1 coaching and structured courses.
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#cbd5e1',
            lineHeight: 1.6,
            marginBottom: '2rem',
            fontWeight: 400
          }}>
            CoachConnect bridges world-class mentors and motivated learners through conflict-free session booking, interactive curricula, and real-time progress tracking.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link to="/courses" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', backgroundColor: '#38bdf8', color: '#0f172a' }}>
              <BookOpen size={18} />
              Explore Courses
            </Link>
            <Link to="/coaches" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Users size={18} />
              Find a Mentor
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Demo Personas Banner */}
      <section className="card" style={{ padding: '1.75rem 2rem', background: '#ffffff', border: '1px solid var(--primary-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary)" />
              Try Out CoachConnect with 1-Click Demo Accounts
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Experience the full platform from any user's perspective without manual registration:
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(DEMO_USERS).map(([key, demo]) => (
            <button
              key={key}
              onClick={() => quickLogin(key)}
              className="btn btn-secondary"
              style={{
                justifyContent: 'flex-start',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                  {demo.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Click to login & explore
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Featured Learning Programs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Curated programs led by vetted industry mentors</p>
          </div>
          <Link to="/courses" className="btn btn-outline btn-sm">
            View All Courses <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cols-auto-fit">
          {courses.map((course) => (
            <div key={course.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <img
                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                alt={course.title}
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">{course.category}</span>
                <span className="badge badge-secondary">{course.level}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.5rem' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.description}
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coach</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{course.coach?.full_name || 'Expert Coach'}</div>
                </div>
                <Link to={`/courses/${course.id}`} className="btn btn-sm btn-primary">
                  View Program
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Coaches Directory Preview */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Connect with Verified Coaches</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Book 1-on-1 private video coaching sessions</p>
          </div>
          <Link to="/coaches" className="btn btn-outline btn-sm">
            View All Mentors <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cols-auto-fit">
          {coaches.map((coach) => (
            <div key={coach.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={coach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={coach.full_name}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{coach.full_name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {coach.coach_profile?.headline || 'Professional Mentor'}
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>
                    <RatingStars
                      rating={coach.coach_profile?.rating}
                      totalReviews={coach.coach_profile?.total_reviews}
                    />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                <strong>Expertise:</strong> {coach.coach_profile?.expertise || 'Technical Strategy'}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ${coach.coach_profile?.hourly_rate || 50}/hr
                </span>
                <Link to="/bookings" className="btn btn-sm btn-outline">
                  <Calendar size={14} /> Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Value Pillars */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Calendar size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Zero-Conflict Scheduling</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Coaches configure exact time slots. Atomic database transactions and slot locks ensure double bookings and scheduling overlaps are completely prevented.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Award size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Trackable Learning Curricula</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Structured courses with learning objectives, video lessons, and practical deliverables with automated completion % tracking.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Video size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Instant Video Rooms & Alerts</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Every session automatically generates a dedicated high-definition video meeting room, supported by real-time in-app notifications.
          </p>
        </div>
      </section>
    </div>
  );
}
