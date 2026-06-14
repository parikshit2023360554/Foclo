'use client';
import React, { useState } from 'react';
import { Plus, Bell } from 'lucide-react';
import QuickAddModal from '@/components/QuickAddModal';

export default function DashboardHeader() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
                <p className="text-sm text-zinc-500 mt-0.5 font-mono">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
            <div className="flex items-center gap-2.5">
                <button 
                    disabled
                    className="btn-secondary text-xs gap-1.5 opacity-50 cursor-not-allowed"
                    title="Reminders overview coming soon"
                >
                    <Bell size={14} />
                    Reminders
                </button>
                <button 
                  className="hidden md:flex btn-primary text-xs gap-1.5"
                  onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={14} />
                    Add Task
                </button>
            </div>
            
            {/* Mobile FAB */}
            <button
                className="md:hidden fixed bottom-20 right-4 w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 z-40 transition-transform active:scale-95"
                onClick={() => setIsAddModalOpen(true)}
            >
                <Plus size={24} />
            </button>

            <QuickAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                defaultType="Task" 
            />
        </div>
    );
}