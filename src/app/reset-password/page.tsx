'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import AppLogo from '@/components/ui/applogo';
import { useAuth } from '@/context/AuthContext';

interface ResetPasswordFields {
    password: string;
    confirmPassword: string;
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { updatePassword, user } = useAuth();
    
    // Safety check - optionally redirect if no user session is detected at all,
    // although wait for loading state might be better in a robust implementation.
    
    const form = useForm<ResetPasswordFields>({ defaultValues: { password: '', confirmPassword: '' } });

    const onSubmit = async (data: ResetPasswordFields) => {
        if (data.password !== data.confirmPassword) {
            form.setError('confirmPassword', { message: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            await updatePassword(data.password);
            toast.success('Password updated!', { description: 'Your password has been changed successfully.' });
            router.push('/dashboard');
        } catch (error: any) {
            toast.error('Failed to update password', { description: error.message });
            form.setError('password', { message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
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
                    <h1 className="text-2xl font-bold text-zinc-100 mb-2">Create New Password</h1>
                    <p className="text-zinc-500 text-sm text-center">
                        Your new password must be different from previous used passwords and at least 8 characters long.
                    </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 ml-0.5">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all py-2.5 pl-10 pr-10 placeholder:text-zinc-600"
                                    {...form.register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Must be at least 8 characters' }
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
                            {form.formState.errors.password && (
                                <p className="text-xs text-red-400 mt-1.5 ml-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 ml-0.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all py-2.5 pl-10 pr-10 placeholder:text-zinc-600"
                                    {...form.register('confirmPassword', {
                                        required: 'Please confirm your password'
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {form.formState.errors.confirmPassword && (
                                <p className="text-xs text-red-400 mt-1.5 ml-1">{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !user}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:pointer-events-none mt-2"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                'Reset password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
