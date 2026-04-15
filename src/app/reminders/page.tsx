'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, Clock, Calendar, AlertCircle } from 'lucide-react';

export default function RemindersPage() {
    return (
        <AppLayout currentPath="/reminders">
            <div className="space-y-8 animate-in fade-in duration-500 p-6 md:p-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Reminders & Notifications</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your automated alerts and system notifications</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Reminders Card */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-zinc-100">Notification Settings</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">Push Notifications</p>
                                    <p className="text-xs text-zinc-500">Receive alerts directly on your device</p>
                                </div>
                                <div className="w-10 h-6 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center px-1">
                                    <div className="w-4 h-4 bg-emerald-500 rounded-full translate-x-4"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">Email Alerts</p>
                                    <p className="text-xs text-zinc-500">Get daily summaries and deadline reminders</p>
                                </div>
                                <div className="w-10 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center px-1">
                                    <div className="w-4 h-4 bg-zinc-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-zinc-100">Quick Summary</h2>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <AlertCircle size={16} className="text-red-500" />
                                <span className="text-sm">3 Overdue tasks needing attention</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Calendar size={16} className="text-emerald-500" />
                                <span className="text-sm">Next exam in 4 days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
