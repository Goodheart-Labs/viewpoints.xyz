import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
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
  const { userId } = auth();
  if (!userId) {
    notFound();
  }

  const id = parseInt(idOrSlug);
  let poll: Poll | null = null;

  if (isNaN(id)) {
    poll = await prisma.polls.findFirst({
      where: { slug: idOrSlug },
    });
  } else {
    poll = await prisma.polls.findUnique({
      where: { id },
    });
  }

  requirePollAdminIfPollIsPrivate(poll, userId);

  return NextResponse.json(poll);
}

// PATCH /api/polls/:id
// -----------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const { userId } = auth();

  const poll = await prisma.polls.findUnique({
    where: { id: parseInt(id) },
  });

  requirePollAdminIfPollIsPrivate(poll, userId);

  const data = await request.json();

  if (
    ["analytics_filters", "visibility"].every(
      (value) => value in data === false,
    )
  ) {
    return NextResponse.json(poll);
  }

  let updatedPoll: Poll = poll as Poll;

  if ("visibility" in data) {
    const { visibility } = data;

    updatedPoll = await prisma.polls.update({
      where: { id: parseInt(id) },
      data: {
        visibility,
      },
    });

    return NextResponse.json(updatedPoll);
  }

  if ("analytics_filters" in data) {
    const { analytics_filters } = data;

    updatedPoll = await prisma.polls.update({
      where: { id: parseInt(id) },
      data: {
        analytics_filters,
      },
    });
  }

  return NextResponse.json(updatedPoll);
}
