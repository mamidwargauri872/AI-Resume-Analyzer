import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Analyzer from './pages/Analyzer';
import Results from './pages/Results';
import About from './pages/About';
import Settings from './pages/Settings';
import Templates from './pages/Templates';

import LandingPage from './pages/LandingPage';

import DashboardHome from './pages/DashboardHome';

/* ── Stable Layout Components (Outside App to prevent remounting) ── */

const AppLayout = ({ children, onLogout }) => (
  <div className="app-container">
    <Sidebar onLogout={onLogout} />
    <div className="main-content">
      <Header onLogout={onLogout} />
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  </div>
);

const Protected = ({ children, isAuthenticated, onLogout }) => {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <AppLayout onLogout={onLogout}>{children}</AppLayout>;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultsData, setResultsData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn !== isAuthenticated) {
      setIsAuthenticated(loggedIn);
    }
  }, [location.pathname]);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
    navigate('/analyze/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setResultsData(null);
    navigate('/');
  };

  return (
    <Routes>
      {/* Public Home */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/analyze/home" replace />
            : <LandingPage onLogin={handleLogin} />
        }
      />

      {/* 🔐 Professional Auth Routes */}
      <Route path="/auth/login" element={<LandingPage onLogin={handleLogin} defaultModal="login" />} />
      <Route path="/auth/signup" element={<LandingPage onLogin={handleLogin} defaultModal="signup" />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

      {/* 📊 Professional Nested App Routes */}
      <Route path="/analyze/home" element={<Protected isAuthenticated={isAuthenticated} onLogout={handleLogout}><DashboardHome /></Protected>} />
      <Route path="/analyze/upload" element={<AppLayout onLogout={handleLogout}><Analyzer setResultsData={setResultsData} /></AppLayout>} />
      <Route path="/analyze/history" element={<Navigate to="/analyze/home" replace />} />
      <Route path="/analyze/results/:id" element={<Protected isAuthenticated={isAuthenticated} onLogout={handleLogout}><Results /></Protected>} />
      <Route path="/analyze/results" element={<Protected isAuthenticated={isAuthenticated} onLogout={handleLogout}><Results results={resultsData} /></Protected>} />
      <Route path="/analyze/about" element={<Protected isAuthenticated={isAuthenticated} onLogout={handleLogout}><About /></Protected>} />
      <Route path="/analyze/settings" element={<Protected isAuthenticated={isAuthenticated} onLogout={handleLogout}><Settings /></Protected>} />
      <Route path="/analyze/templates" element={<Protected isAuthenticated={isAuthenticated} onLogout={handleLogout}><Templates /></Protected>} />


      {/* Legacy Redirects for professional consistency */}
      <Route path="/analyze" element={<Navigate to="/analyze/home" replace />} />
      <Route path="/upload" element={<Navigate to="/analyze/upload" replace />} />
      <Route path="/history" element={<Navigate to="/analyze/home" replace />} />
      <Route path="/results/:id" element={<Navigate to="/analyze/results/:id" replace />} />
      <Route path="/results" element={<Navigate to="/analyze/results" replace />} />
      <Route path="/about" element={<Navigate to="/analyze/about" replace />} />
      <Route path="/dashboard" element={<Navigate to="/analyze/home" replace />} />


      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
