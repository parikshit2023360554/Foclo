import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendEmail, dailyDigestTemplate, reminderTemplate, warningTemplate } from '@/lib/mailer';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
        console.error('[Cron] Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createServerClient();
        const nowUTC = new Date();

        const istFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        const parts = istFormatter.formatToParts(nowUTC);
        const p: any = {};
        parts.forEach(part => { p[part.type] = part.value; });

        const currentHourIST = parseInt(p.hour, 10);
        const startOfTodayISTUTC = new Date(`${p.year}-${p.month}-${p.day}T00:00:00+05:30`).toISOString();
        const endOfTodayISTUTC = new Date(`${p.year}-${p.month}-${p.day}T23:59:59+05:30`).toISOString();

        // --- FEATURE 1: Daily Digest at 7 AM IST ---
        if (currentHourIST === 7) {
            const { data: existingDigest } = await supabase
                .from('reminders')
                .select('id')
                .eq('type', 'daily_digest')
                .gte('created_at', startOfTodayISTUTC);

            if (!existingDigest || existingDigest.length === 0) {
                // Get all users
                const { data: users } = await supabase.auth.admin.listUsers();

                for (const user of users?.users || []) {
                    if (!user.email) continue;

                    const { data: activeTasks } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('user_id', user.id)
                        .neq('status', 'done');

                    if (!activeTasks || activeTasks.length === 0) continue;

                    const todayTasks = activeTasks.filter((t: any) =>
                        t.due_date >= startOfTodayISTUTC && t.due_date <= endOfTodayISTUTC
                    );
                    const otherTasks = activeTasks.filter((t: any) =>
                        t.due_date > endOfTodayISTUTC || t.due_date < startOfTodayISTUTC
                    );

                    const sent = await sendEmail({
                        to: user.email,
                        subject: '🌅 Your Daily Foclo Digest',
                        html: dailyDigestTemplate(otherTasks, todayTasks),
                    });

                    if (sent) {
                        await supabase.from('reminders').insert({
                            user_id: user.id,
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
        const windowStart = twentyFourHoursFromNow.toISOString();
        const windowEnd = new Date(twentyFourHoursFromNow.getTime() + 15 * 60 * 1000).toISOString();

        const { data: upcomingTasks } = await supabase
            .from('tasks')
            .select('*, user:user_id(email)')
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

            for (const task of upcomingTasks) {
                if (sentTaskIds.has(task.id)) continue;

                // Get user email
                const { data: userData } = await supabase.auth.admin.getUserById(task.user_id);
                const email = userData?.user?.email;
                if (!email) continue;

                const sent = await sendEmail({
                    to: email,
                    subject: '⏳ 24-Hour Warning — Task Due Soon',
                    html: warningTemplate(task.title, 24, 'task'),
                });

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

        // --- FEATURE 3: Standard Reminders ---
        const { data: reminders, error: fetchError } = await supabase
            .from('reminders')
            .select(`id, type, user_id, task_id, exam_id, tasks ( title, due_date ), exams ( subject, exam_date )`)
            .eq('is_sent', false)
            .lte('reminder_time', nowUTC.toISOString());

        if (fetchError) throw fetchError;

        let processedCount = 0;

        if (reminders && reminders.length > 0) {
            const processedIds: string[] = [];

            for (const reminder of reminders as any[]) {
                const taskData = reminder.tasks?.[0] || null;
                const examData = reminder.exams?.[0] || null;

                const title = taskData?.title || examData?.subject || 'Upcoming deadline';
                const date = taskData?.due_date || examData?.exam_date || '';
                const type = examData ? 'exam' : 'task';

                const { data: userData } = await supabase.auth.admin.getUserById(reminder.user_id);
                const email = userData?.user?.email;
                if (!email) continue;

                const sent = await sendEmail({
                    to: email,
                    subject: `🔔 Foclo Reminder: ${title}`,
                    html: reminderTemplate(title, date, type),
                });

                if (sent) processedIds.push(reminder.id);
            }

            if (processedIds.length > 0) {
                processedCount = processedIds.length;
                await supabase
                    .from('reminders')
                    .update({ is_sent: true })
                    .in('id', processedIds);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${processedCount} reminders via email.`
        });

    } catch (error: any) {
        console.error('[Reminders] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
