import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import {
  Search,
  Users,
  Award,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export default function Coaches() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Booking modal states
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coaches/', { search: search || undefined });
      setCoaches(res.results || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCoaches();
  };

  const openBookingModal = async (coach) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedCoach(coach);
    setSelectedSlotId(null);
    setBookingTopic('');
    setBookingNotes('');
    setBookingError('');
    setBookingSuccess('');
    setSlotsLoading(true);

    try {
      const res = await api.get('/slots/', {
        coach: coach.id,
        available_only: 'true',
        upcoming: 'true',
      });
      setSlots(res.results || res || []);
    } catch (err) {
      setBookingError('Failed to load coach availability slots.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setBookingError('Please choose an available time slot.');
      return;
    }
    setBookingSubmitting(true);
    setBookingError('');
    try {
      await api.post('/bookings/', {
        slot_id: selectedSlotId,
        topic: bookingTopic,
        notes: bookingNotes,
      });
      setBookingSuccess('Session confirmed! Check your Sessions dashboard for the meeting room link.');
      setTimeout(() => {
        setSelectedCoach(null);
        navigate('/bookings');
      }, 1500);
    } catch (err) {
      setBookingError(err.message || 'Booking failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Expert Coaches & Mentors</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Book 1-on-1 private video coaching sessions with senior engineers and architects
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: 340 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Filter by name or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </div>

      {/* Coaches Grid */}
      {loading ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading mentors directory...
        </div>
      ) : coaches.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={36} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No coaches match your search</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Try clearing keywords or searching another technical topic.</p>
        </div>
      ) : (
        <div className="grid-cols-auto-fit">
          {coaches.map((coach) => (
            <div key={coach.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <img
                  src={coach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={coach.full_name}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-border)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{coach.full_name}</h3>
                    {coach.coach_profile?.is_verified && (
                      <CheckCircle2 size={16} color="var(--primary)" fill="var(--primary-light)" />
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.35, marginTop: '0.2rem' }}>
                    {coach.coach_profile?.headline || 'Certified Technical Mentor'}
                  </div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <RatingStars
                      rating={coach.coach_profile?.rating}
                      totalReviews={coach.coach_profile?.total_reviews}
                    />
                  </div>
                </div>
              </div>

              {coach.bio && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                  {coach.bio}
                </p>
              )}

              <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  Core Competencies
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {coach.coach_profile?.expertise || 'Cloud, Full-Stack, System Architecture'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session Rate</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${coach.coach_profile?.hourly_rate || 50}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/hr</span>
                  </div>
                </div>

                <button
                  onClick={() => openBookingModal(coach)}
                  className="btn btn-primary"
                >
                  <Calendar size={16} /> Book 1-on-1
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Dialog Modal */}
      <Modal
        isOpen={!!selectedCoach}
        onClose={() => setSelectedCoach(null)}
        title={selectedCoach ? `Book Session with ${selectedCoach.full_name}` : 'Book Session'}
        maxWidth={580}
      >
        {bookingSuccess ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Booking Confirmed!</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {bookingSuccess}
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking}>
            {bookingError && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}>
                {bookingError}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Select An Open Availability Slot</label>
              {slotsLoading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Loading available dates...
                </div>
              ) : slots.length === 0 ? (
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No open slots currently configured by this coach. Please check back soon or send a message.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', maxHeight: 200, overflowY: 'auto' }}>
                  {slots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                        style={{
                          flexDirection: 'column',
                          padding: '0.5rem',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-strong)',
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{slot.date}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Session Topic / Problem Statement</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Architecture review for event-driven payments pipeline"
                value={bookingTopic}
                onChange={(e) => setBookingTopic(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes or Questions for Coach</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Share any background details, GitHub repos, or specific questions..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedCoach(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={bookingSubmitting || slots.length === 0}
              >
                {bookingSubmitting ? 'Confirming Reservation...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
