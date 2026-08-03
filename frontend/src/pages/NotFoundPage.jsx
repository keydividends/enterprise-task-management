import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="auth-standalone-page">
    <motion.div className="auth-card glass-card auth-card-compact not-found-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="auth-card-header center">
        <div className="brand-mark small">E</div>
        <p className="eyebrow secondary">Lost in workflow</p>
        <h2>404</h2>
      </div>

      <div className="reset-illustration accent">
        <Compass size={30} />
      </div>

      <p className="helper-copy center">The page you were looking for does not exist or has moved.</p>

      <Link to="/dashboard" className="primary-button not-found-link">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
