// TODO: validation

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/polls
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const { userId } = auth();
  const { title, polisId, question, comments } = await request.json();

  console.log(comments);

  const poll = await prisma.$transaction(async (tx) => {
    const poll = await tx.polls.create({
      data: {
        user_id: userId,
        title,
        polis_id: polisId,
        core_question: question,
      },
    });

    if (Array.isArray(comments) && comments.length) {
      await Promise.all(
        comments.map((comment: string) =>
          tx.comments.create({
            data: {
              poll_id: poll.id,
              user_id: userId,
              reporting_type: "default",
              comment,
            },
          })
        )
      );
    }

    return poll;
  });

  return NextResponse.json(poll);
}
