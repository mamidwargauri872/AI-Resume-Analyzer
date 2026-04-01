import React, { useState } from 'react';
import { Wand2, Loader2, FileText, CheckCircle2, ChevronRight, Sparkles, Download } from 'lucide-react';
import axios from 'axios';

const AIBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      setError("Please provide more details about your experience and the role you want.");
      return;
    }

    console.log('[AI Builder] Starting resume generation...');
    console.log('[AI Builder] User prompt:', prompt);

    setLoading(true);
    setError(null);
    setResumeData(null);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (user.email) {
        formData.append('user_email', user.email);
        console.log('[AI Builder] User email:', user.email);
      }

      console.log('[AI Builder] POSTing to /api/resume/generate...');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/resume/generate`, formData);
      console.log('[AI Builder] Raw response:', response.data);
      
      if (response.data && response.data.status === 'success') {
        console.log('[AI Builder] SUCCESS! Generated resume for:', response.data.data.name);
        console.log('[AI Builder] Full resume data:', response.data.data);
        setResumeData(response.data.data);
      } else {
        console.error('[AI Builder] Unexpected response format:', response.data);
        setError("Failed to generate resume. Please try again.");
      }
    } catch (err) {
      console.error('[AI Builder] API call failed:', err);
      console.error('[AI Builder] Error details:', err.response?.data || err.message);
      setError(err.response?.data?.detail || "An error occurred connecting to the AI Engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-overview animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="dashboard-page-header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 className="page-title premium-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
           <div style={{ padding: '0.6rem', background: '#f5f3ff', borderRadius: '16px', color: '#8b5cf6', display: 'flex', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)' }}><Wand2 size={32} /></div>
           AI Resume Builder
        </h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Generate a highly customized, professional resume from a simple text prompt.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: resumeData ? '1fr 1.5fr' : '1fr', gap: '2rem', transition: 'all 0.5s ease' }}>
        
        {/* Prompt Input Section */}
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', height: 'fit-content' }}>
           <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Wand2 size={20} color="#8b5cf6" />
             Describe Your Experience
           </h2>
           <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
             Tell our AI about your current role, years of experience, key skills, and the type of job you are applying for. The more detail, the better the result.
           </p>
           
           <textarea 
             value={prompt}
             onChange={(e) => { setPrompt(e.target.value); setError(null); }}
             placeholder="e.g. I am a highly motivated marketing manager with 5 years of experience in B2B SaaS. I specialize in SEO, content strategy, and team leadership. Generate a resume applying for a Senior Marketing Director role..."
             style={{ width: '100%', minHeight: '180px', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical', marginBottom: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
             onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
             onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
           />

           {error && (
             <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Error:</span> {error}
             </div>
           )}

           <button 
             onClick={handleGenerate}
             disabled={loading || prompt.length < 5}
             className="primary-btn-pill"
             style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || prompt.length < 5) ? 0.7 : 1, transition: 'all 0.3s' }}
           >
             {loading ? <><Loader2 size={18} className="animate-spin" /> Generating AI Resume...</> : <><Sparkles size={18} /> Generate Resume</>}
           </button>
        </div>

        {/* Generated Result Section */}
        {resumeData && (
          <div className="glass-card animate-slide-up" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
               <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <CheckCircle2 size={20} color="#10b981" /> Generated Successfully
               </h2>
               <button 
                  onClick={() => {
                    let txt = `${resumeData.name || 'Candidate Name'}\n`;
                    txt += `${resumeData.contact || ''}\n\n`;
                    txt += `PROFESSIONAL SUMMARY\n${resumeData.summary || ''}\n\n`;
                    txt += `EXPERIENCE\n`;
                    (resumeData.experience || []).forEach(exp => {
                      txt += `${exp.title} | ${exp.company} | ${exp.location} | ${exp.dates}\n`;
                      (exp.bullets || []).forEach(b => txt += `- ${b}\n`);
                      txt += `\n`;
                    });
                    txt += `EDUCATION\n`;
                    (resumeData.education || []).forEach(edu => {
                      txt += `${edu.degree} | ${edu.school} | ${edu.location} | ${edu.dates}\n`;
                    });
                    txt += `\nSKILLS\n${(resumeData.skills || []).join(', ')}\n\n`;
                    if (resumeData.projects && resumeData.projects.length > 0) {
                        txt += `PROJECTS\n`;
                        resumeData.projects.forEach(p => {
                            txt += `${p.name} | ${p.technologies}\n`;
                            (p.bullets || []).forEach(b => txt += `- ${b}\n`);
                            txt += `\n`;
                        });
                    }
                    if (resumeData.achievements && resumeData.achievements.length > 0) {
                        txt += `ACHIEVEMENTS\n`;
                        resumeData.achievements.forEach(a => txt += `- ${a}\n`);
                        txt += `\n`;
                    }
                    if (resumeData.interests && resumeData.interests.length > 0) {
                        txt += `INTERESTS\n${resumeData.interests.join(', ')}\n\n`;
                    }
                    
                    const blob = new Blob([txt], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `AI_Resume_${resumeData.name?.replace(/\s+/g, '_') || 'Generated'}.txt`;
                    a.click();
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
               >
                 <Download size={16} /> Download Free Text Resume
               </button>
            </div>

            {/* Simulated Live Document Preview */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
               <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '0.25rem' }}>{resumeData.name}</h1>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{resumeData.contact}</p>
               </div>

               <section style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</h3>
                  <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6 }}>{resumeData.summary}</p>
               </section>

               <section style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</h3>
                  {resumeData.experience?.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                         <strong style={{ color: '#0f172a' }}>{exp.title}</strong>
                         <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{exp.dates}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 500 }}>{exp.company} - {exp.location}</div>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                        {exp.bullets?.map((bullet, i) => (
                           <li key={i} style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.25rem' }}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
               </section>

               <section style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                     {resumeData.skills?.map((skill, idx) => (
                       <span key={idx} style={{ padding: '0.25rem 0.75rem', background: '#f1f5f9', color: '#334155', borderRadius: '4px', fontSize: '0.85rem' }}>{skill}</span>
                     ))}
                  </div>
               </section>

               {resumeData.projects && resumeData.projects.length > 0 && (
                 <section style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projects</h3>
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx} style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                           <strong style={{ color: '#0f172a' }}>{proj.name}</strong>
                           <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{proj.technologies}</span>
                        </div>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                          {proj.bullets?.map((bullet, i) => (
                             <li key={i} style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.25rem' }}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                 </section>
               )}

               {resumeData.achievements && resumeData.achievements.length > 0 && (
                 <section style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Achievements</h3>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                      {resumeData.achievements.map((ach, idx) => (
                         <li key={idx} style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.25rem' }}>{ach}</li>
                      ))}
                    </ul>
                 </section>
               )}

               {resumeData.interests && resumeData.interests.length > 0 && (
                 <section style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interests</h3>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6 }}>{resumeData.interests.join(', ')}</p>
                 </section>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBuilder;
