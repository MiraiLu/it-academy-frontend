import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { coursesAPI } from '../services/api';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────
// API helpers (додай в api.js → lessonsAPI)
// lessonsAPI.getAll(params)        GET /api/v1/lessons
// lessonsAPI.create(data)          POST /api/v1/lessons
// lessonsAPI.update(id, data)      PUT /api/v1/lessons/{id}
// lessonsAPI.delete(id)            DELETE /api/v1/lessons/{id}
// ─────────────────────────────────────────────────────────────
const lessonsAPI = {
  getAll:  (params) => api.get('/lessons', { params }),
  create:  (data)   => api.post('/lessons', data),
  update:  (id, data) => api.put(`/lessons/${id}`, data),
  delete:  (id)     => api.delete(`/lessons/${id}`),
};

// ─── Кольори і константи ─────────────────────────────────────
const TYPE_LIVE   = 'live';
const TYPE_ONLINE = 'online';

const LESSON_STATUS = {
  draft:     { label: 'Чернетка',   color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  scheduled: { label: 'Заплановано', color: '#ca8a04', bg: 'rgba(234,179,8,0.1)'   },
  live:      { label: '🔴 LIVE',     color: '#dc2626', bg: 'rgba(239,68,68,0.1)'   },
  completed: { label: 'Проведено',   color: '#059669', bg: 'rgba(16,185,129,0.1)'  },
  published: { label: 'Опублікован', color: '#5a4fcf', bg: 'rgba(90,79,207,0.1)'  },
};

// ─── Стилі ───────────────────────────────────────────────────
const S = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 },

  // Tabs
  tabs: { display: 'flex', gap: 4, background: '#f4f5f7', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' },
  tab: (active) => ({
    padding: '8px 20px', borderRadius: 9, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: active ? '#fff' : 'transparent',
    color: active ? '#1a1a2e' : '#6b7280',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
  }),

  // Stats
  statCard: { background: '#fff', border: '1px solid #e8e8ed', borderRadius: 14, padding: 20 },
  statIcon: (bg) => ({
    width: 44, height: 44, borderRadius: 12, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, marginBottom: 14,
  }),
  statVal: { fontSize: 30, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#5a6c7d', marginTop: 6 },

  // Lesson Card
  lessonCard: {
    background: '#fff', border: '1px solid #e8e8ed', borderRadius: 16,
    padding: 20, marginBottom: 12, transition: 'box-shadow 0.2s',
  },
  lessonHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  lessonTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 },
  lessonMeta: { fontSize: 13, color: '#6b7280' },
  lessonBody: { marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f5' },

  badge: (color, bg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    background: bg, color, whiteSpace: 'nowrap',
  }),
  typeBadge: (type) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: type === TYPE_LIVE ? 'rgba(239,68,68,0.08)' : 'rgba(90,79,207,0.08)',
    color: type === TYPE_LIVE ? '#dc2626' : '#5a4fcf',
  }),

  infoRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a4a6a', marginBottom: 8 },
  infoIcon: { fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 },

  link: { color: '#5a4fcf', textDecoration: 'none', fontWeight: 500, fontSize: 13 },

  btnGroup: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 },
  btn: (variant) => ({
    padding: '7px 14px', border: 'none', borderRadius: 8,
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: variant === 'primary' ? 'linear-gradient(135deg,#667eea,#764ba2)'
               : variant === 'danger'  ? 'rgba(239,68,68,0.08)'
               : variant === 'success' ? 'rgba(16,185,129,0.1)'
               : variant === 'youtube' ? '#ff0000'
               : '#f4f5f7',
    color: variant === 'primary' ? '#fff'
         : variant === 'danger'  ? '#dc2626'
         : variant === 'success' ? '#059669'
         : variant === 'youtube' ? '#fff'
         : '#4a4a6a',
  }),

  // Пошук і фільтри
  filterRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  input: {
    padding: '9px 14px', 
    border: '1px solid #e8e8ed', 
    borderRadius: 8,
    fontSize: 13, 
    outline: 'none', 
    fontFamily: 'inherit', 
    flex: 1, 
    minWidth: 200,
  },
  select: {
    padding: '9px 12px', 
    border: '1px solid #e8e8ed', 
    borderRadius: 8,
    fontSize: 13, 
    outline: 'none', 
    cursor: 'pointer', 
    fontFamily: 'inherit',
  },

  empty: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 15 },

  // Модалка
  overlay: {
    position: 'fixed', inset: 0, 
    background: 'rgba(10,10,30,0.45)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center', 
    zIndex: 1000, 
    padding: 20,
    overflowY: 'auto',
  },
  modal: {
    background: '#fff', 
    borderRadius: 20, 
    padding: 32,
    width: '100%', 
    maxWidth: 580, 
    //maxHeight: '90vh',
    overflowY: 'visible', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6c7d', marginBottom: 5 },
  formInput: {
    width: '100%', 
    padding: '10px 13px', 
    border: '1.5px solid #e8e8ed',
    borderRadius: 10, 
    fontSize: 14, 
    color: '#1a1a2e', 
    background: '#fafafa',
    outline: 'none', 
    boxSizing: 'border-box', 
    marginBottom: 14, 
    fontFamily: 'inherit',
  },
  formTextarea: {
    width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed',
    borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa',
    outline: 'none', boxSizing: 'border-box', marginBottom: 14,
    resize: 'vertical', minHeight: 80, fontFamily: 'inherit',
  },
  formSelect: {
    width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed',
    borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa',
    outline: 'none', boxSizing: 'border-box', marginBottom: 14,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  modalFooter: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  btnCancel: { background: '#f4f5f7', border: 'none', borderRadius: 10, padding: '11px 22px', cursor: 'pointer', fontSize: 14, color: '#6b6b8a', fontWeight: 500 },
  btnSave: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },

  // Type switcher у модалці
  typeSwitch: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  typeOption: (active, type) => ({
    padding: '14px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
    border: active
      ? `2px solid ${type === TYPE_LIVE ? '#dc2626' : '#5a4fcf'}`
      : '2px solid #e8e8ed',
    background: active
      ? (type === TYPE_LIVE ? 'rgba(239,68,68,0.05)' : 'rgba(90,79,207,0.05)')
      : '#fafafa',
    transition: 'all 0.15s',
  }),
  typeOptionIcon: { fontSize: 28, marginBottom: 6 },
  typeOptionTitle: (active, type) => ({
    fontSize: 14, fontWeight: 600,
    color: active ? (type === TYPE_LIVE ? '#dc2626' : '#5a4fcf') : '#4a4a6a',
  }),
  typeOptionDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  divider: { borderTop: '1px solid #f0f0f5', margin: '18px 0' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 12 },
};

