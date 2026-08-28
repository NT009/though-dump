import { NextRequest, NextResponse } from "next/server";

/**
 * Higher-order function to wrap API routes that require authentication.
 * It automatically extracts the userId from the headers (injected by middleware)
 * and passes it directly to your handler.
 */
export function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest) => {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, userId);
  };
}
