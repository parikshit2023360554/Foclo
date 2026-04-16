'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import AppLogo from '@/components/ui/applogo';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface ForgotPasswordFields {
    email: string;
}

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { resetPassword } = useAuth();
    
    const form = useForm<ForgotPasswordFields>({ defaultValues: { email: '' } });

    const onSubmit = async (data: ForgotPasswordFields) => {
        setLoading(true);
        try {
            await resetPassword(data.email);
            setIsSubmitted(true);
            toast.success('Check your email', { description: 'A reset link has been sent to your email.' });
        } catch (error: any) {
            form.setError('email', { message: error.message || 'Error sending password reset email' });
            toast.error('Failed to send email', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#6EE7B7 1px, transparent 1px), linear-gradient(90deg, #6EE7B7 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <AppLogo size={48} className="mb-6" />
                    <h1 className="text-2xl font-bold text-zinc-100 mb-2">Forgot Password?</h1>
                    <p className="text-zinc-500 text-sm text-center">
                        {isSubmitted 
                            ? "We've sent a link to your email. You can close this window or return to login."
                            : "Enter the email associated with your account and we'll send a link to reset your password."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 ml-0.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all py-2.5 pl-10 pr-4 placeholder:text-zinc-600"
                                        {...form.register('email', {
                                            required: 'Email is required',
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                                        })}
                                    />
                                </div>
                                {form.formState.errors.email && (
                                    <p className="text-xs text-red-400 mt-1.5 ml-1">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:pointer-events-none mt-6"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    'Send reset link'
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={24} className="text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-200 mb-2">Check your inbox</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            We've sent a password reset link to <span className="text-zinc-300 font-medium">{form.getValues('email')}</span>
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            Try another email address
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link href="/sign-up-login" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                        <ArrowLeft size={16} />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
