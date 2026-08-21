import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound, Building2, ArrowLeft } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import companyService from '../../company/services/companyService';
import AuthVisualPanel from '../components/AuthVisualPanel';

const emailPattern = /^(?=.{1,254}$)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const suggestRef = useRef(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: '',
    companyName: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordPolicy = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  useEffect(() => {
    const query = form.companyName.trim();
    if (query.length < 1) {
      setSuggestions([]);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await companyService.searchCompanies(query);
        if (active) setSuggestions(data || []);
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.companyName]);

  useEffect(() => {
    const onClick = (event) => {
      if (suggestRef.current && !suggestRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === 'companyName') {
        return { ...current, companyName: value, companyId: '' };
      }
      return { ...current, [name]: value };
    });
    if (error) setError('');
  };

  const selectCompany = (company) => {
    setForm((current) => ({
      ...current,
      companyId: company.id,
      companyName: company.name,
    }));
    setShowSuggestions(false);
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }

    if (!form.companyId) {
      setError('Please select your company from the suggestions.');
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
        companyId: form.companyId,
      });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <AuthVisualPanel variant="register" />

      <div className="auth-card-panel">
        <motion.div
          className="auth-card glass-card registration-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="auth-card-header">
            <div className="auth-header-top">
              <Link to="/" className="auth-home-link">
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>

              <p className="eyebrow secondary">Employee Registration</p>
            </div>

            <h2>Sign Up as Employee</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="split-fields">
              <label className="field-group">
                <span>First name *</span>
                <div className="input-wrap">
                  <UserRound size={18} />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    autoComplete="given-name"
                    required
                  />
                </div>
              </label>

              <label className="field-group">
                <span>Last name *</span>
                <div className="input-wrap">
                  <UserRound size={18} />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </label>
            </div>

            <label className="field-group" ref={suggestRef}>
              <span>Company *</span>
              <div className="input-wrap company-suggest-wrap">
                <Building2 size={18} />
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Start typing your company name"
                  autoComplete="off"
                  required
                />

                {showSuggestions && form.companyName.trim() && (
                  <ul className="company-suggest-list">
                    {searching && <li>Searching companies...</li>}
                    {!searching && suggestions.length === 0 && (
                      <li>
                        No matching companies.{' '}
                        <Link to="/create-company">Create Company</Link>
                      </li>
                    )}
                    {!searching && suggestions.map((company) => (
                      <li
                        key={company.id}
                        className={form.companyId === company.id ? 'active' : ''}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          selectCompany(company);
                        }}
                      >
                        {company.name}
                      </li>
                    ))}
                  </ul>
                )}
                {form.companyId && (
                  <span className="selected-company">
                    <CheckCircle2 size={18} />
                  </span>
                )}
              </div>
            </label>

            <label className="field-group">
              <span>Email *</span>
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Password *</span>
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create strong password"
                  autoComplete="new-password"
                  minLength="8"
                  required
                  aria-describedby="password-hint"
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



            <label className="field-group">
              <span>Confirm password *</span>
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
              </div>
            </label>

            {error && (
              <div className="form-banner danger" role="alert">
                <CheckCircle2 size={16} /> {error}
              </div>
            )}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Creating employee account...' : 'Sign Up as Employee'}
              <ArrowRight size={18} />
            </button>
          </form>


          <div className="auth-navigation">
            <div>
              <span>Already have an account? </span>
              <Link to="/login" className="text-link auth-nav-link">
                Login
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
