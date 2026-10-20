import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  UserCheck,
  UserX,
  Users,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: search || undefined,
      };
      const res = await api.get('/admin/users/', params);
      setUsers(res.results || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleActive = async (targetUser) => {
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/status/`, {
        is_active: !targetUser.is_active,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: res.is_active } : u))
      );
      setStatusMessage(`User ${targetUser.email} status updated.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleChangeRole = async (targetUser, newRole) => {
    if (targetUser.id === currentUser?.id) {
      alert("You cannot modify your own administrative role directly.");
      return;
    }
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/status/`, {
        role: newRole,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: res.role } : u))
      );
      setStatusMessage(`Updated role for ${targetUser.email} to ${newRole}.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to change role');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={28} color="var(--primary)" />
            Platform Administration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            User management, permission assignments, and account active state governance
          </p>
        </div>
      </div>

      {statusMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--success-light)',
          color: 'var(--success-text)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
        }}>
          {statusMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 280px', display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role Filter:</span>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="coach">Coaches</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading platform accounts...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No user records match the query.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>User Profile</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Account State</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Joined Date</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.email)}&background=4f46e5&color=fff`}
                          alt={u.email}
                          style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {u.full_name || 'Unnamed User'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <select
                        className="form-select"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        disabled={u.id === currentUser?.id}
                      >
                        <option value="student">Student</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${u.is_active ? 'active' : 'cancelled'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-outline'}`}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          {u.is_active ? (
                            <>
                              <UserX size={13} /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} /> Activate
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
