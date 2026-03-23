import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────
// YouTubeUploader — компонент для завантаження відео на YouTube
// Використання:
//   <YouTubeUploader lessonId={lesson.id} onUploaded={(url) => ...} />
// ─────────────────────────────────────────────────────────────

const youtubeAPI = {
  getStatus:   ()           => api.get('/youtube/status'),
  getAuthUrl:  ()           => api.get('/youtube/auth-url'),
  disconnect:  ()           => api.delete('/youtube/disconnect'),
  upload:      (formData, onProgress) => api.post('/youtube/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
    timeout: 0, // без таймауту для великих файлів
  }),
};

const S = {
  wrap: { border: '1.5px solid #e8e8ed', borderRadius: 14, overflow: 'hidden', background: '#fff' },
  header: { padding: '14px 18px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', gap: 10 },
  ytLogo: { fontSize: 22 },
  headerTitle: { fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  headerSub: { fontSize: 12, color: '#94a3b8' },
  body: { padding: '18px' },

  // Статус підключення
  connectedBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: 12, fontWeight: 600 },
  disconnectedBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(107,114,128,0.1)', color: '#6b7280', fontSize: 12, fontWeight: 600 },

  btnConnect: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#ff0000', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginTop: 12 },
  btnDisconnect: { padding: '6px 14px', background: 'none', border: '1px solid #e8e8ed', color: '#6b7280', borderRadius: 8, cursor: 'pointer', fontSize: 12, marginLeft: 10 },

  // Дропзона
  dropzone: (dragging) => ({
    border: `2px dashed ${dragging ? '#667eea' : '#e8e8ed'}`,
    borderRadius: 12, padding: '32px 20px', textAlign: 'center',
    background: dragging ? 'rgba(102,126,234,0.04)' : '#fafafa',
    cursor: 'pointer', transition: 'all 0.2s', marginTop: 16,
  }),
  dropIcon: { fontSize: 40, marginBottom: 10 },
  dropTitle: { fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 },
  dropSub: { fontSize: 13, color: '#94a3b8' },

  // Форма
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6c7d', marginBottom: 5 },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8ed', borderRadius: 8, fontSize: 13, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' },
  select: { width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8ed', borderRadius: 8, fontSize: 13, color: '#1a1a2e', background: '#fafafa', outline: 'none', boxSizing: 'border-box', marginBottom: 12, cursor: 'pointer', fontFamily: 'inherit' },

  // Прогрес
  progressWrap: { background: '#f0f0f5', borderRadius: 6, height: 8, overflow: 'hidden', marginTop: 12 },
  progressBar: (pct) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 6, transition: 'width 0.3s' }),

  // Файл вибраний
  fileCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f4f5f7', borderRadius: 10, marginTop: 12 },
  fileName: { flex: 1, fontSize: 13, fontWeight: 500, color: '#1a1a2e' },
  fileSize: { fontSize: 12, color: '#94a3b8' },

  btnUpload: { width: '100%', padding: '12px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginTop: 12 },
  btnUploadDisabled: { opacity: 0.6, cursor: 'not-allowed' },

  // Успіх
  successBox: { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '14px 16px', marginTop: 12 },
  successTitle: { fontSize: 14, fontWeight: 600, color: '#059669', marginBottom: 6 },
  successLink: { fontSize: 13, color: '#5a4fcf', wordBreak: 'break-all' },

  errorBox: { background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginTop: 12, fontSize: 13, color: '#dc2626' },
};

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function YouTubeUploader({ lessonId, lessonTitle, onUploaded }) {
  const [connected, setConnected]   = useState(false);
  const [checking, setChecking]     = useState(true);
  const [dragging, setDragging]     = useState(false);
  const [file, setFile]             = useState(null);
  const [title, setTitle]           = useState(lessonTitle || '');
  const [description, setDesc]      = useState('');
  const [privacy, setPrivacy]       = useState('unlisted');
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [result, setResult]         = useState(null); // {url, video_id}
  const [error, setError]           = useState('');
  const fileRef = useRef();

  // Перевіряємо статус підключення
  useEffect(() => {
    checkStatus();

    // Слухаємо повернення після OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('youtube') === 'connected') {
      checkStatus();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await youtubeAPI.getStatus();
      setConnected(res.data.connected);
    } catch { setConnected(false); }
    finally { setChecking(false); }
  };

  const handleConnect = async () => {
    try {
      const res = await youtubeAPI.getAuthUrl();
      window.location.href = res.data.auth_url;
    } catch { setError('Не вдалося отримати посилання авторизації'); }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Відключити YouTube канал?')) return;
    await youtubeAPI.disconnect();
    setConnected(false);
    setResult(null);
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('Оберіть відеофайл (mp4, mov, avi...)'); return; }
    if (f.size > 2 * 1024 * 1024 * 1024) { setError('Файл більше 2GB'); return; }
    setFile(f);
    setError('');
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !title) { setError('Оберіть файл і вкажіть назву'); return; }
    setUploading(true); setProgress(0); setError(''); setResult(null);

    const fd = new FormData();
    fd.append('video', file);
    fd.append('title', title);
    fd.append('description', description);
    fd.append('privacy', privacy);
    if (lessonId) fd.append('lesson_id', lessonId);

    try {
      const res = await youtubeAPI.upload(fd, setProgress);
      setResult({ url: res.data.video_url, id: res.data.video_id });
      if (onUploaded) onUploaded(res.data.video_url);
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка завантаження');
    } finally {
      setUploading(false);
    }
  };

  if (checking) return (
    <div style={{ ...S.wrap, padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
      Перевірка підключення YouTube...
    </div>
  );

  return (
    <div style={S.wrap}>
      {/* Заголовок */}
      <div style={S.header}>
        <span style={S.ytLogo}>▶️</span>
        <div style={{ flex: 1 }}>
          <div style={S.headerTitle}>Завантаження на YouTube</div>
          <div style={S.headerSub}>Відео з'явиться на твоєму YouTube каналі автоматично</div>
        </div>
        {connected && (
          <span style={S.connectedBadge}>● Підключено</span>
        )}
      </div>

      <div style={S.body}>
        {/* НЕ підключено */}
        {!connected && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={S.disconnectedBadge}>○ YouTube не підключено</div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '12px 0', lineHeight: 1.6 }}>
              Підключи свій YouTube канал один раз — і зможеш завантажувати відео прямо з платформи без переходу в YouTube Studio.
            </p>
            <button style={S.btnConnect} onClick={handleConnect}>
              <span>▶</span> Підключити YouTube канал
            </button>
          </div>
        )}

        {/* Підключено — форма завантаження */}
        {connected && !result && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={S.connectedBadge}>● YouTube підключено</span>
              <button style={S.btnDisconnect} onClick={handleDisconnect}>Відключити</button>
            </div>

            {/* Дропзона */}
            {!file ? (
              <div
                style={S.dropzone(dragging)}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div style={S.dropIcon}>🎬</div>
                <div style={S.dropTitle}>Перетягни відео сюди</div>
                <div style={S.dropSub}>або клікни щоб обрати файл · MP4, MOV, AVI, MKV · до 2GB</div>
                <input ref={fileRef} type="file" accept="video/*" hidden onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div style={S.fileCard}>
                <span style={{ fontSize: 28 }}>🎬</span>
                <div style={{ flex: 1 }}>
                  <div style={S.fileName}>{file.name}</div>
                  <div style={S.fileSize}>{formatBytes(file.size)}</div>
                </div>
                <button onClick={() => setFile(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
              </div>
            )}

            {/* Поля */}
            {file && (
              <div style={{ marginTop: 14 }}>
                <label style={S.label}>Назва відео *</label>
                <input style={S.input} value={title}
                  onChange={e => setTitle(e.target.value)} placeholder="Назва відео на YouTube" />

                <label style={S.label}>Опис</label>
                <input style={S.input} value={description}
                  onChange={e => setDesc(e.target.value)} placeholder="Короткий опис відео..." />

                <label style={S.label}>Видимість</label>
                <select style={S.select} value={privacy} onChange={e => setPrivacy(e.target.value)}>
                  <option value="unlisted">🔗 За посиланням (рекомендовано для курсів)</option>
                  <option value="public">🌍 Публічне</option>
                  <option value="private">🔒 Приватне</option>
                </select>
              </div>
            )}

            {/* Прогрес */}
            {uploading && (
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5a6c7d', marginBottom: 6 }}>
                  <span>Завантаження на YouTube...</span>
                  <span style={{ fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={S.progressWrap}>
                  <div style={S.progressBar(progress)} />
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>
                  ⏳ Не закривай сторінку — відео завантажується
                </div>
              </div>
            )}

            {/* Кнопка завантаження */}
            {file && !uploading && (
              <button
                style={{ ...S.btnUpload, ...((!file || !title) ? S.btnUploadDisabled : {}) }}
                onClick={handleUpload}
                disabled={!file || !title || uploading}
              >
                ▶ Завантажити на YouTube
              </button>
            )}
          </>
        )}

        {/* Успіх */}
        {result && (
          <div style={S.successBox}>
            <div style={S.successTitle}>✅ Відео успішно завантажено!</div>
            <div style={{ fontSize: 13, color: '#4a4a6a', marginBottom: 8 }}>
              Посилання збережено в уроці автоматично.
            </div>
            <a href={result.url} target="_blank" rel="noreferrer" style={S.successLink}>
              {result.url}
            </a>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <a href={result.url} target="_blank" rel="noreferrer"
                style={{ padding: '7px 14px', background: '#ff0000', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                ▶ Відкрити на YouTube
              </a>
              <button onClick={() => { setResult(null); setFile(null); setProgress(0); }}
                style={{ padding: '7px 14px', background: '#f4f5f7', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#4a4a6a' }}>
                Завантажити ще
              </button>
            </div>
          </div>
        )}

        {/* Помилка */}
        {error && <div style={S.errorBox}>⚠️ {error}</div>}
      </div>
    </div>
  );
}

export default YouTubeUploader;
