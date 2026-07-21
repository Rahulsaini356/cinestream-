/**
 * Centralized Environment Variable Validation
 * Ensures all required environment variables are set before the app operates.
 */

export function validateEnv() {
  const requiredEnvVars = [
    { key: "DATABASE_URL", description: "PostgreSQL Database Connection String" },
    { key: "NEXTAUTH_SECRET", description: "Secret for NextAuth JWT session encryption" },
  ];

  const missing: string[] = [];

  for (const { key, description } of requiredEnvVars) {
    if (!process.env[key] || process.env[key]?.trim() === "") {
      missing.push(`${key} (${description})`);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `CRITICAL CONFIGURATION ERROR: Missing required environment variables:\n - ${missing.join("\n - ")}\nApp cannot start safely. Please set these in .env.local or your production provider environment settings.`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    } else {
      console.error(errorMsg);
    }
  }
}

// Validate environment on module load
validateEnv();
