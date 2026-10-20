import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  admin: { email: 'admin@coachconnect.io', password: 'AdminPass123!', label: 'Admin (Eleanor)' },
  coach_sarah: { email: 'sarah.coach@coachconnect.io', password: 'CoachPass123!', label: 'Coach Sarah (Cloud Architect)' },
  coach_david: { email: 'david.coach@coachconnect.io', password: 'CoachPass123!', label: 'Coach David (AI Specialist)' },
  student_alex: { email: 'alex.student@coachconnect.io', password: 'StudentPass123!', label: 'Student Alex (Backend Learner)' },
  student_priya: { email: 'priya.student@coachconnect.io', password: 'StudentPass123!', label: 'Student Priya (AI Learner)' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('coachconnect_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const userData = await api.get('/auth/me/');
        setUser(userData);
      } catch (err) {
        console.error('Failed to authenticate token:', err);
        localStorage.removeItem('coachconnect_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    localStorage.setItem('coachconnect_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (registrationData) => {
    const res = await api.post('/auth/register/', registrationData);
    localStorage.setItem('coachconnect_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('coachconnect_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const updated = await api.patch('/auth/me/', profileData);
    setUser(updated);
    return updated;
  };

  const quickLogin = async (key) => {
    const demo = DEMO_USERS[key];
    if (demo) {
      return await login(demo.email, demo.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role: user?.role || 'guest',
        isAuthenticated: !!user,
        isCoach: user?.role === 'coach' || user?.is_staff,
        isStudent: user?.role === 'student',
        isAdmin: user?.role === 'admin' || user?.is_staff,
        login,
        register,
        logout,
        updateProfile,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
