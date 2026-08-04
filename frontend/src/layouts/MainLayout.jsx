import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Briefcase,
  ChevronDown,
  CreditCard,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  UserCheck,
} from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

const appLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
  { label: 'Users', to: '/users', icon: UserCheck },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Teams', to: '/teams', icon: Users },
  { label: 'Tasks', to: '/tasks', icon: Briefcase },
  { label: 'Reports', to: '/reports', icon: CreditCard },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const MainLayout = ({ toggleTheme }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme === 'dark');

  const topbarSummary = useMemo(() => ({
    name: user?.fullName || user?.firstName || 'Raheema',
    role: user?.role || 'Administrator',
  }), [user]);

  const handleThemeToggle = () => {
    const nextTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('etms-theme', nextTheme);
    if (toggleTheme) toggleTheme();
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="brand-mark">E</div>
          {sidebarOpen && <span className="brand-name">ETMS</span>}
        </div>

        <nav className="sidebar-nav">
          {appLinks.map(({ label, to, icon: Icon }) => (
            <Link key={label} to={to} className="nav-item">
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-action" onClick={() => setSidebarOpen((current) => !current)}>
            {sidebarOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar glass-card">
          <div className="topbar-left">
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search tasks, projects, people..." />
            </div>
          </div>

          <div className="topbar-right">
            <button type="button" className="quick-add-btn" onClick={() => navigate('/users/create')}>
              <Plus size={16} /> Quick Create
            </button>

            <button type="button" className="icon-control" aria-label="Toggle theme" onClick={handleThemeToggle}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button type="button" className="icon-control" aria-label="Notifications">
              <Bell size={18} />
            </button>

            <div className="profile-chip" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <div className="profile-avatar">{topbarSummary.name.charAt(0).toUpperCase()}</div>
              <div className="profile-meta">
                <strong>{topbarSummary.name}</strong>
                <small>{topbarSummary.role}</small>
              </div>
              <ChevronDown size={16} />
            </div>

            <button type="button" className="logout-btn" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
