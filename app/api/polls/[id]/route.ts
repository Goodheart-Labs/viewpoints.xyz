import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Poll } from "@/lib/api";
import prisma from "@/lib/prisma";

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

  return NextResponse.json(poll);
}
