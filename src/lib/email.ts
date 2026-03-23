import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTP(email: string, code: string) {
  const mailOptions = {
    from: `"CineStream" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your CineStream Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 30px; color: white; background-color: #0c0c12; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
        <h2 style="color: #ea580c; font-size: 24px; margin-bottom: 20px;">Verification Code</h2>
        <p style="color: #a1a1aa; font-size: 14px;">Use the following code to complete your verification.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: white; margin: 30px 0; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
          ${code}
        </div>
        <p style="color: #71717a; font-size: 12px;">This code will expire in 10 minutes.</p>
        <p style="color: #71717a; font-size: 11px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Nodemailer Send Error Details:", error);
    throw error;
  }
}
