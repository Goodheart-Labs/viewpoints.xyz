import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";
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

  console.log({
    searchParams,
    url: request.url,
    nextUrl: request.nextUrl.toString(),
    nextUrlSearchParams: request.nextUrl.searchParams,
    nextUrlSearch: request.nextUrl.search,
  });

  const constraints = searchParams.has("all")
    ? {}
    : userId
    ? { user_id: userId }
    : { session_id };

  console.log({ constraints });

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

  requirePollAdminIfPollIsPrivate(poll, userId);

  return NextResponse.json(responses);
}
