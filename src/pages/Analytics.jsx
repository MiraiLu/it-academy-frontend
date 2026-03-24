import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const analyticsAPI = {
  getSummary:  () => api.get('/admin/analytics/summary'),
  getRevenue:  (period) => api.get('/admin/analytics/revenue', { params: { period } }),
  getEnrollments: (period) => api.get('/admin/analytics/enrollments', { params: { period } }),
  getTopCourses:  () => api.get('/admin/analytics/top-courses'),
  getActivity:    () => api.get('/admin/analytics/activity'),
};

const S = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  tabs: { display: 'flex', gap: 4, background: '#f4f5f7', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: 24 },
  tab: (a) => ({ padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: a ? '#fff' : 'transparent', color: a ? '#1a1a2e' : '#6b7280', boxShadow: a ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }),
  // Метрика
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  metricCard: { background: '#fff', border: '1px solid #e8e8ed', borderRadius: 14, padding: '20px' },
  metricIcon: (bg) => ({ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }),
  metricVal: { fontSize: 30, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 },
  metricLabel: { fontSize: 13, color: '#5a6c7d', marginTop: 6 },
  metricChange: (pos) => ({ fontSize: 12, marginTop: 4, color: pos ? '#059669' : '#dc2626', fontWeight: 500 }),
  // Картки
  card: { background: '#fff', border: '1px solid #e8e8ed', borderRadius: 14, padding: '20px', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 },
  // Графік (простий bar chart без бібліотек)
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, marginBottom: 8 },
  bar: (h, color) => ({ flex: 1, height: `${Math.max(h, 4)}%`, background: color || 'linear-gradient(180deg,#667eea,#764ba2)', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', cursor: 'pointer', minWidth: 20 }),
  barLabel: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
  // Таблиця курсів
  courseRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f5' },
  rankBadge: (rank) => ({ width: 28, height: 28, borderRadius: 8, background: rank === 1 ? '#fef9c3' : rank === 2 ? '#f4f5f7' : '#fef2f2', color: rank === 1 ? '#ca8a04' : rank === 2 ? '#6b7280' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }),
  progressBar: (pct, color) => ({ height: 6, background: '#f0f0f5', borderRadius: 3, overflow: 'hidden', flex: 1, position: 'relative' }),
  progressFill: (pct, color) => ({ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: color || '#667eea', borderRadius: 3, transition: 'width 0.6s ease' }),
  // Активність
  activityRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8f8fa', fontSize: 13 },
  activityDot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }),
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
};

// Заглушка якщо API немає — показуємо демо дані
const DEMO = {
  summary: { users: 47, courses: 12, enrollments: 134, revenue: 28500, completions: 23 },
  monthly: [
    { label: 'Жов', enrollments: 8,  revenue: 3200  },
    { label: 'Лис', enrollments: 14, revenue: 5600  },
    { label: 'Гру', enrollments: 11, revenue: 4400  },
    { label: 'Січ', enrollments: 19, revenue: 7600  },
    { label: 'Лют', enrollments: 23, revenue: 9200  },
    { label: 'Бер', enrollments: 31, revenue: 12400 },
  ],
  topCourses: [
    { title: 'Python для початківців', enrollments: 34, completion: 72, revenue: 8500  },
    { title: 'Повний курс Laravel',    enrollments: 28, completion: 65, revenue: 7000  },
    { title: 'React з нуля',           enrollments: 21, completion: 80, revenue: 5250  },
    { title: 'UI/UX дизайн',           enrollments: 18, completion: 55, revenue: 4500  },
    { title: 'JavaScript Pro',         enrollments: 15, completion: 90, revenue: 3750  },
  ],
  activity: [
    { text: 'Новий студент Ivan Petrenko записався на Python для початківців', time: '2 год тому',  color: '#10b981' },
    { text: 'Olena Kovalenko завершила урок "Вступ до React"',                 time: '4 год тому',  color: '#6366f1' },
    { text: 'Видано сертифікат Dmytro Shevchenko (Laravel курс)',              time: '1 день тому', color: '#f59e0b' },
    { text: 'Новий відгук 5★ на курс "Python для початківців"',               time: '1 день тому', color: '#ec4899' },
    { text: 'Завантажено нове відео для уроку "Функції Python"',              time: '2 дні тому',  color: '#8b5cf6' },
  ],
};

