import fetch from 'node-fetch';

async function main() {
    const BOT_TOKEN = "8611004494:AAE4fLC-pj2m5EWnR87Xmd0HZIqsu8TbM58";
    const CHAT_ID = "5207666063";
    
    // Simulate real tasks returned from the Supabase query
    const todayTasks = [
        { title: "Complete Midterm Essay Draft", priority: "high" },
        { title: "Review Chapter 4 & 5 Notes", priority: "medium" }
    ];

    let msg = `🌅 *Good Morning! Daily Digest (Test)*\nYou have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today:\n\n`;
    todayTasks.forEach((t) => {
        msg += `• _${t.title}_ [${t.priority.toUpperCase()}]\n`;
    });
    
    console.log("Sending simulated message to Telegram...");
    
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
            console.log("Successfully sent test message to Telegram!");
        } else {
            console.error("Failed to send message:", await tgRes.text());
        }
    } catch (err) {
        console.error("Error connecting to Telegram:", err);
    }
}

main();
