import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { adminAPI, coursesAPI } from '../services/api';

// ─────────────────────────────────────────────────────────────
// Enrollments — Записи на курси
// Потребує в api.js:
//   adminAPI.getEnrollments(params)   → GET /api/v1/admin/enrollments
//   adminAPI.deleteEnrollment(id)     → DELETE /api/v1/admin/enrollments/{id}
//   adminAPI.createEnrollment(data)   → POST /api/v1/admin/enrollments
//   adminAPI.getUsers(params)         → вже є
//   coursesAPI.getAll()               → вже є
// ─────────────────────────────────────────────────────────────

const S = {
  pageHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 },

  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: 10,
    padding: '11px 22px', cursor: 'pointer',
    fontSize: 14, fontWeight: 600,
  },
  card: {
    background: '#fff', border: '1px solid #e8e8ed',
    borderRadius: 14, overflow: 'hidden',
  },
  tableHead: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #f0f0f5',
    flexWrap: 'wrap', gap: 12,
  },
  tableTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: 0 },
  filters: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  input: {
    padding: '8px 14px', border: '1px solid #e8e8ed',
    borderRadius: 8, fontSize: 13, outline: 'none', width: 220,
    fontFamily: 'inherit',
  },
  select: {
    padding: '8px 12px', border: '1px solid #e8e8ed',
    borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  },
  th: {
    padding: '11px 16px', textAlign: 'left',
    fontSize: 11, fontWeight: 600, color: '#94a3b8',
    letterSpacing: '0.05em', whiteSpace: 'nowrap',
  },
  td: { padding: '13px 16px', fontSize: 14, color: '#1a1a2e', verticalAlign: 'middle' },
  emptyRow: { textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 },

  avatarCircle: (bg) => ({
    width: 34, height: 34, borderRadius: '50%',
    background: bg || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
  }),

  badge: (color, bg) => ({
    padding: '3px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
    background: bg, color: color, whiteSpace: 'nowrap',
  }),

  progressWrap: {
    height: 6, background: '#f0f0f5',
    borderRadius: 3, overflow: 'hidden', width: 120,
  },
  progressBar: (pct) => ({
    height: '100%', width: `${pct}%`,
    background: pct === 100 ? '#10b981' : '#667eea',
    borderRadius: 3, transition: 'width 0.4s',
  }),

  btnIcon: (danger) => ({
    padding: '5px 11px',
    background: danger ? 'rgba(239,68,68,0.08)' : '#f4f5f7',
    border: 'none', borderRadius: 8,
    cursor: 'pointer', fontSize: 12, fontWeight: 500,
    color: danger ? '#dc2626' : '#4a4a6a',
  }),

  // Модалка
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(10,10,30,0.45)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20,
    padding: 32, width: '100%', maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  },
  modalTitle: {
    fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 22,
    display: 'flex', alignItems: 'center', gap: 10,
  },
  label: {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#5a6c7d', marginBottom: 5,
  },
  modalInput: {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #e8e8ed', borderRadius: 10,
    fontSize: 14, color: '#1a1a2e', background: '#fafafa',
    outline: 'none', boxSizing: 'border-box',
    marginBottom: 14, fontFamily: 'inherit',
  },
  modalSelect: {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #e8e8ed', borderRadius: 10,
    fontSize: 14, color: '#1a1a2e', background: '#fafafa',
    outline: 'none', boxSizing: 'border-box',
    marginBottom: 14, cursor: 'pointer', fontFamily: 'inherit',
  },
  errorBox: {
    background: '#fee2e2', color: '#dc2626',
    padding: '10px 14px', borderRadius: 8,
    marginBottom: 16, fontSize: 13,
  },
  modalFooter: {
    display: 'flex', gap: 10,
    justifyContent: 'flex-end', marginTop: 8,
  },
  btnCancel: {
    background: '#f4f5f7', border: 'none', borderRadius: 10,
    padding: '11px 22px', cursor: 'pointer',
    fontSize: 14, color: '#6b6b8a', fontWeight: 500,
  },
  btnSave: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: 10,
    padding: '11px 26px', cursor: 'pointer',
    fontSize: 14, fontWeight: 600,
  },
};

