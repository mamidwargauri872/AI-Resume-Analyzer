import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Download, Eye, Edit3, X, Save, CheckCircle } from 'lucide-react';
import minimalistImg from '../assets/templates/minimalist.png';
import professionalImg from '../assets/templates/professional.png';
import executiveImg from '../assets/templates/executive.png';
import creativeImg from '../assets/templates/creative.png';
import dataAnalystImg from '../assets/templates/data_analyst.png';
import fresherImg from '../assets/templates/fresher.png';

const defaultTemplates = [
  {
    id: 1,
    name: 'The Minimalist',
    color: '#1e293b',
    bg: '#f8fafc',
    image: minimalistImg,
    description: 'Clean, highly ATS-friendly single-column layout.',
    fields: {
      name: 'Alex Johnson',
      contact: 'New York, NY | (555) 100-2000 | alex@email.com',
      summary: 'Results-driven software engineer with 5+ years of experience building scalable web applications. Passionate about clean code and user experience.',
      experience: '• Software Engineer — TechCorp (2021–Present)\n  - Built RESTful APIs serving 1M+ users\n  - Reduced page load time by 40% via optimization\n\n• Junior Developer — Startup Inc. (2019–2021)\n  - Developed 10+ features for the core SaaS product\n  - Collaborated in an Agile team of 8 engineers',
      education: 'B.Sc. Computer Science — State University (2015–2019)',
      projects: '• AI Resume Analyzer: Full-stack React/FastAPI app with Gemini AI.\n• E-commerce Engine: Scalable microservices architecture.',
      skills: 'JavaScript, React, Node.js, Python, PostgreSQL, Git, REST APIs',
      interests: 'Open source contribution, UI Design, Cybersecurity',
      achievements: '• Employee of the Year (2022) at TechCorp\n• Winner of City Hackathon 2019'
    }
  },
  {
    id: 2,
    name: 'The Professional',
    color: '#2563eb',
    bg: '#eff6ff',
    image: professionalImg,
    description: 'Traditional structure perfect for corporate roles.',
    fields: {
      name: 'Maria Gonzalez',
      contact: 'Chicago, IL | (555) 200-3000 | maria@email.com',
      summary: 'Senior Project Manager with a decade of experience in enterprise software delivery. PMP certified with expertise in Agile and Waterfall methodologies.',
      experience: '• Senior Project Manager — Enterprise Ltd. (2019–Present)\n  - Managed portfolio of 12 simultaneous projects worth $5M\n  - Reduced project overruns by 35% through risk management\n\n• Project Manager — Mid Co. (2016–2019)\n  - Delivered 20+ software releases on time and under budget',
      education: 'MBA — Chicago Business School (2014–2016)\nB.A. Business Administration — University of Illinois (2010–2014)',
      projects: '• CRM Integration: Automated sales workflow for 500+ users.\n• Agile Transformation: Led 5 teams to 20% faster delivery cycles.',
      skills: 'Project Management, Agile, Scrum, JIRA, MS Project, Stakeholder Management, PMP',
      interests: 'Strategic Planning, Public Speaking, Mentoring',
      achievements: '• Delivered $2M project 2 months ahead of schedule\n• Certified Scrum Master (CSM)'
    }
  },
  {
    id: 3,
    name: 'The Executive',
    color: '#059669',
    bg: '#ecfdf5',
    image: executiveImg,
    description: 'Dense, high-information design for senior positions.',
    fields: {
      name: 'James Carter',
      contact: 'San Francisco, CA | (555) 300-4000 | james@email.com',
      summary: 'Visionary CTO with 15+ years building and scaling engineering organizations. Passionate about leveraging technology to solve complex business problems and driving company growth.',
      experience: '• Chief Technology Officer — ScaleUp Inc. (2018–Present)\n  - Led org from 10 to 200+ engineers, IPO in 2023\n  - Architected multi-cloud infrastructure supporting $500M in GMV\n\n• VP Engineering — GrowthCo (2014–2018)\n  - Grew engineering team from 5 to 80 members\n  - Drove 99.9% uptime across all production systems',
      education: 'M.S. Computer Science — MIT (2008–2010)\nB.Sc. Computer Engineering — Stanford University (2004–2008)',
      projects: '• ScaleUp Core Platform: Led rebuild from monolith to microservices.\n• Global AI Strategy: Implemented LLMs for customer success automation.',
      skills: 'Engineering Leadership, Cloud Architecture, AWS, GCP, Kubernetes, Python, Go, Organizational Design',
      interests: 'Angel Investing, Tech Policy, Marathon Running',
      achievements: '• Featured in Forbes 30 Under 30 in Technology\n• Patented a novel load-balancing algorithm'
    }
  },
  {
    id: 4,
    name: 'The Creative',
    color: '#7c3aed',
    bg: '#f5f3ff',
    image: creativeImg,
    description: 'Eye-catching layout for design & creative roles.',
    fields: {
      name: 'Priya Sharma',
      contact: 'Austin, TX | (555) 400-5000 | priya@email.com',
      summary: 'UX/UI Designer with 6+ years crafting beautiful, intuitive digital experiences. Specialized in design systems, user research, and product thinking.',
      experience: '• Lead UX Designer — DesignFirst Co. (2021–Present)\n  - Designed end-to-end experience for app with 2M+ users\n  - Increased user retention by 28% through usability improvements\n\n• UI Designer — Creative Agency (2018–2021)\n  - Delivered brand identities and web apps for 30+ clients\n  - Won 3 industry design awards',
      education: 'B.F.A. Graphic Design — Art Institute of Austin (2014–2018)',
      projects: '• EcoTrack Design System: Comprehensive UI library for green tech.\n• VR Museum Experience: Immersive UI for historical educational app.',
      skills: 'Figma, Adobe XD, Sketch, User Research, Design Systems, Prototyping, HTML/CSS',
      interests: 'Photography, Digital Illustration, Traveling',
      achievements: '• Awwwards Site of the Year 2022 (Contributor)\n• Published guest post on UX Planet'
    }
  },
  {
    id: 5,
    name: 'The Data Analyst',
    color: '#d97706',
    bg: '#fffbeb',
    image: dataAnalystImg,
    description: 'Optimized for data science and analytics roles.',
    fields: {
      name: 'Ravi Patel',
      contact: 'Boston, MA | (555) 500-6000 | ravi@email.com',
      summary: 'Data Scientist with expertise in predictive modeling, NLP, and data visualization. Skilled at transforming complex datasets into actionable business insights.',
      experience: '• Senior Data Scientist — Analytics Corp (2020–Present)\n  - Built ML models improving revenue forecast accuracy by 22%\n  - Processed 10TB+ of data daily using Spark pipelines\n\n• Data Analyst — Research Co. (2018–2020)\n  - Created dashboards used by C-suite for strategic planning\n  - Automated 15 manual reports, saving 40 hours/week',
      education: 'M.S. Data Science — Boston University (2016–2018)\nB.Sc. Statistics — University of Mumbai (2012–2016)',
      projects: '• Churn Prediction Model: Saved $1M+ in annual revenue.\n• Sentiment Analysis Tool: Analyzed 1M+ tweets for brand feedback.',
      skills: 'Python, R, SQL, TensorFlow, Scikit-learn, Tableau, Power BI, Apache Spark, NLP',
      interests: 'Chess, Data Journalism, Sustainability',
      achievements: '• Kaggle Master (Top 1% of participants)\n• Published 2 research papers on Neural Networks'
    }
  },
  {
    id: 6,
    name: 'The Fresher',
    color: '#dc2626',
    bg: '#fef2f2',
    image: fresherImg,
    description: 'Perfect for fresh graduates entering the workforce.',
    fields: {
      name: 'Anjali Mehta',
      contact: 'Pune, India | +91-555-600-7000 | anjali@email.com',
      summary: 'Enthusiastic Computer Science graduate seeking a challenging software development role. Strong foundation in full-stack development and a passion for building innovative solutions.',
      experience: '• Intern — WebTech Solutions (Jun 2023–Aug 2023)\n  - Developed 3 features for the company\'s e-commerce platform\n  - Fixed 20+ bugs and improved test coverage by 15%',
      education: 'B.Tech Computer Science — Pune University (2020–2024) — CGPA: 8.7/10',
      projects: '• Personal Portfolio: Built with React and Three.js.\n• Task Manager App: Full-stack MERN application.',
      skills: 'Java, Spring Boot, React, MySQL, HTML, CSS, Git, Data Structures, Algorithms',
      interests: 'Table Tennis, Guitar, Competitive Coding',
      achievements: '• Academic Excellence Award 2024\n• Smart India Hackathon Finalist'
    }
  },
];

