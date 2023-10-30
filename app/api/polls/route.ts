// TODO: validation

import { currentUser } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { createAuthorIfNeeded } from "../lib/createAuthorIfNeeded";

// POST /api/polls
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;
  const user = await currentUser();
  if (!user) {
    return notFound();
  }

  const { title, slug, question, statements } = await request.json();

  const poll = await db.transaction().execute(async (tx) => {
    const newPoll = await tx
      .insertInto("polls")
      .values({
        user_id: user.id,
        title,
        slug,
        core_question: question,
        visibility: "public",
        analytics_filters: {},
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    if (Array.isArray(statements) && statements.length) {
      await createAuthorIfNeeded();

      await Promise.all(
        statements.map((statement: string) =>
          tx
            .insertInto("Statement")
            .values({
              poll_id: newPoll.id,
              user_id: user.id,
              session_id: sessionId,
              text: statement,
            })
            .execute(),
        ),
      );
    }

    return newPoll;
  });

  return NextResponse.json(poll);
}
