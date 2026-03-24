import React from 'react';
import { Cpu, Code, Database, Globe, Award, Users, ArrowRight, Zap, Target, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function About() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="about-v4-wrapper">
      {/* Hero Section */}
      <motion.section
        className="about-hero-v4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1>A Developer's Journey into AI</h1>
        <p>
          AI Resume Analyser is a passion project built to explore the power of artificial intelligence
          in solving real-world problems. Designed from scratch by an aspiring software engineer,
          it serves as a showcase of modern web development and algorithmic thinking.
        </p>
      </motion.section>

      {/* Stats Row */}
      <div className="about-stats-grid">
        <motion.div className="about-stat-card" variants={fadeIn} initial="hidden" animate="visible">
          <span className="about-stat-number">100+</span>
          <span className="about-stat-label">Hours Coded</span>
        </motion.div>
        <motion.div className="about-stat-card" variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <span className="about-stat-number">Gemini</span>
          <span className="about-stat-label">AI Integration</span>
        </motion.div>
        <motion.div className="about-stat-card" variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <span className="about-stat-number">React &</span>
          <span className="about-stat-label">FastAPI Stack</span>
        </motion.div>
        <motion.div className="about-stat-card" variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <span className="about-stat-number">0</span>
          <span className="about-stat-label">Bugs (Hopefully!)</span>
        </motion.div>
      </div>

      {/* The Story / Timeline */}
      <section className="about-story-section">
        <h2 className="sub-section-title" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>The Journey</h2>


        <div className="timeline-item-pro">
          <div className="timeline-date">Phase 1</div>
          <div className="timeline-content-pro">
            <h3>The Spark</h3>
            <p>Started with a deep curiosity about how Applicant Tracking Systems (ATS) parse resumes and filter out capable candidates based purely on keywords.</p>
          </div>
        </div>

        <div className="timeline-item-pro">
          <div className="timeline-date">Phase 2</div>
          <div className="timeline-content-pro">
            <h3>The Build</h3>
            <p>Mastered React for the frontend, FastAPI for the backend, and integrated Google Gemini 1.5 Flash to build a contextual, semantic matching engine from scratch.</p>
          </div>
        </div>

        <div className="timeline-item-pro">
          <div className="timeline-date">TODAY</div>
          <div className="timeline-content-pro">
            <h3>The Result</h3>
            <p>A fully functional AI-powered recruitment dashboard that demonstrates my ability to design, develop, and deploy full-stack, AI-integrated applications.</p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="about-values-section">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Core Principles</h2>

          <p style={{ color: '#64748b' }}>The fundamental values driving my development process.</p>
        </div>

        <div className="values-grid-pro">
          <div className="value-card-pro">
            <div className="value-icon-box"><Zap size={28} /></div>
            <h3>Constant Learning</h3>
            <p>Always exploring new frameworks, libraries, and AI models to build faster, smarter, and more efficient applications.</p>
          </div>
          <div className="value-card-pro">
            <div className="value-icon-box"><Code size={28} /></div>
            <h3>Clean Code</h3>
            <p>Committed to writing scalable, maintainable, and well-documented code that adheres to industry best practices.</p>
          </div>
          <div className="value-card-pro">
            <div className="value-icon-box"><Target size={28} /></div>
            <h3>Problem Solving</h3>
            <p>Focusing on turning complex, open-ended requirements into intuitive, user-friendly digital experiences.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="about-cta-footer">
        <h2>Want to test my project?</h2>
        <button
          className="btn-primary"
          style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '14px' }}
          onClick={() => window.location.href = '/analyze/upload'}
        >
          Try the Analyzer <ArrowRight size={20} style={{ marginLeft: '8px' }} />
        </button>
      </section>

    </div>
  );
}

export default About;

