"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrgVerificationEmail(email: string, token: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "Missing RESEND_API_KEY environment variable. Unable to send verification email.",
    );
    return { error: "Email configuration is missing." };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Bemlanja <onboarding@bemlanja.com>",
      to: email,
      subject: "Verify your Bemlanja Organization",
      html: `
        <div style="font-family: sans-serif; max-w-md: mx-auto; padding: 20px;">
          <h2>Welcome to Bemlanja!</h2>
          <p>Thank you for registering an organization account.</p>
          <p>Please use the following 6-digit code to verify your organization's contact email address:</p>
          <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">
              ${token}
            </span>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <br />
          <p>Best regards,<br/>The Bemlanja Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending organization verification email:", error);
    return { error: "Failed to send verification email." };
  }
}
