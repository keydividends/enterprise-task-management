import { useEffect, useState } from 'react';
import { AuthProvider } from './features/auth/hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('etms-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('etms-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <AuthProvider>
      <AppRoutes toggleTheme={toggleTheme} />
    </AuthProvider>
  );
}

export default App;
