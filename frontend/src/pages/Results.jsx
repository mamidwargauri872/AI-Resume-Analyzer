import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  ArrowLeft,
  PieChart as PieIcon,
  Zap,
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Target, 
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Results({ results: propResults }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [results, setResults] = useState(propResults);
  const [loading, setLoading] = useState(!propResults && !!id);

  useEffect(() => {
    const fetchResults = async () => {
      if (!propResults && id) {
        setLoading(true);
        try {
          const res = await axios.get(`http://localhost:8000/api/result/${id}`);
          // The backend returns { _id, results: { ... }, ... }
          setResults(res.data.results || res.data);
        } catch (err) {
          console.error("Error fetching results:", err);
          setResults(null); // Ensure results is null on error
        } finally {
          setLoading(false);
        }
      }
    };
    fetchResults();
  }, [id, propResults]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div className="loader-spin" style={{ width: 40, height: 40, border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading AI Analysis...</p>
      </div>
    );
  }


  if (!results) {
    return (
      <div className="dashboard-error">
        <div className="metric-icon-box orange">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-2xl font-bold mt-4">No Results Found</h2>
        <p className="text-muted mb-6">Please upload a resume first to see the AI analysis results.</p>
        <button className="btn-primary" onClick={() => navigate('/analyze')} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
           Go to Analyzer
        </button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="results-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Analysis Results</h1>
          <p className="page-subtitle">Candidate: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{results?.name || 'Unknown'}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="icon-btn-circle" style={{ width: 'auto', padding: '0 1.25rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', fontWeight: 600 }} onClick={() => navigate('/analyze')}>
            <ArrowLeft size={18} /> Back
          </button>
          <button className="btn-primary" onClick={() => window.print()} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer', alignItems: 'center' }}>
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}>
        {/* Left Column - Score */}
        <div className="chart-card shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 className="chart-title">ATS Match Score</h3>
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '1rem 0' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              {/* Background ring */}
              <circle cx="90" cy="90" r="75" fill="none" stroke="var(--primary-light)" strokeWidth="12" />
              {/* Score ring */}
              <motion.circle
                cx="90" cy="90" r="75"
                fill="none"
                stroke={getScoreColor(results?.match_score || 0)}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 75}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 75 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 75 * (1 - (results?.match_score || 0) / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{results?.match_score || 0}</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ATS Score</p>
            </div>
          </div>
          <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 16px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem' }}>
            {(results?.match_score || 0) >= 70 ? '✅ Strong Match' : (results?.match_score || 0) >= 40 ? '⚡ Moderate Match' : '⚠️ Weak Match'}
          </div>

          <div style={{ width: '100%', marginTop: '2rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} color="var(--primary)" /> AI Insights
            </h4>
            {results?.suggestions?.slice(0, 3).map((s, idx) => (
              <div key={idx} style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '0.5rem', borderLeft: '3px solid var(--primary)', color: 'var(--text-main)' }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="chart-card shadow-sm">
            <h3 className="chart-title">Matched Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {results?.matched_skills?.map(skill => (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#065f46', padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <CheckCircle size={16} /> {skill}
                </div>
              ))}
              {(!results?.matched_skills || results.matched_skills.length === 0) && <p className="text-muted">No matching skills found.</p>}
            </div>
          </div>

          <div className="chart-card shadow-sm">
            <h3 className="chart-title">Missing Skills & Gaps</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {results?.missing_skills?.map(skill => (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff1f2', color: '#9f1239', padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <XCircle size={16} /> {skill}
                </div>
              ))}
              {(!results?.missing_skills || results.missing_skills.length === 0) && <p className="text-muted">No significant skill gaps identified.</p>}
            </div>
          </div>

          <div className="chart-card shadow-sm">
            <h3 className="chart-title">Recommendations</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {results?.suggestions?.map((s, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 750 }}>{idx + 1}</div>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Results;
