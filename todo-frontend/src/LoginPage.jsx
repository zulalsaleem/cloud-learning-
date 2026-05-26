import { useState } from 'react';
import { login, register } from './api';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password);
        const response = await login(email, password);
        localStorage.setItem('token', response.data.token);
        onLoginSuccess(response.data.user);
      } else {
        const response = await login(email, password);
        localStorage.setItem('token', response.data.token);
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📝 Todo App</h1>
        <h2 style={styles.subtitle}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        {error && <div style={styles.error}>❌ {error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '...' : (isRegistering ? 'Create Account' : 'Login')}
          </button>
        </form>
        <p style={styles.toggleText}>
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <span
            style={styles.toggleLink}
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          >
            {isRegistering ? 'Login' : 'Register'}
          </span>
        </p>
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
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: { textAlign: 'center', fontSize: '2rem', marginBottom: '8px' },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '24px',
    fontSize: '1rem',
    fontWeight: 'normal',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '8px',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '0.9rem',
  },
  toggleLink: { color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' },
};

export default LoginPage;