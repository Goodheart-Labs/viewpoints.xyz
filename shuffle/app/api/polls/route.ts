// TODO: validation

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/polls
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const { userId } = auth();
  const { title, polisId, question, comments } = await request.json();

  const poll = await prisma.polls.create({
    data: {
      user_id: userId,
      title,
      polis_id: polisId,
      core_question: question,
    },
  });

  if (comments.length) {
    await prisma.comments.createMany({
      data: comments.map((comment: string) => ({
        poll_id: poll.id,
        user_id: userId,
        reporting_type: "default",
        comment,
      })),
    });
  }

  return NextResponse.json(poll);
}
