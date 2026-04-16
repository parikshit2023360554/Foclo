'use client';
import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultType?: 'Task' | 'Exam';
}

export default function QuickAddModal({ isOpen, onClose, defaultType = 'Task' }: QuickAddModalProps) {
    const { user, supabase } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    
    const [type, setType] = useState<'Task' | 'Exam'>(defaultType);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast.error('You must be signed in to add items.');
            return;
        }

        if (!title || !date) {
            toast.error('Please fill out all the fields.');
            return;
        }

        setSubmitting(true);
        
        try {
            if (type === 'Task') {
                const { error } = await supabase.from('tasks').insert({
                    user_id: user.id,
                    title: title,
                    due_date: new Date(date).toISOString(),
                    status: 'pending',
                    priority: 'medium',
                    category: 'General'
                });
                
                if (error) throw error;
                toast.success('Task created successfully');
            } else {
                const { error } = await supabase.from('exams').insert({
                    user_id: user.id,
                    subject: title,
                    type: 'Midterm',
                    exam_date: new Date(date).toISOString(),
                    priority: 'high'
                });
                
                if (error) throw error;
                toast.success('Exam created successfully');
            }
            
            // Wait briefly to allow states to sync before closing
            setTimeout(() => {
                onClose();
                window.location.reload(); 
            }, 300);
            
        } catch (error: any) {
            toast.error('Failed to create item', { description: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-zinc-100 font-semibold tracking-tight">Quick Add</h2>
                    <button 
                        onClick={onClose} 
                        className="text-zinc-400 hover:text-zinc-100 transition-colors"
                        disabled={submitting}
                    >
                        <X size={18} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Category Type Picker */}
                    <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setType('Task')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                type === 'Task' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Task
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('Exam')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                type === 'Exam' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Exam
                        </button>
                    </div>

                    {/* Simple Title Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            {type === 'Task' ? 'Task Name' : 'Exam Subject'}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={type === 'Task' ? 'E.g., Complete physics report' : 'E.g., Computer Science Midterm'}
                            className="input-field w-full text-sm"
                            disabled={submitting}
                            autoFocus
                        />
                    </div>

                    {/* Simple Date Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            {type === 'Task' ? 'End Date' : 'Exam Date'}
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-field w-full text-sm pl-9"
                                disabled={submitting}
                            />
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="btn-primary w-full justify-center"
                        >
                            {submitting ? 'Saving...' : `Add ${type}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
