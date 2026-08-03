import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('admin@etms.com');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-standalone-page">
      <motion.div className="auth-card glass-card auth-card-compact" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-card-header center">
          <div className="brand-mark small">E</div>
          <p className="eyebrow secondary">Reset access</p>
          <h2>Forgot password?</h2>
        </div>

        <div className="reset-illustration">
          <ShieldCheck size={32} />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Email address</span>
            <div className="input-wrap">
              <Mail size={18} />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
          </label>

          {error && <div className="form-banner danger"><CheckCircle2 size={16} /> {error}</div>}
          {message && <div className="form-banner success"><CheckCircle2 size={16} /> {message}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <Link to="/login" className="back-link">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
