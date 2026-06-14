import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Foclo <noreply@foclo.app>',
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('[Mailer] Failed to send email:', error);
        return false;
    }
}

// Email templates
export function dailyDigestTemplate(tasks: { title: string; due_date?: string }[], todayTasks: { title: string }[]): string {
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

export function reminderTemplate(title: string, date: string, type: 'task' | 'exam'): string {
    const emoji = type === 'exam' ? '📚' : '✅';
    const label = type === 'exam' ? 'Exam' : 'Task';

    return `
    <div style="background:#09090b; padding: 32px; font-family: sans-serif; max-width: 560px; margin: auto; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
            <span style="font-size: 28px;">${emoji}</span>
            <h1 style="color: #f4f4f5; font-size: 22px; margin: 8px 0 4px;">Upcoming Deadline Reminder</h1>
            <p style="color: #71717a; font-size: 14px; margin: 0;">Don't forget — you have something coming up</p>
        </div>

        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">${label}</p>
            <p style="color: #f4f4f5; font-size: 18px; font-weight: 600; margin: 0 0 8px;">${title}</p>
            <p style="color: #4ade80; font-size: 14px; margin: 0;">📅 ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a;">
            <p style="color: #52525b; font-size: 12px; margin: 0;">You're receiving this because you have an account on <strong style="color: #4ade80;">Foclo</strong>.</p>
        </div>
    </div>`;
}

export function warningTemplate(title: string, hoursLeft: number, type: 'task' | 'exam'): string {
    const emoji = type === 'exam' ? '📚' : '⏳';
    const label = type === 'exam' ? 'Exam' : 'Task';

    return `
    <div style="background:#09090b; padding: 32px; font-family: sans-serif; max-width: 560px; margin: auto; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
            <span style="font-size: 28px;">${emoji}</span>
            <h1 style="color: #f4f4f5; font-size: 22px; margin: 8px 0 4px;">${hoursLeft}-Hour Warning</h1>
            <p style="color: #71717a; font-size: 14px; margin: 0;">Your deadline is approaching fast</p>
        </div>

        <div style="background: #18181b; border: 1px solid #f59e0b33; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">${label} due in ${hoursLeft} hours</p>
            <p style="color: #f4f4f5; font-size: 18px; font-weight: 600; margin: 0;">${title}</p>
        </div>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a;">
            <p style="color: #52525b; font-size: 12px; margin: 0;">You're receiving this because you have an account on <strong style="color: #4ade80;">Foclo</strong>.</p>
        </div>
    </div>`;
}
