import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { auth } from "@clerk/nextjs";
import { polls_visibility_enum } from "@prisma/client";
import { notFound } from "next/navigation";
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

  const poll = await prisma.polls.findUnique({
    where: { id: parseInt(id) },
  });

  // TODO: extract this logic to a middleware
  if (
    !userId ||
    !poll ||
    (poll.visibility === polls_visibility_enum.private &&
      poll.user_id !== userId)
  ) {
    return notFound();
  }

  return NextResponse.json(responses);
}
