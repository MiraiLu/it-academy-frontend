import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import api from '../services/api';

// ============ Компоненти поза функцією (щоб не губився фокус) ============
const Field = ({ label, required, value, onChange, type = 'text', error }) => (
  <div style={{ marginBottom: '4px' }}>
    <label style={S.label}>{label}{required && ' *'}</label>
    <input
      type={type} required={required} value={value} onChange={onChange}
      style={{ ...S.input, borderColor: error ? '#e53e3e' : 'rgba(102,126,234,0.3)' }}
    />
    {error && <div style={S.err}>{error[0]}</div>}
  </div>
);

const TextArea = ({ label, required, value, onChange, error }) => (
  <div style={{ marginBottom: '4px' }}>
    <label style={S.label}>{label}{required && ' *'}</label>
    <textarea
      required={required} value={value} onChange={onChange}
      style={{ ...S.textarea, borderColor: error ? '#e53e3e' : 'rgba(102,126,234,0.3)' }}
    />
    {error && <div style={S.err}>{error[0]}</div>}
  </div>
);

// ============ STYLES ============
const S = {
  page: { minHeight: '100vh', padding: '32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  btnPrimary: {
    background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none',
    borderRadius: '50px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px',
    fontWeight: '600', boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
  },
  search: {
    width: '100%', padding: '14px 20px', borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)', fontSize: '14px', marginBottom: '28px',
    boxSizing: 'border-box', outline: 'none', color: '#1a1a2e',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' },
  card: {
    background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '20px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  },
  badge: (ok) => ({
    display: 'inline-block',
    background: ok ? 'linear-gradient(135deg,#43e97b,#38f9d7)' : 'linear-gradient(135deg,#f6d365,#fda085)',
    color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
  }),
  empty: {
    textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.4)',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,10,40,0.4)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: '24px', padding: '36px', width: '560px',
    maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
  },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a4a6a' },
  input: {
    width: '100%', padding: '10px 16px', borderRadius: '12px',
    border: '1px solid rgba(102,126,234,0.3)', background: 'rgba(255,255,255,0.6)',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1a1a2e', marginBottom: '12px',
  },
  textarea: {
    width: '100%', padding: '10px 16px', borderRadius: '12px',
    border: '1px solid rgba(102,126,234,0.3)', background: 'rgba(255,255,255,0.6)',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1a1a2e',
    minHeight: '90px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '12px',
  },
  select: {
    width: '100%', padding: '10px 16px', borderRadius: '12px',
    border: '1px solid rgba(102,126,234,0.3)', background: 'rgba(255,255,255,0.6)',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1a1a2e', marginBottom: '16px',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' },
  divider: {
    fontSize: '12px', fontWeight: '700', color: '#667eea', textTransform: 'uppercase',
    letterSpacing: '1px', margin: '12px 0', borderBottom: '1px solid rgba(102,126,234,0.2)', paddingBottom: '6px',
  },
  langTab: (active) => ({
    padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600',
    background: active ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.4)',
    color: active ? 'white' : '#4a4a6a',
  }),
  btnCancel: {
    padding: '12px 24px', borderRadius: '50px', border: '1px solid rgba(102,126,234,0.3)',
    background: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', color: '#4a4a6a',
  },
  btnSubmit: {
    padding: '12px 28px', borderRadius: '50px', border: 'none',
    background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
  },
  price: {
    fontWeight: '700', fontSize: '18px',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  btnEdit: {
    background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: '10px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px',
  },
  btnDel: {
    background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: '10px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', color: '#e53e3e',
  },
  err: { color: '#e53e3e', fontSize: '12px', marginBottom: '8px' },
};

const EMPTY = {
  title: '', title_uk: '', description: '', description_uk: '',
  short_description: '', short_description_uk: '',
  category_id: '', level: 'beginner', language: 'uk', price: '0', is_published: false,
};

const LVL = { beginner: 'Початківець', intermediate: 'Середній', advanced: 'Просунутий' };

