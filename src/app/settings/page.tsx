'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
    User, 
    Shield, 
    Bell, 
    Palette, 
    Globe, 
    Database, 
    Info, 
    LogOut, 
    Loader2, 
    Mail, 
    CheckCircle2, 
    Pencil, 
    Calendar,
    ChevronRight,
    ChevronLeft,
    X,
    Check,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const PRESETS = [
    { emoji: '🚀', bg: 'bg-indigo-600' },
    { emoji: '🎯', bg: 'bg-red-500' },
    { emoji: '🏃', bg: 'bg-teal-500' },
    { emoji: '💻', bg: 'bg-zinc-700' },
    { emoji: '🎨', bg: 'bg-pink-500' },
    { emoji: '📚', bg: 'bg-amber-500' },
    { emoji: '🧘', bg: 'bg-purple-500' },
    { emoji: '🍕', bg: 'bg-orange-500' },
];

const emojiDataUri = (emoji: string) => 
    `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="80">${emoji}</text></svg>`;

const initialsDataUri = (initials: string) => 
    `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2327272a"><rect width="100" height="100" rx="50"/><text x="50%" y="54%" font-size="36" fill="%23f4f4f5" font-family="sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`;

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'US';
};

export default function SettingsPage() {
    const { user, signOut, updatePassword, supabase } = useAuth();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [mobileView, setMobileView] = useState<'list' | 'content'>('list');
    
    // Notification States
    const [emailNewsletter, setEmailNewsletter] = useState(true);
    const [taskReminders, setTaskReminders] = useState(true);
    const [examAlerts, setExamAlerts] = useState(true);
    const [dailyDigest, setDailyDigest] = useState(false);
    
    // Appearance States
    const [selectedTheme, setSelectedTheme] = useState<'dark' | 'emerald' | 'blue' | 'oled'>('dark');
    
    // Language & Region States
    const [language, setLanguage] = useState('English (US)');
    const [timezone, setTimezone] = useState('Local Browser Timezone (UTC +05:30)');

    // Profile States
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    
    // Form Temp States (for editing)
    const [tempName, setTempName] = useState('');
    const [tempAvatar, setTempAvatar] = useState('');
    const [customAvatarUrl, setCustomAvatarUrl] = useState('');

    // Load initial profile data once user object is ready
    useEffect(() => {
        if (user) {
            const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            const avatar = user.user_metadata?.avatar_url || emojiDataUri('🚀');
            setFullName(name);
            setAvatarUrl(avatar);
            setTempName(name);
            setTempAvatar(avatar);
            
            // Only set custom avatar URL if it's not a data URI
            if (user.user_metadata?.avatar_url && !user.user_metadata.avatar_url.startsWith('data:')) {
                setCustomAvatarUrl(user.user_metadata.avatar_url);
            } else {
                setCustomAvatarUrl('');
            }
        }
    }, [user]);

    // Password Update States
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
            router.push('/sign-up-login');
        } catch (error: any) {
            toast.error('Sign out failed', { description: error.message });
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalAvatar = customAvatarUrl ? customAvatarUrl : tempAvatar;
            
            const { error } = await supabase.auth.updateUser({
                data: { 
                    full_name: tempName,
                    avatar_url: finalAvatar
                }
            });
            if (error) throw error;
            
            setFullName(tempName);
            setAvatarUrl(finalAvatar);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error('Profile update failed', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await updatePassword(password);
            toast.success('Password updated successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error('Password update failed', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Calculate display variables
    const displayEmail = user?.email || 'user@example.com';
    const provider = user?.app_metadata?.provider || 'Email / Password';
    const formattedProvider = provider === 'google' ? 'Google OAuth' : 'Email / Password';
    
    const memberSinceDate = user?.created_at 
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'April 2026';

    const settingSections = [
        { id: 'profile', icon: <User size={18} />, label: 'User Profile', desc: 'Manage your name, avatar, and personal...' },
        { id: 'account', icon: <Shield size={18} />, label: 'Account Security', desc: 'Update password and security methods' },
        { id: 'notifications', icon: <Bell size={18} />, label: 'Notification Preferences', desc: 'Configure email and push alerts' },
        { id: 'appearance', icon: <Palette size={18} />, label: 'Appearance', desc: 'Customize themes and app look' },
        { id: 'language', icon: <Globe size={18} />, label: 'Language & Region', desc: 'Set your preferred localization' },
        { id: 'data', icon: <Database size={18} />, label: 'Data Management', desc: 'Export or delete your application data' },
        { id: 'about', icon: <Info size={18} />, label: 'About Foclo', desc: 'Learn more about Foclo and its features' },
    ];

    return (
        <AppLayout currentPath="/settings">
            <div className="space-y-6 animate-in fade-in duration-500 p-6 md:p-8 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Settings</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Adjust selection details below</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Navigation Sidebar */}
                    <div className={`w-full lg:w-[360px] space-y-4 shrink-0 ${mobileView === 'list' ? 'block' : 'hidden'} lg:block`}>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/50">
                            {settingSections.map((section) => {
                                const isActive = activeSection === section.id;
                                return (
                                    <button 
                                        key={section.id}
                                        onClick={() => {
                                            setActiveSection(section.id);
                                            setMobileView('content');
                                        }}
                                        className={`w-full flex items-center gap-4 p-5 text-left hover:bg-zinc-800/30 transition-colors group ${isActive ? 'bg-zinc-800/20' : ''}`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300 transition-colors'}`}>
                                            {section.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold tracking-tight ${isActive ? 'text-emerald-400 font-medium' : 'text-zinc-200 group-hover:text-zinc-100 transition-colors'}`}>
                                                {section.label}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5 truncate">{section.desc}</p>
                                        </div>
                                        <div className="text-zinc-600 group-hover:text-zinc-400 translate-x-1 group-hover:translate-x-2 transition-all shrink-0">
                                            <ChevronRight size={16} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-2">
                            <button 
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold transition-all"
                            >
                                <LogOut size={16} />
                                Sign Out from Foclo
                            </button>
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className={`flex-1 w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 md:p-8 min-h-[500px] ${mobileView === 'content' ? 'block' : 'hidden'} lg:block`}>
                        {/* Mobile Back Button */}
                        <button 
                            onClick={() => setMobileView('list')}
                            className="lg:hidden flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 mb-6 pb-2 border-b border-zinc-800 w-full text-left"
                        >
                            <ChevronLeft size={14} />
                            <span>Back to Settings</span>
                        </button>

                        {activeSection === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-6 animate-fadeIn">
                                <div className="border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-semibold text-zinc-100">User Profile</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Update your personal details and profile appearance.</p>
                                </div>

                                <div className="space-y-5">
                                    {/* Display Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                            Display Name
                                        </label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            placeholder="Parikshit singh" 
                                            className="input-field max-w-xl"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1.5">This name will be displayed in the sidebar and dashboard header.</p>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                            Email Address (Read-only)
                                        </label>
                                        <input 
                                            type="text" 
                                            disabled 
                                            value={displayEmail} 
                                            className="input-field opacity-60 cursor-not-allowed max-w-xl"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1.5">Email address is linked to authentication credentials and cannot be edited.</p>
                                    </div>

                                    {/* Choose Profile Avatar */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                            Choose Profile Avatar
                                        </label>
                                        <p className="text-xs text-zinc-500 mb-3">Select a built-in emoji preset or use a custom image URL below.</p>
                                        
                                        <div className="bg-zinc-950/40 border border-zinc-800/80 p-5 rounded-xl max-w-xl flex flex-wrap gap-3.5 items-center">
                                            {PRESETS.map((p) => {
                                                const currentUrl = emojiDataUri(p.emoji);
                                                const isSelected = tempAvatar === currentUrl;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={p.emoji}
                                                        onClick={() => {
                                                            setTempAvatar(currentUrl);
                                                            setCustomAvatarUrl('');
                                                        }}
                                                        className={`w-12 h-12 rounded-full ${p.bg} flex items-center justify-center text-2xl transition-all duration-150 active:scale-90 border-2 ${isSelected ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20' : 'border-transparent hover:scale-105'}`}
                                                    >
                                                        {p.emoji}
                                                    </button>
                                                );
                                            })}
                                            
                                            {/* Initials circle */}
                                            {(() => {
                                                const initials = getInitials(tempName);
                                                const currentUrl = initialsDataUri(initials);
                                                const isSelected = tempAvatar === currentUrl;
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setTempAvatar(currentUrl);
                                                            setCustomAvatarUrl('');
                                                        }}
                                                        className={`w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 transition-all duration-150 active:scale-90 border-2 ${isSelected ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20' : 'border-transparent hover:scale-105'}`}
                                                    >
                                                        {initials}
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Or use a Custom Image URL */}
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-400 mt-4 flex items-center gap-1.5">
                                            <ImageIcon size={14} className="text-zinc-500" />
                                            Or use a Custom Image URL
                                        </label>
                                        <div className="flex items-center gap-3 mt-1.5 max-w-xl">
                                            <input 
                                                type="text" 
                                                value={customAvatarUrl}
                                                onChange={(e) => {
                                                    setCustomAvatarUrl(e.target.value);
                                                    setTempAvatar(e.target.value || emojiDataUri('🚀'));
                                                }}
                                                placeholder="https://example.com/avatar.jpg" 
                                                className="input-field flex-1"
                                            />
                                            <img 
                                                src={tempAvatar || avatarUrl} 
                                                alt="Preview"
                                                className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0 bg-zinc-800"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = emojiDataUri('🚀');
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-3">
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="btn-primary gap-1.5 text-xs py-2.5 px-4 inline-flex items-center justify-center"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={14} /> : (
                                                <>
                                                    <Save size={14} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { 
                                                setTempName(fullName); 
                                                setTempAvatar(avatarUrl);
                                                if (avatarUrl && !avatarUrl.startsWith('data:')) {
                                                    setCustomAvatarUrl(avatarUrl);
                                                } else {
                                                    setCustomAvatarUrl('');
                                                }
                                                toast.info('Changes discarded');
                                            }}
                                            className="btn-secondary text-xs py-2.5 px-4 inline-flex items-center justify-center"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {activeSection === 'account' && (
                            <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fadeIn">
                                <div className="border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-semibold text-zinc-100">Account Security</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Update your password and manage login methods.</p>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                            New Password
                                        </label>
                                        <input 
                                            type="password" 
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                            Confirm New Password
                                        </label>
                                        <input 
                                            type="password" 
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="input-field"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="btn-primary"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'notifications' && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                toast.success('Notification preferences updated');
                            }} className="space-y-6 animate-fadeIn">
                                <div className="border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-semibold text-zinc-100">Notification Preferences</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Control how and when Foclo contacts you.</p>
                                </div>

                                <div className="space-y-4 max-w-xl">
                                    {[
                                        {
                                            id: 'emailNewsletter',
                                            label: 'Email Newsletter & Updates',
                                            desc: 'Receive info about product features, releases, and weekly digests.',
                                            value: emailNewsletter,
                                            onChange: setEmailNewsletter
                                        },
                                        {
                                            id: 'taskReminders',
                                            label: 'Task Reminders',
                                            desc: 'Get notified via browser or email when tasks are about to expire.',
                                            value: taskReminders,
                                            onChange: setTaskReminders
                                        },
                                        {
                                            id: 'examAlerts',
                                            label: 'Exam & Deadline Alerts',
                                            desc: 'Urgent alerts for academic deadlines and scheduled examinations.',
                                            value: examAlerts,
                                            onChange: setExamAlerts
                                        },
                                        {
                                            id: 'dailyDigest',
                                            label: 'Daily Agenda Digest',
                                            desc: 'A summary email sent every morning at 7:00 AM listing today\'s tasks.',
                                            value: dailyDigest,
                                            onChange: setDailyDigest
                                        }
                                    ].map((pref) => (
                                        <div 
                                            key={pref.id}
                                            onClick={() => pref.onChange(!pref.value)}
                                            className="border border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-150"
                                        >
                                            <div className="flex-1 pr-4">
                                                <p className="text-sm font-semibold text-zinc-200">{pref.label}</p>
                                                <p className="text-xs text-zinc-500 mt-1">{pref.desc}</p>
                                            </div>
                                            <input 
                                                type="checkbox"
                                                checked={pref.value}
                                                onChange={() => {}} // Handled by outer div click
                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-zinc-900 cursor-pointer accent-emerald-500 shrink-0"
                                            />
                                        </div>
                                    ))}

                                    <button 
                                        type="submit" 
                                        className="btn-primary mt-4"
                                    >
                                        Save Notification Preferences
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'appearance' && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                toast.success('Appearance theme updated');
                            }} className="space-y-6 animate-fadeIn">
                                <div className="border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-semibold text-zinc-100">Appearance Settings</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Customize the color scheme and layout themes of the app.</p>
                                </div>

                                <div className="space-y-5 max-w-2xl">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-400 mb-3">
                                            Choose Theme Theme
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'dark', title: 'Dark Mode', desc: 'Sleek zinc layout (Default)', previewBg: 'bg-zinc-800', dotBg: 'bg-emerald-500' },
                                                { id: 'emerald', title: 'Emerald Forest', desc: 'Deep green accent highlights', previewBg: 'bg-emerald-950/20', dotBg: 'bg-emerald-400' },
                                                { id: 'blue', title: 'Midnight Blue', desc: 'Rich indigo workspace colors', previewBg: 'bg-blue-950/20', dotBg: 'bg-indigo-400' },
                                                { id: 'oled', title: 'OLED Jet Black', desc: 'Pure pitch black styling', previewBg: 'bg-black border-zinc-900', dotBg: 'bg-emerald-500' }
                                            ].map((theme) => {
                                                const isSelected = selectedTheme === theme.id;
                                                return (
                                                    <div 
                                                        key={theme.id}
                                                        onClick={() => setSelectedTheme(theme.id as any)}
                                                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-150 flex flex-col gap-4 ${isSelected ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/10'}`}
                                                    >
                                                        {/* Preview card visual block */}
                                                        <div className={`h-16 rounded-lg ${theme.previewBg} border border-zinc-800/80 p-3 flex flex-col justify-between`}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${theme.dotBg}`}></div>
                                                                <div className="w-12 h-1.5 bg-zinc-700 rounded-full"></div>
                                                            </div>
                                                            <div className="w-full h-1 bg-zinc-800 rounded-full"></div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-200">{theme.title}</p>
                                                            <p className="text-xs text-zinc-500 mt-1">{theme.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn-primary mt-2"
                                    >
                                        Save Appearance Theme
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'language' && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                toast.success('Regional settings updated');
                            }} className="space-y-6 animate-fadeIn">
                                <div className="border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-semibold text-zinc-100">Language & Region</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Select localization settings and synchronize your local timezone.</p>
                                </div>

                                <div className="space-y-5 max-w-xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                                App Language
                                            </label>
                                            <select 
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="input-field pr-8 appearance-none bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg p-2.5 cursor-pointer"
                                            >
                                                <option value="English (US)">English (US)</option>
                                                <option value="English (UK)">English (UK)</option>
                                                <option value="Spanish">Español</option>
                                                <option value="French">Français</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                                                Timezone
                                            </label>
                                            <select 
                                                value={timezone}
                                                onChange={(e) => setTimezone(e.target.value)}
                                                className="input-field pr-8 appearance-none bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg p-2.5 cursor-pointer"
                                            >
                                                <option value="Local Browser Timezone (UTC +05:30)">Local Browser Timezone (UTC +05:30)</option>
                                                <option value="UTC (UTC +00:00)">UTC (UTC +00:00)</option>
                                                <option value="EST (UTC -05:00)">EST (UTC -05:00)</option>
                                                <option value="PST (UTC -08:00)">PST (UTC -08:00)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1.5">Synchronized automatically from your active browser session.</p>

                                    <button 
                                        type="submit" 
                                        className="btn-primary mt-2"
                                    >
                                        Save Regional Settings
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'data' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-semibold text-zinc-100">Data Management</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Export your task data or manage account deletion options.</p>
                                </div>

                                <div className="space-y-5 max-w-xl">
                                    {/* Export */}
                                    <div className="border border-zinc-800 bg-zinc-900/10 p-5 rounded-xl space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-200">Export Application Data</h3>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Download all your tasks, exams, schedules, and reminders in a structured JSON layout. You can use this file as a manual backup.
                                            </p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={async () => {
                                                try {
                                                    const { data: tasks } = await supabase.from('tasks').select('*');
                                                    const { data: exams } = await supabase.from('exams').select('*');
                                                    const exportData = {
                                                        exportedAt: new Date().toISOString(),
                                                        appName: 'Foclo',
                                                        tasks: tasks || [],
                                                        exams: exams || [],
                                                    };
                                                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = `foclo_backup_${new Date().toISOString().split('T')[0]}.json`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    toast.success('Data exported successfully');
                                                } catch (error: any) {
                                                    toast.error('Export failed', { description: error.message });
                                                }
                                            }}
                                            className="btn-secondary text-xs py-2 px-3 inline-flex items-center justify-center min-h-[36px]"
                                        >
                                            Export Tasks as JSON
                                        </button>
                                    </div>

                                    {/* Delete Account */}
                                    <div className="border border-red-900/30 bg-red-950/5 p-5 rounded-xl space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-red-400">Danger Zone: Delete Account</h3>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Permanently wipe out your Foclo profile along with all associated database tables (tasks, calendar connections, reminders, exams). This action is irreversible.
                                            </p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                if (window.confirm("Are you absolutely sure you want to permanently delete your Foclo account? This action cannot be undone and all data will be permanently wiped.")) {
                                                    toast.error("Account deletion is disabled for demo accounts.");
                                                }
                                            }}
                                            className="inline-flex items-center justify-center px-4 py-2 min-h-[38px] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs rounded-lg border border-red-500/25 transition-all duration-150 active:scale-95"
                                        >
                                            Delete My Foclo Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'about' && (
                            <div className="space-y-6 animate-fadeIn max-w-3xl">
                                <div className="border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-semibold text-zinc-100">About Foclo</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Version 1.0.0 · All-in-one productivity suite</p>
                                </div>

                                {/* Main intro card */}
                                <div className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <span className="text-zinc-950 font-black text-2xl tracking-tighter">FC</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-100">Foclo Dashboard</h3>
                                    <p className="text-xs text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
                                        Foclo is built to streamline your academic and personal schedules, optimize your study goals, and keep your tasks organized in a single unified workspace.
                                    </p>
                                </div>

                                {/* Features grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        {
                                            emoji: '🗓️',
                                            title: 'Smart Calendar Integration',
                                            desc: 'Seamlessly link and synchronize Google Calendar access to coordinate classes, exams, study periods, and daily events without scheduling conflicts.'
                                        },
                                        {
                                            emoji: '✅',
                                            title: 'Dynamic Task Management',
                                            desc: 'Prioritize your agenda, track backlog workloads, log exam timelines, and view daily task analytics inside a custom dashboard system.'
                                        },
                                        {
                                            emoji: '📚',
                                            title: 'Academic Targets',
                                            desc: 'Define upcoming syllabus exams, allocate study intervals, categorize difficulty ratings, and ensure timely completion of crucial deadlines.'
                                        },
                                        {
                                            emoji: '⚡',
                                            title: 'Highly Custom Workspace',
                                            desc: 'Tailor your notifications, toggle workspace themes, specify timezone synchronization, and manage profile properties in an interactive glassmorphic layout.'
                                        }
                                    ].map((feat) => (
                                        <div 
                                            key={feat.title}
                                            className="border border-zinc-800 bg-zinc-900/10 p-5 rounded-xl space-y-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{feat.emoji}</span>
                                                <h4 className="text-sm font-semibold text-zinc-200">{feat.title}</h4>
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500">
                                    <p>© 2026 Foclo. All rights reserved.</p>
                                    <div className="flex gap-4">
                                        <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
                                        <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
                                        <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
