import React from 'react';
import Sidebar from './sidebar';
import MobileNavigation from './MobileNavigation';

interface AppLayoutProps {
    children: React.ReactNode;
    currentPath: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-zinc-950 overflow-hidden">
            <Sidebar currentPath={currentPath} />
            <MobileNavigation currentPath={currentPath} />
            <main className="flex-1 overflow-y-auto scrollbar-thin pt-14 pb-16 md:pt-0 md:pb-0">
                {children}
            </main>
        </div>
    );
}