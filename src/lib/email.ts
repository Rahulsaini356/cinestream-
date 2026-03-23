import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTP(email: string, code: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your CineStream Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #fff; background-color: #0a0a0f;">
        <h2 style="color: #e50914;">CineStream Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px; color: #fff;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
