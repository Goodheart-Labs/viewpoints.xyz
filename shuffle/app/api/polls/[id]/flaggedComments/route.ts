import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { polls_visibility_enum } from "@prisma/client";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/polls/:id/flaggedComments
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

  if (
    !userId ||
    !poll ||
    (poll.visibility === polls_visibility_enum.private &&
      poll.user_id !== userId)
  ) {
    return notFound();
  }

  return NextResponse.json(flaggedComments);
}
