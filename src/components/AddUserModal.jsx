import React, { useState } from 'react';
import { adminAPI } from '../services/api';

const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,10,30,0.45)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#5a6c7d',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: '10px 13px',
    border: '1.5px solid #e8e8ed',
    borderRadius: 10,
    fontSize: 14,
    color: '#1a1a2e',
    background: '#fafafa',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '10px 13px',
    border: '1.5px solid #e8e8ed',
    borderRadius: 10,
    fontSize: 14,
    color: '#1a1a2e',
    background: '#fafafa',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginBottom: 14,
  },
  field: {
    marginBottom: 14,
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  footer: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  btnCancel: {
    background: '#f4f5f7',
    border: 'none',
    borderRadius: 10,
    padding: '11px 22px',
    cursor: 'pointer',
    fontSize: 14,
    color: '#6b6b8a',
    fontWeight: 500,
  },
  btnSave: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '11px 26px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
};

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'student',
  status: 'active',
  access_scope: 'full',
};

// ─────────────────────────────────────────────────────────────
// Props:
//   onClose()          — закрити без збереження
//   onSaved()          — викликається після успішного збереження
//   editUser (опц.)    — якщо передано — режим редагування
// ─────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSaved, editUser = null }) {
  const [form, setForm] = useState(
    editUser
      ? { first_name: editUser.first_name, last_name: editUser.last_name,
          email: editUser.email, password: '', role: editUser.role, status: editUser.status, access_scope: editUser.instructor?.access_scope || 'full' }
      : EMPTY
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      setError("Ім'я, прізвище та email обов'язкові");
      return;
    }
    if (!editUser && !form.password) {
      setError('Пароль обов\'язковий для нового користувача');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editUser) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await adminAPI.updateUser(editUser.id, data);
      } else {
        await adminAPI.createUser(form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>

        <div style={S.title}>
          <div style={S.titleIcon}>➕</div>
          {editUser ? 'Редагувати користувача' : 'Новий користувач'}
        </div>

        {error && <div style={S.error}>{error}</div>}

        {/* Ім'я + Прізвище */}
        <div style={S.twoCol}>
          <div>
            <label style={S.label}>Ім'я *</label>
            <input value={form.first_name} onChange={e => set('first_name', e.target.value)}
              style={S.input} placeholder="Ім'я" />
          </div>
          <div>
            <label style={S.label}>Прізвище *</label>
            <input value={form.last_name} onChange={e => set('last_name', e.target.value)}
              style={S.input} placeholder="Прізвище" />
          </div>
        </div>

        {/* Email */}
        <div style={S.field}>
          <label style={S.label}>Email *</label>
          <input value={form.email} onChange={e => set('email', e.target.value)}
            style={S.input} placeholder="email@example.com" type="email" />
        </div>

        {/* Пароль */}
        <div style={S.field}>
          <label style={S.label}>
            Пароль {editUser ? '(залиш порожнім щоб не змінювати)' : '*'}
          </label>
          <input value={form.password} onChange={e => set('password', e.target.value)}
            style={S.input} placeholder="••••••••" type="password" />
        </div>

        {/* Роль + Статус */}
        <div style={S.twoCol}>
          <div>
            <label style={S.label}>Роль</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} style={S.select}>
              <option value="student">Студент</option>
              <option value="instructor">Викладач</option>
              <option value="admin">Адмін</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Статус</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} style={S.select}>
              <option value="active">Активний</option>
              <option value="inactive">Неактивний</option>
              <option value="blocked">Заблокований</option>
            </select>
          </div>
        </div>

        {/* Кнопки */}
        {form.role === 'instructor' && (
          <div style={S.field}>
            <label style={S.label}>Р РµР¶РёРј РґРѕСЃС‚СѓРїСѓ РІРёРєР»Р°РґР°С‡Р°</label>
            <select value={form.access_scope} onChange={e => set('access_scope', e.target.value)} style={S.select}>
              <option value="full">РџРѕРІРЅРёР№ РґРѕСЃС‚СѓРї РґРѕ РєСѓСЂСЃС–РІ</option>
              <option value="live_only">Р›РёС€Рµ live-Р·Р°РЅСЏС‚С‚СЏ</option>
            </select>
          </div>
        )}

        <div style={S.footer}>
          <button style={S.btnCancel} onClick={onClose}>Скасувати</button>
          <button style={S.btnSave} onClick={handleSave} disabled={saving}>
            {saving ? 'Збереження...' : editUser ? 'Зберегти зміни' : 'Створити'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddUserModal;
