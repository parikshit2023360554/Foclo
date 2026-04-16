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

// This endpoint is designed to be triggered by a CRON job (e.g., Vercel Cron, AWS EventBridge, etc.)
// It checks the 'reminders' table for pending notifications up to the current time,
// dispatches them via Email or SMS, and marks them as 'sent'.
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

        const now = new Date().toISOString();

        // 2. Fetch pending reminders whose time has come
        const { data, error: fetchError } = await supabase
            .from('reminders')
            .select(`
                id, type, user_id, task_id, exam_id,
                tasks ( title, due_date ),
                exams ( subject, exam_date )
            `)
            .eq('is_sent', false)
            .lte('reminder_time', now);

        if (fetchError) throw fetchError;
        
        const reminders = data as ReminderJoin[] | null;
        
        if (!reminders || reminders.length === 0) {
            return NextResponse.json({ success: true, message: 'No pending reminders to process.' });
        }

        const processedIds = [];

        // 3. Process each reminder
        for (const reminder of reminders) {
            // Correctly access the first element [0] of the joined arrays
            const taskData = (reminder.tasks && reminder.tasks.length > 0) ? reminder.tasks[0] : null;
            const examData = (reminder.exams && reminder.exams.length > 0) ? reminder.exams[0] : null;

            const title = taskData?.title || examData?.subject || 'Unknown Task';
            const date = taskData?.due_date || examData?.exam_date || 'Unknown Date';
            
            const message = `🔔 Reminder: You have an upcoming deadline for *${title}* on ${date}!`;
            
            console.log(`[SYS] Dispatching Telegram reminder: ${message}`);
            
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

                if (tgRes.ok) {
                    processedIds.push(reminder.id);
                } else {
                    console.error('[Telegram] Failed to send msg:', await tgRes.text());
                }
            } catch(e) {
                console.error('[Telegram] Network error:', e);
            }
        }

        // 4. Mark them as sent
        if (processedIds.length > 0) {
            const { error: updateError } = await supabase
                .from('reminders')
                .update({ is_sent: true })
                .in('id', processedIds);

            if (updateError) console.error('Failed to update reminder statuses:', updateError);
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully processed ${processedIds.length} reminders.` 
        });

    } catch (error: any) {
        console.error('Reminder Processing Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