function Analytics() {
  const [period, setPeriod]   = useState('month');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [period]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sumRes, topRes] = await Promise.allSettled([
        analyticsAPI.getSummary(),
        analyticsAPI.getTopCourses(),
      ]);
      const summary = sumRes.status === 'fulfilled' ? sumRes.value.data?.data : null;
      const top     = topRes.status === 'fulfilled'  ? topRes.value.data?.data  : null;
      setData({ summary: summary || DEMO.summary, topCourses: top || DEMO.topCourses, monthly: DEMO.monthly, activity: DEMO.activity });
    } catch {
      setData({ summary: DEMO.summary, topCourses: DEMO.topCourses, monthly: DEMO.monthly, activity: DEMO.activity });
    } finally { setLoading(false); }
  };

  if (loading || !data) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>Завантаження аналітики...</div>
    </Layout>
  );

  const { summary, monthly, topCourses, activity } = data;
  const maxEnroll  = Math.max(...monthly.map(m => m.enrollments), 1);
  const maxRevenue = Math.max(...monthly.map(m => m.revenue), 1);

  const metrics = [
    { label: 'Студентів',       value: summary.users,        icon: '👥', bg: '#ede9fe', change: '+12% цього місяця', pos: true  },
    { label: 'Активних курсів', value: summary.courses,      icon: '📚', bg: '#dbeafe', change: '+2 нові курси',     pos: true  },
    { label: 'Записів',         value: summary.enrollments,  icon: '📝', bg: '#dcfce7', change: '+31 цього місяця',  pos: true  },
    { label: 'Дохід (грн)',     value: (summary.revenue || 0).toLocaleString('uk-UA'), icon: '💰', bg: '#fef9c3', change: '+18% vs минулий міс', pos: true },
  ];

  return (
    <Layout>
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.title}>Аналітика</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Огляд платформи в реальному часі</p>
        </div>
        <div style={S.tabs}>
          {[['week','Тиждень'],['month','Місяць'],['year','Рік']].map(([id,label]) => (
            <button key={id} style={S.tab(period === id)} onClick={() => setPeriod(id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Метрики */}
      <div style={S.metricGrid}>
        {metrics.map(m => (
          <div key={m.label} style={S.metricCard}>
            <div style={S.metricIcon(m.bg)}>{m.icon}</div>
            <div style={S.metricVal}>{m.value}</div>
            <div style={S.metricLabel}>{m.label}</div>
            <div style={S.metricChange(m.pos)}>{m.pos ? '↑' : '↓'} {m.change}</div>
          </div>
        ))}
      </div>

      <div style={S.twoCol}>
        {/* Графік записів */}
        <div style={S.card}>
          <div style={S.cardTitle}>📈 Записи по місяцях</div>
          <div style={S.barChart}>
            {monthly.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{m.enrollments}</div>
                <div style={S.bar(Math.round(m.enrollments / maxEnroll * 100), 'linear-gradient(180deg,#667eea,#764ba2)')}
                  title={`${m.label}: ${m.enrollments} записів`} />
                <div style={S.barLabel}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            Загалом за період: {monthly.reduce((s, m) => s + m.enrollments, 0)} записів
          </div>
        </div>

        {/* Графік доходу */}
        <div style={S.card}>
          <div style={S.cardTitle}>💰 Дохід по місяцях (грн)</div>
          <div style={S.barChart}>
            {monthly.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{(m.revenue/1000).toFixed(1)}к</div>
                <div style={S.bar(Math.round(m.revenue / maxRevenue * 100), 'linear-gradient(180deg,#10b981,#059669)')}
                  title={`${m.label}: ${m.revenue.toLocaleString('uk-UA')} грн`} />
                <div style={S.barLabel}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            Загалом: {monthly.reduce((s, m) => s + m.revenue, 0).toLocaleString('uk-UA')} грн
          </div>
        </div>
      </div>

      <div style={S.twoCol}>
        {/* Топ курсів */}
        <div style={S.card}>
          <div style={S.cardTitle}>🏆 Топ курсів за записами</div>
          {topCourses.slice(0, 5).map((course, i) => {
            const maxE = topCourses[0]?.enrollments || 1;
            const pct  = Math.round((course.enrollments / maxE) * 100);
            const rankColors = ['#ca8a04','#6b7280','#dc2626','#4a4a6a','#4a4a6a'];
            const barColors  = ['#667eea','#8b5cf6','#ec4899','#f59e0b','#10b981'];
            return (
              <div key={i} style={S.courseRow}>
                <div style={S.rankBadge(i + 1)}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {course.title || course.title_uk}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={S.progressBar(pct, barColors[i])}>
                      <div style={S.progressFill(pct, barColors[i])} />
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', minWidth: 50 }}>
                      {course.enrollments} студ.
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{course.completion}%</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>завершили</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Остання активність */}
        <div style={S.card}>
          <div style={S.cardTitle}>⚡ Остання активність</div>
          {activity.map((item, i) => (
            <div key={i} style={S.activityRow}>
              <div style={S.activityDot(item.color)} />
              <div style={{ flex: 1, color: '#4a4a6a', lineHeight: 1.4 }}>{item.text}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 8 }}>{item.time}</div>
            </div>
          ))}
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              ℹ️ Дані оновлюються автоматично при підключенні аналітики до API
            </span>
          </div>
        </div>
      </div>

      {/* Додаткові метрики */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          { label: 'Середній прогрес студентів', value: '64%',  icon: '📊', desc: 'по всіх активних курсах', bg: '#ede9fe' },
          { label: 'Завершили курси',             value: summary.completions || 23, icon: '🎓', desc: 'отримали сертифікати', bg: '#dcfce7' },
          { label: 'Середня оцінка курсів',       value: '4.3★', icon: '⭐', desc: 'по всіх відгуках', bg: '#fef9c3' },
        ].map(m => (
          <div key={m.label} style={{ ...S.card, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{m.value}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>{m.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Analytics;
