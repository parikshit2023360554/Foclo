'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import AppLogo from '@/components/ui/applogo';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface MobileNavProps {
  currentPath: string;
}

export default function MobileNavigation({ currentPath }: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  const bottomNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Calendar', href: '/calendar', icon: <CalendarDays size={20} /> },
    { label: 'Tasks', href: '/tasks', icon: <CheckSquare size={20} /> },
    { label: 'Exams', href: '/exams', icon: <BookOpen size={20} /> },
  ];

  const drawerItems = [
    { label: 'Reminders', href: '/reminders', icon: <Bell size={18} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="md:hidden">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-1.5 -ml-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center justify-center pointer-events-none absolute inset-0">
          <AppLogo size={24} />
          <span className="ml-2 font-semibold text-zinc-100 text-sm tracking-tight">Foclo</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 relative z-10">
          <User size={14} className="text-emerald-400" />
        </div>
      </header>

      {/* Drawer Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[260px] bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <AppLogo size={24} />
            <span className="font-semibold text-zinc-100 text-sm tracking-tight">Menu</span>
          </div>
          <button 
            onClick={() => setMenuOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-2">More Tools</p>
          {drawerItems.map((item) => {
             const isActive = currentPath === item.href;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => setMenuOpen(false)}
                 className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 active:bg-zinc-800'}`}
               >
                 {item.icon}
                 {item.label}
               </Link>
             );
          })}
        </div>

        <div className="p-4 border-t border-zinc-800 mt-auto">
          <div className="flex items-center gap-3 px-2 py-3">
             <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <User size={14} className="text-emerald-400" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-semibold text-zinc-100 truncate">{displayName}</p>
               <p className="text-[10px] text-zinc-500 truncate">{displayEmail}</p>
             </div>
             <button
               onClick={handleSignOut}
               className="p-1.5 text-zinc-500 hover:text-zinc-300"
             >
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 z-40 flex items-center px-2 pb-[env(safe-area-inset-bottom)]">
        {bottomNavItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-0.5 bg-emerald-500 rounded-b-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              )}
              {item.icon}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
