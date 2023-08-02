import { auth } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

// GET /api/polls/:id/flaggedComments
// -----------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const { userId } = auth();

  const flaggedComments = await prisma.flagged_comments.findMany({
    where: {
      comment: {
        poll_id: parseInt(id),
      },
    },
  });

  const poll = await prisma.polls.findUnique({
    where: { id: parseInt(id) },
  });

  requirePollAdminIfPollIsPrivate(poll, userId);

  return NextResponse.json(flaggedComments);
}
