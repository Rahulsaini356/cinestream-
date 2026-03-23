export async function sendOTP(email: string, code: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing from Environment Variables");
    throw new Error("Email configuration error");
  }

  const payload = {
    sender: { name: "CineStream", email: "rahulsainirs028@gmail.com" },
    to: [{ email: email }],
    subject: "Your CineStream Verification Code",
    htmlContent: `
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
