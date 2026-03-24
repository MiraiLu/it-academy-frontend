import React, { useState, useEffect, useCallback } from 'react';
import { coursesAPI } from '../services/api';
import Layout from '../components/Layout';

// ─────────────────────────────────────────────────────────────
// СТИЛІ
// ─────────────────────────────────────────────────────────────
const S = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0,
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '11px 26px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 14px rgba(102,126,234,0.35)',
  },
  searchBox: {
    width: '100%',
    padding: '11px 18px',
    borderRadius: '12px',
    border: '1.5px solid #e8e8ed',
    background: '#fff',
    fontSize: '14px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#1a1a2e',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#fff',
    border: '1px solid #e8e8ed',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '8px',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#6b6b8a',
    marginBottom: '4px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  btnEdit: {
    flex: 1,
    background: 'rgba(102,126,234,0.1)',
    color: '#5a4fcf',
    border: '1px solid rgba(102,126,234,0.25)',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  btnDelete: {
    flex: 1,
    background: 'rgba(239,68,68,0.08)',
    color: '#dc2626',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  badge: (published) => ({
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '10px',
    background: published ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)',
    color: published ? '#059669' : '#6b7280',
  }),
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b6b8a',
    fontSize: '15px',
  },
  // Модалка
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,10,30,0.4)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: '20px',
    padding: '30px',
    width: '100%',
    maxWidth: '540px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '22px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a4a6a',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px 13px',
    borderRadius: '10px',
    border: '1.5px solid #e8e8ed',
    background: '#fafafa',
    fontSize: '14px',
    color: '#1a1a2e',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px 13px',
    borderRadius: '10px',
    border: '1.5px solid #e8e8ed',
    background: '#fafafa',
    fontSize: '14px',
    color: '#1a1a2e',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '14px',
    resize: 'vertical',
    minHeight: '76px',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '10px 13px',
    borderRadius: '10px',
    border: '1.5px solid #e8e8ed',
    background: '#fafafa',
    fontSize: '14px',
    color: '#1a1a2e',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '14px',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '12px',
    color: '#dc2626',
    marginTop: '-10px',
    marginBottom: '10px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  btnCancel: {
    background: '#f4f5f7',
    border: 'none',
    borderRadius: '10px',
    padding: '11px 22px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b6b8a',
  },
  btnSubmit: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '11px 26px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

// ─────────────────────────────────────────────────────────────
// ДОПОМІЖНІ КОМПОНЕНТИ — ПОЗА функцією Courses (щоб не губився фокус!)
// ─────────────────────────────────────────────────────────────
const Field = ({ label, required, value, onChange, type = 'text', error, placeholder }) => (
  <div>
    <label style={S.label}>
      {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...S.input, borderColor: error ? '#dc2626' : '#e8e8ed' }}
    />
    {error && <div style={S.errorText}>{Array.isArray(error) ? error[0] : error}</div>}
  </div>
);

const TextArea = ({ label, required, value, onChange, error, placeholder }) => (
  <div>
    <label style={S.label}>
      {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
    </label>
    <textarea
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...S.textarea, borderColor: error ? '#dc2626' : '#e8e8ed' }}
    />
    {error && <div style={S.errorText}>{Array.isArray(error) ? error[0] : error}</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', title_uk: '',
  description: '', description_uk: '',
  category_id: '', language: 'uk',
  level: 'beginner', price: '',
  is_published: false,
};

