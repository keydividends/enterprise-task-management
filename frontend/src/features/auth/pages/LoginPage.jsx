import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, Eye, EyeOff, Globe, Building2, ArrowLeft } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';
import AuthVisualPanel from '../components/AuthVisualPanel';

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
    },
  });

  const microsoftLogin = () => {
    instance
      .loginPopup({
        scopes: ['user.read'],
      })
      .then(async (response) => {
        try {
          setLoading(true);
          await loginWithMicrosoft(response.accessToken);
          navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
        } catch (err) {
          setError(err.response?.data?.message || 'Microsoft login failed.');
        } finally {
          setLoading(false);
        }
      })
      .catch(() => {
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
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <AuthVisualPanel variant="login" />

      <div className="auth-card-panel">
        <motion.div
          className="auth-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="auth-card-header">
            <div className="auth-header-top">
              <Link to="/" className="auth-home-link">
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>

              <p className="eyebrow secondary">Login back</p>
            </div>

            <h2>Sign in to ETMS</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Email</span>
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="auth-row between">
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="text-link">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="form-banner danger">
                <CheckCircle2 size={16} /> {error}
              </div>
            )}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-button" onClick={() => googleLogin()}>
              <Globe size={18} /> Google
            </button>
            <button type="button" className="social-button" onClick={() => microsoftLogin()}>
              <Building2 size={18} /> Microsoft
            </button>
          </div>

          <div className="auth-navigation">
            <div>
              <span>Don't have an employee account? </span>
              <Link to="/register" className="text-link auth-nav-link">
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