const TemplateCard = ({ template, onView, onEdit }) => (
  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
  >
    {/* Preview thumbnail */}
    <div style={{ background: template.bg, height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {template.image ? (
        <img src={template.image} alt={template.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <div style={{ height: '10px', background: template.color, borderRadius: '4px', width: '55%' }} />
          <div style={{ height: '6px', background: template.color + '60', borderRadius: '4px', width: '80%' }} />
          <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '4px', width: '90%', marginTop: '0.4rem' }} />
          <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '4px', width: '75%' }} />
          <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '4px', width: '82%' }} />
          <div style={{ height: '8px', background: template.color + '40', borderRadius: '4px', width: '45%', marginTop: '0.4rem' }} />
        </div>
      )}
    </div>

    {/* Card info */}
    <div style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{template.name}</h3>
      <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>{template.description}</p>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => { console.log(`[Templates] Viewing ${template.name}`); onView(template); }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem', borderRadius: '8px', background: template.bg, color: template.color, border: `1.5px solid ${template.color}40`, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          <Eye size={14} /> View
        </button>
        <button onClick={() => { console.log(`[Templates] Editing ${template.name}`); onEdit(template); }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem', borderRadius: '8px', background: template.bg, color: template.color, border: `1.5px solid ${template.color}40`, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          <Edit3 size={14} /> Edit
        </button>
      </div>
    </div>
  </div>
);

