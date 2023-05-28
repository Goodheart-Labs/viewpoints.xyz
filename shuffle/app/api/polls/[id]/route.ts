import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

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
