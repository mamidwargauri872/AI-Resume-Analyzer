import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Upload, Info, LogOut, Sparkles, ChevronRight, Home, Settings, Layout } from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { to: '/analyze/home', label: 'Home', icon: <Home size={20} /> },
  { to: '/analyze/upload', label: 'Upload & Analyze', icon: <Upload size={20} /> },
  { to: '/analyze/templates', label: 'Free Templates', icon: <Layout size={20} /> },
  { to: '/analyze/settings', label: 'Settings', icon: <Settings size={20} /> },
  { to: '/analyze/about', label: 'About', icon: <Info size={20} /> },
];



const Sidebar = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@example.com' };
  const initials = (user.name || user.email || 'U').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
        <Logo size="xxlarge" />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {icon}
            <span className="nav-label">{label}</span>
            <ChevronRight size={16} className="arrow-icon" />
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p className="user-name">{user.name || 'User'}</p>
            <p className="user-email" style={{ fontSize: '0.7rem', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
          </div>
          <button className="logout-mini-btn" onClick={onLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
