'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Eye,
    EyeOff,
    CheckCircle2,
    CalendarDays,
    BookOpen,
    Bell,
    Loader2,
    ArrowRight,
} from 'lucide-react';
import AppLogo from '@/components/ui/applogo';
import { useAuth } from '@/context/AuthContext';

interface LoginFields {
    email: string;
    password: string;
    remember: boolean;
}

interface SignUpFields {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
}

const FEATURES = [
    { icon: <CheckCircle2 size={16} className="text-emerald-400" />, text: 'Daily task manager with progress tracking' },
    { icon: <BookOpen size={16} className="text-amber-400" />, text: 'Exam tracker with subject, type & priority' },
    { icon: <CalendarDays size={16} className="text-blue-400" />, text: 'Visual calendar with task & exam overlays' },
    { icon: <Bell size={16} className="text-purple-400" />, text: 'Smart reminders before every deadline' },
];

export default function AuthForm() {
    const router = useRouter();
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
    const { signIn, signUp, resendConfirmationEmail, signInWithGoogle } = useAuth();

    const loginForm = useForm<LoginFields>({ defaultValues: { email: '', password: '', remember: false } });
    const signupForm = useForm<SignUpFields>({ defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false } });

    const onLogin = async (data: LoginFields) => {
        setLoading(true);
        setUnconfirmedEmail(null);
        try {
            const { data: authData, error } = await signIn(data.email, data.password);
            if (error) throw error;
            
            toast.success('Signed in successfully', { description: 'Welcome back!' });
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            const msg = error.message?.toLowerCase() || '';
            
            if (msg.includes('email not confirmed')) {
                setUnconfirmedEmail(data.email);
                toast.error('Email not confirmed', {
                    description: 'Please check your inbox or resend the confirmation link below.',
                });
            } else if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
                loginForm.setError('email', { message: 'Incorrect email or password' });
                loginForm.setError('password', { message: 'Incorrect email or password' });
                toast.error('Login failed', { description: 'Incorrect email or password' });
            } else {
                loginForm.setError('email', { message: error.message || 'An error occurred during sign in' });
                toast.error('Login error', { description: error.message });
            }
        } finally {
            setLoading(false);
        }
    };

    const onResendEmail = async () => {
        if (!unconfirmedEmail) return;
        setLoading(true);
        try {
            await resendConfirmationEmail(unconfirmedEmail);
            toast.success('Confirmation email sent', { description: 'Please check your inbox.' });
            setUnconfirmedEmail(null);
        } catch (error: any) {
            toast.error('Failed to resend email', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const onSignUp = async (data: SignUpFields) => {
        setLoading(true);
        setUnconfirmedEmail(null);
        if (data.password !== data.confirmPassword) {
            signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
            setLoading(false);
            return;
        }
        try {
            const { data: authData, error } = await signUp(data.email, data.password, { fullName: data.name });
            if (error) throw error;
            
            toast.success('Account created!', {
                description: 'Please check your email to confirm your account.',
            });
            setUnconfirmedEmail(data.email);
            setTab('login');
        } catch (error: any) {
            console.error('Signup error:', error);
            const msg = error.message?.toLowerCase() || '';
            
            if (msg.includes('user already registered') || msg.includes('user already exists')) {
                signupForm.setError('email', { message: 'An account with this email already exists' });
                toast.error('Signup failed', { description: 'An account with this email already exists' });
            } else {
                signupForm.setError('email', { message: error.message || 'Error creating account' });
                toast.error('Signup error', { description: error.message });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            // Note: OAuth redirects away, so subsequent code generally won't run execution.
        } catch (error: any) {
            console.error('Google Sign-In error:', error);
            toast.error('Google Sign-In Failed', { description: error.message || 'An error occurred during Google sign in.' });
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-zinc-900 border-r border-zinc-800 flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
                {/* Background decorative grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#6EE7B7 1px, transparent 1px), linear-gradient(90deg, #6EE7B7 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-12">
                        <AppLogo size={40} />
                        <span className="text-xl font-semibold text-zinc-100">Foclo</span>
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-bold text-zinc-100 leading-tight mb-4">
                        Never miss a deadline.
                        <span className="text-emerald-400"> Ever again.</span>
                    </h2>
                    <p className="text-zinc-500 text-base leading-relaxed mb-10">
                        One focused workspace for your tasks, exams, and study schedule — built for students who get things done.
                    </p>

                    <div className="space-y-4">
                        {FEATURES.map((f, i) => (
                            <div key={`feature-${i}`} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                    {f.icon}
                                </div>
                                <p className="text-sm text-zinc-400">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="flex items-center gap-3 p-4 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <span className="text-emerald-400 text-sm font-bold">A</span>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-300 font-medium">
                                &ldquo;I used to miss assignments constantly. Foclo fixed that in week one.&rdquo;
                            </p>
                            <p className="text-xs text-zinc-600 mt-1">— Alex Rivera, CS student</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12">
                {/* Mobile logo */}
                <div className="flex items-center gap-2 mb-8 lg:hidden">
                    <AppLogo size={36} />
                    <span className="text-lg font-semibold text-zinc-100">Foclo</span>
                </div>

                <div className="w-full max-w-sm xl:max-w-md">
                    {/* Tabs */}
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-7">
                        {(['login', 'signup'] as const).map((t) => (
                            <button
                                key={`tab-${t}`}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${tab === t
                                        ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {t === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogleAuth}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg transition-all duration-150 active:scale-[0.98] mb-5 disabled:opacity-50"
                    >
                        {googleLoading ? (
                            <Loader2 size={16} className="animate-spin text-zinc-400" />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        {googleLoading ? 'Connecting…' : `Continue with Google${tab === 'signup' ? ' + Calendar Sync' : ''}`}
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-xs text-zinc-600">or continue with email</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {/* Login form */}
                    {tab === 'login' && (
                        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="input-field"
                                    {...loginForm.register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                                    })}
                                />
                                {loginForm.formState.errors.email && (
                                    <p className="text-xs text-red-400 mt-1.5">{loginForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="input-field pr-10"
                                        {...loginForm.register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {loginForm.formState.errors.password && (
                                    <p className="text-xs text-red-400 mt-1.5">{loginForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            {unconfirmedEmail && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-xs text-amber-200 mb-2 font-medium">
                                        Your email is not confirmed. Please check your inbox for the verification link.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onResendEmail}
                                        disabled={loading}
                                        className="text-xs text-amber-400 font-semibold hover:text-amber-300 underline underline-offset-2 decoration-amber-500/30 hover:decoration-amber-400 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Resending…' : 'Resend confirmation email'}
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 accent-emerald-500"
                                        {...loginForm.register('remember')}
                                    />
                                    <span className="text-xs text-zinc-500">Remember me for 30 days</span>
                                </label>
                                <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-2.5 text-sm"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>Sign In <ArrowRight size={15} /></>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Sign up form */}
                    {tab === 'signup' && (
                        <form onSubmit={signupForm.handleSubmit(onSignUp)} className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                    Full name
                                </label>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Alex Rivera"
                                    className="input-field"
                                    {...signupForm.register('name', { required: 'Full name is required' })}
                                />
                                {signupForm.formState.errors.name && (
                                    <p className="text-xs text-red-400 mt-1.5">{signupForm.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="input-field"
                                    {...signupForm.register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                                    })}
                                />
                                {signupForm.formState.errors.email && (
                                    <p className="text-xs text-red-400 mt-1.5">{signupForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                    Password
                                    <span className="ml-1.5 text-zinc-600 font-normal">— min. 8 characters</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Create a strong password"
                                        className="input-field pr-10"
                                        {...signupForm.register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {signupForm.formState.errors.password && (
                                    <p className="text-xs text-red-400 mt-1.5">{signupForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Repeat your password"
                                        className="input-field pr-10"
                                        {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {signupForm.formState.errors.confirmPassword && (
                                    <p className="text-xs text-red-400 mt-1.5">{signupForm.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 accent-emerald-500 mt-0.5 shrink-0"
                                        {...signupForm.register('terms', { required: 'You must accept the terms to continue' })}
                                    />
                                    <span className="text-xs text-zinc-500 leading-relaxed">
                                        I agree to the{' '}
                                        <button type="button" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                                            Terms of Service
                                        </button>{' '}
                                        and{' '}
                                        <button type="button" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                                            Privacy Policy
                                        </button>
                                    </span>
                                </label>
                                {signupForm.formState.errors.terms && (
                                    <p className="text-xs text-red-400 mt-1.5">{signupForm.formState.errors.terms.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-2.5 text-sm"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>Create Account <ArrowRight size={15} /></>
                                )}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-xs text-zinc-600 mt-5">
                        {tab === 'login' ? (
                            <>
                                New to Foclo?{' '}
                                <button onClick={() => setTab('signup')} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                                    Create a free account
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button onClick={() => setTab('login')} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}