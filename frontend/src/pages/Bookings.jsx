import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  Video,
  XCircle,
  CheckCircle,
  PlusCircle,
  Trash2,
  AlertCircle,
  User,
  ExternalLink,
} from 'lucide-react';

export default function Bookings() {
  const { user, isCoach, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'slots'
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Cancel modal
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Add slot modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('14:00');
  const [slotEndTime, setSlotEndTime] = useState('15:00');
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await api.get('/bookings/', params);
      setBookings(res.results || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!isCoach) return;
    try {
      const res = await api.get('/slots/', { coach: user?.id });
      setSlots(res.results || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchBookings();
    } else {
      fetchSlots();
    }
  }, [activeTab, statusFilter, user]);

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    setCancelLoading(true);
    try {
      await api.post(`/bookings/${cancelBookingId}/cancel/`, { reason: cancelReason });
      setCancelBookingId(null);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel session');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/status/`, { status: 'completed' });
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSlotLoading(true);
    setSlotError('');
    try {
      await api.post('/slots/', {
        date: slotDate,
        start_time: slotStartTime,
        end_time: slotEndTime,
      });
      setIsSlotModalOpen(false);
      fetchSlots();
    } catch (err) {
      setSlotError(err.message || 'Failed to create slot');
    } finally {
      setSlotLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await api.delete(`/slots/${slotId}/`);
      fetchSlots();
    } catch (err) {
      alert(err.message || 'Cannot delete slot');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title & Tabs */}
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Coaching Sessions & Scheduling</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Manage upcoming video appointments, review notes, and configure calendar slots
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isCoach && (
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`btn btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`btn btn-sm ${activeTab === 'slots' ? 'btn-primary' : 'btn-secondary'}`}
              >
                My Availability Slots
              </button>
            </div>
          )}

          {activeTab === 'slots' && (
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} /> Add Slot
            </button>
          )}
        </div>
      </div>

      {/* Sessions View */}
      {activeTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {st} Sessions
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading sessions...
            </div>
          ) : bookings.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Calendar size={36} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>No sessions found</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {isCoach ? 'Students will appear here once they book your available slots.' : 'Explore coaches to schedule a 1-on-1 mentorship session.'}
              </p>
              {!isCoach && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/coaches" className="btn btn-primary btn-sm">
                    Find a Mentor
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((booking) => {
                const partner = isCoach ? booking.student : booking.coach;
                const isConfirmed = booking.status === 'confirmed';

                return (
                  <div
                    key={booking.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderLeft: `4px solid ${
                        booking.status === 'confirmed'
                          ? 'var(--success)'
                          : booking.status === 'completed'
                          ? 'var(--primary)'
                          : 'var(--danger)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={partner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={partner?.full_name}
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {isCoach ? 'Student' : 'Coach / Mentor'}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {partner?.full_name || partner?.email}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className={`badge badge-${booking.status}`}>
                          {booking.status}
                        </span>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={14} />
                          <span>{booking.slot?.date} [{booking.slot?.start_time?.slice(0, 5)} - {booking.slot?.end_time?.slice(0, 5)}]</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        Topic: {booking.topic}
                      </div>
                      {booking.notes && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}
                      {booking.status === 'cancelled' && booking.cancellation_reason && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--danger-text)', marginTop: '0.4rem', backgroundColor: 'var(--danger-light)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                          <strong>Cancellation Reason:</strong> {booking.cancellation_reason}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        Booking ID #{booking.id}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isConfirmed && (
                          <>
                            <a
                              href={booking.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-primary btn-sm"
                            >
                              <Video size={14} /> Join Video Room
                            </a>

                            {isCoach && (
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="btn btn-secondary btn-sm"
                                title="Mark session completed"
                              >
                                <CheckCircle size={14} color="var(--success)" /> Mark Completed
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setCancelBookingId(booking.id);
                                setCancelReason('');
                              }}
                              className="btn btn-danger btn-sm"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Slots Manager View (Coaches Only) */}
      {activeTab === 'slots' && isCoach && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Your Configured Availability Calendar
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {slots.length} total slots
            </span>
          </div>

          {slots.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No availability slots set up yet. Add slots so students can schedule sessions!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    border: slot.is_booked ? '1px solid var(--border-subtle)' : '1px solid var(--primary-border)',
                    backgroundColor: slot.is_booked ? 'var(--bg-main)' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{slot.date}</span>
                    <span className={`badge badge-${slot.is_booked ? 'confirmed' : 'pending'}`}>
                      {slot.is_booked ? 'Booked' : 'Available'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} />
                    <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                  </div>

                  {!slot.is_booked && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="btn btn-sm btn-danger"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Session Modal */}
      <Modal
        isOpen={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        title="Cancel Coaching Appointment"
      >
        <form onSubmit={handleCancelBooking}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--warning-light)',
            color: 'var(--warning-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle size={18} />
            <span>Cancelling will automatically release the slot for other learners and send a notification.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Cancellation</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="e.g. Unforeseen schedule conflict, rescheduling required..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button
              type="button"
              onClick={() => setCancelBookingId(null)}
              className="btn btn-secondary"
            >
              Keep Session
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Create Availability Time Slot"
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
              disabled={slotLoading}
            >
              {slotLoading ? 'Creating...' : 'Save Availability Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
