import { auth } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requirePollAdmin } from "@/utils/authutils";

// DELETE /api/comments/:id
// -----------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const { userId } = auth();

  const comment = await prisma.comments.findUnique({
    where: { id: parseInt(id) },
  });

  const poll = await prisma.polls.findUnique({
    where: { id: comment?.poll_id },
  });

  requirePollAdmin(poll, userId);

  await prisma.comments.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
