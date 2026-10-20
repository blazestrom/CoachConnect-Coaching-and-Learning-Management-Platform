import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Search,
  Filter,
  PlusCircle,
  BookOpen,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Software Engineering',
  'Data Science & AI',
  'Cloud & DevOps',
  'Product & Design',
  'Career & Leadership',
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
  const { isCoach, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Modal for Course Creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'Software Engineering',
    level: 'All Levels',
    duration_hours: 10,
    price: 49.0,
    description: '',
    learning_objectives: '',
    thumbnail_url: '',
    is_published: true,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        level: selectedLevel !== 'All' ? selectedLevel : undefined,
      };
      const res = await api.get('/courses/', params);
      setCourses(res.results || res || []);
      setCount(res.count || (res.results ? res.results.length : (res.length || 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      await api.post('/courses/', courseForm);
      setIsModalOpen(false);
      setCourseForm({
        title: '',
        category: 'Software Engineering',
        level: 'All Levels',
        duration_hours: 10,
        price: 49.0,
        description: '',
        learning_objectives: '',
        thumbnail_url: '',
        is_published: true,
      });
      fetchCourses();
    } catch (err) {
      setModalError(err.message || 'Failed to create course');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title & Action Bar */}
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Explore Courses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Browse industry-aligned curricula designed and taught by verified tech coaches
          </p>
        </div>

        {(isCoach || isAdmin) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Create New Course
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search bar */}
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
                placeholder="Search courses by topic, coach, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Level:</span>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setPage(1);
              }}
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading course catalog...
        </div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={36} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>No courses match your criteria</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Try clearing filters or searching for different keywords.</p>
        </div>
      ) : (
        <div className="grid-cols-auto-fit">
          {courses.map((course) => (
            <div key={course.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}
                />
                <span
                  className="badge badge-secondary"
                  style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}
                >
                  {course.level}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">{course.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {course.duration_hours} hrs
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.5rem' }}>
                {course.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.description}
              </p>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={course.coach?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={course.coach?.full_name}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{course.coach?.full_name || 'Coach'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${course.price > 0 ? course.price : 'Free'}
                  </span>
                  <Link to={`/courses/${course.id}`} className="btn btn-sm btn-primary">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {count > 10 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-outline btn-sm"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Page {page} of {Math.ceil(count / 10)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(count / 10)}
            className="btn btn-outline btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish a New Course"
        maxWidth={620}
      >
        {modalError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateCourse}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Production Microservices with Django & Redis"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <select
                className="form-select"
                value={courseForm.level}
                onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={courseForm.duration_hours}
                onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                required
                className="form-input"
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course Overview / Description</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Explain the background, target audience, and key skills taught..."
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Learning Objectives (One per line)</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Build modular microservices&#10;Implement distributed tracing&#10;Optimize database indexes"
              value={courseForm.learning_objectives}
              onChange={(e) => setCourseForm({ ...courseForm, learning_objectives: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail Image URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={courseForm.thumbnail_url}
              onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={modalLoading}
            >
              {modalLoading ? 'Creating Course...' : 'Publish Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
