import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        You do not possess the required permissions to view this resource. Contact an administrator if you believe this is in error.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
            Return to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
