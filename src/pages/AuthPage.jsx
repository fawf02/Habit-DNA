import { useState } from 'react';
import { authService } from '../api/apiService';

/**
 * Login/Register Page
 * Handles user authentication with JWT
 */
export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: 'demo@habitdna.io',
    password: 'demo123',
    name: 'Demo User',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.register(formData.email, formData.password, formData.name);
      }

      onAuthSuccess?.();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.dot}>●</span> Habit DNA
          </h1>
          <p style={styles.subtitle}>Трекер привычек с анализом скрытых взаимосвязей</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.tabs}>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              style={{
                ...styles.tabButton,
                borderBottomColor: isLogin ? '#534ab7' : 'transparent',
                color: isLogin ? '#1a1a1a' : '#6e6e73',
              }}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              style={{
                ...styles.tabButton,
                borderBottomColor: !isLogin ? '#534ab7' : 'transparent',
                color: !isLogin ? '#1a1a1a' : '#6e6e73',
              }}
            >
              Регистрация
            </button>
          </div>

          {/* Email Field */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          {/* Password Field */}
          <div style={styles.field}>
            <label style={styles.label}>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {/* Name Field (Register only) */}
          {!isLogin && (
            <div style={styles.field}>
              <label style={styles.label}>Имя</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ваше имя"
                required
                style={styles.input}
              />
            </div>
          )}

          {/* Error Message */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>

          {/* Demo Info */}
          <div style={styles.demo}>
            <p style={styles.demoTitle}>Demo аккаунт:</p>
            <p style={styles.demoText}>Email: <strong>demo@habitdna.io</strong></p>
            <p style={styles.demoText}>Password: <strong>demo123</strong></p>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-background-tertiary)',
    padding: '16px',
  },
  card: {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  dot: {
    color: '#534ab7',
    fontSize: '14px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  tabs: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    borderBottom: '0.5px solid var(--color-border-tertiary)',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '12px 0',
    fontSize: '14px',
    fontWeight: '500',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-sans)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '10px 12px',
    border: '0.5px solid var(--color-border-secondary)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '13px',
    fontFamily: 'var(--font-sans)',
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)',
    transition: 'all 0.15s',
  },
  error: {
    padding: '10px 12px',
    background: '#fee2e2',
    border: '0.5px solid #fca5a5',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '13px',
    color: '#991b1b',
    margin: '8px 0',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, #534ab7 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginTop: '8px',
  },
  demo: {
    padding: '12px',
    background: 'var(--color-background-secondary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '12px',
    marginTop: '16px',
  },
  demoTitle: {
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
    margin: '0 0 6px 0',
  },
  demoText: {
    color: 'var(--color-text-primary)',
    margin: '4px 0',
  },
};