// Статус-бейдж
const statusBadge = (status) => {
  const map = {
    active:    { color: '#059669', bg: 'rgba(16,185,129,0.1)',  label: 'Активний'  },
    completed: { color: '#5a4fcf', bg: 'rgba(90,79,207,0.1)',   label: 'Завершено' },
    cancelled: { color: '#dc2626', bg: 'rgba(239,68,68,0.08)',  label: 'Скасовано' },
    pending:   { color: '#ca8a04', bg: 'rgba(234,179,8,0.1)',   label: 'Очікує'    },
  };
  const s = map[status] || map.active;
  return <span style={S.badge(s.color, s.bg)}>{s.label}</span>;
};

// ─────────────────────────────────────────────────────────────
function Enrollments() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('');
  const [courseFilter, setCourse]     = useState('');

  // Для модалки "Записати студента"
  const [showModal, setShowModal]     = useState(false);
  const [users, setUsers]             = useState([]);
  const [courses, setCourses]         = useState([]);
  const [form, setForm]               = useState({ user_id: '', course_id: '', status: 'active' });
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState('');

  useEffect(() => {
    fetchEnrollments();
    fetchUsersAndCourses();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getEnrollments({ per_page: 100 });
      const data = res.data?.data?.data || res.data?.data || [];
      setEnrollments(data);
    } catch (err) {
      console.error('fetchEnrollments error:', err);
      // Якщо API ще немає — показуємо порожній стан
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndCourses = async () => {
    try {
      const [uRes, cRes] = await Promise.allSettled([
        adminAPI.getUsers({ per_page: 200 }),
        coursesAPI.getAll({ per_page: 200 }),
      ]);
      if (uRes.status === 'fulfilled') {
        const allUsers = uRes.value.data?.data?.data || uRes.value.data?.data || [];
        setUsers(allUsers.filter(user => user.role === 'student'));
      }
      if (cRes.status === 'fulfilled') {
        setCourses(cRes.value.data?.data?.data || cRes.value.data?.data || []);
      }
    } catch { /* тихо */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити запис на курс?')) return;
    try {
      await adminAPI.deleteEnrollment(id);
      fetchEnrollments();
    } catch {
      alert('Не вдалося видалити');
    }
  };

  const handleSave = async () => {
    if (!form.user_id || !form.course_id) {
      setFormError('Оберіть студента і курс');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await adminAPI.createEnrollment(form);
      setShowModal(false);
      setForm({ user_id: '', course_id: '', status: 'active' });
      fetchEnrollments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  // ── Фільтрація ───────────────────────────────────────────
  const uniqueCourses = [...new Map(
    enrollments.map(e => [e.course_id, { id: e.course_id, title: e.course?.title_uk || e.course?.title }])
  ).values()];

  const filtered = enrollments.filter(e => {
    const name = (e.user?.full_name || `${e.user?.first_name || ''} ${e.user?.last_name || ''}`).toLowerCase();
    const email = (e.user?.email || '').toLowerCase();
    const course = (e.course?.title_uk || e.course?.title || '').toLowerCase();
    const q = search.toLowerCase();

    const matchSearch = !q || name.includes(q) || email.includes(q) || course.includes(q);
    const matchStatus = !statusFilter || e.status === statusFilter;
    const matchCourse = !courseFilter || String(e.course_id) === courseFilter;
    return matchSearch && matchStatus && matchCourse;
  });

  // ── Статистика ──────────────────────────────────────────
  const stats = [
    { label: 'Всього записів',  value: enrollments.length,                                      icon: '📝', bg: '#ede9fe', sub: 'загалом' },
    { label: 'Активних',        value: enrollments.filter(e => e.status === 'active').length,    icon: '✅', bg: '#dcfce7', sub: 'навчаються' },
    { label: 'Завершили',       value: enrollments.filter(e => e.status === 'completed').length, icon: '🎓', bg: '#dbeafe', sub: 'курс пройдено' },
    { label: 'Скасовано',       value: enrollments.filter(e => e.status === 'cancelled').length, icon: '❌', bg: '#fee2e2', sub: 'відписались' },
  ];

  // ─────────────────────────────────────────────────────────
  return (
    <Layout>

      {/* Заголовок */}
      <div style={S.pageHeader}>
        <h1 style={S.title}>Записи на курси</h1>
        <button style={S.btnPrimary} onClick={() => setShowModal(true)}>
          + Записати студента
        </button>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24,
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #e8e8ed',
            borderRadius: 14, padding: 20,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: s.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 14,
            }}>
              {s.icon}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: '#5a6c7d', marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Таблиця */}
      <div style={S.card}>
        <div style={S.tableHead}>
          <h2 style={S.tableTitle}>
            Всі записи ({filtered.length})
          </h2>
          <div style={S.filters}>
            <input
              style={S.input}
              placeholder="Пошук по імені, email, курсу..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={S.select} value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="">Всі статуси</option>
              <option value="active">Активні</option>
              <option value="completed">Завершені</option>
              <option value="cancelled">Скасовані</option>
              <option value="pending">Очікують</option>
            </select>
            <select style={S.select} value={courseFilter} onChange={e => setCourse(e.target.value)}>
              <option value="">Всі курси</option>
              {uniqueCourses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f5' }}>
                {['СТУДЕНТ', 'КУРС', 'СТАТУС', 'ПРОГРЕС', 'ДАТА ЗАПИСУ', 'ДІЇ'].map(col => (
                  <th key={col} style={S.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={S.emptyRow}>Завантаження...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={S.emptyRow}>
                    {search || statusFilter || courseFilter
                      ? 'Нічого не знайдено'
                      : 'Записів ще немає. Запишіть першого студента!'}
                  </td>
                </tr>
              ) : filtered.map(e => {
                const progress = e.progress_percentage ?? e.progress ?? 0;
                const userName = e.user?.full_name
                  || `${e.user?.first_name || ''} ${e.user?.last_name || ''}`.trim()
                  || `Студент #${e.user_id}`;
                const initials = (e.user?.first_name?.[0] || '') + (e.user?.last_name?.[0] || '')
                  || userName[0]?.toUpperCase() || 'S';
                const courseName = e.course?.title_uk || e.course?.title || `Курс #${e.course_id}`;

                return (
                  <tr key={e.id}
                    style={{ borderBottom: '1px solid #f8f8fa' }}
                    onMouseEnter={el => el.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
                  >
                    {/* Студент */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={S.avatarCircle()}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{userName}</div>
                          {e.user?.email && (
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{e.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Курс */}
                    <td style={S.td}>
                      <div style={{ fontWeight: 500 }}>{courseName}</div>
                      {e.course?.level && (
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                          {e.course.level === 'beginner' ? 'Початківець'
                            : e.course.level === 'intermediate' ? 'Середній' : 'Просунутий'}
                        </div>
                      )}
                    </td>

                    {/* Статус */}
                    <td style={S.td}>{statusBadge(e.status)}</td>

                    {/* Прогрес */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={S.progressWrap}>
                          <div style={S.progressBar(progress)} />
                        </div>
                        <span style={{ fontSize: 12, color: '#5a6c7d', minWidth: 32 }}>
                          {progress}%
                        </span>
                      </div>
                    </td>

                    {/* Дата */}
                    <td style={{ ...S.td, fontSize: 13, color: '#5a6c7d' }}>
                      {e.enrolled_at || e.created_at
                        ? new Date(e.enrolled_at || e.created_at).toLocaleDateString('uk-UA')
                        : '—'}
                    </td>

                    {/* Дії */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          style={S.btnIcon(false)}
                          onClick={() => navigate(`/courses`)}
                          title="Переглянути курс"
                        >
                          📚 Курс
                        </button>
                        <button
                          style={S.btnIcon(true)}
                          onClick={() => handleDelete(e.id)}
                          title="Видалити запис"
                        >
                          🗑 Видалити
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Модалка: Записати студента ─────────────────────── */}
      {showModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={S.modal}>
            <div style={S.modalTitle}>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#ede9fe', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>📝</span>
              Записати студента
            </div>

            {formError && <div style={S.errorBox}>{formError}</div>}

            {/* Студент */}
            <label style={S.label}>Студент *</label>
            <select
              style={S.modalSelect}
              value={form.user_id}
              onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
            >
              <option value="">— оберіть студента —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name || `${u.first_name} ${u.last_name}`} ({u.email})
                </option>
              ))}
            </select>

            {/* Курс */}
            <label style={S.label}>Курс *</label>
            <select
              style={S.modalSelect}
              value={form.course_id}
              onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
            >
              <option value="">— оберіть курс —</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title_uk || c.title}
                </option>
              ))}
            </select>

            {/* Статус */}
            <label style={S.label}>Статус</label>
            <select
              style={S.modalSelect}
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Активний</option>
              <option value="pending">Очікує підтвердження</option>
            </select>

            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setShowModal(false)}>
                Скасувати
              </button>
              <button style={S.btnSave} onClick={handleSave} disabled={saving}>
                {saving ? 'Збереження...' : '✅ Записати'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default Enrollments;
