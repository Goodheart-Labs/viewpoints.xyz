// TODO: validation

import { currentUser } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { getSessionId } from "@/utils/session";
import { createAuthorIfNeeded } from "../lib/createAuthorIfNeeded";
import { createDemographicQuestions } from "../lib/createDemographicQuestions";

// POST /api/polls
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const sessionId = getSessionId();
  const user = await currentUser();
  if (!user) {
    return notFound();
  }

  const {
    title,
    slug,
    question,
    statements,
    with_demographic_questions,
    new_statements_visible_by_default,
  } = await request.json();

  const poll = await db.transaction().execute(async (tx) => {
    const newPoll = await tx
      .insertInto("polls")
      .values({
        user_id: user.id,
        title,
        slug,
        core_question: question,
        visibility: "public",
        new_statements_visible_by_default,
        analytics_filters: {},
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    if (Array.isArray(statements) && statements.length) {
      await createAuthorIfNeeded();

      await Promise.all(
        statements.map((statement: string) =>
          tx
            .insertInto("statements")
            .values({
              answer_type: "default",
              poll_id: newPoll.id,
              user_id: user.id,
              session_id: sessionId,
              text: statement,
            })
            .execute(),
        ),
      );
    }

    if (with_demographic_questions) {
      await createDemographicQuestions(tx, {
        poll_id: newPoll.id,
        user_id: user.id,
        session_id: sessionId,
      });
    }

    return newPoll;
  });

  return NextResponse.json(poll);
}
