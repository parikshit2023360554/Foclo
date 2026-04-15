import React from 'react';
import AppLayout from '@/components/AppLayout';
import CalendarView from './components/calendarView';

export default function CalendarPage() {
    return (
        <AppLayout currentPath="/calendar">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-6">
                <CalendarView />
            </div>
        </AppLayout>
    );
}