'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Loader2, Calendar, MapPin, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import QuickAddModal from '@/components/QuickAddModal';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Exam {
    id: string;
    subject: string;
    type: string;
    examDate: string;
    daysLeft: number;
    priority: Priority;
    location?: string;
}

const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
        case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
};

export default function UpcomingExamsTable() {
    const { user } = useAuth();
    const supabase = createClient();
    
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchExams = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('exams')
                .select('*')
                .eq('user_id', user.id)
                .order('exam_date', { ascending: true });

            if (error) {
                toast.error('Failed to load exams');
                console.error(error);
            } else if (data) {
                const formattedExams: Exam[] = data.map((d: any) => {
                    let daysLeft = 0;
                    if (d.exam_date) {
                        const examDateObj = new Date(d.exam_date);
                        examDateObj.setHours(0,0,0,0);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        
                        const diffTime = examDateObj.getTime() - today.getTime();
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }
                    
                    let dateFormatted = 'No date';
                    if (d.exam_date) {
                        dateFormatted = new Date(d.exam_date).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });
                    }

                    return {
                        id: d.id,
                        subject: d.subject,
                        type: d.type || 'Exam',
                        examDate: dateFormatted,
                        daysLeft: daysLeft,
                        priority: d.priority as Priority || 'medium',
                        location: d.location
                    };
                });
                
                // Filter out past exams
                setExams(formattedExams.filter(e => e.daysLeft >= 0));
            }
            setLoading(false);
        };
        fetchExams();
    }, [user, supabase]);

    const filteredExams = exams.filter(exam =>
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const markAsDone = async (id: string) => {
        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id);

        if (error) {
            toast.error('Failed to complete exam');
        } else {
            setExams(prev => prev.filter(e => e.id !== id));
            toast.success('Awesome! Exam marked as completed.');
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full min-h-[400px]">
            {/* Header section */}
            <div className="p-5 border-b border-zinc-800/80">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <BookOpen size={16} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                                Upcoming Exams
                                <span className="badge badge-pending scale-90 origin-left">{exams.length}</span>
                            </h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Your next milestones</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all duration-200"
                        title="Add Exam"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by subject or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-8 py-2 text-sm w-full bg-zinc-950 border-zinc-800"
                    />
                </div>
            </div>

            {/* List section */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 size={32} className="text-emerald-500 animate-spin opacity-50" />
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-1">
                            <Calendar size={20} className="text-zinc-600" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300">No exams coming up</p>
                        <p className="text-xs text-zinc-500 max-w-[200px]">You're all clear! Add an exam to start tracking your milestones.</p>
                    </div>
                ) : (
                    filteredExams.map((exam) => (
                        <div
                            key={exam.id}
                            className="group relative bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3.5 transition-all duration-200 flex flex-col gap-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-medium text-zinc-100 truncate pr-2">
                                        {exam.subject}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-zinc-400 font-medium">
                                            {exam.type}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getPriorityColor(exam.priority)}`}>
                                            {exam.priority}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end shrink-0">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-xl font-bold font-mono tracking-tight ${exam.daysLeft <= 3 ? 'text-red-400' :
                                                exam.daysLeft <= 7 ? 'text-amber-400' : 'text-emerald-400'
                                            }`}>
                                            {exam.daysLeft}
                                        </span>
                                        <span className="text-xs font-medium text-zinc-500">days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-800/60">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                        <Calendar size={13} className="text-zinc-500" />
                                        <span className="font-mono">{exam.examDate}</span>
                                    </div>
                                    {exam.location && (
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 hidden sm:flex">
                                            <MapPin size={13} className="text-zinc-500" />
                                            <span className="truncate max-w-[100px]">{exam.location}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-800/40 rounded-md p-0.5">
                                    <button
                                        onClick={() => markAsDone(exam.id)}
                                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-emerald-500/15 hover:text-emerald-400 text-zinc-400 transition-colors"
                                        title="Mark as completed"
                                    >
                                        <CheckCircle2 size={15} />
                                    </button>
                                    <button
                                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 hover:text-zinc-200 text-zinc-400 transition-colors"
                                        title="More options"
                                    >
                                        <MoreHorizontal size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <QuickAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                defaultType="Exam" 
            />
        </div>
    );
}
