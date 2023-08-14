import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

// GET /api/polls/:id/responses
// -----------------------------------------------------------------------------

export async function GET(
  request: Request,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const responses = await prisma.responses.findMany({
    where: {
      statement: {
        poll_id: parseInt(id),
      },
      ...getConstraints(new URLSearchParams(request.url)),
    },
  });

  const poll = await prisma.polls.findUnique({
    where: { id: parseInt(id) },
  });

  const { userId } = auth();

  requirePollAdminIfPollIsPrivate(poll, userId);

  return NextResponse.json(responses);
}

const getConstraints = (searchParams: URLSearchParams) => {
  const { userId } = auth();
  const session_id = cookies().get(SESSION_ID_COOKIE_NAME)?.value;

  if (searchParams.has("all")) {
    return {};
  }

  return userId ? { user_id: userId } : { session_id };
};
