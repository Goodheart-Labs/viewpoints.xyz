import { auth } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Poll } from "@/lib/api";
import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

// GET /api/polls/:id
// -----------------------------------------------------------------------------

export async function GET(
  _: NextRequest,
  {
    params: { id: idOrSlug },
  }: {
    params: { id: string };
  },
) {
  const id = parseInt(idOrSlug);
  let poll: Poll | null = null;

  if (Number.isNaN(id)) {
    poll = await prisma.polls.findFirst({
      where: { slug: idOrSlug },
    });
  } else {
    poll = await prisma.polls.findUnique({
      where: { id },
    });
  }

  const { userId } = auth();

  requirePollAdminIfPollIsPrivate(poll, userId);

  return NextResponse.json(poll);
}
