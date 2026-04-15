import React from 'react';
import Sidebar from './sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    currentPath: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-zinc-950 overflow-hidden">
            <Sidebar currentPath={currentPath} />
            <main className="flex-1 overflow-y-auto scrollbar-thin">
                {children}
            </main>
        </div>
    );
}