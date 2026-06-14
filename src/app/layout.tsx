import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'Foclo — Your All-in-One Life Organizer',
    description: 'Foclo helps you manage daily tasks, track deadlines, and stay on top of everything — all in one focused dashboard.',
    icons: {
        icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="bottom-right"
                        theme="dark"
                        toastOptions={{
                            style: {
                                background: '#18181b',
                                border: '1px solid #3f3f46',
                                color: '#f4f4f5',
                                fontFamily: 'Geist, sans-serif',
                                fontSize: '14px',
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}