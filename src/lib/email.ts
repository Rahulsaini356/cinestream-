export async function sendOTP(email: string, code: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing from Environment Variables");
    throw new Error("Email configuration error");
  }

  const payload = {
    sender: { name: "CineStream", email: "noreply@cinestream.digital" },
    to: [{ email: email }],
    subject: "🎬 Your CineStream Verification Code",
    htmlContent: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #060608; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 480px; margin: auto; background: #0d0d14; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e50914, #ff6b35); padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">🎬 CineStream</h1>
            <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Your verification code</p>
          </div>
          <!-- Body -->
          <div style="padding: 36px 32px; text-align: center;">
            <p style="color: #a1a1aa; font-size: 15px; margin: 0 0 24px;">Use this code to complete your sign-up. It expires in <strong style="color: white;">10 minutes</strong>.</p>
            <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: white; background: rgba(229,9,20,0.08); padding: 20px; border-radius: 12px; border: 1px solid rgba(229,9,20,0.2);">
              ${code}
            </div>
            <p style="color: #52525b; font-size: 12px; margin-top: 28px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
          <!-- Footer -->
          <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <p style="color: #3f3f46; font-size: 11px; margin: 0;">© 2026 CineStream · cinestream.digital</p>
          </div>
        </div>
      </div>
    `,
  };


  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Brevo API Error Details:", errorData);
      throw new Error(`Brevo Error: ${res.statusText}`);
    }

    console.log("Email sent successfully via Brevo API");
  } catch (error) {
    console.error("Brevo Fetch Error:", error);
    throw error;
  }
}
