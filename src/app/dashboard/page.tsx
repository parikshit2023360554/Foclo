import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import KpiBentoGrid from './components/KpiBentoGrid';
import DailyTasksSection from './components/DailyTasksSection';
import PendingBacklogTable from './components/PendingBacklogTable';
import UpcomingExamsTable from './components/UpcomingExamsTable';

export default function DashboardPage() {
    return (
        <AppLayout currentPath="/dashboard">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-6 space-y-6">
                <DashboardHeader />
                <KpiBentoGrid />
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-2">
                        <DailyTasksSection />
                    </div>
                    <div className="xl:col-span-3">
                        <UpcomingExamsTable />
                    </div>
                </div>
                <PendingBacklogTable />
            </div>
        </AppLayout>
    );
}