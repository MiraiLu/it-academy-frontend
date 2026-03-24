import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { coursesAPI } from '../services/api';
import api from '../services/api';

// ─── API ─────────────────────────────────────────────────────
// Додай в api.js → quizzesAPI:
// getAll(params)       GET  /api/v1/quizzes
// create(data)         POST /api/v1/quizzes
// update(id, data)     PUT  /api/v1/quizzes/{id}
// delete(id)           DELETE /api/v1/quizzes/{id}
// getQuestions(quizId) GET  /api/v1/quizzes/{id}/questions
// saveQuestions(quizId, data) POST /api/v1/quizzes/{id}/questions
const quizzesAPI = {
  getAll:       (params)      => api.get('/quizzes', { params }),
  create:       (data)        => api.post('/quizzes', data),
  update:       (id, data)    => api.put(`/quizzes/${id}`, data),
  delete:       (id)          => api.delete(`/quizzes/${id}`),
  getQuestions: (id)          => api.get(`/quizzes/${id}/questions`),
  saveQuestions:(id, data)    => api.post(`/quizzes/${id}/questions`, data),
};

// ─── Константи ───────────────────────────────────────────────
const Q_TYPES = [
  { id: 'single',   label: 'Один правильний',    icon: '🔘' },
  { id: 'multiple', label: 'Кілька правильних',  icon: '☑️' },
  { id: 'boolean',  label: 'Так / Ні',            icon: '✅' },
  { id: 'text',     label: 'Відкрита відповідь',  icon: '✏️' },
];

const EMPTY_QUIZ = {
  title: '', description: '', course_id: '', lesson_id: '',
  passing_score: 70, max_attempts: 3, time_limit: '', is_published: false,
};

const EMPTY_QUESTION = {
  type: 'single', text: '', points: 1,
  options: [
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ],
  correct_text_answer: '',
};

