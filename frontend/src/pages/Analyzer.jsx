import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, RefreshCw, ClipboardList, Loader2, Wand2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { analysisSchema } from '../utils/AnalysisSchema';
import { motion, AnimatePresence } from 'framer-motion';

function Analyzer({ setResultsData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [error, setError] = useState('');
  const [showJdHint, setShowJdHint] = useState(false);
  const fileInputRef = useRef(null);
  const jdRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user')) || { email: 'demo@example.com', name: 'User' };
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/history/${user.email}`);
      setHistory(res.data.slice(0, 5));
      console.log("[Analyzer] History refreshed:", res.data.length, "total.");
    } catch (err) {
      console.error("Error fetching history in Analyzer:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') {
      setFile(f);
      setError('');
      if (location.pathname !== '/analyze/upload') navigate('/analyze/upload');
    }
    else setError('Please upload a valid PDF file.');
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f?.type === 'application/pdf') {
      setFile(f);
      setError('');
      if (location.pathname !== '/analyze/upload') navigate('/analyze/upload');
    }
    else setError('Please upload a valid PDF file.');
  };

  const fillDemoJD = () => {
    setJobDescription(`We are looking for a Senior Software Engineer with:
- 5+ years of experience in Python and FastAPI.
- Strong proficiency in React.js and modern frontend tools.
- Experience with MongoDB and RESTful API design.
- Proven track record of delivering scalable web applications.`);
    setError('');
    setShowJdHint(false);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume (PDF) first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('The Job Description is empty! Please paste it below.');
      setShowJdHint(true);
      jdRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError('');
    setProcessStep('Reading Resume PDF...');

    setTimeout(() => setProcessStep('Extracting Skills & Entities...'), 1500);
    setTimeout(() => setProcessStep('Consulting Gemini AI (this may take 20s)...'), 4000);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);
    formData.append('user_email', user.email);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/analyze`, formData, { timeout: 60000 });
      console.log('DEBUG: Analysis result:', res.data);
      
      // --- Zod Validation ---
      const rawData = res.data.results || res.data;
      const validation = analysisSchema.safeParse(rawData);
      
      if (setResultsData) {
        if (validation.success) {
          setResultsData(validation.data);
        } else {
          console.warn("Zod Validation Failed:", validation.error.format());
          setResultsData(rawData); // Fallback to raw data if validation fails but we want to continue
        }
        fetchHistory(); // Refresh the local history list
        const resultId = res.data._id;
        if (resultId) {
          navigate(`/analyze/results/${resultId}`);
        } else {
          navigate('/analyze/results');
        }
      }
    } catch (err) {
      console.error('Analysis failed', err);
      const msg = err.response?.data?.detail || err.message || 'Server error.';
      setError(msg.includes('Network Error') ? 'Cannot reach backend server. Please verify it is running on port 8000.' : msg);
    } finally {
      setIsLoading(false);
      setProcessStep('');
    }
  };

  const isBtnDisabled = !file || !jobDescription.trim();

  return (
    <div className="analyzer-page animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">Upload & Analyze</h1>
        <p className="page-subtitle">Match any resume against a job description using Advanced AI.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card"
            style={{
              marginBottom: '1.5rem',
              padding: '1.25rem',
              borderRadius: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#991b1b'
            }}
          >
            <div style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '12px', color: '#ef4444' }}>
              <AlertCircle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, margin: 0, fontSize: '1rem' }}>Analysis Blocked</p>
              <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.8 }}>{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
            >
              Dismiss
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      <div className="chart-card" style={{ marginBottom: '1.5rem', position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <Loader2 className="loader-spin" size={48} color="var(--primary)" />
            <h3 style={{ marginTop: '1.5rem', color: 'var(--text-main)', fontWeight: 800 }}>AI is working...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center' }}>{processStep}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          <div className="upload-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. Resume (PDF)</p>
              {file && <CheckCircle size={14} color="var(--success)" />}
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => {
                if (location.pathname !== '/analyze/upload') navigate('/analyze/upload');
                fileInputRef.current?.click();
              }}
              style={{
                minHeight: 260,
                border: `2px dashed ${file ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                background: file ? 'var(--primary-light)' : 'var(--bg-main)',
                transition: 'all 0.25s', gap: '0.75rem', padding: '1.5rem', textAlign: 'center'
              }}
            >
              <input type="file" accept=".pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              {file ? (
                <>
                  <div style={{ width: 64, height: 64, background: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(79,70,229,0.2)' }}>
                    <FileText size={32} color="white" />
                  </div>
                  <div style={{ maxWidth: '100%' }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{file.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ padding: '0.5rem 1.25rem', background: 'white', color: '#ef4444', border: '1.5px solid #fee2e2', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Change File</button>
                </>
              ) : (
                <>
                  <div style={{ width: 64, height: 64, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1.5px solid var(--border-color)' }}>
                    <Upload size={30} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Drag resume here</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Only PDF files supported</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="jd-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Job Description</p>
                {jobDescription.trim().length > 20 && <CheckCircle size={14} color="var(--success)" />}
              </div>
              <button
                onClick={fillDemoJD}
                style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Wand2 size={12} /> Auto-Fill Demo JD
              </button>
            </div>
            <textarea
              ref={jdRef}
              style={{
                width: '100%', height: 260, border: `2px solid ${showJdHint ? '#ef4444' : 'var(--border-color)'}`,
                borderRadius: 14, padding: '1.25rem', fontSize: '1rem', color: 'var(--text-main)',
                background: showJdHint ? '#fff1f2' : 'var(--bg-main)', resize: 'none', outline: 'none', transition: 'all 0.2s', lineHeight: 1.6
              }}
              placeholder="Paste the job requirements, key skills, and responsibilities here..."
              value={jobDescription}
              onChange={(e) => { setJobDescription(e.target.value); if (e.target.value.trim()) setShowJdHint(false); }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isBtnDisabled ? (
              <div style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', padding: '8px 16px', borderRadius: '10px' }}>
                <AlertCircle size={20} />
                <span>{!file ? 'NEXT: UPLOAD A RESUME' : 'NEXT: PASTE THE JD'}</span>
              </div>
            ) : (
              <div style={{ color: 'var(--success)', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '8px 16px', borderRadius: '10px' }}>
                <CheckCircle size={20} />
                <span>READY TO ANALYZE</span>
              </div>
            )}
          </div>

          <button
            className={`analyze-btn ${isLoading ? 'loader-pulse' : ''}`}
            onClick={handleAnalyze}
            disabled={isLoading || isBtnDisabled}
            style={{
              minWidth: 200,
              padding: '1rem 2.5rem',
              fontSize: '1.1rem'
            }}
          >
            {isLoading ? (
              <><Loader2 className="loader-spin" size={22} /> Processing...</>
            ) : (
              <><Sparkles size={22} /> Start AI Analysis</>
            )}
          </button>
        </div>
      </div>

      {/* Recent History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-card"
        style={{ marginTop: '1.5rem', padding: '1.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} color="var(--primary)" />
            Recent History
          </h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing last 5 analyses</p>
        </div>

        {isHistoryLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 className="loader-spin" size={24} style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Refreshing history...</p>
          </div>
        ) : history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>File</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Match</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr
                    key={item._id || idx}
                    style={{ borderBottom: '1px solid var(--bg-main)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => navigate(`/analyze/results/${item._id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ padding: '6px', background: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}>
                          <FileText size={14} />
                        </div>
                        {item.filename}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ height: '6px', width: '60px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${item.results.match_score}%`, background: item.results.match_score > 70 ? 'var(--success)' : '#f59e0b' }} />
                        </div>
                        <span style={{ fontWeight: 700, color: item.results.match_score > 70 ? 'var(--success)' : '#f59e0b' }}>{item.results.match_score}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-muted)', textAlign: 'right', fontSize: '0.825rem' }}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0 }}>No history found yet. Start your first analysis above!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Analyzer;

