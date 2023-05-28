import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

// GET /api/polls/:id/responses
// -----------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) {
  const { userId } = auth();
  const session_id = request.cookies.get(SESSION_ID_COOKIE_NAME)?.value;

  const { searchParams } = new URL(request.url);

  const constraints = searchParams.has("all")
    ? {}
    : userId
    ? { user_id: userId }
    : { session_id };

  const responses = await prisma.responses.findMany({
    where: {
      comment: {
        poll_id: parseInt(id),
      },
      ...constraints,
    },
  });

  return NextResponse.json(responses);
}
