import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@example.com' });
  const initials = (user.name || user.email || 'U').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const handleProfileUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@example.com' });
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <header className="dashboard-header" style={{ justifyContent: 'flex-end', padding: '0 2rem' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div
          className={`header-user-dropdown ${showProfile ? 'active' : ''}`}
          onClick={() => setShowProfile(!showProfile)}
          style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}
        >
          <div className="user-avatar-small">
            <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{initials}</span>
          </div>
          <span className="user-name-text">{user.name || user.email?.split('@')[0] || 'User'}</span>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </div>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="header-dropdown-card"
              style={{ width: 220, right: 0, marginTop: '8px' }}
            >
              <div className="dropdown-profile-header">
                <p className="p-name" style={{ margin: 0 }}>{user.name || 'User'}</p>
                <p className="p-email" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.email}</p>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item"
                onClick={() => { setShowProfile(false); navigate('/analyze/settings'); }}
              >
                <User size={16} /> <span>Profile Details</span>
              </button>
              <button
                className="dropdown-item logout"
                onClick={(e) => { e.stopPropagation(); onLogout(); }}
                style={{ color: '#ef4444' }}
              >
                <LogOut size={16} /> <span>Log Out Account</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
