import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO';
import { Lock, Mail, Loader2 } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters')
});

type LoginValues = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Failed to authenticate. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-wood-50 flex items-center justify-center py-12 px-6">
      <SEO
        title="Admin Portal Login | Nikhil Furniture"
        description="Secure administrator portal login for inventory management at Nikhil Furniture."
      />

      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl border border-wood-200/40 shadow-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-wood-950 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-wood-900 leading-none">
            Admin Portal
          </h1>
          <p className="text-xs text-wood-500 font-sans mt-2">
            Sign in to manage showroom catalog items
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-xs font-medium mb-6 text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-wood-400 absolute left-3 top-3.5" />
              <input
                type="email"
                placeholder="admin@nikhilfurniture.com"
                {...register('email')}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-3 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-wood-500"
              />
            </div>
            {errors.email && <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-wood-400 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-3 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-wood-500"
              />
            </div>
            {errors.password && <span className="text-[10px] text-red-500 font-semibold">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wood-800 hover:bg-wood-950 text-white py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
