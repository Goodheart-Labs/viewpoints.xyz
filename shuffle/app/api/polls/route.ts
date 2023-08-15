// TODO: validation

import { auth, currentUser } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// POST /api/polls
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const { userId } = auth();
  const user = await currentUser();
  const { title, slug, question, statements } = await request.json();

  const poll = await prisma.$transaction(async (tx) => {
    const newPoll = await tx.polls.create({
      data: {
        user_id: userId,
        title,
        slug,
        core_question: question,
      },
    });

    if (Array.isArray(statements) && statements.length) {
      const author_name = user?.firstName
        ? `${user?.firstName} ${user?.lastName}`.trim()
        : null;
      const author_avatar_url = user?.profileImageUrl || null;

      await Promise.all(
        statements.map((statement: string) =>
          tx.statement.create({
            data: {
              poll_id: newPoll.id,
              user_id: userId,
              reporting_type: "default",
              text: statement,
              author_name,
              author_avatar_url,
            },
          }),
        ),
      );
    }

    return newPoll;
  });

  return NextResponse.json(poll);
}
