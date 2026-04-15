'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import UpcomingExamsTable from '../dashboard/components/UpcomingExamsTable';

export default function ExamsPage() {
    return (
        <AppLayout currentPath="/exams">
            <div className="space-y-8 animate-in fade-in duration-500 p-6 md:p-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Academic Tracking</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your upcoming exams and study schedule</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <UpcomingExamsTable />
                </div>
            </div>
        </AppLayout>
    );
}
