import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, LogIn, Sparkles, ShieldCheck, GraduationCap, Wrench, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { loginSchema } from '../../schemas/auth.schema';
import api from '../../services/axiosInstance';
import { cn } from '../../utils/cn';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: 'student@campus.edu', password: 'password123' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = location.search.includes('session_expired=true');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Quick fill helper for demonstration
  const handleQuickLogin = (email) => {
    setFormData({ email, password: 'password123' });
    setErrors({});
    setApiError('');
  };

  // 1-Click Instant Sign In
  const handleInstantSignIn = async (email) => {
    setFormData({ email, password: 'password123' });
    setErrors({});
    setApiError('');
    setIsLoading(true);

    try {
      const data = await api.post('/auth/login', { email, password: 'password123' });
      login(data.user, data.token);

      const requestedFrom = location.state?.from?.pathname;
      if (requestedFrom) {
        navigate(requestedFrom, { replace: true });
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.user.role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.post('/auth/login', formData);
      login(data.user, data.token);

      const requestedFrom = location.state?.from?.pathname;
      if (requestedFrom) {
        navigate(requestedFrom, { replace: true });
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.user.role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Faculty & Student Portal</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Sign in to dispatch or track campus maintenance requests.
        </p>
      </div>

      {sessionExpired && (
        <div className="p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40">
          Your previous session expired. Please sign in again.
        </div>
      )}

      {apiError && (
        <div className="p-3.5 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/40 font-medium">
          {apiError}
        </div>
      )}

      {/* 1-Click Role Switcher Dock for Faculty Demo */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Select Demo Persona (Click to fill):</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            pwd: password123
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('student@campus.edu')}
            className={cn(
              'p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer',
              formData.email === 'student@campus.edu'
                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/20'
            )}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="font-semibold text-[11px]">Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@campusfix.edu')}
            className={cn(
              'p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer',
              formData.email === 'admin@campusfix.edu'
                ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50/20'
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold text-[11px]">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('electrician@campusfix.edu')}
            className={cn(
              'p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer',
              formData.email === 'electrician@campusfix.edu'
                ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/20'
            )}
          >
            <Wrench className="w-4 h-4" />
            <span className="font-semibold text-[11px]">Technician</span>
          </button>
        </div>

        {/* 1-Click Instant Login Button */}
        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleInstantSignIn(formData.email)}
            className="w-full text-center py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/80 dark:border-indigo-800/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Instant 1-Click Login as Selected Persona</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Campus Email Address"
          type="email"
          name="email"
          placeholder="e.g. student@campus.edu"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={Mail}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={Lock}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold py-3 shadow-xs"
          isLoading={isLoading}
          rightIcon={ArrowRight}
        >
          Sign In to Portal
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        Don&apos;t have an account yet?{' '}
        <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline">
          Register new student account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
