import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  KeyRound,
  UserPlus,
  ShieldCheck,
  ClipboardCheck,
} from 'lucide-react';

const VARIANTS = {
  login: {
    icon: KeyRound,
    eyebrow: 'Welcome back',
    title: 'Sign in to your workspace.',
    copy: 'Access your account and continue where you left off.',
  },

  register: {
    icon: UserPlus,
    eyebrow: 'Join your team',
    title: 'Create your employee account.',
    copy: 'Set up your account and connect with your organization.',
  },

  company: {
    icon: Building2,
    eyebrow: 'For organizations',
    title: 'Create your company workspace.',
    copy: 'Set up a secure workspace and bring your team together.',
  },
};

const AuthVisualPanel = ({ variant = 'login' }) => {
  const content = VARIANTS[variant] || VARIANTS.login;
  const Icon = content.icon;

  return (
    <div className="auth-illustration-panel">

      {/* Top */}
      <div className="auth-brand-row">
        <Link to="/" className="auth-brand-lockup">
          <div className="brand-mark">
            <ClipboardCheck size={24} />
          </div>
          <span>Enterprise Task Management System</span>
        </Link>
      </div>

      {/* Simple illustration */}
      <motion.div
        className="auth-simple-illustration"
        key={variant}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="illustration-circle">
          <Icon size={76} strokeWidth={1.4} />
        </div>

        {/* Small decorative elements */}
        <motion.div
          className="illustration-dot dot-one"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="illustration-dot dot-two"
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="illustration-check"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <ShieldCheck size={22} />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        className="auth-tagline-block"
        key={`${variant}-text`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="eyebrow">{content.eyebrow}</p>

        <h1>{content.title}</h1>

        <p className="tagline-copy">{content.copy}</p>
      </motion.div>

    </div>
  );
};

export default AuthVisualPanel;