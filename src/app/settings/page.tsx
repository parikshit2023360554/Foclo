'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { User, Shield, Bell, Palette, Globe, Database, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
            router.push('/sign-up-login');
        } catch (error: any) {
            toast.error('Sign out failed', { description: error.message });
        }
    };

    const settingSections = [
        { id: 'profile', icon: <User size={18} />, label: 'User Profile', desc: 'Manage your name, avatar, and personal info', active: true },
        { id: 'account', icon: <Shield size={18} />, label: 'Account Security', desc: 'Update password and login methods' },
        { id: 'notifications', icon: <Bell size={18} />, label: 'Notification Preferences', desc: 'Configure email and push alerts' },
        { id: 'appearance', icon: <Palette size={18} />, label: 'Appearance', desc: 'Customize themes and app look' },
        { id: 'language', icon: <Globe size={18} />, label: 'Language & Region', desc: 'Set your preferred localization' },
        { id: 'data', icon: <Database size={18} />, label: 'Data Management', desc: 'Export or delete your application data' },
    ];

    return (
        <AppLayout currentPath="/settings">
            <div className="space-y-8 animate-in fade-in duration-500 p-6 md:p-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">App Settings</h1>
                    <p className="text-zinc-500 text-sm mt-1">Configure your personal preferences and account security</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/50">
                    {settingSections.map((section) => (
                        <button 
                            key={section.id}
                            className={`w-full flex items-center gap-4 p-5 text-left hover:bg-zinc-800/30 transition-colors group ${section.active ? 'bg-zinc-800/20' : ''}`}
                        >
                            <div className={`p-2 rounded-lg ${section.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300 transition-colors'}`}>
                                {section.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold tracking-tight ${section.active ? 'text-emerald-400' : 'text-zinc-200 group-hover:text-zinc-100 transition-colors'}`}>
                                    {section.label}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5 truncate">{section.desc}</p>
                            </div>
                            <div className="text-zinc-600 group-hover:text-zinc-400 translate-x-1 group-hover:translate-x-2 transition-all">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold transition-all"
                    >
                        <LogOut size={18} />
                        Sign Out from Foclo
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
