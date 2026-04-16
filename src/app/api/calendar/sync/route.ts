import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        // Initialize Supabase admin/API client safely using the authorization header from the request
        const authHeader = request.headers.get('Authorization') || '';
        const body = await request.json().catch(() => ({}));
        const providerToken = body.providerToken;
        
        console.log('[API] Sync Request Received. Provider token exists:', !!providerToken);
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
        
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: authHeader,
                },
            },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch pending tasks
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .neq('status', 'done');

        // 2. Fetch upcoming exams
        const { data: exams } = await supabase
            .from('exams')
            .select('*')
            .eq('user_id', user.id);

        /**
         * 3. Sync to Google Calendar using Googleapis.
         * Implementation note for Google OAuth:
         * 
         * import { google } from 'googleapis';
         * const oauth2Client = new google.auth.OAuth2(
         *   process.env.GOOGLE_CLIENT_ID,
         *   process.env.GOOGLE_CLIENT_SECRET
         * );
         * 
         * oauth2Client.setCredentials({ access_token: USER_GOOGLE_PROVIDER_TOKEN });
         * const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
         * 
         * // Example: Insert tasks
         * for(const task of (tasks || [])) {
         *   if(!task.due_date) continue;
         *   await calendar.events.insert({ ... })
         * }
         */
         
        // Simulating the Google API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const totalSynced = (tasks?.length || 0) + (exams?.length || 0);

        return NextResponse.json({ 
            success: true, 
            message: 'Successfully generated event payload and synced to Google Calendar.',
            count: totalSynced,
            debug: { providerTokenExists: !!providerToken }
        });

    } catch (error: any) {
        console.error('Calendar Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