// ============ ГОЛОВНИЙ КОМПОНЕНТ ============
export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formLang, setFormLang] = useState('uk');

  useEffect(() => { load(); loadCats(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const r = await coursesAPI.getAll(search ? { search } : {});
      if (r.data.success) setCourses(r.data.data.data || []);
    } finally { setLoading(false); }
  };

  const loadCats = async () => {
    try {
      const r = await coursesAPI.getCategories();
      if (r.data.success) setCategories(r.data.data || []);
    } catch {}
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setChk = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.checked }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setFormLang('uk'); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ title: c.title||'', title_uk: c.title_uk||'', description: c.description||'',
      description_uk: c.description_uk||'', short_description: c.short_description||'',
      short_description_uk: c.short_description_uk||'', category_id: c.category_id||'',
      level: c.level||'beginner', language: c.language||'uk', price: c.price||'0', is_published: c.is_published||false });
    setErrors({}); setFormLang('uk'); setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({});
    try {
      const payload = { ...form,
        slug: form.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now(),
        price: parseFloat(form.price)||0,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      };
      if (editing) await api.put(`/instructor/courses/${editing.id}`, payload);
      else await api.post('/instructor/courses', payload);
      setShowModal(false); load();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else alert(err.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Видалити курс?')) return;
    try { await api.delete(`/instructor/courses/${id}`); load(); } catch { alert('Помилка'); }
  };

  const isUk = formLang === 'uk';

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>📚 Курси</h1>
        <button style={S.btnPrimary} onClick={openCreate}>+ Створити курс</button>
      </div>

      <input style={S.search} placeholder="🔍  Пошук курсів..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && load()} />

      {loading ? (
        <div style={S.empty}><p>⏳ Завантаження...</p></div>
      ) : courses.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: '60px' }}>📚</div>
          <p style={{ color: '#4a4a6a' }}>Курсів ще немає. Створіть перший!</p>
        </div>
      ) : (
        <div style={S.grid}>
          {courses.map(c => (
            <div key={c.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={S.badge(c.is_published)}>{c.is_published ? '✓ Опубліковано' : '✎ Чернетка'}</span>
                <span style={{ fontSize: '11px', color: '#8888aa', background: 'rgba(255,255,255,0.4)', padding: '3px 10px', borderRadius: '20px' }}>
                  {LVL[c.level]}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' }}>
                {c.title_uk || c.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#4a4a6a', margin: '0 0 16px', lineHeight: '1.5' }}>
                {c.short_description_uk || c.short_description || 'Без опису'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={S.price}>{parseFloat(c.price) > 0 ? `${c.price} грн` : 'Безкоштовно'}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={S.btnEdit} onClick={() => openEdit(c)}>✏️</button>
                  <button style={S.btnDel} onClick={() => del(c.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modal}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 20px' }}>
              {editing ? '✏️ Редагувати курс' : '✨ Новий курс'}
            </h2>
            <form onSubmit={submit}>

              {/* Перемикач мови контенту */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', color: '#4a4a6a', fontWeight: '600' }}>КОНТЕНТ:</span>
                {['uk','en'].map(l => (
                  <button key={l} type="button" style={S.langTab(formLang===l)} onClick={() => setFormLang(l)}>
                    {l === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
                  </button>
                ))}
                <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '4px' }}>
                  (заповніть обидві мови)
                </span>
              </div>

              {/* Поля контенту — UA або EN */}
              {isUk ? (
                <>
                  <Field label="Назва курсу (UA)" required value={form.title_uk} onChange={set('title_uk')} error={errors.title_uk} />
                  <TextArea label="Повний опис (UA)" required value={form.description_uk} onChange={set('description_uk')} error={errors.description_uk} />
                  <Field label="Короткий опис (UA)" value={form.short_description_uk} onChange={set('short_description_uk')} error={errors.short_description_uk} />
                </>
              ) : (
                <>
                  <Field label="Course title (EN)" required value={form.title} onChange={set('title')} error={errors.title} />
                  <TextArea label="Full description (EN)" required value={form.description} onChange={set('description')} error={errors.description} />
                  <Field label="Short description (EN)" value={form.short_description} onChange={set('short_description')} error={errors.short_description} />
                </>
              )}

              <div style={S.divider}>Налаштування</div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Категорія *</label>
                  <select value={form.category_id} onChange={set('category_id')} style={S.select}>
                    <option value="">Оберіть...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_uk || cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Рівень *</label>
                  <select value={form.level} onChange={set('level')} style={S.select}>
                    <option value="beginner">Початківець</option>
                    <option value="intermediate">Середній</option>
                    <option value="advanced">Просунутий</option>
                  </select>
                </div>
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Мова викладання *</label>
                  <select value={form.language} onChange={set('language')} style={S.select}>
                    <option value="uk">🇺🇦 Українська</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="pl">🇵🇱 Polski</option>
                  </select>
                </div>
                <Field label="Ціна (грн) *" type="number" required value={form.price} onChange={set('price')} error={errors.price} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_published} onChange={setChk('is_published')} style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', color: '#4a4a6a', fontWeight: '500' }}>Опублікувати курс</span>
              </label>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" style={S.btnCancel} onClick={() => setShowModal(false)}>Скасувати</button>
                <button type="submit" style={S.btnSubmit} disabled={saving}>
                  {saving ? '⏳...' : editing ? '💾 Зберегти' : '✨ Створити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