// --- Unique Template Layouts ---

const Section = ({ title, color, children, align = 'left' }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <h3 style={{
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color,
      borderBottom: `1.5px solid ${color}40`,
      paddingBottom: '0.3rem',
      marginBottom: '0.6rem',
      fontWeight: 700,
      textAlign: align
    }}>{title}</h3>
    {children}
  </div>
);

const MinimalistLayout = ({ fields, color }) => (
  <div style={{ padding: '2rem', background: 'white', color: '#1a1a1a', fontSize: '0.9rem', minHeight: '297mm', boxSizing: 'border-box' }}>
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>{fields.name}</h1>
      <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.5rem' }}>{fields.contact}</p>
    </div>
    <Section title="Summary" color={color} align="center"><p style={{ textAlign: 'center' }}>{fields.summary}</p></Section>
    <Section title="Experience" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.experience}</pre></Section>
    <Section title="Education" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.education}</pre></Section>
    <Section title="Projects" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.projects}</pre></Section>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <Section title="Skills" color={color}><p>{fields.skills}</p></Section>
      <div>
        <Section title="Interests" color={color}><p>{fields.interests}</p></Section>
        <Section title="Achievements" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.achievements}</pre></Section>
      </div>
    </div>
  </div>
);

const ProfessionalLayout = ({ fields, color }) => (
  <div style={{ padding: '2rem', background: 'white', fontFamily: 'serif', minHeight: '297mm' }}>
    <div style={{ borderBottom: `4px solid ${color}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
      <h1 style={{ fontSize: '2.2rem', margin: 0 }}>{fields.name}</h1>
      <p style={{ fontStyle: 'italic', color: '#444' }}>{fields.contact}</p>
    </div>
    <Section title="Professional Profile" color={color}>{fields.summary}</Section>
    <Section title="Work Experience" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.experience}</pre></Section>
    <Section title="Key Projects" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.projects}</pre></Section>
    <Section title="Education" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.education}</pre></Section>
    <Section title="Expertise" color={color}>{fields.skills}</Section>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
      <Section title="Interests" color={color}>{fields.interests}</Section>
      <Section title="Awards" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.achievements}</pre></Section>
    </div>
  </div>
);

const ExecutiveLayout = ({ fields, color }) => (
  <div style={{ display: 'flex', minHeight: '297mm', background: 'white' }}>
    {/* Sidebar */}
    <div style={{ width: '30%', background: '#1e293b', color: 'white', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>{fields.name.split(' ').map((n, i) => <div key={i}>{n}</div>)}</h1>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '2rem' }}>{fields.contact.split(' | ').map((c, i) => <div key={i} style={{ marginBottom: '0.4rem' }}>{c}</div>)}</div>
      <Section title="Skills" color="white"><p style={{ fontSize: '0.85rem' }}>{fields.skills}</p></Section>
      <Section title="Interests" color="white"><p style={{ fontSize: '0.85rem' }}>{fields.interests}</p></Section>
    </div>
    {/* Main Content */}
    <div style={{ width: '70%', padding: '2.5rem 2rem' }}>
      <Section title="Executive Summary" color={color}><p style={{ fontStyle: 'italic' }}>{fields.summary}</p></Section>
      <Section title="Strategic Experience" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.88rem' }}>{fields.experience}</pre></Section>
      <Section title="Education" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.88rem' }}>{fields.education}</pre></Section>
      <Section title="Notable Projects" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.88rem' }}>{fields.projects}</pre></Section>
      <Section title="Major Awards" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.88rem' }}>{fields.achievements}</pre></Section>
    </div>
  </div>
);

const CreativeLayout = ({ fields, color }) => (
  <div style={{ padding: '0', background: 'white', minHeight: '297mm' }}>
    <div style={{ background: color, color: 'white', padding: '2.5rem 2rem', marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>{fields.name}</h1>
      <p style={{ opacity: 0.9, fontSize: '1rem', fontWeight: 500 }}>{fields.contact}</p>
    </div>
    <div style={{ padding: '0 2rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        <div>
          <Section title="My Story" color={color}>{fields.summary}</Section>
          <Section title="The Highlights" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem' }}>{fields.experience}</pre></Section>
          <Section title="Projects" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem' }}>{fields.projects}</pre></Section>
        </div>
        <div>
          <Section title="Expertise" color={color}>{fields.skills}</Section>
          <Section title="Foundation" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem' }}>{fields.education}</pre></Section>
          <Section title="Passions" color={color}>{fields.interests}</Section>
          <Section title="Glory" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem' }}>{fields.achievements}</pre></Section>
        </div>
      </div>
    </div>
  </div>
);

const DataAnalystLayout = ({ fields, color }) => (
  <div style={{ padding: '2rem', background: '#fafafa', color: '#333', minHeight: '297mm' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>{fields.name}</h1>
        <p style={{ fontWeight: 600, color: color }}>Data Insights Expert</p>
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>{fields.contact.split(' | ').map((c, i) => <div key={i}>{c}</div>)}</div>
    </div>
    <Section title="Professional Summary" color={color}>{fields.summary}</Section>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <Section title="Technical Skills" color={color}><p style={{ background: '#eee', padding: '1rem', borderRadius: '8px' }}>{fields.skills}</p></Section>
      <Section title="Education" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.education}</pre></Section>
    </div>
    <Section title="Professional Experience" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.experience}</pre></Section>
    <Section title="Key Analytical Projects" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontWeight: 500 }}>{fields.projects}</pre></Section>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <Section title="Interests" color={color}>{fields.interests}</Section>
      <Section title="Achievements" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.achievements}</pre></Section>
    </div>
  </div>
);

const FresherLayout = ({ fields, color }) => (
  <div style={{ padding: '2rem', background: 'white', minHeight: '297mm' }}>
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', borderBottom: `2px solid ${color}`, display: 'inline-block', paddingBottom: '0.25rem' }}>{fields.name}</h1>
      <p style={{ marginTop: '0.5rem' }}>{fields.contact}</p>
    </div>
    <Section title="Career Objective" color={color}>{fields.summary}</Section>
    <Section title="Academic Background" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>{fields.education}</pre></Section>
    <Section title="Projects & Internships" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.experience}\n\n{fields.projects}</pre></Section>
    <Section title="Skills & Tools" color={color}>{fields.skills}</Section>
    <Section title="Extra-Curricular Activities" color={color}>{fields.interests}</Section>
    <Section title="Accomplishments" color={color}><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fields.achievements}</pre></Section>
  </div>
);

const ResumePreview = ({ template, fields }) => {
  const layouts = {
    1: MinimalistLayout,
    2: ProfessionalLayout,
    3: ExecutiveLayout,
    4: CreativeLayout,
    5: DataAnalystLayout,
    6: FresherLayout
  };

  const LayoutComponent = layouts[template.id] || MinimalistLayout;

  return (
    <div className="resume-a4" style={{
      width: '210mm',
      minHeight: '297mm',
      margin: '0',
      position: 'relative',
      background: 'white'
    }}>
      <LayoutComponent fields={fields} color={template.color} />
    </div>
  );
};


const Modal = ({ template, mode, onClose }) => {
  const [fields, setFields] = useState({ ...template.fields });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSave = async () => {
    console.log(`[Templates] Saving changes for ${fields.name}...`);
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        template_name: template.name,
        user_email: user.email || 'anonymous',
        fields: fields
      };

      console.log('[Templates] POSTing to /api/templates/save...');
      console.log('[Templates] Payload:', payload);

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/templates/save`, payload);

      console.log('[Templates] Server Response:', response.data);

      if (response.data && response.data.status === 'success') {
        console.log('[Templates] SUCCESS! Template saved to MongoDB.');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        console.error('[Templates] Save failed on server:', response.data);
        alert("Failed to save template to database.");
      }
    } catch (err) {
      console.error('[Templates] API error during save:', err);
      console.error('[Templates] Error details:', err.response?.data || err.message);
      alert("An error occurred while saving to the database.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (typeof window.html2pdf === 'undefined') {
      alert("PDF library is still loading. Please wait a few seconds and try again.");
      return;
    }

    console.log(`[Templates] Starting visible export for ${template.name}...`);
    setIsDownloading(true);

    // Give the browser time to render the visible target
    setTimeout(() => {
      const element = document.getElementById('resume-pdf-target');
      if (!element) {
        console.error('[Templates] Download target element not found!');
        setIsDownloading(false);
        return;
      }

      const opt = {
        margin: 0,
        filename: `${template.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().from(element).set(opt).save().then(() => {
        console.log('[Templates] PDF Export complete.');
        setIsDownloading(false);
      }).catch(err => {
        console.error('[Templates] PDF Export error:', err);
        setIsDownloading(false);
      });
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: 'white', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: template.color }} />
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{template.name}</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: saved ? '#10b981' : template.color, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleDownload} disabled={isDownloading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: isDownloading ? 0.7 : 1 }}>
              <Download size={16} /> {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button onClick={onClose}
              style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
              <X size={20} color="#475569" />
            </button>
          </div>
        </div>

        {/* Modal Body - Split View */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>

          {/* 1. PDF CAPTURE TARGET (Renders on-screen only during download) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: isDownloading ? '0' : '-10000px',
            width: '100%',
            height: '100%',
            zIndex: isDownloading ? 20000 : -100,
            opacity: isDownloading ? 1 : 0,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'visible'
          }}>
            <h3 style={{ color: '#0f172a', marginBottom: '1rem' }}>Generating PDF...</h3>
            <div id="resume-pdf-target" style={{
              width: '210mm',
              minHeight: '297mm',
              background: 'white',
              boxShadow: '0 0 20px rgba(0,0,0,0.15)'
            }}>
              <ResumePreview template={template} fields={fields} />
            </div>
          </div>

          {/* 2. UI VIEW (Scaled for display) */}
          <div style={{ flex: 1.2, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#cbd5e1', boxShadow: 'inset -2px 0 10px rgba(0,0,0,0.05)' }}>
            <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center', marginBottom: '-135mm' }}>
              <div style={{ background: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <ResumePreview template={template} fields={fields} />
              </div>
            </div>
          </div>

          <div style={{ flex: 0.8, padding: '2rem', overflowY: 'auto', background: 'white', borderLeft: '1px solid #e2e8f0' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color={template.color} /> Customize Your Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {Object.entries(fields).map(([key, val]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{key.replace('_', ' ')}</label>
                    {['experience', 'education', 'projects', 'achievements', 'summary'].includes(key) ? (
                      <textarea value={val} rows={key === 'summary' ? 3 : 5}
                        onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = template.color}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    ) : (
                      <input type="text" value={val}
                        onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = template.color}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, textAlign: 'center' }}>💡 Tip: Use bullet points (•) for experience and achievements to make them more readable in PDF.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Downloading Overlay */}
        {isDownloading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ margin: 0, color: '#0f172a' }}>Generating PDF...</h3>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryCard = ({ item, baseTemplate, onView, onEdit }) => (
  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ background: baseTemplate.bg, height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>
            {new Date(item.created_at).toLocaleDateString()}
        </div>
        {baseTemplate.image ? (
            <img src={baseTemplate.image} alt={baseTemplate.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        ) : null}
    </div>
    <div style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{item.fields?.name || "Untitled"}</h3>
      <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>Template: {item.template_name}</p>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => { console.log(`[Templates] Viewing History`); onView(); }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem', borderRadius: '8px', background: baseTemplate.bg, color: baseTemplate.color, border: `1.5px solid ${baseTemplate.color}40`, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          <Eye size={14} /> View
        </button>
        <button onClick={() => { console.log(`[Templates] Editing History`); onEdit(); }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem', borderRadius: '8px', background: baseTemplate.bg, color: baseTemplate.color, border: `1.5px solid ${baseTemplate.color}40`, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          <Edit3 size={14} /> Continue Editing
        </button>
      </div>
    </div>
  </div>
);

const Templates = () => {
  const [modal, setModal] = useState(null); // { template, mode }
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'history'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.email) {
          console.warn("No user email found in localStorage.");
          return;
      }
      setLoadingHistory(true);
      try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/templates/history/${user.email}`);
          setHistory(res.data);
      } catch (err) {
          console.error("Error fetching template history:", err);
      } finally {
          setLoadingHistory(false);
      }
  };

  useEffect(() => {
      if (activeTab === 'history') {
          fetchHistory();
      }
  }, [activeTab]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ padding: '0.6rem', background: '#eff6ff', borderRadius: '14px', color: '#3b82f6', display: 'flex' }}><Layout size={28} /></div>
          Free Resume Templates
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          6 professional templates. Click <strong>View</strong> to preview, <strong>Edit</strong> to customize, then <strong>Download</strong> instantly.
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <button onClick={() => setActiveTab('all')} style={{ padding: '0.6rem 2rem', borderRadius: '24px', background: activeTab === 'all' ? '#2563eb' : '#f1f5f9', color: activeTab === 'all' ? 'white' : '#475569', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s', boxShadow: activeTab === 'all' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none' }}>All Templates</button>
        <button onClick={() => setActiveTab('history')} style={{ padding: '0.6rem 2rem', borderRadius: '24px', background: activeTab === 'history' ? '#2563eb' : '#f1f5f9', color: activeTab === 'history' ? 'white' : '#475569', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s', boxShadow: activeTab === 'history' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none' }}>My Saved Resumes</button>
      </div>

      {activeTab === 'all' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {defaultTemplates.map(t => (
            <TemplateCard key={t.id} template={t}
              onView={tmpl => setModal({ template: tmpl, mode: 'view' })}
              onEdit={tmpl => setModal({ template: tmpl, mode: 'edit' })} />
          ))}
        </div>
      ) : (
        <div>
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '1.2rem', fontWeight: 600 }}>Loading your saved resumes...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>No saved resumes yet</h3>
              <p style={{ color: '#64748b' }}>Go to 'All Templates' and customize one to see it here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {history.map(item => {
                const baseTemplate = defaultTemplates.find(t => t.name === item.template_name) || defaultTemplates[0];
                const mergedTemplate = { ...baseTemplate, fields: item.fields };
                return (
                  <HistoryCard key={item._id} item={item} baseTemplate={baseTemplate}
                    onView={() => setModal({ template: mergedTemplate, mode: 'view' })}
                    onEdit={() => setModal({ template: mergedTemplate, mode: 'edit' })} />
                );
              })}
            </div>
          )}
        </div>
      )}

      {modal && (
        <Modal template={modal.template} mode={modal.mode} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

export default Templates;
