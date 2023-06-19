import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

// GET /api/polls/:id/responses
// -----------------------------------------------------------------------------

export async function GET(
  _: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) {
  const { userId } = auth();

  const responses = await prisma.responses.findMany({
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

  return NextResponse.json(responses);
}
