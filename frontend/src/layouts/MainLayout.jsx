import { useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  ChevronDown,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
  Users,
  UserCheck,
  User,
  PanelLeftClose, PanelLeftOpen, ClipboardCheck
} from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const MainLayout = ({ toggleTheme }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme === 'dark');

  const topbarSummary = useMemo(() => ({
    name: user?.fullName || user?.firstName || 'Raheema',
    role: user?.role || 'Administrator',
  }), [user]);

  // Permission check for viewing system employee administration
  const canViewUserAdmin = useMemo(() => {
    if (!user) return true; // Default accessible in demo/mock mode
    return user.role === 'ADMIN' || user.role === 'MANAGER' || user.permissions?.includes('USER_VIEW');
  }, [user]);

  const canViewRolesNav = useMemo(() => {
    return user?.role === 'ADMIN';
  }, [user]);

  const navItems = useMemo(() => {
    const items = [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
    ];

    // Only include System Employees Administration tab if authorized
    if (canViewUserAdmin) {
      items.push({ label: 'Employees', to: '/users', icon: UserCheck });
    }

    // Only include Roles tab for admin users
    if (canViewRolesNav) {
      items.push({ label: 'Roles', to: '/roles', icon: Shield });
    }

    items.push(
      { label: 'Projects', to: '/projects', icon: FolderKanban },
      { label: 'Teams', to: '/teams', icon: Users },
      { label: 'Tasks', to: '/tasks', icon: Briefcase },
      { label: 'My Profile', to: '/profile', icon: User },
      { label: 'Settings', to: '/settings', icon: Settings }
    );

    return items;
  }, [canViewUserAdmin, canViewRolesNav]);

  const handleThemeToggle = () => {
    const nextTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('etms-theme', nextTheme);
    if (toggleTheme) toggleTheme();
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`} aria-label="Main sidebar navigation">
        <div className="sidebar-header">
          <div className="brand-mark" aria-hidden="true">
            <ClipboardCheck size={22} />
          </div>

          {sidebarOpen && <span className="brand-name">ETMS</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ label, to, icon: Icon }) => (
            <Link key={label} to={to} className="nav-item" title={label}>
              <Icon size={18} aria-hidden="true" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-action"
          onClick={() => setSidebarOpen((current) => !current)}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <PanelLeftClose size={20} aria-hidden="true" />
          ) : (
            <PanelLeftOpen size={20} aria-hidden="true" />
          )}
        </button>
      </div>
      </aside>

      <div className="main-panel">
        <header className="topbar glass-card">
          <div className="topbar-left">
            <div className="search-box">
              <Search size={16} aria-hidden="true" />
              <input type="text" placeholder="Search tasks, projects, people..." aria-label="Global search" />
            </div>
          </div>

          <div className="topbar-right">
            {canViewUserAdmin && (
              <button
                type="button"
                className="quick-add-btn"
                onClick={() => navigate('/users/create')}
                aria-label="Create employee"
              >
                <Plus size={16} /> Create Employee
              </button>
            )}

            <button type="button" className="icon-control" aria-label="Toggle dark/light theme" onClick={handleThemeToggle}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button type="button" className="icon-control" aria-label="View notifications">
              <Bell size={18} />
            </button>

            <div
              className="profile-chip"
              onClick={() => navigate('/profile')}
              title="My Profile"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
              aria-label="View my profile"
              style={{ cursor: 'pointer' }}
            >
              <div className="profile-avatar">{topbarSummary.name.charAt(0).toUpperCase()}</div>
              <div className="profile-meta">
                <strong>{topbarSummary.name}</strong>
                <small>{topbarSummary.role}</small>
              </div>
              <ChevronDown size={16} />
            </div>

            <button type="button" className="logout-btn" onClick={logout} aria-label="Log out">
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
