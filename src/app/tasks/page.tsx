'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import DailyTasksSection from '../dashboard/components/DailyTasksSection';
import PendingBacklogTable from '../dashboard/components/PendingBacklogTable';

export default function TasksPage() {
    return (
        <AppLayout currentPath="/tasks">
            <div className="space-y-8 animate-in fade-in duration-500 p-6 md:p-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Task Management</h1>
                    <p className="text-zinc-500 text-sm mt-1">Organize and track your daily productivity</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <DailyTasksSection />
                    <PendingBacklogTable />
                </div>
            </div>
        </AppLayout>
    );
}
