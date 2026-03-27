import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import ModalPortal from '../components/ModalPortal';
import api from '../services/api';

const certificatesAPI = {
  getAll: (params) => api.get('/admin/certificates', { params }),
  issue: (data) => api.post('/admin/certificates', data),
  revoke: (id) => api.delete(`/admin/certificates/${id}`),
  download: (id) => api.get(`/admin/certificates/${id}/download`, { responseType: 'blob' }),
};

const templatesAPI = {
  getAll: () => api.get('/admin/certificate-templates'),
  create: (data) => api.post('/admin/certificate-templates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.post(`/admin/certificate-templates/${id}?_method=PUT`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/admin/certificate-templates/${id}`),
};

const DEFAULT_FIELDS = {
  student_name: { x: 50, y: 46, font_size: 54, color: '#ffffff', align: 'center', max_width: 70 },
  course_title: { x: 50, y: 60, font_size: 30, color: '#ffffff', align: 'center', max_width: 68 },
  issued_date: { x: 50, y: 72, font_size: 22, color: '#f8fafc', align: 'center', max_width: 40 },
  certificate_number: { x: 50, y: 84, font_size: 18, color: '#e2e8f0', align: 'center', max_width: 42 },
};

const FIELD_META = {
  student_name: { label: "ПІБ студента", hint: 'Головне імʼя на сертифікаті' },
  course_title: { label: 'Назва курсу', hint: 'Назва програми або курсу' },
  issued_date: { label: 'Дата видачі', hint: 'Дата завершення або вручення' },
  certificate_number: { label: 'Номер сертифіката', hint: 'Унікальний ідентифікатор' },
};

const EMPTY_TEMPLATE = {
  name: '',
  canvas_width: 1600,
  canvas_height: 900,
  fields: DEFAULT_FIELDS,
  background: null,
  background_preview_url: '',
  is_active: true,
};

const BUILDER_SECTIONS = [
  { id: 'layout', label: 'Макет', icon: '🧱' },
  { id: 'fields', label: 'Поля', icon: '✍️' },
  { id: 'templates', label: 'Шаблони', icon: '🗂️' },
];

const S = {
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  titleWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  title: { margin: 0, fontSize: 32, fontWeight: 800, color: '#1f2340' },
  subtitle: { margin: 0, fontSize: 14, color: '#7c8499', maxWidth: 720 },
  headerActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnPrimary: {
    background: 'linear-gradient(135deg,#5b67f1,#7b53d6)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '12px 22px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    boxShadow: '0 12px 24px rgba(91,103,241,0.18)',
  },
  btnSecondary: {
    background: '#fff',
    color: '#4f46e5',
    border: '1px solid rgba(99,102,241,0.16)',
    borderRadius: 14,
    padding: '12px 22px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid #e9ebf5',
    padding: 22,
    boxShadow: '0 12px 30px rgba(15,23,42,0.04)',
  },
  statBadge: (bg) => ({
    width: 48,
    height: 48,
    borderRadius: 14,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    marginBottom: 16,
  }),
  statValue: { fontSize: 34, fontWeight: 800, color: '#1f2340', lineHeight: 1 },
  statLabel: { marginTop: 8, color: '#6f7891', fontSize: 14 },
  panel: {
    background: '#fff',
    borderRadius: 20,
    border: '1px solid #e9ebf5',
    boxShadow: '0 18px 40px rgba(15,23,42,0.04)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    padding: '18px 22px',
    borderBottom: '1px solid #eef1f7',
  },
  panelTitleWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  panelTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1f2340' },
  panelSubtitle: { margin: 0, fontSize: 13, color: '#7c8499' },
  search: {
    width: 280,
    maxWidth: '100%',
    padding: '11px 14px',
    borderRadius: 12,
    border: '1px solid #dde2f0',
    outline: 'none',
    fontSize: 14,
    color: '#1f2340',
    background: '#fbfcff',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '16px',
    fontSize: 14,
    color: '#1f2340',
    verticalAlign: 'middle',
  },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '44px 20px', fontSize: 14 },
  userChip: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#5b67f1,#7b53d6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
  certNumber: {
    padding: '6px 10px',
    borderRadius: 999,
    background: '#f5f7ff',
    color: '#6366f1',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 700,
  },
  actionGhost: {
    background: '#f5f7fb',
    border: 'none',
    borderRadius: 10,
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    color: '#46506b',
  },
  actionDanger: {
    background: '#fff1f2',
    border: 'none',
    borderRadius: 10,
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    color: '#dc2626',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.46)',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
    padding: 24,
    overflowY: 'auto',
  },
  modal: {
    width: 'min(1380px, 100%)',
    margin: '0 auto',
    background: '#fff',
    borderRadius: 28,
    boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
    overflow: 'hidden',
  },
  smallModal: {
    width: 'min(920px, 100%)',
    margin: '40px auto',
    background: '#fff',
    borderRadius: 24,
    boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
    overflow: 'hidden',
  },
  modalHead: {
    padding: '26px 28px 20px',
    borderBottom: '1px solid #eef1f7',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalTitleWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  modalTitle: { margin: 0, fontSize: 24, fontWeight: 800, color: '#1f2340' },
  modalSubtitle: { margin: 0, fontSize: 14, color: '#7c8499', maxWidth: 760 },
  modalBody: { padding: 28 },
  builderBody: {
    padding: 28,
    display: 'grid',
    gridTemplateColumns: '88px minmax(420px, 1.1fr) minmax(360px, 0.92fr)',
    gap: 20,
    alignItems: 'stretch',
  },
  issueBody: {
    padding: 28,
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 0.86fr) minmax(460px, 1.14fr)',
    gap: 24,
    alignItems: 'start',
  },
  builderNav: {
    position: 'sticky',
    top: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 10,
    borderRadius: 20,
    background: '#ffffff',
    border: '1px solid #e9ebf5',
    boxShadow: '0 12px 30px rgba(15,23,42,0.05)',
    alignSelf: 'start',
  },
  builderNavBtn: (active) => ({
    border: active ? '1px solid rgba(91,103,241,0.2)' : '1px solid transparent',
    background: active ? 'linear-gradient(180deg,#eef2ff,#f7f5ff)' : 'transparent',
    color: active ? '#4f46e5' : '#64748b',
    borderRadius: 16,
    padding: '12px 8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    transition: 'all 0.2s ease',
    minHeight: 92,
    justifyContent: 'center',
  }),
  builderNavIcon: { fontSize: 18, lineHeight: 1 },
  builderPreviewCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'sticky',
    top: 24,
    alignSelf: 'start',
  },
  previewCard: {
    background: 'linear-gradient(180deg,#fcfdff,#f7f8fc)',
    border: '1px solid #e9ebf5',
    borderRadius: 22,
    padding: 18,
  },
  previewHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' },
  previewTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2340' },
  previewHint: { margin: 0, fontSize: 13, color: '#7c8499' },
  previewCanvasWrap: {
    borderRadius: 18,
    background: 'radial-gradient(circle at top, rgba(99,102,241,0.10), transparent 55%), #eef2ff',
    padding: 18,
    border: '1px solid #e5e9fb',
  },
  previewMetaRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 12,
    alignItems: 'stretch',
  },
  noteCard: {
    background: '#f8faff',
    border: '1px solid #e1e8ff',
    borderRadius: 16,
    padding: 16,
    color: '#50607f',
    fontSize: 13,
    lineHeight: 1.5,
  },
  builderControls: { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
  builderToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 4,
    minHeight: 64,
  },
  builderToolbarTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: '#1f2340',
  },
  builderToolbarText: {
    margin: 0,
    fontSize: 13,
    color: '#7c8499',
  },
  sectionCard: {
    background: '#fff',
    border: '1px solid #e9ebf5',
    borderRadius: 18,
    padding: 18,
    boxShadow: '0 10px 28px rgba(15,23,42,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  sectionHead: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14, minHeight: 68 },
  sectionTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2340' },
  sectionHint: { margin: 0, fontSize: 13, color: '#7c8499', lineHeight: 1.45 },
  label: { display: 'flex', alignItems: 'flex-end', marginBottom: 6, color: '#64748b', fontSize: 12, fontWeight: 700, minHeight: 32, lineHeight: 1.3 },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #dde2f0',
    outline: 'none',
    fontSize: 14,
    color: '#1f2340',
    background: '#fbfcff',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    minHeight: 50,
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #dde2f0',
    outline: 'none',
    fontSize: 14,
    color: '#1f2340',
    background: '#fbfcff',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    cursor: 'pointer',
    minHeight: 50,
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  threeCol: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, alignItems: 'start' },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, alignItems: 'stretch' },
  fieldCard: {
    border: '1px solid #edf0f7',
    borderRadius: 16,
    padding: 16,
    background: '#fcfdff',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    height: '100%',
    overflow: 'hidden',
  },
  fieldTitleRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12, minHeight: 76 },
  fieldTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: '#1f2340' },
  fieldHint: { margin: 0, fontSize: 12, color: '#8a93aa', lineHeight: 1.45, minHeight: 36 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 10px',
    borderRadius: 999,
    background: '#f3f4ff',
    color: '#5b67f1',
    fontSize: 12,
    fontWeight: 700,
  },
  templateGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  templateCard: (active) => ({
    background: active ? '#f7f8ff' : '#fff',
    border: active ? '2px solid #5b67f1' : '1px solid #e9ebf5',
    borderRadius: 18,
    padding: 14,
    boxShadow: active ? '0 12px 28px rgba(91,103,241,0.12)' : '0 8px 22px rgba(15,23,42,0.03)',
  }),
  footer: {
    padding: '20px 28px 26px',
    borderTop: '1px solid #eef1f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  footerHint: { margin: 0, fontSize: 13, color: '#7c8499' },
  footerActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnCancel: {
    background: '#f4f5f8',
    color: '#6b7280',
    border: 'none',
    borderRadius: 14,
    padding: '12px 22px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  },
  btnSave: {
    background: 'linear-gradient(135deg,#5b67f1,#7b53d6)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    boxShadow: '0 12px 24px rgba(91,103,241,0.18)',
  },
  errorBox: {
    margin: '20px 28px 0',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '14px 16px',
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.5,
  },
  inlineNotice: {
    padding: '10px 12px',
    background: '#f8faff',
    border: '1px solid #dbe5ff',
    borderRadius: 12,
    color: '#5b67f1',
    fontSize: 12,
    fontWeight: 600,
  },
  previewActionHint: {
    padding: '10px 12px',
    borderRadius: 12,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: 12,
    fontWeight: 600,
    flex: '1 1 220px',
    textAlign: 'center',
  },
};

const mergeFields = (fields = {}) => Object.keys(DEFAULT_FIELDS).reduce((acc, key) => {
  acc[key] = { ...DEFAULT_FIELDS[key], ...(fields[key] || {}) };
  return acc;
}, {});

const buildTemplate = (template) => template ? { ...template, fields: mergeFields(template.fields) } : null;

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('uk-UA');
};

