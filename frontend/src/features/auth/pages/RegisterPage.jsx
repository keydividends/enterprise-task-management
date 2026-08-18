import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const emailPattern = /^(?=.{1,254}$)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordPolicy = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!passwordPolicy.test(form.password)) {
      setError('Password must be at least 8 characters and include letters, numbers, and symbols.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-standalone-page">
      <motion.div className="auth-card glass-card auth-card-compact registration-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-card-header center">
          <div className="brand-mark small">ETMS</div>
          <p className="eyebrow secondary">Create account</p>
          <h2>Join ETMS</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="split-fields">
            <label className="field-group">
              <span>First name</span>
              <div className="input-wrap">
                <UserRound size={18} />
                <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="First Name" autoComplete="given-name" required />
              </div>
            </label>

            <label className="field-group">
              <span>Last name</span>
              <div className="input-wrap">
                <UserRound size={18} />
                <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Last Name" autoComplete="family-name" required />
              </div>
            </label>
          </div>

          <label className="field-group">
            <span>Email</span>
            <div className="input-wrap">
              <Mail size={18} />
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" autoComplete="email" required />
            </div>
          </label>

          <label className="field-group">
            <span>Password</span>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Create strong password" autoComplete="new-password" minLength="8" required aria-describedby="password-hint" />
              <button type="button" className="icon-button" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <p id="password-hint" className="field-hint">Use 8+ characters with a letter, number, and symbol.</p>

          <label className="field-group">
            <span>Confirm password</span>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" autoComplete="new-password" minLength="8" required />
            </div>
          </label>

          {error && <div className="form-banner danger" role="alert"><CheckCircle2 size={16} /> {error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="divider"><span>Already have an account?</span></div>

        <Link to="/login" className="back-link center-link">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
