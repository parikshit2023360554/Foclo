import fetch from 'node-fetch';

async function main() {
    const BOT_TOKEN = "8611004494:AAE4fLC-pj2m5EWnR87Xmd0HZIqsu8TbM58";
    const CHAT_ID = "5207666063";
    const SUPABASE_URL = "https://yokqadknebqqtawcvcoi.supabase.co";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva3FhZGtuZWJxcXRhd2N2Y29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjkxODMsImV4cCI6MjA5MTg0NTE4M30.zhwMy_EcDqc5WkQ5KMz_2uxWOiuUlpRj1XnS7wQE88k";
    const USER_JWT = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjhkZDA2YjgzLTA1YWItNDBkMS1iYzg2LTg1MTY4ZjkxMGZiMCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3lva3FhZGtuZWJxcXRhd2N2Y29pLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwZGNiOWFjOC01MjlmLTRkNWQtYWRjMS1kMmNmMGExZjcxYjMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc2NDI3MDEzLCJpYXQiOjE3NzY0MjM0MTMsImVtYWlsIjoic2luZ2hwYXJpa3NoaXQyMDA0QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiLCJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pSZ3NPVllpcGI2WjlwdHMyeHZFQ1JmUWtTZTU3OVR4NEphWklCYnh5clJXZXluVzZPMVE9czk2LWMiLCJlbWFpbCI6InNpbmdocGFyaWtzaGl0MjAwNEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiUGFyaWtzaGl0IHNpbmdoIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IlBhcmlrc2hpdCBzaW5naCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pSZ3NPVllpcGI2WjlwdHMyeHZFQ1JmUWtTZTU3OVR4NEphWklCYnh5clJXZXluVzZPMVE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjEwNjEwMDAzOTg4MjIxNTE0MTI4OCIsInN1YiI6IjEwNjEwMDAzOTg4MjIxNTE0MTI4OCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzc2NDIzNDEzfV0sInNlc3Npb25faWQiOiJhZWVhYmI5OS01NzY3LTRiOWItYTFmMS0xMGJiYzAxNTllYmMiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.VcZtNDRIiSuPPdLf4tfYxg0fUvOFexkOT9wSz-mb-fZCFZcCQF7tfMDHV5uHG04uUuqwzpSWJB7h5oBp9Z5Rwg";
    
    // Fetch real tasks from supabase using the REST API directly
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*`, {
        headers: {
            "apikey": ANON_KEY,
            "Authorization": `Bearer ${USER_JWT}`
        }
    });
    
    if (!res.ok) {
        console.error("Failed to fetch tasks from supabase", await res.text());
        return;
    }
    
    let allTasks = await res.json();
    
    // Pick the most relevant task to use for the 24 hour warning demo
    if (allTasks.length === 0) {
        console.log("No tasks found at all.");
        return;
    }

    const task = allTasks[0]; // just grab the first real one
    
    const msg = `⏳ *24-Hour Warning*\nTask: _${task.title}_\nis due in exactly 24 hours!`;
    
    try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: msg,
                parse_mode: 'Markdown'
            })
        });
        
        if (tgRes.ok) {
            console.log("Successfully sent 24h REAL test message to Telegram!");
        } else {
            console.error("Failed to send message:", await tgRes.text());
        }
    } catch (err) {
        console.error("Error connecting to Telegram:", err);
    }
}

main();
