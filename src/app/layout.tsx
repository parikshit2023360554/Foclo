import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'LifeTrackr — Never Miss a Task or Exam Again',
    description: 'LifeTrackr helps students and developers manage daily tasks, track exam deadlines, and sync with Google Calendar — all in one focused dashboard.',
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

                <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Flifetrackr8924back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
                <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
        </html>
    );
}