import { db } from "@/db/client";
import { getSessionId } from "@/utils/sessionutils";
import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// POST /api/sessions
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const sessionId = getSessionId();

  const exists = await db
    .selectFrom("sessions")
    .selectAll()
    .where("id", "=", sessionId)
    .executeTakeFirst();

  if (!exists) {
    const data = await request.json();
    const user = await currentUser();
    const ipAddress = getClientIp(request);

    try {
      await db
        .insertInto("sessions")
        .values({
          id: sessionId,
          user_id: user?.id ?? null,
          ip_address: ipAddress ?? null,
          user_agent: data?.userAgent ?? null,
        })
        .execute();
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        // Do nothing
      } else {
        throw error;
      }
    }
  }

  return NextResponse.json({ success: true });
}

const getClientIp = (request: NextRequest) => {
  const { headers } = request;
  const ip =
    headers.get("X-Client-IP") ||
    headers.get("X-Forwarded-For") ||
    headers.get("CF-Connecting-IP") ||
    headers.get("Fastly-Client-Ip") ||
    headers.get("True-Client-Ip") ||
    headers.get("X-Real-IP") ||
    headers.get("X-Cluster-Client-IP") ||
    headers.get("X-Forwarded") ||
    headers.get("Forwarded-For") ||
    headers.get("Forwarded") ||
    headers.get("appengine-user-ip");

  return ip || null;
};
