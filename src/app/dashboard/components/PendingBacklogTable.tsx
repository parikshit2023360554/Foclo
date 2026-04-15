'use client';
import React, { useState, useEffect } from 'react';
import {
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    Trash2,
    Edit2,
    Eye,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    SlidersHorizontal,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'pending' | 'in-progress' | 'overdue' | 'done';

interface BacklogTask {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: string;
    daysOverdue?: number;
    category: string;
    estimatedHours: number;
}

const statusBadge: Record<TaskStatus, string> = {
    pending: 'badge badge-pending',
    'in-progress': 'badge bg-blue-500/15 text-blue-400 border border-blue-500/20',
    overdue: 'badge badge-overdue',
    done: 'badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
};

const priorityBadge: Record<Priority, string> = {
    low: 'badge badge-low',
    medium: 'badge badge-medium',
    high: 'badge badge-high',
    critical: 'badge badge-critical',
};

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'estimatedHours';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export default function PendingBacklogTable() {
    const { user } = useAuth();
    const supabase = createClient();

    const [tasks, setTasks] = useState<BacklogTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
    const [sortField, setSortField] = useState<SortField>('dueDate');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [selected, setSelected] = useState<Set<string>>(new Set());

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
                // Optionally exclude 'done' items from backlog or fetch everything
                .neq('status', 'done')
                .order('due_date', { ascending: true, nullsFirst: false });

            if (error) {
                toast.error('Failed to load backlog tasks');
                console.error(error);
            } else if (data) {
                const formatted: BacklogTask[] = data.map((d: any) => {
                    let daysOverdue = 0;
                    let dueDateFormatted = 'No date';
                    
                    if (d.due_date) {
                        const dd = new Date(d.due_date);
                        dueDateFormatted = dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        const dDay = new Date(d.due_date);
                        dDay.setHours(0,0,0,0);
                        
                        if (dDay < today && d.status !== 'done') {
                            const diff = today.getTime() - dDay.getTime();
                            daysOverdue = Math.ceil(diff / (1000 * 60 * 60 * 24));
                        }
                    }

                    return {
                        id: d.id,
                        title: d.title,
                        status: d.status as TaskStatus,
                        priority: d.priority as Priority,
                        dueDate: dueDateFormatted,
                        daysOverdue: daysOverdue > 0 ? daysOverdue : undefined,
                        category: d.category || 'Uncategorized',
                        estimatedHours: d.estimated_hours || 0,
                    };
                });
                setTasks(formatted);
            }
            setLoading(false);
        };
        fetchTasks();
    }, [user, supabase]);

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const filtered = tasks
        .filter((t) => {
            const s = t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.category.toLowerCase().includes(search.toLowerCase());
            const st = filterStatus === 'all' || t.status === filterStatus;
            const pr = filterPriority === 'all' || t.priority === filterPriority;
            return s && st && pr;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortField === 'title') cmp = a.title.localeCompare(b.title);
            else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
            else if (sortField === 'estimatedHours') cmp = a.estimatedHours - b.estimatedHours;
            else if (sortField === 'priority') {
                const o: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                cmp = o[a.priority] - o[b.priority];
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

    const totalPages = Math.ceil(filtered.length / perPage) || 1;
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === paginated.length) setSelected(new Set());
        else setSelected(new Set(paginated.map((t) => t.id)));
    };

    const deleteSelected = async () => {
        const idsToDelete = Array.from(selected);
        const { error } = await supabase
            .from('tasks')
            .delete()
            .in('id', idsToDelete)
            .eq('user_id', user?.id);

        if (error) {
            toast.error('Failed to delete selected tasks');
        } else {
            setTasks((prev) => prev.filter((t) => !selected.has(t.id)));
            toast.success(`${selected.size} task${selected.size > 1 ? 's' : ''} deleted from backlog`);
            setSelected(new Set());
        }
    };

    const markDone = async (id: string) => {
        const { error } = await supabase
            .from('tasks')
            .update({ status: 'done' })
            .eq('id', id)
            .eq('user_id', user?.id);

        if (error) {
            toast.error('Failed to update task');
        } else {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            toast.success('Task marked as done and removed from backlog');
        }
    };

    const deleteTask = async (id: string) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id);
            
        if (error) {
            toast.error('Failed to delete task');
        } else {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            toast.success('Task deleted from backlog');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={11} className="text-zinc-700" />;
        return sortDir === 'asc' ? (
            <ChevronUp size={11} className="text-emerald-400" />
        ) : (
            <ChevronDown size={11} className="text-emerald-400" />
        );
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-zinc-400" />
                    <h2 className="text-base font-semibold text-zinc-100">Pending Backlog</h2>
                    <span className="badge badge-pending ml-1">{filtered.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                        <SlidersHorizontal size={13} />
                        Columns
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-5 pb-3 flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search tasks or category…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input-field pl-8 text-xs py-1.5"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-600 mr-1">Status:</span>
                    {(['all', 'pending', 'in-progress', 'overdue'] as const).map((s) => (
                        <button
                            key={`status-filter-${s}`}
                            onClick={() => { setFilterStatus(s); setPage(1); }}
                            className={`text-xs px-2.5 py-1 rounded-md border transition-all duration-100 font-medium ${filterStatus === s
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                                }`}
                        >
                            {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-600 mr-1">Priority:</span>
                    {(['all', 'critical', 'high', 'medium', 'low'] as const).map((p) => (
                        <button
                            key={`priority-filter-${p}`}
                            onClick={() => { setFilterPriority(p); setPage(1); }}
                            className={`text-xs px-2.5 py-1 rounded-md border transition-all duration-100 font-medium ${filterPriority === p
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                                }`}
                        >
                            {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div className="mx-5 mb-3 flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 animate-slideUp">
                    <span className="text-sm text-zinc-300 font-medium">
                        {selected.size} item{selected.size > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={deleteSelected} className="btn-secondary text-xs py-1.5 px-3 text-red-400 hover:text-red-300 gap-1.5">
                            <Trash2 size={13} />
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                    <thead>
                        <tr className="border-t border-b border-zinc-800">
                            <th className="table-header w-8 pr-0">
                                <input
                                    type="checkbox"
                                    checked={selected.size === paginated.length && paginated.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 accent-emerald-500 cursor-pointer"
                                />
                            </th>
                            <th className="table-header cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1.5">Task <SortIcon field="title" /></div>
                            </th>
                            <th className="table-header">Category</th>
                            <th className="table-header cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-1.5">Status <SortIcon field="status" /></div>
                            </th>
                            <th className="table-header cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('priority')}>
                                <div className="flex items-center gap-1.5">Priority <SortIcon field="priority" /></div>
                            </th>
                            <th className="table-header cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('dueDate')}>
                                <div className="flex items-center gap-1.5">Due Date <SortIcon field="dueDate" /></div>
                            </th>
                            <th className="table-header cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort('estimatedHours')}>
                                <div className="flex items-center gap-1.5">Est. Hours <SortIcon field="estimatedHours" /></div>
                            </th>
                            <th className="table-header text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-14 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="animate-spin text-zinc-500" size={24} />
                                    </div>
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-14 text-center">
                                    <div className="flex flex-col items-center gap-2.5">
                                        <Clock size={32} className="text-zinc-700" />
                                        <p className="text-sm font-medium text-zinc-400">No backlog items</p>
                                        <p className="text-xs text-zinc-600">Tasks you add that aren&apos;t due today will appear here</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map((task) => (
                                <tr
                                    key={task.id}
                                    className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors duration-100 group ${selected.has(task.id) ? 'bg-zinc-800/20' : ''
                                        }`}
                                >
                                    <td className="table-cell w-8 pr-0">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(task.id)}
                                            onChange={() => toggleSelect(task.id)}
                                            className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 accent-emerald-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="table-cell max-w-[240px]">
                                        <span className="block truncate text-zinc-200 font-medium">{task.title}</span>
                                        {task.daysOverdue && (
                                            <span className="text-xs text-red-400 font-mono">{task.daysOverdue}d overdue</span>
                                        )}
                                    </td>
                                    <td className="table-cell">
                                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                                            {task.category}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        <span className={statusBadge[task.status]}>
                                            {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        <span className={priorityBadge[task.priority]}>{task.priority}</span>
                                    </td>
                                    <td className="table-cell font-mono text-xs text-zinc-400">{task.dueDate}</td>
                                    <td className="table-cell font-mono text-xs text-zinc-400">{task.estimatedHours}h</td>
                                    <td className="table-cell text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            <button
                                                title="Mark as done"
                                                onClick={() => markDone(task.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-100"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button
                                                title="Edit task"
                                                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all duration-100"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                title="View details"
                                                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all duration-100"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                title="Delete task — this cannot be undone"
                                                onClick={() => deleteTask(task.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {filtered.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Rows per page:</span>
                        <select
                            value={perPage}
                            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500/50"
                        >
                            {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                                <option key={`perpage-${n}`} value={n}>{n}</option>
                            ))}
                        </select>
                        <span className="text-xs text-zinc-500">
                            {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-100"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={`page-${p}`}
                                onClick={() => setPage(p)}
                                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-100 ${p === page
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-100"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}