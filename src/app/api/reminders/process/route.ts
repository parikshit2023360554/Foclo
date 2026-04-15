import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        const { data: reminders, error: fetchError } = await supabase
            .from('reminders')
            .select(`
                id, type, user_id, task_id, exam_id,
                tasks ( title, due_date ),
                exams ( subject, exam_date )
            `)
            .eq('status', 'pending')
            .lte('notify_at', now);

        if (fetchError) throw fetchError;
        
        if (!reminders || reminders.length === 0) {
            return NextResponse.json({ success: true, message: 'No pending reminders to process.' });
        }

        const processedIds = [];

        // 3. Process each reminder
        for (const reminder of reminders) {
            const isEmail = reminder.type === 'Email';
            // Placeholder: Replace with Resend, Sendgrid, or Twilio
            const message = `Reminder: You have an upcoming deadline for ${reminder.tasks?.title || reminder.exams?.subject}!`;
            
            console.log(`[SYS] Dispatching ${reminder.type} to User ID ${reminder.user_id}: ${message}`);
            
            // Simulating API call for Sending Email/SMS
            await new Promise(r => setTimeout(r, 100));

            processedIds.push(reminder.id);
        }

        // 4. Mark them as sent
        if (processedIds.length > 0) {
            const { error: updateError } = await supabase
                .from('reminders')
                .update({ status: 'sent' })
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
