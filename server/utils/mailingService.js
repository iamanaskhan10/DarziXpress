// utils/emailService.js
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(to, subject, html) {
    try {
        await resend.emails.send({
            from: 'waseeurrehmanch@gmail.com', // Use your verified domain
            to,
            subject,
            html,
        });
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
}
