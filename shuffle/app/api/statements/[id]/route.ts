import { auth } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requirePollAdmin } from "@/utils/authutils";

// DELETE /api/statements/:id
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

  const statement = await prisma.statement.findUnique({
    where: { id: parseInt(id) },
  });

  const poll = await prisma.polls.findUnique({
    where: { id: statement?.poll_id },
  });

  requirePollAdmin(poll, userId);

  await prisma.statement.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
