import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, Sparkles, Eye, EyeOff, Globe, Building2 } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';

const LoginPage = () => {
  const { login, loginWithGoogle, loginWithMicrosoft, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // implicit flow returns access_token
        await loginWithGoogle(tokenResponse.access_token);
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Google login failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login was cancelled or failed.');
    }
  });

  const microsoftLogin = () => {
    instance.loginPopup({
      scopes: ["user.read"]
    }).then(async (response) => {
      try {
        setLoading(true);
        await loginWithMicrosoft(response.accessToken);
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Microsoft login failed.');
      } finally {
        setLoading(false);
      }
    }).catch(e => {
      setError('Microsoft login was cancelled or failed.');
    });
  };

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-illustration-panel">
        <div className="auth-brand-row">
          <div className="brand-mark">E</div>
          <span>ETMS</span>
        </div>

        <motion.div
          className="hero-illustration"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="float-card card-one">
            <span className="tiny-label">Sprint velocity</span>
            <strong>84%</strong>
            <div className="mini-bars">
              <span style={{ height: '28%' }} />
              <span style={{ height: '52%' }} />
              <span style={{ height: '64%' }} />
              <span style={{ height: '76%' }} />
              <span style={{ height: '100%' }} />
            </div>
          </div>

          <div className="float-card card-two">
            <div className="avatar-stack">
              <span>A</span>
              <span>M</span>
              <span>J</span>
            </div>
            <div>
              <strong>Team sync</strong>
              <small>8 online</small>
            </div>
          </div>

          <div className="main-visual">
            <div className="visual-ring ring-one" />
            <div className="visual-ring ring-two" />
            <div className="visual-window">
              <div className="window-top">
                <span />
                <span />
                <span />
              </div>
              <div className="window-body">
                <div className="window-column column-a" />
                <div className="window-column column-b" />
                <div className="window-column column-c" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="auth-tagline-block">
          <p className="eyebrow">Built for modern teams</p>
          <h1>Manage Work Smarter.</h1>
          <p className="tagline-copy">Plan projects, align teams, and ship work with clarity across every sprint.</p>
        </div>
      </div>

      <div className="auth-card-panel">
        <motion.div
          className="auth-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="auth-card-header">
            <p className="eyebrow secondary">Welcome back</p>
            <h2>Sign in to ETMS</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Email</span>
              <div className="input-wrap">
                <Mail size={18} />
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
              </div>
            </label>

            <label className="field-group">
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter your password" />
                <button type="button" className="icon-button" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="auth-row between">
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="text-link">Forgot password?</Link>
            </div>

            {error && <div className="form-banner danger"><CheckCircle2 size={16} /> {error}</div>}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="divider"><span>or continue with</span></div>

          <div className="social-buttons">
            <button type="button" className="social-button" onClick={() => googleLogin()}>
              <Globe size={18} /> Google
            </button>
            <button type="button" className="social-button" onClick={() => microsoftLogin()}>
              <Building2 size={18} /> Microsoft
            </button>
          </div>

          <div className="signup-cta-row">
            <span>Need an account?</span>
            <Link to="/register" className="text-link">Create one</Link>
          </div>

          <div className="micro-badge-row">
            <span><Sparkles size={14} /> Secure SSO ready</span>
            <span>Enterprise grade</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
