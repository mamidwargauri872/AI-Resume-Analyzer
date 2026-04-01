import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, FileText, TrendingUp, Award,
  Loader2, AlertCircle, RefreshCw, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#ef4444', '#f59e0b', '#4f46e5', '#10b981'];

/* ── Score badge color ── */
const scoreBadge = (score) => {
  if (score >= 80) return { bg: '#ecfdf5', color: '#065f46' };
  if (score >= 60) return { bg: '#eff6ff', color: '#1e40af' };
  if (score >= 40) return { bg: '#fefce8', color: '#713f12' };
  return { bg: '#fef2f2', color: '#991b1b' };
};

/* ── Metric Card ── */
const MetricCard = ({ icon, iconClass, label, value, change, changeType, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="metric-card"
  >
    <div className={`metric-icon-box ${iconClass}`}>{icon}</div>
    <div className="metric-details">
      <p className="metric-label">{label}</p>
      <h3 className="metric-value">{value}</h3>
      <span className={`metric-change ${changeType}`}>{change}</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem('user')) || { email: 'demo@example.com' };
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/dashboard-stats/${user.email}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard data. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  /* ── Loading ── */
  if (loading) return (
    <div className="dashboard-loading">
      <Loader2 className="loader-spin" size={44} />
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading your dashboard…</p>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="dashboard-error">
      <AlertCircle size={44} color="var(--danger)" />
      <p style={{ color: 'var(--text-muted)', maxWidth: 340, textAlign: 'center' }}>{error}</p>
      <button
        onClick={fetchStats}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
      >
        <RefreshCw size={16} /> Retry
      </button>
    </div>
  );

  const hasHistory = stats.total_resumes > 0;

  /* ── Dynamic metric row values ── */
  const metrics = [
    {
      icon: <FileText size={22} />, iconClass: 'purple', label: 'Total Resumes',
      value: stats.total_resumes,
      change: hasHistory ? `${stats.monthly_growth} this month` : 'No uploads yet',
      changeType: hasHistory ? 'positive' : 'neutral', delay: 0
    },
    {
      icon: <Award size={22} />, iconClass: 'blue', label: 'Avg. ATS Score',
      value: hasHistory ? `${stats.avg_score}%` : '—',
      change: hasHistory ? stats.score_change : 'Analyze first resume',
      changeType: hasHistory ? (stats.score_change.startsWith('+') ? 'positive' : 'negative') : 'neutral', delay: 0.08
    },
    {
      icon: <Users size={22} />, iconClass: 'green', label: 'Active Candidates',
      value: stats.active_candidates,
      change: hasHistory ? `+${stats.new_candidates_week} added this week` : 'No candidates yet',
      changeType: hasHistory ? 'positive' : 'neutral', delay: 0.16
    },
    {
      icon: <TrendingUp size={22} />, iconClass: 'orange', label: 'Pass Rate',
      value: hasHistory ? `${stats.pass_rate}%` : '—',
      change: stats.pass_rate_label,
      changeType: stats.pass_rate >= 60 ? 'positive' : stats.pass_rate > 0 ? 'negative' : 'neutral', delay: 0.24
    }
  ];

  const trendData = stats.trend_data?.length > 0 ? stats.trend_data : [
    { name: 'No data', score: 0 }
  ];

  return (
    <div className="dashboard-overview animate-fade-in">
      {/* Header */}
      <div className="dashboard-page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">
          {hasHistory
            ? `You've analyzed ${stats.total_resumes} resume${stats.total_resumes !== 1 ? 's' : ''} so far.`
            : 'Welcome! Upload your first resume to start seeing insights here.'}
        </p>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Bar chart */}
        <div className="chart-card">
          <h3 className="chart-title">Analysis Score Trend</h3>
          {!hasHistory && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Upload a resume to see scores plotted here.
            </p>
          )}
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'ATS Score']}
                  cursor={{ fill: 'rgba(79,70,229,0.04)' }}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', fontSize: '13px' }}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="chart-card">
          <h3 className="chart-title">Score Distribution</h3>
          <div style={{ width: '100%', height: 260 }}>
            {stats.score_distribution?.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.score_distribution}
                    cx="50%" cy="45%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={4} dataKey="value"
                  >
                    {stats.score_distribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${v} resume${v !== 1 ? 's' : ''}`, n]}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', fontSize: '13px' }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem', gap: '0.75rem' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', border: '8px solid var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={26} color="var(--primary)" />
                </div>
                <p>Upload resumes to see score breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-grid">
        {/* Top Skills */}
        <div className="chart-card">
          <h3 className="chart-title">Top Skills Found</h3>
          {stats.skills_distribution?.length > 0 ? (
            <div className="skills-list">
              {stats.skills_distribution.map((skill, idx) => (
                <div key={skill.name} className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-count">{skill.count} resume{skill.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="skill-progress-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((skill.count / stats.total_resumes) * 100)}%` }}
                      transition={{ duration: 0.9, delay: idx * 0.07 }}
                      className="skill-progress-fill"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <FileText size={36} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
              <p>Skill data will appear after your first analysis.</p>
            </div>
          )}
        </div>

        {/* Recent Activity — FULLY DYNAMIC */}
        <div className="chart-card">
          <h3 className="chart-title">Recent Analyses</h3>
          {stats.recent_analyses?.length > 0 ? (
            <div>
              {stats.recent_analyses.map((item, idx) => {
                const badge = scoreBadge(item.score);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="insight-item"
                    style={{ alignItems: 'center' }}
                  >
                    {/* Score badge */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                      {item.score}
                    </div>
                    <div className="insight-text" style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <span className="timestamp">
                        {item.filename} · {item.matched} matched skill{item.matched !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', flex: 'none' }}>
                      <Clock size={12} />
                      {item.time_ago}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Clock size={36} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
              <p>Recent analyses will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
