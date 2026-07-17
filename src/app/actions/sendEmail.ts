"use server";

import nodemailer from "nodemailer";

export type ContactFormState = {
  success: boolean;
  message: string;
};

export async function sendEmail(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  // --- Server-side validation ---
  if (!name || !email || !message) {
    return { success: false, message: "All fields are required." };
  }

  if (name.length < 2) {
    return { success: false, message: "Name must be at least 2 characters." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "Please provide a valid email address." };
  }

  if (message.length < 10) {
    return {
      success: false,
      message: "Message must be at least 10 characters.",
    };
  }

  // --- Read SMTP config from environment ---
  const host = process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;

  if (!host || !port || !user || !pass) {
    console.error("SMTP environment variables are missing.");
    return {
      success: false,
      message: "Email service is not configured yet. Please try again later.",
    };
  }

  if (!receiverEmail) {
    console.error("CONTACT_RECEIVER_EMAIL is missing.");
    return {
      success: false,
      message: "Receiver email is not configured. Please try again later.",
    };
  }

  // --- Send via Nodemailer / SMTP ---
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${name} (Portfolio)" <${user}>`,
      to: receiverEmail,
      replyTo: email,
      subject: `Portfolio Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">New Portfolio Contact</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b;">Name</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #334155; margin: 16px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return {
      success: true,
      message: "Message sent! I'll get back to you soon.",
    };
  } catch (error) {
    console.error("Nodemailer send error:", error);
    return {
      success: false,
      message: "Failed to send your message. Please try again later.",
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
