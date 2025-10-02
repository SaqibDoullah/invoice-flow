'use server';

import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: MailOptions) {
  const email = process.env.GMAIL_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!email || !pass) {
    throw new Error(
      'Gmail credentials are not configured. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD in your .env file.'
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: pass,
    },
  });

  const mailOptions = {
    from: `InvoiceFlow <${email}>`,
    ...options,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
}
