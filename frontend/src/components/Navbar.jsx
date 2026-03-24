import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Home, Info, Sparkles, LogOut, LogIn } from 'lucide-react';
import Logo from './Logo';

function Navbar({ isAuthenticated, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Logo size="small" />
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={18} /> Home
          </Link>

          {isAuthenticated && (
            <Link to="/analyze" className={`nav-link ${isActive('/analyze') ? 'active' : ''}`}>
              <FileText size={18} /> Analyze
            </Link>
          )}

          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
            <Info size={18} /> About
          </Link>

          {isAuthenticated ? (
            <button onClick={handleLogoutClick} className="nav-btn-outline">
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link to="/login" className="nav-btn-primary">
              <LogIn size={18} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
