import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <h1>Master Your Career with <span className="highlight">AI Intelligence</span></h1>
          <p className="subtitle">
            Bridge the gap between your resume and your dream job.
            Get instant, deep-learning powered analysis and expert suggestions
            tailored for your career growth.
          </p>
          <div className="hero-actions">
            <button className="cta-btn" onClick={() => navigate('/analyze')}>
              <span>Start Analyzing</span>
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Built for Performance</h2>
        <div className="features-grid">
          <div className="glass-panel feature-premium-card">
            <div className="icon-box"><Zap size={40} /></div>
            <h3>Instant Precision</h3>
            <p>Our baseline matching algorithms provide sub-second feedback on your primary technical skills.</p>
          </div>

          <div className="glass-panel feature-premium-card">
            <div className="icon-box"><ShieldCheck size={40} /></div>
            <h3>Gap Detection</h3>
            <p>Identify critical missing dependencies and requirements from modern job descriptions instantly.</p>
          </div>

          <div className="glass-panel feature-premium-card">
            <div className="icon-box"><BarChart3 size={40} /></div>
            <h3>AI Enhancement</h3>
            <p>Leverage Google Gemini 1.5 Pro to receive nuanced career advice and semantic matching insights.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
