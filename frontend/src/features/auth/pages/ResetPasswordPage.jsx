import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

const passwordPolicy = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ token, newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    const password = form.newPassword || '';
    if (!password) return { label: 'No password', score: 0 };
    if (passwordPolicy.test(password) && password.length >= 10) return { label: 'Strong', score: 3 };
    if (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)) return { label: 'Medium', score: 2 };
    return { label: 'Weak', score: 1 };
  }, [form.newPassword]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!form.token.trim()) {
      setError('Reset token is required.');
      setLoading(false);
      return;
    }

    if (!passwordPolicy.test(form.newPassword)) {
      setError('Password must be at least 8 characters and include letters, numbers, and symbols.');
      setLoading(false);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword(form);
      setMessage(response.message || 'Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-standalone-page">
      <motion.div className="auth-card glass-card auth-card-compact" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-card-header center">
          <div className="brand-mark small">E</div>
          <p className="eyebrow secondary">Secure reset</p>
          <h2>Reset your password</h2>
        </div>

        <div className="reset-illustration accent">
          <KeyRound size={28} />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Reset token</span>
            <div className="input-wrap">
              <ShieldCheck size={18} />
              <input id="token" name="token" type="text" value={form.token} onChange={handleChange} placeholder="Paste token from email" />
            </div>
          </label>

          <label className="field-group">
            <span>New password</span>
            <div className="input-wrap">
              <KeyRound size={18} />
              <input id="newPassword" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="Create strong password" />
            </div>
          </label>

          <div className="strength-meter" aria-live="polite">
            <div className="strength-track">
              <span className={`strength-fill score-${strength.score}`} />
            </div>
            <small>Password strength: {strength.label}</small>
          </div>

          <label className="field-group">
            <span>Confirm password</span>
            <div className="input-wrap">
              <KeyRound size={18} />
              <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
            </div>
          </label>

          {error && <div className="form-banner danger"><CheckCircle2 size={16} /> {error}</div>}
          {message && <div className="form-banner success"><CheckCircle2 size={16} /> {message}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <Link to="/login" className="back-link">
          <ArrowLeft size={16} /> Return to login
        </Link>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
