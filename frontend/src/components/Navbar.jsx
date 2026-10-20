import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
  Bell,
  CheckCheck,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isCoach, isAdmin, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDemoSwitch = async (key) => {
    setShowDemoMenu(false);
    await quickLogin(key);
    navigate('/dashboard');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Coach<span style={{ color: 'var(--primary)' }}>Connect</span>
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`btn btn-sm ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/courses"
            className={`btn btn-sm ${isActive('/courses') ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BookOpen size={16} />
            Courses
          </Link>

          <Link
            to="/coaches"
            className={`btn btn-sm ${isActive('/coaches') ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={16} />
            Coaches
          </Link>

          {isAuthenticated && (
            <Link
              to="/bookings"
              className={`btn btn-sm ${isActive('/bookings') ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Calendar size={16} />
              {isCoach ? 'Sessions & Slots' : 'My Sessions'}
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/users"
              className={`btn btn-sm ${isActive('/admin/users') ? 'btn-primary' : 'btn-secondary'}`}
            >
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
        </nav>

        {/* Right side controls: Demo Switcher, Notifications, Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          
          {/* Quick Demo Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowDemoMenu(!showDemoMenu);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="btn btn-sm btn-outline"
              style={{
                borderColor: 'var(--primary-border)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
              title="Switch demo persona instantly"
            >
              <Sparkles size={15} />
              <span>Demo Roles</span>
              <ChevronDown size={14} />
            </button>

            {showDemoMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  width: 260,
                  padding: '0.5rem',
                  zIndex: 110,
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  1-Click Role Switcher
                </div>
                {Object.entries(DEMO_USERS).map(([key, demo]) => (
                  <button
                    key={key}
                    onClick={() => handleDemoSwitch(key)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.6rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.1rem',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{demo.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{demo.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowDemoMenu(false);
                  setShowUserMenu(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ position: 'relative', padding: '0.5rem' }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      backgroundColor: 'var(--danger)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      padding: '0.1rem 0.35rem',
                      minWidth: 16,
                      textAlign: 'center',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    width: 340,
                    maxHeight: 420,
                    overflowY: 'auto',
                    zIndex: 110,
                  }}
                >
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) markAsRead(n.id);
                            if (n.link) navigate(n.link);
                            setShowNotifications(false);
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: n.is_read ? 'transparent' : 'var(--primary-light)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account / Profile */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setShowDemoMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=4f46e5&color=fff`}
                  alt={user.email}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-border)' }}
                />
              </button>

              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    width: 220,
                    padding: '0.5rem',
                    zIndex: 110,
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {user.full_name || 'My Account'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {user.email}
                    </div>
                    <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'coach' ? 'primary' : 'active'}`} style={{ marginTop: '0.35rem' }}>
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <User size={16} /> Profile Details
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--danger)',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-sm btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Join Platform
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
