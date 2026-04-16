// BUILD FIX: Forced Array Indexing v1.0.3
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ReminderJoin {
    id: string;
    type: string;
    user_id: string;
    task_id: string | null;
    exam_id: string | null;
    tasks: { title: string; due_date: string }[] | null;
    exams: { subject: string; exam_date: string }[] | null;
}

// Helper to send telegram messages centrally
async function sendTelegramMsg(message: string) {
    try {
        const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        if (!tgRes.ok) {
            console.error('[Telegram] Failed to send msg:', await tgRes.text());
        }
        return tgRes.ok;
    } catch(e) {
        console.error('[Telegram] Network error:', e);
        return false;
    }
}

export async function GET(request: Request) {
    // 1. Verify cron secret to prevent unauthorized execution
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
            process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key'
        );

        const nowUTC = new Date();
        
        // Extract localized IST attributes
        const istFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        const parts = istFormatter.formatToParts(nowUTC);
        const p: any = {};
        parts.forEach(part => { p[part.type] = part.value; });
        
        const currentHourIST = parseInt(p.hour, 10);
        const currentMinuteIST = parseInt(p.minute, 10);
        
        // Local IST boundary for Today
        const startOfTodayISTUTC = new Date(`${p.year}-${p.month}-${p.day}T00:00:00+05:30`).toISOString();
        const endOfTodayISTUTC = new Date(`${p.year}-${p.month}-${p.day}T23:59:59+05:30`).toISOString();

        // --- FEATURE 1: Daily Digest (7:00 AM - 7:15 AM) ---
        if (currentHourIST === 7 && currentMinuteIST >= 0 && currentMinuteIST <= 15) {
            const { data: existingDigest } = await supabase
                .from('reminders')
                .select('id')
                .eq('type', 'daily_digest')
                .gte('created_at', startOfTodayISTUTC);
                
            if (!existingDigest || existingDigest.length === 0) {
                const { data: todayTasks } = await supabase
                    .from('tasks')
                    .select('*')
                    .neq('status', 'done')
                    .gte('due_date', startOfTodayISTUTC)
                    .lte('due_date', endOfTodayISTUTC);
                    
                if (todayTasks && todayTasks.length > 0) {
                    let msg = `🌅 *Good Morning! Daily Digest*\nYou have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today:\n\n`;
                    todayTasks.forEach((t: any) => {
                        msg += `• _${t.title}_ [${t.priority.toUpperCase()}]\n`;
                    });
                    
                    const sent = await sendTelegramMsg(msg);
                    if (sent) {
                        await supabase.from('reminders').insert({
                            user_id: todayTasks[0].user_id,
                            type: 'daily_digest',
                            is_sent: true,
                            reminder_time: nowUTC.toISOString()
                        });
                    }
                }
            }
        }

        // --- FEATURE 2: 24-Hour Warnings ---
        const twentyFourHoursFromNow = new Date(nowUTC.getTime() + 24 * 60 * 60 * 1000);
        // Assume maximum ping interval is 15 minutes to guarantee catching events
        const windowStart = twentyFourHoursFromNow.toISOString();
        const windowEnd = new Date(twentyFourHoursFromNow.getTime() + 15 * 60 * 1000).toISOString();
        
        const { data: upcomingTasks } = await supabase
            .from('tasks')
            .select('*')
            .neq('status', 'done')
            .gte('due_date', windowStart)
            .lte('due_date', windowEnd);
            
        if (upcomingTasks && upcomingTasks.length > 0) {
            const taskIds = upcomingTasks.map((t: any) => t.id);
            const { data: sentWarnings } = await supabase
                .from('reminders')
                .select('task_id')
                .eq('type', '24h_warning')
                .in('task_id', taskIds);
                
            const sentTaskIds = new Set(sentWarnings?.map(w => w.task_id) || []);
            const toSendTasks = upcomingTasks.filter((t: any) => !sentTaskIds.has(t.id));
            
            for (const task of toSendTasks) {
                const msg = `⏳ *24-Hour Warning*\nTask: _${task.title}_\nis due in exactly 24 hours!`;
                const sent = await sendTelegramMsg(msg);
                if (sent) {
                    await supabase.from('reminders').insert({
                        user_id: task.user_id,
                        task_id: task.id,
                        type: '24h_warning',
                        is_sent: true,
                        reminder_time: nowUTC.toISOString()
                    });
                }
            }
        }

        // --- PRESERVED EXISTING LOGIC: Standard Reminders Processing ---
        const { data, error: fetchError } = await supabase
            .from('reminders')
            .select(`
                id, type, user_id, task_id, exam_id,
                tasks ( title, due_date ),
                exams ( subject, exam_date )
            `)
            .eq('is_sent', false)
            .lte('reminder_time', nowUTC.toISOString());

        if (fetchError) throw fetchError;
        
        const reminders = data as ReminderJoin[] | null;
        let processedStandardCount = 0;

        if (reminders && reminders.length > 0) {
            const processedIds = [];
            
            for (const reminder of reminders) {
                const taskData = (reminder.tasks && reminder.tasks.length > 0) ? reminder.tasks[0] : null;
                const examData = (reminder.exams && reminder.exams.length > 0) ? reminder.exams[0] : null;

                const title = taskData?.title || examData?.subject || 'Unknown Task';
                const date = taskData?.due_date || examData?.exam_date || 'Unknown Date';
                
                const msg = `🔔 *Reminder*: You have an upcoming deadline for _${title}_\nDate: ${new Date(date).toLocaleDateString()}`;
                const sent = await sendTelegramMsg(msg);
                
                if (sent) {
                    processedIds.push(reminder.id);
                }
            }

            if (processedIds.length > 0) {
                processedStandardCount = processedIds.length;
                const { error: updateError } = await supabase
                    .from('reminders')
                    .update({ is_sent: true })
                    .in('id', processedIds);

                if (updateError) console.error('Failed to update reminder statuses:', updateError);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed logic successfully. Handled ${processedStandardCount} standard reminders.` 
        });

    } catch (error: any) {
        console.error('Reminder Processing Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
