'use client';
import React from 'react';
import {
    CheckCircle2,
    AlertTriangle,
    BookOpen,
    TrendingUp,
    Clock,
} from 'lucide-react';

// Grid plan: 5 cards → grid-cols-5 single row on xl
// row 1: hero (Tasks Due Today spans 1, but styled larger) + 4 regular
// On smaller screens: 2-col then 1-col

const kpiData = [
    {
        id: 'kpi-due-today',
        label: 'Tasks Due Today',
        value: '7',
        sub: '3 completed · 4 remaining',
        icon: <CheckCircle2 size={18} />,
        trend: null,
        variant: 'primary',
    },
    {
        id: 'kpi-overdue',
        label: 'Overdue Tasks',
        value: '3',
        sub: 'Needs immediate attention',
        icon: <AlertTriangle size={18} />,
        trend: null,
        variant: 'danger',
    },
    {
        id: 'kpi-exams',
        label: 'Exams This Week',
        value: '2',
        sub: 'Next: Algorithms · Apr 16',
        icon: <BookOpen size={18} />,
        trend: null,
        variant: 'warning',
    },
    {
        id: 'kpi-completion',
        label: 'Today\'s Completion',
        value: '43%',
        sub: '3 of 7 tasks done',
        icon: <TrendingUp size={18} />,
        trend: 'up',
        variant: 'neutral',
    },
    {
        id: 'kpi-backlog',
        label: 'Pending Backlog',
        value: '18',
        sub: '5 high priority items',
        icon: <Clock size={18} />,
        trend: null,
        variant: 'neutral',
    },
];

const variantStyles: Record<string, { card: string; icon: string; value: string }> = {
    primary: {
        card: 'bg-emerald-500/8 border-emerald-500/20',
        icon: 'bg-emerald-500/15 text-emerald-400',
        value: 'text-emerald-300',
    },
    danger: {
        card: 'bg-red-500/8 border-red-500/20',
        icon: 'bg-red-500/15 text-red-400',
        value: 'text-red-300',
    },
    warning: {
        card: 'bg-amber-500/8 border-amber-500/20',
        icon: 'bg-amber-500/15 text-amber-400',
        value: 'text-amber-300',
    },
    neutral: {
        card: 'bg-zinc-900 border-zinc-800',
        icon: 'bg-zinc-800 text-zinc-400',
        value: 'text-zinc-100',
    },
};

export default function KpiBentoGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {kpiData.map((kpi) => {
                const styles = variantStyles[kpi.variant];
                return (
                    <div
                        key={kpi.id}
                        className={`kpi-card border ${styles.card} animate-fadeIn`}
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                {kpi.label}
                            </p>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`}>
                                {kpi.icon}
                            </div>
                        </div>
                        <div>
                            <p className={`text-3xl font-bold font-mono tabular-nums ${styles.value}`}>
                                {kpi.value}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">{kpi.sub}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}