const filenameFromHeaders = (headers, fallback) => {
  const match = (headers?.['content-disposition'] || '').match(/filename="([^"]+)"/i);
  return match?.[1] || fallback;
};

const getFriendlyError = (error, fallback) => {
  const rawMessage = error?.response?.data?.message || error?.message || '';

  if (rawMessage.includes('certificate_templates') && rawMessage.includes("doesn't exist")) {
    return 'У базі ще не створена таблиця шаблонів сертифікатів. Запусти php artisan migrate для бекенду й відкрий сторінку ще раз.';
  }

  return rawMessage || fallback;
};

function CertificateCanvas({ template, values, minHeight = 340, showGrid = false }) {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);
  const tpl = buildTemplate(template) || {
    canvas_width: 1600,
    canvas_height: 900,
    fields: mergeFields(),
    background_url: '',
    background_preview_url: '',
  };

  const background = tpl.background_preview_url || tpl.background_url || '';

  useEffect(() => {
    const element = wrapperRef.current;

    if (!element) {
      return undefined;
    }

    const updateScale = () => {
      const nextScale = element.clientWidth / tpl.canvas_width;
      setScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);

    return () => observer.disconnect();
  }, [tpl.canvas_width]);

  const alignStyles = (align) => {
    if (align === 'left') {
      return { left: 0, transform: 'none', textAlign: 'left' };
    }

    if (align === 'right') {
      return { right: 0, left: 'auto', transform: 'none', textAlign: 'right' };
    }

    return { left: '50%', transform: 'translateX(-50%)', textAlign: 'center' };
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight,
        aspectRatio: `${tpl.canvas_width} / ${tpl.canvas_height}`,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid #e3e8f4',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: tpl.canvas_width,
          height: tpl.canvas_height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: background ? `center/cover no-repeat url(${background})` : 'linear-gradient(135deg,#5b67f1 0%,#7b53d6 100%)',
        }}
      >
        {!background && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.16) 0%, transparent 38%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10) 0%, transparent 35%)',
            }}
          />
        )}

        {showGrid && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(to right, rgba(91,103,241,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(91,103,241,0.12) 1px, transparent 1px)',
              backgroundSize: `${tpl.canvas_width / 10}px ${tpl.canvas_height / 10}px`,
              pointerEvents: 'none',
            }}
          />
        )}

        {Object.entries(tpl.fields).map(([key, field]) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: `${field.y}%`,
              width: `${field.max_width}%`,
              color: field.color,
              fontSize: field.font_size || 16,
              fontWeight: 800,
              lineHeight: 1.08,
              textShadow: background ? '0 2px 10px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.18)',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              ...alignStyles(field.align),
            }}
          >
            {values[key]}
          </div>
        ))}
      </div>
    </div>
  );
}

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [formError, setFormError] = useState('');
  const [templateError, setTemplateError] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [builderSection, setBuilderSection] = useState('layout');
  const [issueForm, setIssueForm] = useState({
    user_id: '',
    course_id: '',
    issued_at: new Date().toISOString().slice(0, 10),
    template_id: '',
  });
  const [templateForm, setTemplateForm] = useState({ ...EMPTY_TEMPLATE, fields: mergeFields() });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [certsRes, usersRes, coursesRes, templatesRes] = await Promise.allSettled([
        certificatesAPI.getAll({ per_page: 100 }),
        api.get('/admin/users', { params: { role: 'student', per_page: 200 } }),
        api.get('/manage/courses', { params: { per_page: 200 } }),
        templatesAPI.getAll(),
      ]);

      if (certsRes.status === 'fulfilled') {
        setCertificates(certsRes.value.data?.data?.data || certsRes.value.data?.data || []);
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data?.data?.data || usersRes.value.data?.data || []);
      }

      if (coursesRes.status === 'fulfilled') {
        setCourses(coursesRes.value.data?.data?.data || coursesRes.value.data?.data || []);
      }

      if (templatesRes.status === 'fulfilled') {
        setTemplates((templatesRes.value.data?.data || []).map(buildTemplate));
      } else {
        setTemplateError(getFriendlyError(templatesRes.reason, 'Не вдалося завантажити шаблони сертифікатів.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setBuilderSection('layout');
    setTemplateError('');
    setTemplateForm({ ...EMPTY_TEMPLATE, fields: mergeFields() });
  };

  const openIssueModal = () => {
    setFormError('');
    setIssueForm({
      user_id: '',
      course_id: '',
      issued_at: new Date().toISOString().slice(0, 10),
      template_id: templates[0]?.id || '',
    });
    setShowIssueModal(true);
  };

  const openTemplateCreate = () => {
    resetTemplateForm();
    setShowTemplateModal(true);
  };

  const openTemplateEdit = (template) => {
    setEditingTemplateId(template.id);
    setBuilderSection('layout');
    setTemplateError('');
    setTemplateForm({
      name: template.name || '',
      canvas_width: template.canvas_width || 1600,
      canvas_height: template.canvas_height || 900,
      fields: mergeFields(template.fields),
      background: null,
      background_preview_url: template.background_url || '',
      is_active: template.is_active !== false,
    });
    setShowTemplateModal(true);
  };

  const selectedTemplate = useMemo(
    () => templates.find((item) => String(item.id) === String(issueForm.template_id)) || null,
    [templates, issueForm.template_id]
  );

  const selectedUser = useMemo(
    () => users.find((item) => String(item.id) === String(issueForm.user_id)),
    [users, issueForm.user_id]
  );

  const selectedCourse = useMemo(
    () => courses.find((item) => String(item.id) === String(issueForm.course_id)),
    [courses, issueForm.course_id]
  );

  const issuePreviewValues = {
    student_name: selectedUser?.full_name || `${selectedUser?.first_name || ''} ${selectedUser?.last_name || ''}`.trim() || "Прізвище Ім'я",
    course_title: selectedCourse?.title_uk || selectedCourse?.title || 'Назва курсу',
    issued_date: formatDate(issueForm.issued_at) || '24.03.2026',
    certificate_number: '№ CERT-XXXXXXX',
  };

  const templatePreviewValues = {
    student_name: 'Іваненко Іван',
    course_title: 'Повний курс розробки Laravel',
    issued_date: '24.03.2026',
    certificate_number: '№ CERT-DEMO123',
  };

  const activeBuilderSection = BUILDER_SECTIONS.find((section) => section.id === builderSection) || BUILDER_SECTIONS[0];

  const filteredCertificates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return certificates.filter((certificate) => {
      const studentName = (
        certificate.student_name ||
        certificate.user?.full_name ||
        `${certificate.user?.first_name || ''} ${certificate.user?.last_name || ''}`
      ).toLowerCase();
      const courseTitle = (certificate.course_title || certificate.course?.title_uk || certificate.course?.title || '').toLowerCase();
      const certificateNumber = String(certificate.certificate_number || '').toLowerCase();

      return !query || studentName.includes(query) || courseTitle.includes(query) || certificateNumber.includes(query);
    });
  }, [certificates, search]);

  const stats = useMemo(() => ([
    { label: 'Видано сертифікатів', value: certificates.length, icon: '🎓', bg: '#ede9fe' },
    { label: 'Шаблонів', value: templates.length, icon: '🖼️', bg: '#dbeafe' },
    { label: 'Курсів', value: new Set(certificates.map((item) => item.course_id)).size, icon: '📚', bg: '#dcfce7' },
    { label: 'Студентів', value: new Set(certificates.map((item) => item.user_id)).size, icon: '👥', bg: '#fef3c7' },
  ]), [certificates, templates]);

  const handleIssueCertificate = async () => {
    if (!issueForm.user_id || !issueForm.course_id) {
      setFormError('Оберіть студента та курс, для якого видається сертифікат.');
      return;
    }

    setSavingCertificate(true);
    setFormError('');

    try {
      await certificatesAPI.issue(issueForm);
      setShowIssueModal(false);
      await fetchAll();
    } catch (error) {
      setFormError(getFriendlyError(error, 'Не вдалося видати сертифікат.'));
    } finally {
      setSavingCertificate(false);
    }
  };

  const handleRevokeCertificate = async (id) => {
    if (!window.confirm('Анулювати цей сертифікат?')) {
      return;
    }

    try {
      await certificatesAPI.revoke(id);
      await fetchAll();
    } catch (error) {
      window.alert(getFriendlyError(error, 'Не вдалося анулювати сертифікат.'));
    }
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      const response = await certificatesAPI.download(certificate.id);
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filenameFromHeaders(response.headers, `certificate_${certificate.certificate_number || certificate.id}.pdf`);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(getFriendlyError(error, 'Не вдалося завантажити сертифікат.'));
    }
  };

  const handleFieldChange = (fieldKey, prop, value) => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          [prop]: value,
        },
      },
    }));
  };

  const handleBackgroundChange = (file) => {
    if (!file) {
      setTemplateForm((prev) => ({ ...prev, background: null, background_preview_url: '' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTemplateForm((prev) => ({
        ...prev,
        background: file,
        background_preview_url: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      setTemplateError('Вкажи назву шаблону, щоб його було легко знайти пізніше.');
      return;
    }

    if (!editingTemplateId && !templateForm.background) {
      setTemplateError('Для нового шаблону потрібно завантажити фонове зображення сертифіката.');
      return;
    }

    setSavingTemplate(true);
    setTemplateError('');

    try {
      const data = new FormData();
      data.append('name', templateForm.name);
      data.append('canvas_width', String(templateForm.canvas_width));
      data.append('canvas_height', String(templateForm.canvas_height));
      data.append('is_active', templateForm.is_active ? '1' : '0');
      data.append('fields', JSON.stringify(templateForm.fields));

      if (templateForm.background) {
        data.append('background', templateForm.background);
      }

      if (editingTemplateId) {
        await templatesAPI.update(editingTemplateId, data);
      } else {
        await templatesAPI.create(data);
      }

      setShowTemplateModal(false);
      resetTemplateForm();
      await fetchAll();
    } catch (error) {
      setTemplateError(getFriendlyError(error, 'Не вдалося зберегти шаблон.'));
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Видалити цей шаблон сертифіката?')) {
      return;
    }

    try {
      await templatesAPI.delete(id);

      if (String(issueForm.template_id) === String(id)) {
        setIssueForm((prev) => ({ ...prev, template_id: '' }));
      }

      if (editingTemplateId === id) {
        resetTemplateForm();
        setShowTemplateModal(false);
      }

      await fetchAll();
    } catch (error) {
      window.alert(getFriendlyError(error, 'Не вдалося видалити шаблон.'));
    }
  };

  return (
    <Layout>
      <div style={S.pageHeader}>
        <div style={S.titleWrap}>
          <h1 style={S.title}>Сертифікати</h1>
          <p style={S.subtitle}>
            Видавай сертифікати студентам, керуй шаблонами й одразу переглядай результат перед збереженням.
          </p>
        </div>

        <div style={S.headerActions}>
          <button style={S.btnSecondary} onClick={openTemplateCreate}>Конструктор шаблону</button>
          <button style={S.btnPrimary} onClick={openIssueModal}>+ Видати сертифікат</button>
        </div>
      </div>

      <div style={S.statsGrid}>
        {stats.map((item) => (
          <div key={item.label} style={S.statCard}>
            <div style={S.statBadge(item.bg)}>{item.icon}</div>
            <div style={S.statValue}>{item.value}</div>
            <div style={S.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={S.panel}>
        <div style={S.panelHeader}>
          <div style={S.panelTitleWrap}>
            <h2 style={S.panelTitle}>Видані сертифікати</h2>
            <p style={S.panelSubtitle}>Усього знайдено: {filteredCertificates.length}</p>
          </div>

          <input
            style={S.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Пошук по студенту, курсу або номеру..."
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eef1f7' }}>
                {['Студент', 'Курс', 'Шаблон', 'Номер', 'Дата', 'Дії'].map((title) => (
                  <th key={title} style={S.th}>{title}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" style={S.empty}>Завантаження даних...</td>
                </tr>
              )}

              {!loading && filteredCertificates.length === 0 && (
                <tr>
                  <td colSpan="6" style={S.empty}>Ще немає жодного сертифіката. Створи шаблон або видай перший сертифікат студенту.</td>
                </tr>
              )}

              {!loading && filteredCertificates.map((certificate) => {
                const initials = `${certificate.user?.first_name?.[0] || ''}${certificate.user?.last_name?.[0] || ''}` || 'ST';
                const fullName = certificate.student_name || certificate.user?.full_name || `${certificate.user?.first_name || ''} ${certificate.user?.last_name || ''}`.trim();

                return (
                  <tr key={certificate.id} style={{ borderBottom: '1px solid #f4f6fb' }}>
                    <td style={S.td}>
                      <div style={S.userChip}>
                        <div style={S.avatar}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{fullName}</div>
                          {certificate.user?.email && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{certificate.user.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>{certificate.course_title || certificate.course?.title_uk || certificate.course?.title}</td>
                    <td style={S.td}>{certificate.template?.name || 'Базовий шаблон'}</td>
                    <td style={S.td}><span style={S.certNumber}>#{certificate.certificate_number || certificate.id}</span></td>
                    <td style={S.td}>{formatDate(certificate.issued_date || certificate.created_at)}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button style={S.actionGhost} onClick={() => setPreviewCertificate(certificate)}>Перегляд</button>
                        <button style={S.actionGhost} onClick={() => handleDownloadCertificate(certificate)}>Завантажити</button>
                        <button style={S.actionDanger} onClick={() => handleRevokeCertificate(certificate.id)}>Анулювати</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showIssueModal && (
        <ModalPortal>
        <div style={S.overlay} onClick={(event) => { if (event.target === event.currentTarget) setShowIssueModal(false); }}>
          <div style={S.smallModal}>
            <div style={S.modalHead}>
              <div style={S.modalTitleWrap}>
                <h2 style={S.modalTitle}>Видати сертифікат</h2>
                <p style={S.modalSubtitle}>
                  Обери студента, курс і шаблон. Праворуч одразу видно, як виглядатиме готовий сертифікат.
                </p>
              </div>
            </div>

            {formError && <div style={S.errorBox}>{formError}</div>}

            <div style={S.issueBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={S.sectionCard}>
                  <div style={S.sectionHead}>
                    <h3 style={S.sectionTitle}>Дані сертифіката</h3>
                    <p style={S.sectionHint}>Ці поля підставляться у вибраний шаблон.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={S.label}>Шаблон</label>
                      <select
                        style={S.select}
                        value={issueForm.template_id}
                        onChange={(event) => setIssueForm((prev) => ({ ...prev, template_id: event.target.value }))}
                      >
                        <option value="">Базовий шаблон</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={S.label}>Студент *</label>
                      <select
                        style={S.select}
                        value={issueForm.user_id}
                        onChange={(event) => setIssueForm((prev) => ({ ...prev, user_id: event.target.value }))}
                      >
                        <option value="">— оберіть студента —</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name || `${user.first_name} ${user.last_name}`} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={S.label}>Курс *</label>
                      <select
                        style={S.select}
                        value={issueForm.course_id}
                        onChange={(event) => setIssueForm((prev) => ({ ...prev, course_id: event.target.value }))}
                      >
                        <option value="">— оберіть курс —</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>{course.title_uk || course.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={S.label}>Дата видачі</label>
                      <input
                        style={S.input}
                        type="date"
                        value={issueForm.issued_at}
                        onChange={(event) => setIssueForm((prev) => ({ ...prev, issued_at: event.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={S.previewCard}>
                <div style={S.previewHead}>
                  <div>
                    <h3 style={S.previewTitle}>Попередній перегляд</h3>
                    <p style={S.previewHint}>Так сертифікат побачить студент після видачі.</p>
                  </div>
                  <span style={S.chip}>Живе превʼю</span>
                </div>
                <div style={S.previewCanvasWrap}>
                  <CertificateCanvas template={selectedTemplate} values={issuePreviewValues} minHeight={360} />
                </div>
                <div style={S.previewMetaRow}>
                  <span style={S.previewActionHint}>Текст масштабується відносно макета</span>
                  <span style={S.previewActionHint}>Довгі імена тепер не перекривають інші поля</span>
                </div>
              </div>
            </div>

            <div style={S.footer}>
              <p style={S.footerHint}>Після видачі сертифікат одразу зʼявиться у списку нижче.</p>
              <div style={S.footerActions}>
                <button style={S.btnCancel} onClick={() => setShowIssueModal(false)}>Скасувати</button>
                <button style={S.btnSave} onClick={handleIssueCertificate} disabled={savingCertificate}>
                  {savingCertificate ? 'Збереження...' : 'Видати сертифікат'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {showTemplateModal && (
        <ModalPortal>
        <div style={S.overlay} onClick={(event) => { if (event.target === event.currentTarget) setShowTemplateModal(false); }}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <div style={S.modalTitleWrap}>
                <h2 style={S.modalTitle}>{editingTemplateId ? 'Редагування шаблону сертифіката' : 'Конструктор шаблону сертифіката'}</h2>
                <p style={S.modalSubtitle}>
                  Завантаж фоновий шаблон з підписом і печаткою, а потім розмісти змінні поля так, щоб вони красиво лягали поверх дизайну.
                </p>
              </div>
            </div>

            {templateError && <div style={S.errorBox}>{templateError}</div>}

            <div style={S.builderBody}>
              <div style={S.builderNav}>
                {BUILDER_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    style={S.builderNavBtn(builderSection === section.id)}
                    onClick={() => setBuilderSection(section.id)}
                  >
                    <span style={S.builderNavIcon}>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>

              <div style={S.builderPreviewCol}>
                <div style={S.previewCard}>
                  <div style={S.previewHead}>
                    <div>
                      <h3 style={S.previewTitle}>Попередній перегляд шаблону</h3>
                      <p style={S.previewHint}>Сітка допомагає точно виставити ПІБ, курс, дату й номер сертифіката.</p>
                    </div>
                    <span style={S.chip}>{templateForm.canvas_width} × {templateForm.canvas_height}</span>
                  </div>

                  <div style={S.previewCanvasWrap}>
                    <CertificateCanvas
                      template={templateForm}
                      values={templatePreviewValues}
                      minHeight={420}
                      showGrid
                    />
                  </div>

                  <div style={S.previewMetaRow}>
                    <span style={S.previewActionHint}>Сітка 10 × 10 для точного позиціонування</span>
                    <span style={S.previewActionHint}>Секція: {activeBuilderSection.label}</span>
                  </div>
                </div>

                <div style={S.noteCard}>
                  Починай з фону сертифіката, потім відрегулюй позиції полів. Найчастіше спершу налаштовують ПІБ студента, далі назву курсу, а вже потім дату й номер.
                </div>
              </div>

              <div style={S.builderControls}>
                <div style={S.builderToolbar}>
                  <div>
                    <h3 style={S.builderToolbarTitle}>{activeBuilderSection.label}</h3>
                    <p style={S.builderToolbarText}>
                      {builderSection === 'layout' && 'Спочатку задай основу шаблону: назву, розмір полотна і фоновий файл.'}
                      {builderSection === 'fields' && 'Тут редагуються всі текстові змінні, які система підставляє автоматично.'}
                      {builderSection === 'templates' && 'Обирай готові шаблони, щоб швидко перемикатись між варіантами дизайну.'}
                    </p>
                  </div>
                  <span style={S.chip}>Canva-style workflow</span>
                </div>

                {builderSection === 'layout' && (
                <div style={S.sectionCard}>
                  <div style={S.sectionHead}>
                    <h3 style={S.sectionTitle}>Основні параметри шаблону</h3>
                    <p style={S.sectionHint}>Тут задається назва, розмір полотна й фонове зображення сертифіката.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={S.label}>Назва шаблону *</label>
                      <input
                        style={S.input}
                        value={templateForm.name}
                        onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Наприклад: Сертифікат з печаткою"
                      />
                    </div>

                    <div style={S.twoCol}>
                      <div>
                        <label style={S.label}>Ширина полотна</label>
                        <input
                          style={S.input}
                          type="number"
                          value={templateForm.canvas_width}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, canvas_width: Number(event.target.value) || 1600 }))}
                        />
                      </div>
                      <div>
                        <label style={S.label}>Висота полотна</label>
                        <input
                          style={S.input}
                          type="number"
                          value={templateForm.canvas_height}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, canvas_height: Number(event.target.value) || 900 }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={S.label}>Фон сертифіката</label>
                      <input
                        style={{ ...S.input, padding: 10 }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => handleBackgroundChange(event.target.files?.[0])}
                      />
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={S.inlineNotice}>
                          {templateForm.background ? `Новий файл: ${templateForm.background.name}` : templateForm.background_preview_url ? 'Використовується поточний фон шаблону' : 'Фон ще не завантажено'}
                        </span>
                        <span style={S.inlineNotice}>Рекомендовано: PNG або JPG у співвідношенні 16:9</span>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {builderSection === 'fields' && (
                <div style={S.sectionCard}>
                  <div style={S.sectionHead}>
                    <h3 style={S.sectionTitle}>Поля, що підставляються автоматично</h3>
                    <p style={S.sectionHint}>Кожне поле можна змістити, змінити колір, розмір шрифту та ширину текстового блоку.</p>
                  </div>

                  <div style={S.fieldGrid}>
                    {Object.keys(DEFAULT_FIELDS).map((fieldKey) => (
                      <div key={fieldKey} style={S.fieldCard}>
                        <div style={S.fieldTitleRow}>
                          <div>
                            <h4 style={S.fieldTitle}>{FIELD_META[fieldKey].label}</h4>
                            <p style={S.fieldHint}>{FIELD_META[fieldKey].hint}</p>
                          </div>
                          <span style={S.chip}>{fieldKey}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={S.threeCol}>
                            <div>
                              <label style={S.label}>X %</label>
                              <input
                                style={S.input}
                                type="number"
                                value={templateForm.fields[fieldKey].x}
                                onChange={(event) => handleFieldChange(fieldKey, 'x', Number(event.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <label style={S.label}>Y %</label>
                              <input
                                style={S.input}
                                type="number"
                                value={templateForm.fields[fieldKey].y}
                                onChange={(event) => handleFieldChange(fieldKey, 'y', Number(event.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <label style={S.label}>Розмір шрифту</label>
                              <input
                                style={S.input}
                                type="number"
                                value={templateForm.fields[fieldKey].font_size}
                                onChange={(event) => handleFieldChange(fieldKey, 'font_size', Number(event.target.value) || 12)}
                              />
                            </div>
                          </div>

                          <div style={S.threeCol}>
                            <div>
                              <label style={S.label}>Колір</label>
                              <input
                                style={{ ...S.input, padding: 6, height: 46 }}
                                type="color"
                                value={templateForm.fields[fieldKey].color}
                                onChange={(event) => handleFieldChange(fieldKey, 'color', event.target.value)}
                              />
                            </div>
                            <div>
                              <label style={S.label}>Ширина блоку %</label>
                              <input
                                style={S.input}
                                type="number"
                                value={templateForm.fields[fieldKey].max_width}
                                onChange={(event) => handleFieldChange(fieldKey, 'max_width', Number(event.target.value) || 10)}
                              />
                            </div>
                            <div>
                              <label style={S.label}>Вирівнювання</label>
                              <select
                                style={S.select}
                                value={templateForm.fields[fieldKey].align}
                                onChange={(event) => handleFieldChange(fieldKey, 'align', event.target.value)}
                              >
                                <option value="left">⬅</option>
                                <option value="center">⬌</option>
                                <option value="right">➡</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {builderSection === 'templates' && (
                <div style={S.sectionCard}>
                  <div style={S.sectionHead}>
                    <h3 style={S.sectionTitle}>Збережені шаблони</h3>
                    <p style={S.sectionHint}>Можна швидко відкрити існуючий шаблон на редагування або видалити зайвий.</p>
                  </div>

                  <div style={S.templateGrid}>
                    {templates.length === 0 && (
                      <div style={{ ...S.noteCard, gridColumn: '1 / -1' }}>
                        Поки що немає жодного шаблону. Збережи перший шаблон, і він зʼявиться в цьому списку.
                      </div>
                    )}

                    {templates.map((template) => (
                      <div key={template.id} style={S.templateCard(editingTemplateId === template.id)}>
                        <div
                          style={{
                            height: 126,
                            borderRadius: 14,
                            border: '1px solid #e9ebf5',
                            marginBottom: 12,
                            background: template.background_url
                              ? `center/cover no-repeat url(${template.background_url})`
                              : 'linear-gradient(135deg,#5b67f1 0%,#7b53d6 100%)',
                          }}
                        />
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2340', marginBottom: 6 }}>{template.name}</div>
                        <div style={{ fontSize: 12, color: '#8b95ab', marginBottom: 12 }}>
                          {template.canvas_width} × {template.canvas_height}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button style={S.actionGhost} onClick={() => openTemplateEdit(template)}>Редагувати</button>
                          <button style={S.actionDanger} onClick={() => handleDeleteTemplate(template.id)}>Видалити</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>

            <div style={S.footer}>
              <p style={S.footerHint}>
                Порада: якщо текст виходить за межі, зменшуй "Розмір шрифту" або "Ширину блоку %".
              </p>
              <div style={S.footerActions}>
                <button
                  style={S.btnCancel}
                  onClick={() => {
                    setShowTemplateModal(false);
                    resetTemplateForm();
                  }}
                >
                  Скасувати
                </button>
                <button style={S.btnSave} onClick={handleSaveTemplate} disabled={savingTemplate}>
                  {savingTemplate ? 'Збереження...' : editingTemplateId ? 'Зберегти шаблон' : 'Створити шаблон'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {previewCertificate && (
        <div style={S.overlay} onClick={(event) => { if (event.target === event.currentTarget) setPreviewCertificate(null); }}>
          <div style={S.smallModal}>
            <div style={S.modalHead}>
              <div style={S.modalTitleWrap}>
                <h2 style={S.modalTitle}>Перегляд сертифіката</h2>
                <p style={S.modalSubtitle}>Перевір фінальний вигляд перед завантаженням або анулюванням.</p>
              </div>
            </div>

            <div style={S.modalBody}>
              <CertificateCanvas
                template={previewCertificate.template}
                values={{
                  student_name: previewCertificate.student_name || previewCertificate.user?.full_name || `${previewCertificate.user?.first_name || ''} ${previewCertificate.user?.last_name || ''}`.trim(),
                  course_title: previewCertificate.course_title || previewCertificate.course?.title_uk || previewCertificate.course?.title,
                  issued_date: formatDate(previewCertificate.issued_date || previewCertificate.created_at),
                  certificate_number: `№ ${previewCertificate.certificate_number}`,
                }}
                minHeight={380}
              />
            </div>

            <div style={S.footer}>
              <p style={S.footerHint}>Сертифікат завантажується як PDF.</p>
              <div style={S.footerActions}>
                <button style={S.btnCancel} onClick={() => setPreviewCertificate(null)}>Закрити</button>
                <button style={S.btnSave} onClick={() => handleDownloadCertificate(previewCertificate)}>Завантажити PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Certificates;
