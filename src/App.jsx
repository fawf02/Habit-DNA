import { useState, useEffect } from 'react';
import { authService } from './api/apiService';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);
    setLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-background-tertiary)',
      }}>
        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <AuthPage onAuthSuccess={handleAuthSuccess} />
  );
}