// ─────────────────────────────────────────────────────────────
// ГОЛОВНИЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────
function Courses() {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();
  const isLiveOnlyInstructor = currentUser?.is_live_only_instructor;
  const canManageCourses = !isLiveOnlyInstructor;

  const [courses, setCourses]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editingCourse, setEditing] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cRes, catRes] = await Promise.all([
        coursesAPI.getManageAll(),
        coursesAPI.getCategories().catch(() => ({ data: { data: [] } })),
      ]);
      setCourses(cRes.data?.data?.data || cRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (e) {
      console.error('Помилка завантаження:', e);
    } finally {
      setLoading(false);
    }
  };

  const setField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  }, []);

  const openCreate = () => {
    if (!canManageCourses) return;
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (course) => {
    if (!canManageCourses) return;
    setEditing(course);
    setForm({
      title:          course.title || '',
      title_uk:       course.title_uk || '',
      description:    course.description || '',
      description_uk: course.description_uk || '',
      category_id:    course.category_id || '',
      language:       course.language || 'uk',
      level:          course.level || 'beginner',
      price:          course.price || '',
      is_published:   !!course.is_published,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageCourses) return;
    setSaving(true);
    setErrors({});
    const slug = (form.title_uk || form.title || 'course')
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      + '-' + Date.now();
    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, { ...form, slug });
      } else {
        await coursesAPI.create({ ...form, slug });
      }
      setShowModal(false);
      loadAll();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        alert('Помилка: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!canManageCourses) return;
    if (!window.confirm(`Видалити курс "${course.title_uk || course.title}"?`)) return;
    try {
      await coursesAPI.delete(course.id);
      loadAll();
    } catch { alert('Не вдалося видалити'); }
  };

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    return (c.title || '').toLowerCase().includes(q) ||
           (c.title_uk || '').toLowerCase().includes(q);
  });
  const cardActionsStyle = canManageCourses ? S.cardActions : { ...S.cardActions, display: 'none' };

  // ─────────────────────────────────────────────────────────────
  // РЕНДЕР
  // ─────────────────────────────────────────────────────────────
  return (
    <Layout>

      <div style={S.header}>
        <h1 style={S.title}>Курси</h1>
        <button style={S.btnPrimary} onClick={openCreate}>+ Новий курс</button>
      </div>

      <input
        style={S.searchBox}
        placeholder="Пошук курсів..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div style={S.emptyState}>Завантаження...</div>
      ) : filtered.length === 0 ? (
        <div style={S.emptyState}>
          {search ? 'Нічого не знайдено' : 'Курсів ще немає. Створіть перший!'}
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map(course => (
            <div key={course.id} style={S.card}>
              <span style={S.badge(course.is_published)}>
                {course.is_published ? 'Опубліковано' : 'Чернетка'}
              </span>
              <div style={S.cardTitle}>{course.title_uk || course.title || '—'}</div>
              {course.title && course.title !== course.title_uk && (
                <div style={S.cardMeta}>{course.title}</div>
              )}
              <div style={S.cardMeta}>
                Рівень: {course.level || '—'} &nbsp;·&nbsp; Мова: {course.language || '—'}
              </div>
              <div style={S.cardMeta}>
                Ціна: {course.price ? `${course.price} грн` : 'Безкоштовно'}
              </div>
              {course.enrolled_count !== undefined && (
                <div style={S.cardMeta}>Студентів: {course.enrolled_count}</div>
              )}
              <div style={cardActionsStyle}>
                <button style={S.btnEdit} onClick={() => openEdit(course)}>✏️ Редагувати</button>
                <button style={S.btnDelete} onClick={() => handleDelete(course)}>🗑 Видалити</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальне вікно */}
      {canManageCourses && showModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={S.modal}>
            <h2 style={S.modalTitle}>
              {editingCourse ? '✏️ Редагувати курс' : '✨ Новий курс'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={S.twoCol}>
                <Field label="Назва (UA)" required value={form.title_uk}
                  onChange={e => setField('title_uk', e.target.value)}
                  placeholder="Назва українською" error={errors.title_uk} />
                <Field label="Title (EN)" value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  placeholder="English title" error={errors.title} />
              </div>
              <TextArea label="Опис (UA)" required value={form.description_uk}
                onChange={e => setField('description_uk', e.target.value)}
                placeholder="Короткий опис курсу українською..." error={errors.description_uk} />
              <TextArea label="Description (EN)" value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Short description in English..." error={errors.description} />

              <div style={S.twoCol}>
                <div>
                  <label style={S.label}>Категорія</label>
                  <select value={form.category_id}
                    onChange={e => setField('category_id', e.target.value)} style={S.select}>
                    <option value="">— без категорії —</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name_uk || cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Мова викладання <span style={{ color: '#dc2626' }}>*</span></label>
                  <select value={form.language}
                    onChange={e => setField('language', e.target.value)} style={S.select}>
                    <option value="uk">🇺🇦 Українська</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="pl">🇵🇱 Polski</option>
                  </select>
                </div>
              </div>

              <div style={S.twoCol}>
                <div>
                  <label style={S.label}>Рівень</label>
                  <select value={form.level}
                    onChange={e => setField('level', e.target.value)} style={S.select}>
                    <option value="beginner">Початківець</option>
                    <option value="intermediate">Середній</option>
                    <option value="advanced">Просунутий</option>
                  </select>
                </div>
                <Field label="Ціна (грн)" type="number" value={form.price}
                  onChange={e => setField('price', e.target.value)}
                  placeholder="0 = безкоштовно" error={errors.price} />
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'10px',
                marginBottom:'22px', cursor:'pointer', fontSize:'14px', color:'#4a4a6a', fontWeight:'500' }}>
                <input type="checkbox" checked={form.is_published}
                  onChange={e => setField('is_published', e.target.checked)}
                  style={{ width:'16px', height:'16px', cursor:'pointer' }} />
                Опублікувати курс
              </label>

              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" style={S.btnCancel} onClick={() => setShowModal(false)}>
                  Скасувати
                </button>
                <button type="submit" style={S.btnSubmit} disabled={saving}>
                  {saving ? '⏳ Збереження...' : editingCourse ? '💾 Зберегти' : '✨ Створити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default Courses;
