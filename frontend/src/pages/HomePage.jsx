import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  LogIn,
  UserPlus,
  Shield,
  Users,
  CheckCircle,
  FolderKanban,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Award,
  Zap,
  ChevronRight,
  Lock,
  UserCheck,
  Briefcase,
  Moon,
  Sun,
  ClipboardCheck,
  Menu, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const HomePage = ({ toggleTheme }) => {

  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme === 'dark');

  const handleThemeToggle = () => {
    const nextTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('etms-theme', nextTheme);
    if (toggleTheme) toggleTheme();
  };

  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* 1. TOP NAVIGATION BAR */}
      <header
        className="glass-navbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.75)',
          borderBottom: '1px solid var(--border)',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          className="landing-navbar-inner"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
              }}
            >
              <ClipboardCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>
                ETMS
              </span>
              <span style={{ fontSize: '11px', display: 'block', opacity: 0.6, fontWeight: 600, letterSpacing: '0.5px' }}>
                ENTERPRISE SYSTEM
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav-links">
            <a href="#features" style={{ fontSize: '14px', fontWeight: 600, opacity: 0.8, transition: 'opacity 0.2s' }}>
              Features
            </a>
            <a href="#roles" style={{ fontSize: '14px', fontWeight: 600, opacity: 0.8, transition: 'opacity 0.2s' }}>
              Organization Roles
            </a>
            <a href="#solutions" style={{ fontSize: '14px', fontWeight: 600, opacity: 0.8, transition: 'opacity 0.2s' }}>
              Solutions
            </a>
          </nav>

          {/* 3 Main Action Options + Theme Toggle */}
          <div className="landing-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button
              type="button"
              onClick={handleThemeToggle}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '4px',
              }}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                }}
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                {/* 1. Create Company */}
                <Link
                  to="/create-company"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  }}
                  className="nav-btn-primary"
                >
                  <Building2 size={15} />
                  <span>Create Company</span>
                </Link>

                {/* 2. Login as Employee */}
                <Link
                  to="/login"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  className="nav-btn-secondary"
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </Link>


                <Link
                  to="/register"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'var(--text-blue)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  className="nav-btn-secondary"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>

              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-nav-menu">

            {!isAuthenticated && (
              <>
                <Link to="/create-company" onClick={() => setMenuOpen(false)}>
                  Create Company
                </Link>

                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>

                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="landing-hero" style={{ padding: '72px 24px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="landing-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(79, 70, 229, 0.1)',
                color: 'var(--primary)',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '20px',
                border: '1px solid rgba(79, 70, 229, 0.2)',
              }}
            >
              <Sparkles size={16} /> Enterprise Task Management System
            </div>

            <h1
              className="landing-hero-title"
              style={{
                fontSize: '52px',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
                marginBottom: '20px',
              }}
            >
              Orchestrate Projects.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Empower Teams.
              </span>
            </h1>

            <p style={{ fontSize: '18px', opacity: 0.75, lineHeight: 1.6, marginBottom: '32px', maxWidth: '580px' }}>
              A unified task management platform designed for high-velocity organizations.
              Seamlessly connect Company Admins, Managers, and Employees with real-time sprint workflows and clear delegation.
            </p>

            {/* 3 Explicit Hero Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '36px' }}>
              <Link
                to="/create-company"
                style={{
                  padding: '14px 26px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 12px 28px rgba(79, 70, 229, 0.35)',
                }}
              >
                <Building2 size={18} />
                <span>Create Company</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login"
                style={{
                  padding: '14px 22px',
                  borderRadius: '12px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <LogIn size={18} />
                <span>Login as Employee</span>
              </Link>


            </div>


          </motion.div>

          {/* Interactive Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ position: 'relative' }}
          >
            <div
              className="glass-card"
              style={{
                borderRadius: '24px',
                padding: '28px',
                border: '1px solid var(--border)',
                boxShadow: '0 30px 80px rgba(79, 70, 229, 0.18)',
                background: 'var(--card)',
              }}
            >
              {/* Mock Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.6, marginLeft: '8px' }}>
                    Enterprise Sprint Matrix
                  </span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: '12px' }}>
                  Active Sprint
                </span>
              </div>

              {/* Mock Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(79, 70, 229, 0.08)',
                    border: '1px solid rgba(79, 70, 229, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle size={18} color="#4f46e5" />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>Sprint-Based Task Management</strong>
                      <small style={{ opacity: 0.65 }}>Plan, prioritize, assign, and track tasks.</small>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>Active</span>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={18} color="#06b6d4" />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>Role-Based Team Collaboration</strong>
                      <small style={{ opacity: 0.65 }}>Connect Company Admins, Managers, and Employees.</small>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#06b6d4' }}>Active</span>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={18} color="#10b981" />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>Real-Time Progress & Delivery</strong>
                      <small style={{ opacity: 0.65 }}>Monitor task status, team activity in one workspace.</small>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>Active</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ height: '8px', width: '100%', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. THREE-TIER ORGANIZATIONAL ROLES SECTION */}
      <section id="roles" style={{ padding: '80px 24px', background: 'var(--bg-soft)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Organizational Architecture
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.5px' }}>
              Tailored for Every Role in Your Organization
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.7, maxWidth: '640px', margin: '12px auto 0' }}>
              ETMS provides purpose-built workflows for Company Admins, Managers, and Employees.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            {/* Role 1: Company Admin */}
            <div
              className="glass-card"
              style={{
                borderRadius: '16px',
                padding: '32px 28px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '20px' }}>
                <Building2 size={26} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Company Admin</h3>
              <p style={{ fontSize: '14px', opacity: 0.75, lineHeight: 1.6, marginBottom: '20px' }}>
                Created upon company registration. Owns the organizational account, configures company settings, provisions projects, and monitors executive analytics.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', opacity: 0.85 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#4f46e5" /> Organization & Workspace Control</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#4f46e5" /> Department & Project Setup</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#4f46e5" /> Executive Reporting & Analytics</li>
              </ul>
            </div>

            {/* Role 2: Manager */}
            <div
              className="glass-card"
              style={{
                borderRadius: '16px',
                padding: '32px 28px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', marginBottom: '20px' }}>
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Manager</h3>
              <p style={{ fontSize: '14px', opacity: 0.75, lineHeight: 1.6, marginBottom: '20px' }}>
                Leads sprint delivery and team execution. Creates new employee accounts who automatically inherit the manager’s company and manager association.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', opacity: 0.85 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#06b6d4" /> Employee Provisioning & Onboarding</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#06b6d4" /> Sprint Planning & Task Allocation</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#06b6d4" /> Team Velocity & Workload Tracking</li>
              </ul>
            </div>

            {/* Role 3: Employee */}
            <div
              className="glass-card"
              style={{
                borderRadius: '16px',
                padding: '32px 28px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '20px' }}>
                <UserCheck size={26} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Employee</h3>
              <p style={{ fontSize: '14px', opacity: 0.75, lineHeight: 1.6, marginBottom: '20px' }}>
                Executes assigned sprint tasks, logs activity, updates checklist progress, uploads attachments, and collaborates in real-time.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', opacity: 0.85 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#10b981" /> Kanban Board & Task Execution</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#10b981" /> Status Updates & Time Tracking</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={15} color="#10b981" /> Real-Time Team Collaboration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SECTION */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Enterprise Capabilities
          </span>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.5px' }}>
            Everything Your Organization Needs to Deliver
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
              <FolderKanban size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Company Workspace Setup</h3>
            <p style={{ fontSize: '14px', opacity: 0.75, lineHeight: 1.6 }}>
              Register your organization with database-enforced uniqueness, structured metadata, and instant administrative provisioning.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', marginBottom: '16px' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Manager & Employee Delegation</h3>
            <p style={{ fontSize: '14px', opacity: 0.75, lineHeight: 1.6 }}>
              Managers create team members with automatic company association and seamless reporting lines for frictionless onboarding.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Sprint & Backlog Execution</h3>
            <p style={{ fontSize: '14px', opacity: 0.75, lineHeight: 1.6 }}>
              Visual Kanban boards, interactive task checklists, comment threads, and priority metrics keep your entire team aligned.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section id="solutions" style={{ padding: '40px 24px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            padding: '56px 40px',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(79, 70, 229, 0.3)',
          }}
        >
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Ready to Streamline Your Team Workflow?
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px' }}>
            Choose an option below to access or configure your organization's workspace.
          </p>

          {/* 3 Clear Options in CTA */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <Link
              to="/create-company"
              style={{
                padding: '14px 26px',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#4f46e5',
                fontWeight: 700,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              }}
            >
              <Building2 size={18} /> Create Company
            </Link>

            <Link
              to="/login"
              style={{
                padding: '14px 22px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LogIn size={18} /> Login as Employee
            </Link>

            <Link
              to="/register"
              style={{
                padding: '14px 22px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <UserPlus size={18} /> Sign Up as Employee
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px', background: 'var(--bg)' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              <ClipboardCheck size={18} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>ETMS Enterprise</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', opacity: 0.7 }}>
            <Link to="/create-company">Create Company</Link>
            <Link to="/login">Login as Employee</Link>
            <Link to="/register">Sign Up as Employee</Link>
          </div>

          <div style={{ fontSize: '13px', opacity: 0.6 }}>
            © {new Date().getFullYear()} Enterprise Task Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
