import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Upload,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
  Brain,
  FileText,
  Target,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { email: 'anonymous' };
  const [stats, setStats] = useState({
    total_resumes: 0,
    avg_score: 0,
    active_candidates: 0
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, historyRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/dashboard-stats/${user.email}`),
          axios.get(`http://localhost:8000/api/history/${user.email}`)
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data.slice(0, 5));
        console.log("[Dashboard] History appended & loaded:", historyRes.data.length, "total records.");
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.email]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="dashboard-home"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <section className="dashboard-page-header">
        <motion.h1 className="page-title premium-title" variants={itemVariants}>
          Welcome back, {user.name ? user.name.split(' ')[0] : 'User'}
        </motion.h1>
        <motion.p className="page-subtitle" variants={itemVariants}>
          Your AI-powered recruitment command center is ready.
        </motion.p>
      </section>

      {/* Stats Overview */}
      <motion.div className="stats-mini-grid" variants={itemVariants}>
        <div className="stat-card-glass">
          <div className="stat-icon blue"><FileText size={20} /></div>
          <div>
            <p className="stat-label">Analyses</p>
            <h4 className="stat-value">{stats.total_resumes}</h4>
          </div>
        </div>
        <div className="stat-card-glass">
          <div className="stat-icon purple"><Target size={20} /></div>
          <div>
            <p className="stat-label">Avg Match</p>
            <h4 className="stat-value">{stats.avg_score}%</h4>
          </div>
        </div>
        <div className="stat-card-glass">
          <div className="stat-icon green"><Users size={20} /></div>
          <div>
            <p className="stat-label">Candidates</p>
            <h4 className="stat-value">{stats.active_candidates}</h4>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="home-content-grid">

        {/* Left Column: Quick Actions & Stats */}
        <div className="home-main-col">
          {/* New Analysis CTA */}
          <motion.div
            className="cta-card-premium"
            variants={itemVariants}
            onClick={() => navigate('/analyze/upload')}
          >
            <div className="cta-content">
              <h3>Start a New Analysis</h3>
              <p>Harness Gemini AI to evaluate resumes against job descriptions with surgical precision.</p>
              <button className="primary-btn-pill">
                Begin Analysis <ArrowRight size={18} />
              </button>
            </div>
            <div className="cta-icon-bg">
              <Upload size={120} />
            </div>
          </motion.div>

          {/* Recent History Table */}
          <motion.div className="info-section-glass" variants={itemVariants} style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Recent Analyses</h3>
              <button onClick={() => navigate('/analyze/upload')} className="text-btn" style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>+ New Analysis</button>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading history...</div>
            ) : history.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontWeight: 600 }}>Filename</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontWeight: 600 }}>Score</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate(`/analyze/results/${item._id}`)}>
                        <td style={{ padding: '1rem 0.5rem', color: '#0f172a', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16} color="#3b82f6" />
                            {item.filename}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: item.results.match_score > 70 ? '#dcfce7' : '#fee2e2', color: item.results.match_score > 70 ? '#166534' : '#991b1b', fontWeight: 700, fontSize: '0.75rem' }}>
                            {item.results.match_score}%
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: '#94a3b8', textAlign: 'right', fontSize: '0.8rem' }}>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                <div style={{ marginBottom: '0.75rem', opacity: 0.5 }}><FileText size={40} style={{ margin: '0 auto' }} /></div>
                <p style={{ margin: 0 }}>No history found yet. Start your first analysis!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Features & Help */}
        <div className="home-side-col">
          <motion.div className="feature-list-card" variants={itemVariants}>
            <h3 className="section-title">Capabilities</h3>
            <ul className="feature-list">
              <li>
                <div className="feature-icon"><Brain size={18} /></div>
                <span>Semantic Skill Extraction</span>
              </li>
              <li>
                <div className="feature-icon"><BarChart3 size={18} /></div>
                <span>Ranked Gap Analysis</span>
              </li>
              <li>
                <div className="feature-icon"><Shield size={18} /></div>
                <span>Enterprise Security</span>
              </li>
              <li>
                <div className="feature-icon"><Zap size={18} /></div>
                <span>Real-time Insights</span>
              </li>
            </ul>
          </motion.div>

          <motion.div className="support-card" variants={itemVariants}>
            <h3>Ready for More?</h3>
            <p>Explore the technology behind AI Resume Analyser or get expert support.</p>
            <button className="primary-btn-pill support-btn" onClick={() => navigate('/analyze/about')}>
              Learn More <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default DashboardHome;

