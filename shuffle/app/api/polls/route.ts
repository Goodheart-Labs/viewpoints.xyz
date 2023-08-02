// TODO: validation

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/polls
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const { userId } = auth();
  const user = await currentUser();
  const { title, slug, question, comments } = await request.json();

  const poll = await prisma.$transaction(async (tx) => {
    const poll = await tx.polls.create({
      data: {
        user_id: userId,
        title,
        slug,
        core_question: question,
      },
    });

    if (Array.isArray(comments) && comments.length) {
      const author_name = user?.firstName
        ? `${user?.firstName} ${user?.lastName}`.trim()
        : null;
      const author_avatar_url = user?.profileImageUrl || null;

      await Promise.all(
        comments.map((comment: string) =>
          tx.comments.create({
            data: {
              poll_id: poll.id,
              user_id: userId,
              reporting_type: "default",
              comment,
              author_name,
              author_avatar_url,
            },
          }),
        ),
      );
    }

    return poll;
  });

  return NextResponse.json(poll);
}
