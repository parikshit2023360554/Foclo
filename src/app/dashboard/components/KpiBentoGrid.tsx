'use client';
import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    AlertTriangle,
    BookOpen,
    TrendingUp,
    Clock,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
    const { user, supabase } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        dueToday: { total: 0, completed: 0 },
        overdue: 0,
        examsThisWeek: { count: 0, next: '' },
        completion: 0,
        backlog: { total: 0, highPriority: 0 }
    });

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tonight = new Date(today);
                tonight.setHours(23, 59, 59, 999);

                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);

                // Fetch all tasks for the user
                const { data: tasks, error: tasksError } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('user_id', user.id);

                if (tasksError) throw tasksError;

                // Fetch all exams for the user
                const { data: exams, error: examsError } = await supabase
                    .from('exams')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('exam_date', today.toISOString())
                    .lte('exam_date', nextWeek.toISOString())
                    .order('exam_date', { ascending: true });

                if (examsError) throw examsError;

                // Calculations
                const dueTodayTasks = tasks?.filter((t: any) => {
                    if (!t.due_date) return false;
                    const d = new Date(t.due_date);
                    return d >= today && d <= tonight;
                }) || [];

                const completedToday = dueTodayTasks.filter((t: any) => t.status === 'done').length;

                const overdueTasks = tasks?.filter((t: any) => {
                    if (!t.due_date || t.status === 'done') return false;
                    const d = new Date(t.due_date);
                    return d < today;
                }).length || 0;

                const backlogTasks = tasks?.filter((t: any) => t.status !== 'done') || [];
                const highPriorityBacklog = backlogTasks.filter((t: any) => t.priority === 'high' || t.priority === 'critical').length;

                const nextExam = exams && exams.length > 0 
                    ? `${exams[0].subject} · ${new Date(exams[0].exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'No exams soon';

                const completionPct = dueTodayTasks.length > 0 
                    ? Math.round((completedToday / dueTodayTasks.length) * 100)
                    : 0;

                setStats({
                    dueToday: { total: dueTodayTasks.length, completed: completedToday },
                    overdue: overdueTasks,
                    examsThisWeek: { count: exams?.length || 0, next: nextExam },
                    completion: completionPct,
                    backlog: { total: backlogTasks.length, highPriority: highPriorityBacklog }
                });

            } catch (error) {
                console.error('Stats fetch error:', error);
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, supabase]);

    const kpiData = [
        {
            id: 'kpi-due-today',
            label: 'Tasks Due Today',
            value: loading ? '...' : String(stats.dueToday.total),
            sub: loading ? 'Loading...' : `${stats.dueToday.completed} completed · ${stats.dueToday.total - stats.dueToday.completed} remaining`,
            icon: <CheckCircle2 size={18} />,
            variant: 'primary',
        },
        {
            id: 'kpi-overdue',
            label: 'Overdue Tasks',
            value: loading ? '...' : String(stats.overdue),
            sub: stats.overdue > 0 ? 'Needs immediate attention' : 'All caught up!',
            icon: <AlertTriangle size={18} />,
            variant: 'danger',
        },
        {
            id: 'kpi-exams',
            label: 'Exams This Week',
            value: loading ? '...' : String(stats.examsThisWeek.count),
            sub: loading ? 'Loading...' : `Next: ${stats.examsThisWeek.next}`,
            icon: <BookOpen size={18} />,
            variant: 'warning',
        },
        {
            id: 'kpi-completion',
            label: "Today's Completion",
            value: loading ? '...' : `${stats.completion}%`,
            sub: loading ? 'Loading...' : `${stats.dueToday.completed} of ${stats.dueToday.total} tasks done`,
            icon: <TrendingUp size={18} />,
            variant: 'neutral',
        },
        {
            id: 'kpi-backlog',
            label: 'Pending Backlog',
            value: loading ? '...' : String(stats.backlog.total),
            sub: loading ? 'Loading...' : `${stats.backlog.highPriority} high priority items`,
            icon: <Clock size={18} />,
            variant: 'neutral',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {kpiData.map((kpi) => {
                const styles = variantStyles[kpi.variant];
                return (
                    <div
                        key={kpi.id}
                        className={`kpi-card border ${styles.card} animate-fadeIn relative overflow-hidden`}
                    >
                        {loading && (
                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                <Loader2 size={14} className="animate-spin text-zinc-600" />
                            </div>
                        )}
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