// ─── Стилі ───────────────────────────────────────────────────
const S = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  btnPrimary: {
    background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff',
    border: 'none', borderRadius: 10, padding: '11px 22px',
    cursor: 'pointer', fontSize: 14, fontWeight: 600,
  },
  statCard: { background: '#fff', border: '1px solid #e8e8ed', borderRadius: 14, padding: 20 },
  statIcon: (bg) => ({ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }),
  statVal: { fontSize: 30, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#5a6c7d', marginTop: 6 },

  card: { background: '#fff', border: '1px solid #e8e8ed', borderRadius: 16, padding: 20, marginBottom: 12, transition: 'box-shadow 0.2s' },
  quizHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  quizTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 },
  quizMeta: { fontSize: 13, color: '#6b7280' },

  badge: (color, bg) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: bg, color, whiteSpace: 'nowrap' }),
  infoPill: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, background: '#f4f5f7', color: '#4a4a6a', marginRight: 6 },

  btnGroup: { display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  btn: (v) => ({
    padding: '7px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: v === 'primary' ? 'linear-gradient(135deg,#667eea,#764ba2)'
               : v === 'danger'  ? 'rgba(239,68,68,0.08)'
               : v === 'success' ? 'rgba(16,185,129,0.1)'
               : '#f4f5f7',
    color: v === 'primary' ? '#fff' : v === 'danger' ? '#dc2626' : v === 'success' ? '#059669' : '#4a4a6a',
  }),

  filterRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  input: { padding: '9px 14px', border: '1px solid #e8e8ed', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 200 },
  select: { padding: '9px 12px', border: '1px solid #e8e8ed', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 15 },

  // Модалка
  overlay: { position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: 20, overflowY: 'auto' },
  modal: { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 600, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', margin: '20px auto' },
  wideModal: { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 780, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', margin: '20px auto' },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6c7d', marginBottom: 5 },
  formInput: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed', borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 14, fontFamily: 'inherit' },
  formSelect: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed', borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 14, cursor: 'pointer', fontFamily: 'inherit' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  threeCol: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  modalFooter: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 },
  btnCancel: { background: '#f4f5f7', border: 'none', borderRadius: 10, padding: '11px 22px', cursor: 'pointer', fontSize: 14, color: '#6b6b8a', fontWeight: 500 },
  btnSave: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  divider: { borderTop: '1px solid #f0f0f5', margin: '18px 0' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 12 },

  // Питання
  questionCard: { border: '1.5px solid #e8e8ed', borderRadius: 14, padding: 18, marginBottom: 14, background: '#fafafa' },
  qHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  qNum: { width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  optionRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  optionInput: { flex: 1, padding: '8px 12px', border: '1.5px solid #e8e8ed', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' },
  correctDot: (active) => ({ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? '#059669' : '#e8e8ed'}`, background: active ? '#059669' : 'transparent', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }),
  correctSquare: (active) => ({ width: 20, height: 20, borderRadius: 4, border: `2px solid ${active ? '#059669' : '#e8e8ed'}`, background: active ? '#059669' : 'transparent', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }),
};

// ─────────────────────────────────────────────────────────────
// QuizCard
// ─────────────────────────────────────────────────────────────
const QuizCard = React.memo(({ quiz, onEdit, onDelete, onEditQuestions }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(prev => !prev);
  return (
    <div style={S.card}
      onClick={toggleExpanded}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleExpanded();
        }
      }}
    >
      <div style={S.quizHeader}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={S.badge(quiz.is_published ? '#059669' : '#6b7280', quiz.is_published ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)')}>
              {quiz.is_published ? '✅ Опублікований' : '📝 Чернетка'}
            </span>
          </div>
          <div style={S.quizTitle}>{quiz.title}</div>
          <div style={S.quizMeta}>
            {quiz.course?.title_uk || quiz.course?.title || `Курс #${quiz.course_id}`}
            {quiz.lesson && ` · Урок: ${quiz.lesson.title}`}
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <span style={S.infoPill}>🎯 Прохідний бал: {quiz.passing_score}%</span>
            <span style={S.infoPill}>🔄 Спроб: {quiz.max_attempts || '∞'}</span>
            {quiz.time_limit && <span style={S.infoPill}>⏱ {quiz.time_limit} хв</span>}
            {quiz.questions_count !== undefined && <span style={S.infoPill}>❓ {quiz.questions_count} питань</span>}
          </div>
        </div>
        <button
          type="button"
          aria-label={expanded ? 'Згорнути тест' : 'Розгорнути тест'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 4, pointerEvents: 'none' }}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f5' }}>
          {quiz.description && (
            <p style={{ fontSize: 14, color: '#4a4a6a', lineHeight: 1.6, marginBottom: 14 }}>{quiz.description}</p>
          )}
          <div style={S.btnGroup} onClick={(e) => e.stopPropagation()}>
            <button style={S.btn('secondary')} onClick={() => onEdit(quiz)}>✏️ Редагувати</button>
            <button style={S.btn('primary')} onClick={() => onEditQuestions(quiz)}>❓ Питання</button>
            <button style={S.btn('danger')} onClick={() => onDelete(quiz.id)}>🗑 Видалити</button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// QuestionEditor — редактор одного питання
// ─────────────────────────────────────────────────────────────
const QuestionEditor = ({ q, index, onChange, onDelete }) => {
  const setField = (key, val) => onChange({ ...q, [key]: val });
  const setOption = (i, key, val) => {
    const opts = q.options.map((o, idx) => idx === i ? { ...o, [key]: val } : o);
    onChange({ ...q, options: opts });
  };
  const toggleCorrect = (i) => {
    const opts = q.options.map((o, idx) => ({
      ...o,
      is_correct: q.type === 'multiple' ? (idx === i ? !o.is_correct : o.is_correct) : idx === i,
    }));
    onChange({ ...q, options: opts });
  };
  const addOption = () => onChange({ ...q, options: [...q.options, { text: '', is_correct: false }] });
  const removeOption = (i) => onChange({ ...q, options: q.options.filter((_, idx) => idx !== i) });

  return (
    <div style={S.questionCard}>
      <div style={S.qHeader}>
        <div style={S.qNum}>{index + 1}</div>
        <select value={q.type} onChange={e => setField('type', e.target.value)}
          style={{ ...S.formSelect, width: 'auto', marginBottom: 0, fontSize: 13 }}>
          {Q_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, color: '#5a6c7d' }}>Балів:</label>
          <input type="number" value={q.points} min={1} max={100}
            onChange={e => setField('points', +e.target.value)}
            style={{ width: 56, padding: '5px 8px', border: '1.5px solid #e8e8ed', borderRadius: 8, fontSize: 13, outline: 'none', textAlign: 'center' }} />
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#dc2626', padding: 4 }}>🗑</button>
        </div>
      </div>

      {/* Текст питання */}
      <input
        placeholder={`Питання ${index + 1}...`}
        value={q.text}
        onChange={e => setField('text', e.target.value)}
        style={{ ...S.optionInput, width: '100%', marginBottom: 12, padding: '10px 13px', fontSize: 14 }}
      />

      {/* Варіанти для single/multiple */}
      {(q.type === 'single' || q.type === 'multiple') && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.05em' }}>
            {q.type === 'single' ? '🔘 Один правильний варіант' : '☑️ Можна обрати кілька'}
          </div>
          {q.options.map((opt, i) => (
            <div key={i} style={S.optionRow}>
              <div
                style={q.type === 'single' ? S.correctDot(opt.is_correct) : S.correctSquare(opt.is_correct)}
                onClick={() => toggleCorrect(i)}
                title="Правильна відповідь"
              />
              <input
                placeholder={`Варіант ${i + 1}`}
                value={opt.text}
                onChange={e => setOption(i, 'text', e.target.value)}
                style={S.optionInput}
              />
              {q.options.length > 2 && (
                <button onClick={() => removeOption(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: '0 4px' }}>×</button>
              )}
            </div>
          ))}
          {q.options.length < 6 && (
            <button onClick={addOption} style={{ ...S.btn('secondary'), fontSize: 12, marginTop: 4 }}>
              + Додати варіант
            </button>
          )}
        </>
      )}

      {/* Так/Ні */}
      {q.type === 'boolean' && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>✅ Правильна відповідь</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['true', 'false'].map(val => (
              <div key={val}
                onClick={() => setField('correct_boolean', val)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${q.correct_boolean === val ? (val === 'true' ? '#059669' : '#dc2626') : '#e8e8ed'}`,
                  background: q.correct_boolean === val ? (val === 'true' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)') : '#fff',
                  fontWeight: 600, fontSize: 15,
                  color: q.correct_boolean === val ? (val === 'true' ? '#059669' : '#dc2626') : '#4a4a6a',
                  transition: 'all 0.15s',
                }}>
                {val === 'true' ? '✅ Так' : '❌ Ні'}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Відкрита відповідь */}
      {q.type === 'text' && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>✏️ Зразкова правильна відповідь (для порівняння)</div>
          <input
            placeholder="Введіть еталонну відповідь..."
            value={q.correct_text_answer}
            onChange={e => setField('correct_text_answer', e.target.value)}
            style={{ ...S.optionInput, width: '100%', padding: '10px 13px' }}
          />
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            ℹ️ Відповідь студента перевіряється викладачем вручну
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ГОЛОВНИЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────
function Quizzes() {
  const [quizzes, setQuizzes]     = useState([]);
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [courseFilter, setCourse] = useState('');

  // Модалка тесту
  const [showQuiz, setShowQuiz]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_QUIZ);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  // Модалка питань
  const [showQEditor, setShowQEditor] = useState(false);
  const [activeQuiz, setActiveQuiz]   = useState(null);
  const [questions, setQuestions]     = useState([]);
  const [qSaving, setQSaving]         = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizzesAPI.getAll({ per_page: 100 });
      setQuizzes(res.data?.data?.data || res.data?.data || []);
    } catch { setQuizzes([]); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ per_page: 200 });
      setCourses(res.data?.data?.data || res.data?.data || []);
    } catch { /* тихо */ }
  };

  const setField = useCallback((key, val) => setForm(p => ({ ...p, [key]: val })), []);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY_QUIZ); setFormError(''); setShowQuiz(true);
  };
  const openEdit = (quiz) => {
    setEditing(quiz);
    setForm({ title: quiz.title || '', description: quiz.description || '', course_id: quiz.course_id || '', lesson_id: quiz.lesson_id || '', passing_score: quiz.passing_score ?? 70, max_attempts: quiz.max_attempts ?? 3, time_limit: quiz.time_limit || '', is_published: !!quiz.is_published });
    setFormError(''); setShowQuiz(true);
  };

  const handleSaveQuiz = async () => {
    if (!form.course_id || !form.title) { setFormError('Оберіть курс і введіть назву'); return; }
    setSaving(true); setFormError('');
    try {
      if (editing) await quizzesAPI.update(editing.id, form);
      else await quizzesAPI.create(form);
      setShowQuiz(false);
      fetchQuizzes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Помилка збереження');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити тест?')) return;
    try { await quizzesAPI.delete(id); fetchQuizzes(); }
    catch { alert('Не вдалося видалити'); }
  };

  // Відкрити редактор питань
  const openQEditor = async (quiz) => {
    setActiveQuiz(quiz);
    try {
      const res = await quizzesAPI.getQuestions(quiz.id);
      const qs = res.data?.data || res.data || [];
      setQuestions(qs.length > 0 ? qs : [{ ...EMPTY_QUESTION }]);
    } catch {
      setQuestions([{ ...EMPTY_QUESTION }]);
    }
    setShowQEditor(true);
  };

  const addQuestion = () => setQuestions(qs => [...qs, { ...EMPTY_QUESTION }]);
  const updateQuestion = (i, q) => setQuestions(qs => qs.map((old, idx) => idx === i ? q : old));
  const deleteQuestion = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const saveQuestions = async () => {
    setQSaving(true);
    try {
      await quizzesAPI.saveQuestions(activeQuiz.id, { questions });
      setShowQEditor(false);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Помилка збереження питань');
    } finally { setQSaving(false); }
  };

  // Підрахунок балів
  const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0);

  // Фільтрація
  const filtered = quizzes.filter(q => {
    const name = (q.title || '').toLowerCase();
    const matchQ = !search || name.includes(search.toLowerCase());
    const matchC = !courseFilter || String(q.course_id) === courseFilter;
    return matchQ && matchC;
  });

  const stats = [
    { label: 'Всього тестів',  value: quizzes.length,                                         icon: '📝', bg: '#ede9fe' },
    { label: 'Опублікованих',  value: quizzes.filter(q => q.is_published).length,              icon: '✅', bg: '#dcfce7' },
    { label: 'Чернеток',       value: quizzes.filter(q => !q.is_published).length,             icon: '📋', bg: '#fef9c3' },
    { label: 'Середній бал',   value: quizzes.length ? Math.round(quizzes.reduce((s, q) => s + (q.passing_score || 0), 0) / quizzes.length) + '%' : '—', icon: '🎯', bg: '#dbeafe' },
  ];

  return (
    <Layout>

      <div style={S.pageHeader}>
        <h1 style={S.title}>Тести</h1>
        <button style={S.btnPrimary} onClick={openCreate}>+ Новий тест</button>
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
        <input style={S.input} placeholder="Пошук по назві..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select style={S.select} value={courseFilter} onChange={e => setCourse(e.target.value)}>
          <option value="">Всі курси</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title_uk || c.title}</option>)}
        </select>
      </div>

      {/* Список тестів */}
      {loading ? (
        <div style={S.empty}>Завантаження...</div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>{search ? 'Нічого не знайдено' : 'Тестів ще немає. Створіть перший!'}</div>
      ) : (
        filtered.map(quiz => (
          <QuizCard key={quiz.id} quiz={quiz}
            onEdit={openEdit} onDelete={handleDelete} onEditQuestions={openQEditor} />
        ))
      )}

      {/* ══ МОДАЛКА: Створення/Редагування тесту ═══════════ */}
      {showQuiz && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowQuiz(false); }}>
          <div style={S.modal}>
            <div style={S.modalTitle}>{editing ? '✏️ Редагувати тест' : '+ Новий тест'}</div>
            {formError && <div style={S.errorBox}>{formError}</div>}

            <div style={S.sectionLabel}>ОСНОВНА ІНФОРМАЦІЯ</div>

            <label style={S.label}>Курс *</label>
            <select style={S.formSelect} value={form.course_id} onChange={e => setField('course_id', e.target.value)}>
              <option value="">— оберіть курс —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title_uk || c.title}</option>)}
            </select>

            <label style={S.label}>Назва тесту *</label>
            <input style={S.formInput} placeholder="Наприклад: Тест після уроку 1"
              value={form.title} onChange={e => setField('title', e.target.value)} />

            <label style={S.label}>Опис</label>
            <input style={S.formInput} placeholder="Коротко про що тест..."
              value={form.description} onChange={e => setField('description', e.target.value)} />

            <div style={S.divider} />
            <div style={S.sectionLabel}>НАЛАШТУВАННЯ</div>

            <div style={S.threeCol}>
              <div>
                <label style={S.label}>Прохідний бал (%)</label>
                <input style={S.formInput} type="number" min={0} max={100} placeholder="70"
                  value={form.passing_score} onChange={e => setField('passing_score', +e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Кількість спроб</label>
                <input style={S.formInput} type="number" min={1} placeholder="3"
                  value={form.max_attempts} onChange={e => setField('max_attempts', +e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Обмеження часу (хв)</label>
                <input style={S.formInput} type="number" min={1} placeholder="без обмежень"
                  value={form.time_limit} onChange={e => setField('time_limit', e.target.value)} />
              </div>
            </div>

            {/* Пояснення */}
            <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1d4ed8', marginBottom: 14 }}>
              🎯 Прохідний бал {form.passing_score}% · {form.max_attempts} спроб{form.time_limit ? ` · ${form.time_limit} хв` : ' · без обмежень часу'}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 14, color: '#4a4a6a', fontWeight: 500 }}>
              <input type="checkbox" checked={form.is_published} onChange={e => setField('is_published', e.target.checked)} style={{ width: 16, height: 16 }} />
              Опублікувати тест (студенти зможуть його проходити)
            </label>

            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setShowQuiz(false)}>Скасувати</button>
              <button style={S.btnSave} onClick={handleSaveQuiz} disabled={saving}>
                {saving ? 'Збереження...' : editing ? '💾 Зберегти' : '✨ Створити'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ МОДАЛКА: Редактор питань ═════════════════════════ */}
      {showQEditor && activeQuiz && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowQEditor(false); }}>
          <div style={S.wideModal}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={S.modalTitle}>❓ Питання: {activeQuiz.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                {questions.length} питань · {totalPoints} балів
              </div>
            </div>

            {/* Список питань */}
            {questions.map((q, i) => (
              <QuestionEditor key={i} q={q} index={i}
                onChange={(updated) => updateQuestion(i, updated)}
                onDelete={() => deleteQuestion(i)} />
            ))}

            <button onClick={addQuestion} style={{ ...S.btn('secondary'), width: '100%', padding: '12px', fontSize: 14, marginBottom: 20, borderRadius: 12, border: '2px dashed #e8e8ed' }}>
              + Додати питання
            </button>

            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setShowQEditor(false)}>Скасувати</button>
              <button style={S.btnSave} onClick={saveQuestions} disabled={qSaving}>
                {qSaving ? 'Збереження...' : `💾 Зберегти (${questions.length} питань)`}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default Quizzes;
