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
  TrendingUp,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { analysisSchema } from '../utils/AnalysisSchema';

function Results({ results: propResults, setResultsData }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [results, setResults] = useState(propResults);
  const [loading, setLoading] = useState(!propResults && !!id);
  const [activeTab, setActiveTab] = useState('analysis');
  const [expandedQa, setExpandedQa] = useState({});
  const [copied, setCopied] = useState(false);

  const toggleQa = (idx) => {
    setExpandedQa(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    const fetchResults = async () => {
      // If the ID in URL is different from what we're currently showing, force a refresh
      const isNewId = results && id && (results._id !== id);
      
      if ((!propResults || isNewId) && id) {
        setLoading(true);
        setResults(null); // Clear old results to avoid flashing
        try {
          const res = await axios.get(`http://localhost:8000/api/result/${id}`);
          const rawData = res.data.results || res.data;
          
          // --- Zod Validation ---
          const validation = analysisSchema.safeParse(rawData);
          if (validation.success) {
            setResults(validation.data);
          } else {
            console.error("Zod Validation Failed:", validation.error.format());
            setResults(rawData); // Fallback to raw data if validation fails but we want to show something
          }
        } catch (err) {
          console.error("Error fetching results:", err);
          setResults(null);
        } finally {
          setLoading(false);
        }
      } else if (propResults) {
        const rawData = propResults.results || propResults;
        const validation = analysisSchema.safeParse(rawData);
        setResults(validation.success ? validation.data : rawData);
        setLoading(false);
      }
    };
    fetchResults();
  }, [id, propResults]);

  const handleCopy = () => {
    if (!results?.cover_letter) return;
    navigator.clipboard.writeText(results.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!results?.cover_letter) return;
    const element = document.createElement("a");
    const file = new Blob([results.cover_letter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${results.name || 'Candidate'}.txt`;
    document.body.appendChild(element);
    element.click();
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Analysis Results</h1>
            {results?.is_llm_enhanced && (
              <span style={{ 
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                color: '#0369a1', 
                padding: '4px 12px', 
                borderRadius: '99px', 
                fontSize: '0.85rem', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid #bae6fd',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <Sparkles size={14} fill="#0ea5e9" /> Live AI Analysis
              </span>
            )}
          </div>
          <p className="page-subtitle">Candidate: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{results?.name || 'Unknown'}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="icon-btn-circle" style={{ width: 'auto', padding: '0 1.25rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', fontWeight: 600 }} onClick={() => navigate('/analyze/upload')}>
            <ArrowLeft size={18} /> Back
          </button>
          <button className="btn-primary" onClick={() => window.print()} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer', alignItems: 'center' }}>
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: '#f8fafc',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('analysis')}
          style={{
            padding: '0.75rem 1.75rem',
            background: activeTab === 'analysis' ? 'white' : 'transparent',
            border: 'none',
            boxShadow: activeTab === 'analysis' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderRadius: '10px',
            color: activeTab === 'analysis' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <PieIcon size={18} /> Match Analysis
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          style={{
            padding: '0.75rem 1.75rem',
            background: activeTab === 'roadmap' ? 'white' : 'transparent',
            border: 'none',
            boxShadow: activeTab === 'roadmap' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderRadius: '10px',
            color: activeTab === 'roadmap' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <Calendar size={18} /> 7-Day Roadmap
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          style={{
            padding: '0.75rem 1.75rem',
            background: activeTab === 'interview' ? 'white' : 'transparent',
            border: 'none',
            boxShadow: activeTab === 'interview' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderRadius: '10px',
            color: activeTab === 'interview' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <MessageSquare size={18} /> Interview Prep
          {results?.interview_prep?.length > 0 && (
            <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '100px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 800 }}>
              {results.interview_prep.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('coverletter')}
          style={{
            padding: '0.75rem 1.75rem',
            background: activeTab === 'coverletter' ? 'white' : 'transparent',
            border: 'none',
            boxShadow: activeTab === 'coverletter' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderRadius: '10px',
            color: activeTab === 'coverletter' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <Sparkles size={18} /> Sample Cover Letter
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analysis' ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}
          >
            {/* Left Column - Score */}
            <div className="chart-card shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 className="chart-title">ATS Match Score</h3>
              <div style={{ position: 'relative', width: '180px', height: '180px', margin: '1rem 0' }}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="75" fill="none" stroke="var(--primary-light)" strokeWidth="12" />
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
                <h3 className="chart-title">Top Suggestions</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {results?.suggestions?.map((s, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{idx + 1}</div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{s}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {results?.roadmap && results.roadmap.length > 0 && (
                <div className="chart-card shadow-sm" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={20} color="var(--primary)" /> Learning Path
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {results.roadmap.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', alignItems: 'center' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ede9fe', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action for Prep Card */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => setActiveTab('prep')}
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
                  color: 'white',
                  padding: '2rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Ready to Prep?</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>View your personalized 7-Day Roadmap and Interview Q&A.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('roadmap'); }}
                    style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    View Roadmap
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('interview'); }}
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Start Interview Prep
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : activeTab === 'roadmap' ? (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="prep-container"
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* 7-Day Roadmap */}
            <div className="chart-card shadow-sm" style={{ borderTop: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#dbeafe', color: '#1e40af', padding: '10px', borderRadius: '12px' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>7-Day Preparation Roadmap</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Targeting your {results?.missing_skills?.length || 0} skill gaps — score: {results?.match_score || 0}%
                    </p>
                  </div>
                </div>
                {results?.is_llm_enhanced && (
                  <span style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', padding: '4px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} /> AI Generated
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '20px' }}>
                {/* Visual Timeline Line */}
                <div style={{
                  position: 'absolute',
                  left: '34px',
                  top: '20px',
                  bottom: '20px',
                  width: '2px',
                  background: 'linear-gradient(to bottom, var(--primary) 0%, #e2e8f0 100%)',
                  zIndex: 0
                }} />

                {(results?.roadmap_7_day || []).map((day, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5 }}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      gap: '2rem',
                      alignItems: 'flex-start',
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* Left Side: Day Number Indicator */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        boxShadow: '0 0 0 6px white, 0 0 0 8px #ede9fe'
                      }}>
                        {day.day}
                      </div>
                    </div>

                    {/* Right Side: Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {day.focus}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <Clock size={14} /> DAY {day.day}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {day.tasks.map((task, tidx) => (
                          <div key={tidx} style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '10px 14px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)',
                            border: '1px solid transparent',
                            transition: 'all 0.2s'
                          }}
                            className="task-item-hover"
                          >
                            <div style={{ color: 'var(--primary)', marginTop: '2px' }}><CheckCircle2 size={16} /></div>
                            <span style={{ lineHeight: 1.4 }}>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'interview' ? (
          <motion.div
            key="interview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="prep-container"
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* Q&A Section */}
            <div className="chart-card shadow-sm" style={{ borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '12px' }}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Interview Preparation</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {results?.interview_prep?.length || 0} questions based on this JD & your skill gaps
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const allExpanded = {};
                    (results?.interview_prep || []).forEach((_, i) => { allExpanded[i] = true; });
                    setExpandedQa(prev => Object.keys(prev).length === (results?.interview_prep?.length || 0) ? {} : allExpanded);
                  }}
                  style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {Object.keys(expandedQa).length > 0 ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(results?.interview_prep || []).map((item, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <button
                      onClick={() => toggleQa(idx)}
                      style={{ width: '100%', textAlign: 'left', padding: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{item.question}</span>
                      </div>
                      {expandedQa[idx] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <AnimatePresence>
                      {expandedQa[idx] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 1.5rem 1.5rem 4.5rem', borderTop: '1px solid var(--border-color)', background: 'white' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                              <div style={{ color: '#f59e0b', flexShrink: 0 }}><Lightbulb size={22} /></div>
                              <div>
                                <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample Strategic Answer</h5>
                                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.7 }}>{item.answer}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="coverletter"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ maxWidth: '900px', margin: '0 auto' }}
          >
            <div className="chart-card shadow-sm" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Sample Cover Letter</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Professional & JD-Tailored</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? '#10b981' : 'white',
                      color: copied ? 'white' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Download size={16} /> Download .txt
                  </button>
                </div>
              </div>
              <div style={{
                padding: '3rem',
                background: 'white',
                minHeight: '600px',
                fontFamily: 'serif',
                lineHeight: 1.6,
                color: '#334155',
                fontSize: '1.1rem',
                whiteSpace: 'pre-wrap',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.02)'
              }}>
                {results?.cover_letter || "Generating cover letter..."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Results;
