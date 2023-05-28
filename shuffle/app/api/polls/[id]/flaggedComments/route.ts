import prisma from "@/lib/prisma";
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
  const flaggedComments = await prisma.flagged_comments.findMany({
    where: {
      comment: {
        poll_id: parseInt(id),
      },
    },
  });

  return NextResponse.json(flaggedComments);
}
