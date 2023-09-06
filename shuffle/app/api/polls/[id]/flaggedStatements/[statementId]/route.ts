import { auth } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

export async function DELETE(
  request: NextRequest,
  {
    params: { id, statementId },
  }: {
    params: { id: string; statementId: string };
  },
) {
  const { userId } = auth();

  const flaggedStatements = await prisma.flaggedStatement.deleteMany({
    where: {
      statementId: parseInt(statementId),
    },
  });

  const poll = await prisma.polls.findUnique({
    where: { id: parseInt(id) },
  });

  requirePollAdminIfPollIsPrivate(poll, userId);

  return NextResponse.json(flaggedStatements);
}
