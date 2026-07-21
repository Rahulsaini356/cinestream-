import { NextResponse } from "next/server";

/**
 * Standardized Production-Safe API Error Handler
 * Hides internal stack traces, DB queries, and file paths from the client.
 * Returns a generic error message along with a unique correlation ID (requestId).
 */
export function handleApiError(
  contextName: string,
  error: any,
  publicMessage = "An internal server error occurred.",
  statusCode = 500
) {
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  // Log full error details strictly on server side for debugging
  console.error(`[API ERROR - ${contextName}] (Correlation ID: ${requestId})`, {
    message: error?.message || error,
    stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
  });

  return NextResponse.json(
    {
      error: publicMessage,
      requestId,
    },
    { status: statusCode }
  );
}
