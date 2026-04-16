'use client';
import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    BookOpen,
    CheckSquare,
    Clock,
    X,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type EventType = 'task' | 'exam';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface CalendarEvent {
    id: string;
    title: string;
    type: EventType;
    date: string; // YYYY-MM-DD
    priority: Priority;
    time?: string;
    meta?: string;
}



const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function toDateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const priorityDot: Record<Priority, string> = {
    low: 'bg-zinc-500',
    medium: 'bg-blue-400',
    high: 'bg-orange-400',
    critical: 'bg-red-500',
};

export default function CalendarView() {
    const defaultToday = new Date();
    const [viewYear, setViewYear] = useState(defaultToday.getFullYear());
    const [viewMonth, setViewMonth] = useState(defaultToday.getMonth());
    const [selectedDate, setSelectedDate] = useState<string>(toDateKey(defaultToday.getFullYear(), defaultToday.getMonth(), defaultToday.getDate()));
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, supabase } = useAuth();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchEvents = async () => {
            setLoading(true);
            try {
                const { data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('user_id', user.id)
                    .neq('status', 'done');

                const { data: examsData, error: examsError } = await supabase
                    .from('exams')
                    .select('*')
                    .eq('user_id', user.id);

                if (tasksError) throw tasksError;
                if (examsError) throw examsError;

                const formattedEvents: CalendarEvent[] = [];

                (tasksData || []).forEach((t: any) => {
                    if (t.due_date) {
                        const d = new Date(t.due_date);
                        formattedEvents.push({
                            id: t.id,
                            title: t.title,
                            type: 'task',
                            date: toDateKey(d.getFullYear(), d.getMonth(), d.getDate()),
                            priority: t.priority,
                            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        });
                    }
                });

                (examsData || []).forEach((e: any) => {
                    if (e.exam_date) {
                        const d = new Date(e.exam_date);
                        formattedEvents.push({
                            id: e.id,
                            title: e.title,
                            type: 'exam',
                            date: toDateKey(d.getFullYear(), d.getMonth(), d.getDate()),
                            priority: e.priority,
                            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            meta: e.subject
                        });
                    }
                });

                setEvents(formattedEvents);
            } catch (error) {
                console.error('Failed to fetch calendar events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user, supabase]);

    const today = new Date();

    
    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
        else setViewMonth(viewMonth - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
        else setViewMonth(viewMonth + 1);
    };
    const goToToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setSelectedDate(toDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
    };

    const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
        acc[ev.date] = acc[ev.date] ? [...acc[ev.date], ev] : [ev];
        return acc;
    }, {});

    const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

    const generateCells = (y: number, m: number) => {
        const cells: { day: number; month: 'prev' | 'current' | 'next'; dateKey: string }[] = [];
        const daysInMonth = getDaysInMonth(y, m);
        const firstDay = getFirstDayOfMonth(y, m);
        const prevMonthDays = getDaysInMonth(y, m - 1 < 0 ? 11 : m - 1);
        
        for (let i = 0; i < firstDay; i++) {
            let d = prevMonthDays - firstDay + i + 1;
            const prevM = m - 1 < 0 ? 11 : m - 1;
            const prevY = m - 1 < 0 ? y - 1 : y;
            cells.push({ day: d, month: 'prev', dateKey: toDateKey(prevY, prevM, d) });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, month: 'current', dateKey: toDateKey(y, m, d) });
        }
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) {
            const nextM = m + 1 > 11 ? 0 : m + 1;
            const nextY = m + 1 > 11 ? y + 1 : y;
            cells.push({ day: d, month: 'next', dateKey: toDateKey(nextY, nextM, d) });
        }
        return cells;
    };

    const renderMonthGrid = (y: number, m: number) => {
        const cells = generateCells(y, m);
        return (
            <div key={`${y}-${m}`} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl md:overflow-hidden shrink-0">
                <div className="bg-zinc-800/20 px-4 py-2 border-b border-zinc-800 flex justify-between items-center md:hidden rounded-t-xl">
                    <span className="font-semibold text-zinc-300 text-sm">{MONTHS[m]} {y}</span>
                </div>
                <div className="grid grid-cols-7 border-b border-zinc-800 rounded-t-xl md:rounded-none bg-zinc-900">
                    {DAYS.map((d) => (
                        <div key={`day-header-${y}-${m}-${d}`} className="px-2 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 bg-zinc-900 rounded-b-xl">
                    {cells.map((cell, idx) => {
                        const isToday = cell.dateKey === todayKey;
                        const isSelected = cell.dateKey === selectedDate;
                        const isOtherMonth = cell.month !== 'current';
                        const dayEvents = eventsByDate[cell.dateKey] || [];
                        const taskEvents = dayEvents.filter((e) => e.type === 'task');
                        const examEvents = dayEvents.filter((e) => e.type === 'exam');

                        return (
                            <div
                                key={`cell-${cell.dateKey}-${idx}`}
                                onClick={() => setSelectedDate(cell.dateKey)}
                                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isOtherMonth ? 'other-month' : ''}`}
                            >
                                <div className={`text-xs font-semibold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday
                                    ? 'bg-emerald-500 text-zinc-950'
                                    : isSelected
                                        ? 'text-emerald-400' : 'text-zinc-400'
                                    }`}>
                                    {cell.day}
                                </div>
                                <div className="space-y-0.5">
                                    {taskEvents.slice(0, 2).map((ev) => (
                                        <div
                                            key={`chip-${ev.id}`}
                                            className="flex items-center gap-1 px-1 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20 truncate"
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[ev.priority]}`} />
                                            <span className="text-[10px] text-emerald-300 truncate leading-none">{ev.title}</span>
                                        </div>
                                    ))}
                                    {examEvents.slice(0, 1).map((ev) => (
                                        <div
                                            key={`chip-${ev.id}`}
                                            className="flex items-center gap-1 px-1 py-0.5 rounded bg-amber-500/15 border border-amber-500/20 truncate"
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[ev.priority]}`} />
                                            <span className="text-[10px] text-amber-300 truncate leading-none">{ev.title}</span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] text-zinc-500 px-1">
                                            +{dayEvents.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    const upcomingEvents = events
        .filter((e) => e.date >= todayKey)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8);

return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-100">Calendar</h1>
                    <p className="text-sm text-zinc-500 mt-0.5 font-mono">
                        {MONTHS[viewMonth]} {viewYear}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={goToToday} className="btn-secondary text-xs py-1.5 px-3">
                        Today
                    </button>
                    <button onClick={prevMonth} className="btn-secondary text-xs p-1.5">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="btn-secondary text-xs p-1.5">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" />
                    <span className="text-xs text-zinc-500">Task</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/70" />
                    <span className="text-xs text-zinc-500">Exam</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs text-zinc-500">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-xs text-zinc-500">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-xs text-zinc-500">Medium</span>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Calendar grid wrapper */}
                <div className="flex-1 overflow-hidden">
                    {renderMonthGrid(viewYear, viewMonth)}
                </div>

                {/* Right panel: selected day + upcoming */}
                <div className="xl:w-72 2xl:w-80 flex flex-col gap-4">
                    {/* Selected day detail */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col">
                        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-100">
                                    {selectedDate
                                        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric',
                                        })
                                        : 'Select a day'}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2 min-h-[180px]">
                            {selectedEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <CalendarDays size={24} className="text-zinc-700" />
                                    <p className="text-xs text-zinc-600 text-center">
                                        No events on this day
                                    </p>
                                </div>
                            ) : (
                                selectedEvents.map((ev) => (
                                    <div
                                        key={`detail-${ev.id}`}
                                        className={`p-3 rounded-lg border ${ev.type === 'exam' ? 'bg-amber-500/8 border-amber-500/20' : 'bg-emerald-500/8 border-emerald-500/20'
                                            } animate-fadeIn`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`mt-0.5 shrink-0 ${ev.type === 'exam' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {ev.type === 'exam' ? <BookOpen size={13} /> : <CheckSquare size={13} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-zinc-200 leading-snug">{ev.title}</p>
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    <span className={`badge text-[10px] ${ev.type === 'exam' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                                        }`}>
                                                        {ev.type}
                                                    </span>
                                                    <span className={`badge text-[10px] ${ev.priority === 'critical' ? 'badge-critical' :
                                                        ev.priority === 'high' ? 'badge-high' :
                                                            ev.priority === 'medium' ? 'badge-medium' : 'badge-low'
                                                        }`}>
                                                        {ev.priority}
                                                    </span>
                                                </div>
                                                {ev.time && (
                                                    <p className="text-[10px] text-zinc-500 font-mono mt-1">{ev.time}</p>
                                                )}
                                                {ev.meta && (
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{ev.meta}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upcoming deadlines mini list */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
                        <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-zinc-800">
                            <Clock size={14} className="text-zinc-500" />
                            <h3 className="text-sm font-semibold text-zinc-100">Upcoming Deadlines</h3>
                        </div>
                        <div className="p-3 space-y-1.5">
                            {loading ? (
                                <div className="py-8 flex justify-center">
                                    <Loader2 className="animate-spin text-zinc-500" size={20} />
                                </div>
                            ) : upcomingEvents.length === 0 ? (
                                <div className="text-center py-6 text-zinc-500 text-xs">No events scheduled</div>
                            ) : upcomingEvents.map((ev) => {
                                const daysAway = Math.ceil(
                                    (new Date(ev.date + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                                );
                                return (
                                    <div
                                        key={`upcoming-${ev.id}`}
                                        onClick={() => setSelectedDate(ev.date)}
                                        className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors duration-100 group"
                                    >
                                        <div className={`w-1.5 h-6 rounded-full shrink-0 ${ev.type === 'exam' ? 'bg-amber-500/70' : 'bg-emerald-500/70'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-zinc-300 truncate group-hover:text-zinc-100 transition-colors">
                                                {ev.title}
                                            </p>
                                            <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                                                {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-mono font-semibold shrink-0 ${daysAway === 0 ? 'text-red-400' :
                                            daysAway <= 3 ? 'text-amber-400' : 'text-zinc-500'
                                            }`}>
                                            {daysAway === 0 ? 'today' : `${daysAway}d`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}