// ─────────────────────────────────────────────────────────────
// Компонент LessonCard
// ─────────────────────────────────────────────────────────────
const LessonCard = React.memo(({ lesson, onEdit, onDelete, onAddVideo, onAddHomework }) => {
  const [expanded, setExpanded] = useState(false);
  const st = LESSON_STATUS[lesson.status] || LESSON_STATUS.draft;

  return (
    <div style={S.lessonCard}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={S.lessonHeader}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={S.typeBadge(lesson.type)}>
              {lesson.type === TYPE_LIVE ? '🎥 Живе заняття' : '📹 Онлайн курс'}
            </span>
            <span style={S.badge(st.color, st.bg)}>{st.label}</span>
            {lesson.order_number && (
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Урок {lesson.order_number}</span>
            )}
          </div>
          <div style={S.lessonTitle}>{lesson.title}</div>
          <div style={S.lessonMeta}>
            {lesson.course?.title_uk || lesson.course?.title || `Курс #${lesson.course_id}`}
            {lesson.scheduled_at && ` · ${new Date(lesson.scheduled_at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
            {lesson.duration_minutes && ` · ${lesson.duration_minutes} хв`}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 4 }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div style={S.lessonBody}>
          {/* Опис */}
          {lesson.description && (
            <p style={{ fontSize: 14, color: '#4a4a6a', lineHeight: 1.6, marginBottom: 14 }}>
              {lesson.description}
            </p>
          )}

          {/* LIVE специфіка */}
          {lesson.type === TYPE_LIVE && (
            <>
              {lesson.meeting_link && (
                <div style={S.infoRow}>
                  <span style={S.infoIcon}>🔗</span>
                  <span style={{ color: '#5a6c7d' }}>Посилання на заняття:</span>
                  <a href={lesson.meeting_link} target="_blank" rel="noreferrer" style={S.link}>
                    {lesson.meeting_link}
                  </a>
                </div>
              )}
              {lesson.recording_url && (
                <div style={S.infoRow}>
                  <span style={S.infoIcon}>▶️</span>
                  <span style={{ color: '#5a6c7d' }}>Запис заняття:</span>
                  <a href={lesson.recording_url} target="_blank" rel="noreferrer" style={S.link}>
                    YouTube →
                  </a>
                </div>
              )}
            </>
          )}

          {/* ONLINE специфіка */}
          {lesson.type === TYPE_ONLINE && (
            <>
              {lesson.video_url && (
                <div style={S.infoRow}>
                  <span style={S.infoIcon}>▶️</span>
                  <span style={{ color: '#5a6c7d' }}>Відео:</span>
                  <a href={lesson.video_url} target="_blank" rel="noreferrer" style={S.link}>
                    Переглянути →
                  </a>
                </div>
              )}
              {lesson.content_url && (
                <div style={S.infoRow}>
                  <span style={S.infoIcon}>📄</span>
                  <span style={{ color: '#5a6c7d' }}>Матеріали:</span>
                  <a href={lesson.content_url} target="_blank" rel="noreferrer" style={S.link}>
                    Відкрити →
                  </a>
                </div>
              )}
            </>
          )}

          {/* Домашнє завдання */}
          {lesson.homework && (
            <div style={{
              background: '#fafafa', border: '1px solid #f0f0f5',
              borderRadius: 10, padding: '12px 14px', marginTop: 10,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                📋 ДОМАШНЄ ЗАВДАННЯ
              </div>
              <div style={{ fontSize: 14, color: '#4a4a6a', lineHeight: 1.6 }}>
                {lesson.homework}
              </div>
              {lesson.homework_deadline && (
                <div style={{ fontSize: 12, color: '#ca8a04', marginTop: 6 }}>
                  ⏰ Дедлайн: {new Date(lesson.homework_deadline).toLocaleDateString('uk-UA')}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                📎 Студенти можуть прикріплювати файли для перевірки
              </div>
            </div>
          )}

          {/* Кнопки дій */}
          <div style={S.btnGroup}>
            <button style={S.btn('secondary')} onClick={() => onEdit(lesson)}>
              ✏️ Редагувати
            </button>

            {lesson.type === TYPE_LIVE && !lesson.recording_url && lesson.status === 'completed' && (
              <button style={S.btn('youtube')} onClick={() => onAddVideo(lesson)}>
                ▶ Додати YouTube запис
              </button>
            )}

            {!lesson.homework && (
              <button style={S.btn('success')} onClick={() => onAddHomework(lesson)}>
                📋 Додати ДЗ
              </button>
            )}

            <button style={S.btn('danger')} onClick={() => onDelete(lesson.id)}>
              🗑 Видалити
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// EMPTY FORM
// ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  type: TYPE_LIVE,
  course_id: '',
  title: '',
  description: '',
  order_number: '',
  duration_minutes: '',
  status: 'draft',
  // Live
  meeting_link: '',
  scheduled_at: '',
  recording_url: '',
  // Online
  video_url: '',
  content_url: '',
  is_free_preview: false,
  // Спільне
  homework: '',
  homework_deadline: '',
};

// ─────────────────────────────────────────────────────────────
// ГОЛОВНИЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────
function Lessons() {
  const [lessons, setLessons]       = useState([]);
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [courseFilter, setCourse]   = useState('');
  const [activeTab, setActiveTab]   = useState('all'); // all | live | online

  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  // Модалка YouTube
  const [ytModal, setYtModal]       = useState(null); // {lesson}
  const [ytUrl, setYtUrl]           = useState('');

  // Модалка ДЗ
  const [hwModal, setHwModal]       = useState(null); // {lesson}
  const [hwText, setHwText]         = useState('');
  const [hwDeadline, setHwDeadline] = useState('');

  useEffect(() => {
    fetchLessons();
    fetchCourses();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await lessonsAPI.getAll({ per_page: 200 });
      setLessons(res.data?.data?.data || res.data?.data || []);
    } catch { setLessons([]); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ per_page: 200 });
      setCourses(res.data?.data?.data || res.data?.data || []);
    } catch { /* тихо */ }
  };

  const setField = useCallback((key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (lesson) => {
    setEditing(lesson);
    setForm({
      type:              lesson.type || TYPE_LIVE,
      course_id:         lesson.course_id || '',
      title:             lesson.title || '',
      description:       lesson.description || '',
      order_number:      lesson.order_number || '',
      duration_minutes:  lesson.duration_minutes || '',
      status:            lesson.status || 'draft',
      meeting_link:      lesson.meeting_link || '',
      scheduled_at:      lesson.scheduled_at ? lesson.scheduled_at.slice(0,16) : '',
      recording_url:     lesson.recording_url || '',
      video_url:         lesson.video_url || '',
      content_url:       lesson.content_url || '',
      is_free_preview:   !!lesson.is_free_preview,
      homework:          lesson.homework || '',
      homework_deadline: lesson.homework_deadline ? lesson.homework_deadline.slice(0,10) : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.course_id || !form.title) {
      setFormError('Оберіть курс і введіть назву уроку');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await lessonsAPI.update(editing.id, form);
      } else {
        await lessonsAPI.create(form);
      }
      setShowModal(false);
      fetchLessons();
    } catch (err) {
      setFormError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити урок?')) return;
    try {
      await lessonsAPI.delete(id);
      fetchLessons();
    } catch { alert('Не вдалося видалити'); }
  };

  const handleSaveYt = async () => {
    if (!ytUrl) return;
    try {
      await lessonsAPI.update(ytModal.id, { ...ytModal, recording_url: ytUrl });
      setYtModal(null);
      setYtUrl('');
      fetchLessons();
    } catch { alert('Помилка збереження'); }
  };

  const handleSaveHw = async () => {
    if (!hwText) return;
    try {
      await lessonsAPI.update(hwModal.id, { ...hwModal, homework: hwText, homework_deadline: hwDeadline || null });
      setHwModal(null);
      setHwText('');
      setHwDeadline('');
      fetchLessons();
    } catch { alert('Помилка збереження'); }
  };

  // ── Фільтрація ───────────────────────────────────────────
  const tabFiltered = lessons.filter(l =>
    activeTab === 'all' ? true
    : activeTab === 'live' ? l.type === TYPE_LIVE
    : l.type === TYPE_ONLINE
  );

  const filtered = tabFiltered.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || (l.title || '').toLowerCase().includes(q)
      || (l.course?.title_uk || l.course?.title || '').toLowerCase().includes(q);
    const matchCourse = !courseFilter || String(l.course_id) === courseFilter;
    return matchQ && matchCourse;
  });

  // ── Статистика ──────────────────────────────────────────
  const stats = [
    { label: 'Всього уроків', value: lessons.length,                                  icon: '📖', bg: '#ede9fe' },
    { label: 'Живих занять',  value: lessons.filter(l => l.type === TYPE_LIVE).length, icon: '🎥', bg: '#fee2e2' },
    { label: 'Онлайн уроків', value: lessons.filter(l => l.type === TYPE_ONLINE).length, icon: '📹', bg: '#dbeafe' },
    { label: 'Заплановано',   value: lessons.filter(l => l.status === 'scheduled').length, icon: '📅', bg: '#fef9c3' },
  ];

  // ─────────────────────────────────────────────────────────
  return (
    <Layout>

      {/* Заголовок */}
      <div style={S.pageHeader}>
        <h1 style={S.title}>Уроки</h1>
        <button style={S.btn('primary')} onClick={openCreate}>
          + Новий урок
        </button>
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

      {/* Таби */}
      <div style={S.tabs}>
        {[['all','Всі'],['live','🎥 Живі заняття'],['online','📹 Онлайн курси']].map(([id,label]) => (
          <button key={id} style={S.tab(activeTab === id)} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* Фільтри */}
      <div style={S.filterRow}>
        <input style={S.input} placeholder="Пошук по назві або курсу..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select style={S.select} value={courseFilter} onChange={e => setCourse(e.target.value)}>
          <option value="">Всі курси</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title_uk || c.title}</option>
          ))}
        </select>
      </div>

      {/* Список уроків */}
      {loading ? (
        <div style={S.empty}>Завантаження...</div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>
          {search || courseFilter ? 'Нічого не знайдено' : 'Уроків ще немає. Створіть перший!'}
        </div>
      ) : (
        filtered.map(lesson => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAddVideo={l => { setYtModal(l); setYtUrl(l.recording_url || ''); }}
            onAddHomework={l => { setHwModal(l); setHwText(l.homework || ''); setHwDeadline(l.homework_deadline?.slice(0,10) || ''); }}
          />
        ))
      )}

      {/* ══ МОДАЛКА СТВОРЕННЯ/РЕДАГУВАННЯ ══════════════════ */}
      {showModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={S.modal}>
            <div style={S.modalTitle}>
              {editing ? '✏️ Редагувати урок' : '+ Новий урок'}
            </div>

            {formError && <div style={S.errorBox}>{formError}</div>}

            {/* Тип уроку */}
            <div style={S.sectionLabel}>ТИП УРОКУ</div>
            <div style={S.typeSwitch}>
              {[
                { id: TYPE_LIVE, icon: '🎥', title: 'Живе заняття', desc: 'Заняття з викладачем у реальному часі' },
                { id: TYPE_ONLINE, icon: '📹', title: 'Онлайн курс', desc: 'Готові матеріали, студент проходить самостійно' },
              ].map(t => (
                <div key={t.id} style={S.typeOption(form.type === t.id, t.id)}
                  onClick={() => setField('type', t.id)}>
                  <div style={S.typeOptionIcon}>{t.icon}</div>
                  <div style={S.typeOptionTitle(form.type === t.id, t.id)}>{t.title}</div>
                  <div style={S.typeOptionDesc}>{t.desc}</div>
                </div>
              ))}
            </div>

            <div style={S.divider} />

            {/* Основне */}
            <div style={S.sectionLabel}>ОСНОВНА ІНФОРМАЦІЯ</div>

            <label style={S.label}>Курс *</label>
            <select style={S.formSelect} value={form.course_id}
              onChange={e => setField('course_id', e.target.value)}>
              <option value="">— оберіть курс —</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title_uk || c.title}</option>
              ))}
            </select>

            <label style={S.label}>Назва уроку *</label>
            <input style={S.formInput} placeholder="Наприклад: Вступ до Python"
              value={form.title} onChange={e => setField('title', e.target.value)} />

            <label style={S.label}>Опис</label>
            <textarea style={S.formTextarea} placeholder="Що студент дізнається на цьому уроці..."
              value={form.description} onChange={e => setField('description', e.target.value)} />

            <div style={S.twoCol}>
              <div>
                <label style={S.label}>Порядковий номер</label>
                <input style={S.formInput} type="number" placeholder="1"
                  value={form.order_number} onChange={e => setField('order_number', e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Тривалість (хв)</label>
                <input style={S.formInput} type="number" placeholder="60"
                  value={form.duration_minutes} onChange={e => setField('duration_minutes', e.target.value)} />
              </div>
            </div>

            <label style={S.label}>Статус</label>
            <select style={S.formSelect} value={form.status}
              onChange={e => setField('status', e.target.value)}>
              <option value="draft">Чернетка</option>
              <option value="scheduled">Заплановано</option>
              {form.type === TYPE_LIVE && <option value="live">🔴 LIVE зараз</option>}
              <option value="completed">Проведено</option>
              <option value="published">Опубліковано</option>
            </select>

            <div style={S.divider} />

            {/* LIVE-специфіка */}
            {form.type === TYPE_LIVE && (
              <>
                <div style={S.sectionLabel}>🎥 ЖИВЕ ЗАНЯТТЯ</div>

                <label style={S.label}>Посилання на заняття (Zoom / Meet / Teams)</label>
                <input style={S.formInput} placeholder="https://meet.google.com/..."
                  value={form.meeting_link} onChange={e => setField('meeting_link', e.target.value)} />

                <label style={S.label}>Дата і час проведення</label>
                <input style={S.formInput} type="datetime-local"
                  value={form.scheduled_at} onChange={e => setField('scheduled_at', e.target.value)} />

                <label style={S.label}>Посилання на запис (YouTube) — після заняття</label>
                <input style={S.formInput} placeholder="https://youtube.com/watch?v=..."
                  value={form.recording_url} onChange={e => setField('recording_url', e.target.value)} />
              </>
            )}

            {/* ONLINE-специфіка */}
            {form.type === TYPE_ONLINE && (
              <>
                <div style={S.sectionLabel}>📹 ОНЛАЙН КОНТЕНТ</div>

                <label style={S.label}>Посилання на відео (YouTube / Vimeo)</label>
                <input style={S.formInput} placeholder="https://youtube.com/watch?v=..."
                  value={form.video_url} onChange={e => setField('video_url', e.target.value)} />

                <label style={S.label}>Матеріали уроку (Google Docs / PDF посилання)</label>
                <input style={S.formInput} placeholder="https://docs.google.com/..."
                  value={form.content_url} onChange={e => setField('content_url', e.target.value)} />

                <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14 }}>
                  <input type="checkbox" checked={form.is_free_preview}
                    onChange={e => setField('is_free_preview', e.target.checked)}
                    style={{ width: 16, height: 16 }} />
                  Безкоштовний перегляд (без запису на курс)
                </label>
              </>
            )}

            <div style={S.divider} />

            {/* Домашнє завдання */}
            <div style={S.sectionLabel}>📋 ДОМАШНЄ ЗАВДАННЯ</div>

            <label style={S.label}>Текст завдання</label>
            <textarea style={S.formTextarea} rows={3}
              placeholder="Опишіть завдання для студентів... Студенти зможуть прикріплювати файли для перевірки."
              value={form.homework} onChange={e => setField('homework', e.target.value)} />

            <label style={S.label}>Дедлайн здачі</label>
            <input style={S.formInput} type="date"
              value={form.homework_deadline} onChange={e => setField('homework_deadline', e.target.value)} />

            {/* Кнопки */}
            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setShowModal(false)}>Скасувати</button>
              <button style={S.btnSave} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Збереження...' : editing ? '💾 Зберегти' : '✨ Створити'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ МОДАЛКА YouTube ══════════════════════════════════ */}
      {ytModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setYtModal(null); }}>
          <div style={{ ...S.modal, maxWidth: 460 }}>
            <div style={S.modalTitle}>▶ Додати запис заняття</div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
              Урок: <strong>{ytModal.title}</strong>
            </p>
            <label style={S.label}>YouTube посилання</label>
            <input style={S.formInput} placeholder="https://youtube.com/watch?v=..."
              value={ytUrl} onChange={e => setYtUrl(e.target.value)} />
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: -10, marginBottom: 16 }}>
              💡 Завантаж відео на YouTube і вкажи посилання — студенти побачать його на платформі
            </p>
            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setYtModal(null)}>Скасувати</button>
              <button style={{ ...S.btnSave, background: '#ff0000' }} onClick={handleSaveYt}>
                ▶ Зберегти запис
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ МОДАЛКА Домашнє завдання ═════════════════════════ */}
      {hwModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setHwModal(null); }}>
          <div style={{ ...S.modal, maxWidth: 460 }}>
            <div style={S.modalTitle}>📋 Домашнє завдання</div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
              Урок: <strong>{hwModal.title}</strong>
            </p>
            <label style={S.label}>Текст завдання *</label>
            <textarea style={{ ...S.formTextarea, minHeight: 100 }}
              placeholder="Опишіть завдання для студентів..."
              value={hwText} onChange={e => setHwText(e.target.value)} />
            <label style={S.label}>Дедлайн здачі</label>
            <input style={S.formInput} type="date"
              value={hwDeadline} onChange={e => setHwDeadline(e.target.value)} />
            <div style={{
              background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#059669', marginBottom: 16,
            }}>
              📎 Студенти зможуть прикріплювати файли (PDF, зображення, архіви) для перевірки
            </div>
            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setHwModal(null)}>Скасувати</button>
              <button style={S.btnSave} onClick={handleSaveHw}>
                📋 Зберегти ДЗ
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default Lessons;
