'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/applogo';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  CheckSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Calendar', href: '/calendar', icon: <CalendarDays size={18} />, badge: 3 },
];

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <aside
      className={`relative flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ease-in-out shrink-0 ${collapsed ? 'w-16' : 'w-56'
        }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 py-4 border-b border-zinc-800 ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-semibold text-zinc-100 text-base tracking-tight">LifeTrackr</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 mt-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`sidebar-link relative ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs font-semibold px-1.5 py-0.5 rounded-md border border-amber-500/20">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && item.badge ? (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
              ) : null}
            </Link>
          );
        })}

        <div className={`pt-3 pb-1 ${collapsed ? 'px-0' : 'px-1'}`}>
          <p className={`text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-1 ${collapsed ? 'hidden' : ''}`}>
            Tools
          </p>
        </div>

        {[
          { label: 'Tasks', href: '/tasks', icon: <CheckSquare size={18} /> },
          { label: 'Exams', href: '/exams', icon: <BookOpen size={18} /> },
          { label: 'Reminders', href: '/reminders', icon: <Bell size={18} />, badge: 2 },
        ].map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={`tool-${item.label}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`sidebar-link relative ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-semibold px-1.5 py-0.5 rounded-md border border-red-500/20">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && item.badge ? (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-zinc-800 space-y-0.5">
        <Link
          href="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`sidebar-link ${currentPath === '/settings' ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </Link>

        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <User size={14} className="text-emerald-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{displayName}</p>
              <p className="text-xs text-zinc-500 truncate">{displayEmail}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={handleSignOut}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all duration-150 z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}