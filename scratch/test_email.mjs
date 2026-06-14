import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// Helper to load environment variables from .env
function loadEnv() {
    const envPath = path.resolve('.env');
    if (!fs.existsSync(envPath)) {
        console.error("No .env file found!");
        return;
    }
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

loadEnv();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const todayTasks = [
    { title: "Complete Midterm Essay Draft" },
    { title: "Review Chapter 4 & 5 Notes" }
];

const otherTasks = [
    { title: "Prepare presentation slides" },
    { title: "Math Assignment 3" }
];

// Recreating the dailyDigestTemplate for testing
function dailyDigestTemplate(tasks, todayTasks) {
    const todayRows = todayTasks.map(t => `
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-size: 14px;">
                📌 ${t.title}
            </td>
        </tr>`).join('');

    const otherRows = tasks.map(t => `
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 14px;">
                • ${t.title}
            </td>
        </tr>`).join('');

    return `
    <div style="background:#09090b; padding: 32px; font-family: sans-serif; max-width: 560px; margin: auto; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
            <span style="font-size: 28px;">🌅</span>
            <h1 style="color: #f4f4f5; font-size: 22px; margin: 8px 0 4px;">Good Morning!</h1>
            <p style="color: #71717a; font-size: 14px; margin: 0;">Here's your daily digest from Foclo</p>
        </div>

        ${todayTasks.length > 0 ? `
        <div style="margin-bottom: 20px;">
            <p style="color: #4ade80; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Due Today</p>
            <table style="width: 100%; border-collapse: collapse; background: #18181b; border-radius: 8px; overflow: hidden;">
                ${todayRows}
            </table>
        </div>` : ''}

        ${tasks.length > 0 ? `
        <div style="margin-bottom: 20px;">
            <p style="color: #a1a1aa; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Other Outstanding Tasks</p>
            <table style="width: 100%; border-collapse: collapse; background: #18181b; border-radius: 8px; overflow: hidden;">
                ${otherRows}
            </table>
        </div>` : ''}

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a;">
            <p style="color: #52525b; font-size: 12px; margin: 0;">You're receiving this because you have an account on <strong style="color: #4ade80;">Foclo</strong>.</p>
        </div>
    </div>`;
}

async function main() {
    const to = "singhparikshit2004@gmail.com";
    console.log(`Sending demo daily digest email to ${to}...`);
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Foclo <noreply@foclo.app>',
            to,
            subject: '🌅 Your Daily Foclo Digest (Demo)',
            html: dailyDigestTemplate(otherTasks, todayTasks),
        });
        console.log("Demo email sent successfully!");
    } catch (err) {
        console.error("Failed to send demo email:", err);
    }
}

main();
