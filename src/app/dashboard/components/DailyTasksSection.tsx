'use client';
import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import QuickAddModal from '@/components/QuickAddModal';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'pending' | 'in-progress' | 'overdue' | 'done';

interface DailyTask {
    id: string;
    title: string;
    priority: Priority;
    status: TaskStatus;
    due_date?: string;
}

const priorityBadge: Record<Priority, string> = {
    low: 'badge badge-low',
    medium: 'badge badge-medium',
    high: 'badge badge-high',
    critical: 'badge badge-critical',
};

export default function DailyTasksSection() {
    const { user } = useAuth();
    const supabase = createClient();
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const fetchTasks = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                toast.error('Failed to load tasks');
                console.error(error);
            } else if (data) {
                setTasks(data);
            }
            setLoading(false);
        };
        fetchTasks();
    }, [user, supabase]);

    const doneCount = tasks.filter((t) => t.status === 'done').length;
    const total = tasks.length;
    const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    const toggleTask = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'done' ? 'pending' : 'done';
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, status: newStatus as TaskStatus } : t
            )
        );

        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', id)
            .eq('user_id', user?.id);

        if (error) {
            toast.error('Failed to update task');
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, status: currentStatus as TaskStatus } : t
                )
            );
        }
    };

    const deleteTask = async (id: string) => {
        const previousTasks = [...tasks];
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast.success('Task removed');

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id);

        if (error) {
            toast.error('Failed to delete task');
            setTasks(previousTasks);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-full min-h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div>
                    <h2 className="text-base font-semibold text-zinc-100">Today&apos;s Tasks</h2>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                        {doneCount}/{total} completed
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary text-xs py-1.5 px-3"
                >
                    <Plus size={13} />
                    Add
                </button>
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-4">
                <div className="progress-bar-track h-2">
                    <div className="progress-bar-fill h-2" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-zinc-600">{pct}% done</span>
                    <span className="text-xs text-zinc-600">{total - doneCount} left</span>
                </div>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 space-y-1">
                {loading ? (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 className="animate-spin text-zinc-500" size={20} />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-sm">No tasks for today. Add one above!</div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-all duration-150 ${task.status === 'done' ? 'opacity-60' : ''
                                }`}
                        >
                            <GripVertical size={14} className="text-zinc-700 mt-0.5 cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                onClick={() => toggleTask(task.id, task.status)}
                                className="mt-0.5 shrink-0 text-zinc-600 hover:text-emerald-400 transition-colors"
                            >
                                {task.status === 'done' ? (
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : (
                                    <Circle size={16} />
                                )}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm text-zinc-200 leading-snug ${task.status === 'done' ? 'line-through text-zinc-500' : ''
                                        }`}
                                >
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={priorityBadge[task.priority]}>{task.priority}</span>
                                    {task.due_date && (
                                        <span className="text-xs text-zinc-600 font-mono">
                                            {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="shrink-0 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <QuickAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                defaultType="Task" 
            />
        </div>
    );
}