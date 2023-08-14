import { auth } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

// GET /api/polls/:id/responses
// -----------------------------------------------------------------------------

export async function GET(
  _: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const { userId } = auth();

  const responses = await prisma.responses.findMany({
    where: {
      statement: {
        poll_id: parseInt(id),
      },
    },
  });

  const poll = await prisma.polls.findUnique({
    where: { id: parseInt(id) },
  });

  requirePollAdminIfPollIsPrivate(poll, userId);

  return NextResponse.json(responses);
}
