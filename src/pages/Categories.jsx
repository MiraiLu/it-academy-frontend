import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const categoriesAPI = {
  getAll:  (params)    => api.get('/categories', { params }),
  create:  (data)      => api.post('/admin/categories', data),
  update:  (id, data)  => api.put(`/admin/categories/${id}`, data),
  delete:  (id)        => api.delete(`/admin/categories/${id}`),
};

const ICONS = ['💻','📱','🎨','📊','🔒','🤖','🌐','📝','🎓','📐','⚙️','🧪','🎮','📷','🎵','🌍','💡','🔬','📈','🏗️'];
const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#f97316','#84cc16'];

const S = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  btnPrimary: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 24 },
  catCard: (color) => ({
    background: '#fff', border: '1px solid #e8e8ed', borderRadius: 16,
    padding: 20, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
  }),
  catAccent: (color) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color, borderRadius: '16px 16px 0 0' }),
  catIcon: (color) => ({ width: 52, height: 52, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14 }),
  catName: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 },
  catSlug: { fontSize: 12, color: '#94a3b8', marginBottom: 10, fontFamily: 'monospace' },
  catCount: { fontSize: 13, color: '#5a6c7d' },
  catActions: { display: 'flex', gap: 8, marginTop: 14 },
  btn: (v) => ({
    padding: '6px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: v === 'edit' ? '#f4f5f7' : 'rgba(239,68,68,0.08)',
    color: v === 'edit' ? '#4a4a6a' : '#dc2626',
  }),
  empty: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 15 },
  filterRow: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { padding: '9px 14px', border: '1px solid #e8e8ed', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', flex: 1 },
  // Модалка
  overlay: { position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: 20, overflowY: 'auto' },
  modal: { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', margin: '20px auto' },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6c7d', marginBottom: 5 },
  formInput: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed', borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 14, fontFamily: 'inherit' },
  formTextarea: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e8ed', borderRadius: 10, fontSize: 14, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 14, resize: 'vertical', minHeight: 70, fontFamily: 'inherit' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  modalFooter: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  btnCancel: { background: '#f4f5f7', border: 'none', borderRadius: 10, padding: '11px 22px', cursor: 'pointer', fontSize: 14, color: '#6b6b8a', fontWeight: 500 },
  btnSave: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  divider: { borderTop: '1px solid #f0f0f5', margin: '16px 0' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 10 },
  iconGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  iconBtn: (active) => ({ width: 40, height: 40, borderRadius: 10, border: active ? '2px solid #667eea' : '1.5px solid #e8e8ed', background: active ? '#ede9fe' : '#fafafa', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }),
  colorGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  colorBtn: (active, color) => ({ width: 32, height: 32, borderRadius: 8, background: color, cursor: 'pointer', border: active ? '3px solid #1a1a2e' : '2px solid transparent', transition: 'all 0.15s' }),
  // Превью
  preview: { border: '1.5px solid #e8e8ed', borderRadius: 14, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, background: '#fafafa' },
};

