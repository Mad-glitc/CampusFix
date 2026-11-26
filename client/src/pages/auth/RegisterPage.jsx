import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Button from '../../components/common/Button';
import { User, Mail, Lock, UserPlus, Phone, GraduationCap, Wrench, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { registerSchema } from '../../schemas/auth.schema';
import api from '../../services/axiosInstance';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science',
    phoneNumber: '',
    accessCode: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'staff':
        return {
          label: 'Staff Security Access Key',
          placeholder: 'Enter authorized technician key (e.g. STAFF2026)',
          helperText: 'Security key required to prevent unauthorized technician account creation.',
          icon: Wrench,
          demoKey: 'STAFF2026',
        };
      case 'admin':
        return {
          label: 'Administrator Master Key',
          placeholder: 'Enter master administrator key (e.g. ADMIN2026)',
          helperText: 'Restricted master access key required to create administrator accounts.',
          icon: ShieldAlert,
          demoKey: 'ADMIN2026',
        };
      case 'student':
      default:
        return {
          label: 'Student Registration Number',
          placeholder: 'e.g. 2026-CS-1042 or REG12345',
          helperText: 'Enter your official university student registration number or roll number.',
          icon: GraduationCap,
          demoKey: null,
        };
    }
  };

  const roleConfig = getRoleConfig(formData.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    // Unit IV: Zod Schema Validation
    const validationResult = registerSchema.safeParse(formData);
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
      // Unit V: API Integration via Axios
      const data = await api.post('/auth/register', formData);

      // Unit VI: Zustand global auth store update
      login(data.user, data.token);

      if (data.user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (data.user.role === 'staff') navigate('/staff/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create your account</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Register to report and track campus maintenance requests.
        </p>
      </div>

      {apiError && (
        <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800/40">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g. Alex Johnson"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          leftIcon={User}
          required
        />

        <Input
          label="Campus Email"
          type="email"
          name="email"
          placeholder="e.g. alex@campus.edu"
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
          placeholder="Min 6 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={Lock}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={(e) => {
              handleChange(e);
              // Clear accessCode error when changing role
              if (errors.accessCode) {
                setErrors((prev) => ({ ...prev, accessCode: undefined }));
              }
            }}
            error={errors.role}
            options={[
              { value: 'student', label: 'Student' },
              { value: 'staff', label: 'Maintenance Staff' },
              { value: 'admin', label: 'Administrator' },
            ]}
          />

          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            options={[
              'Computer Science',
              'Electronics & Comm.',
              'Mechanical Engg.',
              'Civil Engg.',
              'Electrical Engg.',
              'Hostel Admin',
              'General Facilities',
            ]}
          />
        </div>

        {/* Dynamic Verification Field based on Selected Role */}
        <div className="space-y-1.5 pt-0.5">
          <Input
            label={roleConfig.label}
            name="accessCode"
            placeholder={roleConfig.placeholder}
            value={formData.accessCode}
            onChange={handleChange}
            error={errors.accessCode}
            leftIcon={roleConfig.icon}
            required
            helperText={roleConfig.helperText}
          />

          {roleConfig.demoKey && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Authorized Demo Key:
              </span>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, accessCode: roleConfig.demoKey }));
                  if (errors.accessCode) setErrors((prev) => ({ ...prev, accessCode: undefined }));
                }}
                className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors cursor-pointer border border-indigo-200/50 dark:border-indigo-800/40 text-[11px]"
                title="Click to autofill authorized access key"
              >
                <span>{roleConfig.demoKey}</span>
                <span className="text-[9px] uppercase tracking-wider font-sans text-indigo-500 dark:text-indigo-400 font-bold">(fill)</span>
              </button>
            </div>
          )}
        </div>

        <Input
          label="Phone Number"
          name="phoneNumber"
          placeholder="10-digit mobile number"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          leftIcon={Phone}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={UserPlus}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
