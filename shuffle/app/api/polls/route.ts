// TODO: validation

import { currentUser } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { createAuthorIfNeeded } from "../lib/createAuthorIfNeeded";

// POST /api/polls
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, slug, question, statements } = await request.json();

  const poll = await prisma.$transaction(async (tx) => {
    const newPoll = await tx.polls.create({
      data: {
        user_id: user.id,
        title,
        slug,
        core_question: question,
      },
    });

    if (Array.isArray(statements) && statements.length) {
      await createAuthorIfNeeded();

      await Promise.all(
        statements.map((statement: string) =>
          tx.statement.create({
            data: {
              poll_id: newPoll.id,
              user_id: user.id,
              text: statement,
            },
          }),
        ),
      );
    }

    return newPoll;
  });

  return NextResponse.json(poll);
}
