import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  LockKeyhole,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import companyService from '../services/companyService';
import AuthVisualPanel from '../../auth/components/AuthVisualPanel';

const emailPattern = /^(?=.{1,254}$)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const phonePattern = /^[+]?[\d\s().-]{7,25}$/;

export const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    password: '',
    address: '',
    phoneNumber: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.companyName.trim() || form.companyName.trim().length < 2) {
      setError('Company name is required (at least 2 characters).');
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      setError('Please enter a valid corporate email address.');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!form.address.trim()) {
      setError('Company address is required.');
      return;
    }

    const phoneDigits = form.phoneNumber.replace(/\D/g, '');
    if (!form.phoneNumber.trim() || !phonePattern.test(form.phoneNumber.trim()) || phoneDigits.length < 7 || phoneDigits.length > 12) {
      setError('Please enter a valid phone number (7–12 digits).');
      return;
    }

    setLoading(true);

    try {
      await companyService.registerCompany({
        companyName: form.companyName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        address: form.address.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });

      setSuccess('Company created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate(`/login?company=${encodeURIComponent(form.companyName.trim())}&registered=true`);
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create company. Please check your details and try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell company-auth">
      <AuthVisualPanel variant="company" />

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

              <p className="eyebrow secondary">
                Company Admin Onboarding
              </p>
            </div>

            <h2>Register New Company</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Company Name *</span>
              <div className="input-wrap">
                <Building2 size={18} />
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Enter unique company name"
                  required
                  autoFocus
                />
              </div>
            </label>

            <label className="field-group">
              <span>Admin Email *</span>
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Phone Number *</span>
              <div className="input-wrap">
                <Phone size={18} />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1  _ _ _  _ _ _  _ _ _ _"
                  required
                />
              </div>
            </label>


            <label className="field-group">
              <span>Admin Password *</span>
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create strong admin password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="field-group">
              <span>Company Address *</span>
              <div className="input-wrap">
                <MapPin size={18} />
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter company address"
                  required
                />
              </div>
            </label>

            {error && (
              <div className="form-banner danger" role="alert">
                <CheckCircle2 size={16} /> {error}
              </div>
            )}

            {success && (
              <div className="form-banner success" role="status">
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Registering Company...' : 'Create Company Workspace'}
              <ArrowRight size={18} />
            </button>
          </form>


        </motion.div>
      </div>
    </div>
  );
};

export default CreateCompanyPage;
