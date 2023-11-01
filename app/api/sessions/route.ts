import { db } from "@/db/client";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { currentUser } from "@clerk/nextjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// POST /api/sessions
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  const exists = await db
    .selectFrom("sessions")
    .selectAll()
    .where("id", "=", sessionId)
    .executeTakeFirst();

  if (!exists) {
    const data = await request.json();
    const user = await currentUser();
    const ipAddress = getClientIp(request);

    await db
      .insertInto("sessions")
      .values({
        id: sessionId,
        user_id: user?.id ?? null,
        ip_address: ipAddress ?? null,
        user_agent: data?.userAgent ?? null,
      })
      .execute();
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
