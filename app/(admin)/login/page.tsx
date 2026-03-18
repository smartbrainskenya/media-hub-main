'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials. Please try again.');
      } else {
        toast.success('Welcome back, Admin!');
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      toast.error('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="z-10 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="bg-white border border-brand-border rounded-[2.5rem] shadow-2xl p-10 space-y-10 relative overflow-hidden group">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary"></div>

          <div className="space-y-4 text-center">
            <div className="inline-flex p-4 bg-brand-primary/5 rounded-2xl mb-2 group-hover:bg-brand-primary/10 transition-colors">
              <ShieldCheck className="h-10 w-10 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black text-brand-primary tracking-tight">Admin Gateway</h1>
            <p className="text-brand-muted font-medium">
              Enter your credentials to manage the Media Hub
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2 px-1">
                  <Mail className="h-3 w-3" />
                  Email Address
                </label>
                <div className="relative group/field">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@smartbrains.co.ke"
                    className="w-full h-14 pl-4 pr-4 bg-brand-surface border border-brand-border rounded-2xl text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs font-bold text-brand-danger flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-brand-danger"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2 px-1">
                  <Lock className="h-3 w-3" />
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-14 pl-4 pr-4 bg-brand-surface border border-brand-border rounded-2xl text-brand-primary placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p className="mt-2 text-xs font-bold text-brand-danger flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-brand-danger"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-primary text-white font-black rounded-2xl shadow-xl shadow-brand-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 mt-4 overflow-hidden relative"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-brand-muted/60 font-medium">
            Protected by internal security protocols. 
            <br />
            Unauthorized access attempts are logged.
          </p>
        </div>

        <div className="mt-8 text-center flex flex-col items-center space-y-4">
          <Image src="/logo.svg" alt="Smart Brains" width={120} height={32} className="opacity-40" />
          <p className="text-xs font-bold text-brand-muted uppercase tracking-[0.2em]">
            Smart Brains Kenya &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
