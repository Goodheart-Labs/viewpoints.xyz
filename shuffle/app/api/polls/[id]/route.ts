import { Poll } from "@/lib/api";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/polls/:id
// -----------------------------------------------------------------------------

export async function GET(
  _: NextRequest,
  {
    params: { id: idOrSlug },
  }: {
    params: { id: string };
  }
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

  if (!poll) {
    notFound();
  }

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
  }
) {
  const { userId } = auth();

  const poll = await prisma.polls.findUnique({
    where: { id: parseInt(id) },
  });

  if (!userId || !poll) {
    notFound();
  }

  const { analytics_filters } = await request.json();

  if (!analytics_filters) {
    return NextResponse.json(poll);
  }

  const updatedPoll = await prisma.polls.update({
    where: { id: parseInt(id) },
    data: {
      analytics_filters,
    },
  });

  return NextResponse.json(updatedPoll);
}
