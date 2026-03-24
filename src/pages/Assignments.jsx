import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { coursesAPI } from '../services/api';
import api from '../services/api';

const assignmentsAPI = {
  getAll:       (params)    => api.get('/admin/assignments', { params }),
  create:       (data)      => api.post('/admin/assignments', data),
  update:       (id, data)  => api.put(`/admin/assignments/${id}`, data),
  delete:       (id)        => api.delete(`/admin/assignments/${id}`),
  getSubmissions: (id)      => api.get(`/admin/assignments/${id}/submissions`),
  gradeSubmission:(id, data)=> api.post(`/admin/submissions/${id}/grade`, data),
};

const STATUS_MAP = {
  pending:  { label: 'Очікує перевірки', color: '#ca8a04', bg: 'rgba(234,179,8,0.1)'  },
  graded:   { label: 'Перевірено',       color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  rejected: { label: 'Повернуто',        color: '#dc2626', bg: 'rgba(239,68,68,0.08)' },
};

const S = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  btnPrimary: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  statCard: { background: '#fff', border: '1px solid #e8e8ed', borderRadius: 14, padding: 20 },
  statIcon: (bg) => ({ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }),
  statVal: { fontSize: 30, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#5a6c7d', marginTop: 6 },
  card: { background: '#fff', border: '1px solid #e8e8ed', borderRadius: 16, padding: 20, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 },
  cardMeta: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  badge: (color, bg) => ({ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: bg, color }),
  btnGroup: { display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  btn: (v) => ({
    padding: '7px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: v === 'primary' ? 'linear-gradient(135deg,#667eea,#764ba2)' : v === 'danger' ? 'rgba(239,68,68,0.08)' : v === 'success' ? 'rgba(16,185,129,0.1)' : '#f4f5f7',
    color: v === 'primary' ? '#fff' : v === 'danger' ? '#dc2626' : v === 'success' ? '#059669' : '#4a4a6a',
  }),
  filterRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  input: { padding: '9px 14px', border: '1px solid #e8e8ed', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 200 },
  select: { padding: '9px 12px', border: '1px solid #e8e8ed', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 15 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: 20, overflowY: 'auto' },
  modal: { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', margin: '20px auto' },
  wideModal: { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 760, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', margin: '20px auto' },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6c7d', marginBottom: 5 },
  formInput: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed', borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 14, fontFamily: 'inherit' },
  formTextarea: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed', borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 14, resize: 'vertical', minHeight: 90, fontFamily: 'inherit' },
  formSelect: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed', borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 14, cursor: 'pointer', fontFamily: 'inherit' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  modalFooter: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 },
  btnCancel: { background: '#f4f5f7', border: 'none', borderRadius: 10, padding: '11px 22px', cursor: 'pointer', fontSize: 14, color: '#6b6b8a', fontWeight: 500 },
  btnSave: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  divider: { borderTop: '1px solid #f0f0f5', margin: '16px 0' },
  // Submission card
  subCard: { border: '1px solid #e8e8ed', borderRadius: 12, padding: 16, marginBottom: 10, background: '#fafafa' },
  subHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 },
};

const EMPTY_FORM = { title: '', description: '', course_id: '', lesson_id: '', max_score: 100, deadline: '', is_published: false };

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('');

  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState('');

  const [showSubs, setShowSubs]       = useState(false);
  const [activeSub, setActiveSub]     = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeForm, setGradeForm]     = useState({ score: '', feedback: '' });
  const [gradingId, setGradingId]     = useState(null);

  useEffect(() => { fetchAll(); fetchCourses(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await assignmentsAPI.getAll({ per_page: 100 });
      setAssignments(res.data?.data?.data || res.data?.data || []);
    } catch { setAssignments([]); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ per_page: 200 });
      setCourses(res.data?.data?.data || res.data?.data || []);
    } catch { /* тихо */ }
  };

  const setField = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit   = (a) => {
    setEditing(a);
    setForm({ title: a.title || '', description: a.description || '', course_id: a.course_id || '', lesson_id: a.lesson_id || '', max_score: a.max_score ?? 100, deadline: a.deadline?.slice(0,10) || '', is_published: !!a.is_published });
    setFormError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.course_id || !form.title) { setFormError('Оберіть курс і вкажіть назву'); return; }
    setSaving(true); setFormError('');
    try {
      if (editing) await assignmentsAPI.update(editing.id, form);
      else await assignmentsAPI.create(form);
      setShowModal(false); fetchAll();
    } catch (err) { setFormError(err.response?.data?.message || 'Помилка збереження'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити завдання?')) return;
    try { await assignmentsAPI.delete(id); fetchAll(); }
    catch { alert('Не вдалося видалити'); }
  };

  const openSubmissions = async (a) => {
    setActiveSub(a); setSubmissions([]);
    try {
      const res = await assignmentsAPI.getSubmissions(a.id);
      setSubmissions(res.data?.data || res.data || []);
    } catch { setSubmissions([]); }
    setShowSubs(true);
  };

  const handleGrade = async (subId) => {
    try {
      await assignmentsAPI.gradeSubmission(subId, gradeForm);
      const res = await assignmentsAPI.getSubmissions(activeSub.id);
      setSubmissions(res.data?.data || []);
      setGradingId(null);
      setGradeForm({ score: '', feedback: '' });
    } catch { alert('Помилка оцінювання'); }
  };

  const filtered = assignments.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || (a.title || '').toLowerCase().includes(q);
    return matchQ;
  });

  const pendingCount = assignments.reduce((s, a) => s + (a.pending_submissions_count || 0), 0);

  const stats = [
    { label: 'Всього завдань',    value: assignments.length,                                          icon: '📋', bg: '#ede9fe' },
    { label: 'Очікують перевірки', value: pendingCount,                                               icon: '⏳', bg: '#fef9c3' },
    { label: 'Опублікованих',     value: assignments.filter(a => a.is_published).length,              icon: '✅', bg: '#dcfce7' },
    { label: 'З дедлайном',       value: assignments.filter(a => a.deadline).length,                  icon: '📅', bg: '#dbeafe' },
  ];

  return (
    <Layout>
      <div style={S.pageHeader}>
        <h1 style={S.title}>Завдання</h1>
        <button style={S.btnPrimary} onClick={openCreate}>+ Нове завдання</button>
      </div>

      {/* Статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={S.statIcon(s.bg)}>{s.icon}</div>
            <div style={S.statVal}>{s.value}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Фільтри */}
      <div style={S.filterRow}>
        <input style={S.input} placeholder="Пошук по назві..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={S.select} value={statusFilter} onChange={e => setStatus(e.target.value)}>
          <option value="">Всі завдання</option>
          <option value="published">Опубліковані</option>
          <option value="draft">Чернетки</option>
        </select>
      </div>

      {/* Список */}
      {loading ? (
        <div style={S.empty}>Завантаження...</div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>{search ? 'Нічого не знайдено' : 'Завдань ще немає. Створіть перше!'}</div>
      ) : filtered.map(a => (
        <div key={a.id} style={S.card}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={S.badge(a.is_published ? '#059669' : '#6b7280', a.is_published ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)')}>
                  {a.is_published ? '✅ Опубліковано' : '📝 Чернетка'}
                </span>
                {a.pending_submissions_count > 0 && (
                  <span style={S.badge('#ca8a04', 'rgba(234,179,8,0.1)')}>
                    ⏳ {a.pending_submissions_count} на перевірці
                  </span>
                )}
              </div>
              <div style={S.cardTitle}>{a.title}</div>
              <div style={S.cardMeta}>
                {a.course?.title_uk || a.course?.title || `Курс #${a.course_id}`}
                {a.deadline && ` · 📅 Дедлайн: ${new Date(a.deadline).toLocaleDateString('uk-UA')}`}
                {` · 🏆 Макс. балів: ${a.max_score}`}
              </div>
              {a.description && (
                <p style={{ fontSize: 13, color: '#4a4a6a', lineHeight: 1.5, margin: 0 }}>
                  {a.description.slice(0, 120)}{a.description.length > 120 ? '...' : ''}
                </p>
              )}
            </div>
          </div>
          <div style={S.btnGroup}>
            <button style={S.btn('secondary')} onClick={() => openEdit(a)}>✏️ Редагувати</button>
            <button style={S.btn('primary')} onClick={() => openSubmissions(a)}>
              📎 Роботи ({a.submissions_count || 0})
            </button>
            <button style={S.btn('danger')} onClick={() => handleDelete(a.id)}>🗑 Видалити</button>
          </div>
        </div>
      ))}

      {/* ══ МОДАЛКА: Створення/Редагування ══════════════════ */}
      {showModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={S.modal}>
            <div style={S.modalTitle}>{editing ? '✏️ Редагувати завдання' : '+ Нове завдання'}</div>
            {formError && <div style={S.errorBox}>{formError}</div>}

            <label style={S.label}>Курс *</label>
            <select style={S.formSelect} value={form.course_id} onChange={e => setField('course_id', e.target.value)}>
              <option value="">— оберіть курс —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title_uk || c.title}</option>)}
            </select>

            <label style={S.label}>Назва завдання *</label>
            <input style={S.formInput} placeholder="Наприклад: Практична робота №1"
              value={form.title} onChange={e => setField('title', e.target.value)} />

            <label style={S.label}>Опис завдання</label>
            <textarea style={S.formTextarea}
              placeholder="Детальний опис що потрібно зробити студенту..."
              value={form.description} onChange={e => setField('description', e.target.value)} />

            <div style={S.twoCol}>
              <div>
                <label style={S.label}>Максимальний бал</label>
                <input style={S.formInput} type="number" min={1} max={1000} placeholder="100"
                  value={form.max_score} onChange={e => setField('max_score', +e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Дедлайн здачі</label>
                <input style={S.formInput} type="date"
                  value={form.deadline} onChange={e => setField('deadline', e.target.value)} />
              </div>
            </div>

            <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1d4ed8', marginBottom: 14 }}>
              📎 Студенти зможуть прикріплювати файли (PDF, зображення, архіви, посилання) для перевірки
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 14, color: '#4a4a6a', fontWeight: 500 }}>
              <input type="checkbox" checked={form.is_published} onChange={e => setField('is_published', e.target.checked)} style={{ width: 16, height: 16 }} />
              Опублікувати завдання
            </label>

            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setShowModal(false)}>Скасувати</button>
              <button style={S.btnSave} onClick={handleSave} disabled={saving}>
                {saving ? 'Збереження...' : editing ? '💾 Зберегти' : '✨ Створити'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ МОДАЛКА: Роботи студентів ════════════════════════ */}
      {showSubs && activeSub && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowSubs(false); }}>
          <div style={S.wideModal}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={S.modalTitle}>📎 Роботи: {activeSub.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{submissions.length} здано</div>
            </div>

            {submissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 14 }}>
                Жодної роботи ще не здано
              </div>
            ) : submissions.map(sub => {
              const st = STATUS_MAP[sub.status] || STATUS_MAP.pending;
              const initials = (sub.user?.first_name?.[0] || '') + (sub.user?.last_name?.[0] || '');
              return (
                <div key={sub.id} style={S.subCard}>
                  <div style={S.subHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={S.avatar}>{initials || 'S'}</div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                          {sub.user?.full_name || `${sub.user?.first_name} ${sub.user?.last_name}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {new Date(sub.created_at).toLocaleDateString('uk-UA')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {sub.score !== null && sub.score !== undefined && (
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#5a4fcf' }}>
                          {sub.score}/{activeSub.max_score}
                        </span>
                      )}
                      <span style={S.badge(st.color, st.bg)}>{st.label}</span>
                    </div>
                  </div>

                  {/* Текст відповіді */}
                  {sub.content && (
                    <div style={{ fontSize: 13, color: '#4a4a6a', lineHeight: 1.6, marginBottom: 10, padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #f0f0f5' }}>
                      {sub.content}
                    </div>
                  )}

                  {/* Прикріплені файли */}
                  {sub.files && sub.files.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      {sub.files.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f4f5f7', borderRadius: 8, fontSize: 12, color: '#5a4fcf', textDecoration: 'none', fontWeight: 500 }}>
                          📎 {f.name || `Файл ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Посилання */}
                  {sub.link && (
                    <a href={sub.link} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#5a4fcf', marginBottom: 10 }}>
                      🔗 {sub.link}
                    </a>
                  )}

                  {/* Форма оцінювання */}
                  {gradingId === sub.id ? (
                    <div style={{ background: '#fff', border: '1px solid #e8e8ed', borderRadius: 10, padding: '14px' }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ ...S.label, marginBottom: 4 }}>Оцінка (макс. {activeSub.max_score})</label>
                          <input type="number" min={0} max={activeSub.max_score}
                            value={gradeForm.score} onChange={e => setGradeForm(p => ({ ...p, score: e.target.value }))}
                            style={{ ...S.formInput, marginBottom: 0 }} placeholder="85" />
                        </div>
                      </div>
                      <label style={{ ...S.label, marginBottom: 4 }}>Коментар викладача</label>
                      <textarea value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                        style={{ ...S.formTextarea, minHeight: 60, marginBottom: 10 }} placeholder="Молодець! Але зверни увагу на..." />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={S.btnSave} onClick={() => handleGrade(sub.id)}>✅ Оцінити</button>
                        <button style={S.btnCancel} onClick={() => setGradingId(null)}>Скасувати</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={S.btn('primary')} onClick={() => { setGradingId(sub.id); setGradeForm({ score: sub.score || '', feedback: sub.feedback || '' }); }}>
                        ✏️ {sub.status === 'graded' ? 'Переоцінити' : 'Оцінити'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button style={S.btnCancel} onClick={() => setShowSubs(false)}>Закрити</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Assignments;