const EMPTY_FORM = { name: '', name_uk: '', slug: '', description: '', icon: '💻', color: '#6366f1', is_active: true };

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.getAll({ per_page: 100 });
      setCategories(res.data?.data || res.data || []);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  };

  const setField = useCallback((k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // Авто-slug з name
      if (k === 'name' && !editing) {
        next.slug = v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      return next;
    });
  }, [editing]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name || '', name_uk: c.name_uk || '', slug: c.slug || '', description: c.description || '', icon: c.icon || '💻', color: c.color || '#6366f1', is_active: c.is_active !== false });
    setFormError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name_uk && !form.name) { setFormError('Введіть назву категорії'); return; }
    setSaving(true); setFormError('');
    const payload = { ...form, name: form.name || form.name_uk };
    try {
      if (editing) await categoriesAPI.update(editing.id, payload);
      else await categoriesAPI.create(payload);
      setShowModal(false); fetchAll();
    } catch (err) { setFormError(err.response?.data?.message || 'Помилка збереження'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити категорію? Курси в ній залишаться без категорії.')) return;
    try { await categoriesAPI.delete(id); fetchAll(); }
    catch { alert('Не вдалося видалити'); }
  };

  const filtered = categories.filter(c => {
    const q = search.toLowerCase();
    return !q || (c.name_uk || c.name || '').toLowerCase().includes(q);
  });

  return (
    <Layout>
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.title}>Категорії</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            {categories.length} категорій · організовують курси за напрямками
          </p>
        </div>
        <button style={S.btnPrimary} onClick={openCreate}>+ Нова категорія</button>
      </div>

      <div style={S.filterRow}>
        <input style={S.input} placeholder="Пошук категорій..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={S.empty}>Завантаження...</div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>{search ? 'Нічого не знайдено' : 'Категорій ще немає. Створіть першу!'}</div>
      ) : (
        <div style={S.grid}>
          {filtered.map(cat => (
            <div key={cat.id} style={S.catCard(cat.color || '#6366f1')}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={S.catAccent(cat.color || '#6366f1')} />
              <div style={S.catIcon(cat.color || '#6366f1')}>{cat.icon || '📚'}</div>
              <div style={S.catName}>{cat.name_uk || cat.name}</div>
              {cat.name && cat.name !== cat.name_uk && (
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{cat.name}</div>
              )}
              <div style={S.catSlug}>/{cat.slug}</div>
              <div style={S.catCount}>
                📚 {cat.courses_count ?? 0} курсів
                {cat.is_active === false && <span style={{ color: '#dc2626', marginLeft: 8 }}>· Неактивна</span>}
              </div>
              {cat.description && (
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8, lineHeight: 1.5 }}>
                  {cat.description.slice(0, 80)}{cat.description.length > 80 ? '...' : ''}
                </p>
              )}
              <div style={S.catActions}>
                <button style={S.btn('edit')} onClick={() => openEdit(cat)}>✏️ Редагувати</button>
                <button style={S.btn('delete')} onClick={() => handleDelete(cat.id)}>🗑 Видалити</button>
              </div>
            </div>
          ))}

          {/* Кнопка додати */}
          <div
            onClick={openCreate}
            style={{ border: '2px dashed #e8e8ed', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', gap: 8, minHeight: 180, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.color = '#667eea'; e.currentTarget.style.background = 'rgba(102,126,234,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8ed'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 32 }}>+</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Нова категорія</span>
          </div>
        </div>
      )}

      {/* ══ МОДАЛКА ══════════════════════════════════════════ */}
      {showModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={S.modal}>
            <div style={S.modalTitle}>{editing ? '✏️ Редагувати категорію' : '+ Нова категорія'}</div>
            {formError && <div style={S.errorBox}>{formError}</div>}

            {/* Превью */}
            <div style={S.preview}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: form.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {form.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{form.name_uk || 'Назва категорії'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>/{form.slug || 'slug'}</div>
              </div>
              <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: form.color, flexShrink: 0 }} />
            </div>

            {/* Назви */}
            <div style={S.twoCol}>
              <div>
                <label style={S.label}>Назва (UA) *</label>
                <input style={S.formInput} placeholder="Веб-розробка"
                  value={form.name_uk} onChange={e => setField('name_uk', e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Name (EN)</label>
                <input style={S.formInput} placeholder="Web Development"
                  value={form.name} onChange={e => setField('name', e.target.value)} />
              </div>
            </div>

            <label style={S.label}>Slug (URL)</label>
            <input style={S.formInput} placeholder="web-development"
              value={form.slug} onChange={e => setField('slug', e.target.value)} />

            <label style={S.label}>Опис</label>
            <textarea style={S.formTextarea} placeholder="Короткий опис категорії..."
              value={form.description} onChange={e => setField('description', e.target.value)} />

            <div style={S.divider} />

            {/* Іконка */}
            <div style={S.sectionLabel}>ІКОНКА</div>
            <div style={S.iconGrid}>
              {ICONS.map(icon => (
                <button key={icon} style={S.iconBtn(form.icon === icon)} onClick={() => setField('icon', icon)}>
                  {icon}
                </button>
              ))}
            </div>

            {/* Колір */}
            <div style={S.sectionLabel}>КОЛІР</div>
            <div style={S.colorGrid}>
              {COLORS.map(color => (
                <div key={color} style={S.colorBtn(form.color === color, color)}
                  onClick={() => setField('color', color)} />
              ))}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 14, color: '#4a4a6a', fontWeight: 500 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} style={{ width: 16, height: 16 }} />
              Активна категорія (відображається студентам)
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
    </Layout>
  );
}

export default Categories;
