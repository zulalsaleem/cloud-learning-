import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import TodoPage from './TodoPage';

function App() {
  const [user, setUser]       = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem('token');
        } else {
          setUser({ id: payload.userId, email: payload.email });
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh',
        fontFamily: 'Arial', color: '#888'
      }}>
        Loading...
      </div>
    );
  }

  return user ? (
    <TodoPage user={user} onLogout={() => setUser(null)} />
  ) : (
    <LoginPage onLoginSuccess={(userData) => setUser(userData)} />
  );
}

export default App;